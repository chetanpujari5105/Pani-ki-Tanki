#!/bin/bash
# Builds build/TankiAlert.app, build/TankiAlert.zip and build/TankiAlert.dmg (skip the DMG with NO_DMG=1).
# Uses XcodeGen + xcodebuild when full Xcode is installed, otherwise swiftc from the Command Line Tools.
set -euo pipefail
cd "$(dirname "$0")"

APP=build/TankiAlert.app
mkdir -p build Sources/Resources

# Bundle the custom sound if it exists (~/tanki.mp3, or any ~/tanki.{m4a,wav}).
for ext in mp3 m4a wav; do
  if [ -f "$HOME/tanki.$ext" ]; then
    cp -f "$HOME/tanki.$ext" "Sources/Resources/tanki.$ext"
    echo "Bundling ~/tanki.$ext"
    break
  fi
done

if xcodebuild -version >/dev/null 2>&1; then
  echo "==> Building with XcodeGen + xcodebuild"
  xcodegen generate
  xcodebuild -project TankiAlert.xcodeproj -scheme TankiAlert -configuration Release -derivedDataPath build build
  rm -rf "$APP"
  cp -R build/Build/Products/Release/TankiAlert.app "$APP"
else
  echo "==> Full Xcode not found; building with swiftc (Command Line Tools)"
  SDK=$(xcrun --show-sdk-path)
  rm -rf "$APP" build/obj
  mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" build/obj
  for arch in arm64 x86_64; do
    swiftc -O -swift-version 5 -parse-as-library \
      -target "$arch-apple-macos13.0" -sdk "$SDK" \
      -module-name TankiAlert \
      Sources/*.swift -o "build/obj/TankiAlert-$arch"
  done
  lipo -create build/obj/TankiAlert-arm64 build/obj/TankiAlert-x86_64 -output "$APP/Contents/MacOS/TankiAlert"
  cp Support/Info.plist "$APP/Contents/Info.plist"
  printf 'APPL????' > "$APP/Contents/PkgInfo"
  # Keeps sub-folders, so the built-in sounds end up in Contents/Resources/sounds/.
  cp -R Sources/Resources/. "$APP/Contents/Resources/"
  find "$APP/Contents/Resources" \( -name '.gitkeep' -o -name '.DS_Store' \) -delete
  xattr -cr "$APP"
  codesign --force --sign - --timestamp=none "$APP"
fi

# Ad-hoc sign the whole bundle (not notarized), so the zip and the DMG ship the same signed app.
xattr -cr "$APP"
codesign --force --deep --sign - --timestamp=none "$APP"
codesign --verify --deep --strict --verbose=1 "$APP"
rm -f build/TankiAlert.zip
ditto -c -k --norsrc --noextattr --keepParent "$APP" build/TankiAlert.zip
echo "==> Built $APP and build/TankiAlert.zip"

if [ -z "${NO_DMG:-}" ]; then
  ./scripts/make-dmg.sh
fi
