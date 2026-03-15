import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolveIt — Tell us what bugs you. We'll build a fix.",
  description:
    "Share your everyday frustrations. AI prioritizes them. We build real solutions. Track progress and get notified when your problem is solved.",
  keywords: ["solve", "problems", "build", "feedback", "frustration", "solutions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50 min-h-screen`}
      >
        <nav className="border-b border-neutral-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Solve<span className="text-emerald-400">It</span>
            </Link>
            <div className="flex gap-6 text-sm text-neutral-400">
              <Link href="/submit" className="hover:text-neutral-100 transition">
                Submit
              </Link>
              <Link href="/board" className="hover:text-neutral-100 transition">
                Board
              </Link>
              <Link href="/solved" className="hover:text-neutral-100 transition">
                Solved
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
