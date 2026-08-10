# Q-SEQ AMR — Sequencing Intelligence Platform

**Know when the evidence is enough.**

A premium concept website for Q-SEQ AMR — a biological-question-aware sequencing
intelligence platform that monitors sequencing evidence in real time and helps
researchers decide whether a run is ready for species identification and
antimicrobial resistance (AMR) analysis.

## Design system

- **Aesthetic** — light, airy editorial futurism: ink-on-paper typography,
  soft sculptural 3D renders in pale tones, generous whitespace, and one
  contained dark "control room" console panel. Accent color is reduced to
  small technical details (dots, labels, micro-chips).
- **Typography** — Clash Display (oversized wordmark & headlines),
  Satoshi (body), JetBrains Mono (technical labels & metadata).
- **Art-directed 3D imagery** (`assets/`, WebP): a misty pale molecular
  scene (hero stage), sage bead chains with floating annotation chips, a
  white sphere-model helix, a glowing translucent cell specimen, and a warm
  porous lattice behind the frosted-glass closing panel.
- **Generative canvas** — the live console renders a circular genome
  evidence map (per-segment coverage, starved-target flicker, rotating
  scanner), hand-written with no libraries.
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
