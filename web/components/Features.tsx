import { Check, Lock } from "lucide-react";
import { MenuBarGlyph } from "./MacPopover";

function Tile({
  className = "",
  art,
  title,
  children,
  d = 0,
}: {
  className?: string;
  art: React.ReactNode;
  title: string;
  children: React.ReactNode;
  d?: number;
}) {
  return (
    <li
      data-reveal
      style={{ "--d": d } as React.CSSProperties}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-[linear-gradient(180deg,#0d1730_0%,#0a1222_100%)] ${className}`}
    >
      <div aria-hidden className="micro relative flex min-h-[164px] sm:min-h-[200px] flex-1 items-center justify-center overflow-hidden px-6 pt-6">
        {art}
      </div>
      <div className="px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
        <h3 className="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em]">{title}</h3>
        <p className="mt-1.5 max-w-[46ch] text-[0.98rem] text-mist">{children}</p>
      </div>
    </li>
  );
}

const sys = { fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' };

/* 1 · Custom sound */
function SoundArt() {
  const files = [
    { n: "tanki.mp3", t: "0:13" },
    { n: "pressure-cooker-whistle.m4a", t: "0:04" },
    { n: "mummy-calling.wav", t: "0:06" },
  ];
  return (
    <div className="w-full max-w-[440px] space-y-2" style={sys}>
      {files.map((f, i) => (
        <div
          key={f.n}
          className="flex items-center gap-3 rounded-[10px] border border-line px-3 py-2.5 text-[13px]"
          style={{ animation: `chip-on 6s ${i * 2}s infinite` }}
        >
          <span className="flex h-5 items-end gap-[2px]">
            {[0.5, 1, 0.7, 0.9, 0.4].map((h, j) => (
              <span
                key={j}
                className="w-[3px] origin-bottom rounded-full bg-ink/80"
                style={{ height: `${h * 100}%`, animation: `eq ${0.7 + j * 0.13}s ${j * 0.1}s ease-in-out infinite` }}
              />
            ))}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-ink">{f.n}</span>
          <span className="tnum text-ink/60">{f.t}</span>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <span className="rounded-[6px] bg-white/[0.13] px-2.5 py-[3px] text-[12px] text-white/90">Choose Sound…</span>
        <span className="rounded-[6px] bg-white/[0.13] px-2.5 py-[3px] text-[12px] text-white/90">Test Sound</span>
      </div>
    </div>
  );
}

/* 2 · Threshold */
function ThresholdArt() {
  return (
    <div className="w-full max-w-[300px]" style={sys}>
      <div className="pct-counter tnum mb-4 font-display text-[2.4rem] font-extrabold leading-none text-ink" style={{ animation: "pct-run 4s var(--ease-in-out) infinite alternate" }} />
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/18" />
        <div className="absolute inset-x-0 top-1/2 h-1.5 origin-left -translate-y-1/2 rounded-full bg-[#3b82ff]" style={{ transform: "translateY(-50%) scaleX(.7)", animation: "slide-fill 4s var(--ease-in-out) infinite alternate" }} />
        <div className="absolute inset-0" style={{ transform: "translateX(70%)", animation: "slide-thumb 4s var(--ease-in-out) infinite alternate" }}>
          <div className="absolute top-1/2 left-0 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f6fa] shadow-[0_1px_3px_rgb(0_0_0/0.5)]" />
        </div>
      </div>
      <div className="tnum mt-2 flex justify-between text-[11px] text-white/60">
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/* 3 · Repeat */
function RepeatArt() {
  return (
    <div className="flex flex-col items-center gap-4" style={sys}>
      <div className="flex gap-3.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="size-6 rounded-full bg-[rgb(150_190_255/0.14)]"
            style={{ animation: `rep-dot 3s ${i * 0.35}s infinite` }}
          />
        ))}
      </div>
      <span className="text-[14px] text-white/90">Play sound 5×</span>
    </div>
  );
}

/* 4 · Notification */
function NotificationArt() {
  return (
    <div className="w-full max-w-[360px]" style={sys}>
      <div
        className="flex items-start gap-3 rounded-[14px] border border-white/10 bg-[rgb(52_58_72/0.82)] p-3 shadow-[0_14px_30px_-10px_rgb(0_0_0/0.7)] backdrop-blur-xl"
        style={{ animation: "banner-in 5s var(--ease-out) infinite" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/app-icon.webp" alt="" width={36} height={36} className="size-9 shrink-0" loading="lazy" />
        <div className="min-w-0 flex-1 text-[13px] leading-snug">
          <div className="flex justify-between gap-2">
            <span className="font-semibold text-white">Tanki bhar gayi! 💧</span>
            <span className="text-[11px] text-white/55">now</span>
          </div>
          <p className="text-white/80">Battery is at 100%. Unplug the charger.</p>
        </div>
      </div>
    </div>
  );
}

/* 5 · Menu bar only */
function MenuBarArt() {
  return (
    <div className="flex w-full max-w-[300px] flex-col items-center gap-5" style={sys}>
      <div className="flex h-8 w-full items-center justify-end gap-3 rounded-[9px] border border-line bg-white/[0.05] px-3 text-[12px] text-white/85">
        <span className="relative grid h-6 place-items-center rounded-[5px] bg-white/20 px-2 text-white">
          <span className="absolute inset-0 rounded-[5px] border border-aqua" style={{ animation: "pulse-ring 2.2s var(--ease-out) infinite" }} />
          <MenuBarGlyph />
        </span>
        <span className="tnum">9:41 PM</span>
      </div>
      <span className="flex items-center gap-2 text-[13px] text-white/90">
        <span className="grid size-[15px] place-items-center rounded-[4px] bg-[#3b82ff]">
          <Check size={11} strokeWidth={3} />
        </span>
        Launch at login
      </span>
    </div>
  );
}

/* 6 · Private */
function PrivateArt() {
  return (
    <div className="flex items-center gap-5">
      <div className="relative grid size-20 place-items-center rounded-full border border-dashed border-line-strong">
        <span className="absolute inset-[-10px] rounded-full border border-aqua/30" style={{ animation: "pulse-ring 3s var(--ease-out) infinite" }} />
        <Lock size={28} strokeWidth={1.75} className="text-aqua" />
      </div>
      <ul className="space-y-1.5 text-[0.95rem] text-ink/90">
        {["No account", "No analytics", "Works offline"].map((x) => (
          <li key={x} className="flex items-center gap-2">
            <Check size={15} strokeWidth={2.4} className="text-aqua" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="wrap py-24 sm:py-32">
      <div className="max-w-[44rem]">
        <h2
          id="features-title"
          data-reveal
          className="font-display text-[clamp(2.3rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.035em]"
        >
          Small app. Loud tanki.
        </h2>
        <p data-reveal style={{ "--d": 1 } as React.CSSProperties} className="mt-4 text-[1.1rem] text-mist">
          It does one job: it tells you when the battery is full enough. Everything else is a setting you can change
          in one click.
        </p>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Tile className="md:col-span-2 lg:col-span-4" art={<SoundArt />} title="Your sound. Any sound.">
          Keep the classic tanki clip, or pick any mp3, m4a or wav: the pressure cooker, your mummy’s voice note,
          anything. Hit Test Sound to hear it right away.
        </Tile>
        <Tile className="lg:col-span-2" art={<ThresholdArt />} title="Pick your %" d={1}>
          Anywhere from 50% to 100%. Charge-limit fans can set 80.
        </Tile>
        <Tile className="lg:col-span-2" art={<RepeatArt />} title="Repeat 1 to 5 times">
          One polite ting, or five, for heavy sleepers.
        </Tile>
        <Tile className="md:col-span-2 lg:col-span-4" art={<NotificationArt />} title="A notification too" d={1}>
          A banner pops up as well, so you see it even when your volume is muted. It rings once per charge, then waits
          until you unplug.
        </Tile>
        <Tile className="lg:col-span-3" art={<MenuBarArt />} title="Lives in the menu bar">
          No Dock icon and no window. It can start when your Mac does, then stays out of the way.
        </Tile>
        <Tile className="lg:col-span-3" art={<PrivateArt />} title="Tiny and private" d={1}>
          A 1.9 MB download. It collects no data, never touches the network, and keeps your settings on your Mac.
        </Tile>
      </ul>
    </section>
  );
}
