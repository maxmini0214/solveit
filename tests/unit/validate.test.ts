import { describe, it, expect } from "vitest";
import { validateSubmission } from "@/lib/validate";
import {
  VALID_SUBMISSIONS,
  INVALID_SUBMISSIONS,
  XSS_PAYLOADS,
} from "../fixtures/submissions";

describe("validateSubmission", () => {
  // ---- Valid cases (auto-expand via fixtures) ----
  describe("valid submissions", () => {
    VALID_SUBMISSIONS.forEach(({ name, text, email }) => {
      it(`accepts: ${name}`, () => {
        const result = validateSubmission(text, email);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.sanitized.text.length).toBeGreaterThan(0);
      });
    });
  });

  // ---- Invalid cases (auto-expand via fixtures) ----
  describe("invalid submissions", () => {
    INVALID_SUBMISSIONS.forEach(({ name, text, email, expectedError }) => {
      it(`rejects: ${name}`, () => {
        const result = validateSubmission(text, email);
        expect(result.valid).toBe(false);
        expect(result.error).toContain(expectedError);
      });
    });
  });

  // ---- XSS sanitization (auto-expand via fixtures) ----
  describe("XSS sanitization", () => {
    XSS_PAYLOADS.forEach(({ name, input, expected }) => {
      it(`sanitizes: ${name}`, () => {
        const result = validateSubmission(input, null);
        expect(result.valid).toBe(true);
        expect(result.sanitized.text).toBe(expected);
      });
    });
  });

  // ---- Email normalization ----
  describe("email normalization", () => {
    it("lowercases email", () => {
      const result = validateSubmission("complaint", "USER@Example.COM");
      expect(result.sanitized.email).toBe("user@example.com");
    });

    it("trims email whitespace", () => {
      const result = validateSubmission("complaint", "  user@test.com  ");
      expect(result.sanitized.email).toBe("user@test.com");
    });

    it("returns null for empty email", () => {
      const result = validateSubmission("complaint", "");
      expect(result.sanitized.email).toBeNull();
    });

    it("returns null for undefined email", () => {
      const result = validateSubmission("complaint", undefined);
      expect(result.sanitized.email).toBeNull();
    });
  });

  // ---- Boundary tests ----
  describe("boundaries", () => {
    it("accepts exactly 2000 chars", () => {
      const result = validateSubmission("a".repeat(2000), null);
      expect(result.valid).toBe(true);
    });

    it("rejects 2001 chars", () => {
      const result = validateSubmission("a".repeat(2001), null);
      expect(result.valid).toBe(false);
    });

    it("accepts email at exactly 320 chars", () => {
      const email = "a".repeat(306) + "@example.com"; // 306 + 12 = 318 < 320
      const result = validateSubmission("complaint", email);
      expect(result.valid).toBe(true);
    });
  });
});
