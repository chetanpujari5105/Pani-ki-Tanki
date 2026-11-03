/**
 * Donation settings. This is the ONLY place the UPI ID lives: the site, the QR script and the README image all
 * read it from here. After changing it, run `npm run qr` to regenerate public/upi-qr.png.
 *
 * If UPI_ID is not a valid VPA, the site hides the UPI payment UI and offers only Ko-fi.
 */

export const UPI_ID = "9689021523@ybl";
export const UPI_NAME = "Chetan Pujari";

// For supporters outside India: card or PayPal through Ko-fi.
export const KOFI_URL = "https://ko-fi.com/chetan46146";

export const SUGGESTED_AMOUNTS = [5, 10, 25, 50] as const;
export const DEFAULT_AMOUNT = 10;
/** The custom field accepts whole rupees from MIN_AMOUNT to MAX_AMOUNT. */
export const MIN_AMOUNT = 1;
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
