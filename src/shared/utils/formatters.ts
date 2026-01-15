/**
 * Formatting utilities for display values
 */

/**
 * Formats a cost value to currency string.
 * @param cost - The cost value
 * @returns Formatted cost string (e.g., "$1.23")
 */
export const formatCost = (cost: number): string => `$${cost.toFixed(2)}`;

/**
 * Formats token count with K/M suffix for readability.
 * @param tokens - The token count
 * @returns Formatted token string (e.g., "1.5M", "500K", "999")
 */
export const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
};

/**
 * Formats ISO date string to local time display.
 * @param isoString - The ISO date string
 * @returns Formatted date string (e.g., "Jan 20, 20:00" or "20:00" for today)
 */
export const formatResetTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes}`;
  } catch {
    return "";
  }
};

/**
 * Formats session ID to short form (first 8 characters).
 * @param id - The session ID
 * @returns Short session ID
 */
export const formatSessionId = (id: string | null | undefined): string => {
  if (!id) return "";
  return id.substring(0, 8);
};
