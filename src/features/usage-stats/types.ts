/**
 * Usage statistics types
 */

export interface DailyUsage {
  date: string;
  totalCost: number;
  totalTokens: number;
}

export interface UsageTotals {
  totalCost: number;
  totalTokens: number;
}

export interface UsageLimit {
  utilization: number;
  resetsAt: string | null;
}

export interface UsageLimits {
  fiveHour: UsageLimit;
  sevenDay: UsageLimit;
  sevenDaySonnet: UsageLimit;
}

export interface UsageData {
  daily: DailyUsage[];
  totals: UsageTotals;
  limits: UsageLimits;
}
