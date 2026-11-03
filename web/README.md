# TankiAlert website

The one-page marketing site for **TankiAlert**, the macOS menu bar app that plays “pani ki tanki bhar gayi” when your
MacBook's battery is full.

It uses Next.js (App Router, static export), TypeScript, Tailwind CSS v4 and Motion. `npm run build` writes a fully
static site to `out/`.

## Config

1. **Download URL.** `DOWNLOAD_URL` in `lib/config.ts` points at
   `https://github.com/chetanpujari5105/Pani-ki-Tanki/releases/latest/download/TankiAlert.zip`, which always serves
   the newest release's `TankiAlert.zip`. When you cut a new release, update `APP_VERSION` and `APP_SIZE` there.
2. **Socials.** Add profiles to `MAKER.socials` in `lib/config.ts`. Entries with an empty or `#` href are hidden.
3. **App screenshots.** The showcase section renders an HTML replica of the popover. To use a real screenshot, put
   it in `public/img/` (about 560 px wide, `.webp`) and set `POPOVER_SCREENSHOT = "/img/popover.webp"`.
4. **Site URL.** If you use a custom domain, set `NEXT_PUBLIC_SITE_URL` in Vercel, or change the fallback in
   `lib/config.ts`. Canonical links, Open Graph, the sitemap and robots.txt all use it.

## Analytics

`@vercel/analytics` (`<Analytics />`) and `@vercel/speed-insights` (`<SpeedInsights />`) are rendered in
`app/layout.tsx`. They set no cookies and collect no personal data, so no cookie banner is needed. Custom events go
through `track()` in `lib/analytics.ts`:

| Event | Props | Fired by |
| --- | --- | --- |
| `download_click` | `location` (hero, nav, final), `version` | Download buttons |
| `sound_play` | `location` | "Hear it", the hero slider and test button |
| `donate_click` | `method`, `amount` | UPI / GitHub Sponsors / BMC buttons |
| `donate_copy_upi` | none | Copy UPI ID (the ID itself is never sent) |
| `github_click` | `location`, `kind` (star, source) | GitHub links in the nav and footer |
| `faq_open` | `question` | Opening a FAQ answer |

See them in Vercel → project `tankialert` → **Analytics** (Events tab) and **Speed Insights**.

## Support

The donate section (`#support`) reads everything from `lib/donate.ts`, the only place the UPI ID is stored. It shows
amount chips and a client-side QR on desktop, an "open in any UPI app" button on phones, a copy button, and GitHub
Sponsors. Set `BMC_URL` to show a "Buy me a coffee" button.

`npm run qr` (also run automatically before every build) writes `public/upi-qr.png`:

<img src="public/upi-qr.png" alt="UPI QR code to support TankiAlert" width="200">

[Sponsor on GitHub](https://github.com/sponsors/chetanpujari5105)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npx serve out      # preview the production build
```

## Deploy

```bash
git push origin main  # Vercel builds web/ and deploys to production automatically
```

The Vercel project `tankialert` is connected to the GitHub repo with Root Directory = `web`.

## Where things live

| What | Where |
| --- | --- |
| All editable constants | `lib/config.ts` |
| The sound | `public/tanki.mp3` (copied from `../app/Sources/Resources/tanki.mp3`) |
| Waveform data | `lib/peaks.ts` (computed from the mp3 with ffmpeg) |
| Animated tank | `components/Tank.tsx` |
| Interactive popover replica | `components/MacPopover.tsx`, `components/HeroDemo.tsx` |
| SEO: metadata, JSON-LD, OG image, sitemap, robots | `app/layout.tsx`, `app/page.tsx`, `app/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts` |
| Product notes and design direction | `PRODUCT.md`, `DESIGN.md`, `.impeccable/` |
