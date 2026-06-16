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

export default function Landing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useStarfield(canvasRef);
  const [lines, setLines] = useState<number>(0);

  useEffect(() => {
    if (lines >= BOOT.length) return;
    const t = setTimeout(() => setLines((l) => l + 1), 360);
    return () => clearTimeout(t);
  }, [lines]);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />

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

          <Link href="/dashboard" className={styles.cta}>
            ENTER CONSOLE
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </section>

        <section className={styles.heroRight}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>active sessions</div>
            <div className={styles.statValue}>
              312<small>nodes</small>
            </div>
            <div className={styles.statBar}>
              <span className={styles.statBarFill} style={{ width: "72%" }} />
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>circuit integrity</div>
            <div className={styles.statValue}>
              99.4<small>%</small>
            </div>
            <div className={styles.statBar}>
              <span className={styles.statBarFill} style={{ width: "99%" }} />
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>payloads staged</div>
            <div className={styles.statValue}>
              47<small>queued</small>
            </div>
            <div className={styles.statBar}>
              <span className={styles.statBarFill} style={{ width: "38%" }} />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.foot}>
        <span>A DATA-VIZ CONCEPT PIECE — EVERY FIGURE IS FABRICATED</span>
        <span>HAND-DRAWN ON CANVAS // NO REAL SYSTEMS</span>
      </footer>
    </div>
  );
}
