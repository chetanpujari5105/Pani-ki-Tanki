// Writes public/upi-qr.png (the README's support QR) from lib/donate.ts, the single source of the UPI ID.
// Usage: npm run qr (it also runs before every build). The QR has no fixed amount, so the payer types one.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import QRCode from "qrcode";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = await readFile(join(root, "lib/donate.ts"), "utf8");
const pick = (k) => src.match(new RegExp(`export const ${k} = "([^"]*)"`))?.[1] ?? "";
const vpa = pick("UPI_ID");
const name = pick("UPI_NAME");

if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/.test(vpa)) {
  console.warn("make-qr: UPI_ID in lib/donate.ts is not a valid VPA. Skipping public/upi-qr.png.");
  process.exit(0);
}
// Must stay identical to upiLink() in lib/donate.ts.
const link = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&cu=INR&tn=TankiAlert%20support`;
await QRCode.toFile(join(root, "public/upi-qr.png"), link, {
  width: 480,
  margin: 2,
  errorCorrectionLevel: "M",
  color: { dark: "#060a14", light: "#ffffff" },
});
console.log("make-qr: wrote public/upi-qr.png");
