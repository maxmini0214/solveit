import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkOrigin } from "@/lib/csrf";

describe("checkOrigin", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("production mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("allows solveit.vercel.app", () => {
      expect(checkOrigin("https://solveit.vercel.app", null)).toBe(true);
    });

    it("allows localhost:3000", () => {
      expect(checkOrigin("http://localhost:3000", null)).toBe(true);
    });

    it("blocks unknown origin", () => {
      expect(checkOrigin("https://evil-site.com", null)).toBe(false);
    });

    it("blocks origin with path manipulation", () => {
      expect(
        checkOrigin("https://solveit.vercel.app.evil.com", null)
      ).toBe(false);
    });

    it("allows null origin + null referer (same-origin)", () => {
      expect(checkOrigin(null, null)).toBe(true);
    });

    it("checks referer when origin is null", () => {
      expect(
        checkOrigin(null, "https://solveit.vercel.app/submit")
      ).toBe(true);
    });

    it("blocks bad referer when origin is null", () => {
      expect(checkOrigin(null, "https://evil.com/submit")).toBe(false);
    });
  });

  describe("development mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("allows everything in development", () => {
      expect(checkOrigin("https://evil-site.com", null)).toBe(true);
      expect(checkOrigin(null, "https://anything.com")).toBe(true);
    });
  });
});
