"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";
import { startCanvasLoop } from "./components/useCanvasLoop";

const BOOT = [
  "> initializing blacksite kernel ........ ok",
  "> mounting encrypted volume /dev/ghost .. ok",
  "> negotiating onion circuit [7 hops] .... ok",
  "> spoofing mac :: a4:8e:0f:21:cc:11 ..... ok",
  "> probing 14.221.x.x subnet ............. 312 hosts",
  "> link established :: latency 41ms ...... secure",
];

function useStarfield(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stars: { x: number; y: number; z: number; s: number }[] = [];
    const N = 160;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    for (let i = 0; i < N; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 0.8 + 0.2,
        s: Math.random() * 1.4 + 0.3,
      });
    }
    window.addEventListener("resize", resize);

    function frame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        st.y += st.z * 0.25;
        if (st.y > canvas.height) {
          st.y = 0;
          st.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = st.z;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(st.x, st.y, st.s, st.s);
      }
    }
    const stop = startCanvasLoop(canvas, frame);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
    };
  }, [ref]);
}

const CHANNELS = [
  { label: "ACTIVE SESSIONS", unit: "NODES", lo: 280, hi: 340 },
  { label: "CIRCUIT INTEGRITY", unit: "%", lo: 88, hi: 101 },
  { label: "PAYLOADS STAGED", unit: "QUEUED", lo: 38, hi: 62 },
];

// Hand-drawn replacement for the old DOM stat boxes: three live telemetry
// traces on one canvas, same tokens, same loop discipline as every other viz.
function useIntercept(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const css = getComputedStyle(document.documentElement);
    const tok = (n: string, fb: string) => css.getPropertyValue(n).trim() || fb;
    const INK = tok("--ink", "#ededed");
    const DIM = tok("--ink-dim", "#9c9c9c");
    const FAINT = tok("--ink-faint", "#777777");
    const LINE = tok("--line", "#1c1c1c");
    const MONO = "SFMono-Regular, Menlo, Consolas, monospace";

    let W = 0;
    let H = 0;
    function size() {
      W = canvas!.clientWidth;
      H = canvas!.clientHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    const N = 90;
    let sessions = 312;
    let integrity = 99.4;
    let payloads = 47;
    let glitch = 0;
    let tick = 0;
    const next = [
      () =>
        (sessions = Math.min(
          340,
          Math.max(280, sessions + Math.round((Math.random() - 0.5) * 8))
        )),
      () => {
        if (glitch > 0) {
          glitch--;
          integrity = 91 + Math.random() * 3;
        } else {
          if (Math.random() < 0.015) glitch = 3;
          integrity = 98.6 + Math.random() * 1.3;
        }
        return integrity;
      },
      () => {
        if (++tick % 18 === 0)
          payloads = Math.min(
            60,
            Math.max(40, payloads + (Math.random() < 0.5 ? -1 : 1))
          );
        return payloads;
      },
    ];
    const buf = CHANNELS.map((_, i) =>
      Array.from({ length: N }, () => next[i]())
    );

    let last = performance.now();
    function frame() {
      if (!ctx) return;
      const now = performance.now();
      while (now - last > 110) {
        last += 110;
        for (let i = 0; i < 3; i++) {
          buf[i].push(next[i]());
          buf[i].shift();
        }
      }
      ctx.clearRect(0, 0, W, H);
      const padX = 32;
      const rowH = H / 3;

      for (let i = 0; i < 3; i++) {
        const ch = CHANNELS[i];
        const top = i * rowH;
        if (i > 0) {
          ctx.strokeStyle = LINE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, top + 0.5);
          ctx.lineTo(W, top + 0.5);
          ctx.stroke();
        }

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.letterSpacing = "3px";
        ctx.font = `10px ${MONO}`;
        ctx.fillStyle = FAINT;
        ctx.fillText(ch.label, padX, top + 24);
        ctx.letterSpacing = "0px";

        const v = buf[i][N - 1];
        const text = i === 1 ? v.toFixed(1) : String(Math.round(v));
        ctx.textAlign = "right";
        ctx.font = `10px ${MONO}`;
        ctx.fillStyle = DIM;
        ctx.fillText(ch.unit, W - padX, top + 36);
        const uw = ctx.measureText(ch.unit).width;
        ctx.font = `600 26px ${MONO}`;
        ctx.fillStyle = INK;
        ctx.fillText(text, W - padX - uw - 10, top + 22);

        // trace
        const traceTop = top + rowH * 0.55;
        const traceBottom = top + rowH - 16;
        const span = traceBottom - traceTop;
        const stepX = (W - padX * 2) / (N - 1);
        ctx.strokeStyle = DIM;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j < N; j++) {
          const t = Math.min(1, Math.max(0, (buf[i][j] - ch.lo) / (ch.hi - ch.lo)));
          const y = traceBottom - t * span;
          const x = padX + j * stepX;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // leading sample marker
        const tl = Math.min(1, Math.max(0, (v - ch.lo) / (ch.hi - ch.lo)));
        ctx.fillStyle = INK;
        ctx.fillRect(W - padX - 1.5, traceBottom - tl * span - 1.5, 3, 3);
      }
    }
    const stop = startCanvasLoop(canvas, frame);
    return () => {
      stop();
      window.removeEventListener("resize", size);
    };
  }, [ref]);
}

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interceptRef = useRef<HTMLCanvasElement>(null);
  useStarfield(canvasRef);
  useIntercept(interceptRef);
  const [lines, setLines] = useState<number>(0);

  useEffect(() => {
    if (lines >= BOOT.length) return;
    const t = setTimeout(() => setLines((l) => l + 1), 360);
    return () => clearTimeout(t);
  }, [lines]);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <header className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          BLACKSITE
        </div>
        <div className={styles.topMeta}>
          <span>CLEARANCE // OMEGA</span>
          <span>BUILD 2.6.0-rc</span>
          <span>SECTOR 14</span>
        </div>
      </header>

      <main className={styles.hero}>
        <section className={styles.heroLeft}>
          <div className={styles.kicker}>intrusion operations console</div>
          <h1 className={styles.title}>
            SEE THE
            <br />
            NETWORK<span>.</span>
            <br />
            OWN THE <span>NODE.</span>
          </h1>

          <div className={styles.boot}>
            {BOOT.slice(0, lines).map((l, i) => {
              const [head, tail] = l.split(/(\bok\b|secure|\d+ hosts)$/);
              return (
                <span key={i} className={styles.bootLine}>
                  {head}
                  <span className={styles.ok}>{tail}</span>
                </span>
              );
            })}
            {lines < BOOT.length && <span className="cursor" />}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/dashboard" className={styles.cta}>
              ENTER CONSOLE
              <span className={styles.ctaArrow}>&rarr;</span>
            </Link>
            <Link href="/briefing" className={styles.cta} style={{ borderColor: "var(--line-bright)", color: "var(--ink-dim)" }}>
              MISSION BRIEF
              <span className={styles.ctaArrow}>&rarr;</span>
            </Link>
          </div>
        </section>

        <section className={styles.heroRight}>
          <div className={styles.interceptHead}>
            <span>LIVE INTERCEPT</span>
            <span>SIM FEED // FABRICATED</span>
          </div>
          <canvas
            ref={interceptRef}
            className={styles.intercept}
            role="img"
            aria-label="Live intercept readout: simulated telemetry traces for active sessions, circuit integrity, and payloads staged. Every figure is fabricated."
          />
        </section>
      </main>

      <footer className={styles.foot}>
        <span>A DATA-VIZ CONCEPT PIECE — EVERY FIGURE IS FABRICATED</span>
        <span>HAND-DRAWN ON CANVAS // NO REAL SYSTEMS</span>
      </footer>
    </div>
  );
}
