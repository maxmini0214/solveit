"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dict, Lang } from "@/lib/i18n";

const STORAGE_KEY = "solveit-lang";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ko";

  // 1. localStorage (user manual choice) — top priority
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ko" || stored === "en") return stored;

  // 2. Server cookie from CF-IPCountry
  const match = document.cookie.match(/(?:^|;\s*)lang=(ko|en)/);
  if (match) return match[1] as Lang;

  // 3. Browser language fallback
  if (navigator.language?.startsWith("ko")) return "ko";

  return "en";
}

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: "ko",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(getInitialLang());
    setMounted(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string) => (dict[lang] as Record<string, string>)[key] ?? key;

  // Prevent hydration mismatch: render nothing until client-side lang is resolved
  if (!mounted) {
    return (
      <LangContext.Provider value={{ lang: "ko", setLang, t: (key: string) => (dict.ko as Record<string, string>)[key] ?? key }}>
        {children}
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
