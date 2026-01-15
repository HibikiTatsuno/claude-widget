/**
 * GitHub Activity types
 */

export interface MonthlyActivity {
  month: string;
  welselfCommits: number;
  personalCommits: number;
  welselfPRs: number;
  personalPRs: number;
}

export interface WeeklyActivity {
  commits: number;
  prs: number;
  welselfCommits: number;
  personalCommits: number;
  welselfPRs: number;
  personalPRs: number;
}

export interface ContributionData {
  monthly: MonthlyActivity[];
  weekly: WeeklyActivity;
  updatedAt: string;
}
