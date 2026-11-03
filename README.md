# 💧 Pani ki Tanki: TankiAlert

[![Latest release](https://img.shields.io/github/v/release/chetanpujari5105/Pani-ki-Tanki)](https://github.com/chetanpujari5105/Pani-ki-Tanki/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/chetanpujari5105/Pani-ki-Tanki/total)](https://github.com/chetanpujari5105/Pani-ki-Tanki/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**TankiAlert** is a tiny, free macOS menu bar app. When your MacBook charges to the % you choose, it plays
*"pani ki tanki bhar gayi"* (or any sound you like) and shows a notification, so you unplug on time.

- macOS 13 Ventura or later, Apple Silicon and Intel (universal binary)
- About 1.9 MB, no account, no network access, and it collects no data
- Fires once per charge cycle and re-arms when you unplug

**Website:** https://tankialert.vercel.app · **Download:** [TankiAlert.zip (latest release)](https://github.com/chetanpujari5105/Pani-ki-Tanki/releases/latest/download/TankiAlert.zip)

<!-- TODO: replace with a real screenshot or GIF of the menu bar popover, e.g. docs/demo.gif -->
<p align="center"><em>Screenshot / GIF coming soon.</em></p>

## Install

1. Download [`TankiAlert.zip`](https://github.com/chetanpujari5105/Pani-ki-Tanki/releases/latest/download/TankiAlert.zip)
   and double-click it to unzip.
2. Drag **TankiAlert.app** into your **Applications** folder.
3. Open it. There's no Dock icon. Look for the battery icon in the menu bar.
4. Allow notifications when asked (System Settings → Notifications → TankiAlert).

### Gatekeeper ("unidentified developer")

TankiAlert is ad-hoc signed and not notarized by Apple yet, so macOS asks you to confirm the first time:

- **macOS 15 Sequoia and later:** try to open the app once and dismiss the warning. Then go to
  **System Settings → Privacy & Security**, scroll down, click **Open Anyway**, and confirm with your password.
- **macOS 13–14:** right-click (or Control-click) TankiAlert in Applications, choose **Open**, then click **Open** again.

You only need to do this once.

## Build from source

You need the Xcode Command Line Tools (`xcode-select --install`). Full Xcode with
[XcodeGen](https://github.com/yonaskolb/XcodeGen) is optional.

```bash
git clone https://github.com/chetanpujari5105/Pani-ki-Tanki.git
cd Pani-ki-Tanki/app
./build.sh                 # -> app/build/TankiAlert.app and app/build/TankiAlert.zip
cp -R build/TankiAlert.app ~/Applications/ && open ~/Applications/TankiAlert.app
```

See [`app/README.md`](app/README.md) for how it works, how it's tested, and how to change the icon.

## Repository layout

| Path | What |
| --- | --- |
| [`app/`](app) | The macOS app (SwiftUI, XcodeGen `project.yml`, `build.sh`) |
| [`web/`](web) | The one-page website (Next.js static export, deployed on Vercel from this folder) |
| [`scripts/stats.sh`](scripts/stats.sh) | Prints the download count of each release asset |

## Download stats

The website uses Vercel Web Analytics, which is privacy-friendly, sets no cookies and stores no personal data.
GitHub Releases also counts every download of each asset. To see those counts:

```bash
./scripts/stats.sh   # works logged out too (falls back to the public API via curl)
# or directly, with the GitHub CLI logged in:
gh api repos/chetanpujari5105/Pani-ki-Tanki/releases --jq '.[] | .tag_name as $t | .assets[] | "\($t) \(.name) \(.download_count)"'
```

## Releasing a new version

```bash
cd app && ./build.sh
gh release create v1.x.y build/TankiAlert.zip --title "TankiAlert v1.x.y" --notes "..."
```

The site's Download button uses `/releases/latest/download/TankiAlert.zip`, so it always serves the newest release.
Keep the asset name exactly `TankiAlert.zip`, and update `APP_VERSION` / `APP_SIZE` in `web/lib/config.ts`.

## Support

TankiAlert is free and open source. If it saved your battery (or made you laugh), you can help fill the tanki 💧.

- **In India (UPI):** scan this with GPay, PhonePe, Paytm or any UPI app.

  <img src="web/public/upi-qr.png" alt="UPI QR code to support TankiAlert" width="220">

- **Outside India:** [Support on Ko-fi](https://ko-fi.com/chetan46146) (card or PayPal).

## License

[MIT](LICENSE) © 2026 Chetan Pujari. TankiAlert is not affiliated with Apple. Mac, MacBook and macOS are trademarks
of Apple Inc.
