#!/bin/bash
# Prints the download count of every TankiAlert release asset, plus the total.
# Needs the GitHub CLI (`brew install gh`). Works without login for a public repo, but logging in avoids rate limits.
set -euo pipefail
REPO="${REPO:-chetanpujari5105/Pani-ki-Tanki}"
gh api "repos/$REPO/releases" --paginate \
  --jq '.[] | .tag_name as $t | .assets[] | "\($t)\t\(.name)\t\(.download_count)"' |
  awk -F'\t' 'BEGIN { printf "%-10s %-20s %s\n", "RELEASE", "ASSET", "DOWNLOADS" }
              { printf "%-10s %-20s %d\n", $1, $2, $3; total += $3 }
              END { printf "\nTotal downloads: %d\n", total }'
