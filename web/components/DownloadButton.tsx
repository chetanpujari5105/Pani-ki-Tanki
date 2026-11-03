"use client";

import { useRef } from "react";
import { m, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { APP_SIZE, APP_VERSION, DOWNLOAD_URL } from "@/lib/config";
import { track } from "@/lib/analytics";

function DownloadGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5v11m0 0 4.5-4.5M12 14.5 7.5 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 15.5v1.8A3.2 3.2 0 0 0 7.7 20.5h8.6a3.2 3.2 0 0 0 3.2-3.2v-1.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** The primary CTA. Magnetic on fine pointers; a column of water rises inside on hover. */
export default function DownloadButton({
  location,
  size = "lg",
  className = "",
}: {
  location: "nav" | "hero" | "final";
  size?: "sm" | "lg";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 220, damping: 16, mass: 0.6 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;
  const magnetic = size === "lg" && !reduce;

  const onMove = (e: React.PointerEvent) => {
    if (!magnetic || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const lg = size === "lg";
  return (
    <m.a
      ref={ref}
      href={DOWNLOAD_URL}
      onClick={() => track("download_click", { location, version: APP_VERSION })}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={magnetic ? { transform } : undefined}
      className={`group relative inline-flex select-none items-center justify-center overflow-hidden font-display font-bold text-night transition-[box-shadow] duration-300 [transition-timing-function:var(--ease-out)] active:scale-[0.97] ${
        lg
          ? "h-14 gap-2.5 rounded-[14px] bg-aqua px-7 text-[1.075rem] shadow-[0_10px_30px_-10px_rgb(60_227_216/0.7),inset_0_1px_0_rgb(255_255_255/0.5)] hover:shadow-[0_16px_44px_-10px_rgb(60_227_216/0.85),inset_0_1px_0_rgb(255_255_255/0.5)]"
          : "h-10 gap-2 rounded-[10px] bg-aqua px-4 text-[0.95rem] shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]"
      } ${className}`}
    >
      {/* Rising water on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-10%] top-0 bottom-0 flex translate-y-[calc(100%+14px)] flex-col transition-transform duration-500 [transition-timing-function:var(--ease-out)] motion-reduce:hidden [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-[18%]"
      >
        <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="-mt-3 block h-3 w-full shrink-0">
          <path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 V20 H0Z" fill="#a8fff8" />
        </svg>
        <span className="block w-full flex-1 bg-[#a8fff8]" />
      </span>
      <span className="relative flex items-center gap-[inherit]">
        <DownloadGlyph size={lg ? 21 : 18} />
        {lg ? "Download for Mac" : "Download"}
        <span className="sr-only">{`, TankiAlert ${APP_VERSION}, ${APP_SIZE} zip`}</span>
      </span>
    </m.a>
  );
}
