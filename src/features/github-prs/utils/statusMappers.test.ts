import { describe, it, expect } from "vitest";
import { getReviewStatus, getCIStatus } from "./statusMappers";

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
});
