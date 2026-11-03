import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "TankiAlert: your Mac's tanki is full. A free macOS menu bar app.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Image() {
  const [b800, b700, icon] = await Promise.all([
    readFile(join(process.cwd(), "assets/bricolage-800.woff")),
    readFile(join(process.cwd(), "assets/bricolage-700.woff")),
    readFile(join(process.cwd(), "assets/app-icon-400.png")),
  ]);
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(120% 90% at 80% 0%, #12245a 0%, #0a1430 45%, #060a14 80%)",
          fontFamily: "Bricolage",
          color: "#eaf2ff",
        }}
      >
        {/* Water band */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 150,
            display: "flex",
            background: "linear-gradient(180deg, #3ce3d8 0%, #1fa6ea 40%, #1a3fc0 100%)",
            borderTop: "4px solid #c9fffb",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
            <img src={iconSrc} width={64} height={64} alt="" />
            TankiAlert
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, marginTop: 40 }}>
            <span>Your Mac’s&nbsp;</span>
            <span style={{ color: "#3ce3d8" }}>tanki</span>
            <span>&nbsp;is full.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#a3b4d1", marginTop: 28, fontWeight: 700 }}>
            Free macOS menu bar app · plays your sound at 100%
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 84,
            top: 150,
            display: "flex",
            background: "#ffb23f",
            color: "#060a14",
            fontSize: 38,
            fontWeight: 800,
            padding: "18px 28px",
            borderRadius: 24,
            transform: "rotate(-4deg)",
          }}
        >
          Tanki bhar gayi! 💧
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: b800, weight: 800, style: "normal" },
        { name: "Bricolage", data: b700, weight: 700, style: "normal" },
      ],
    },
  );
}
