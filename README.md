# Claude Code Usage Widget

A macOS desktop widget for [Übersicht](https://tracesof.net/uebersicht/) that displays Claude Code usage statistics with an Apple Liquid Glass design.

## Features

- 30-day usage chart with bar visualization
- Cost tracking (30-day total, 7-day total, today)
- Total token count
- Active session tracking with session IDs (for `--resume`)
- Recent completed sessions display
- Auto-refresh via launchd (every minute)
- Apple Liquid Glass transparent design

## Requirements

- macOS
- [Übersicht](https://tracesof.net/uebersicht/)
- [ccusage](https://github.com/ryoppippi/ccusage)
- [jq](https://jqlang.github.io/jq/)

## Installation

### 1. Install dependencies

```bash
brew install --cask ubersicht
brew install jq
pnpm add -g ccusage  # or npm install -g ccusage
```

### 2. Copy widget file

```bash
cp claude-sessions.jsx ~/Library/Application\ Support/Übersicht/widgets/
```

### 3. Set up cache directory

```bash
mkdir -p ~/.claude/cache
cp update-usage-cache.sh ~/.claude/cache/
chmod +x ~/.claude/cache/update-usage-cache.sh
```

### 4. Configure launchd for auto-refresh

```bash
cp com.claude.usage-cache.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.claude.usage-cache.plist
```

### 5. Initial cache generation

```bash
~/.claude/cache/update-usage-cache.sh
```

### 6. Launch Übersicht

```bash
open -a "Übersicht"
```

## Configuration

### Widget Position

Edit `claude-sessions.jsx` and modify the `className`:

```javascript
bottom: 20px;  // Distance from bottom
left: 15px;    // Distance from left
```

### Widget Size

```javascript
width: 300px;
height: 480px;
```

### Refresh Interval

Edit `com.claude.usage-cache.plist`:

```xml
<key>StartInterval</key>
<integer>300</integer>  <!-- 300 seconds = 5 minutes -->
```

## File Structure

```
claude-widget/
├── claude-sessions.jsx       # Übersicht widget
├── update-usage-cache.sh     # Cache update script
├── com.claude.usage-cache.plist  # launchd configuration
└── README.md
```

## Usage

### Resuming Sessions

The widget displays session IDs (first 8 characters) next to each session name. You can use these IDs to resume a session:

```bash
claude --resume <session-id>
```

For example, if the widget shows `36158f10`, you can run:

```bash
claude --resume 36158f10
```

### Session Status

- **Active (green dot)**: Sessions currently running in a terminal
- **Recent (gray circle)**: Sessions completed within the last 2 hours

## Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.claude.usage-cache.plist
rm ~/Library/LaunchAgents/com.claude.usage-cache.plist
rm ~/Library/Application\ Support/Übersicht/widgets/claude-sessions.jsx
rm -rf ~/.claude/cache
```

## License

MIT
