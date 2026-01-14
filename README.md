# Claude Code Usage Widget

A macOS desktop widget for [Übersicht](https://tracesof.net/uebersicht/) that displays Claude Code usage statistics and GitHub PR information with an Apple Liquid Glass design.

## Features

### Claude Code Usage
- 30-day usage chart with bar visualization
- Cost tracking (30-day total, 7-day total, today)
- Total token count display
- Active session tracking with clickable session IDs
- Recent completed sessions display
- Bell notification for sessions waiting for input

### GitHub Pull Requests
- List of your open PRs across all repositories
- **Review Status** - Approved / Changes Requested / Review Required
- **CI Status** - Pass / Fail / Running / N/A
- **Comment Count** - Number of comments on each PR
- Click to open PR or repository in browser

### UI Features
- Apple Liquid Glass transparent design
- Hide/show toggle with minimized button
- Auto-refresh every 10 seconds
- Click session ID to open in Ghostty terminal

## Screenshots

```
+----------------------------------+
| Claude Dashboard            [x]  |
+----------------------------------+
|         $535.74                  |
|       30 Day Total               |
|  [||||||||||||||||||||||||]      |
+----------------------------------+
| 30 Day Total      $535.74       |
| 7 Day Total       $127.04       |
| Today             $127.04       |
| Total Tokens      637.9M        |
+----------------------------------+
| Active (1)                       |
|  ● claude-widget     [d423eeca] |
+----------------------------------+
| GitHub PRs (6)                   |
|  welself/jobmatching-web         |
|  feat: SEO optimization... #1971 |
|  [Review] [CI Pass] [💬 2]       |
+----------------------------------+
```

## Requirements

- macOS
- [Übersicht](https://tracesof.net/uebersicht/)
- [ccusage](https://github.com/ryoppippi/ccusage) - Claude Code usage tracker
- [jq](https://jqlang.github.io/jq/) - JSON processor
- [GitHub CLI](https://cli.github.com/) - For PR information

## Installation

### 1. Install dependencies

```bash
# Install Übersicht
brew install --cask ubersicht

# Install jq
brew install jq

# Install GitHub CLI and authenticate
brew install gh
gh auth login

# Install ccusage
pnpm add -g ccusage  # or npm install -g ccusage
```

### 2. Clone repository

```bash
git clone https://github.com/HibikiTatsuno/claude-widget.git
cd claude-widget
```

### 3. Copy widget file to Übersicht

```bash
cp claude-sessions.jsx ~/Library/Application\ Support/Übersicht/widgets/
```

Or create a symlink for easier development:

```bash
ln -s "$(pwd)/claude-sessions.jsx" ~/Library/Application\ Support/Übersicht/widgets/
```

### 4. Set up cache directory and update script

```bash
mkdir -p ~/.claude/cache
cp update-usage-cache.sh ~/.claude/cache/
chmod +x ~/.claude/cache/update-usage-cache.sh
```

### 5. Configure launchd for auto-refresh

```bash
# Edit the plist to update the path if necessary
cp com.claude.usage-cache.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.claude.usage-cache.plist
```

### 6. Initial cache generation

```bash
~/.claude/cache/update-usage-cache.sh
```

### 7. Launch Übersicht

```bash
open -a "Übersicht"
```

## Configuration

### Widget Position

Edit `claude-sessions.jsx` and modify the `className`:

```javascript
bottom: 20px;  // Distance from bottom
left: 20px;    // Distance from left
width: 320px;  // Widget width
height: 70%;   // Widget height
```

### Cache Update Interval

Edit `com.claude.usage-cache.plist`:

```xml
<key>StartInterval</key>
<integer>60</integer>  <!-- 60 seconds = 1 minute -->
```

Then reload:

```bash
launchctl unload ~/Library/LaunchAgents/com.claude.usage-cache.plist
launchctl load ~/Library/LaunchAgents/com.claude.usage-cache.plist
```

## File Structure

```
claude-widget/
├── claude-sessions.jsx          # Übersicht widget source
├── update-usage-cache.sh        # Cache update script
├── com.claude.usage-cache.plist # launchd configuration
├── CLAUDE.md                    # Development instructions
├── llms.txt                     # AI-readable documentation
└── README.md                    # This file
```

## Usage

### Resuming Sessions

Click on the session ID button (e.g., `d423eeca`) to open a new Ghostty terminal and resume the session automatically.

Or manually resume with:

```bash
claude --resume <session-id>
```

### Session Status Icons

| Icon | Status |
|------|--------|
| ● (green) | Active session |
| ○ (gray) | Recent completed session |
| 🔔 | Session waiting for input |

### PR Status Badges

| Badge | Meaning |
|-------|---------|
| `Approved` (green) | PR has been approved |
| `Changes` (red) | Changes have been requested |
| `Review` (orange) | Awaiting review |
| `CI Pass` (cyan) | CI checks passed |
| `CI Fail` (pink) | CI checks failed |
| `CI Running` (purple) | CI checks in progress |
| `💬 N` (blue) | Number of comments |

### Hide/Show Widget

- Click the `x` button to minimize the widget
- Click the `C` button to restore the widget

## Development

### Deploy Script

After modifying `claude-sessions.jsx`, run:

```bash
~/.claude/scripts/deploy-widget.sh
```

### Auto-Deploy (Watch Mode)

To automatically deploy when files change:

```bash
~/.claude/scripts/watch-widget.sh
```

This requires `fswatch`:

```bash
brew install fswatch
```

## Uninstall

```bash
# Stop launchd service
launchctl unload ~/Library/LaunchAgents/com.claude.usage-cache.plist
rm ~/Library/LaunchAgents/com.claude.usage-cache.plist

# Remove widget
rm ~/Library/Application\ Support/Übersicht/widgets/claude-sessions.jsx

# Remove cache (optional)
rm -rf ~/.claude/cache
```

## License

MIT
