import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LangProvider } from "@/components/LangContext";
import { LangToggle } from "@/components/LangToggle";
import { NavLinks } from "@/components/NavLinks";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolveIt — Tell us what bugs you. We'll build a fix.",
  description:
    "Share your everyday frustrations. AI prioritizes them. We build real solutions. Track progress and get notified when your problem is solved.",
  keywords: ["solve", "problems", "build", "feedback", "frustration", "solutions"],
  metadataBase: new URL("https://solveit.ai.kr"),
  openGraph: {
    title: "SolveIt — Tell us what bugs you. We'll build a fix.",
    description:
      "Share your everyday frustrations. AI prioritizes them. We build real solutions.",
    url: "https://solveit.ai.kr",
    siteName: "SolveIt",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolveIt — Tell us what bugs you. We'll build a fix.",
    description:
      "Share your everyday frustrations. AI prioritizes them. We build real solutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://solveit.ai.kr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preload"
          href="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          as="script"
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased bg-neutral-950 text-neutral-50 min-h-screen`}
        style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', sans-serif" }}
      >
        <LangProvider>
          <nav className="border-b border-neutral-800 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold tracking-tight">
                Solve<span className="text-emerald-400">It</span>
              </Link>
              <div className="flex items-center gap-4">
                <NavLinks />
                <LangToggle />
              </div>
            </div>
          </nav>
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
