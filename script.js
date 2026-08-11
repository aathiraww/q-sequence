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
     HERO — sculptural 3D DNA that dives into its nucleotides
     True perspective camera. Soft shaded spheres. Depth-sorted.
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

    /* Soft scientific palette — matte beads, never neon */
    const BASE = {
      A: [132, 168, 138],
      T: [198, 168, 118],
      G: [138, 166, 188],
      C: [204, 138, 162],
    };
    const PAIR = { A: "T", T: "A", G: "C", C: "G" };
    const BACKBONE = [92, 92, 98];
    const SUGAR = [228, 223, 214];

    let seed = 97;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const LETTERS = ["A", "T", "G", "C"];
    const PAIRS = 56;
    const FOCUS = 30;
    const seq = Array.from({ length: PAIRS }, () => LETTERS[Math.floor(rnd() * 4)]);

    /* Helix geometry in world units */
    const HELIX_R = 1.55;
    const PITCH = 0.72;          // vertical step per base pair
    const TWIST = 0.60;          // rad per base pair (~34.5°)
    const BACKBONE_STEPS = 5;    // spheres between each rung on a strand

    let progress = 0;
    const updateProgress = () => {
      const track = wrap.offsetHeight - stage.offsetHeight;
      if (track <= 0) return;
      progress = Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / track));
    };
    if (!prefersReduced) window.addEventListener("scroll", updateProgress, { passive: true });

    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    const lerp = (a, b, t) => a + (b - a) * t;

    const updateOverlays = (p) => {
      if (prefersReduced) return;
      const fadeOut = Math.max(0, 1 - p * 2.2);
      if (statement) statement.style.opacity = fadeOut;
      if (note) note.style.opacity = fadeOut;
      chips.forEach((c) => {
        c.style.opacity = fadeOut;
        c.style.visibility = fadeOut < 0.02 ? "hidden" : "visible";
      });
      if (caption) caption.style.opacity = Math.max(0, Math.min(1, (p - 0.58) / 0.22));
      if (hint) hint.style.opacity = Math.max(0, 1 - p * 3);
    };

    /* Soft shaded sphere — matte volume with a quiet specular */
    const drawSphere = (ctx, x, y, r, rgb, alpha, depth) => {
      if (r < 0.4 || alpha < 0.02) return;
      const shade = 0.72 + depth * 0.28;
      const c = [
        Math.min(255, rgb[0] * shade + 18),
        Math.min(255, rgb[1] * shade + 18),
        Math.min(255, rgb[2] * shade + 18),
      ];
      const g = ctx.createRadialGradient(
        x - r * 0.32, y - r * 0.36, r * 0.05,
        x, y, r
      );
      g.addColorStop(0, `rgba(${Math.min(255, c[0] + 55)}, ${Math.min(255, c[1] + 55)}, ${Math.min(255, c[2] + 55)}, ${alpha})`);
      g.addColorStop(0.45, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`);
      g.addColorStop(1, `rgba(${c[0] * 0.55}, ${c[1] * 0.55}, ${c[2] * 0.55}, ${alpha * 0.95})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    canvasLoop(canvas, (ctx, w, h, t) => {
      const p = ease(progress);
      const pz = Math.min(1, p / 0.82); // dwell on the close-up
      updateOverlays(p);
      ctx.clearRect(0, 0, w, h);

      const born = prefersReduced ? 1 : Math.min(1, Math.max(0, (t - 0.15) / 1.3));
      if (born < 0.01) return;

      /* ---- Camera: starts wide looking at the helix, dives into FOCUS ---- */
      const focusY = FOCUS * PITCH;
      const orbit = (prefersReduced ? 0.55 : t * 0.18) + pz * 0.85;
      const camDist = lerp(11.5, 2.35, pz * pz);
      const camY = lerp(focusY - 0.4, focusY + 0.15, pz);
      const camPitch = lerp(0.18, 0.02, pz); // slight downward look at start
      const fov = lerp(52, 38, pz);          // narrows as we dive
      const f = (0.5 * Math.min(w, h)) / Math.tan((fov * Math.PI) / 360);

      /* World → camera → screen */
      const project = (wx, wy, wz) => {
        /* orbit around Y */
        const cos = Math.cos(orbit), sin = Math.sin(orbit);
        let x = wx * cos - wz * sin;
        let z = wx * sin + wz * cos;
        let y = wy - camY;
        /* pitch */
        const cp = Math.cos(camPitch), sp = Math.sin(camPitch);
        const y2 = y * cp - z * sp;
        const z2 = y * sp + z * cp;
        const zCam = z2 + camDist;
        if (zCam < 0.35) return null;
        const s = f / zCam;
        return {
          x: w * 0.52 + x * s,
          y: h * 0.5 + y2 * s,
          rScale: s,
          depth: 1 / zCam,
          zCam,
        };
      };

      /* Build all sphere primitives, then depth-sort once */
      const spheres = [];
      const labels = [];
      const bonds = [];

      for (let i = 0; i < PAIRS; i++) {
        const y = i * PITCH;
        const a = i * TWIST;
        const base1 = seq[i];
        const base2 = PAIR[base1];

        /* Strand positions at this rung */
        const sx1 = Math.cos(a) * HELIX_R, sz1 = Math.sin(a) * HELIX_R;
        const sx2 = Math.cos(a + Math.PI) * HELIX_R, sz2 = Math.sin(a + Math.PI) * HELIX_R;

        /* Dense backbone beads between this rung and the next */
        if (i < PAIRS - 1) {
          for (let s = 0; s < 2; s++) {
            const a0 = a + s * Math.PI;
            const a1 = a0 + TWIST;
            for (let k = 0; k < BACKBONE_STEPS; k++) {
              const u = k / BACKBONE_STEPS;
              const aa = a0 + (a1 - a0) * u;
              const yy = y + PITCH * u;
              const wx = Math.cos(aa) * HELIX_R;
              const wz = Math.sin(aa) * HELIX_R;
              /* alternate sugar / phosphate for subtle material variation */
              const rgb = k % 2 === 0 ? BACKBONE : SUGAR;
              const rad = k % 2 === 0 ? 0.22 : 0.17;
              spheres.push({ wx, wy: yy, wz, rad, rgb, kind: "bb" });
            }
          }
        }

        /* Nucleotide spheres along the base-pair axis */
        const nx1 = lerp(sx1, sx2, 0.28);
        const nz1 = lerp(sz1, sz2, 0.28);
        const nx2 = lerp(sx1, sx2, 0.72);
        const nz2 = lerp(sz1, sz2, 0.72);
        spheres.push({ wx: nx1, wy: y, wz: nz1, rad: 0.34, rgb: BASE[base1], kind: "nt", letter: base1, i });
        spheres.push({ wx: nx2, wy: y, wz: nz2, rad: 0.34, rgb: BASE[base2], kind: "nt", letter: base2, i });

        /* Tiny sugar stubs tying nucleotide to backbone */
        spheres.push({
          wx: lerp(sx1, nx1, 0.5), wy: y, wz: lerp(sz1, nz1, 0.5),
          rad: 0.13, rgb: SUGAR, kind: "link",
        });
        spheres.push({
          wx: lerp(sx2, nx2, 0.5), wy: y, wz: lerp(sz2, nz2, 0.5),
          rad: 0.13, rgb: SUGAR, kind: "link",
        });

        bonds.push({
          ax: nx1, ay: y, az: nz1,
          bx: nx2, by: y, bz: nz2,
          n: base1 === "A" || base1 === "T" ? 2 : 3,
          i,
        });
      }

      /* Project + cull */
      const drawn = [];
      for (const s of spheres) {
        const pjt = project(s.wx, s.wy, s.wz);
        if (!pjt) continue;
        /* Soft DOF: spheres far from the focus plane fade & shrink slightly at deep zoom */
        const dy = Math.abs(s.wy - focusY);
        const dof = pz > 0.35 ? Math.exp(-dy * dy * pz * 1.8) : 1;
        const screenR = s.rad * pjt.rScale;
        if (screenR < 0.35 || dof < 0.04) continue;
        drawn.push({
          ...s,
          x: pjt.x, y: pjt.y,
          r: screenR,
          depth: pjt.depth,
          zCam: pjt.zCam,
          dof,
        });
      }
      drawn.sort((a, b) => a.depth - b.depth); // back → front

      ctx.save();
      ctx.globalAlpha = born;

      /* Soft atmospheric haze so the helix feels embedded in the mist */
      if (pz < 0.5) {
        const mist = ctx.createRadialGradient(w * 0.55, h * 0.55, 40, w * 0.55, h * 0.55, Math.max(w, h) * 0.55);
        mist.addColorStop(0, "rgba(244, 242, 238, 0)");
        mist.addColorStop(1, `rgba(244, 242, 238, ${0.18 * (1 - pz * 2)})`);
        ctx.fillStyle = mist;
        ctx.fillRect(0, 0, w, h);
      }

      /* Hydrogen-bond ticks (projected, only near the focus at deep zoom) */
      const bondAlpha = Math.max(0, Math.min(1, (pz - 0.45) / 0.3));
      if (bondAlpha > 0.02) {
        for (const b of bonds) {
          if (Math.abs(b.i - FOCUS) > 4) continue;
          const pa = project(b.ax, b.ay, b.az);
          const pb = project(b.bx, b.by, b.bz);
          if (!pa || !pb) continue;
          const midX = (pa.x + pb.x) / 2;
          const midY = (pa.y + pb.y) / 2;
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const len = Math.hypot(dx, dy) || 1;
          const px = (-dy / len) * Math.max(2.2, pa.rScale * 0.08);
          const py = (dx / len) * Math.max(2.2, pa.rScale * 0.08);
          const span = 0.14;
          ctx.strokeStyle = `rgba(48, 48, 54, ${0.45 * bondAlpha})`;
          ctx.lineWidth = Math.max(1, pa.rScale * 0.03);
          ctx.lineCap = "round";
          for (let k = 0; k < b.n; k++) {
            const o = (k - (b.n - 1) / 2) * 1.15;
            const x1 = lerp(pa.x, pb.x, 0.5 - span) + px * o;
            const y1 = lerp(pa.y, pb.y, 0.5 - span) + py * o;
            const x2 = lerp(pa.x, pb.x, 0.5 + span) + px * o;
            const y2 = lerp(pa.y, pb.y, 0.5 + span) + py * o;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      /* Spheres */
      for (const s of drawn) {
        const alpha = (s.kind === "nt" ? 0.96 : s.kind === "bb" ? 0.9 : 0.75) * s.dof;
        drawSphere(ctx, s.x, s.y, s.r, s.rgb, alpha, Math.min(1, s.depth * 3));
        if (s.kind === "nt" && s.letter && pz > 0.4 && Math.abs(s.i - FOCUS) <= 3) {
          labels.push(s);
        }
      }

      /* Nucleotide letters — crisp labels once the camera is close enough */
      const letterA = Math.max(0, Math.min(1, (pz - 0.42) / 0.28));
      if (letterA > 0.02) {
        for (const s of labels) {
          const fs = Math.min(28, Math.max(11, s.r * 0.85));
          ctx.font = `600 ${fs}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255, 255, 255, ${0.92 * letterA * s.dof})`;
          ctx.fillText(s.letter, s.x, s.y + 0.5);
        }
      }

      /* Focus ring — a quiet scientific reticle on the target base pair at deep zoom */
      if (pz > 0.55) {
        const fa = Math.min(1, (pz - 0.55) / 0.25);
        const focusPt = project(0, focusY, 0);
        if (focusPt) {
          const rr = lerp(90, 48, pz) * (focusPt.rScale / 40);
          ctx.strokeStyle = `rgba(48, 48, 54, ${0.22 * fa})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.arc(focusPt.x, focusPt.y, Math.max(28, rr), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      ctx.restore();
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
