import { NextResponse } from "next/server";

export const runtime = "edge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ submitted: 0, solved: 0, solving: 0 });
  }

  const headers = {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: "count=exact",
  };

  try {
    // Count all submissions
    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/submissions?select=id&limit=0`,
      { headers: { ...headers, Prefer: "count=exact" } }
    );
    const subRange = subRes.headers.get("content-range");
    const submitted = subRange ? parseInt(subRange.split("/")[1]) || 0 : 0;

    // Count solved solutions
    const solvedRes = await fetch(
      `${SUPABASE_URL}/rest/v1/solutions?select=id&status=eq.live&limit=0`,
      { headers: { ...headers, Prefer: "count=exact" } }
    );
    const solvedRange = solvedRes.headers.get("content-range");
    const solved = solvedRange
      ? parseInt(solvedRange.split("/")[1]) || 0
      : 0;

    // Count in-progress
    const solvingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/solutions?select=id&status=eq.draft&limit=0`,
      { headers: { ...headers, Prefer: "count=exact" } }
    );
    const solvingRange = solvingRes.headers.get("content-range");
    const solving = solvingRange
      ? parseInt(solvingRange.split("/")[1]) || 0
      : 0;

    return NextResponse.json(
      { submitted, solved, solving },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ submitted: 0, solved: 0, solving: 0 });
  }
}
