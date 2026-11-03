# 💧 TankiAlert

A macOS menu bar app (macOS 13+, SwiftUI) that plays your "pani ki tanki bhar gayi" clip and posts a
notification when the Mac is on AC power and the battery reaches your threshold. It fires once per charge cycle.

## Build

```bash
./build.sh          # -> build/TankiAlert.app, build/TankiAlert.zip and build/TankiAlert.dmg
NO_DMG=1 ./build.sh # skip the DMG
```

- With full Xcode installed, `build.sh` runs `xcodegen generate` and then
  `xcodebuild -scheme TankiAlert -configuration Release -derivedDataPath build build`.
- With only the Command Line Tools installed, it compiles `Sources/*.swift` with `swiftc` for arm64 and x86_64,
  assembles the `.app` bundle from `Support/Info.plist`, and ad-hoc signs it.
- If `~/tanki.mp3` (or `.m4a` / `.wav`) exists, it is copied into `Sources/Resources/` and bundled.
- Either way it ad-hoc signs the bundle (`codesign --force --deep --sign -`), zips it, then runs
  `scripts/make-dmg.sh`.

### DMG installer

`scripts/make-dmg.sh` builds `build/TankiAlert.dmg`: a compressed (ULMO, about 2.6 MB) drag-to-Applications image
with a volume icon and a background (`dmg/background.png` + `@2x`) whose arrow runs from the app to the Applications
link. It uses [dmgbuild](https://github.com/dmgbuild/dmgbuild), which writes Finder's `.DS_Store` layout directly
(settings in `dmg/dmgbuild-settings.py`), and installs it into `build/.dmgbuild-venv` the first time if it isn't on
your `PATH`. Tools that script Finder over AppleScript, like create-dmg, lose most of the layout on macOS 26. The
script falls back to create-dmg, then to a plain `hdiutil` image.

To change the background, edit `dmg/background.svg` and run `node scripts/render-dmg-background.mjs` (it uses the
Playwright install in `../web`). Keep the icons at (170, 215) and (490, 215). macOS 26 Finder always shows its
toolbar, so the window is 497 pt tall to leave the 660×400 design fully visible.

### Built-in sounds

Five of the six presets (Ting, Water Drop, Bell, Siren, Success) are synthesised from scratch by
`scripts/make-sounds.sh` with ffmpeg (no samples, so they're original and licence-free), normalised to about
−14 LUFS with a −1 dBFS peak limit, and saved as mono AAC in `Sources/Resources/sounds/`. The sixth, Pani ki
Tanki, is `Sources/Resources/tanki.mp3`. Re-run the script after changing a recipe.

### App icon

`Sources/Resources/AppIcon.icns` is generated from `Support/icon/logo-source.png`. To swap the logo, replace that
PNG and run `Support/icon/make-icns.sh`. The script removes the black background so the corners are transparent,
fits the artwork onto the standard macOS icon grid (an 824 px rounded square, which macOS 26 shows without a grey frame), and builds every icon size. Then run `./build.sh`.

## Install & run

```bash
rm -rf ~/Applications/TankiAlert.app && cp -R build/TankiAlert.app ~/Applications/
open ~/Applications/TankiAlert.app
```

The app has no Dock icon. Click the battery icon in the menu bar. The icon shows a bolt while you're on AC.

## How it works

- `IOPSNotificationCreateRunLoopSource` delivers instant power-source updates, and a 30 s timer polls as a fallback.
- The alert fires when on AC, enabled, the battery is at or above the threshold, and it hasn't already fired this cycle.
- It re-arms when you unplug, when the battery drops 3 or more points below the threshold, or when you set a new
  threshold above the current %.
- The sound is the selection in the Sound list: a built-in preset, or "Custom file…" (the file from Choose Sound).
  If the custom file has gone missing, it plays the default preset (Pani ki Tanki), then the system Glass sound.
  It plays 1–5 times. Each preset's play button previews it once.
- Settings (enabled, threshold, repeats, `soundChoice` = `preset:<id>` or `custom`, `soundPath`) are stored in
  `UserDefaults` (`com.chetan.tankialert`). Upgrading from 1.0 with a chosen file keeps it as "Custom file…".

## Testing

```bash
APP=~/Applications/TankiAlert.app/Contents/MacOS/TankiAlert
$APP --print-battery           # compare with: pmset -g batt
```

Quick end-to-end test while plugged in: drag the slider down to the current battery %. The alert fires straight away.
From the terminal, the same check with logs looks like this:

```bash
open -n ~/Applications/TankiAlert.app --stderr /tmp/tanki.log --args --debug --set-threshold 80
cat /tmp/tanki.log   # look for "FIRED at …"
```

`--set-threshold` saves the threshold just like the slider does, so set it back afterwards.

To check the sounds: `--select-sound preset:bell` (or `ting`, `drop`, `siren`, `success`, `tanki`, or `custom`)
picks a sound exactly like the Sound list does and saves it. `--test-sound` presses Test Sound. With `--debug` the log
shows `playing bell.m4a x2` and `finished bell.m4a`.

## Notes

- If you use macOS "Optimized Battery Charging" or an 80% charge limit, the battery may never reach 100%.
  Set the threshold to 80 in that case.
- Allow notifications under System Settings → Notifications → TankiAlert.
- Launch at login uses `SMAppService.mainApp`. It works best from `~/Applications` or `/Applications`.

## Website

The marketing site lives in [`../web`](../web/README.md) (Next.js static export, deployed on Vercel). Its Download
button points at `https://github.com/chetanpujari5105/Pani-ki-Tanki/releases/latest/download/TankiAlert.dmg` (with a
`.zip` link as a fallback), so attach both `build/TankiAlert.dmg` and `build/TankiAlert.zip`, named exactly that, to
each GitHub Release.

## Support

TankiAlert is free and open source. If it saved your battery (or made you laugh), you can help fill the tanki 💧.
Donations are optional and go into updates.

- **In India (UPI):** scan this with GPay, PhonePe, Paytm or any UPI app.

  <img src="../web/public/upi-qr.png" alt="UPI QR code to support TankiAlert" width="220">

- **Outside India:** [Support on Ko-fi](https://ko-fi.com/chetan46146) (card or PayPal).

The QR is generated from `web/lib/donate.ts` by `npm run qr` (inside `web/`).
