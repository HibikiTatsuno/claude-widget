/**
 * Claude Code Usage Widget for Übersicht
 * Main entry point - exports command, className, render
 */

import { run } from "uebersicht";

// Infrastructure
import { WIDGET_COMMAND, createGhosttyCommand } from "./infrastructure/shell/commands";
import { parseCommandOutput } from "./infrastructure/parsers/outputParser";

// Shared utilities and styles
import { formatCost, formatTokens, formatResetTime, formatSessionId } from "./shared/utils/formatters";
import {
  widgetContainerStyle,
  cardStyle,
  sectionTitleStyle,
  closeButtonStyle,
  minimizedButtonStyle,
} from "./shared/styles/glassmorphism";
import { colors, spacing, borderRadius, fontSize, fontWeight } from "./shared/styles/tokens";

// Feature utilities
import { getUsageColor, getBarColor } from "./features/usage-stats/utils/colors";
import { getReviewStatus, getCIStatus } from "./features/github-prs/utils/statusMappers";

// Types
import type { CommandOutput } from "./shared/types";
import type { PullRequest, ReviewerPullRequest } from "./features/github-prs/types";

// ============================================================================
// Widget Actions
// ============================================================================

const openSessionInGhostty = (sessionId: string, cwd: string) => {
  const script = createGhosttyCommand(cwd, sessionId);
  run(script).catch((err: Error) => {
    console.error("Failed to open session in Ghostty:", err);
  });
};

const hideWidget = () => {
  run("touch ~/.claude/cache/widget-hidden.flag").catch((err: Error) => {
    console.error("Failed to hide widget:", err);
  });
};

const showWidget = () => {
  run("rm -f ~/.claude/cache/widget-hidden.flag").catch((err: Error) => {
    console.error("Failed to show widget:", err);
  });
};

const openInBrowser = (url: string) => {
  run(`open "${url}"`).catch((err: Error) => {
    console.error("Failed to open URL:", err);
  });
};

// ============================================================================
// Übersicht Exports
// ============================================================================

export const command = WIDGET_COMMAND;
export const refreshFrequency = 10000;
export const className = widgetContainerStyle;

// ============================================================================
// Styles
// ============================================================================

const titleStyle = {
  margin: "0 0 16px 0",
  fontSize: fontSize.xxxl,
  fontWeight: fontWeight.semibold,
  color: colors.textPrimary,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const costDisplayStyle = { textAlign: "center" as const, marginBottom: spacing.md };
const costValueStyle = { fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: "-1px" };
const costLabelStyle = { fontSize: fontSize.md, color: colors.textMuted, fontWeight: fontWeight.medium };

const chartWrapperStyle = { padding: "12px 8px 8px 8px", marginBottom: spacing.lg, background: colors.bgWhite, borderRadius: borderRadius.lg, border: "1px solid rgba(255, 255, 255, 0.7)" };
const chartContainerStyle = { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "100px" };
const barContainerStyle = { display: "flex", flexDirection: "column" as const, alignItems: "center", flex: 1, minWidth: "8px" };
const barLabelStyle = { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs, fontWeight: fontWeight.medium };
const barCostLabelStyle = { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: fontWeight.semibold, marginBottom: "2px", whiteSpace: "nowrap" as const };

const statsContainerStyle = { ...cardStyle };
const statRowStyle = { display: "flex", justifyContent: "space-between", marginBottom: spacing.md };
const statLabelStyle = { color: colors.textSecondary, fontSize: fontSize.xl, fontWeight: fontWeight.medium };
const statValueStyle = { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.semibold };
const highlightValueStyle = { color: colors.textPrimary, fontSize: "15px", fontWeight: fontWeight.bold };

const sessionsSectionStyle = { marginTop: spacing.lg, ...cardStyle };
const sessionsTitleStyle = { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md, display: "flex", alignItems: "center", gap: spacing.sm };
const sessionItemStyle = { display: "flex", alignItems: "flex-start", padding: "6px 0", borderBottom: `1px solid ${colors.bgDivider}`, fontSize: fontSize.md };
const sessionContentStyle = { flex: 1, minWidth: 0, overflow: "hidden" };
const sessionIconStyle = { marginRight: spacing.sm, fontSize: fontSize.lg };
const sessionNameStyle = { color: colors.textPrimary, fontWeight: fontWeight.medium, fontSize: fontSize.md, marginBottom: "2px" };
const sessionDisplayStyle = { color: colors.textMuted, fontSize: fontSize.sm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "200px" };
const sessionIdButtonStyle = { color: colors.primary, fontSize: fontSize.sm, fontFamily: "SF Mono, Monaco, monospace", flexShrink: 0, cursor: "pointer", padding: "3px 6px", borderRadius: borderRadius.sm, border: "1px solid rgba(37, 99, 235, 0.3)", background: "rgba(37, 99, 235, 0.1)", pointerEvents: "auto" as const };

const mainContainerStyle = { display: "flex", flexDirection: "column" as const, gap: spacing.lg, height: "100%" };
const leftColumnStyle = { display: "flex", flexDirection: "column" as const, overflow: "hidden" };
const rightColumnStyle = { display: "flex", flexDirection: "column" as const, overflow: "hidden", gap: spacing.lg };

const prPanelStyle = { ...cardStyle, maxHeight: "280px", overflowY: "auto" as const, overflowX: "hidden" as const };
const prTitleStyle = { ...sectionTitleStyle, marginBottom: spacing.lg };
const prItemStyle = { padding: "8px 0", borderBottom: `1px solid ${colors.bgDivider}` };
const prRepoStyle = { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.primary, cursor: "pointer", pointerEvents: "auto" as const, marginBottom: spacing.xs, display: "inline-block" };
const prTitleLinkStyle = { fontSize: fontSize.md, color: colors.textPrimary, cursor: "pointer", pointerEvents: "auto" as const, display: "flex", alignItems: "center", gap: spacing.sm };
const prNumberStyle = { color: colors.textMuted, fontSize: fontSize.md, fontWeight: fontWeight.medium };
const prEmptyStyle = { color: colors.textDisabled, fontStyle: "italic", textAlign: "center" as const, marginTop: spacing.xxxl, fontSize: fontSize.lg };

const emptyStyle = { color: colors.textDisabled, fontStyle: "italic", textAlign: "center" as const, marginTop: "60px" };

// ============================================================================
// Render
// ============================================================================

export const render = ({ output }: CommandOutput) => {
  const data = parseCommandOutput(output);

  // Minimized state
  if (data.isHidden) {
    return (
      <div style={minimizedButtonStyle} onClick={showWidget} title="Show Claude Code Widget">
        <span style={{ fontSize: "18px", color: colors.primary }}>C</span>
      </div>
    );
  }

  const { daily, totals } = data.usage;
  const { active: activeSessions, completed: completedSessions } = data.sessions;
  const { githubPRs, reviewerPRs, contributions, usageLimits } = data;

  // Calculate display values
  const last7Days = daily.slice(-7);
  const last7DaysCost = last7Days.reduce((sum, d) => sum + (d.totalCost || 0), 0);
  const maxCost = Math.max(...daily.map((d) => d.totalCost || 0), 1);
  const todayCost = daily.length > 0 ? daily[daily.length - 1].totalCost || 0 : 0;

  const getRepoUrl = (pr: PullRequest | ReviewerPullRequest): string => {
    if (pr.repository?.nameWithOwner) {
      return `https://github.com/${pr.repository.nameWithOwner}`;
    }
    if (pr.url) {
      const match = pr.url.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)/);
      if (match) return match[1];
    }
    return "#";
  };

  const getRepoName = (pr: PullRequest | ReviewerPullRequest): string => {
    return pr.repository?.nameWithOwner || pr.repository?.name || "Unknown";
  };

  return (
    <div>
      <h3 style={titleStyle}>
        Claude Dashboard
        <button style={closeButtonStyle} onClick={hideWidget} title="Hide Widget">x</button>
      </h3>

      <div style={mainContainerStyle}>
        {/* Left Column: Claude Code Usage */}
        <div style={leftColumnStyle}>
          {daily.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg, flex: 1, overflow: "hidden" }}>
              {/* Usage Limits */}
              <div style={{ padding: spacing.lg, background: colors.bgWhite, borderRadius: borderRadius.lg, border: "1px solid rgba(255, 255, 255, 0.7)" }}>
                <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: "10px" }}>Usage Limits</div>
                {/* Weekly All Models */}
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                    <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>Week</span>
                    <span style={{ fontSize: fontSize.md, color: colors.textMuted }}>
                      {usageLimits.sevenDay.utilization}% {usageLimits.sevenDay.resetsAt && `- ${formatResetTime(usageLimits.sevenDay.resetsAt)}`}
                    </span>
                  </div>
                  <div style={{ height: "6px", background: colors.bgOverlay, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(usageLimits.sevenDay.utilization, 100)}%`, height: "100%", background: getUsageColor(usageLimits.sevenDay.utilization), borderRadius: "3px", transition: "width 0.3s ease" }} />
                  </div>
                </div>
                {/* Weekly Sonnet */}
                {usageLimits.sevenDaySonnet.resetsAt && (
                  <div style={{ marginBottom: spacing.md }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                      <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>Week (Sonnet)</span>
                      <span style={{ fontSize: fontSize.md, color: colors.textMuted }}>
                        {usageLimits.sevenDaySonnet.utilization}% - {formatResetTime(usageLimits.sevenDaySonnet.resetsAt)}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: colors.bgOverlay, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(usageLimits.sevenDaySonnet.utilization, 100)}%`, height: "100%", background: getUsageColor(usageLimits.sevenDaySonnet.utilization), borderRadius: "3px", transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                )}
                {/* 5-Hour Session */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                    <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>Session (5h)</span>
                    <span style={{ fontSize: fontSize.md, color: colors.textMuted }}>
                      {usageLimits.fiveHour.utilization}% {usageLimits.fiveHour.resetsAt && `- ${formatResetTime(usageLimits.fiveHour.resetsAt)}`}
                    </span>
                  </div>
                  <div style={{ height: "6px", background: colors.bgOverlay, borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(usageLimits.fiveHour.utilization, 100)}%`, height: "100%", background: getUsageColor(usageLimits.fiveHour.utilization), borderRadius: "3px", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={chartWrapperStyle}>
                <div style={costDisplayStyle}>
                  <div style={costValueStyle}>{formatCost(totals.totalCost || 0)}</div>
                  <div style={costLabelStyle}>30 Day Total</div>
                </div>
                <div style={chartContainerStyle}>
                  {daily.map((day, index) => {
                    const height = Math.max((day.totalCost / maxCost) * 100, 3);
                    const date = new Date(day.date);
                    const isRecent = index >= daily.length - 7;
                    const showLabel = index % 5 === 0 || index === daily.length - 1;
                    return (
                      <div key={index} style={barContainerStyle}>
                        {isRecent && <span style={barCostLabelStyle}>${day.totalCost.toFixed(0)}</span>}
                        <div style={{ width: "7px", height: `${height}px`, background: getBarColor(day.totalCost, maxCost, isRecent), borderRadius: "4px 4px 0 0", opacity: isRecent ? 1 : 0.4 }} title={`${day.date}: ${formatCost(day.totalCost)}`} />
                        {showLabel && <span style={barLabelStyle}>{date.getDate()}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div style={statsContainerStyle}>
                <div style={statRowStyle}><span style={statLabelStyle}>30 Day Total</span><span style={highlightValueStyle}>{formatCost(totals.totalCost || 0)}</span></div>
                <div style={statRowStyle}><span style={statLabelStyle}>7 Day Total</span><span style={statValueStyle}>{formatCost(last7DaysCost)}</span></div>
                <div style={statRowStyle}><span style={statLabelStyle}>Today</span><span style={statValueStyle}>{formatCost(todayCost)}</span></div>
                <div style={{ ...statRowStyle, marginBottom: 0 }}><span style={statLabelStyle}>Total Tokens</span><span style={statValueStyle}>{formatTokens(totals.totalTokens || 0)}</span></div>
              </div>

              {/* Sessions */}
              <div style={{ ...sessionsSectionStyle, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={sessionsTitleStyle}>Active ({activeSessions.length})</div>
                <div style={{ maxHeight: "80px", overflowY: "auto", overflowX: "hidden" }}>
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session, index) => (
                      <div key={`active-${index}`} style={{ ...sessionItemStyle, borderBottom: index === activeSessions.length - 1 && completedSessions.length === 0 ? "none" : sessionItemStyle.borderBottom }}>
                        <span style={{ ...sessionIconStyle, color: colors.sessionActive, marginTop: "2px" }}>●</span>
                        <div style={sessionContentStyle}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                              <span style={sessionNameStyle}>{session.name}</span>
                              {session.needsInput && <span style={{ fontSize: fontSize.xl, color: colors.sessionNeedsInput }}>🔔</span>}
                            </span>
                            <button style={sessionIdButtonStyle} onClick={() => openSessionInGhostty(session.sessionId, session.cwd)} title={`Open in Ghostty: ${session.cwd}`}>
                              {formatSessionId(session.sessionId)}
                            </button>
                          </div>
                          {session.display && <div style={sessionDisplayStyle}>{session.display}</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: colors.textDisabled, fontSize: fontSize.md, marginBottom: spacing.md }}>No active sessions</div>
                  )}
                </div>

                {completedSessions.length > 0 && (
                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ ...sessionsTitleStyle, marginTop: "10px", color: colors.textMuted }}>Recent ({completedSessions.length})</div>
                    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                      {completedSessions.map((session, index) => (
                        <div key={`completed-${index}`} style={{ ...sessionItemStyle, borderBottom: index === completedSessions.length - 1 ? "none" : sessionItemStyle.borderBottom }}>
                          <span style={{ ...sessionIconStyle, color: colors.sessionInactive, marginTop: "2px" }}>{"\u25CB"}</span>
                          <div style={sessionContentStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ ...sessionNameStyle, color: colors.textSecondary }}>{session.name}</span>
                              <button style={sessionIdButtonStyle} onClick={() => openSessionInGhostty(session.sessionId, session.cwd)} title={`Open in Ghostty: ${session.cwd}`}>
                                {formatSessionId(session.sessionId)}
                              </button>
                            </div>
                            {session.display && <div style={{ ...sessionDisplayStyle, color: colors.textDisabled }}>{session.display}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={emptyStyle}>No usage data available</p>
          )}
        </div>

        {/* Right Column: GitHub */}
        <div style={rightColumnStyle}>
          {/* My PRs */}
          <div style={prPanelStyle}>
            <div style={prTitleStyle}>GitHub PRs ({githubPRs.length})</div>
            {githubPRs.length > 0 ? (
              <div style={{ overflowY: "auto", overflowX: "hidden" }}>
                {githubPRs.map((pr, index) => {
                  const reviewStatus = getReviewStatus(pr.reviewDecision);
                  const ciStatus = getCIStatus(pr.ciStatus);
                  return (
                    <div key={`pr-${pr.number}-${index}`} style={{ ...prItemStyle, borderBottom: index === githubPRs.length - 1 ? "none" : prItemStyle.borderBottom }}>
                      <div style={prRepoStyle} onClick={() => openInBrowser(getRepoUrl(pr))} title={`Open repository: ${getRepoName(pr)}`}>{getRepoName(pr)}</div>
                      <div style={prTitleLinkStyle} onClick={() => openInBrowser(pr.url)} title={`Open PR: ${pr.title}`}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.title}</span>
                        <span style={prNumberStyle}>#{pr.number}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                        {reviewStatus && (
                          <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: reviewStatus.bgColor, color: reviewStatus.textColor, border: `1px solid ${reviewStatus.borderColor}` }}>
                            {reviewStatus.label}
                          </div>
                        )}
                        <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: ciStatus.bgColor, color: ciStatus.textColor, border: `1px solid ${ciStatus.borderColor}` }}>
                          {ciStatus.label}
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" }}>
                          <span>{"\uD83D\uDCAC"}</span><span>{pr.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={prEmptyStyle}>No open pull requests</div>
            )}
          </div>

          {/* Review Requests */}
          <div style={prPanelStyle}>
            <div style={prTitleStyle}>Review Requests ({reviewerPRs.length})</div>
            {reviewerPRs.length > 0 ? (
              <div style={{ overflowY: "auto", overflowX: "hidden" }}>
                {reviewerPRs.map((pr, index) => {
                  const ciStatus = getCIStatus(pr.ciStatus);
                  return (
                    <div key={`reviewer-pr-${pr.number}-${index}`} style={{ ...prItemStyle, borderBottom: index === reviewerPRs.length - 1 ? "none" : prItemStyle.borderBottom }}>
                      <div style={prRepoStyle} onClick={() => openInBrowser(getRepoUrl(pr))} title={`Open repository: ${getRepoName(pr)}`}>{getRepoName(pr)}</div>
                      <div style={prTitleLinkStyle} onClick={() => openInBrowser(pr.url)} title={`Open PR: ${pr.title}`}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.title}</span>
                        <span style={prNumberStyle}>#{pr.number}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs, flexWrap: "wrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}>@{pr.author}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: ciStatus.bgColor, color: ciStatus.textColor, border: `1px solid ${ciStatus.borderColor}` }}>{ciStatus.label}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs, padding: "2px 8px", borderRadius: borderRadius.md, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" }}>
                          <span>{"\uD83D\uDCAC"}</span><span>{pr.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={prEmptyStyle}>No review requests</div>
            )}
          </div>

          {/* GitHub Activity */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: "10px" }}>GitHub Activity</div>
            {/* This Week Stats */}
            <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg }}>
              <div style={{ flex: 1, padding: "10px", borderRadius: borderRadius.md, background: "linear-gradient(135deg, #dbeafe, #bfdbfe)", textAlign: "center" }}>
                <div style={{ fontSize: "8px", color: "#1e40af", marginBottom: "2px", fontWeight: fontWeight.medium }}>This Week</div>
                <div style={{ fontSize: "20px", fontWeight: fontWeight.bold, color: "#1e40af" }}>{contributions.weekly.commits}</div>
                <div style={{ fontSize: fontSize.sm, color: "#3b82f6" }}>commits</div>
              </div>
              <div style={{ flex: 1, padding: "10px", borderRadius: borderRadius.md, background: "linear-gradient(135deg, #fef3c7, #fde68a)", textAlign: "center" }}>
                <div style={{ fontSize: "8px", color: "#92400e", marginBottom: "2px", fontWeight: fontWeight.medium }}>This Week</div>
                <div style={{ fontSize: "20px", fontWeight: fontWeight.bold, color: "#92400e" }}>{contributions.weekly.prs}</div>
                <div style={{ fontSize: fontSize.sm, color: "#d97706" }}>PRs</div>
              </div>
            </div>
            {/* Monthly Chart Header */}
            <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: fontWeight.medium }}>Past 6 Months</div>
            {/* Monthly Bar Chart */}
            <div style={{ display: "flex", alignItems: "flex-end", height: "70px", gap: spacing.xs, marginBottom: "2px" }}>
              {contributions.monthly.map((m) => {
                const maxCommits = Math.max(...contributions.monthly.map((x) => x.welselfCommits + x.personalCommits), 1);
                const maxPRs = Math.max(...contributions.monthly.map((x) => x.welselfPRs + x.personalPRs), 1);
                const maxValue = Math.max(maxCommits, maxPRs);
                const totalCommits = m.welselfCommits + m.personalCommits;
                const totalPRs = m.welselfPRs + m.personalPRs;
                const commitHeight = (totalCommits / maxValue) * 100;
                const prHeight = (totalPRs / maxValue) * 100;
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ display: "flex", gap: "1px", marginBottom: "2px", fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                      <span style={{ color: "#3b82f6" }}>{totalCommits}</span>
                      <span style={{ color: "#999" }}>/</span>
                      <span style={{ color: "#f59e0b" }}>{totalPRs}</span>
                    </div>
                    <div style={{ display: "flex", gap: "1px", alignItems: "flex-end", flex: 1 }}>
                      <div style={{ width: "10px", height: `${Math.max(commitHeight, 3)}%`, background: "linear-gradient(180deg, #3b82f6, #60a5fa)", borderRadius: "2px 2px 0 0" }} title={`Commits: ${totalCommits}`} />
                      <div style={{ width: "10px", height: `${Math.max(prHeight, 3)}%`, background: "linear-gradient(180deg, #f59e0b, #fbbf24)", borderRadius: "2px 2px 0 0" }} title={`PRs: ${totalPRs}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Month Labels */}
            <div style={{ display: "flex", gap: spacing.xs }}>
              {contributions.monthly.map((m) => (
                <div key={m.month} style={{ flex: 1, textAlign: "center", fontSize: "8px", color: colors.textMuted }}>{m.month.slice(5)}</div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: spacing.lg, marginTop: spacing.md, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#3b82f6" }} />
                <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Commits</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#f59e0b" }} />
                <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>PRs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
