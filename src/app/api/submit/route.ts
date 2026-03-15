import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "";

function adminHeaders() {
  const key = SERVICE_KEY || SUPABASE_KEY!;
  return {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": `Bearer ${key}`,
  };
}

function anonHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY!,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer": "count=exact",
  };
}

// ── Turnstile verification ──
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // no key configured = skip verification
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${TURNSTILE_SECRET}&response=${token}&remoteip=${ip}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ── DB-based rate limiting ──
async function checkDbRateLimit(ipHash: string): Promise<{ allowed: boolean; count: number }> {
  if (!SUPABASE_URL || !SERVICE_KEY) return { allowed: true, count: 0 };

  // Count submissions from this IP in last 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/submissions?ip_hash=eq.${ipHash}&created_at=gte.${tenMinAgo}&select=id`,
    { headers: adminHeaders() }
  );
  const data = await res.json();
  const count = Array.isArray(data) ? data.length : 0;

  // Max 5 submissions per 10 minutes per IP
  return { allowed: count < 5, count };
}

// ── Duplicate text check ──
async function checkDuplicate(text: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/submissions?text=eq.${encodeURIComponent(text)}&select=id&limit=1`,
    { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

// ── IP hashing ──
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(ip + (process.env.HASH_SALT || "solveit-salt-x7k9")));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── POST: submit ──
export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }

    const body = await req.json();
    const text = (body.text || "").trim();
    const email = body.email || null;
    const turnstileToken = body.turnstileToken || "";

    // 1. Input validation
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Too short (min 5 chars)" }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: "Too long (max 2000 chars)" }, { status: 400 });
    }

    // 2. Turnstile captcha verification
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!await verifyTurnstile(turnstileToken, ip)) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 403 });
    }

    // 3. IP hash
    const ipHash = await hashIP(ip);

    // 4. DB-based rate limit (IP당 10분에 5회)
    const rateCheck = await checkDbRateLimit(ipHash);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // 5. Duplicate text check
    if (await checkDuplicate(text)) {
      return NextResponse.json(
        { error: "This problem has already been submitted!" },
        { status: 409 }
      );
    }

    // 6. Insert
    const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: "POST",
      headers: { ...adminHeaders(), "Prefer": "return=representation" },
      body: JSON.stringify({ text, email, ip_hash: ipHash }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    const data = await res.json();
    const submissionId = data[0]?.id;

    // AI 분류는 자동 실행하지 않음.
    // max가 텔레그램으로 요청하거나, 크론으로 데일리 보고 시 수동 분류.

    return NextResponse.json({ success: true, id: submissionId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── GET: list with server-side search + pagination ──
export async function GET(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ items: [], total: 0, page: 1, pages: 0 });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("q");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = (page - 1) * limit;

    const sortParam = url.searchParams.get("sort");
    const order = sortParam === "votes" ? "votes.desc,created_at.desc" : "created_at.desc";

    let endpoint = `${SUPABASE_URL}/rest/v1/submissions?select=id,text,status,votes,created_at&order=${order}&limit=${limit}&offset=${offset}`;

    if (search) {
      endpoint += `&text=ilike.*${encodeURIComponent(search)}*`;
    }

    const res = await fetch(endpoint, { headers: anonHeaders() });

    if (!res.ok) {
      return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    const contentRange = res.headers.get("content-range");
    const total = contentRange ? parseInt(contentRange.split("/")[1]) : data.length;

    return NextResponse.json(
      { items: data, total, page, pages: Math.ceil(total / limit) },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
