"use client";

import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowDownToLine, Music2, PlugZap } from "lucide-react";

const STEPS = [
  {
    icon: ArrowDownToLine,
    title: "Download",
    body: "Unzip it and drag TankiAlert into Applications. The first time you open it, right-click it and choose Open (the FAQ explains why).",
  },
  {
    icon: Music2,
    title: "Pick your sound",
    body: "Click the battery icon in the menu bar. Keep the tanki clip or choose your own, then set the % and how many times it plays.",
  },
  {
    icon: PlugZap,
    title: "Plug in and relax",
    body: "Charge as usual. When the battery reaches your %, the tanki rings once. It re-arms the next time you plug in.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0.04, 1]);
  const transformX = useTransform(fill, (v) => `scaleX(${reduce ? 1 : v})`);
  const transformY = useTransform(fill, (v) => `scaleY(${reduce ? 1 : v})`);

  return (
    <section id="how" aria-labelledby="how-title" className="relative border-t border-line bg-night-2 py-24 sm:py-32">
      <div className="wrap">
        <h2
          id="how-title"
          data-reveal
          className="max-w-[40rem] font-display text-[clamp(2.3rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.035em]"
        >
          Set it up once. Forget it forever.
        </h2>

        <ol ref={ref} className="relative mt-14 grid grid-cols-1 gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
          {/* The pipe: vertical on phones, horizontal from md up */}
          <div aria-hidden className="absolute top-2 bottom-2 left-[27px] w-[6px] rounded-full bg-[#18264a] md:inset-x-[8%] md:top-[25px] md:bottom-auto md:left-[8%] md:h-[6px] md:w-auto">
            <m.div
              className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,#3ce3d8,#2f6bff)] md:hidden"
              style={{ transform: transformY }}
            />
            <m.div
              className="absolute inset-0 hidden origin-left rounded-full bg-[linear-gradient(90deg,#3ce3d8,#2f6bff)] md:block"
              style={{ transform: transformX }}
            />
          </div>

          {STEPS.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              style={{ "--d": i } as React.CSSProperties}
              className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-5 md:grid-cols-1 md:justify-items-center md:text-center"
            >
              <span className="relative z-10 grid size-14 md:mb-1 place-items-center rounded-full border-2 border-[#22345f] bg-night text-aqua shadow-[0_0_0_6px_var(--color-night-2)]">
                <s.icon size={22} strokeWidth={2} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-[1.6rem] font-bold leading-tight tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 max-w-[34ch] text-mist md:mx-auto">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
