/* ============================================================
   Q-SEQ AMR — motion & generative visual system
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ---------- Palette ---------- */
  const C = {
    fog: "233, 231, 226",
    magenta: "255, 47, 142",
    violet: "139, 92, 246",
    ice: "143, 216, 255",
    mint: "159, 232, 184",
  };

  /* ============================================================
     PRELOADER + INITIAL STATE
     ============================================================ */
  const preloader = document.getElementById("preloader");
  const boot = () => {
    document.body.classList.add("loaded");
    if (preloader) preloader.classList.add("done");
  };
  if (prefersReduced) {
    boot();
  } else {
    window.addEventListener("load", () => setTimeout(boot, 950), { once: true });
    setTimeout(boot, 2600); // hard fallback
  }

  /* ============================================================
     NAVIGATION — theme adaptation + scrolled state
     ============================================================ */
  const nav = document.getElementById("nav");
  const themedSections = [...document.querySelectorAll("[data-nav-theme]")];

  const syncNav = () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
    const probeY = nav.offsetHeight * 0.6;
    let theme = "light"; // hero default
    for (const s of themedSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= probeY && r.bottom > probeY) { theme = s.dataset.navTheme; break; }
    }
    nav.classList.toggle("on-light", theme === "light");
  };
  syncNav();
  window.addEventListener("scroll", syncNav, { passive: true });

  /* Mobile menu */
  const burger = document.getElementById("navBurger");
  const overlay = document.getElementById("menuOverlay");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    overlay.classList.toggle("open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    syncNav();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ============================================================
     SCROLL REVEALS
     ============================================================ */
  const revealables = [...document.querySelectorAll(".reveal")];
  const staggerGroups = [...document.querySelectorAll(".stagger")];

  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach((el) => io.observe(el));

    const ioStagger = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        [...e.target.children].forEach((child, i) => {
          child.style.transitionDelay = `${Math.min(i * 80, 560)}ms`;
          child.classList.add("in");
        });
        ioStagger.unobserve(e.target);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    staggerGroups.forEach((el) => ioStagger.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("in"));
    staggerGroups.forEach((g) => [...g.children].forEach((c) => c.classList.add("in")));
  }

  /* ============================================================
     FEATURE CARDS — cursor-tracked glow
     ============================================================ */
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  /* ============================================================
     COVERAGE-DEBT FIGURE (Problem section) — generated bars
     ============================================================ */
  (() => {
    const g = document.querySelector(".cds-bars");
    if (!g) return;
    const NS = "http://www.w3.org/2000/svg";
    const n = 44, x0 = 20, x1 = 540, base = 150, minH = 8, maxH = 118, threshold = 90;
    const w = ((x1 - x0) / n) * 0.62;
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      // Two deliberate "starved" regions to make the point visually
      const starved = (t > 0.28 && t < 0.4) || (t > 0.72 && t < 0.8);
      const h = starved
        ? minH + rnd() * 34
        : Math.min(maxH, threshold * (0.85 + rnd() * 0.55));
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", (x0 + (i / n) * (x1 - x0)).toFixed(1));
      rect.setAttribute("y", (base - h).toFixed(1));
      rect.setAttribute("width", w.toFixed(1));
      rect.setAttribute("height", h.toFixed(1));
      rect.setAttribute("rx", "1.5");
      if (h < threshold) rect.classList.add("debt");
      g.appendChild(rect);
    }
  })();

  /* ============================================================
     CONSOLE — metric fills, counters, evidence counter
     ============================================================ */
  (() => {
    const consoleEl = document.getElementById("console");
    if (!consoleEl) return;

    const counters = [...consoleEl.querySelectorAll(".count")];
    const metrics = [...consoleEl.querySelectorAll(".metric")];
    const evidenceEl = document.getElementById("evidenceCounter");
    let armed = false;

    const animateCount = (el, target, dur = 1600) => {
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const arm = () => {
      if (armed) return;
      armed = true;
      metrics.forEach((m, i) => setTimeout(() => m.classList.add("armed"), i * 160));
      counters.forEach((c, i) =>
        setTimeout(() => animateCount(c, +c.dataset.target), i * 160));
      if (evidenceEl && !prefersReduced) {
        let mb = 0;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / 2200, 1);
          mb = 428.4 * (1 - Math.pow(1 - p, 3));
          evidenceEl.textContent = mb.toFixed(2);
          if (p < 1) requestAnimationFrame(tick);
          else creep();
        };
        // keep gently ticking upward afterwards — it's a live run
        const creep = () => {
          mb += 0.013 + Math.random() * 0.02;
          evidenceEl.textContent = mb.toFixed(2);
          setTimeout(() => requestAnimationFrame(creep), 480 + Math.random() * 900);
        };
        requestAnimationFrame(tick);
      } else if (evidenceEl) {
        evidenceEl.textContent = "428.40";
      }
    };

    if (prefersReduced) {
      metrics.forEach((m) => m.classList.add("armed"));
      counters.forEach((c) => (c.textContent = c.dataset.target));
      arm();
      return;
    }
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { arm(); obs.disconnect(); }
    }, { threshold: 0.35 }).observe(consoleEl);
  })();

  /* ============================================================
     CANVAS UTILITIES
     ============================================================ */
  const canvasLoop = (canvas, draw, { fpsCap = 60 } = {}) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, raf = 0, visible = false, last = 0;
    const frameMin = 1000 / fpsCap;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(r.width, 1); h = Math.max(r.height, 1);
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - last < frameMin) return;
      last = t;
      draw(ctx, w, h, t / 1000);
    };

    if (prefersReduced) { draw(ctx, w, h, 12.4); return; }

    new IntersectionObserver((entries) => {
      for (const e of entries) {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
        if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
      }
    }, { rootMargin: "80px" }).observe(canvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
      else if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame);
    });
  };

  /* ============================================================
     HERO — scroll-driven DNA that zooms into its nucleotides
     ============================================================ */
  (() => {
    const canvas = document.getElementById("dnaCanvas");
    const wrap = document.getElementById("heroScroll");
    const stage = document.querySelector(".hero-stage");
    if (!canvas || !wrap || !stage) return;

    const statement = document.querySelector(".hero-statement");
    const note = document.querySelector(".hero-stage-note");
    const chips = [...document.querySelectorAll(".hero-tagchip")];
    const caption = document.getElementById("zoomCaption");
    const hint = document.getElementById("scrollHint");

    /* Nucleotide palette — soft scientific tones on the light stage */
    const BASE_COLOR = {
      A: "127, 164, 134",   // sage
      T: "196, 172, 122",   // sand
      G: "134, 165, 190",   // ice gray-blue
      C: "209, 128, 165",   // muted rose
    };
    const PAIR = { A: "T", T: "A", G: "C", C: "G" };
    const INK = "26, 26, 31";

    /* Deterministic pseudo-random sequence */
    let seed = 97;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const LETTERS = ["A", "T", "G", "C"];
    const N = 72;
    const seq = Array.from({ length: N }, () => LETTERS[Math.floor(rnd() * 4)]);

    const FOCUS = 40;                 // the rung the camera dives into
    let progress = prefersReduced ? 0 : 0;

    const updateProgress = () => {
      const track = wrap.offsetHeight - stage.offsetHeight;
      if (track <= 0) return;
      progress = Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / track));
    };
    if (!prefersReduced) window.addEventListener("scroll", updateProgress, { passive: true });

    const easeP = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep

    const updateOverlays = (p) => {
      if (prefersReduced) return;
      const fadeOut = Math.max(0, 1 - p * 2.4);
      if (statement) statement.style.opacity = fadeOut;
      if (note) note.style.opacity = fadeOut;
      chips.forEach((c) => { c.style.opacity = fadeOut; c.style.visibility = fadeOut < 0.02 ? "hidden" : "visible"; });
      if (caption) caption.style.opacity = Math.max(0, Math.min(1, (p - 0.66) / 0.22));
      if (hint) hint.style.opacity = Math.max(0, 1 - p * 3.2);
    };

    canvasLoop(canvas, (ctx, w, h, t) => {
      updateOverlays(easeP(progress));
      ctx.clearRect(0, 0, w, h);

      const p = easeP(progress);
      const pz = Math.min(1, p / 0.85);                   // dwell on the close-up for the last 15%
      const narrow = w < 700;
      const zoom = 1 + pz * pz * 7.4;                     // 1 → ~8.4
      const cx = w * (narrow ? 0.5 : 0.64) + (w * 0.5 - w * (narrow ? 0.5 : 0.64)) * pz;
      const cy = h * 0.52;
      const R = Math.min(w * (narrow ? 0.3 : 0.125), h * 0.21) * zoom;
      const spacing = (h / 24) * zoom;
      const rot = (prefersReduced ? 0.9 : t * 0.22) + p * 2.2;
      const twist = 0.585;                                 // rad per base pair

      /* Entrance fade so the helix settles softly over the mist */
      const born = Math.min(1, Math.max(0, (t - 0.2) / 1.4));
      ctx.globalAlpha = prefersReduced ? 1 : born;

      const letterAlpha = Math.max(0, Math.min(1, (zoom - 3.4) / 3));
      const rungs = [];
      for (let i = 0; i < N; i++) {
        const y = cy + (i - FOCUS) * spacing;
        if (y < -spacing || y > h + spacing) continue;
        const a = i * twist + rot;
        const c1 = Math.cos(a), s1 = Math.sin(a);
        rungs.push({
          i, y,
          x1: cx + c1 * R, z1: s1,
          x2: cx - c1 * R, z2: -s1,
        });
      }

      /* Back-to-front strand pass for correct overlap */
      const dot = (x, y, r, tone, alpha) => {
        ctx.fillStyle = `rgba(${tone}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      for (const rung of rungs) {
        const base1 = seq[rung.i];
        const base2 = PAIR[base1];
        const dMid = 0.5 + (rung.z1 + rung.z2) * 0.25;      // ~0.5 always; kept for clarity

        /* base-pair bridge */
        const bx1 = rung.x1 + (rung.x2 - rung.x1) * 0.22;
        const bx2 = rung.x1 + (rung.x2 - rung.x1) * 0.78;
        ctx.strokeStyle = `rgba(${INK}, ${0.16 + 0.1 * dMid})`;
        ctx.lineWidth = Math.max(1, zoom * 0.5);
        ctx.beginPath();
        ctx.moveTo(rung.x1, rung.y);
        ctx.lineTo(rung.x2, rung.y);
        ctx.stroke();

        /* hydrogen-bond ticks appear at deep zoom */
        if (zoom > 5) {
          const ha = Math.min(0.55, (zoom - 5) / 4);
          const bonds = base1 === "A" || base1 === "T" ? 2 : 3;
          const mid = (bx1 + bx2) / 2, span = (bx2 - bx1) * 0.16;
          ctx.strokeStyle = `rgba(${INK}, ${ha})`;
          ctx.lineWidth = Math.max(1, zoom * 0.22);
          for (let b = 0; b < bonds; b++) {
            const off = (b - (bonds - 1) / 2) * spacing * 0.1;
            ctx.beginPath();
            ctx.moveTo(mid - span, rung.y + off);
            ctx.lineTo(mid + span, rung.y + off);
            ctx.stroke();
          }
        }

        /* the two nucleotides */
        const nR = Math.max(3, zoom * 2.1);
        const d1 = 0.55 + rung.z1 * 0.45, d2 = 0.55 + rung.z2 * 0.45;
        dot(bx1, rung.y, nR * (0.75 + d1 * 0.35), BASE_COLOR[base1], 0.5 + d1 * 0.5);
        dot(bx2, rung.y, nR * (0.75 + d2 * 0.35), BASE_COLOR[base2], 0.5 + d2 * 0.5);

        /* backbone beads */
        const bR = Math.max(2.4, zoom * 1.5);
        dot(rung.x1, rung.y, bR * (0.7 + d1 * 0.4), INK, 0.28 + d1 * 0.5);
        dot(rung.x2, rung.y, bR * (0.7 + d2 * 0.4), INK, 0.28 + d2 * 0.5);

        /* base letters — legible only once the camera is close */
        if (letterAlpha > 0.02) {
          const fs = Math.min(26, 3.9 * zoom);
          ctx.font = `500 ${fs}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${INK}, ${letterAlpha * 0.92})`;
          ctx.fillText(base1, bx1, rung.y + 1);
          ctx.fillText(base2, bx2, rung.y + 1);
        }
      }

      /* smooth backbone threads (finely sampled sine curves) */
      const iMin = FOCUS - Math.ceil((cy + spacing) / spacing);
      const iMax = FOCUS + Math.ceil((h - cy + spacing) / spacing);
      ctx.lineWidth = Math.max(1, zoom * 0.42);
      for (let s = 0; s < 2; s++) {
        ctx.strokeStyle = `rgba(${INK}, 0.28)`;
        ctx.beginPath();
        let started = false;
        for (let j = iMin; j <= iMax; j += 0.2) {
          const y = cy + (j - FOCUS) * spacing;
          const a = j * twist + rot + (s === 0 ? 0 : Math.PI);
          const x = cx + Math.cos(a) * R;
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }, { fpsCap: 60 });
  })();

  /* ============================================================
     CONSOLE — circular genome evidence map
     ============================================================ */
  (() => {
    const canvas = document.getElementById("genomeCanvas");
    if (!canvas) return;

    const SEGS = 72;
    let seed = 42;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const segs = Array.from({ length: SEGS }, (_, i) => {
      const t = i / SEGS;
      const starved = (t > 0.30 && t < 0.38) || (t > 0.63 && t < 0.68);
      return {
        target: starved ? 0.2 + rnd() * 0.3 : 0.62 + rnd() * 0.38,
        starved,
        delay: rnd() * 1.4,
      };
    });

    let born = null;

    canvasLoop(canvas, (ctx, w, h, t) => {
      if (born === null) born = t;
      const age = prefersReduced ? 99 : t - born;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.42;
      const inner = R * 0.76;

      /* faint guide rings */
      ctx.strokeStyle = `rgba(${C.fog}, 0.07)`;
      ctx.lineWidth = 1;
      for (const rr of [R * 1.06, inner * 0.9]) {
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      }

      /* tick marks */
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2 - Math.PI / 2;
        const long = i % 8 === 0;
        const r1 = R * 1.1, r2 = r1 + (long ? 7 : 3.5);
        ctx.strokeStyle = `rgba(${C.fog}, ${long ? 0.28 : 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      /* coverage segments */
      const gap = 0.012;
      for (let i = 0; i < SEGS; i++) {
        const s = segs[i];
        const a0 = (i / SEGS) * Math.PI * 2 - Math.PI / 2 + gap;
        const a1 = ((i + 1) / SEGS) * Math.PI * 2 - Math.PI / 2 - gap;
        const grow = Math.max(0, Math.min(1, (age - s.delay) / 1.6));
        const eased = 1 - Math.pow(1 - grow, 3);
        const flicker = s.starved ? 0.85 + Math.sin(t * 3 + i) * 0.15 : 1;
        const level = s.target * eased;

        // base track
        ctx.strokeStyle = `rgba(${C.fog}, 0.08)`;
        ctx.lineWidth = R - inner;
        ctx.beginPath();
        ctx.arc(cx, cy, (R + inner) / 2, a0, a1);
        ctx.stroke();

        // filled evidence
        if (level > 0.01) {
          const mid = (a0 + a1) / 2;
          const hue = s.starved ? C.magenta : (Math.sin(mid * 2) > 0.3 ? C.violet : C.fog);
          const alpha = s.starved ? 0.75 * flicker : 0.28 + level * 0.5;
          const rOut = inner + (R - inner) * (0.25 + level * 0.75);
          ctx.strokeStyle = `rgba(${hue}, ${alpha})`;
          ctx.lineWidth = rOut - inner;
          ctx.beginPath();
          ctx.arc(cx, cy, (rOut + inner) / 2, a0, a1);
          ctx.stroke();
        }
      }

      /* rotating scanner */
      if (!prefersReduced) {
        const sa = t * 0.7 - Math.PI / 2;
        const grad = ctx.createLinearGradient(
          cx, cy, cx + Math.cos(sa) * R * 1.08, cy + Math.sin(sa) * R * 1.08);
        grad.addColorStop(0, `rgba(${C.ice}, 0)`);
        grad.addColorStop(1, `rgba(${C.ice}, 0.55)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(sa) * inner * 0.55, cy + Math.sin(sa) * inner * 0.55);
        ctx.lineTo(cx + Math.cos(sa) * R * 1.08, cy + Math.sin(sa) * R * 1.08);
        ctx.stroke();
        ctx.fillStyle = `rgba(${C.ice}, 0.9)`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(sa) * R * 1.08, cy + Math.sin(sa) * R * 1.08, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }, { fpsCap: 48 });
  })();

  /* ============================================================
     LIVE TIMER in console header
     ============================================================ */
  (() => {
    const el = document.querySelector(".console-header-right");
    if (!el || prefersReduced) return;
    let sec = 2 * 3600 + 47 * 60 + 12;
    setInterval(() => {
      sec++;
      const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      el.textContent = `T+${hh}:${mm}:${ss}`;
    }, 1000);
  })();
})();
