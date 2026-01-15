#!/bin/bash
# Updates GitHub Activity cache for Übersicht widget
# Run every hour via launchd - Monthly data for past 6 months + Weekly data

export PATH="/opt/homebrew/bin:/usr/bin:/bin:$PATH"

CACHE_FILE="$HOME/.claude/cache/github-activity.json"
USERNAME="HibikiTatsuno"
ORG="welself"
MONTHS=6

# Get this week's data (from Monday)
WEEK_START=$(date -v-mon +%Y-%m-%d)
WEEK_END=$(date +%Y-%m-%d)

WEEK_WELSELF_COMMITS=$(/opt/homebrew/bin/gh api "search/commits?q=author:${USERNAME}+org:${ORG}+committer-date:${WEEK_START}..${WEEK_END}&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)
WEEK_PERSONAL_COMMITS=$(/opt/homebrew/bin/gh api "search/commits?q=author:${USERNAME}+user:${USERNAME}+committer-date:${WEEK_START}..${WEEK_END}&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)
WEEK_WELSELF_PRS=$(/opt/homebrew/bin/gh api graphql -f query="{ search(query: \"is:pr author:${USERNAME} org:${ORG} created:${WEEK_START}..${WEEK_END}\", type: ISSUE, first: 1) { issueCount } }" --jq '.data.search.issueCount' 2>/dev/null || echo 0)
WEEK_PERSONAL_PRS=$(/opt/homebrew/bin/gh api graphql -f query="{ search(query: \"is:pr author:${USERNAME} user:${USERNAME} created:${WEEK_START}..${WEEK_END}\", type: ISSUE, first: 1) { issueCount } }" --jq '.data.search.issueCount' 2>/dev/null || echo 0)

# Build monthly data array
MONTHLY_DATA="["

for i in $(seq 0 $((MONTHS - 1))); do
  # Get first and last day of the month
  if [ $i -eq 0 ]; then
    # Current month: from 1st to today
    MONTH_START=$(date -v1d +%Y-%m-%d)
    MONTH_END=$(date +%Y-%m-%d)
    MONTH_LABEL=$(date +%Y-%m)
  else
    # Previous months
    MONTH_START=$(date -v-${i}m -v1d +%Y-%m-%d)
    MONTH_END=$(date -v-$((i-1))m -v1d -v-1d +%Y-%m-%d)
    MONTH_LABEL=$(date -v-${i}m +%Y-%m)
  fi

  # Fetch commits
  WELSELF_COMMITS=$(/opt/homebrew/bin/gh api "search/commits?q=author:${USERNAME}+org:${ORG}+committer-date:${MONTH_START}..${MONTH_END}&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)
  PERSONAL_COMMITS=$(/opt/homebrew/bin/gh api "search/commits?q=author:${USERNAME}+user:${USERNAME}+committer-date:${MONTH_START}..${MONTH_END}&per_page=1" --jq '.total_count' 2>/dev/null || echo 0)

  # Fetch PRs
  WELSELF_PRS=$(/opt/homebrew/bin/gh api graphql -f query="{ search(query: \"is:pr author:${USERNAME} org:${ORG} created:${MONTH_START}..${MONTH_END}\", type: ISSUE, first: 1) { issueCount } }" --jq '.data.search.issueCount' 2>/dev/null || echo 0)
  PERSONAL_PRS=$(/opt/homebrew/bin/gh api graphql -f query="{ search(query: \"is:pr author:${USERNAME} user:${USERNAME} created:${MONTH_START}..${MONTH_END}\", type: ISSUE, first: 1) { issueCount } }" --jq '.data.search.issueCount' 2>/dev/null || echo 0)

  # Add comma separator if not first
  if [ $i -gt 0 ]; then
    MONTHLY_DATA="${MONTHLY_DATA},"
  fi

  MONTHLY_DATA="${MONTHLY_DATA}{\"month\":\"${MONTH_LABEL}\",\"welselfCommits\":${WELSELF_COMMITS},\"personalCommits\":${PERSONAL_COMMITS},\"welselfPRs\":${WELSELF_PRS},\"personalPRs\":${PERSONAL_PRS}}"
done

MONTHLY_DATA="${MONTHLY_DATA}]"

# Create JSON output (reverse array for chronological order)
WEEKLY_DATA="{\"commits\":$((WEEK_WELSELF_COMMITS + WEEK_PERSONAL_COMMITS)),\"prs\":$((WEEK_WELSELF_PRS + WEEK_PERSONAL_PRS)),\"welselfCommits\":${WEEK_WELSELF_COMMITS},\"personalCommits\":${WEEK_PERSONAL_COMMITS},\"welselfPRs\":${WEEK_WELSELF_PRS},\"personalPRs\":${WEEK_PERSONAL_PRS}}"
echo "{\"monthly\":${MONTHLY_DATA},\"weekly\":${WEEKLY_DATA},\"updatedAt\":\"$(date '+%Y-%m-%dT%H:%M:%S')\"}" | jq '.monthly |= reverse' > "${CACHE_FILE}.tmp"

# Atomic write
if [ -s "${CACHE_FILE}.tmp" ]; then
  mv "${CACHE_FILE}.tmp" "${CACHE_FILE}"
fi
