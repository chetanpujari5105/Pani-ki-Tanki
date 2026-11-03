"use client";

import { useId, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/** A faithful HTML replica of TankiAlert's real popover (Sources/ContentView.swift). */

export type PopoverState = {
  percent: number;
  enabled: boolean;
  threshold: number;
  repeats: number;
  soundName: string;
  customSound: boolean;
  playing: boolean;
  lastAlert: string | null;
  launchAtLogin: boolean;
};

type Handlers = {
  onEnabled?: (v: boolean) => void;
  onThreshold?: (v: number) => void;
  onThresholdCommit?: () => void;
  onRepeats?: (v: number) => void;
  onChooseSound?: (file: File) => void;
  onResetSound?: () => void;
  onTest?: () => void;
  onStop?: () => void;
  onLaunchAtLogin?: (v: boolean) => void;
  onQuit?: () => void;
};

const btn =
  "rounded-[6px] bg-white/[0.13] px-2.5 py-[3px] text-[13px] text-white/95 shadow-[0_0.5px_0_rgb(255_255_255/0.18)_inset,0_1px_1px_rgb(0_0_0/0.25)] transition-colors duration-150 hover:bg-white/[0.19] active:bg-white/[0.26] disabled:opacity-60";

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-white/95 select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="grid size-[15px] place-items-center rounded-[4px] border border-white/25 bg-white/10 transition-colors duration-150 peer-checked:border-transparent peer-checked:bg-[#3b82ff] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marigold [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4.2 3.6 6.6 9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </label>
  );
}

export default function MacPopover({
  state,
  interactive = true,
  className = "",
  ...h
}: { state: PopoverState; interactive?: boolean; className?: string } & Handlers) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const s = state;
  const status =
    s.percent >= 100 ? `${s.percent}% · 🔌 on AC, not charging` : `${s.percent}% · ⚡ charging`;
  const fill = ((s.threshold - 50) / 50) * 100;

  return (
    <div
      className={`w-[280px] max-w-full rounded-[12px] border border-white/[0.14] bg-[rgb(36_40_50/0.78)] p-4 text-left text-white shadow-[0_24px_60px_-12px_rgb(0_0_0/0.7),0_0_0_0.5px_rgb(0_0_0/0.6)] backdrop-blur-2xl backdrop-saturate-150 ${className}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", sans-serif' }}
      inert={!interactive}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/app-icon.webp" alt="" width={32} height={32} className="size-8" />
          <span className="text-[17px] font-bold tracking-[-0.01em]">TankiAlert</span>
        </div>
        <p className="tnum text-[13px] font-semibold" aria-live="off">
          {status}
        </p>

        <Check label="Alert enabled" checked={s.enabled} onChange={h.onEnabled} />

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-t`} className="tnum text-[13px] text-white/95">
            Alert at {s.threshold}%
          </label>
          <input
            id={`${id}-t`}
            type="range"
            min={50}
            max={100}
            step={1}
            value={s.threshold}
            aria-valuetext={`${s.threshold} percent`}
            onChange={(e) => h.onThreshold?.(Number(e.target.value))}
            onPointerUp={() => h.onThresholdCommit?.()}
            onKeyUp={(e) => {
              if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key))
                h.onThresholdCommit?.();
            }}
            className="mac-range"
            style={{ "--p": `${fill}%` } as React.CSSProperties}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="tnum text-[13px] text-white/95" id={`${id}-r`}>
            Play sound {s.repeats}×
          </span>
          <span
            role="group"
            aria-labelledby={`${id}-r`}
            className="flex flex-col overflow-hidden rounded-[5px] bg-white/[0.13] shadow-[0_0.5px_0_rgb(255_255_255/0.18)_inset]"
          >
            <button
              type="button"
              aria-label="Play one more time"
              disabled={s.repeats >= 5}
              onClick={() => h.onRepeats?.(Math.min(5, s.repeats + 1))}
              className="grid h-[11px] w-[15px] place-items-center hover:bg-white/15 disabled:opacity-40"
            >
              <ChevronUp size={10} strokeWidth={2.6} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Play one less time"
              disabled={s.repeats <= 1}
              onClick={() => h.onRepeats?.(Math.max(1, s.repeats - 1))}
              className="grid h-[11px] w-[15px] place-items-center hover:bg-white/15 disabled:opacity-40"
            >
              <ChevronDown size={10} strokeWidth={2.6} aria-hidden />
            </button>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
            Choose Sound…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,.mp3,.m4a,.wav"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) h.onChooseSound?.(f);
              e.target.value = "";
            }}
          />
          {s.playing ? (
            <button type="button" className={btn} onClick={h.onStop}>
              Stop
            </button>
          ) : (
            <button type="button" className={btn} onClick={h.onTest}>
              Test Sound
            </button>
          )}
        </div>
        <div className="-mt-1 flex min-w-0 items-center gap-1 text-[11px] text-white/60">
          <span className="truncate">{s.soundName}</span>
          {s.customSound && (
            <button type="button" onClick={h.onResetSound} className="shrink-0 text-[#6aa5ff] hover:underline">
              Reset
            </button>
          )}
        </div>

        {s.lastAlert && <p className="tnum -mt-1 text-[11px] text-white/60">Last alert: {s.lastAlert}</p>}

        <Check label="Launch at login" checked={s.launchAtLogin} onChange={h.onLaunchAtLogin} />

        <hr className="border-white/[0.12]" />
        <button
          type="button"
          onClick={h.onQuit}
          className="-mx-2 flex items-center justify-between rounded-[5px] px-2 py-0.5 text-left text-[13px] text-white/95 hover:bg-[#3b82ff]"
        >
          Quit TankiAlert <span className="text-white/50">⌘Q</span>
        </button>
      </div>
    </div>
  );
}

/** The menu-bar glyph TankiAlert shows: a battery with a bolt while on AC. */
export function MenuBarGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 26 16" fill="none" aria-hidden>
      <rect x="1" y="1.5" width="21" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="23" y="5.5" width="2" height="5" rx="1" fill="currentColor" />
      <path d="M12.8 3.6 8.3 8.6h3.2l-1 3.8 4.6-5.1h-3.2l.9-3.7Z" fill="currentColor" />
    </svg>
  );
}
