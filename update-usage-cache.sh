#!/bin/bash
# Updates ccusage cache for Übersicht widget

export PATH="/Users/hibiki.tatsuno/.volta/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

CACHE_FILE="$HOME/.claude/cache/usage-30d.json"
USAGE_CACHE_FILE="$HOME/.claude/cache/usage-data.json"
HISTORY_FILE="$HOME/.claude/history.jsonl"
SINCE_DATE=$(date -v-30d +%Y%m%d)
USAGE_CACHE_TTL=60  # ccusageのキャッシュ有効期間（秒）

# ccusageのキャッシュが有効かチェック（60秒以内なら再利用）
CURRENT_TIME=$(date +%s)
USAGE_DATA=""

if [ -f "$USAGE_CACHE_FILE" ]; then
  CACHE_TIME=$(stat -f %m "$USAGE_CACHE_FILE" 2>/dev/null)
  if [ -n "$CACHE_TIME" ] && [ $((CURRENT_TIME - CACHE_TIME)) -lt $USAGE_CACHE_TTL ]; then
    # キャッシュが有効なので再利用
    USAGE_DATA=$(cat "$USAGE_CACHE_FILE" 2>/dev/null)
  fi
fi

# キャッシュがない or 期限切れの場合はccusageを実行
if [ -z "$USAGE_DATA" ] || [ "$USAGE_DATA" = "null" ]; then
  USAGE_DATA=$(/Users/hibiki.tatsuno/Library/pnpm/ccusage daily --json --since "$SINCE_DATE" 2>/dev/null | \
    jq '{
      daily: [.daily[] | {date, totalCost, totalTokens}],
      totals: .totals
    }' 2>/dev/null)
  # キャッシュに保存
  echo "$USAGE_DATA" > "$USAGE_CACHE_FILE"
fi

# Get session display names and IDs from history.jsonl (last 500 entries)
# Group by sessionId and get the latest display for each (with start and last timestamp)
SESSION_DISPLAYS=$(tail -500 "$HISTORY_FILE" 2>/dev/null | jq -s '
  group_by(.sessionId) |
  map({
    key: .[0].sessionId,
    value: {
      display: (sort_by(.timestamp) | last | .display | split("\n")[0] | .[0:50]),
      project: (sort_by(.timestamp) | last | .project),
      timestamp: (sort_by(.timestamp) | last | .timestamp),
      startTimestamp: (sort_by(.timestamp) | first | .timestamp)
    }
  }) |
  from_entries
' 2>/dev/null)

# Get list of sessions waiting for input
PENDING_INPUT_DIR="$HOME/.claude/cache/pending-input"
PENDING_IDS=""
if [ -d "$PENDING_INPUT_DIR" ]; then
  PENDING_IDS=$(ls "$PENDING_INPUT_DIR"/*.pending 2>/dev/null | xargs -I{} basename {} .pending | tr '\n' '|' | sed 's/|$//')
fi

# Build active sessions list from running Claude processes
ACTIVE_SESSIONS=$(ps aux | grep -E "[c]laude" | grep -v grep | while read -r line; do
  pid=$(echo "$line" | awk '{print $2}')
  tty=$(echo "$line" | awk '{print $7}')

  if [ "$tty" != "??" ] && [ -n "$pid" ]; then
    # ゾンビプロセスをスキップ
    state=$(ps -o state= -p "$pid" 2>/dev/null)
    if [ "$state" = "Z" ]; then
      continue
    fi

    cwd=$(lsof -p "$pid" 2>/dev/null | grep cwd | head -1 | awk '{print $NF}')
    if [ -n "$cwd" ]; then
      session_name=$(basename "$cwd")
      if [ "$session_name" = "hibiki.tatsuno" ]; then
        session_name="~"
      fi

      # プロセス開始時刻を取得（ミリ秒単位のUNIXタイムスタンプに変換）
      proc_start=$(ps -o lstart= -p "$pid" 2>/dev/null)
      proc_start_ts=""
      if [ -n "$proc_start" ]; then
        proc_start_ts=$(date -j -f "%a %b %d %H:%M:%S %Y" "$proc_start" "+%s" 2>/dev/null)
        if [ -n "$proc_start_ts" ]; then
          proc_start_ts=$((proc_start_ts * 1000))
        fi
      fi

      # Get session ID and display from history by project path
      # プロセス開始時刻に最も近い開始時刻を持つセッションをマッチ
      session_info=""
      if [ -n "$proc_start_ts" ]; then
        session_info=$(echo "$SESSION_DISPLAYS" | jq -r --arg cwd "$cwd" --argjson proc_ts "$proc_start_ts" '
          to_entries | map(select(.value.project == $cwd)) |
          map(. + {diff: ((.value.startTimestamp - $proc_ts) | if . < 0 then -. else . end)}) |
          sort_by(.diff) | first |
          if . then "\(.key)|\(.value.display)" else "" end
        ' 2>/dev/null)
      fi

      # フォールバック: マッチしない場合は最新の更新があるセッションを使用
      if [ -z "$session_info" ] || [ "$session_info" = "null|" ]; then
        session_info=$(echo "$SESSION_DISPLAYS" | jq -r --arg cwd "$cwd" '
          to_entries | map(select(.value.project == $cwd)) | sort_by(.value.timestamp) | last |
          if . then "\(.key)|\(.value.display)" else "" end
        ' 2>/dev/null)
      fi

      if [ -n "$session_info" ] && [ "$session_info" != "" ]; then
        session_id=$(echo "$session_info" | cut -d'|' -f1)
        display=$(echo "$session_info" | cut -d'|' -f2-)

        if [ -n "$session_id" ] && [ "$session_id" != "null" ]; then
          # Escape special characters for JSON
          display_escaped=$(echo "$display" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr -d '\n')
          # Check if this session needs input
          needs_input="false"
          if [ -n "$PENDING_IDS" ] && echo "$session_id" | grep -qE "^($PENDING_IDS)$"; then
            needs_input="true"
          fi
          echo "{\"name\":\"$session_name\",\"sessionId\":\"$session_id\",\"tty\":\"$tty\",\"display\":\"$display_escaped\",\"status\":\"active\",\"needsInput\":$needs_input,\"cwd\":\"$cwd\"}"
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

# Fetch Claude usage limits from API
CLAUDE_USAGE_CACHE="$HOME/.claude/cache/claude-usage.json"
CREDENTIALS=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)
if [ -n "$CREDENTIALS" ]; then
  ACCESS_TOKEN=$(echo "$CREDENTIALS" | jq -r '.claudeAiOauth.accessToken' 2>/dev/null)
  if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    USAGE_RESPONSE=$(curl -s -X GET "https://api.anthropic.com/api/oauth/usage" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "anthropic-beta: oauth-2025-04-20")
    if [ -n "$USAGE_RESPONSE" ]; then
      echo "$USAGE_RESPONSE" > "$CLAUDE_USAGE_CACHE"
    fi
  fi
fi
