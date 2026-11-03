/* The rooftop world: a skyline of other people's water tanks, and the parapet you stand on. */

function rand(seed: number) {
  let t = seed;
  return () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
}

type Building = { x: number; w: number; h: number; tank: boolean; wins: { x: number; y: number; c: string }[] };

function buildSkyline(seed: number, width: number, maxH = 150): Building[] {
  const r = rand(seed);
  const blds: Building[] = [];
  let x = 0;
  while (x < width) {
    const w = 60 + Math.floor(r() * 90);
    const h = 40 + Math.floor(r() * (maxH - 50));
    const wins: Building["wins"] = [];
    for (let wy = 160 - h + 14; wy < 150; wy += 16) {
      for (let wx = x + 10; wx < x + w - 12; wx += 18) {
        const v = r();
        if (v > 0.86) wins.push({ x: wx, y: wy, c: v > 0.975 ? "#3ce3d8" : "#ffb23f" });
      }
    }
    blds.push({ x, w, h, tank: r() > 0.35, wins });
    x += w + 4 + Math.floor(r() * 14);
  }
  return blds;
}

export function SkylineSvg({
  seed,
  width = 4800,
  maxH = 150,
  fill = "#0b1428",
  className = "",
}: {
  seed: number;
  width?: number;
  maxH?: number;
  fill?: string;
  className?: string;
}) {
  const blds = buildSkyline(seed, width, maxH);
  return (
    <svg aria-hidden className={className} width={width} height={160} viewBox={`0 0 ${width} 160`}>
      {blds.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={160 - b.h} width={b.w} height={b.h} fill={fill} />
          {b.tank && (
            <g fill={fill}>
              <rect x={b.x + b.w * 0.55} y={160 - b.h - 16} width="18" height="14" rx="4" />
              <rect x={b.x + b.w * 0.55 + 6} y={160 - b.h - 19} width="6" height="4" rx="1" />
              <rect x={b.x + b.w * 0.55 + 2} y={160 - b.h - 3} width="2" height="4" />
              <rect x={b.x + b.w * 0.55 + 14} y={160 - b.h - 3} width="2" height="4" />
            </g>
          )}
          {b.wins.map((w) => (
            <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width="7" height="9" rx="1" fill={w.c} opacity=".55" />
          ))}
        </g>
      ))}
    </svg>
  );
}

const PARAPET = "linear-gradient(180deg, #18233f 0%, #0d1528 70%, #0a1222 100%)";

/** Hero ground: sits inside the tank's box, so the parapet always meets the stand's feet (97.4% of its height). */
export function Rooftop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <SkylineSvg seed={7} className="absolute bottom-[2.4%] left-1/2 h-[160px] max-w-none -translate-x-1/2" />
      <div
        className="absolute left-1/2 top-[97.4%] h-[52px] w-[400vw] -translate-x-1/2 border-t-2 border-[rgb(150_190_255/0.16)]"
        style={{ background: PARAPET }}
      />
    </div>
  );
}

/** A mid-page rooftop band that keeps the night skyline running between sections. */
export function RoofDivider({ seed, from = "#060a14" }: { seed: number; from?: string }) {
  return (
    <div aria-hidden className="relative h-[120px] overflow-hidden" style={{ background: from }}>
      <SkylineSvg seed={seed} maxH={110} fill="#122042" className="absolute bottom-[22px] left-1/2 h-[160px] max-w-none -translate-x-1/2" />
      <div
        className="absolute inset-x-0 bottom-0 h-[24px] border-t-2 border-[rgb(150_190_255/0.16)]"
        style={{ background: PARAPET }}
      />
    </div>
  );
}
