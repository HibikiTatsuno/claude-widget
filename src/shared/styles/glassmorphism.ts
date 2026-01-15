/**
 * Apple Liquid Glass design styles
 */

import { borderRadius, colors, fontSize, fontWeight, spacing } from "./tokens";

/**
 * Main widget container style
 */
export const widgetContainerStyle = `
  bottom: 20px;
  left: 20px;
  width: 320px;
  height: 70%;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(245, 245, 250, 0.6) 100%
  );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: ${borderRadius.xl};
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.7);
  padding: ${spacing.xxxl};
  color: ${colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: ${fontSize.xl};
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow-y: auto;
  overflow-x: hidden;
`;

/**
 * Card/panel style with glass effect
 */
export const cardStyle = {
  padding: spacing.xl,
  background: colors.bgWhite,
  borderRadius: borderRadius.lg,
  border: "1px solid rgba(255, 255, 255, 0.7)",
} as const;

/**
 * Section title style
 */
export const sectionTitleStyle = {
  fontSize: fontSize.xxl,
  fontWeight: fontWeight.semibold,
  color: colors.textPrimary,
  marginBottom: spacing.lg,
  display: "flex",
  alignItems: "center",
  gap: spacing.md,
} as const;

/**
 * Close button style
 */
export const closeButtonStyle = {
  marginLeft: "auto",
  background: colors.bgOverlay,
  border: "none",
  borderRadius: borderRadius.full,
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: colors.textMuted,
  fontSize: fontSize.xxl,
  fontWeight: fontWeight.semibold,
  pointerEvents: "auto" as const,
} as const;

/**
 * Minimized widget button style
 */
export const minimizedButtonStyle = {
  width: "40px",
  height: "40px",
  background: "linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 250, 0.7) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: borderRadius.full,
  border: "1px solid rgba(255, 255, 255, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  pointerEvents: "auto" as const,
} as const;
