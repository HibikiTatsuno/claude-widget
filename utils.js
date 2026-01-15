/**
 * Utility functions for Claude Widget
 * Extracted for testing and reusability
 */

/**
 * Formats a cost value to currency string.
 * @param {number} cost - The cost value
 * @returns {string} Formatted cost string (e.g., "$1.23")
 */
export const formatCost = (cost) => `$${cost.toFixed(2)}`;

/**
 * Formats token count with K/M suffix for readability.
 * @param {number} tokens - The token count
 * @returns {string} Formatted token string (e.g., "1.5M", "500K", "999")
 */
export const formatTokens = (tokens) => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
};

/**
 * Formats ISO date string to local time display (e.g., "Jan 20, 20:00").
 * @param {string|null} isoString - The ISO date string
 * @returns {string} Formatted date string
 */
export const formatResetTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // Check for Invalid Date
    if (isNaN(date.getTime())) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}`;
  } catch (e) {
    return "";
  }
};

/**
 * Returns color based on utilization percentage.
 * @param {number} utilization - The utilization percentage (0-100)
 * @returns {string} Color hex code
 */
export const getUsageColor = (utilization) => {
  if (utilization >= 80) return "#dc2626"; // Red
  if (utilization >= 50) return "#f59e0b"; // Yellow/Orange
  return "#22c55e"; // Green
};

/**
 * Formats session ID to short form (first 8 characters).
 * @param {string|null} id - The session ID
 * @returns {string} Short session ID
 */
export const formatSessionId = (id) => {
  if (!id) return "";
  return id.substring(0, 8);
};

/**
 * Returns review status info with label, text color, background color, and border color.
 * @param {string|null} reviewDecision - The review decision from GitHub API
 * @returns {{label: string, textColor: string, bgColor: string, borderColor: string}|null} Status info or null
 */
export const getReviewStatus = (reviewDecision) => {
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
 * Returns CI status info with label, colors.
 * @param {string|null} ciStatus - The CI status from GitHub API
 * @returns {{label: string, textColor: string, bgColor: string, borderColor: string}} Status info
 */
export const getCIStatus = (ciStatus) => {
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
