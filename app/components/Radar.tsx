"use client";

import { useEffect, useRef, useState } from "react";
import { startCanvasLoop, responsiveHeight } from "./useCanvasLoop";

type Blip = {
  ang: number;
  rad: number; // 0..1
  born: number;
  life: number;
  label: string;
  cls: string;
};

const NAMES = ["unk-host", "scanner", "honeypot?", "c2-peer", "implant", "sensor", "decoy", "relay"];
const CLASSES = ["HOSTILE", "NEUTRAL", "FRIEND", "UNKNOWN"];

export default function Radar({ height = 460 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h, setH] = useState(height);
  const [contacts, setContacts] = useState<{ label: string; cls: string; brg: number }[]>([]);

  useEffect(() => {
    const f = () => setH(responsiveHeight(height));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, [height]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    let W = c.clientWidth;
    let H = h;
    let sweep = 0;
    const blips: Blip[] = [];

    function size() {
      W = c!.clientWidth;
      H = h;
      c!.width = W * dpr;
      c!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    function spawn() {
      const ang = Math.random() * Math.PI * 2;
      const label = NAMES[Math.floor(Math.random() * NAMES.length)];
      const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
      blips.push({ ang, rad: 0.2 + Math.random() * 0.75, born: Date.now(), life: 4200, label, cls });
      setContacts((cs) =>
        [{ label, cls, brg: Math.round((ang * 180) / Math.PI) }, ...cs].slice(0, 6)
      );
    }
    const spawner = setInterval(spawn, 1100);
    spawn();

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) / 2 - 16;

      // range rings
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      // cross hairs + bearings
      for (let a = 0; a < 360; a += 30) {
        const rad = (a * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * R, cy + Math.sin(rad) * R);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.stroke();
        if (a % 90 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.font = "9px monospace";
          ctx.fillText(
            String(a).padStart(3, "0"),
            cx + Math.cos(rad) * (R + 4) - 8,
            cy + Math.sin(rad) * (R + 4) + 3
          );
        }
      }

      // sweep wedge with gradient trail
      sweep += 0.02;
      const span = 0.5;
      for (let i = 0; i < 18; i++) {
        const a = sweep - i * 0.03;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a, a + 0.03);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.06 * (1 - i / 18)})`;
        ctx.fill();
      }
      // leading sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // blips — brighten when sweep passes
      const now = Date.now();
      for (let i = blips.length - 1; i >= 0; i--) {
        const b = blips[i];
        const age = now - b.born;
        if (age > b.life) {
          blips.splice(i, 1);
          continue;
        }
        const bx = cx + Math.cos(b.ang) * b.rad * R;
        const by = cy + Math.sin(b.ang) * b.rad * R;
        const sweepDiff = Math.abs(((sweep - b.ang + Math.PI * 4) % (Math.PI * 2)));
        const fresh = sweepDiff < span ? 1 : Math.max(0.15, 1 - age / b.life);
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fresh})`;
        ctx.fill();
        if (fresh > 0.5) {
          ctx.strokeStyle = `rgba(255,255,255,${(fresh - 0.5) * 0.8})`;
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,255,255,${fresh})`;
          ctx.font = "8px monospace";
          ctx.fillText(b.label, bx + 8, by + 3);
        }
      }

      // center
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    const stop = startCanvasLoop(c, draw);
    window.addEventListener("resize", size);
    return () => {
      stop();
      clearInterval(spawner);
      window.removeEventListener("resize", size);
    };
  }, [h]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={ref} style={{ width: "100%", height: h, display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--ink-dim)",
          lineHeight: 1.8,
          pointerEvents: "none",
        }}
      >
        <div style={{ color: "var(--ink-faint)", marginBottom: 4 }}>CONTACTS</div>
        {contacts.map((c, i) => (
          <div key={i} style={{ opacity: 1 - i * 0.13 }}>
            {String(c.brg).padStart(3, "0")}° · {c.label} · {c.cls}
          </div>
        ))}
      </div>
    </div>
  );
}
