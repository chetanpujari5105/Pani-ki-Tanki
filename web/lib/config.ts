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

export type SocialPlatform =
  | "x"
  | "instagram"
  | "instagram_ai"
  | "youtube"
  | "linkedin"
  | "github"
  | "substack"
  | "udemy";

export type Social = {
  platform: SocialPlatform;
  label: string;
  href: string;
  /** Shown as an icon in the footer and the "Follow along" row. */
  icon: boolean;
};

// Every href below was copied from the links on the portfolio page, not guessed.
export const PORTFOLIO_URL = "https://nfcportfolio-two.vercel.app/";

/** Outbound portfolio links carry ?ref=tankialert so the portfolio's own analytics can see this traffic. */
export const PORTFOLIO_LINK = `${PORTFOLIO_URL}?ref=tankialert`;

export const MAKER = {
  name: "Chetan Pujari",
  place: "Pune, India",
  bio: "AI educator in Pune, India. 400K+ students have learned to build with AI from my courses, and I ship small, useful apps like this one on the side.",
  socials: [
    { platform: "x", label: "X", href: "https://x.com/Chetanpujari51", icon: true },
    { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/_chetan_pujari/", icon: true },
    { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@ImaginaryProgrammer", icon: true },
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/chetan-pujari-ai", icon: true },
    { platform: "github", label: "GitHub", href: "https://github.com/chetanpujari5105", icon: true },
    { platform: "substack", label: "Substack", href: "https://chetanpujari.substack.com/", icon: true },
    { platform: "instagram_ai", label: "AI Instagram", href: "https://www.instagram.com/_chetan_pujari_/", icon: false },
    { platform: "udemy", label: "Udemy", href: "https://www.udemy.com/user/chetan-pujari-3/", icon: false },
  ] satisfies Social[],
};

/**
 * Optional: a real screenshot of the popover (e.g. "/img/popover.webp", about 560px wide, in /public).
 * When empty, the showcase renders a faithful HTML replica of the popover.
 */
export const POPOVER_SCREENSHOT = "";
