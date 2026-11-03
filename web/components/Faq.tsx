import { Plus } from "lucide-react";
import FaqItem from "./FaqItem";

type QA = { q: string; a: React.ReactNode; text: string };

const kbd = "rounded-md border border-line-strong bg-night px-1.5 py-0.5 font-sans text-[0.9em] font-semibold text-ink";

export const FAQ: QA[] = [
  {
    q: "Is it really free?",
    text: "Yes. TankiAlert is free, with no account, no ads and no in-app purchases.",
    a: <p>Yes. It’s free, with no account, no ads and no in-app purchases. Download it and use it.</p>,
  },
  {
    q: "Why does macOS say it’s from an unidentified developer?",
    text:
      "TankiAlert is an independent app that is not yet notarized by Apple, so Gatekeeper asks you to confirm the first time. Right-click (or Control-click) TankiAlert in Applications, choose Open, then click Open again. On macOS 15 Sequoia and later, open it once, then go to System Settings > Privacy & Security, scroll down and click Open Anyway. You only do this once.",
    a: (
      <>
        <p>
          TankiAlert is an indie app that isn’t notarized by Apple yet, so Gatekeeper asks you to confirm it the first
          time. You only need to do this once.
        </p>
        <ol className="mt-4 space-y-3">
          {[
            <>
              Move <strong className="text-ink">TankiAlert</strong> into your Applications folder.
            </>,
            <>
              <strong className="text-ink">Right-click</strong> (or <kbd className={kbd}>Control</kbd>-click) the app and
              choose <strong className="text-ink">Open</strong>.
            </>,
            <>
              In the dialog that appears, click <strong className="text-ink">Open</strong> again.
            </>,
          ].map((step, i) => (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-2">
              <span className="tnum grid size-7 place-items-center rounded-full bg-aqua/15 font-display text-sm font-bold text-aqua">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl border border-line bg-night/60 p-4">
          <strong className="text-ink">On macOS 15 Sequoia or later</strong>, or if there’s no Open button: try to open
          the app once, then go to{" "}
          <strong className="text-ink">System Settings → Privacy &amp; Security</strong>, scroll down, click{" "}
          <strong className="text-ink">Open Anyway</strong>, and confirm with your password.
        </p>
      </>
    ),
  },
  {
    q: "Does it work when my Mac is asleep?",
    text:
      "No. macOS pauses apps while the Mac sleeps, so the Mac must be awake for TankiAlert to hear the battery. Keep the lid open while charging, or run caffeinate -s in Terminal to stay awake on power.",
    a: (
      <p>
        No. macOS pauses apps while the Mac sleeps, so the Mac must be awake for TankiAlert to notice the battery.
        Keep the lid open while you charge. Or run <code className={kbd}>caffeinate -s</code> in Terminal, which keeps
        the Mac awake as long as it’s plugged in.
      </p>
    ),
  },
  {
    q: "Does it collect any data?",
    text:
      "No. TankiAlert makes no network requests, has no analytics and no account. Your settings stay on your Mac. It works fully offline.",
    a: (
      <p>
        No. It makes no network requests and has no analytics and no account. Your settings stay on your Mac in
        standard macOS preferences, and it works fully offline.
      </p>
    ),
  },
  {
    q: "My battery stops at 80%. Will it still ring?",
    text:
      "If Optimized Battery Charging or a charge limit holds your Mac at 80%, set the threshold to 80% so the alert can fire.",
    a: (
      <p>
        If Optimized Battery Charging or a charge limit holds your Mac at 80%, the battery never reaches 100%. Set the
        slider to 80% and it will ring there.
      </p>
    ),
  },
  {
    q: "Which Macs does it run on?",
    text: "Any Mac with macOS 13 Ventura or later, Apple Silicon or Intel. It needs a battery, so MacBooks.",
    a: (
      <p>
        Any MacBook on macOS 13 Ventura or later, with Apple Silicon or Intel. It’s a universal app, and it needs a
        battery to watch.
      </p>
    ),
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line bg-night-2 py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <h2
            id="faq-title"
            data-reveal
            className="font-display text-[clamp(2.3rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.035em]"
          >
            Questions, answered.
          </h2>
          <p data-reveal style={{ "--d": 1 } as React.CSSProperties} className="mt-4 max-w-[30ch] text-mist">
            Stuck at the “unidentified developer” warning? The second answer walks you through it.
          </p>
        </div>
        <div className="faq divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <FaqItem key={f.q} question={f.q}>
              <summary className="flex cursor-pointer items-center justify-between gap-6 rounded-lg py-5 font-display text-[1.2rem] font-bold leading-snug tracking-[-0.015em] transition-colors duration-200 hover:text-aqua sm:text-[1.3rem]">
                {f.q}
                <span className="chev grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-mist">
                  <Plus size={16} strokeWidth={2.2} aria-hidden />
                </span>
              </summary>
              <div className="max-w-[62ch] pb-6 text-mist">{f.a}</div>
            </FaqItem>
          ))}
        </div>
      </div>
    </section>
  );
}
