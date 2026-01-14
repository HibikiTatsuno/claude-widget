// Claude Code Usage Widget for Übersicht
// Displays 30-day usage data with Apple Liquid Glass design

import { run } from 'uebersicht';

// Read from cache file (updated periodically by launchd)
// Also check hidden flag file to persist hide/show state
export const command = `cat ~/.claude/cache/usage-30d.json 2>/dev/null || echo '{}'; echo "---HIDDEN---"; [ -f ~/.claude/cache/widget-hidden.flag ] && echo "true" || echo "false"`;

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
    console.error('Failed to open session in Ghostty:', err);
  });
};

/**
 * Hides the widget by creating a flag file.
 */
const hideWidget = () => {
  run('touch ~/.claude/cache/widget-hidden.flag').catch((err) => {
    console.error('Failed to hide widget:', err);
  });
};

/**
 * Shows the widget by removing the flag file.
 */
const showWidget = () => {
  run('rm -f ~/.claude/cache/widget-hidden.flag').catch((err) => {
    console.error('Failed to show widget:', err);
  });
};

export const refreshFrequency = 10000; // Check cache every 10 seconds for session updates

export const className = `
  bottom: 20px;
  left: 20px;
  width: 25%;
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
  margin: '0 0 16px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const costDisplayStyle = {
  textAlign: 'center',
  marginBottom: '8px',
};

const costValueStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  letterSpacing: '-1px',
};

const costLabelStyle = {
  fontSize: '10px',
  color: '#666666',
  fontWeight: '500',
};

const chartWrapperStyle = {
  padding: '12px 8px 8px 8px',
  marginBottom: '12px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.7)',
};

const chartContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  height: '100px',
};

const barContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: '8px',
};

const barLabelStyle = {
  fontSize: '7px',
  color: '#666666',
  marginTop: '4px',
  fontWeight: '500',
};

const barCostLabelStyle = {
  fontSize: '9px',
  color: '#1a1a1a',
  fontWeight: '600',
  marginBottom: '2px',
  whiteSpace: 'nowrap',
};

const statsContainerStyle = {
  padding: '14px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.7)',
};

const statRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const statLabelStyle = {
  color: '#555555',
  fontSize: '12px',
  fontWeight: '500',
};

const statValueStyle = {
  color: '#1a1a1a',
  fontSize: '12px',
  fontWeight: '600',
};

const highlightValueStyle = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '700',
};

const sessionsSectionStyle = {
  marginTop: '12px',
  padding: '14px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.7)',
};

const sessionsTitleStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const sessionItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '6px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  fontSize: '10px',
};

const sessionContentStyle = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
};

const sessionIconStyle = {
  marginRight: '6px',
  fontSize: '11px',
};

const sessionNameStyle = {
  color: '#1a1a1a',
  fontWeight: '500',
  fontSize: '10px',
  marginBottom: '2px',
};

const sessionDisplayStyle = {
  color: '#666666',
  fontSize: '9px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '200px',
};

const sessionIdButtonStyle = {
  color: '#2563eb',
  fontSize: '9px',
  fontFamily: 'SF Mono, Monaco, monospace',
  flexShrink: 0,
  cursor: 'pointer',
  padding: '3px 6px',
  borderRadius: '4px',
  border: '1px solid rgba(37, 99, 235, 0.3)',
  background: 'rgba(37, 99, 235, 0.1)',
  pointerEvents: 'auto',
};

const emptyStyle = {
  color: '#888888',
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: '60px',
};

const closeButtonStyle = {
  marginLeft: 'auto',
  background: 'rgba(0, 0, 0, 0.1)',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#666666',
  fontSize: '14px',
  fontWeight: '600',
  pointerEvents: 'auto',
};

const minimizedContainerStyle = {
  width: '40px',
  height: '40px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(245, 245, 250, 0.7) 100%)',
  backdropFilter: 'blur(20px)',
  borderRadius: '50%',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'auto',
};

const formatCost = (cost) => `$${cost.toFixed(2)}`;
const formatTokens = (tokens) => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
};

const formatSessionId = (id) => {
  if (!id) return '';
  return id.substring(0, 8);
};

export const render = ({ output }) => {
  let data = [];
  let totals = { totalCost: 0, totalTokens: 0 };
  let activeSessions = [];
  let completedSessions = [];
  let isHidden = false;

  // コマンド出力をパースして、使用状況データと非表示フラグを取得
  const parts = output.split('---HIDDEN---');
  const jsonPart = parts[0].trim();
  const hiddenPart = parts[1] ? parts[1].trim() : 'false';
  isHidden = hiddenPart === 'true';

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

  // 非表示状態の場合、最小化されたボタンを表示
  if (isHidden) {
    return (
      <div
        style={minimizedContainerStyle}
        onClick={showWidget}
        title="Show Claude Code Widget"
      >
        <span style={{ fontSize: '18px', color: '#2563eb' }}>C</span>
      </div>
    );
  }

  // Get last 7 days for display
  const last7Days = data.slice(-7);
  const last7DaysCost = last7Days.reduce((sum, d) => sum + (d.totalCost || 0), 0);
  const maxCost = Math.max(...data.map(d => d.totalCost || 0), 1);

  const getBarColor = (cost, isRecent) => {
    const ratio = cost / maxCost;
    if (ratio > 0.8) return '#dc2626';
    if (ratio > 0.5) return '#ea580c';
    if (isRecent) return '#2563eb';
    return '#60a5fa';
  };

  const todayCost = data.length > 0 ? data[data.length - 1].totalCost || 0 : 0;

  return (
    <div>
      <h3 style={titleStyle}>
        Claude Code Usage
        <button
          style={closeButtonStyle}
          onClick={hideWidget}
          title="Hide Widget"
        >
          x
        </button>
      </h3>

      {data.length > 0 ? (
        <div>
          <div style={chartWrapperStyle}>
            <div style={costDisplayStyle}>
              <div style={costValueStyle}>{formatCost(totals.totalCost || 0)}</div>
              <div style={costLabelStyle}>30 Day Total</div>
            </div>
            <div style={chartContainerStyle}>
              {data.map((day, index) => {
              const height = Math.max((day.totalCost / maxCost) * 100, 3);
              const date = new Date(day.date);
              const isRecent = index >= data.length - 7;
              const showLabel = index % 5 === 0 || index === data.length - 1;

              return (
                <div key={index} style={barContainerStyle}>
                  {isRecent && (
                    <span style={barCostLabelStyle}>${day.totalCost.toFixed(0)}</span>
                  )}
                  <div
                    style={{
                      width: '7px',
                      height: `${height}px`,
                      background: getBarColor(day.totalCost, isRecent),
                      borderRadius: '4px 4px 0 0',
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
              <span style={highlightValueStyle}>{formatCost(totals.totalCost || 0)}</span>
            </div>
            <div style={statRowStyle}>
              <span style={statLabelStyle}>7 Day Total</span>
              <span style={statValueStyle}>{formatCost(last7DaysCost)}</span>
            </div>
            <div style={statRowStyle}>
              <span style={statLabelStyle}>Today</span>
              <span style={statValueStyle}>{formatCost(todayCost)}</span>
            </div>
            <div style={{ ...statRowStyle, marginBottom: 0 }}>
              <span style={statLabelStyle}>Total Tokens</span>
              <span style={statValueStyle}>{formatTokens(totals.totalTokens || 0)}</span>
            </div>
          </div>

          <div style={sessionsSectionStyle}>
            <div style={sessionsTitleStyle}>
              Active ({activeSessions.length})
            </div>
            <div style={{ maxHeight: '120px', overflowY: 'auto', overflowX: 'hidden' }}>
              {activeSessions.length > 0 ? (
                activeSessions.map((session, index) => (
                  <div
                    key={`active-${index}`}
                    style={{
                      ...sessionItemStyle,
                      borderBottom: index === activeSessions.length - 1 && completedSessions.length === 0
                        ? 'none'
                        : sessionItemStyle.borderBottom,
                    }}
                  >
                    <span style={{ ...sessionIconStyle, color: '#22c55e', marginTop: '2px' }}>●</span>
                    <div style={sessionContentStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={sessionNameStyle}>{session.name}</span>
                        <button
                          style={sessionIdButtonStyle}
                          onClick={() => openSessionInGhostty(session.sessionId, session.cwd)}
                          title={`Open in Ghostty: ${session.cwd}`}
                        >
                          {formatSessionId(session.sessionId)}
                        </button>
                      </div>
                      {session.display && (
                        <div style={sessionDisplayStyle}>{session.display}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#888888', fontSize: '10px', marginBottom: '8px' }}>No active sessions</div>
              )}
            </div>

            {completedSessions.length > 0 && (
              <div>
                <div style={{ ...sessionsTitleStyle, marginTop: '10px', color: '#666666' }}>
                  Recent ({completedSessions.length})
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', overflowX: 'hidden' }}>
                  {completedSessions.map((session, index) => (
                    <div
                      key={`completed-${index}`}
                      style={{
                        ...sessionItemStyle,
                        borderBottom: index === completedSessions.length - 1
                          ? 'none'
                          : sessionItemStyle.borderBottom,
                      }}
                    >
                      <span style={{ ...sessionIconStyle, color: '#888888', marginTop: '2px' }}>○</span>
                      <div style={sessionContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ ...sessionNameStyle, color: '#555555' }}>{session.name}</span>
                          <button
                            style={sessionIdButtonStyle}
                            onClick={() => openSessionInGhostty(session.sessionId, session.cwd)}
                            title={`Open in Ghostty: ${session.cwd}`}
                          >
                            {formatSessionId(session.sessionId)}
                          </button>
                        </div>
                        {session.display && (
                          <div style={{ ...sessionDisplayStyle, color: '#888888' }}>{session.display}</div>
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
  );
};
