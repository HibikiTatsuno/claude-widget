// Claude Code Usage Widget for Übersicht
// Displays 30-day usage data with Apple Liquid Glass design

// Read from cache file (updated periodically by launchd)
export const command = `cat ~/.claude/cache/usage-30d.json 2>/dev/null || echo '{}'`;

export const refreshFrequency = 60000; // Check cache every 60 seconds

export const className = `
  bottom: 20px;
  left: 15px;
  width: 300px;
  height: 480px;
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
  overflow: hidden;
`;

const titleStyle = {
  margin: '0 0 20px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const chartContainerStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  height: '180px',
  padding: '16px 8px 10px 8px',
  marginBottom: '16px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.7)',
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

const statsContainerStyle = {
  marginTop: '16px',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.7)',
};

const statRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
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

const emptyStyle = {
  color: '#888888',
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: '60px',
};

const formatCost = (cost) => `$${cost.toFixed(2)}`;
const formatTokens = (tokens) => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
};

export const render = ({ output }) => {
  let data = [];
  let totals = { totalCost: 0, totalTokens: 0 };

  try {
    const parsed = JSON.parse(output);
    if (parsed.daily && Array.isArray(parsed.daily)) {
      data = parsed.daily;
      totals = parsed.totals || totals;
    }
  } catch (e) {
    // JSON parse failed
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Claude Code Usage
      </h3>

      {data.length > 0 ? (
        <div>
          <div style={chartContainerStyle}>
            {data.map((day, index) => {
              const height = Math.max((day.totalCost / maxCost) * 140, 3);
              const date = new Date(day.date);
              const isRecent = index >= data.length - 7;
              const showLabel = index % 5 === 0 || index === data.length - 1;

              return (
                <div key={index} style={barContainerStyle}>
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
        </div>
      ) : (
        <p style={emptyStyle}>No usage data available</p>
      )}
    </div>
  );
};
