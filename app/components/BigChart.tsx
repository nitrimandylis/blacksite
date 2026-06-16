"use client";

import { useEffect, useRef } from "react";
import { startCanvasLoop } from "./useCanvasLoop";

export default function BigChart({
  seed = 3,
  height = 240,
  bars = false,
}: {
  seed?: number;
  height?: number;
  bars?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const N = bars ? 28 : 60;
    const data = Array.from({ length: N }, () => rand() * 0.7 + 0.15);
    let t = 0;

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth;
      const h = height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      t += 0.015;

      const padL = 36;
      const padB = 22;
      const padT = 12;
      const gw = w - padL - 8;
      const gh = h - padB - padT;

      // grid + axis labels
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "9px monospace";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padT + (gh / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(w - 8, y);
        ctx.stroke();
        ctx.fillText(`${100 - i * 25}`, 6, y + 3);
      }

      if (bars) {
        const bw = (gw / N) * 0.6;
        data.forEach((d, i) => {
          const v = Math.min(1, Math.max(0.05, d + Math.sin(t + i * 0.5) * 0.1));
          const x = padL + (gw / N) * i + (gw / N - bw) / 2;
          const bh = v * gh;
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(x, padT + gh - bh, bw, bh);
        });
      } else {
        // area line
        ctx.beginPath();
        data.forEach((d, i) => {
          const v = Math.min(1, Math.max(0, d + Math.sin(t + i * 0.3) * 0.08));
          const x = padL + (gw / (N - 1)) * i;
          const y = padT + (1 - v) * gh;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        const stroke = ctx.getLineDash();
        ctx.setLineDash(stroke);
        ctx.strokeStyle = "#ededed";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.lineTo(padL + gw, padT + gh);
        ctx.lineTo(padL, padT + gh);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, padT, 0, padT + gh);
        g.addColorStop(0, "rgba(255,255,255,0.16)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }
    }
    return startCanvasLoop(c, draw);
  }, [seed, height, bars]);

  return <canvas ref={ref} style={{ width: "100%", height }} />;
}
