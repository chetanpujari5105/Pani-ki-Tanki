/**
 * Site-wide settings. Everything you are likely to change lives here.
 */

// The source repo. The /latest/download/ form always serves the newest release asset (named exactly TankiAlert.zip).
export const REPO_URL = "https://github.com/chetanpujari5105/Pani-ki-Tanki";
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/TankiAlert.zip`;

export const APP_VERSION = "1.0.0";
// 2,001,982 bytes for the v1.0.0 universal zip (GitHub shows 1.91 MB).
export const APP_SIZE = "1.9 MB";
export const MIN_MACOS = "macOS 13";

// The production URL, used for canonical links, Open Graph, the sitemap and robots.txt.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tankialert.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "TankiAlert";
export const SITE_TITLE = "TankiAlert: your Mac's tanki is full";
export const SITE_DESCRIPTION =
  "A free macOS menu bar app that plays “pani ki tanki bhar gayi” (or any sound you like) when your MacBook charges to the % you choose. Tiny, private, and offline.";

export const MAKER = {
  name: "Chetan Pujari",
  place: "Pune, India",
  // Add real profiles here as { label, href }. Entries with an empty or "#" href are not rendered.
  socials: [] as { label: string; href: string }[],
};

/**
 * Optional: a real screenshot of the popover (e.g. "/img/popover.webp", about 560px wide, in /public).
 * When empty, the showcase renders a faithful HTML replica of the popover.
 */
export const POPOVER_SCREENSHOT = "";
