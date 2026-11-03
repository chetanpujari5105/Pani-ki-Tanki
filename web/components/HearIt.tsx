"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { sound } from "@/lib/sound";
import { TANKI_DURATION, TANKI_PEAKS } from "@/lib/peaks";
import { track } from "@/lib/analytics";

const OWNER = "hear";
const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

export default function HearIt() {
  const snap = useSyncExternalStore(sound.subscribe, sound.getSnapshot, sound.getServerSnapshot);
  const mine = snap.owner === OWNER;
  const playing = snap.playing && mine;
  const [rawT, setT] = useState(0);
  const t = mine ? rawT : 0;
  const barsRef = useRef<HTMLDivElement>(null);

  // Follow the playhead while this player owns the audio.
  useEffect(() => {
    if (!mine) return;
    let raf = 0;
    const tick = () => {
      const a = sound.element;
      if (a) setT(a.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mine, playing]);

  // Links marked data-play-hear (e.g. "Hear the sound" in the hero) scroll here and start playback.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-play-hear]")) {
        track("sound_play", { location: "link" });
        void sound.play({ owner: OWNER });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const start = (from = 0) => {
    track("sound_play", { location: "hear-it" });
    void sound.play({ owner: OWNER, from });
  };
  const toggle = () => (playing ? sound.stop() : start(t > 0 && t < TANKI_DURATION - 0.2 ? t : 0));
  const seek = (sec: number) => {
    const s = Math.max(0, Math.min(TANKI_DURATION - 0.1, sec));
    if (playing && sound.element) sound.element.currentTime = s;
    else start(s);
  };

  const progress = Math.min(1, t / TANKI_DURATION);
  const n = TANKI_PEAKS.length;

  return (
    <section id="hear" aria-labelledby="hear-title" className="relative border-y border-line bg-night-2">
      <div className="wrap grid grid-cols-1 items-center gap-x-10 gap-y-6 py-12 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:py-14">
        <div data-reveal>
          <h2 id="hear-title" className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.03em]">
            Hear it.
          </h2>
          <p className="mt-2 text-mist">The default sound. Turn your volume up.</p>
        </div>

        <div data-reveal style={{ "--d": 1 } as React.CSSProperties} className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause the TankiAlert sound" : "Play the TankiAlert sound"}
            className="relative grid size-16 shrink-0 place-items-center rounded-full bg-aqua text-night shadow-[0_10px_30px_-10px_rgb(60_227_216/0.8)] transition-transform duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.95]"
          >
            {playing && (
              <span aria-hidden className="absolute inset-0 rounded-full border-2 border-aqua motion-safe:animate-[pulse-ring_1.6s_var(--ease-out)_infinite]" />
            )}
            {playing ? (
              <Pause size={24} fill="currentColor" strokeWidth={0} aria-hidden />
            ) : (
              <Play size={24} fill="currentColor" strokeWidth={0} aria-hidden className="translate-x-[2px]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div
              ref={barsRef}
              role="slider"
              tabIndex={0}
              aria-label="Sound position"
              aria-valuemin={0}
              aria-valuemax={Math.round(TANKI_DURATION)}
              aria-valuenow={Math.round(t)}
              aria-valuetext={`${Math.floor(t)} of ${Math.round(TANKI_DURATION)} seconds`}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - r.left) / r.width) * TANKI_DURATION);
              }}
              onKeyDown={(e) => {
                const k = e.key;
                if (!["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "Home", " ", "Enter"].includes(k)) return;
                e.preventDefault();
                if (k === "ArrowRight" || k === "ArrowUp") seek(t + 1);
                else if (k === "ArrowLeft" || k === "ArrowDown") seek(t - 1);
                else if (k === "Home") seek(0);
                else toggle();
              }}
              className="flex h-16 cursor-pointer items-center gap-[2px] rounded-md lg:gap-[3px]"
            >
              {TANKI_PEAKS.map((p, i) => {
                const played = i / n < progress;
                const head = playing && Math.abs(i / n - progress) < 1.5 / n;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="min-w-px flex-1 rounded-full transition-colors duration-150"
                    style={{
                      height: `${Math.max(8, p * 100)}%`,
                      background: head ? "#ffffff" : played ? "#3ce3d8" : "rgb(150 190 255 / 0.26)",
                    }}
                  />
                );
              })}
            </div>
            <div className="tnum mt-2 flex justify-between text-[0.85rem] text-haze">
              <span>{fmt(t)}</span>
              <span>tanki.mp3 · 0:{Math.round(TANKI_DURATION)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
