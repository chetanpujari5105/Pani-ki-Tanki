# Product

> Inferred from the owner's written brief and the app source (`../Sources`). The owner asked for no interview, so facts
> marked *(inferred)* are assumptions to confirm.

## Platform

web

## Stack

Next.js (App Router, static export) + TypeScript + Tailwind CSS v4 + Motion (Framer Motion). Deployed on Vercel.

## Users

Mac laptop owners, mostly Indian and South-Asian, who leave their MacBook on charge and forget it. They are fluent in
the desi meme "pani ki tanki bhar gayi" (the rooftop tank is full, switch off the motor). *(inferred)* They find
the site through a reel or a share, on a phone first, and download on the Mac later.

## Product Purpose

TankiAlert is a free macOS menu bar app. When the Mac is charging and the battery reaches the chosen %, it plays your
sound (by default, the funny "pani ki tanki bhar gayi" clip) once per charge cycle.

## Positioning

A joke that is also a genuinely useful battery-health habit. It is tiny, private and free, and made by one independent
builder in Pune.

## Operating Context

macOS 13+, Apple Silicon and Intel. The app lives in the menu bar only. The Mac must be awake. It works offline.

## Capabilities and Constraints

- Custom sound (mp3/m4a/wav), threshold 50–100% (default 100), repeat 1–5× (default 2), notification, test button,
  launch at login.
- Fires once per charge cycle. Re-arms on unplug or a 3-point drop below the threshold.
- Ad-hoc signed and not notarized, so Gatekeeper warns on the first open.
- No data collection and no network use.
- Price: free. Version 1.0. The zip is about 1.9 MB.

## Brand Commitments

The water-tank metaphor. A dark premium base with aqua/cyan and electric blue, plus a warm highlight. Glass is used
sparingly, and there is subtle grain. A playful, Hinglish voice. The app icon shows a battery behind a rooftop
water tank with yellow "ting" marks.

## Evidence on Hand

The real sound (`public/tanki.mp3`, 12.6 s), the app icon, and the popover UI in `ContentView.swift`. There are no
testimonials, download counts or press. Do not invent any.

## Product Principles

Joke first, then usefulness. Never nag. Privacy by default.

## Accessibility & Inclusion

WCAG AA. Full keyboard support. Honor `prefers-reduced-motion`. Sound never autoplays.
