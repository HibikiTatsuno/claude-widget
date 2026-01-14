#!/bin/bash
# Updates ccusage cache for Übersicht widget

export PATH="/Users/hibiki.tatsuno/.volta/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

CACHE_FILE="$HOME/.claude/cache/usage-30d.json"
HISTORY_FILE="$HOME/.claude/history.jsonl"
SINCE_DATE=$(date -v-30d +%Y%m%d)

# Get 30-day usage data
USAGE_DATA=$(/Users/hibiki.tatsuno/Library/pnpm/ccusage daily --json --since "$SINCE_DATE" 2>/dev/null | \
  jq '{
    daily: [.daily[] | {date, totalCost, totalTokens}],
    totals: .totals
  }' 2>/dev/null)

# Get session display names and IDs from history.jsonl (last 500 entries)
# Group by sessionId and get the latest display for each
SESSION_DISPLAYS=$(tail -500 "$HISTORY_FILE" 2>/dev/null | jq -s '
  group_by(.sessionId) |
  map({
    key: .[0].sessionId,
    value: {
      display: (sort_by(.timestamp) | last | .display | split("\n")[0] | .[0:50]),
      project: (sort_by(.timestamp) | last | .project)
    }
  }) |
  from_entries
' 2>/dev/null)

# Build active sessions list from running Claude processes
ACTIVE_SESSIONS=$(ps aux | grep -E "[c]laude" | grep -v grep | while read -r line; do
  pid=$(echo "$line" | awk '{print $2}')
  tty=$(echo "$line" | awk '{print $7}')

  if [ "$tty" != "??" ] && [ -n "$pid" ]; then
    cwd=$(lsof -p "$pid" 2>/dev/null | grep cwd | head -1 | awk '{print $NF}')
    if [ -n "$cwd" ]; then
      session_name=$(basename "$cwd")
      if [ "$session_name" = "hibiki.tatsuno" ]; then
        session_name="~"
      fi

      # Get session ID and display from history by project path
      session_info=$(echo "$SESSION_DISPLAYS" | jq -r --arg cwd "$cwd" '
        to_entries | map(select(.value.project == $cwd)) | sort_by(.key) | last |
        if . then "\(.key)|\(.value.display)" else "" end
      ' 2>/dev/null)

      if [ -n "$session_info" ] && [ "$session_info" != "" ]; then
        session_id=$(echo "$session_info" | cut -d'|' -f1)
        display=$(echo "$session_info" | cut -d'|' -f2-)

        if [ -n "$session_id" ] && [ "$session_id" != "null" ]; then
          # Escape special characters for JSON
          display_escaped=$(echo "$display" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr -d '\n')
          echo "{\"name\":\"$session_name\",\"sessionId\":\"$session_id\",\"tty\":\"$tty\",\"display\":\"$display_escaped\",\"status\":\"active\"}"
        fi
      fi
    fi
  fi
done | sort -u | jq -s 'unique_by(.sessionId)' 2>/dev/null)

# Default to empty array if nothing found
if [ -z "$ACTIVE_SESSIONS" ] || [ "$ACTIVE_SESSIONS" = "null" ]; then
  ACTIVE_SESSIONS='[]'
fi

# Get completed sessions (recently updated but not running)
COMPLETED_SESSIONS='[]'
PROJECTS_DIR="$HOME/.claude/projects"
CUTOFF_TIME=$(date -v-2H +%s)

# Get list of active session IDs
ACTIVE_IDS=$(echo "$ACTIVE_SESSIONS" | jq -r '.[].sessionId' 2>/dev/null | tr '\n' '|' | sed 's/|$//')

# Find recently modified session files
for dir in "$PROJECTS_DIR"/*; do
  if [ -d "$dir" ]; then
    for session_file in "$dir"/*.jsonl; do
      if [ -f "$session_file" ]; then
        # Skip agent files
        [[ "$session_file" == *"agent-"* ]] && continue

        file_time=$(stat -f %m "$session_file" 2>/dev/null)
        if [ -n "$file_time" ] && [ "$file_time" -gt "$CUTOFF_TIME" ]; then
          session_id=$(basename "$session_file" .jsonl)

          # Skip if this session is active
          if [ -n "$ACTIVE_IDS" ] && echo "$session_id" | grep -qE "^($ACTIVE_IDS)$"; then
            continue
          fi

          # Get project path from first line of session file
          project_path=$(head -1 "$session_file" 2>/dev/null | jq -r '.cwd // empty' 2>/dev/null)
          if [ -z "$project_path" ]; then
            # Try to decode from directory name
            dir_name=$(basename "$dir")
            project_path=$(echo "$dir_name" | sed 's/-/\//g')
          fi

          session_name=$(basename "$project_path" 2>/dev/null)
          if [ "$session_name" = "hibiki.tatsuno" ]; then
            session_name="~"
          fi

          # Get display from SESSION_DISPLAYS
          display=$(echo "$SESSION_DISPLAYS" | jq -r --arg id "$session_id" '.[$id].display // ""' 2>/dev/null)
          display_escaped=$(echo "$display" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr -d '\n')

          if [ -n "$session_name" ] && [ "$session_name" != "." ]; then
            COMPLETED_SESSIONS=$(echo "$COMPLETED_SESSIONS" | jq \
              --arg name "$session_name" \
              --arg id "$session_id" \
              --arg time "$file_time" \
              --arg display "$display_escaped" \
              '. + [{name: $name, sessionId: $id, updatedAt: ($time | tonumber), display: $display, status: "completed"}]' 2>/dev/null)
          fi
        fi
      fi
    done
  fi
done

# Sort completed sessions by update time (most recent first) and limit to 5
COMPLETED_SESSIONS=$(echo "$COMPLETED_SESSIONS" | jq 'sort_by(-.updatedAt) | .[0:5]' 2>/dev/null)

# Default to empty array if nothing found
if [ -z "$COMPLETED_SESSIONS" ] || [ "$COMPLETED_SESSIONS" = "null" ]; then
  COMPLETED_SESSIONS='[]'
fi

# Combine data
echo "$USAGE_DATA" | jq \
  --argjson active "$ACTIVE_SESSIONS" \
  --argjson completed "$COMPLETED_SESSIONS" \
  '. + {
    activeSessions: $active,
    completedSessions: $completed,
    updated: now | strftime("%Y-%m-%dT%H:%M:%S")
  }' > "$CACHE_FILE.tmp" 2>/dev/null

# Atomic write
if [ -s "$CACHE_FILE.tmp" ]; then
  mv "$CACHE_FILE.tmp" "$CACHE_FILE"
fi
