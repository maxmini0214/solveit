"use client";
import { useLang } from "./LangContext";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ko" ? "en" : "ko")}
      className="px-2.5 py-1 border border-neutral-700 rounded text-xs font-medium text-neutral-400 hover:text-neutral-50 hover:border-neutral-500 transition cursor-pointer bg-transparent"
    >
      {lang === "ko" ? "ENG" : "KOR"}
    </button>
  );
}
