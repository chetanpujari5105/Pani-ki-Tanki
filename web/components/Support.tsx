"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Check, Coffee, Copy, ShieldCheck, Smartphone } from "lucide-react";
import {
  DEFAULT_AMOUNT,
  KOFI_URL,
  MAX_AMOUNT,
  MIN_AMOUNT,
  SUGGESTED_AMOUNTS,
  UPI_ID,
  UPI_NAME,
  UPI_READY,
  formatINR,
  upiLink,
} from "@/lib/donate";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The tank rises with the amount. It's decoration only: no goal, no totals.
 * Tuned for the ₹5–₹50 chips, which spread across most of the tank (₹5 → 26%, ₹10 → 41%, ₹25 → 61%, ₹50 → 76%).
 * Below ₹5 it dips a little; above ₹50 it keeps rising slowly and tops out at 88% around ₹1,000.
 */
function levelFor(amount: number | null) {
  if (!amount) return 0.18;
  if (amount < 5) return 0.18 + 0.08 * ((amount - 1) / 4);
  if (amount <= 50) return 0.26 + 0.5 * (Math.log(amount / 5) / Math.log(10));
  return Math.min(0.88, 0.76 + 0.12 * (Math.log(amount / 50) / Math.log(20)));
}

const secondaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line-strong px-4 font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-aqua hover:bg-aqua/[0.06]";

export default function Support() {
  const id = useId();
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<number | "custom">(DEFAULT_AMOUNT);
  const [custom, setCustom] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [thanks, setThanks] = useState(0);
  const [pour, setPour] = useState(0);
  const toastTimer = useRef<number | undefined>(undefined);

  const customNum = /^\d{1,6}$/.test(custom) ? Number(custom) : NaN;
  const customValid = customNum >= MIN_AMOUNT && customNum <= MAX_AMOUNT;
  const customError = choice === "custom" && custom !== "" && !customValid;
  const amount: number | null = choice === "custom" ? (customValid ? customNum : null) : choice;
  const link = amount ? upiLink(amount) : upiLink();

  // The QR is generated in the browser. qrcode loads only when this section needs it.
  useEffect(() => {
    if (!UPI_READY) return;
    let alive = true;
    import("qrcode").then((QR) =>
      QR.toDataURL(link, {
        width: 360,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#060a14", light: "#ffffff" },
      }).then((url) => alive && setQr(url)),
    );
    return () => {
      alive = false;
    };
  }, [link]);

  // A short pour from the inlet pipe whenever the amount changes.
  const lastAmount = useRef(amount);
  useEffect(() => {
    if (amount && amount !== lastAmount.current) setPour((p) => p + 1);
    lastAmount.current = amount;
  }, [amount]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      showToast("UPI ID copied");
    } catch {
      showToast("Couldn’t copy. Select the ID and copy it manually.");
    }
    track("donate_copy_upi");
  };

  const paid = () => {
    setThanks((t) => t + 1);
    track("donate_click", { method: "upi", amount: amount ?? 0 });
  };

  const level = levelFor(UPI_READY ? amount : null) + (thanks ? 0.04 : 0);

  return (
    <section id="support" aria-labelledby="support-title" className="relative border-t border-line bg-night-2 py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-x-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h2
            id="support-title"
            data-reveal
            className="max-w-[16ch] font-display text-[clamp(2.3rem,5vw,3.75rem)] font-extrabold leading-[1] tracking-[-0.035em]"
          >
            Help fill the tanki 💧
          </h2>
          <p data-reveal style={{ "--d": 1 } as React.CSSProperties} className="mt-4 max-w-[52ch] text-[1.1rem] text-mist">
            TankiAlert is free and open source, and it will stay that way. If it saved your battery (or made you laugh),
            you can chip in. Donations are completely optional and go into updates.
          </p>
        </div>

        {/* On phones the tank sits right above the amounts, so you can see it rise as you pick one. */}
        <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center">
          <FundTank level={level} pour={pour} thanks={thanks} reduce={reduce} />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div data-reveal style={{ "--d": 2 } as React.CSSProperties} className="mt-8 rounded-2xl border border-line bg-night/60 p-5 sm:p-7">
            {UPI_READY ? (
              <>
                <fieldset>
                  <legend className="font-display text-[1.15rem] font-bold">Pick an amount</legend>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-4">
                    {SUGGESTED_AMOUNTS.map((a) => (
                      <label key={a} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name={`${id}-amt`}
                          value={a}
                          checked={choice === a}
                          onChange={() => {
                            setChoice(a);
                            setCustom("");
                          }}
                          className="peer sr-only"
                        />
                        <span className="tnum flex h-12 items-center justify-center rounded-[10px] border border-line-strong font-display text-[1.1rem] font-bold text-ink transition-[border-color,background-color,color] duration-150 peer-checked:border-aqua peer-checked:bg-aqua peer-checked:text-night peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marigold hover:border-aqua">
                          {formatINR(a)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-stretch gap-2.5">
                    <label className="relative shrink-0 cursor-pointer">
                      <input
                        type="radio"
                        name={`${id}-amt`}
                        value="custom"
                        checked={choice === "custom"}
                        onChange={() => setChoice("custom")}
                        className="peer sr-only"
                      />
                      <span className="flex h-12 items-center rounded-[10px] border border-line-strong px-4 font-display font-bold text-ink transition-[border-color,background-color,color] duration-150 peer-checked:border-aqua peer-checked:bg-aqua peer-checked:text-night peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marigold hover:border-aqua">
                        Other
                      </span>
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-display font-bold text-mist">
                        ₹
                      </span>
                      <input
                        id={`${id}-custom`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Any amount"
                        aria-label="Custom amount in rupees"
                        aria-invalid={customError}
                        aria-describedby={customError ? `${id}-err` : undefined}
                        value={custom}
                        onFocus={() => setChoice("custom")}
                        onChange={(e) => {
                          setChoice("custom");
                          setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 6));
                        }}
                        className="tnum h-12 w-full rounded-[10px] border border-line-strong bg-night pl-9 pr-4 font-display text-[1.1rem] font-bold text-ink placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-haze focus:border-aqua focus:outline-2 focus:outline-offset-2 focus:outline-marigold aria-[invalid=true]:border-[#ff8a7a]"
                      />
                    </div>
                  </div>
                  {customError && (
                    <p id={`${id}-err`} className="mt-2 text-[0.92rem] text-[#ffb3a8]">
                      Enter a whole amount from {formatINR(MIN_AMOUNT)} to {formatINR(MAX_AMOUNT)}.
                    </p>
                  )}
                </fieldset>

                {/* Phones: open the UPI app directly */}
                <div className="mt-6 flex flex-col gap-3 md:hidden">
                  <a
                    href={amount ? link : undefined}
                    aria-disabled={!amount}
                    onClick={(e) => {
                      if (!amount) return e.preventDefault();
                      paid();
                    }}
                    className="inline-flex h-14 items-center justify-center gap-2.5 rounded-[14px] bg-aqua px-6 font-display text-[1.075rem] font-bold text-night shadow-[0_10px_30px_-10px_rgb(60_227_216/0.7),inset_0_1px_0_rgb(255_255_255/0.5)] transition-transform duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.97] aria-disabled:opacity-50"
                  >
                    <Smartphone size={20} strokeWidth={2.2} aria-hidden />
                    {amount ? `Pay ${formatINR(amount)} with any UPI app` : "Pick an amount to pay"}
                  </a>
                  <button type="button" onClick={copyId} className={secondaryBtn}>
                    <Copy size={17} strokeWidth={2.2} aria-hidden />
                    Copy UPI ID
                  </button>
                </div>

                {/* Laptops and desktops: scan the QR with a phone */}
                <div className="mt-7 hidden items-center gap-7 md:flex">
                  <div className="grid size-[184px] shrink-0 place-items-center rounded-2xl bg-white p-2.5 shadow-[0_18px_40px_-18px_rgb(60_227_216/0.55)]">
                    {qr && amount ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qr} width={164} height={164} alt={`UPI QR code to pay ${formatINR(amount)} to ${UPI_NAME}`} />
                    ) : (
                      <span className="px-4 text-center text-[0.9rem] text-night/70">
                        {amount ? "Making your QR…" : "Pick an amount to see the QR"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[1.2rem] font-bold leading-snug">Scan with GPay, PhonePe or Paytm</p>
                    <p className="tnum mt-1 text-mist">
                      {amount ? `${formatINR(amount)} to ${UPI_NAME}` : `Any amount to ${UPI_NAME}`}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button type="button" onClick={copyId} className={secondaryBtn}>
                        <Copy size={17} strokeWidth={2.2} aria-hidden />
                        Copy UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={paid}
                        disabled={!amount}
                        className={`${secondaryBtn} disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <Check size={17} strokeWidth={2.4} aria-hidden />
                        I’ve paid
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-6 flex items-start gap-2 text-[0.92rem] text-haze">
                  <ShieldCheck size={17} strokeWidth={2} aria-hidden className="mt-[3px] shrink-0 text-aqua" />
                  <span>
                    No account needed. Payments go directly to my UPI. I never see your bank details. If the name
                    shown in your UPI app looks different, that’s the registered name on the account.
                  </span>
                </p>
              </>
            ) : (
              <p className="text-mist">
                UPI payments are coming soon. Until then, Ko-fi works from anywhere in the world.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-start sm:gap-4">
              <span className="text-[0.95rem] text-mist sm:flex sm:h-11 sm:items-center">Outside India?</span>
              <div className="flex flex-col">
                <a
                  href={KOFI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("donate_click", { method: "kofi" })}
                  className={`${secondaryBtn} w-full sm:w-auto`}
                >
                  <Coffee size={17} strokeWidth={2.2} aria-hidden className="text-marigold-soft" />
                  Support on Ko-fi
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <p className="mt-2 text-[0.88rem] text-haze">Pay by card or PayPal through Ko-fi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[65] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <m.div
              key={toast}
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(12px) scale(0.97)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px) scale(0.98)" }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-2 rounded-[12px] border border-line-strong bg-night-3 px-4 py-3 font-semibold text-ink shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)]"
            >
              <Check size={17} strokeWidth={2.6} aria-hidden className="text-aqua" />
              {toast}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ───────────── The fund tank: a small rooftop tank that fills from its inlet pipe ───────────── */

const TOP = 62;
const BOTTOM = 312;

function FundTank({ level, pour, thanks, reduce }: { level: number; pour: number; thanks: number; reduce: boolean }) {
  const y = BOTTOM - (BOTTOM - TOP) * level;
  const [pouring, setPouring] = useState(false);
  const [bubbleFor, setBubbleFor] = useState(0);
  const [hiddenFor, setHiddenFor] = useState(0);
  const bubble = bubbleFor > 0 && hiddenFor !== bubbleFor;

  useEffect(() => {
    if (!pour || reduce) return;
    const on = window.setTimeout(() => setPouring(true), 0);
    const off = window.setTimeout(() => setPouring(false), 900);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [pour, reduce]);

  useEffect(() => {
    if (!thanks) return;
    const show = window.setTimeout(() => setBubbleFor(thanks), 0);
    const hide = window.setTimeout(() => setHiddenFor(thanks), 3800);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [thanks]);

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[170px] sm:max-w-[210px] lg:max-w-[300px]">
      <div className="pointer-events-none absolute inset-x-[5%] top-[18%] bottom-[10%] rounded-full bg-[radial-gradient(closest-side,rgb(47_107_255/.3),transparent)] blur-2xl" />
      <svg viewBox="0 0 260 350" className="relative block h-auto w-full overflow-visible">
        <defs>
          <clipPath id="fund-inner">
            <path d="M36,94 C36,70 60,56 94,56 H166 C200,56 224,70 224,94 V304 Q224,312 216,312 H44 Q36,312 36,304 Z" />
          </clipPath>
          <linearGradient id="fund-water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3ce3d8" />
            <stop offset=".5" stopColor="#1fa6ea" />
            <stop offset="1" stopColor="#1a3fc0" />
          </linearGradient>
        </defs>

        {/* Inlet pipe from the right */}
        <path d="M262 22 H200 Q188 22 188 34 V60" stroke="#3d5584" strokeWidth="11" fill="none" strokeLinecap="round" />

        {/* Body */}
        <path
          d="M30,96 C30,66 58,48 94,48 H166 C202,48 230,66 230,96 V306 Q230,320 216,320 H44 Q30,320 30,306 Z"
          fill="#9cc4ff"
          fillOpacity=".06"
          stroke="#aad2ff"
          strokeOpacity=".38"
          strokeWidth="1.5"
        />

        <g clipPath="url(#fund-inner)">
          {/* Stream from the inlet */}
          <rect
            x="185"
            y="58"
            width="6"
            height={Math.max(0, y - 58)}
            rx="3"
            fill="#3ce3d8"
            style={{ opacity: pouring ? 0.9 : 0, transition: "opacity 220ms ease" }}
          />
          <g style={{ transform: `translateY(${y}px)`, transition: reduce ? "none" : "transform 1100ms var(--ease-out)" }}>
            <g style={{ animation: reduce ? "none" : "fund-wave 3.2s linear infinite" }}>
              <path
                d="M-130 6 Q-97.5 -4 -65 6 T0 6 T65 6 T130 6 T195 6 T260 6 T325 6 T390 6 V400 H-130 Z"
                fill="url(#fund-water)"
              />
              <path d="M-130 6 Q-97.5 -4 -65 6 T0 6 T65 6 T130 6 T195 6 T260 6 T325 6 T390 6" fill="none" stroke="#c9fffb" strokeOpacity=".7" strokeWidth="1.6" />
            </g>
            {/* Thank-you ripple */}
            {thanks > 0 && !reduce && (
              <g key={thanks}>
                {[0, 1, 2].map((i) => (
                  <ellipse
                    key={i}
                    cx="130"
                    cy="6"
                    rx="34"
                    ry="6"
                    fill="none"
                    stroke="#e6fffd"
                    strokeWidth="2"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      animation: `pulse-ring 1.2s ${i * 0.18}s cubic-bezier(0.23,1,0.32,1) both`,
                    }}
                  />
                ))}
              </g>
            )}
          </g>
        </g>

        {/* Ribs and shading */}
        <g fill="none" strokeLinecap="round">
          {[140, 205, 266].map((ry) => (
            <g key={ry}>
              <path d={`M31 ${ry} Q130 ${ry + 14} 229 ${ry}`} stroke="#020611" strokeOpacity=".45" strokeWidth="3" />
              <path d={`M31 ${ry + 3} Q130 ${ry + 17} 229 ${ry + 3}`} stroke="#cfe3ff" strokeOpacity=".22" strokeWidth="1.2" />
            </g>
          ))}
        </g>
        <rect x="48" y="96" width="8" height="200" rx="4" fill="#fff" opacity=".09" />
        <text x="130" y="122" textAnchor="middle" className="deva" fontSize="22" fontWeight="700" fill="#eaf2ff" fillOpacity=".55">
          शुक्रिया
        </text>

        {/* Lid and stand */}
        <rect x="104" y="34" width="52" height="16" rx="4" fill="#2b3f68" />
        <rect x="94" y="16" width="72" height="22" rx="9" fill="#4a649a" />
        <g stroke="#33476e" strokeWidth="5" strokeLinecap="round">
          <path d="M52 324 V346 M96 324 V346 M164 324 V346 M208 324 V346" />
        </g>
        <rect x="36" y="318" width="188" height="8" rx="3" fill="#3a5080" />
      </svg>

      {/* Thank-you bubble */}
      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2">
        <AnimatePresence>
          {bubble && (
            <m.p
              key={bubbleFor}
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px) scale(0.92)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", duration: 0.55, bounce: 0.3 }}
              style={{ transformOrigin: "50% 100%" }}
              className="relative whitespace-nowrap rounded-2xl bg-marigold px-4 py-2 text-center font-display text-[1.02rem] font-extrabold text-night shadow-[0_12px_30px_-8px_rgb(255_178_63/0.55)]"
            >
              Thank you! 💧
              <span lang="hi" className="deva block text-[0.78rem] font-semibold text-night/75">
                बहुत शुक्रिया!
              </span>
              <svg className="absolute -bottom-[9px] left-1/2 -ml-2" width="16" height="10" viewBox="0 0 16 10" aria-hidden>
                <path d="M0 0 H16 L8 10 Z" fill="#ffb23f" />
              </svg>
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
