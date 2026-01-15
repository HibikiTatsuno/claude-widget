/**
 * Shell command definitions and execution helpers
 */

/**
 * Main command to fetch all widget data
 * Outputs sections separated by delimiters
 */
export const WIDGET_COMMAND = `cat ~/.claude/cache/usage-30d.json 2>/dev/null || echo '{}'; echo "---HIDDEN---"; [ -f ~/.claude/cache/widget-hidden.flag ] && echo "true" || echo "false"; echo "---GITHUB---"; /opt/homebrew/bin/gh api graphql -f query='query { search(query: "is:open is:pr author:@me", type: ISSUE, first: 20) { edges { node { ... on PullRequest { number title url reviewDecision comments { totalCount } commits(last: 1) { nodes { commit { statusCheckRollup { state } } } } repository { nameWithOwner } } } } } }' 2>/dev/null || echo '{}'; echo "---CONTRIBUTIONS---"; cat ~/.claude/cache/github-activity.json 2>/dev/null || echo '{}'; echo "---REVIEWER_PRS---"; cat ~/.claude/cache/reviewer-prs.json 2>/dev/null || echo '{}'; echo "---CLAUDE_USAGE---"; cat ~/.claude/cache/claude-usage.json 2>/dev/null || echo '{}'`;

/**
 * Command delimiters for parsing output
 */
export const DELIMITERS = {
  HIDDEN: "---HIDDEN---",
  GITHUB: "---GITHUB---",
  CONTRIBUTIONS: "---CONTRIBUTIONS---",
  REVIEWER_PRS: "---REVIEWER_PRS---",
  CLAUDE_USAGE: "---CLAUDE_USAGE---",
} as const;

/**
 * Creates an AppleScript command to open Ghostty and run a command
 * @param cwd - Working directory
 * @param sessionId - Session ID to resume
 * @returns Shell command string
 */
export const createGhosttyCommand = (cwd: string, sessionId: string): string => {
  // cwdのエスケープ処理（シングルクォート内で使うためにシングルクォートをエスケープ）
  const escapedCwd = cwd.replace(/'/g, "'\"'\"'");
  const escapedSessionId = sessionId.replace(/'/g, "'\"'\"'");

  return `
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
};
