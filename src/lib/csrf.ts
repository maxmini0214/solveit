const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3333",
];

// Dynamically allow any *.pages.dev or configured custom domain
function isDynamicAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.host;
    // Allow any solveit*.pages.dev subdomain
    if (host.endsWith(".pages.dev") && host.includes("solveit")) return true;
    // Allow solveit.so (and www)
    if (host === "solveit.so" || host === "www.solveit.so") return true;
    // Allow env-configured domain
    const customDomain = process.env.ALLOWED_DOMAIN;
    if (customDomain && host === customDomain) return true;
    return false;
  } catch {
    return false;
  }
}

export function checkOrigin(origin: string | null, referer: string | null): boolean {
  if (!origin && !referer) return true;

  const checkUrl = origin || referer || "";

  if (process.env.NODE_ENV === "development") return true;

  // Static allowlist
  const staticMatch = ALLOWED_ORIGINS.some((allowed) => {
    try {
      const checkParsed = new URL(checkUrl);
      const allowedParsed = new URL(allowed);
      return checkParsed.protocol === allowedParsed.protocol && checkParsed.host === allowedParsed.host;
    } catch {
      return false;
    }
  });

  return staticMatch || isDynamicAllowed(checkUrl);
}
