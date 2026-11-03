"use client";

import { useEffect, useState } from "react";

/*
  A household water-level indicator, the little box with LEDs and a buzzer that many Indian homes mount in the
  kitchen. Scrolling the page fills it. The top LED (the buzzer) lights marigold only when the final CTA's tank is
  full, which FinalCta announces with the "tanki:full" event.
*/

function useTankLevel() {
  const [lit, setLit] = useState(1);
  const [full, setFull] = useState(false);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setLit(p > 0.62 ? 4 : p > 0.36 ? 3 : p > 0.12 ? 2 : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onFull = (e: Event) => setFull((e as CustomEvent<boolean>).detail);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("tanki:full", onFull);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("tanki:full", onFull);
      cancelAnimationFrame(raf);
    };
  }, []);
  return { lit, full };
}

/** Compact five-dot version for the nav (tablet and laptop widths). */
export default function LevelGauge() {
  const { lit, full } = useTankLevel();
  return (
    <div aria-hidden title="Tanki level" className="gauge hidden items-center gap-[5px] rounded-full border border-line px-2.5 py-2 max-md:sm:flex lg:flex xl:hidden">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= lit ? "on" : ""} />
      ))}
      <span className={full ? "on buzz" : ""} />
    </div>
  );
}

const LEVELS = ["25", "50", "75"];

/** The full indicator panel, fixed to the right edge on wide screens. */
export function LevelLadder() {
  const { lit, full } = useTankLevel();
  return (
    <div
      aria-hidden
      className="ladder pointer-events-none fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 rounded-[14px] border border-line bg-night/70 px-2 py-3 backdrop-blur-md xl:flex"
    >
      <span className={`led led-buzz ${full ? "on" : ""}`} />
      <span className="tnum font-display text-[9px] font-bold tracking-[0.06em] text-haze">100</span>
      {[...LEVELS].reverse().map((l, i) => {
        const n = 3 - i + 1; // 75 → 4, 50 → 3, 25 → 2
        return (
          <span key={l} className="flex flex-col items-center gap-1">
            <span className={`led ${lit >= n ? "on" : ""}`} />
            <span className="tnum font-display text-[9px] font-bold tracking-[0.06em] text-haze">{l}</span>
          </span>
        );
      })}
      <span className={`led ${lit >= 1 ? "on" : ""}`} />
    </div>
  );
}
