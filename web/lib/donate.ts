/**
 * Donation settings. This is the ONLY place the UPI ID lives: the site, the QR script and the README image all
 * read it from here. After changing it, run `npm run qr` to regenerate public/upi-qr.png.
 *
 * If UPI_ID is not a valid VPA, the site hides the UPI payment UI and offers only the other links.
 */

export const UPI_ID = "9689021523@ybl";
export const UPI_NAME = "Chetan Pujari";

export const GITHUB_SPONSORS_URL = "https://github.com/sponsors/chetanpujari5105";
// Optional. Leave empty to hide the "Buy me a coffee" button.
export const BMC_URL = "";

export const SUGGESTED_AMOUNTS = [29, 49, 99, 199] as const;
export const DEFAULT_AMOUNT = 49;
export const MAX_AMOUNT = 100000;

/** True once UPI_ID looks like a real VPA (name@handle). */
export const UPI_READY = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/.test(UPI_ID);

/** A standard UPI deep link, understood by GPay, PhonePe, Paytm, BHIM and every other UPI app. */
export function upiLink(amount?: number) {
  // A VPA only contains [A-Za-z0-9.-_@], so it goes in as-is (a literal "@", as UPI apps expect).
  const base = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR&tn=TankiAlert%20support`;
  return amount ? `${base}&am=${amount}` : base;
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
