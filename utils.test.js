import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatCost,
  formatTokens,
  formatResetTime,
  getUsageColor,
  formatSessionId,
  getReviewStatus,
  getCIStatus,
} from "./utils.js";

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
    // Mock current date for consistent testing
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

  it("should format today's date as time only", () => {
    // 2026-01-15 19:30 JST = 2026-01-15 10:30 UTC (same day as mocked now)
    const result = formatResetTime("2026-01-15T10:30:00.000Z");
    // UTC 10:30 = JST 19:30
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("should format future date with month, day, and time", () => {
    const result = formatResetTime("2026-01-20T11:00:00.000Z");
    // Should include month and day
    expect(result).toMatch(/^[A-Z][a-z]{2} \d+, \d{2}:\d{2}$/);
  });

  it("should return empty string for invalid date", () => {
    expect(formatResetTime("invalid-date")).toBe("");
  });
});

describe("getUsageColor", () => {
  it("should return green for low utilization (0-49)", () => {
    expect(getUsageColor(0)).toBe("#22c55e");
    expect(getUsageColor(25)).toBe("#22c55e");
    expect(getUsageColor(49)).toBe("#22c55e");
    expect(getUsageColor(49.9)).toBe("#22c55e");
  });

  it("should return yellow/orange for medium utilization (50-79)", () => {
    expect(getUsageColor(50)).toBe("#f59e0b");
    expect(getUsageColor(65)).toBe("#f59e0b");
    expect(getUsageColor(79)).toBe("#f59e0b");
    expect(getUsageColor(79.9)).toBe("#f59e0b");
  });

  it("should return red for high utilization (80-100+)", () => {
    expect(getUsageColor(80)).toBe("#dc2626");
    expect(getUsageColor(90)).toBe("#dc2626");
    expect(getUsageColor(100)).toBe("#dc2626");
    expect(getUsageColor(150)).toBe("#dc2626");
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
    expect(formatSessionId("abcd1234-5678-90ef-ghij-klmnopqrstuv")).toBe(
      "abcd1234"
    );
  });

  it("should return full string if less than 8 characters", () => {
    expect(formatSessionId("abc")).toBe("abc");
    expect(formatSessionId("12345678")).toBe("12345678");
  });

  it("should handle exactly 8 character input", () => {
    expect(formatSessionId("12345678")).toBe("12345678");
  });
});

describe("getReviewStatus", () => {
  it("should return approved status for APPROVED", () => {
    const result = getReviewStatus("APPROVED");
    expect(result).toEqual({
      label: "Approved",
      textColor: "#166534",
      bgColor: "#dcfce7",
      borderColor: "#86efac",
    });
  });

  it("should return changes requested status for CHANGES_REQUESTED", () => {
    const result = getReviewStatus("CHANGES_REQUESTED");
    expect(result).toEqual({
      label: "Changes",
      textColor: "#991b1b",
      bgColor: "#fee2e2",
      borderColor: "#fca5a5",
    });
  });

  it("should return review required status for REVIEW_REQUIRED", () => {
    const result = getReviewStatus("REVIEW_REQUIRED");
    expect(result).toEqual({
      label: "Review",
      textColor: "#9a3412",
      bgColor: "#ffedd5",
      borderColor: "#fdba74",
    });
  });

  it("should return null for null input", () => {
    expect(getReviewStatus(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(getReviewStatus(undefined)).toBeNull();
  });

  it("should return null for unknown status", () => {
    expect(getReviewStatus("UNKNOWN")).toBeNull();
    expect(getReviewStatus("")).toBeNull();
  });
});

describe("getCIStatus", () => {
  it("should return success status for SUCCESS", () => {
    const result = getCIStatus("SUCCESS");
    expect(result).toEqual({
      label: "CI Pass",
      textColor: "#0e7490",
      bgColor: "#cffafe",
      borderColor: "#67e8f9",
    });
  });

  it("should return failure status for FAILURE", () => {
    const result = getCIStatus("FAILURE");
    expect(result).toEqual({
      label: "CI Fail",
      textColor: "#be185d",
      bgColor: "#fce7f3",
      borderColor: "#f9a8d4",
    });
  });

  it("should return pending status for PENDING", () => {
    const result = getCIStatus("PENDING");
    expect(result).toEqual({
      label: "CI Running",
      textColor: "#6b21a8",
      bgColor: "#f3e8ff",
      borderColor: "#d8b4fe",
    });
  });

  it("should return N/A status for null", () => {
    const result = getCIStatus(null);
    expect(result).toEqual({
      label: "CI N/A",
      textColor: "#4b5563",
      bgColor: "#f3f4f6",
      borderColor: "#d1d5db",
    });
  });

  it("should return N/A status for undefined", () => {
    const result = getCIStatus(undefined);
    expect(result).toEqual({
      label: "CI N/A",
      textColor: "#4b5563",
      bgColor: "#f3f4f6",
      borderColor: "#d1d5db",
    });
  });

  it("should return N/A status for unknown status", () => {
    const result = getCIStatus("UNKNOWN");
    expect(result).toEqual({
      label: "CI N/A",
      textColor: "#4b5563",
      bgColor: "#f3f4f6",
      borderColor: "#d1d5db",
    });
  });
});
