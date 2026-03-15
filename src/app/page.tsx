import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
      {/* Hero */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Tell us what <span className="text-emerald-400">bugs</span> you.
          <br />
          We&apos;ll build a fix.
        </h1>
        <p className="text-lg text-neutral-400 max-w-lg mx-auto">
          Share your everyday frustrations — no login needed. AI organizes them.
          We build real solutions. You get notified when it&apos;s done.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        <Link href="/submit">
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 py-6 cursor-pointer"
          >
            Submit a Problem
          </Button>
        </Link>
        <Link href="/board">
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 cursor-pointer"
          >
            Browse Problems
          </Button>
        </Link>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-16 w-full max-w-3xl">
        {[
          {
            emoji: "💬",
            title: "You rant",
            desc: "Write what annoys you. Anything. No filter needed.",
          },
          {
            emoji: "🤖",
            title: "AI sorts it",
            desc: "We categorize, deduplicate, and prioritize automatically.",
          },
          {
            emoji: "🛠️",
            title: "We build",
            desc: "Real tools, apps, and fixes — shipped to production.",
          },
          {
            emoji: "📬",
            title: "You get it",
            desc: "Get notified when your problem is solved. For real.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="text-center space-y-2 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
          >
            <div className="text-3xl">{step.emoji}</div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm text-neutral-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
