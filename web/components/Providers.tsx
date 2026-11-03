"use client";

import { useEffect } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

/** Motion features load once, and scroll reveals and micro-illustrations start when they enter the viewport. */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal], .micro");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target.classList.contains("micro")) {
            e.target.classList.toggle("is-in", e.isIntersecting);
          } else if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
