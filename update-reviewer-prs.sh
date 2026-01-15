#!/bin/bash
# Updates Reviewer PRs cache for Übersicht widget
# Run every 10 minutes via launchd

export PATH="/opt/homebrew/bin:/usr/bin:/bin:$PATH"

CACHE_FILE="$HOME/.claude/cache/reviewer-prs.json"

# Fetch PRs where user is requested as reviewer using GraphQL
RESULT=$(/opt/homebrew/bin/gh api graphql -f query='
query {
  search(query: "is:open is:pr review-requested:@me", type: ISSUE, first: 20) {
    edges {
      node {
        ... on PullRequest {
          number
          title
          url
          author { login }
          reviewDecision
          comments { totalCount }
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup { state }
              }
            }
          }
          repository { nameWithOwner }
          createdAt
        }
      }
    }
  }
}
' 2>/dev/null)

# Create JSON output with timestamp
if [ -n "$RESULT" ]; then
  echo "$RESULT" | jq --arg updatedAt "$(date '+%Y-%m-%dT%H:%M:%S')" '. + {updatedAt: $updatedAt}' > "${CACHE_FILE}.tmp"

  # Atomic write
  if [ -s "${CACHE_FILE}.tmp" ]; then
    mv "${CACHE_FILE}.tmp" "${CACHE_FILE}"
  fi
else
  # If API call failed, create empty result
  echo '{"data":{"search":{"edges":[]}},"updatedAt":"'"$(date '+%Y-%m-%dT%H:%M:%S')"'"}' > "${CACHE_FILE}"
fi
