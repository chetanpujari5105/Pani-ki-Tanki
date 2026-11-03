/** The TankiAlert mark: a ribbed rooftop tank whose lid is a battery terminal. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="12" y="2.5" width="8" height="3.5" rx="1.4" fill="#6f8cc4" />
      <path d="M6 11c0-3.3 2.7-5.5 6-5.5h8c3.3 0 6 2.2 6 5.5v15.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 6 26.5V11Z" fill="#132042" stroke="#9cc4ff" strokeOpacity=".55" strokeWidth="1.2" />
      <path d="M7.2 17.5c2.2-1.4 4.4-1.4 6.6 0s4.4 1.4 6.6 0 3.6-1.2 4.4-.6V26a1.8 1.8 0 0 1-1.8 1.8H9A1.8 1.8 0 0 1 7.2 26v-8.5Z" fill="#3ce3d8" />
      <path d="M6.5 13.5q9.5 2 19 0" stroke="#cfe3ff" strokeOpacity=".35" strokeWidth="1" fill="none" />
    </svg>
  );
}
