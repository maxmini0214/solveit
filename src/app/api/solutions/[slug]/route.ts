import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function anonHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  try {
    const { slug } = await params;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/solutions?slug=eq.${encodeURIComponent(slug)}&select=*`,
      { headers: anonHeaders() }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "DB fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    if (!data.length) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    // Fetch linked issues
    const solution = data[0];
    const mappingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/issue_solutions?solution_id=eq.${solution.id}&select=issue_id`,
      { headers: anonHeaders() }
    );
    const mappings = await mappingRes.json();
    const issueIds = (mappings || []).map((m: { issue_id: string }) => m.issue_id);

    let issues: Array<{ id: string; slug: string; title: string; category: string }> = [];
    if (issueIds.length > 0) {
      const issueRes = await fetch(
        `${SUPABASE_URL}/rest/v1/issues?id=in.(${issueIds.join(",")})&select=id,slug,title,category`,
        { headers: anonHeaders() }
      );
      issues = await issueRes.json();
    }

    return NextResponse.json({ solution, issues });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
