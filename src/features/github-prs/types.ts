/**
 * GitHub Pull Request types
 */

export type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED";

export type CIStatus = "SUCCESS" | "FAILURE" | "PENDING";

export interface Repository {
  nameWithOwner: string;
  name: string;
}

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  reviewDecision: ReviewDecision | null;
  ciStatus: CIStatus | null;
  commentCount: number;
  repository: Repository;
}

export interface ReviewerPullRequest extends PullRequest {
  author: string;
  createdAt: string;
}
