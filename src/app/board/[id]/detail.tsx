"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLang } from "@/components/LangContext";

interface Submission {
  id: string;
  text: string;
  status: string;
  votes: number;
  created_at: string;
}

export default function SubmissionDetail() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLang();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/submissions/${params.id}`, { cache: "no-store" }).then((r) =>
        r.json()
      ),
      fetch("/api/vote", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([data, voteData]) => {
        if (data.submission) {
          setSubmission(data.submission);
        }
        const votedIds = new Set(voteData.voted || []);
        setVoted(votedIds.has(params.id as string));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleVote = async () => {
    if (!submission) return;
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id }),
      });
      const data = await res.json();
      if (data.votes !== undefined) {
        setSubmission((prev) =>
          prev ? { ...prev, votes: data.votes } : prev
        );
        setVoted(data.voted);
      }
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4 animate-pulse">⏳</div>
        <p className="text-neutral-400">{t("loading")}</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🤷</div>
        <p className="text-neutral-400 text-lg">{t("notFound")}</p>
        <button
          onClick={() => router.push("/board")}
          className="mt-4 text-emerald-400 hover:underline cursor-pointer"
        >
          {t("backToBoard")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button
        onClick={() => router.push("/board")}
        className="text-neutral-400 hover:text-white transition cursor-pointer"
      >
        {t("backToBoard")}
      </button>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-normal leading-relaxed flex-1">
              {submission.text}
            </CardTitle>
            <button
              onClick={handleVote}
              className={`flex flex-col items-center gap-1 min-w-[60px] px-3 py-2 rounded-lg border transition cursor-pointer ${
                voted
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-neutral-700 hover:border-emerald-500 hover:bg-emerald-500/5 text-neutral-400"
              }`}
            >
              <span className="text-xl">▲</span>
              <span className="text-base font-semibold">{submission.votes}</span>
              <span className="text-xs">{voted ? t("voted") : t("voteButton")}</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span>{new Date(submission.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>{submission.status}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
