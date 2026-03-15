import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    // Use service key to search by email (email is private, not exposed via anon)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?email=eq.${encodeURIComponent(email)}&select=id,text,status,votes,created_at&order=created_at.desc`,
      {
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
