# Q-SEQ AMR — Sequencing Intelligence Platform

**Know when the evidence is enough.**

A premium concept website for Q-SEQ AMR — a biological-question-aware sequencing
intelligence platform that monitors sequencing evidence in real time and helps
researchers decide whether a run is ready for species identification and
antimicrobial resistance (AMR) analysis.

## Design system

- **Aesthetic** — luxury-biotech editorial: off-white / soft-gray minimalism
  balanced against charcoal "control room" sections with restrained neon
  (magenta, electric violet, icy blue, pale green) used only for scientific
  emphasis.
- **Typography** — Clash Display (oversized editorial headlines),
  Satoshi (body), JetBrains Mono (technical labels & metadata).
- **Generative visuals** — three hand-written canvas systems, no libraries:
  - hero: a leaning particle double-helix with base-pair rungs, drifting read
    fragments and a travelling evidence pulse;
  - live console: a circular genome evidence map with per-segment coverage,
    starved-target flicker and a rotating scanner;
  - technology: a slow flowing strand field.
- **Motion** — preloader calibration bar, masked hero line reveals,
  intersection-driven section reveals with stagger, counter and metric-bar
  animations, cursor-tracked card glow, marquee/ticker strips. Fully disabled
  under `prefers-reduced-motion`.

## Stack

Zero-dependency static site: `index.html` + `styles.css` + `script.js`.
Fonts load from Fontshare / Google Fonts CDNs.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Deployable as-is to GitHub Pages, Netlify, Vercel or any static host.
