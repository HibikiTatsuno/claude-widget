/**
 * Usage color utilities
 */

import { colors } from "../../../shared/styles/tokens";

/**
 * Returns color based on utilization percentage.
 * @param utilization - The utilization percentage (0-100)
 * @returns Color hex code
 */
export const getUsageColor = (utilization: number): string => {
  if (utilization >= 80) return colors.usageRed;
  if (utilization >= 50) return colors.usageYellow;
  return colors.usageGreen;
};

/**
 * Returns bar color based on cost ratio and recency.
 * @param cost - The cost value
 * @param maxCost - Maximum cost for ratio calculation
 * @param isRecent - Whether this is a recent data point
 * @returns Color hex code
 */
export const getBarColor = (cost: number, maxCost: number, isRecent: boolean): string => {
  const ratio = cost / maxCost;
  if (ratio > 0.8) return colors.chartBarHigh;
  if (ratio > 0.5) return colors.chartBarMedium;
  if (isRecent) return colors.chartBarActive;
  return colors.chartBar;
};
