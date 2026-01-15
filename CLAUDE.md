# Claude Widget

Übersicht widget for displaying Claude Code usage statistics and GitHub PR information.

## Development Rules

### Development Flow

1. Edit source code in `src/` directory (TypeScript/TSX)
2. Build to generate `dist/claude-sessions.jsx`
3. Deploy to Übersicht widgets folder
4. Übersicht restarts and reflects changes

### Build and Deploy

**After modifying source code, run:**

```bash
npm run deploy
```

This command:
1. Builds `src/index.tsx` → `dist/claude-sessions.jsx` (esbuild)
2. Copies the built file to `~/Library/Application Support/Übersicht/widgets/`
3. Restarts Übersicht to apply changes

### Available Commands

```bash
npm run build      # Build only (no deploy)
npm run deploy     # Build and deploy to Übersicht
npm run dev        # Watch mode (auto-rebuild on changes)
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run typecheck  # TypeScript type checking
```

### Auto-Deploy (Watch Mode)

To automatically deploy when files change:

```bash
~/.claude/scripts/watch-widget.sh
```

This uses `fswatch` to monitor changes and auto-deploy. Press Ctrl+C to stop.

### File Structure

```
src/
  index.tsx           # Main entry point (widget definition)
  features/           # Feature modules (GitHub PRs, Activity, etc.)
  shared/             # Shared components and utilities
  infrastructure/     # External integrations (file reading, commands)
  types/              # TypeScript type definitions
dist/
  claude-sessions.jsx # Built widget file (generated, do not edit)
```

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
- **DO NOT edit `dist/claude-sessions.jsx` directly** - it is generated from source
