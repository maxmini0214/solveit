"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubmitPage() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), email: email.trim() || null }),
      });

      if (res.ok) {
        setSubmitted(true);
        setText("");
        setEmail("");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">Got it!</h1>
        <p className="text-neutral-400 max-w-md">
          Your frustration has been logged. Our AI is analyzing it right now.
          {email && " We'll email you when we have a solution."}
        </p>
        <Button
          onClick={() => setSubmitted(false)}
          variant="outline"
          className="cursor-pointer"
        >
          Submit another one
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="text-2xl">What&apos;s bugging you?</CardTitle>
          <CardDescription>
            Write whatever annoys you in daily life. No need to be formal — just
            rant. We&apos;ll figure out the rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="frustration">Your frustration</Label>
              <Textarea
                id="frustration"
                placeholder='e.g. "I wish I could see all delivery app reviews as photos only, without reading text..."'
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] bg-neutral-950 border-neutral-700 focus:border-emerald-500 resize-y"
                required
              />
              <p className="text-xs text-neutral-500">
                Any language is fine. Be as vague or specific as you want.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email{" "}
                <span className="text-neutral-500 font-normal">
                  (optional — we&apos;ll notify you when solved)
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-950 border-neutral-700 focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              disabled={!text.trim() || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-base cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
