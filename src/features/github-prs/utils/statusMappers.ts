/**
 * Status mapping utilities for GitHub PRs
 */

import type { StatusBadge } from "../../../shared/types";
import type { ReviewDecision, CIStatus } from "../types";

/**
 * Returns review status info with label and colors.
 * @param reviewDecision - The review decision from GitHub API
 * @returns Status badge info or null
 */
export const getReviewStatus = (reviewDecision: ReviewDecision | null | undefined): StatusBadge | null => {
  switch (reviewDecision) {
    case "APPROVED":
      return {
        label: "Approved",
        textColor: "#166534",
        bgColor: "#dcfce7",
        borderColor: "#86efac",
      };
    case "CHANGES_REQUESTED":
      return {
        label: "Changes",
        textColor: "#991b1b",
        bgColor: "#fee2e2",
        borderColor: "#fca5a5",
      };
    case "REVIEW_REQUIRED":
      return {
        label: "Review",
        textColor: "#9a3412",
        bgColor: "#ffedd5",
        borderColor: "#fdba74",
      };
    default:
      return null;
  }
};

/**
 * Returns CI status info with label and colors.
 * @param ciStatus - The CI status from GitHub API
 * @returns Status badge info
 */
export const getCIStatus = (ciStatus: CIStatus | null | undefined): StatusBadge => {
  switch (ciStatus) {
    case "SUCCESS":
      return {
        label: "CI Pass",
        textColor: "#0e7490",
        bgColor: "#cffafe",
        borderColor: "#67e8f9",
      };
    case "FAILURE":
      return {
        label: "CI Fail",
        textColor: "#be185d",
        bgColor: "#fce7f3",
        borderColor: "#f9a8d4",
      };
    case "PENDING":
      return {
        label: "CI Running",
        textColor: "#6b21a8",
        bgColor: "#f3e8ff",
        borderColor: "#d8b4fe",
      };
    default:
      return {
        label: "CI N/A",
        textColor: "#4b5563",
        bgColor: "#f3f4f6",
        borderColor: "#d1d5db",
      };
  }
};
