#!/bin/bash
# Prints the download count of every TankiAlert release asset, plus the total.
# Uses the GitHub CLI when it is logged in (`gh auth login`, avoids rate limits); otherwise the public API via curl.
set -euo pipefail
REPO="${REPO:-chetanpujari5105/Pani-ki-Tanki}"
JQ='.[] | .tag_name as $t | .assets[] | "\($t)\t\(.name)\t\(.download_count)"'

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  rows=$(gh api "repos/$REPO/releases" --paginate --jq "$JQ")
else
  rows=$(curl -fsSL -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/releases?per_page=100" |
    python3 -c 'import json, sys
for r in json.load(sys.stdin):
    for a in r["assets"]:
        print(r["tag_name"], a["name"], a["download_count"], sep="\t")')
fi

printf '%s\n' "$rows" |
  awk -F'\t' 'BEGIN { printf "%-10s %-20s %s\n", "RELEASE", "ASSET", "DOWNLOADS" }
              NF == 3 { printf "%-10s %-20s %d\n", $1, $2, $3; total += $3 }
              END { printf "\nTotal downloads: %d\n", total }'
