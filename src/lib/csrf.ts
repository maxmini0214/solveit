const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3333",
  "https://solveit.vercel.app",
  // Add solveit.so when purchased
];

export function checkOrigin(origin: string | null, referer: string | null): boolean {
  // Allow if no origin (same-origin requests from some browsers)
  if (!origin && !referer) return true;

  const checkUrl = origin || referer || "";

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") return true;

  // Exact origin match (not startsWith — prevents solveit.vercel.app.evil.com)
  return ALLOWED_ORIGINS.some((allowed) => {
    try {
      const checkParsed = new URL(checkUrl);
      const allowedParsed = new URL(allowed);
      return (
        checkParsed.protocol === allowedParsed.protocol &&
        checkParsed.host === allowedParsed.host
      );
    } catch {
      return false;
    }
  });
}
