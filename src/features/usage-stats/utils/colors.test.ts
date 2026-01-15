import { describe, it, expect } from "vitest";
import { getUsageColor, getBarColor } from "./colors";

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

describe("getBarColor", () => {
  it("should return high color for ratio > 0.8", () => {
    expect(getBarColor(90, 100, false)).toBe("#dc2626");
    expect(getBarColor(90, 100, true)).toBe("#dc2626");
  });

  it("should return medium color for ratio > 0.5", () => {
    expect(getBarColor(60, 100, false)).toBe("#ea580c");
    expect(getBarColor(60, 100, true)).toBe("#ea580c");
  });

  it("should return active color for recent bars", () => {
    expect(getBarColor(30, 100, true)).toBe("#2563eb");
  });

  it("should return default color for non-recent bars", () => {
    expect(getBarColor(30, 100, false)).toBe("#60a5fa");
  });
});
