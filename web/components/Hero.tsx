import { Play } from "lucide-react";
import DownloadButton from "./DownloadButton";
import HeroDemo from "./HeroDemo";
import { APP_SIZE, APP_VERSION } from "@/lib/config";

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 61.8) % 100,
  y: ((i * 37.3) % 58) + 2,
  s: i % 7 === 0 ? 2 : 1,
  tw: i % 5 === 0,
  d: (i % 9) * 0.6,
}));

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-x-clip">
      {/* Night sky */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_75%_0%,#12245a_0%,#0a1430_40%,#060a14_75%)]" />
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#dfe9ff]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: 0.5,
              animation: s.tw ? `twinkle 3.6s ${s.d}s ease-in-out infinite` : undefined,
            }}
          />
        ))}
      </div>

      <div className="wrap grid grid-cols-1 items-end gap-x-10 gap-y-10 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-16">
        <div className="relative z-10 max-w-[36rem] lg:self-center lg:pb-[200px]">
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.9rem,7.6vw,5.9rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
          >
            Your Mac’s <span className="text-aqua">tanki</span> is full.
          </h1>
          <p className="mt-6 max-w-[33rem] text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-mist">
            TankiAlert sits in your menu bar and plays{" "}
            <span className="whitespace-nowrap font-semibold text-ink">“pani ki tanki bhar gayi”</span> the moment
            your MacBook charges to the % you pick. You unplug on time, and you laugh every time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <DownloadButton location="hero" />
            <a
              href="#hear"
              data-play-hear
              className="group inline-flex items-center gap-2 rounded-lg py-2 font-semibold text-ink underline decoration-line-strong underline-offset-[0.3em] transition-colors duration-200 hover:decoration-aqua"
            >
              <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-colors duration-200 group-hover:border-aqua">
                <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden className="translate-x-[1px]" />
              </span>
              Hear the sound
            </a>
          </div>
          <p className="tnum mt-5 text-[0.9rem] text-haze">
            Free · v{APP_VERSION} · {APP_SIZE} · macOS 13+ · Apple Silicon &amp; Intel
          </p>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}
