import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateSubmission } from "@/lib/validate";
import { checkOrigin } from "@/lib/csrf";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json");

interface Submission {
  id: string;
  text: string;
  email: string | null;
  category: string | null;
  tags: string[];
  size: string | null;
  status: "open" | "in-progress" | "solved";
  votes: number;
  createdAt: string;
}

// ─── JSON File Fallback ─────────────────────────────────────

async function getSubmissionsFromFile(): Promise<Submission[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubmissionToFile(submission: Submission) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  const submissions = await getSubmissionsFromFile();
  submissions.push(submission);
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2));
}

// ─── Supabase Operations ────────────────────────────────────

async function insertSubmissionToSupabase(data: {
  text: string;
  email: string | null;
  ip_hash: string;
}): Promise<{ id: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("submissions")
    .insert({
      text: data.text,
      email: data.email,
      ip_hash: data.ip_hash,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return null;
  }

  return result;
}

async function getSubmissionsFromSupabase(): Promise<Submission[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, text, category, tags, size, status, votes, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase select error:", error);
    return null;
  }

  return (data || []).map((row) => ({
    id: row.id,
    text: row.text,
    email: null, // Never expose email publicly
    category: row.category,
    tags: row.tags || [],
    size: row.size,
    status: row.status,
    votes: row.votes,
    createdAt: row.created_at,
  }));
}

// ─── Route Handlers ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF check
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    if (!checkOrigin(origin, referer)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // 3. Input validation & sanitization
    const body = await req.json();
    const validation = validateSubmission(body.text, body.email);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { text, email } = validation.sanitized;

    // 4. Hash IP for storage (never store raw IP)
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(ip + "solveit-salt")
    );
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 5. Insert — try Supabase first, fallback to JSON
    let submissionId: string;

    if (isSupabaseConfigured()) {
      const result = await insertSubmissionToSupabase({
        text,
        email,
        ip_hash: ipHash,
      });
      if (result) {
        submissionId = result.id;
      } else {
        // Supabase error → fallback to JSON
        submissionId = crypto.randomUUID();
        const submission: Submission = {
          id: submissionId,
          text,
          email,
          category: null,
          tags: [],
          size: null,
          status: "open",
          votes: 0,
          createdAt: new Date().toISOString(),
        };
        await saveSubmissionToFile(submission);
      }
    } else {
      // No Supabase configured → JSON file
      submissionId = crypto.randomUUID();
      const submission: Submission = {
        id: submissionId,
        text,
        email,
        category: null,
        tags: [],
        size: null,
        status: "open",
        votes: 0,
        createdAt: new Date().toISOString(),
      };
      await saveSubmissionToFile(submission);
    }

    return NextResponse.json(
      { success: true, id: submissionId },
      { headers: { "X-RateLimit-Remaining": remaining.toString() } }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    const supabaseData = await getSubmissionsFromSupabase();
    if (supabaseData) {
      return NextResponse.json(supabaseData);
    }
  }

  // Fallback to JSON file
  const submissions = await getSubmissionsFromFile();
  const publicSubmissions = submissions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map(({ email: _email, ...rest }) => rest);

  return NextResponse.json(publicSubmissions);
}
