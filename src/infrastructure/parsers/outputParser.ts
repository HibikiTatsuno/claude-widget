/**
 * Command output parser
 */

import { DELIMITERS } from "../shell/commands";
import type { DailyUsage, UsageTotals, UsageLimits } from "../../features/usage-stats/types";
import type { Session } from "../../features/sessions/types";
import type { PullRequest, ReviewerPullRequest, CIStatus, ReviewDecision } from "../../features/github-prs/types";
import type { ContributionData } from "../../features/github-activity/types";

/**
 * Parsed widget data from command output
 */
export interface ParsedWidgetData {
  usage: {
    daily: DailyUsage[];
    totals: UsageTotals;
  };
  sessions: {
    active: Session[];
    completed: Session[];
  };
  isHidden: boolean;
  githubPRs: PullRequest[];
  reviewerPRs: ReviewerPullRequest[];
  contributions: ContributionData;
  usageLimits: UsageLimits;
}

/**
 * Default values for parsed data
 */
const defaultData: ParsedWidgetData = {
  usage: {
    daily: [],
    totals: { totalCost: 0, totalTokens: 0 },
  },
  sessions: {
    active: [],
    completed: [],
  },
  isHidden: false,
  githubPRs: [],
  reviewerPRs: [],
  contributions: {
    monthly: [],
    weekly: { commits: 0, prs: 0, welselfCommits: 0, personalCommits: 0, welselfPRs: 0, personalPRs: 0 },
    updatedAt: "",
  },
  usageLimits: {
    fiveHour: { utilization: 0, resetsAt: null },
    sevenDay: { utilization: 0, resetsAt: null },
    sevenDaySonnet: { utilization: 0, resetsAt: null },
  },
};

/**
 * Parses the command output into structured data
 * @param output - Raw command output string
 * @returns Parsed widget data
 */
export function parseCommandOutput(output: string): ParsedWidgetData {
  const result: ParsedWidgetData = JSON.parse(JSON.stringify(defaultData));

  // Split output by delimiters
  const hiddenSplit = output.split(DELIMITERS.HIDDEN);
  const jsonPart = hiddenSplit[0].trim();
  const afterHidden = hiddenSplit[1] || "";

  const githubSplit = afterHidden.split(DELIMITERS.GITHUB);
  const hiddenPart = githubSplit[0].trim();
  const afterGithub = githubSplit[1] || "";

  const contributionsSplit = afterGithub.split(DELIMITERS.CONTRIBUTIONS);
  const githubPart = contributionsSplit[0]?.trim() || "{}";
  const afterContributions = contributionsSplit[1] || "";

  const reviewerSplit = afterContributions.split(DELIMITERS.REVIEWER_PRS);
  const contributionsPart = reviewerSplit[0]?.trim() || "{}";
  const afterReviewer = reviewerSplit[1] || "";

  const claudeUsageSplit = afterReviewer.split(DELIMITERS.CLAUDE_USAGE);
  const reviewerPart = claudeUsageSplit[0]?.trim() || "{}";
  const claudeUsagePart = claudeUsageSplit[1]?.trim() || "{}";

  // Parse hidden state
  result.isHidden = hiddenPart === "true";

  // Parse usage data
  try {
    const parsed = JSON.parse(jsonPart);
    if (parsed.daily && Array.isArray(parsed.daily)) {
      result.usage.daily = parsed.daily;
      result.usage.totals = parsed.totals || result.usage.totals;
    }
    if (parsed.activeSessions && Array.isArray(parsed.activeSessions)) {
      result.sessions.active = parsed.activeSessions;
    }
    if (parsed.completedSessions && Array.isArray(parsed.completedSessions)) {
      result.sessions.completed = parsed.completedSessions;
    }
  } catch {
    // JSON parse failed, use defaults
  }

  // Parse GitHub PRs
  result.githubPRs = parseGitHubPRs(githubPart);

  // Parse contributions
  result.contributions = parseContributions(contributionsPart);

  // Parse reviewer PRs
  result.reviewerPRs = parseReviewerPRs(reviewerPart);

  // Parse Claude usage limits
  result.usageLimits = parseUsageLimits(claudeUsagePart);

  return result;
}

/**
 * Parses GitHub PR GraphQL response
 */
function parseGitHubPRs(jsonString: string): PullRequest[] {
  try {
    const response = JSON.parse(jsonString);
    if (!response.data?.search?.edges) return [];

    return response.data.search.edges.map((edge: any) => {
      const node = edge.node;
      const repo = node.repository || {};
      const nameWithOwner = repo.nameWithOwner || "";
      const comments = node.comments || {};
      const commits = node.commits || {};
      const lastCommit = commits.nodes?.[0] || {};
      const statusCheckRollup = lastCommit.commit?.statusCheckRollup || {};

      return {
        number: node.number,
        title: node.title,
        url: node.url,
        reviewDecision: node.reviewDecision as ReviewDecision | null,
        commentCount: comments.totalCount || 0,
        ciStatus: (statusCheckRollup.state as CIStatus) || null,
        repository: {
          nameWithOwner,
          name: nameWithOwner ? nameWithOwner.split("/")[1] : "",
        },
      };
    });
  } catch {
    return [];
  }
}

/**
 * Parses contributions data
 */
function parseContributions(jsonString: string): ContributionData {
  const defaultContributions: ContributionData = {
    monthly: [],
    weekly: { commits: 0, prs: 0, welselfCommits: 0, personalCommits: 0, welselfPRs: 0, personalPRs: 0 },
    updatedAt: "",
  };

  try {
    const response = JSON.parse(jsonString);
    return {
      monthly: response.monthly || [],
      weekly: response.weekly || defaultContributions.weekly,
      updatedAt: response.updatedAt || "",
    };
  } catch {
    return defaultContributions;
  }
}

/**
 * Parses reviewer PRs data
 */
function parseReviewerPRs(jsonString: string): ReviewerPullRequest[] {
  try {
    const response = JSON.parse(jsonString);
    if (!response.data?.search?.edges) return [];

    return response.data.search.edges.map((edge: any) => {
      const node = edge.node;
      const repo = node.repository || {};
      const nameWithOwner = repo.nameWithOwner || "";
      const comments = node.comments || {};
      const commits = node.commits || {};
      const lastCommit = commits.nodes?.[0] || {};
      const statusCheckRollup = lastCommit.commit?.statusCheckRollup || {};
      const author = node.author || {};

      return {
        number: node.number,
        title: node.title,
        url: node.url,
        author: author.login || "unknown",
        reviewDecision: node.reviewDecision as ReviewDecision | null,
        commentCount: comments.totalCount || 0,
        ciStatus: (statusCheckRollup.state as CIStatus) || null,
        repository: {
          nameWithOwner,
          name: nameWithOwner ? nameWithOwner.split("/")[1] : "",
        },
        createdAt: node.createdAt || "",
      };
    });
  } catch {
    return [];
  }
}

/**
 * Parses Claude usage limits data
 */
function parseUsageLimits(jsonString: string): UsageLimits {
  const defaults: UsageLimits = {
    fiveHour: { utilization: 0, resetsAt: null },
    sevenDay: { utilization: 0, resetsAt: null },
    sevenDaySonnet: { utilization: 0, resetsAt: null },
  };

  try {
    const response = JSON.parse(jsonString);
    return {
      fiveHour: {
        utilization: response.five_hour?.utilization || 0,
        resetsAt: response.five_hour?.resets_at || null,
      },
      sevenDay: {
        utilization: response.seven_day?.utilization || 0,
        resetsAt: response.seven_day?.resets_at || null,
      },
      sevenDaySonnet: {
        utilization: response.seven_day_sonnet?.utilization || 0,
        resetsAt: response.seven_day_sonnet?.resets_at || null,
      },
    };
  } catch {
    return defaults;
  }
}
