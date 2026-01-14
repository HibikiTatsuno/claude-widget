#!/bin/bash
# Updates ccusage cache for Übersicht widget

export PATH="/Users/hibiki.tatsuno/.volta/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

CACHE_FILE="$HOME/.claude/cache/usage-30d.json"
SINCE_DATE=$(date -v-30d +%Y%m%d)

# Get 30-day usage data
/Users/hibiki.tatsuno/Library/pnpm/ccusage daily --json --since "$SINCE_DATE" 2>/dev/null | \
  jq '{
    daily: [.daily[] | {date, totalCost, totalTokens}],
    totals: .totals,
    updated: now | strftime("%Y-%m-%dT%H:%M:%S")
  }' > "$CACHE_FILE.tmp" 2>/dev/null

# Atomic write
if [ -s "$CACHE_FILE.tmp" ]; then
  mv "$CACHE_FILE.tmp" "$CACHE_FILE"
fi
