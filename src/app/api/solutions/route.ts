import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function anonHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: "count=exact",
  };
}

export async function GET(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ items: [], total: 0 });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status") || "live";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = (page - 1) * limit;

    let endpoint = `${SUPABASE_URL}/rest/v1/solutions?select=id,slug,title,description,type,status,category,tags,metrics,created_at`;

    if (type && type !== "all") {
      endpoint += `&type=eq.${encodeURIComponent(type)}`;
    }
    if (category && category !== "all") {
      endpoint += `&category=eq.${encodeURIComponent(category)}`;
    }
    if (status && status !== "all") {
      endpoint += `&status=eq.${encodeURIComponent(status)}`;
    }

    endpoint += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

    const res = await fetch(endpoint, { headers: anonHeaders() });

    if (!res.ok) {
      return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    const contentRange = res.headers.get("content-range");
    const total = contentRange
      ? parseInt(contentRange.split("/")[1])
      : data.length;

    return NextResponse.json(
      { items: data, total, page, pages: Math.ceil(total / limit) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
