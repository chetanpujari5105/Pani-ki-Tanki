import { ArrowUpRight } from "lucide-react";
import { MAKER } from "@/lib/config";
import { PortfolioLink, SocialIcons } from "./Socials";

/** Who made this, a way to see more of their work, and a "Follow along" row. Sits right below Support. */
export default function Maker() {
  return (
    <section aria-labelledby="maker-title" className="relative -mt-10 bg-night-2 pb-24 sm:-mt-16 sm:pb-32">
      <div className="wrap">
        <div
          data-reveal
          className="relative overflow-hidden rounded-2xl border border-line bg-night/60 p-6 sm:p-8 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-x-16"
        >
          {/* A faint ripple behind the card, the same water motif as the rest of the page */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-28 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(47_107_255/.22),transparent)] blur-2xl"
          />
          <div className="relative min-w-0">
            <p className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-aqua">Made by</p>
            <h2
              id="maker-title"
              className="mt-2 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em]"
            >
              {MAKER.name}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[1.05rem] text-mist">{MAKER.bio}</p>
            <PortfolioLink
              location="maker"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-[12px] bg-ink px-5 font-display font-bold text-night transition-[background-color,transform] duration-200 [transition-timing-function:var(--ease-out)] hover:bg-aqua active:scale-[0.97]"
            >
              See more of my work
              <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </PortfolioLink>
          </div>
          <div className="relative mt-8 border-t border-line pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <h3 id="follow-title" className="font-display text-[1.15rem] font-bold">
              Follow along
            </h3>
            <p className="mt-1 text-[0.95rem] text-haze">New tools, AI tips and behind-the-scenes builds.</p>
            <nav aria-labelledby="follow-title" className="mt-4">
              <SocialIcons />
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
