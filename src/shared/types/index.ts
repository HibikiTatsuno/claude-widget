/**
 * Common types used across features
 */

/**
 * Status badge configuration
 */
export interface StatusBadge {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Widget visibility state
 */
export type WidgetVisibility = "visible" | "hidden";

/**
 * Command output from Übersicht
 */
export interface CommandOutput {
  output: string;
}
