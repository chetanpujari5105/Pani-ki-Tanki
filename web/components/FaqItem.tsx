"use client";

import { track } from "@/lib/analytics";

/** A FAQ <details> row that reports which question was opened (the question text only, nothing personal). */
export default function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details
      name="faq"
      data-reveal
      className="group"
      onToggle={(e) => {
        if (e.currentTarget.open) track("faq_open", { question });
      }}
    >
      {children}
    </details>
  );
}
