# Claude Widget

Übersicht widget for displaying Claude Code usage statistics and GitHub PR information.

## Development Rules

### Deployment

After modifying any files in this directory (especially `claude-sessions.jsx`), you MUST run the deploy script to update the widget:

```bash
~/.claude/scripts/deploy-widget.sh
```

This script:
1. Copies the widget file to Übersicht's widgets folder
2. Restarts Übersicht to apply changes

### Auto-Deploy (Watch Mode)

To automatically deploy when files change, run:

```bash
~/.claude/scripts/watch-widget.sh
```

This uses `fswatch` to monitor changes and auto-deploy. Press Ctrl+C to stop.

### File Structure

- `claude-sessions.jsx` - Main widget source code
- `update-usage-cache.sh` - Script to update usage cache (run by launchd)
- `com.claude.usage-cache.plist` - launchd configuration

### Widget Features

- 30-day Claude Code usage statistics with bar chart
- Active and recent session display
- GitHub PR panel with:
  - Review status (Approved/Changes/Review)
  - CI status (Pass/Fail/Running/N/A)
  - Comment count

### Important Notes

- The widget reads from `~/.claude/cache/usage-30d.json`
- GitHub data is fetched via `gh api graphql`
- Widget refreshes every 10 seconds
