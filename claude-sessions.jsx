// Claude Code Usage Widget for Übersicht
// Displays 30-day usage data with Apple Liquid Glass design

import { run } from "uebersicht";

// Read from cache file (updated periodically by launchd)
// Also check hidden flag file to persist hide/show state
// Fetch GitHub PRs using gh CLI
export const command = `cat ~/.claude/cache/usage-30d.json 2>/dev/null || echo '{}'; echo "---HIDDEN---"; [ -f ~/.claude/cache/widget-hidden.flag ] && echo "true" || echo "false"; echo "---GITHUB---"; /opt/homebrew/bin/gh api graphql -f query='query { search(query: "is:open is:pr author:@me", type: ISSUE, first: 20) { edges { node { ... on PullRequest { number title url reviewDecision comments { totalCount } commits(last: 1) { nodes { commit { statusCheckRollup { state } } } } repository { nameWithOwner } } } } } }' 2>/dev/null || echo '{}'; echo "---CONTRIBUTIONS---"; FROM_DATE=$(date -v-30d -u +"%Y-%m-%dT00:00:00Z"); TO_DATE=$(date -u +"%Y-%m-%dT23:59:59Z"); /opt/homebrew/bin/gh api graphql -f query="query { viewer { contributionsCollection(from: \\"$FROM_DATE\\", to: \\"$TO_DATE\\") { totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }" 2>/dev/null || echo '{}'`;

/**
 * Opens a new Ghostty terminal, navigates to the session directory, and resumes the Claude session.
 * @param {string} sessionId - The session ID to resume
 * @param {string} cwd - The working directory for the session
 */
const openSessionInGhostty = (sessionId, cwd) => {
  // cwdのエスケープ処理（シングルクォート内で使うためにシングルクォートをエスケープ）
  const escapedCwd = cwd.replace(/'/g, "'\"'\"'");
  const escapedSessionId = sessionId.replace(/'/g, "'\"'\"'");

  // AppleScriptを使ってGhosttyを開き、コマンドを実行
  const script = `
osascript -e '
tell application "Ghostty"
  activate
end tell
delay 0.1
tell application "System Events"
  tell process "Ghostty"
    keystroke "n" using command down
  end tell
end tell
delay 0.3
tell application "System Events"
  keystroke "cd '"'"'${escapedCwd}'"'"' && claude --resume ${escapedSessionId}"
  keystroke return
end tell
'
  `.trim();

  run(script).catch((err) => {
    console.error("Failed to open session in Ghostty:", err);
  });
};

/**
 * Hides the widget by creating a flag file.
 */
const hideWidget = () => {
  run("touch ~/.claude/cache/widget-hidden.flag").catch((err) => {
    console.error("Failed to hide widget:", err);
  });
};

/**
 * Shows the widget by removing the flag file.
 */
const showWidget = () => {
  run("rm -f ~/.claude/cache/widget-hidden.flag").catch((err) => {
    console.error("Failed to show widget:", err);
  });
};

/**
 * Opens a URL in the default browser.
 * @param {string} url - The URL to open
 */
const openInBrowser = (url) => {
  run(`open "${url}"`).catch((err) => {
    console.error("Failed to open URL:", err);
  });
};

export const refreshFrequency = 10000; // Check cache every 10 seconds for session updates

export const className = `
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
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.7);
  padding: 20px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow-y: auto;
  overflow-x: hidden;
`;

const titleStyle = {
  margin: "0 0 16px 0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const costDisplayStyle = {
  textAlign: "center",
  marginBottom: "8px",
};

const costValueStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a1a1a",
  letterSpacing: "-1px",
};

const costLabelStyle = {
  fontSize: "10px",
  color: "#666666",
  fontWeight: "500",
};

const chartWrapperStyle = {
  padding: "12px 8px 8px 8px",
  marginBottom: "12px",
  background: "rgba(255, 255, 255, 0.5)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
};

const chartContainerStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  height: "100px",
};

const barContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  minWidth: "8px",
};

const barLabelStyle = {
  fontSize: "7px",
  color: "#666666",
  marginTop: "4px",
  fontWeight: "500",
};

const barCostLabelStyle = {
  fontSize: "9px",
  color: "#1a1a1a",
  fontWeight: "600",
  marginBottom: "2px",
  whiteSpace: "nowrap",
};

const statsContainerStyle = {
  padding: "14px",
  background: "rgba(255, 255, 255, 0.5)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
};

const statRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const statLabelStyle = {
  color: "#555555",
  fontSize: "12px",
  fontWeight: "500",
};

const statValueStyle = {
  color: "#1a1a1a",
  fontSize: "12px",
  fontWeight: "600",
};

const highlightValueStyle = {
  color: "#1a1a1a",
  fontSize: "15px",
  fontWeight: "700",
};

const sessionsSectionStyle = {
  marginTop: "12px",
  padding: "14px",
  background: "rgba(255, 255, 255, 0.5)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
};

const sessionsTitleStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const sessionItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  padding: "6px 0",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  fontSize: "10px",
};

const sessionContentStyle = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
};

const sessionIconStyle = {
  marginRight: "6px",
  fontSize: "11px",
};

const sessionNameStyle = {
  color: "#1a1a1a",
  fontWeight: "500",
  fontSize: "10px",
  marginBottom: "2px",
};

const sessionDisplayStyle = {
  color: "#666666",
  fontSize: "9px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "200px",
};

const sessionIdButtonStyle = {
  color: "#2563eb",
  fontSize: "9px",
  fontFamily: "SF Mono, Monaco, monospace",
  flexShrink: 0,
  cursor: "pointer",
  padding: "3px 6px",
  borderRadius: "4px",
  border: "1px solid rgba(37, 99, 235, 0.3)",
  background: "rgba(37, 99, 235, 0.1)",
  pointerEvents: "auto",
};

const emptyStyle = {
  color: "#888888",
  fontStyle: "italic",
  textAlign: "center",
  marginTop: "60px",
};

// Single-column layout styles
const mainContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  height: "100%",
};

const leftColumnStyle = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const rightColumnStyle = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  gap: "12px",
};

// GitHub PR panel styles
const prPanelStyle = {
  padding: "14px",
  background: "rgba(255, 255, 255, 0.5)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  maxHeight: "280px",
  overflowY: "auto",
  overflowX: "hidden",
};

const prTitleStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const prItemStyle = {
  padding: "8px 0",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
};

const prRepoStyle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#2563eb",
  cursor: "pointer",
  pointerEvents: "auto",
  marginBottom: "4px",
  display: "inline-block",
};

const prTitleLinkStyle = {
  fontSize: "10px",
  color: "#1a1a1a",
  cursor: "pointer",
  pointerEvents: "auto",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const prNumberStyle = {
  color: "#666666",
  fontSize: "10px",
  fontWeight: "500",
};

const prEmptyStyle = {
  color: "#888888",
  fontStyle: "italic",
  textAlign: "center",
  marginTop: "20px",
  fontSize: "11px",
};

const closeButtonStyle = {
  marginLeft: "auto",
  background: "rgba(0, 0, 0, 0.1)",
  border: "none",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#666666",
  fontSize: "14px",
  fontWeight: "600",
  pointerEvents: "auto",
};

const minimizedContainerStyle = {
  width: "40px",
  height: "40px",
  background:
    "linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 250, 0.7) 100%)",
  backdropFilter: "blur(20px)",
  borderRadius: "50%",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  pointerEvents: "auto",
};

const formatCost = (cost) => `$${cost.toFixed(2)}`;
const formatTokens = (tokens) => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
};

const formatSessionId = (id) => {
  if (!id) return "";
  return id.substring(0, 8);
};

/**
 * Returns review status info with emoji, label, text color, and background color.
 * @param {string|null} reviewDecision - The review decision from GitHub API
 * @returns {{emoji: string, label: string, textColor: string, bgColor: string}|null} Status info or null
 */
const getReviewStatus = (reviewDecision) => {
  switch (reviewDecision) {
    case "APPROVED":
      return {
        label: "Approved",
        textColor: "#166534",
        bgColor: "#dcfce7",
        borderColor: "#86efac",
      };
    case "CHANGES_REQUESTED":
      return {
        label: "Changes",
        textColor: "#991b1b",
        bgColor: "#fee2e2",
        borderColor: "#fca5a5",
      };
    case "REVIEW_REQUIRED":
      return {
        label: "Review",
        textColor: "#9a3412",
        bgColor: "#ffedd5",
        borderColor: "#fdba74",
      };
    default:
      return null;
  }
};

/**
 * Returns CI status info with label, colors.
 * @param {string|null} ciStatus - The CI status from GitHub API
 * @returns {{label: string, textColor: string, bgColor: string, borderColor: string}|null}
 */
const getCIStatus = (ciStatus) => {
  switch (ciStatus) {
    case "SUCCESS":
      return {
        label: "CI Pass",
        textColor: "#0e7490",
        bgColor: "#cffafe",
        borderColor: "#67e8f9",
      };
    case "FAILURE":
      return {
        label: "CI Fail",
        textColor: "#be185d",
        bgColor: "#fce7f3",
        borderColor: "#f9a8d4",
      };
    case "PENDING":
      return {
        label: "CI Running",
        textColor: "#6b21a8",
        bgColor: "#f3e8ff",
        borderColor: "#d8b4fe",
      };
    default:
      return {
        label: "CI N/A",
        textColor: "#4b5563",
        bgColor: "#f3f4f6",
        borderColor: "#d1d5db",
      };
  }
};

export const render = ({ output }) => {
  let data = [];
  let totals = { totalCost: 0, totalTokens: 0 };
  let activeSessions = [];
  let completedSessions = [];
  let isHidden = false;
  let githubPRs = [];
  let contributions = {
    totalCommits: 0,
    totalPRs: 0,
    totalReviews: 0,
    daily: [],
  };

  // コマンド出力をパースして、使用状況データと非表示フラグとGitHub PRとコントリビューションを取得
  const hiddenSplit = output.split("---HIDDEN---");
  const jsonPart = hiddenSplit[0].trim();
  const afterHidden = hiddenSplit[1] || "";
  const githubSplit = afterHidden.split("---GITHUB---");
  const hiddenPart = githubSplit[0].trim();
  const afterGithub = githubSplit[1] || "";
  const contributionsSplit = afterGithub.split("---CONTRIBUTIONS---");
  const githubPart = contributionsSplit[0]
    ? contributionsSplit[0].trim()
    : "{}";
  const contributionsPart = contributionsSplit[1]
    ? contributionsSplit[1].trim()
    : "{}";
  isHidden = hiddenPart === "true";

  try {
    const parsed = JSON.parse(jsonPart);
    if (parsed.daily && Array.isArray(parsed.daily)) {
      data = parsed.daily;
      totals = parsed.totals || totals;
    }
    if (parsed.activeSessions && Array.isArray(parsed.activeSessions)) {
      activeSessions = parsed.activeSessions;
    }
    if (parsed.completedSessions && Array.isArray(parsed.completedSessions)) {
      completedSessions = parsed.completedSessions;
    }
  } catch (e) {
    // JSON parse failed
  }

  // GitHub PRデータをパース（GraphQL形式）
  try {
    const graphqlResponse = JSON.parse(githubPart);
    if (
      graphqlResponse.data &&
      graphqlResponse.data.search &&
      graphqlResponse.data.search.edges
    ) {
      githubPRs = graphqlResponse.data.search.edges.map((edge) => {
        const repo = edge.node.repository || {};
        const nameWithOwner = repo.nameWithOwner || "";
        const comments = edge.node.comments || {};
        const commits = edge.node.commits || {};
        const lastCommit = (commits.nodes && commits.nodes[0]) || {};
        const statusCheckRollup =
          (lastCommit.commit && lastCommit.commit.statusCheckRollup) || {};
        return {
          number: edge.node.number,
          title: edge.node.title,
          url: edge.node.url,
          reviewDecision: edge.node.reviewDecision,
          commentCount: comments.totalCount || 0,
          ciStatus: statusCheckRollup.state || null,
          repository: {
            nameWithOwner: nameWithOwner,
            name: nameWithOwner ? nameWithOwner.split("/")[1] : "",
          },
        };
      });
    }
  } catch (e) {
    // GitHub JSON parse failed
  }

  // GitHub Contributionsデータをパース
  // 注意: GitHubのcontribution graphは個人アカウントへの直接プッシュのみカウントされる
  // organization（会社のリポジトリ等）へのコントリビューションは含まれない
  try {
    const contribResponse = JSON.parse(contributionsPart);
    if (
      contribResponse.data &&
      contribResponse.data.viewer &&
      contribResponse.data.viewer.contributionsCollection
    ) {
      const cc = contribResponse.data.viewer.contributionsCollection;
      contributions.totalCommits = cc.totalCommitContributions || 0;
      contributions.totalPRs = cc.totalPullRequestContributions || 0;
      contributions.totalReviews = cc.totalPullRequestReviewContributions || 0;

      // 日別データを抽出（直近30日）
      if (cc.contributionCalendar && cc.contributionCalendar.weeks) {
        const allDays = [];
        cc.contributionCalendar.weeks.forEach((week) => {
          week.contributionDays.forEach((day) => {
            allDays.push({
              date: day.date,
              count: day.contributionCount,
            });
          });
        });
        // 直近30日を取得
        contributions.daily = allDays.slice(-30);
      }
    }
  } catch (e) {
    // Contributions JSON parse failed
  }

  // 非表示状態の場合、最小化されたボタンを表示
  if (isHidden) {
    return (
      <div
        style={minimizedContainerStyle}
        onClick={showWidget}
        title="Show Claude Code Widget"
      >
        <span style={{ fontSize: "18px", color: "#2563eb" }}>C</span>
      </div>
    );
  }

  // Get last 7 days for display
  const last7Days = data.slice(-7);
  const last7DaysCost = last7Days.reduce(
    (sum, d) => sum + (d.totalCost || 0),
    0,
  );
  const maxCost = Math.max(...data.map((d) => d.totalCost || 0), 1);

  const getBarColor = (cost, isRecent) => {
    const ratio = cost / maxCost;
    if (ratio > 0.8) return "#dc2626";
    if (ratio > 0.5) return "#ea580c";
    if (isRecent) return "#2563eb";
    return "#60a5fa";
  };

  const todayCost = data.length > 0 ? data[data.length - 1].totalCost || 0 : 0;

  /**
   * Builds the repository URL from repository data.
   * @param {object} pr - The pull request object
   * @returns {string} The repository URL
   */
  const getRepoUrl = (pr) => {
    if (pr.repository && pr.repository.nameWithOwner) {
      return `https://github.com/${pr.repository.nameWithOwner}`;
    }
    // URLからリポジトリURLを抽出
    if (pr.url) {
      const match = pr.url.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)/);
      if (match) return match[1];
    }
    return "#";
  };

  /**
   * Gets the repository display name.
   * @param {object} pr - The pull request object
   * @returns {string} The repository name
   */
  const getRepoName = (pr) => {
    if (pr.repository) {
      return pr.repository.nameWithOwner || pr.repository.name || "Unknown";
    }
    return "Unknown";
  };

  return (
    <div>
      <h3 style={titleStyle}>
        Claude Dashboard
        <button
          style={closeButtonStyle}
          onClick={hideWidget}
          title="Hide Widget"
        >
          x
        </button>
      </h3>

      <div style={mainContainerStyle}>
        {/* 左カラム: Claude Code Usage */}
        <div style={leftColumnStyle}>
          {data.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <div style={chartWrapperStyle}>
                <div style={costDisplayStyle}>
                  <div style={costValueStyle}>
                    {formatCost(totals.totalCost || 0)}
                  </div>
                  <div style={costLabelStyle}>30 Day Total</div>
                </div>
                <div style={chartContainerStyle}>
                  {data.map((day, index) => {
                    const height = Math.max((day.totalCost / maxCost) * 100, 3);
                    const date = new Date(day.date);
                    const isRecent = index >= data.length - 7;
                    const showLabel =
                      index % 5 === 0 || index === data.length - 1;

                    return (
                      <div key={index} style={barContainerStyle}>
                        {isRecent && (
                          <span style={barCostLabelStyle}>
                            ${day.totalCost.toFixed(0)}
                          </span>
                        )}
                        <div
                          style={{
                            width: "7px",
                            height: `${height}px`,
                            background: getBarColor(day.totalCost, isRecent),
                            borderRadius: "4px 4px 0 0",
                            opacity: isRecent ? 1 : 0.4,
                          }}
                          title={`${day.date}: ${formatCost(day.totalCost)}`}
                        />
                        {showLabel && (
                          <span style={barLabelStyle}>{date.getDate()}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={statsContainerStyle}>
                <div style={statRowStyle}>
                  <span style={statLabelStyle}>30 Day Total</span>
                  <span style={highlightValueStyle}>
                    {formatCost(totals.totalCost || 0)}
                  </span>
                </div>
                <div style={statRowStyle}>
                  <span style={statLabelStyle}>7 Day Total</span>
                  <span style={statValueStyle}>
                    {formatCost(last7DaysCost)}
                  </span>
                </div>
                <div style={statRowStyle}>
                  <span style={statLabelStyle}>Today</span>
                  <span style={statValueStyle}>{formatCost(todayCost)}</span>
                </div>
                <div style={{ ...statRowStyle, marginBottom: 0 }}>
                  <span style={statLabelStyle}>Total Tokens</span>
                  <span style={statValueStyle}>
                    {formatTokens(totals.totalTokens || 0)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  ...sessionsSectionStyle,
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={sessionsTitleStyle}>
                  Active ({activeSessions.length})
                </div>
                <div
                  style={{
                    maxHeight: "80px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session, index) => (
                      <div
                        key={`active-${index}`}
                        style={{
                          ...sessionItemStyle,
                          borderBottom:
                            index === activeSessions.length - 1 &&
                            completedSessions.length === 0
                              ? "none"
                              : sessionItemStyle.borderBottom,
                        }}
                      >
                        <span
                          style={{
                            ...sessionIconStyle,
                            color: "#22c55e",
                            marginTop: "2px",
                          }}
                        >
                          ●
                        </span>
                        <div style={sessionContentStyle}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={sessionNameStyle}>
                                {session.name}
                              </span>
                              {session.needsInput && (
                                <span
                                  style={{ fontSize: "12px", color: "#f59e0b" }}
                                >
                                  🔔
                                </span>
                              )}
                            </span>
                            <button
                              style={sessionIdButtonStyle}
                              onClick={() =>
                                openSessionInGhostty(
                                  session.sessionId,
                                  session.cwd,
                                )
                              }
                              title={`Open in Ghostty: ${session.cwd}`}
                            >
                              {formatSessionId(session.sessionId)}
                            </button>
                          </div>
                          {session.display && (
                            <div style={sessionDisplayStyle}>
                              {session.display}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        color: "#888888",
                        fontSize: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      No active sessions
                    </div>
                  )}
                </div>

                {completedSessions.length > 0 && (
                  <div
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        ...sessionsTitleStyle,
                        marginTop: "10px",
                        color: "#666666",
                      }}
                    >
                      Recent ({completedSessions.length})
                    </div>
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      {completedSessions.map((session, index) => (
                        <div
                          key={`completed-${index}`}
                          style={{
                            ...sessionItemStyle,
                            borderBottom:
                              index === completedSessions.length - 1
                                ? "none"
                                : sessionItemStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              ...sessionIconStyle,
                              color: "#888888",
                              marginTop: "2px",
                            }}
                          >
                            {"\u{25CB}"}
                          </span>
                          <div style={sessionContentStyle}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  ...sessionNameStyle,
                                  color: "#555555",
                                }}
                              >
                                {session.name}
                              </span>
                              <button
                                style={sessionIdButtonStyle}
                                onClick={() =>
                                  openSessionInGhostty(
                                    session.sessionId,
                                    session.cwd,
                                  )
                                }
                                title={`Open in Ghostty: ${session.cwd}`}
                              >
                                {formatSessionId(session.sessionId)}
                              </button>
                            </div>
                            {session.display && (
                              <div
                                style={{
                                  ...sessionDisplayStyle,
                                  color: "#888888",
                                }}
                              >
                                {session.display}
                              </div>
                            )}
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

        {/* 右カラム: GitHub Pull Requests */}
        <div style={rightColumnStyle}>
          <div style={prPanelStyle}>
            <div style={prTitleStyle}>GitHub PRs ({githubPRs.length})</div>
            {githubPRs.length > 0 ? (
              <div style={{ overflowY: "auto", overflowX: "hidden" }}>
                {githubPRs.map((pr, index) => {
                  const repoUrl = getRepoUrl(pr);
                  const repoName = getRepoName(pr);

                  return (
                    <div
                      key={`pr-${pr.number}-${index}`}
                      style={{
                        ...prItemStyle,
                        borderBottom:
                          index === githubPRs.length - 1
                            ? "none"
                            : prItemStyle.borderBottom,
                      }}
                    >
                      <div
                        style={prRepoStyle}
                        onClick={() => openInBrowser(repoUrl)}
                        title={`Open repository: ${repoName}`}
                      >
                        {repoName}
                      </div>
                      <div
                        style={prTitleLinkStyle}
                        onClick={() => openInBrowser(pr.url)}
                        title={`Open PR: ${pr.title}`}
                      >
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pr.title}
                        </span>
                        <span style={prNumberStyle}>#{pr.number}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "4px",
                        }}
                      >
                        {getReviewStatus(pr.reviewDecision) && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "9px",
                              fontWeight: "600",
                              background: getReviewStatus(pr.reviewDecision)
                                .bgColor,
                              color: getReviewStatus(pr.reviewDecision)
                                .textColor,
                              border:
                                "1px solid " +
                                getReviewStatus(pr.reviewDecision).borderColor,
                            }}
                          >
                            {getReviewStatus(pr.reviewDecision).label}
                          </div>
                        )}
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "9px",
                            fontWeight: "600",
                            background: getCIStatus(pr.ciStatus).bgColor,
                            color: getCIStatus(pr.ciStatus).textColor,
                            border:
                              "1px solid " +
                              getCIStatus(pr.ciStatus).borderColor,
                          }}
                        >
                          {getCIStatus(pr.ciStatus).label}
                        </div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "9px",
                            fontWeight: "600",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #93c5fd",
                          }}
                        >
                          <span>{"\uD83D\uDCAC"}</span>
                          <span>{pr.commentCount}</span>
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

          {/* GitHub Contributions */}
          <div
            style={{
              padding: "14px",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "12px",
              }}
            >
              GitHub Activity
            </div>

            {/* Weekly Summary */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "#dbeafe",
                  color: "#1e40af",
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                Commits: {contributions.totalCommits}
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                PRs: {contributions.totalPRs}
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "#fef3c7",
                  color: "#92400e",
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                Reviews: {contributions.totalReviews}
              </div>
            </div>

            {/* 30-day Bar Chart */}
            <div
              style={{
                fontSize: "10px",
                color: "#666666",
                marginBottom: "6px",
              }}
            >
              30-day Contributions
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "50px",
                gap: "2px",
              }}
            >
              {contributions.daily.map((day, index) => {
                const maxCount = Math.max(
                  ...contributions.daily.map((d) => d.count),
                  1,
                );
                const height = Math.max(
                  (day.count / maxCount) * 100,
                  day.count > 0 ? 10 : 2,
                );
                const isRecent = index >= contributions.daily.length - 7;
                return (
                  <div
                    key={day.date}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background:
                        day.count > 0
                          ? isRecent
                            ? "#22c55e"
                            : "#86efac"
                          : "#e5e7eb",
                      borderRadius: "2px 2px 0 0",
                      minWidth: "4px",
                    }}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "8px",
                color: "#9ca3af",
                marginTop: "4px",
              }}
            >
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
