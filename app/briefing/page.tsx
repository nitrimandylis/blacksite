"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "../landing.module.css";
import { startCanvasLoop } from "../components/useCanvasLoop";

const BRIEF = [
  { label: "OPERATION", value: "GHOST-14" },
  { label: "CLASSIFICATION", value: "OMEGA // EYES ONLY" },
  { label: "OPERATOR", value: "GHOST" },
  { label: "TARGET ORG", value: "SECTOR-14 CORP" },
  { label: "OBJECTIVE", value: "FULL DOMAIN COMPROMISE + EXFIL" },
  { label: "ENTRY POINT", value: "14.221.9.40 (EDGE-FW-01)" },
  { label: "ROE", value: "NO DESTRUCTIVE OPS · LOW & SLOW" },
  { label: "TIME WINDOW", value: "72 HOURS" },
];

const SCENARIO = [
  "> sector-14 runs a hybrid network: on-prem AD, edge firewall, VPN gateway.",
  "> the perimeter was breached via CVE-2024-XXXX on the FortiGate.",
  "> two domain controllers and a jump-box have been compromised.",
  "> primary objective: backup vault (bak-vault) contains the crown jewels.",
  "> secondary: full domain ownership before the 72-hour window closes.",
  "> evasion is critical — detection resets the clock to zero.",
];

export default function BriefingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    function resize() { canvas!.width = window.innerWidth; canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const dots: { x: number; y: number; a: number }[] = [];
    for (let i = 0; i < 60; i++) dots.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, a: Math.random() });
    function frame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.a += 0.003;
        const alpha = 0.1 + Math.sin(d.a) * 0.08;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(d.x, d.y, 1.2, 1.2);
      }
    }
    const stop = startCanvasLoop(canvas, frame);
    return () => { stop(); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    if (lines >= SCENARIO.length) return;
    const t = setTimeout(() => setLines(l => l + 1), 500);
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
          <span>MISSION BRIEF</span>
          <span>OMEGA CLEARANCE</span>
        </div>
      </header>

      <main style={{
        position: "relative", zIndex: 3, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        flex: 1, padding: "40px 28px", maxWidth: 840, margin: "0 auto",
      }}>
        <div style={{
          width: "100%", border: "1px solid var(--line-bright)",
          background: "rgba(10,10,10,0.85)", padding: 32,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "var(--ink-faint)", marginBottom: 20,
          }}>ENGAGEMENT PARAMETERS</div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px",
            marginBottom: 28,
          }}>
            {BRIEF.map(b => (
              <div key={b.label}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 2 }}>
                  {b.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink)" }}>{b.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid var(--line)", paddingTop: 20,
            fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "var(--ink-faint)", marginBottom: 12,
          }}>SITUATION</div>

          <div style={{ fontSize: 12, lineHeight: 2.0, color: "var(--ink-dim)" }}>
            {SCENARIO.slice(0, lines).map((l, i) => (
              <div key={i}>{l}</div>
            ))}
            {lines < SCENARIO.length && <span className="cursor" />}
          </div>

          <Link href="/dashboard" style={{
            display: "inline-block", marginTop: 28, padding: "10px 24px",
            border: "1px solid var(--ink)", color: "var(--ink)",
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            textDecoration: "none",
          }}>
            BEGIN OPERATION &rarr;
          </Link>
        </div>
      </main>

      <footer className={styles.foot}>
        <span>A DATA-VIZ CONCEPT PIECE &mdash; EVERY FIGURE IS FABRICATED</span>
        <span>HAND-DRAWN ON CANVAS // NO REAL SYSTEMS</span>
      </footer>
    </div>
  );
}
