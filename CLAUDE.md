# Claude Widget

Übersicht widget for displaying Claude Code usage statistics and GitHub PR information.

## Development Rules

### IMPORTANT: Auto-Deploy After Changes

**Every time you modify `claude-sessions.jsx`, you MUST immediately run the deploy script:**

```bash
~/.claude/scripts/deploy-widget.sh
```

This is REQUIRED because the widget file in this directory is NOT directly used by Übersicht. The deploy script copies the file to Übersicht's widgets folder and restarts Übersicht.

**DO NOT forget to run the deploy script after any changes to `claude-sessions.jsx`.**

### Deploy Script Location

```bash
~/.claude/scripts/deploy-widget.sh
```

This script:
1. Copies `claude-sessions.jsx` to `~/Library/Application Support/Übersicht/widgets/`
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
- GitHub Activity section with:
  - 30-day contribution bar chart
  - Weekly summary (Commits, PRs, Reviews)

### Important Notes

- The widget reads from `~/.claude/cache/usage-30d.json`
- GitHub data is fetched via `gh api graphql`
- Widget refreshes every 10 seconds
