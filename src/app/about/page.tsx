"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LangContext";
import { useEffect, useState } from "react";

function StatsSection() {
  const { t } = useLang();
  const [stats, setStats] = useState({ submitted: 0, solved: 0, solving: 0 });

  useEffect(() => {
    fetch("/api/submissions/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  const items = [
    {
      label: t("aboutStatsSubmitted"),
      value: stats.submitted,
      emoji: "📋",
    },
    {
      label: t("aboutStatsSolved"),
      value: stats.solved,
      emoji: "✅",
    },
    {
      label: t("aboutStatsSolving"),
      value: stats.solving,
      emoji: "⚙️",
    },
  ];

  return (
    <section className="w-full max-w-3xl space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">
        {t("aboutStatsTitle")}
      </h2>
      <p className="text-neutral-400 text-center text-sm">
        {t("aboutStatsDesc")}
      </p>
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="text-center p-6 rounded-xl border border-neutral-800 bg-neutral-900/50"
          >
            <div className="text-2xl mb-2">{item.emoji}</div>
            <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
              {item.value}
              <span className="text-lg text-neutral-500 ml-1">
                {t("aboutStatsUnit")}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { t } = useLang();

  const diffs = [
    {
      emoji: "🚀",
      titleKey: "aboutDiff1Title",
      descKey: "aboutDiff1Desc",
    },
    {
      emoji: "🤖",
      titleKey: "aboutDiff2Title",
      descKey: "aboutDiff2Desc",
    },
    {
      emoji: "🛠️",
      titleKey: "aboutDiff3Title",
      descKey: "aboutDiff3Desc",
    },
    {
      emoji: "📬",
      titleKey: "aboutDiff4Title",
      descKey: "aboutDiff4Desc",
    },
  ];

  const steps = [
    { emoji: "💬", titleKey: "step1Title", descKey: "step1Desc" },
    { emoji: "🤖", titleKey: "step2Title", descKey: "step2Desc" },
    { emoji: "🛠️", titleKey: "step3Title", descKey: "step3Desc" },
    { emoji: "📬", titleKey: "step4Title", descKey: "step4Desc" },
  ];

  return (
    <div className="flex flex-col items-center gap-20 py-8 sm:py-16 px-4">
      {/* Hero */}
      <section className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          {t("aboutHeroTitle")}
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 max-w-lg mx-auto whitespace-pre-line">
          {t("aboutHeroDesc")}
        </p>
      </section>

      {/* Story */}
      <section className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {t("aboutStoryTitle")}
        </h2>
        <div className="space-y-4 text-neutral-300 leading-relaxed text-base sm:text-lg">
          <p>{t("aboutStoryP1")}</p>
          <p className="text-neutral-500 text-sm sm:text-base italic">
            {t("aboutStoryP2")}
          </p>
          <p>{t("aboutStoryP3")}</p>
          <p className="text-emerald-400 font-semibold text-lg sm:text-xl">
            {t("aboutStoryP4")}
          </p>
          <p className="text-neutral-400">{t("aboutStoryP5")}</p>
        </div>
      </section>

      {/* What's different */}
      <section className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          {t("aboutDiffTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {diffs.map((d) => (
            <div
              key={d.titleKey}
              className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2"
            >
              <div className="text-2xl">{d.emoji}</div>
              <h3 className="font-semibold text-lg">{t(d.titleKey)}</h3>
              <p className="text-sm text-neutral-400">{t(d.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-3xl space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          {t("aboutHowTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.titleKey}
              className="text-center space-y-2 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 relative"
            >
              <div className="absolute -top-3 -left-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div className="text-3xl">{step.emoji}</div>
              <h3 className="font-semibold">{t(step.titleKey)}</h3>
              <p className="text-sm text-neutral-400">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Every frustration matters */}
      <section className="w-full max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {t("aboutValueTitle")}
        </h2>
        <div className="space-y-3 text-neutral-300 text-base sm:text-lg leading-relaxed">
          <p>{t("aboutValueP1")}</p>
          <p>{t("aboutValueP2")}</p>
          <p className="text-emerald-400 font-semibold">
            {t("aboutValueP3")}
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="w-full max-w-2xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          {t("aboutVisionTitle")}
        </h2>
        <div className="space-y-3 text-neutral-300 text-base sm:text-lg leading-relaxed text-center">
          <p>{t("aboutVisionP1")}</p>
          <p>{t("aboutVisionP2")}</p>
          <p className="text-neutral-400">{t("aboutVisionP3")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 pb-8">
        <Link href="/submit">
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 py-7 cursor-pointer"
          >
            {t("aboutCta")}
          </Button>
        </Link>
        <p className="text-sm text-neutral-500">{t("aboutCtaSub")}</p>
      </section>
    </div>
  );
}
