import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Submission {
  id: string;
  text: string;
  category: string | null;
  tags: string[];
  size: string | null;
  status: string;
  votes: number;
  createdAt: string;
}

async function getSubmissions(): Promise<Submission[]> {
  // Server-side: fetch from API or directly from data source
  // In production with Supabase, this would query DB directly for SSR
  // For now, use the same JSON fallback logic
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const dataFile = path.join(process.cwd(), "data", "submissions.json");
    const data = await fs.readFile(dataFile, "utf-8");
    const submissions = JSON.parse(data) as Submission[];
    return submissions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  solved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

const sizeColors: Record<string, string> = {
  XS: "bg-green-500/10 text-green-400 border-green-500/20",
  S: "bg-green-500/10 text-green-400 border-green-500/20",
  M: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  L: "bg-red-500/10 text-red-400 border-red-500/20",
  XL: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function BoardPage() {
  const submissions = await getSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Problem Board</h1>
        <p className="text-neutral-400 mt-1">
          Real frustrations from real people. Vote for what matters to you.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-neutral-400 text-lg">
            No problems submitted yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((req) => (
            <Card
              key={req.id}
              className="border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-normal leading-relaxed">
                    {req.text}
                  </CardTitle>
                  <button className="flex flex-col items-center gap-1 min-w-[50px] px-2 py-1 rounded-lg border border-neutral-700 hover:border-emerald-500 hover:bg-emerald-500/5 transition cursor-pointer">
                    <span className="text-lg">▲</span>
                    <span className="text-sm font-semibold">{req.votes}</span>
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={statusColors[req.status] || statusColors.open}
                  >
                    {req.status}
                  </Badge>
                  {req.category && (
                    <Badge
                      variant="outline"
                      className="border-neutral-700 text-neutral-400"
                    >
                      {req.category}
                    </Badge>
                  )}
                  {req.size && (
                    <Badge
                      variant="outline"
                      className={sizeColors[req.size] || ""}
                    >
                      {req.size}
                    </Badge>
                  )}
                  <span className="text-xs text-neutral-500 ml-auto self-center">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
