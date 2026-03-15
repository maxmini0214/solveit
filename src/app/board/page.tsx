"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLang } from "@/components/LangContext";
import MarkdownContent from "@/components/MarkdownContent";

interface Submission {
  id: string;
  text: string;
  status: string;
  votes: number;
  created_at: string;
}

interface ApiResponse {
  items: Submission[];
  total: number;
  page: number;
  pages: number;
}

type SortMode = "votes" | "newest";

export default function BoardPage() {
  const router = useRouter();
  const { t } = useLang();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortMode>("votes");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [emailSearch, setEmailSearch] = useState("");
  const [emailResults, setEmailResults] = useState<Submission[] | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailSearch, setShowEmailSearch] = useState(false);

  const fetchSubmissions = useCallback(
    async (s: SortMode, p: number, q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          sort: s === "votes" ? "votes" : "newest",
        });
        if (q) params.set("q", q);
        const res = await fetch(`/api/submit?${params}`, { cache: "no-store" });
        const data: ApiResponse = await res.json();
        setSubmissions(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      } catch {
        setSubmissions([]);
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetch("/api/vote", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setVotedIds(new Set(data.voted || [])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSubmissions(sort, page, search);
  }, [fetchSubmissions, sort, page, search]);

  const handleSortChange = (s: SortMode) => {
    setSort(s);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVote = async (submissionId: string) => {
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (data.votes !== undefined) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId ? { ...s, votes: data.votes } : s
          )
        );
        setVotedIds((prev) => {
          const next = new Set(prev);
          if (data.voted) next.add(submissionId);
          else next.delete(submissionId);
          return next;
        });
      }
    } catch {
      /* silent */
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("boardTitle")}</h1>
        <p className="text-neutral-400 mt-1">{t("boardDesc")}</p>
      </div>

      {/* Email search toggle */}
      <div>
        <button
          onClick={() => {
            setShowEmailSearch(!showEmailSearch);
            setEmailResults(null);
          }}
          className="text-sm text-neutral-500 hover:text-emerald-400 transition cursor-pointer"
        >
          📧 {t("mySubmissions")}
        </button>
        {showEmailSearch && (
          <div className="mt-3 p-4 rounded-lg border border-neutral-800 bg-neutral-900/50">
            <p className="text-xs text-neutral-500 mb-2">{t("mySubmissionsDesc")}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!emailSearch.trim()) return;
                setEmailLoading(true);
                try {
                  const res = await fetch("/api/my-submissions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailSearch }),
                  });
                  const data = await res.json();
                  setEmailResults(data.items || []);
                } catch {
                  setEmailResults([]);
                }
                setEmailLoading(false);
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder={t("mySubmissionsPlaceholder")}
                className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={emailLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm hover:bg-emerald-500/30 transition cursor-pointer disabled:opacity-50"
              >
                {emailLoading ? "..." : t("mySubmissionsButton")}
              </button>
            </form>
            {emailResults !== null && (
              <div className="mt-3 space-y-2">
                {emailResults.length === 0 ? (
                  <p className="text-sm text-neutral-500">😶 {t("noResults")}</p>
                ) : (
                  emailResults.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => router.push(`/board/${sub.id}`)}
                      className="p-3 rounded-lg border border-neutral-800 hover:border-neutral-600 cursor-pointer transition"
                    >
                      <p className="text-sm line-clamp-2">{sub.text}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        👍 {sub.votes} · {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("search")}
          className="flex-1 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm hover:bg-emerald-500/30 transition cursor-pointer"
        >
          🔍
        </button>
      </form>

      {/* Sort */}
      <div className="flex gap-4 items-center">
        <span className="text-sm text-neutral-500">{t("sortBy")}</span>
        {(
          [
            { value: "votes" as SortMode, labelKey: "sortVotes" },
            { value: "newest" as SortMode, labelKey: "sortNewest" },
          ]
        ).map((s) => (
          <button
            key={s.value}
            onClick={() => handleSortChange(s.value)}
            className={`text-sm transition cursor-pointer ${
              sort === s.value
                ? "text-emerald-400"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-neutral-400">{t("loadingIssues")}</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-neutral-400 text-lg">{t("noResults")}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            {total} {t("items")}
            {totalPages > 1 && ` · ${t("page")} ${page}/${totalPages}`}
          </p>

          <div className="space-y-4">
            {submissions.map((sub) => (
              <Card
                key={sub.id}
                className="border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition cursor-pointer"
                onClick={() => router.push(`/board/${sub.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-normal leading-relaxed line-clamp-3 overflow-hidden">
                        <MarkdownContent content={sub.text} compact />
                      </CardTitle>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(sub.id);
                      }}
                      className={`flex flex-col items-center gap-1 min-w-[50px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                        votedIds.has(sub.id)
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-neutral-700 hover:border-emerald-500 hover:bg-emerald-500/5 text-neutral-400"
                      }`}
                    >
                      <span className="text-lg">▲</span>
                      <span className="text-sm font-semibold">{sub.votes}</span>
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-neutral-500">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-700 text-sm hover:border-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t("prev")}
              </button>
              <span className="text-sm text-neutral-400 px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-700 text-sm hover:border-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t("next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
