"use client";

import { useRef } from "react";
import { m, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Wifi } from "lucide-react";
import MacPopover, { MenuBarGlyph } from "./MacPopover";
import { POPOVER_SCREENSHOT } from "@/lib/config";

const NOTES = [
  ["Live status", "See your battery % and whether it's charging."],
  ["Alert at", "Slide the threshold anywhere from 50% to 100%."],
  ["Play sound 1–5×", "One ting, or five for heavy sleepers."],
  ["Choose · Test", "Swap the sound and preview it instantly."],
  ["Launch at login", "Turn it on once, and it starts with your Mac every time."],
];

export default function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });
  const transform = useMotionTemplate`perspective(1200px) rotateX(${srx}deg) rotateY(${sry}deg)`;

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 10);
  };

  return (
    <section aria-labelledby="show-title" className="wrap py-24 sm:py-32">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2
            id="show-title"
            data-reveal
            className="font-display text-[clamp(2.3rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.035em]"
          >
            One tiny popover. That’s the whole app.
          </h2>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {NOTES.map(([k, v], i) => (
              <div
                key={k}
                data-reveal
                style={{ "--d": i } as React.CSSProperties}
                className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <dt className="font-display font-bold text-ink">{k}</dt>
                <dd className="text-mist">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={() => {
            rx.set(0);
            ry.set(0);
          }}
          data-reveal
          style={{ "--d": 1 } as React.CSSProperties}
          className="relative"
        >
          <m.figure
            style={reduce ? undefined : { transform }}
            className="relative overflow-hidden rounded-[18px] border border-line-strong shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]"
          >
            {/* Desktop wallpaper: the rooftop at dusk */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 80% at 25% 100%, rgb(47 107 255 / .55), transparent 70%), radial-gradient(50% 60% at 85% 20%, rgb(60 227 216 / .25), transparent 70%), linear-gradient(160deg, #0f1d44, #070c1a)",
              }}
            />
            <div
              className="relative flex h-7 items-center justify-end gap-3 border-b border-white/10 bg-black/25 px-3 text-[12px] text-white/90 backdrop-blur-md"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              aria-hidden
            >
              <span className="mr-auto font-semibold">Finder</span>
              <span className="grid h-5 place-items-center rounded-[4px] bg-white/25 px-1.5">
                <MenuBarGlyph size={16} />
              </span>
              <Wifi size={13} strokeWidth={2.2} />
              <span className="tnum">Tue 9:41 PM</span>
            </div>
            <div className="relative flex justify-end px-4 pt-2 pb-10 sm:px-10 sm:pb-14">
              {POPOVER_SCREENSHOT ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={POPOVER_SCREENSHOT} alt="The TankiAlert popover in the macOS menu bar" className="w-[280px]" loading="lazy" />
              ) : (
                <MacPopover
                  interactive={false}
                  className="mr-0 sm:mr-6"
                  state={{
                    percent: 85,
                    enabled: true,
                    threshold: 85,
                    repeats: 2,
                    soundName: "Default: tanki.mp3",
                    customSound: false,
                    playing: false,
                    lastAlert: "9:41 PM",
                    launchAtLogin: true,
                  }}
                />
              )}
            </div>
            <figcaption className="sr-only">
              The TankiAlert popover: battery status, an Alert enabled checkbox, the Alert at slider, the repeat stepper,
              the Choose Sound and Test Sound buttons, and Launch at login.
            </figcaption>
          </m.figure>
        </div>
      </div>
    </section>
  );
}
