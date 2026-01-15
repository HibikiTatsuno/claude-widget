import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatCost, formatTokens, formatResetTime, formatSessionId } from "./formatters";

describe("formatCost", () => {
  it("should format zero cost", () => {
    expect(formatCost(0)).toBe("$0.00");
  });

  it("should format integer cost", () => {
    expect(formatCost(5)).toBe("$5.00");
  });

  it("should format decimal cost with two decimal places", () => {
    expect(formatCost(1.5)).toBe("$1.50");
    expect(formatCost(1.234)).toBe("$1.23");
    expect(formatCost(1.999)).toBe("$2.00");
  });

  it("should format large cost", () => {
    expect(formatCost(1234.56)).toBe("$1234.56");
  });

  it("should format small decimal cost", () => {
    expect(formatCost(0.01)).toBe("$0.01");
    expect(formatCost(0.001)).toBe("$0.00");
  });
});

describe("formatTokens", () => {
  it("should return '0' for zero tokens", () => {
    expect(formatTokens(0)).toBe("0");
  });

  it("should return raw number for tokens less than 1000", () => {
    expect(formatTokens(1)).toBe("1");
    expect(formatTokens(999)).toBe("999");
    expect(formatTokens(500)).toBe("500");
  });

  it("should format tokens in K range", () => {
    expect(formatTokens(1000)).toBe("1K");
    expect(formatTokens(1500)).toBe("2K");
    expect(formatTokens(10000)).toBe("10K");
    expect(formatTokens(999999)).toBe("1000K");
  });

  it("should format tokens in M range", () => {
    expect(formatTokens(1000000)).toBe("1.0M");
    expect(formatTokens(1500000)).toBe("1.5M");
    expect(formatTokens(10000000)).toBe("10.0M");
    expect(formatTokens(123456789)).toBe("123.5M");
  });
});

describe("formatResetTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return empty string for null input", () => {
    expect(formatResetTime(null)).toBe("");
  });

  it("should return empty string for undefined input", () => {
    expect(formatResetTime(undefined)).toBe("");
  });

  it("should return empty string for empty string input", () => {
    expect(formatResetTime("")).toBe("");
  });

  it("should format date with month, day, and time", () => {
    const result = formatResetTime("2026-01-20T11:00:00.000Z");
    expect(result).toMatch(/^[A-Z][a-z]{2} \d+, \d{2}:\d{2}$/);
  });

  it("should return empty string for invalid date", () => {
    expect(formatResetTime("invalid-date")).toBe("");
  });
});

describe("formatSessionId", () => {
  it("should return empty string for null input", () => {
    expect(formatSessionId(null)).toBe("");
  });

  it("should return empty string for undefined input", () => {
    expect(formatSessionId(undefined)).toBe("");
  });

  it("should return empty string for empty string input", () => {
    expect(formatSessionId("")).toBe("");
  });

  it("should return first 8 characters of long session ID", () => {
    expect(formatSessionId("abcd1234-5678-90ef-ghij-klmnopqrstuv")).toBe("abcd1234");
  });

  it("should return full string if less than 8 characters", () => {
    expect(formatSessionId("abc")).toBe("abc");
  });

  it("should handle exactly 8 character input", () => {
    expect(formatSessionId("12345678")).toBe("12345678");
  });
});
