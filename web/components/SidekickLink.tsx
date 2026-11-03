"use client";

import { SIDEKICK_LINK } from "@/lib/config";
import { track } from "@/lib/analytics";

/** An outbound link to Sidekick (the maker's other app). Opens in a new tab and records where it was clicked. */
export default function SidekickLink({
  location,
  className = "",
  children,
}: {
  location: "footer" | "promo_card";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={SIDEKICK_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("sidekick_click", { location })}
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
