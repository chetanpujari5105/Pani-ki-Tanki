import { ArrowUpRight, Wifi } from "lucide-react";
import SidekickLink from "./SidekickLink";

/**
 * A phone and a Mac window, linked over Wi-Fi: two drops travel the line, one each way.
 * Drawn in HTML/CSS (nothing taken from sidekickapp.in). Still under reduced motion; paused off screen.
 */
function LinkArt() {
  return (
    <div aria-hidden className="micro flex shrink-0 items-center">
      {/* Phone */}
      <div className="relative h-[58px] w-[32px] rounded-[8px] border border-line-strong bg-night p-[3px]">
        <div className="flex h-full flex-col gap-[3px] rounded-[5px] bg-night-3 p-[3px]">
          <span className="h-[3px] w-3/4 rounded-full bg-mist/40" />
          <span className="h-[3px] w-1/2 rounded-full bg-mist/25" />
          <span className="mt-auto h-[9px] rounded-[2px] bg-aqua/30" />
        </div>
      </div>

      {/* The link: a dotted pipe with a drop running each way */}
      <div className="relative mx-2 flex h-[58px] w-[54px] flex-col items-center justify-center">
        <Wifi size={13} strokeWidth={2.2} className="absolute top-1.5 text-haze" />
        <span className="relative mt-2 block h-[2px] w-full bg-[radial-gradient(circle,rgb(150_190_255/0.35)_1px,transparent_1.5px)] bg-[length:6px_2px]">
          <span
            className="absolute top-1/2 left-0 size-[6px] -translate-y-1/2 rounded-full bg-aqua shadow-[0_0_8px_rgb(60_227_216/0.8)]"
            style={{ animation: "sk-run 2.4s var(--ease-in-out) infinite" }}
          />
          <span
            className="absolute top-1/2 left-0 size-[6px] -translate-y-1/2 rounded-full bg-[#a8fff8] opacity-0 shadow-[0_0_8px_rgb(168_255_248/0.7)]"
            style={{ animation: "sk-run-back 2.4s 1.2s var(--ease-in-out) infinite" }}
          />
        </span>
      </div>

      {/* Mac window, mirroring the phone */}
      <div className="h-[58px] w-[86px] overflow-hidden rounded-[7px] border border-line-strong bg-night">
        <div className="flex h-[11px] items-center gap-[3px] border-b border-line px-[5px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-[4px] rounded-full bg-mist/35" />
          ))}
        </div>
        <div className="flex h-[45px] items-center gap-[5px] px-[6px]">
          <div className="flex h-[36px] w-[20px] flex-col gap-[2px] rounded-[4px] border border-line-strong bg-night-3 p-[2px]">
            <span className="h-[2px] w-3/4 rounded-full bg-mist/40" />
            <span className="mt-auto h-[6px] rounded-[1px] bg-aqua/30" />
          </div>
          <div className="flex flex-1 flex-col gap-[4px]">
            <span className="h-[3px] w-full rounded-full bg-mist/30" />
            <span className="h-[3px] w-2/3 rounded-full bg-mist/20" />
            <span className="h-[8px] w-full rounded-[2px] border border-line-strong" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Also by Chetan": a quiet cross-promo for Sidekick. Deliberately smaller and calmer than Download and Support. */
export default function SidekickPromo() {
  return (
    <aside
      aria-labelledby="sidekick-title"
      data-reveal
      className="mt-5 flex flex-col gap-5 rounded-2xl border border-line p-5 sm:p-6 md:flex-row md:items-center md:gap-7"
    >
      <LinkArt />
      <div className="min-w-0 flex-1">
        <h2 id="sidekick-title" className="font-display text-[1.15rem] font-bold leading-snug tracking-[-0.02em]">
          Also from the maker: Sidekick
        </h2>
        <p className="mt-1 max-w-[60ch] text-[0.95rem] text-mist">
          Mirror your Android phone, answer notifications and move files on your Mac. Over your own Wi-Fi, no cloud,
          no account.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <SidekickLink
          location="promo_card"
          className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line-strong px-4 font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-aqua hover:bg-aqua/[0.06]"
        >
          Get Sidekick (beta)
          <ArrowUpRight size={17} strokeWidth={2.2} aria-hidden />
        </SidekickLink>
        <p className="text-[0.85rem] text-haze">Apple silicon Macs · Android 10+ · Beta</p>
      </div>
    </aside>
  );
}
