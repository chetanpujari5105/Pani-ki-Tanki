#!/bin/bash
# Regenerates Sources/Resources/AppIcon.icns from Support/icon/logo-source.png
set -euo pipefail
cd "$(dirname "$0")"
OUT=$(mktemp -d)
swift make-icon.swift logo-source.png "$OUT/icon_1024.png"
SET="$OUT/AppIcon.iconset"; mkdir -p "$SET"
for s in 16 32 128 256 512; do
  sips -z $s $s "$OUT/icon_1024.png" --out "$SET/icon_${s}x${s}.png" >/dev/null
  sips -z $((s*2)) $((s*2)) "$OUT/icon_1024.png" --out "$SET/icon_${s}x${s}@2x.png" >/dev/null
done
cp "$OUT/icon_1024.png" icon-1024-preview.png
iconutil -c icns "$SET" -o ../../Sources/Resources/AppIcon.icns
rm -rf "$OUT"
echo "wrote Sources/Resources/AppIcon.icns"
