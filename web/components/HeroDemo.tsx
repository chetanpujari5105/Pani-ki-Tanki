"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Wifi } from "lucide-react";
import Tank from "./Tank";
import MacPopover, { MenuBarGlyph } from "./MacPopover";
import { Rooftop } from "./Skyline";
import { DEFAULT_SOUND, sound } from "@/lib/sound";
import { track } from "@/lib/analytics";

const OWNER = "hero";

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function HeroDemo() {
  const [threshold, setThreshold] = useState(100);
  const [mode, setMode] = useState<"charge" | "follow">("charge");
  const [percent, setPercent] = useState(22);
  const [enabled, setEnabled] = useState(true);
  const [repeats, setRepeats] = useState(1);
  const [launch, setLaunch] = useState(true);
  const [open, setOpen] = useState(true);
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [tingKey, setTingKey] = useState(0);
  const [custom, setCustom] = useState<{ url: string; name: string } | null>(null);
  const snap = useSyncExternalStore(sound.subscribe, sound.getSnapshot, sound.getServerSnapshot);
  const playing = snap.playing && (snap.owner === OWNER || snap.owner === "hero-ting");

  const commitTimer = useRef<number | undefined>(undefined);
  const firstCharge = useRef(true);
  const src = custom?.url ?? DEFAULT_SOUND;

  const ting = useCallback(
    (withSound: boolean) => {
      if (!enabled) return;
      setTingKey((k) => k + 1);
      setLastAlert(nowLabel());
      if (withSound) {
        track("sound_play", { location: "hero-slider" });
        void sound.play({ src, loops: repeats, owner: "hero-ting" });
      }
    },
    [enabled, repeats, src],
  );

  // The first fill after load gets a silent ting (browsers block sound before a click anyway).
  const onSettle = useCallback(() => {
    if (firstCharge.current) {
      firstCharge.current = false;
      ting(false);
    }
  }, [ting]);

  useEffect(() => () => window.clearTimeout(commitTimer.current), []);
  useEffect(() => () => (custom ? URL.revokeObjectURL(custom.url) : undefined), [custom]);

  const popover = (
    <MacPopover
      state={{
        percent,
        enabled,
        threshold,
        repeats,
        soundName: custom ? custom.name : "Default: tanki.mp3",
        customSound: !!custom,
        playing,
        lastAlert,
        launchAtLogin: launch,
      }}
      onEnabled={setEnabled}
      onThreshold={(v) => {
        firstCharge.current = false;
        setMode("follow");
        setThreshold(v);
        if (sound.getSnapshot().owner === "hero-ting") sound.stop();
      }}
      onThresholdCommit={() => {
        window.clearTimeout(commitTimer.current);
        commitTimer.current = window.setTimeout(() => ting(true), 120);
      }}
      onRepeats={setRepeats}
      onChooseSound={(f) => setCustom({ url: URL.createObjectURL(f), name: f.name })}
      onResetSound={() => setCustom(null)}
      onTest={() => {
        track("sound_play", { location: "hero-test" });
        void sound.play({ src, loops: repeats, owner: OWNER });
      }}
      onStop={() => sound.stop()}
      onLaunchAtLogin={setLaunch}
      onQuit={() => setOpen(false)}
    />
  );

  return (
    <div className="relative">
      {/* Mock macOS menu bar */}
      <div
        className="relative z-20 flex h-8 items-center justify-between rounded-[10px] border border-line bg-[rgb(18_28_50/0.62)] pl-3 pr-1.5 text-[13px] text-ink/90 backdrop-blur-xl"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
      >
        <div className="hidden items-center gap-4 sm:flex" aria-hidden>
          <span className="font-semibold">Finder</span>
          <span className="text-ink/75">File</span>
          <span className="text-ink/75">Edit</span>
          <span className="text-ink/75">View</span>
          <span className="hidden text-ink/75 md:inline">Go</span>
          <span className="hidden text-ink/75 md:inline">Window</span>
        </div>
        <span className="text-[12px] text-mist sm:hidden" aria-hidden>
          Menu bar
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="hero-popover"
            aria-label={open ? "Close the TankiAlert menu" : "Open the TankiAlert menu"}
            className={`grid h-6 place-items-center rounded-[5px] px-2 transition-colors duration-150 ${
              open ? "bg-white/20 text-white" : "text-ink/90 hover:bg-white/10"
            }`}
          >
            <MenuBarGlyph />
          </button>
          <span className="grid h-6 place-items-center px-1.5 text-ink/85" aria-hidden>
            <Wifi size={15} strokeWidth={2.2} />
          </span>
          <span className="tnum px-1.5 text-ink/90" aria-hidden>
            Tue 9:41 PM
          </span>
        </div>
      </div>

      <div className="relative pt-16 md:pt-4">
        {/* The tank stands on the rooftop. On wide screens the popover hangs over its right shoulder. */}
        <div className="relative mb-[52px] md:pt-10 md:pr-[244px]">
          <div className="relative mx-auto w-full max-w-[250px] sm:max-w-[290px] md:max-w-[400px]">
            <Rooftop />
            <Tank
              target={threshold}
              mode={mode}
              threshold={threshold}
              onSettle={onSettle}
              onPercent={setPercent}
              tingKey={tingKey}
            />
          </div>
        </div>

        <div
          id="hero-popover"
          className={`relative z-10 flex justify-center pb-10 md:absolute md:top-2 md:right-0 md:block md:pb-0 ${
            open ? "" : "hidden"
          }`}
        >
          {popover}
        </div>
        {!open && (
          <p className="pb-10 text-center text-sm text-mist md:absolute md:top-6 md:right-0 md:w-[240px] md:pb-0 md:text-left">
            Popover closed. Click the battery icon in the menu bar to reopen it.
          </p>
        )}
      </div>
    </div>
  );
}
