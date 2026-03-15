"use client";

import { useState, useRef, useEffect } from "react";
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
import { useLang } from "@/components/LangContext";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAACrF2FNC-kTFDfnn";

    const renderWidget = () => {
      if (ref.current && window.turnstile && !widgetId.current) {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => onToken(token),
          theme: "dark",
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [onToken]);

  return <div ref={ref} className="mt-2" />;
}

export default function SubmitPage() {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!turnstileToken) {
      setError(t("captchaError"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          email: email.trim() || null,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setText("");
        setEmail("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold">{t("submissionSuccess")}</h1>
        <p className="text-neutral-400 max-w-md">
          {t("successDesc")}
          {email && t("successDescEmail")}
        </p>
        <Button
          onClick={() => { setSubmitted(false); setTurnstileToken(""); }}
          variant="outline"
          className="cursor-pointer"
        >
          {t("submitAnother")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="text-2xl">{t("submitTitle")}</CardTitle>
          <CardDescription>{t("submitDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="frustration">{t("frustrationLabel")}</Label>
              <Textarea
                id="frustration"
                placeholder={t("submitPlaceholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] bg-neutral-950 border-neutral-700 focus:border-emerald-500 resize-y"
                required
              />
              <p className="text-xs text-neutral-500">{t("frustrationHint")}</p>
              <p className="text-xs text-neutral-600">{t("markdownHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("emailOptional")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-950 border-neutral-700 focus:border-emerald-500"
              />
            </div>

            <TurnstileWidget onToken={setTurnstileToken} />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              disabled={!text.trim() || loading || !turnstileToken}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-base cursor-pointer"
            >
              {loading ? t("submitting") : t("submitButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
