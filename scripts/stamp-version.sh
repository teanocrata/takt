#!/usr/bin/env bash
# Stamps the current git short hash into PWA and Expo version files.
# Run before deploying: ./scripts/stamp-version.sh

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

HASH=$(git rev-parse --short HEAD)

# PWA
sed -i.bak "s/const PWA_COMMIT = '.*';/const PWA_COMMIT = '${HASH}';/" docs/index.html
rm -f docs/index.html.bak

# Expo app
sed -i.bak "s/export const BUILD = '.*';/export const BUILD = '${HASH}';/" src/constants/version.js
rm -f src/constants/version.js.bak

echo "Stamped commit ${HASH} into PWA and Expo version files"
