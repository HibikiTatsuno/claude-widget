#!/bin/bash
# Fetches Claude Code usage limits from the Anthropic API

CACHE_FILE="$HOME/.claude/cache/claude-usage.json"

# Keychainからアクセストークンを取得
CREDENTIALS=$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)
if [ -z "$CREDENTIALS" ]; then
  echo '{"error": "No credentials found"}' > "$CACHE_FILE"
  exit 1
fi

# JSONからaccessTokenを抽出
ACCESS_TOKEN=$(echo "$CREDENTIALS" | /opt/homebrew/bin/jq -r '.claudeAiOauth.accessToken' 2>/dev/null)
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo '{"error": "No access token found"}' > "$CACHE_FILE"
  exit 1
fi

# APIを呼び出してusage情報を取得
RESPONSE=$(curl -s -X GET "https://api.anthropic.com/api/oauth/usage" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "anthropic-beta: oauth-2025-04-20")

# レスポンスをキャッシュに保存
if [ -n "$RESPONSE" ]; then
  echo "$RESPONSE" > "$CACHE_FILE"
else
  echo '{"error": "API call failed"}' > "$CACHE_FILE"
fi
