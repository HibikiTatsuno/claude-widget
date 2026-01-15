/**
 * Design tokens for consistent styling
 */

export const colors = {
  // Primary
  primary: "#2563eb",
  primaryLight: "#60a5fa",

  // Text
  textPrimary: "#1a1a1a",
  textSecondary: "#555555",
  textMuted: "#666666",
  textDisabled: "#888888",

  // Status - Usage
  usageGreen: "#22c55e",
  usageYellow: "#f59e0b",
  usageRed: "#dc2626",

  // Status - Session
  sessionActive: "#22c55e",
  sessionInactive: "#888888",
  sessionNeedsInput: "#f59e0b",

  // Background
  bgWhite: "rgba(255, 255, 255, 0.5)",
  bgWhiteHover: "rgba(255, 255, 255, 0.7)",
  bgDivider: "rgba(0, 0, 0, 0.05)",
  bgOverlay: "rgba(0, 0, 0, 0.1)",

  // Chart
  chartBar: "#60a5fa",
  chartBarActive: "#2563eb",
  chartBarHigh: "#dc2626",
  chartBarMedium: "#ea580c",
} as const;

export const spacing = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "14px",
  xxl: "16px",
  xxxl: "20px",
} as const;

export const borderRadius = {
  sm: "4px",
  md: "10px",
  lg: "16px",
  xl: "28px",
  full: "50%",
} as const;

export const fontSize = {
  xs: "7px",
  sm: "9px",
  md: "10px",
  lg: "11px",
  xl: "12px",
  xxl: "14px",
  xxxl: "16px",
  display: "28px",
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;
