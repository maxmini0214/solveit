"use client";
import Link from "next/link";
import { useLang } from "./LangContext";

export function NavLinks() {
  const { t } = useLang();
  return (
    <div className="flex gap-6 text-sm text-neutral-400">
      <Link href="/submit" className="hover:text-neutral-100 transition">
        {t("navSubmit")}
      </Link>
      <Link href="/board" className="hover:text-neutral-100 transition">
        {t("navBoard")}
      </Link>
      <Link href="/solved" className="hover:text-neutral-100 transition">
        {t("navSolved")}
      </Link>
      <Link href="/about" className="hover:text-neutral-100 transition">
        {t("navAbout")}
      </Link>
    </div>
  );
}
