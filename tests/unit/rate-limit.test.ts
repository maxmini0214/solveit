import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIG } from "../fixtures/submissions";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset time mocks between tests
    vi.useRealTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit("test-ip-first");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMIT_CONFIG.maxRequests - 1);
  });

  it(`allows up to ${RATE_LIMIT_CONFIG.maxRequests} requests per window`, () => {
    const ip = "test-ip-max";
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks after limit exceeded", () => {
    const ip = "test-ip-block";
    // Exhaust limit
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      checkRateLimit(ip);
    }
    // Next one should be blocked
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks IPs independently", () => {
    const ip1 = "test-ip-independent-1";
    const ip2 = "test-ip-independent-2";

    // Exhaust ip1
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      checkRateLimit(ip1);
    }

    // ip2 should still work
    const result = checkRateLimit(ip2);
    expect(result.allowed).toBe(true);
  });

  it("resets after window expires", () => {
    vi.useFakeTimers();
    const ip = "test-ip-reset";

    // Exhaust limit
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);

    // Advance past window
    vi.advanceTimersByTime(RATE_LIMIT_CONFIG.windowMs + 1);

    // Should work again
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(RATE_LIMIT_CONFIG.maxRequests - 1);
  });

  it("returns decreasing remaining count", () => {
    const ip = "test-ip-remaining";
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
      const result = checkRateLimit(ip);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIG.maxRequests - 1 - i);
    }
  });
});
