"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
  A ribbed rooftop water tank that is also a battery (the lid is the terminal nub).
  The water level is simulated in one rAF loop that writes SVG attributes directly, with no React renders per frame.
*/

const X0 = 70;
const X1 = 290;
const Y_EMPTY = 398;
const Y_FULL = 58;
const levelToY = (lv: number) => Y_EMPTY - (Y_EMPTY - Y_FULL) * (lv / 100);

function wave(y: number, amp: number, len: number, phase: number) {
  let d = `M${X0 - 4},${y + amp * Math.sin(((X0 - 4) / len) * Math.PI * 2 + phase)}`;
  for (let x = X0; x <= X1 + 4; x += 6) {
    d += ` L${x},${(y + amp * Math.sin((x / len) * Math.PI * 2 + phase)).toFixed(2)}`;
  }
  return d;
}

export type TankProps = {
  /** Where the water is heading (0–100). */
  target: number;
  /** "charge" fills at charger speed; "follow" tracks the slider. */
  mode: "charge" | "follow";
  threshold: number;
  /** Fires once each time the water settles on the target. */
  onSettle?: (level: number) => void;
  /** Called when the rounded % changes, for the popover status line. */
  onPercent?: (pct: number) => void;
  /** Increment to play the "ting" moment. */
  tingKey: number;
  className?: string;
};

const DROPS = Array.from({ length: 14 }, (_, i) => {
  const t = i / 13;
  return {
    dx: (t - 0.5) * 260 + (i % 3) * 8,
    up: 70 + ((i * 37) % 60),
    fall: 120 + ((i * 53) % 90),
    s: 0.6 + ((i * 29) % 10) / 20,
    delay: (i % 4) * 30,
  };
});

export default function Tank({ target, mode, threshold, onSettle, onPercent, tingKey, className }: TankProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const crestRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const pctRef = useRef<SVGTextElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dropsRef = useRef<HTMLDivElement>(null);

  const sim = useRef({ level: 22, phase: 0, agitation: 0, lastPct: -1, settled: false });
  const live = useRef({ target, mode, onSettle, onPercent });
  useLayoutEffect(() => {
    live.current = { target, mode, onSettle, onPercent };
  });

  const [full, setFull] = useState(false);
  // The bubble shows for the latest ting until its timer hides it.
  const [hiddenKey, setHiddenKey] = useState(0);
  const bubble = tingKey > 0 && hiddenKey !== tingKey;

  // Each new target means "not settled yet".
  useEffect(() => {
    sim.current.settled = false;
  }, [target]);

  // The simulation loop
  useEffect(() => {
    const s = sim.current;
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const draw = () => {
      const y = levelToY(s.level);
      const amp = 4 + s.agitation * 9;
      const f = wave(y, amp, 150, s.phase);
      const closing = ` L${X1 + 4},${Y_EMPTY + 12} L${X0 - 4},${Y_EMPTY + 12} Z`;
      frontRef.current?.setAttribute("d", f + closing);
      clipRef.current?.setAttribute("d", f + closing);
      crestRef.current?.setAttribute("d", f);
      backRef.current?.setAttribute("d", wave(y - 3, amp * 0.8, 210, -s.phase * 0.7 + 1.7) + closing);
      const pct = Math.round(s.level);
      if (pct !== s.lastPct) {
        s.lastPct = pct;
        if (pctRef.current) pctRef.current.firstChild!.textContent = String(pct);
        live.current.onPercent?.(pct);
        setFull(pct >= 100);
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { target: tgt, mode: md } = live.current;
      const diff = tgt - s.level;
      if (Math.abs(diff) > 0.05) {
        if (md === "charge") {
          // A charger slows near the top, like the real thing.
          const speed = 9 + Math.min(20, Math.abs(diff) * 0.9);
          s.level += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
        } else {
          s.level += diff * Math.min(1, dt * 10);
        }
      } else if (!s.settled) {
        s.level = tgt;
        s.settled = true;
        live.current.onSettle?.(tgt);
      }
      s.phase += dt * 2.2;
      s.agitation = Math.max(0, s.agitation - dt * 0.6);
      draw();
      if (visible) raf = requestAnimationFrame(step);
    };

    if (reduce) {
      // No motion: jump straight to the target and draw a calm, still surface.
      s.level = live.current.target;
      s.agitation = 0;
      draw();
      if (!s.settled) {
        s.settled = true;
        live.current.onSettle?.(s.level);
      }
      return;
    }

    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting && document.visibilityState === "visible";
      if (visible && !was) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    });
    if (svgRef.current) io.observe(svgRef.current);
    const onVis = () => {
      if (document.visibilityState !== "visible") visible = false;
      else if (!visible) {
        visible = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce, target]);

  // The ting: agitate the surface, throw droplets, show the bubble.
  useEffect(() => {
    if (!tingKey) return;
    const hide = window.setTimeout(() => setHiddenKey(tingKey), 4200);
    if (reduce) return () => window.clearTimeout(hide);
    sim.current.agitation = 1;
    const host = dropsRef.current;
    const anims: Animation[] = [];
    host?.querySelectorAll<HTMLElement>("[data-drop]").forEach((el, i) => {
      const d = DROPS[i];
      anims.push(
        el.animate(
          [
            { transform: `translate3d(0,0,0) scale(${d.s})`, opacity: 0 },
            { transform: `translate3d(${d.dx * 0.55}px,${-d.up}px,0) scale(${d.s})`, opacity: 1, offset: 0.4 },
            { transform: `translate3d(${d.dx}px,${d.fall}px,0) scale(${d.s * 0.8})`, opacity: 0 },
          ],
          { duration: 1100, delay: d.delay, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
        ),
      );
    });
    return () => {
      window.clearTimeout(hide);
      anims.forEach((a) => a.cancel());
    };
  }, [tingKey, reduce]);

  const ty = levelToY(threshold);
  const initial = wave(levelToY(22), 4, 150, 0);
  const closing = ` L${X1 + 4},${Y_EMPTY + 12} L${X0 - 4},${Y_EMPTY + 12} Z`;

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Glow behind the tank */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[18%] rounded-full opacity-70 blur-3xl transition-colors duration-700"
        style={{
          background: full
            ? "radial-gradient(closest-side, rgb(60 227 216 / .32), transparent)"
            : "radial-gradient(closest-side, rgb(47 107 255 / .28), transparent)",
        }}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 300 470"
        className="relative block h-auto w-full overflow-visible"
        role="img"
        aria-label={`A water tank shaped like a battery, filling with water. The alert line is at ${threshold}%.`}
      >
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#9cc4ff" stopOpacity=".16" />
            <stop offset=".22" stopColor="#9cc4ff" stopOpacity=".05" />
            <stop offset=".7" stopColor="#9cc4ff" stopOpacity=".03" />
            <stop offset="1" stopColor="#9cc4ff" stopOpacity=".14" />
          </linearGradient>
          <linearGradient id={`water-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3ce3d8" />
            <stop offset=".45" stopColor="#1fa6ea" />
            <stop offset="1" stopColor="#1a3fc0" />
          </linearGradient>
          <linearGradient id={`shade-${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#020611" stopOpacity=".55" />
            <stop offset=".18" stopColor="#020611" stopOpacity="0" />
            <stop offset=".8" stopColor="#020611" stopOpacity="0" />
            <stop offset="1" stopColor="#020611" stopOpacity=".6" />
          </linearGradient>
          <linearGradient id={`lid-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5d7bb0" />
            <stop offset="1" stopColor="#2b3f68" />
          </linearGradient>
          <clipPath id={`inner-${uid}`}>
            <path d="M78,106 C78,72 108,52 150,52 H210 C252,52 282,72 282,106 V390 Q282,398 274,398 H86 Q78,398 78,390 Z" />
          </clipPath>
          <clipPath id={`waterclip-${uid}`}>
            <path ref={clipRef} d={initial + closing} />
          </clipPath>
        </defs>

        {/* Stand */}
        <g stroke="#33476e" strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M92 412 V458 M140 412 V458 M220 412 V458 M268 412 V458" />
          <path d="M92 448 L140 420 M140 448 L92 420 M220 448 L268 420 M268 448 L220 420" strokeWidth="3" opacity=".7" />
        </g>
        <rect x="76" y="404" width="208" height="10" rx="3" fill="#3a5080" />

        {/* Overflow pipe */}
        <path d="M76 94 H44 Q30 94 30 108 V126" stroke="#3d5584" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M76 94 H44 Q30 94 30 108 V126" stroke="#7d97c8" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(-2 -3)" />

        {/* Overflow stream: only when the tank is full */}
        <g
          style={{ opacity: full ? 1 : 0, transition: "opacity 500ms var(--ease-out)" }}
          aria-hidden
        >
          <path
            d="M30 130 C31 220 27 330 25 462"
            stroke="#3ce3d8"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="14 6"
            style={{ animation: reduce ? "none" : "pour .5s linear infinite" }}
          />
          <ellipse cx="25" cy="463" rx="16" ry="3.5" fill="#3ce3d8" opacity=".55" />
        </g>

        {/* Body (glass) */}
        <path
          d="M70,104 C70,66 104,44 150,44 H210 C256,44 290,66 290,104 V392 Q290,406 276,406 H84 Q70,406 70,392 Z"
          fill={`url(#glass-${uid})`}
          stroke="#aad2ff"
          strokeOpacity=".38"
          strokeWidth="1.5"
        />

        {/* Water */}
        <g clipPath={`url(#inner-${uid})`}>
          <path ref={backRef} d={initial + closing} fill="#2f6bff" opacity=".55" />
          <path ref={frontRef} d={initial + closing} fill={`url(#water-${uid})`} />
          <path ref={crestRef} d={initial} fill="none" stroke="#c9fffb" strokeOpacity=".7" strokeWidth="1.6" />
          {!reduce && (
            <g clipPath={`url(#waterclip-${uid})`} fill="#e6fffd" aria-hidden>
              {[96, 132, 168, 204, 236, 262].map((x, i) => (
                <circle
                  key={x}
                  cx={x}
                  cy={392}
                  r={2 + (i % 3)}
                  opacity="0"
                  style={
                    {
                      animation: `bubble-rise ${3.2 + (i % 3) * 0.9}s ${i * 0.7}s infinite cubic-bezier(0.23,1,0.32,1)`,
                      "--dx": `${(i % 2 ? 1 : -1) * 8}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </g>
          )}
          {/* Ripple on the ting */}
          {tingKey > 0 && !reduce && (
            <ellipse
              key={tingKey}
              cx="180"
              cy={levelToY(Math.min(target, 100)) + 2}
              rx="60"
              ry="8"
              fill="none"
              stroke="#e6fffd"
              strokeWidth="2"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: "pulse-ring 1.1s cubic-bezier(0.23,1,0.32,1) both",
              }}
            />
          )}
        </g>

        {/* Cylinder shading and ribs, drawn over the water so it reads as inside */}
        <path
          d="M70,104 C70,66 104,44 150,44 H210 C256,44 290,66 290,104 V392 Q290,406 276,406 H84 Q70,406 70,392 Z"
          fill={`url(#shade-${uid})`}
        />
        <g fill="none" strokeLinecap="round">
          {[150, 230, 310].map((y) => (
            <g key={y}>
              <path d={`M71 ${y} Q180 ${y + 16} 289 ${y}`} stroke="#020611" strokeOpacity=".45" strokeWidth="3" />
              <path d={`M71 ${y + 3} Q180 ${y + 19} 289 ${y + 3}`} stroke="#cfe3ff" strokeOpacity=".22" strokeWidth="1.2" />
            </g>
          ))}
        </g>
        <rect x="92" y="96" width="9" height="282" rx="4.5" fill="#fff" opacity=".09" />

        {/* Painted lettering, as on a real Sintex-style tank */}
        <text
          x="180"
          y="138"
          textAnchor="middle"
          className="deva"
          fontSize="26"
          fontWeight="700"
          fill="#eaf2ff"
          fillOpacity=".55"
        >
          टंकी
        </text>

        {/* Lid = battery terminal */}
        <rect x="150" y="30" width="60" height="18" rx="4" fill="#2b3f68" />
        <rect x="136" y="10" width="88" height="26" rx="10" fill={`url(#lid-${uid})`} />
        <rect x="146" y="14" width="56" height="4" rx="2" fill="#fff" opacity=".22" />

        {/* Threshold marker */}
        <g style={{ transition: "transform 200ms var(--ease-out)" }} transform={`translate(0 ${ty})`}>
          <line x1="80" x2="280" y1="0" y2="0" stroke="#ffb23f" strokeWidth="1.5" strokeDasharray="5 5" opacity=".9" />
          <text
            x="108"
            y="-7"
            fontSize="13"
            fontWeight="800"
            fill="#ffb23f"
            stroke="#04122a"
            strokeWidth="3.5"
            strokeOpacity=".75"
            paintOrder="stroke"
            letterSpacing=".04em"
            className="font-display tnum"
          >
            ALERT {threshold}%
          </text>
        </g>

        {/* Readout */}
        <text
          ref={pctRef}
          x="180"
          y="282"
          textAnchor="middle"
          className="font-display tnum"
          fontSize="76"
          fontWeight="800"
          fill="#ffffff"
          stroke="#04122a"
          strokeOpacity=".35"
          strokeWidth="6"
          paintOrder="stroke"
          letterSpacing="-2"
          aria-hidden
        >
          22<tspan fontSize="34" dx="4" dy="-30" fontWeight="700">%</tspan>
        </text>

        {/* "Ting" marks, like on the app icon */}
        <AnimatePresence>
          {bubble && (
            <m.g
              key={`spark-${tingKey}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", duration: 0.5, bounce: 0.35 }}
              style={{ transformOrigin: "236px 26px" }}
              stroke="#ffb23f"
              strokeWidth="6"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M240 20 L250 -2" />
              <path d="M256 30 L276 16" />
              <path d="M260 46 L284 46" />
            </m.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Droplets */}
      <div ref={dropsRef} aria-hidden className="pointer-events-none absolute left-[60%] top-[16%] h-0 w-0">
        {DROPS.map((_, i) => (
          <span key={i} data-drop className="absolute -left-[6px] top-0 block opacity-0">
            <svg width="12" height="18" viewBox="0 0 12 18">
              <path d="M6 0C6 0 12 8 12 12A6 6 0 0 1 0 12C0 8 6 0 6 0Z" fill="#3ce3d8" />
            </svg>
          </span>
        ))}
      </div>

      {/* Speech bubble */}
      <div className="pointer-events-none absolute left-[-4%] top-[-9%] lg:left-[-10%]" aria-live="polite">
        <AnimatePresence>
          {bubble && (
            <m.div
              key={`bubble-${tingKey}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px) scale(0.92)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-6px) scale(0.97)" }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", duration: 0.55, bounce: 0.3 }}
              style={{ transformOrigin: "80% 100%" }}
              className="relative rounded-2xl bg-marigold px-4 py-2.5 text-night shadow-[0_12px_30px_-8px_rgb(255_178_63/0.55)]"
            >
              <p className="font-display text-[1.05rem] font-extrabold leading-tight whitespace-nowrap">
                Tanki bhar gayi! 💧
              </p>
              <p lang="hi" className="deva text-[0.78rem] font-semibold leading-tight text-night/75">
                पानी की टंकी भर गई!
              </p>
              <svg className="absolute -bottom-[9px] right-6" width="18" height="10" viewBox="0 0 18 10" aria-hidden>
                <path d="M0 0 H18 L14 10 Z" fill="#ffb23f" />
              </svg>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
