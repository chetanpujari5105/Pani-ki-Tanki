"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import DownloadButton from "./DownloadButton";
import { APP_SIZE, APP_VERSION } from "@/lib/config";

const WAVE =
  "M0 20 Q90 4 180 20" + Array.from({ length: 15 }, (_, i) => ` T${360 + i * 180} 20`).join("") + " V40 H0Z";

/** The page ends the way the app does: the water rises as you scroll, and the tanki fills. */
export default function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 12%"] });
  const level = useTransform(scrollYProgress, [0.2, 0.97], [0, 1], { clamp: true });
  const transform = useTransform(level, (v) => `translate3d(0, ${(1 - (reduce ? 1 : v)) * 100}%, 0)`);
  const [full, setFull] = useState(false);
  useMotionValueEvent(level, "change", (v) => {
    if (v >= 0.995 && !full) {
      setFull(true);
      window.dispatchEvent(new CustomEvent("tanki:full", { detail: true }));
    }
    if (v < 0.9 && full) {
      setFull(false);
      window.dispatchEvent(new CustomEvent("tanki:full", { detail: false }));
    }
  });
  const showBubble = full || reduce;

  return (
    <section ref={ref} aria-labelledby="final-title" className="relative isolate overflow-hidden border-t border-line">
      {/* Rising water */}
      <m.div aria-hidden style={{ transform }} className="absolute inset-0 -z-10 will-change-transform">
        <svg viewBox="0 0 2880 40" preserveAspectRatio="none" className="absolute -top-[30px] left-0 h-[32px] w-[200%] motion-safe:animate-[drift_9s_linear_infinite]">
          <path d={WAVE} fill="#1f56d8" />
        </svg>
        <div className="absolute inset-x-0 -top-[2px] h-[3px] bg-aqua/70 blur-[1px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1f56d8_0%,#1440a8_40%,#0b2466_100%)]" />
      </m.div>

      <div className="wrap relative flex min-h-[78svh] flex-col items-center justify-center py-28 text-center">
        <div className="relative">
          <AnimatePresence>
            {showBubble && (
              <m.p
                initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px) scale(0.92)" }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", duration: 0.55, bounce: 0.3 }}
                className="absolute -top-16 left-1/2 -ml-[86px] w-[172px] rounded-2xl bg-marigold px-4 py-2 font-display text-[1.02rem] font-extrabold text-night shadow-[0_12px_30px_-8px_rgb(255_178_63/0.55)] sm:-top-20"
                style={{ transformOrigin: "50% 100%" }}
              >
                Tanki bhar gayi! 💧
                <svg className="absolute -bottom-[9px] left-1/2 -ml-2" width="16" height="10" viewBox="0 0 16 10" aria-hidden>
                  <path d="M0 0 H16 L8 10 Z" fill="#ffb23f" />
                </svg>
              </m.p>
            )}
          </AnimatePresence>
          <h2
            id="final-title"
            className="max-w-[14ch] font-display text-[clamp(2.8rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
          >
            Unplug on time. Laugh every time.
          </h2>
        </div>
        <p className="mt-6 max-w-[36rem] text-[1.15rem] text-ink/85">
          It’s free, it’s {APP_SIZE}, and your MacBook’s battery will thank you. Your neighbours might not.
        </p>
        <div className="mt-9 flex flex-col items-center gap-4">
          <DownloadButton location="final" />
          <p className="tnum text-[0.9rem] text-ink/75">
            v{APP_VERSION} · macOS 13+ · Apple Silicon &amp; Intel
          </p>
        </div>
      </div>
    </section>
  );
}
