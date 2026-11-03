import { track as vercelTrack } from "@vercel/analytics";

/**
 * Privacy-friendly custom events, sent to Vercel Web Analytics (no cookies, no personal data).
 * Never pass the UPI ID, names, or anything that identifies a person: only the event name and coarse props.
 */
export type TrackEvent =
  | "download_click"
  | "sound_play"
  | "donate_click"
  | "donate_copy_upi"
  | "github_click"
  | "faq_open";

type Props = Record<string, string | number | boolean>;

export function track(name: TrackEvent, props?: Props) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", name, props ?? {});
  }
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break a click.
  }
}
