---
name: TankiAlert
description: A rooftop at night where the scroll is the charge
colors:
  night: "#060a14"
  night-2: "#0a1222"
  night-3: "#101b31"
  ink: "#eaf2ff"
  mist: "#a3b4d1"
  haze: "#7f93b5"
  aqua: "#3ce3d8"
  aqua-foam: "#a8fff8"
  electric: "#2f6bff"
  electric-deep: "#1236a8"
  water-deep: "#1f56d8"
  marigold: "#ffb23f"
  skyline: "#0b1428"
  macos-accent: "#3b82ff"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 7.6vw, 5.9rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  heading:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  devanagari:
    fontFamily: "Kohinoor Devanagari, Nirmala UI, Noto Sans Devanagari, sans-serif"
  macos-ui:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "13px"
rounded:
  control: "10px"
  button: "14px"
  card: "16px"
  popover: "12px"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  section: "8rem"
  section-mobile: "6rem"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.night}"
    rounded: "{rounded.button}"
    height: "56px"
    padding: "0 28px"
  button-primary-hover:
    backgroundColor: "{colors.aqua-foam}"
  button-nav:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.night}"
    rounded: "{rounded.control}"
    height: "40px"
  bento-tile:
    backgroundColor: "{colors.night-2}"
    rounded: "{rounded.card}"
  speech-bubble:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.night}"
    rounded: "{rounded.card}"
  mac-popover:
    backgroundColor: "rgb(36 40 50 / 0.78)"
    textColor: "#ffffff"
    rounded: "{rounded.popover}"
    width: "280px"
---

# Design System: TankiAlert

## Overview

An Indian rooftop at night. The page is the roof: a ribbed, translucent Sintex-style water tank (whose lid is a
battery terminal) stands on a parapet in front of a skyline of other people's tanks. Water is the only bright
material. Scrolling is charging: the hero tank fills on load, a pipe fills through "How it works", the LED level
indicator lights up, and the final section floods. The voice is Hinglish and playful. The craft is quiet and
premium: one world, with no stock SaaS chrome.

## Colors

The strategy is a Committed night palette with water as its one luminous material.

- **Night ink** (`night`, `night-2`): the ground. Sections alternate between these two only. Body text is `ink`, secondary
  text is `mist` (8.9:1), and tertiary text is `haze` (5.6:1). Never use grey: secondary text is always tinted blue.
- **Water** (`aqua` to `electric` to `electric-deep`): fills, the primary CTA, live states, and lit LEDs. Water gradients run
  top to bottom: aqua at the surface, deep blue at the floor.
- **Marigold** is reserved for the alert moment: the threshold line, the speech bubble, the "ting" marks, the buzzer
  LED and focus rings. Don't use it for decoration or labels.
- **Popover replica** colors (`macos-accent` and the translucent popover ground) belong to the macOS replica only.

## Typography

- **Bricolage Grotesque** (variable, with the `opsz` axis) for all display and headings, at 800 weight, tracked -0.035em and
  set tight (0.95 to 1). Titles are 700 weight at -0.02em.
- **Figtree** for body, at 1.0625rem with 1.6 leading, with measure capped at roughly 62 characters in long answers.
- **Devanagari** comes from the system stack, as an accent only: the tank's painted "टंकी" and the bubble's second line.
- The **macOS replica** uses the system font at 13px, with tabular numbers everywhere a % appears.

## Layout

The container is 1240px with a fluid gutter. Hero: 5/12 text and 7/12 demo at ≥1024px, stacked below. In the demo, the
tank stands on the parapet. At ≥768px the popover hangs from the menu bar strip, overlapping the tank's right shoulder.
Bento: a six-column grid with spans 4/2, 2/4 and 3/3, two columns at md and one on phones. Section rhythm is 6rem on phones and
8rem from sm up. Rooftop dividers (skyline plus parapet) separate How it works from Showcase, and FAQ from Final CTA.

## Elevation & Depth

Depth comes from light, not cards: soft colored glows behind the tank and CTA, plus offset soft shadows on floating
UI (the popover and notification). Glass (`backdrop-blur`) is allowed only where the subject is glass: the sticky
nav, the macOS menu bar, the popover and the notification banner. A fixed grain layer at 7% sits over everything.

## Shapes

Radii are 10px for controls, 14px for the CTA, 16px for tiles and bubbles, and 12px for the popover (macOS). Full circles
are for play buttons, LEDs and step nodes. The tank, ribs, stand and pipes are drawn as exact SVG geometry.

## Components

- **Tank** (`components/Tank.tsx`): an SVG with two wave layers and a crest line written per frame. It shows an "ALERT n%"
  marigold threshold line, rising bubbles, and an overflow stream at 100%. Its "ting" is the surface agitating, plus 14
  droplets thrown up, a ripple, marigold marks, and the speech bubble.
- **Download button**: aqua with a magnetic spring (fine pointers only). On hover, foam-colored water rises inside it.
  On press it scales to 0.97.
- **macOS popover replica**: copied from `ContentView.swift`. The checkbox toggles, slider, stepper and buttons work.
- **Level indicator**: five nav dots (640–1279px) or a fixed LED panel (≥1280px). The marigold buzzer LED lights
  only when the final tank is full.
- **Hear it**: a waveform drawn from the mp3's real RMS peaks. It is a keyboard-operable seek slider.

## Do's and Don'ts

- Do let water be the only bright material, and keep marigold for "full or alert".
- Do draw the world in exact geometry: tanks, ribs, pipes, the skyline.
- Do give every animation a reduced-motion state: still water, no droplets, and a static bubble.
- Don't add eyebrows or kickers above headings, gradient text, or generic icon-plus-heading card rows.
- Don't invent social proof, download counts or press quotes. The product facts in PRODUCT.md are the only claims.
