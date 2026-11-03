#!/bin/bash
# Packages build/TankiAlert.app into build/TankiAlert.dmg: a drag-to-Applications disk image with a background,
# a volume icon, and the icons sitting on the ends of the arrow. ./build.sh calls this at the end.
#
# Uses dmgbuild (pip), which writes Finder's layout file (.DS_Store) directly. create-dmg and other tools that script
# Finder over AppleScript lose the layout on macOS 26: Finder accepts the icon-view changes, then ignores them.
# If dmgbuild isn't installed, this script installs it into build/.dmgbuild-venv (about 15 MB, gitignored).
# Fallbacks, in order: create-dmg (brew install create-dmg), then a plain hdiutil image with an Applications link.
set -euo pipefail
cd "$(dirname "$0")/.."

APP=build/TankiAlert.app
DMG=build/TankiAlert.dmg
VOL=TankiAlert
[ -d "$APP" ] || { echo "Missing $APP. Run ./build.sh first." >&2; exit 1; }

echo "==> Ad-hoc signing $APP"
xattr -cr "$APP"
codesign --force --deep --sign - --timestamp=none "$APP"
codesign --verify --deep --strict "$APP"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# The volume icon never shows above 256 pt, so drop the 512/1024 px reps (saves ~1.2 MB in the DMG).
iconutil -c iconset Sources/Resources/AppIcon.icns -o "$WORK/vol.iconset"
rm -f "$WORK"/vol.iconset/icon_512x512*.png
iconutil -c icns "$WORK/vol.iconset" -o "$WORK/VolumeIcon.icns"

# Eject a leftover mount of the same name.
if [ -d "/Volumes/$VOL" ]; then hdiutil detach "/Volumes/$VOL" -quiet || true; fi
rm -f "$DMG"

find_dmgbuild() {
  if [ -n "${DMGBUILD:-}" ] && [ -x "$DMGBUILD" ]; then echo "$DMGBUILD"; return; fi
  if command -v dmgbuild >/dev/null; then command -v dmgbuild; return; fi
  if [ ! -x build/.dmgbuild-venv/bin/dmgbuild ]; then
    echo "==> Installing dmgbuild into build/.dmgbuild-venv" >&2
    python3 -m venv build/.dmgbuild-venv >&2 &&
      build/.dmgbuild-venv/bin/pip install -q --no-cache-dir dmgbuild >&2 || return 0
  fi
  echo build/.dmgbuild-venv/bin/dmgbuild
}

echo "==> Building $DMG"
DB=$(find_dmgbuild)
if [ -n "$DB" ] && "$DB" -s dmg/dmgbuild-settings.py -D app="$APP" -D volicon="$WORK/VolumeIcon.icns" \
    "$VOL" "$DMG" >"$WORK/dmgbuild.log" 2>&1; then
  echo "    built with dmgbuild"
elif command -v create-dmg >/dev/null; then
  echo "!! dmgbuild failed ($(tail -1 "$WORK/dmgbuild.log" 2>/dev/null)); trying create-dmg" >&2
  mkdir -p "$WORK/stage" && ditto "$APP" "$WORK/stage/TankiAlert.app"
  tiffutil -cathidpicheck dmg/background.png dmg/background@2x.png -out "$WORK/background.tiff" >/dev/null 2>&1
  create-dmg --volname "$VOL" --volicon "$WORK/VolumeIcon.icns" --background "$WORK/background.tiff" \
    --window-pos 200 140 --window-size 660 497 --icon-size 100 --text-size 13 \
    --icon "TankiAlert.app" 170 215 --hide-extension "TankiAlert.app" --app-drop-link 490 215 \
    --format ULMO --filesystem HFS+ --hdiutil-quiet "$DMG" "$WORK/stage/"
else
  echo "!! No dmgbuild or create-dmg; building a plain DMG with hdiutil" >&2
  mkdir -p "$WORK/stage" && ditto "$APP" "$WORK/stage/TankiAlert.app"
  ln -s /Applications "$WORK/stage/Applications"
  hdiutil create -volname "$VOL" -srcfolder "$WORK/stage" -fs HFS+ -format ULMO -ov "$DMG" -quiet
fi

hdiutil verify "$DMG" -quiet
echo "==> Built $DMG ($(du -h "$DMG" | cut -f1))"
