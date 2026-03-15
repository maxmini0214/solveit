"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/LangContext";

interface Solution {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  category: string | null;
  tags: string[];
  metrics: { views: number; satisfaction: number | null } | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  guide: { icon: "📝", label: "Guide", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  tool: { icon: "🔧", label: "Tool", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  curation: { icon: "📋", label: "Curation", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  data: { icon: "📊", label: "Data", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  service: { icon: "🚀", label: "Service", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
};

const TYPE_FILTERS = [
  { value: "all", labelKey: "all" },
  { value: "guide", label: "📝 Guides" },
  { value: "tool", label: "🔧 Tools" },
  { value: "curation", label: "📋 Curations" },
  { value: "data", label: "📊 Data" },
  { value: "service", label: "🚀 Services" },
];

export default function SolvedPage() {
  const { t } = useLang();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: "all" });
    if (typeFilter !== "all") params.set("type", typeFilter);

    fetch(`/api/solutions?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setSolutions(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => setSolutions([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {t("solvedTitle")} <span className="text-emerald-400">✓</span>
        </h1>
        <p className="text-neutral-400 mt-1">{t("solvedDesc")}</p>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPE_FILTERS.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTypeFilter(tf.value)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition cursor-pointer ${
              typeFilter === tf.value
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {tf.labelKey ? t(tf.labelKey) : tf.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-neutral-400">{t("loadingSolutions")}</p>
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">{t("comingSoon")}</h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            {total === 0 ? t("noSolutionsDesc") : t("noSolutionsCategory")}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            {total} {t("solution")}{total !== 1 ? "s" : ""}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {solutions.map((sol) => {
              const tc = typeConfig[sol.type] || typeConfig.guide;
              return (
                <Card
                  key={sol.id}
                  className="border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition cursor-pointer"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold line-clamp-2">
                          {sol.title}
                        </CardTitle>
                        {sol.description && (
                          <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                            {sol.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap items-center">
                      <Badge variant="outline" className={tc.color}>
                        {tc.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          sol.status === "live"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                        }
                      >
                        {sol.status}
                      </Badge>
                      {sol.category && (
                        <Badge
                          variant="outline"
                          className="border-neutral-700 text-neutral-400"
                        >
                          {sol.category}
                        </Badge>
                      )}
                      <span className="text-xs text-neutral-500 ml-auto">
                        {new Date(sol.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
