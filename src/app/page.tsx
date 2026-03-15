"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/LangContext";

export default function Home() {
  const { t } = useLang();

  const steps = [
    { emoji: "💬", titleKey: "step1Title", descKey: "step1Desc" },
    { emoji: "🤖", titleKey: "step2Title", descKey: "step2Desc" },
    { emoji: "🛠️", titleKey: "step3Title", descKey: "step3Desc" },
    { emoji: "📬", titleKey: "step4Title", descKey: "step4Desc" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight whitespace-nowrap">
          {t("heroTitle1")}
          <span className="text-emerald-400">{t("heroHighlight")}</span>
          {t("heroTitle2")}
          <br />
          {t("heroTitle3")}
        </h1>
        {t("heroDesc") && (
          <p className="text-base sm:text-lg text-neutral-400 max-w-lg mx-auto">
            {t("heroDesc")}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Link href="/submit">
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 py-6 cursor-pointer"
          >
            {t("ctaSubmit")}
          </Button>
        </Link>
        <Link href="/board">
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 cursor-pointer"
          >
            {t("ctaBrowse")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-16 w-full max-w-3xl">
        {steps.map((step) => (
          <div
            key={step.titleKey}
            className="text-center space-y-2 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
          >
            <div className="text-3xl">{step.emoji}</div>
            <h3 className="font-semibold">{t(step.titleKey)}</h3>
            <p className="text-sm text-neutral-400">{t(step.descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
