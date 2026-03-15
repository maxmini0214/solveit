import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(ip + (process.env.HASH_SALT || "solveit-salt-x7k9")));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function anonHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY!,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  };
}

function adminHeaders() {
  // Use service role key for writes that need to bypass RLS
  const key = SERVICE_KEY || SUPABASE_KEY!;
  return {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": `Bearer ${key}`,
  };
}

// GET: check which submissions the current user voted for
export async function GET(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ voted: [] });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIP(ip);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/votes?ip_hash=eq.${ipHash}&select=submission_id`,
      { headers: anonHeaders() }
    );
    const data = await res.json();
    const votedIds = (data || []).map((v: { submission_id: string }) => v.submission_id);

    return NextResponse.json({ voted: votedIds }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ voted: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }

    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIP(ip);
    const admin = adminHeaders();

    // Check if already voted
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/votes?submission_id=eq.${submissionId}&ip_hash=eq.${ipHash}&select=id`,
      { headers: admin }
    );
    const existing = await checkRes.json();

    if (existing.length > 0) {
      // Already voted → remove vote (toggle off)
      await fetch(`${SUPABASE_URL}/rest/v1/votes?id=eq.${existing[0].id}`, {
        method: "DELETE",
        headers: admin,
      });

      // Count actual votes from votes table
      const countRes = await fetch(
        `${SUPABASE_URL}/rest/v1/votes?submission_id=eq.${submissionId}&select=id`,
        { headers: admin }
      );
      const remaining = await countRes.json();
      const newVotes = remaining.length;

      await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`, {
        method: "PATCH",
        headers: { ...admin, "Prefer": "return=representation" },
        body: JSON.stringify({ votes: newVotes }),
      });

      return NextResponse.json({ voted: false, votes: newVotes });
    }

    // New vote → insert
    const voteRes = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
      method: "POST",
      headers: { ...admin, "Prefer": "return=representation" },
      body: JSON.stringify({ submission_id: submissionId, ip_hash: ipHash }),
    });

    if (!voteRes.ok) {
      const err = await voteRes.text();
      return NextResponse.json({ error: "Vote failed", detail: err }, { status: 500 });
    }

    // Count actual votes from votes table
    const countRes = await fetch(
      `${SUPABASE_URL}/rest/v1/votes?submission_id=eq.${submissionId}&select=id`,
      { headers: admin }
    );
    const allVotes = await countRes.json();
    const newVotes = allVotes.length;

    await fetch(`${SUPABASE_URL}/rest/v1/submissions?id=eq.${submissionId}`, {
      method: "PATCH",
      headers: { ...admin, "Prefer": "return=representation" },
      body: JSON.stringify({ votes: newVotes }),
    });

    return NextResponse.json({ voted: true, votes: newVotes });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
