import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  const { id } = await params;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?id=eq.${id}&select=id,text,status,votes,created_at&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { submission: data[0] },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
