"use client";

import { useEffect, useRef } from "react";
import { startCanvasLoop } from "./useCanvasLoop";

export default function Sparkline({
  seed = 1,
  points = 40,
  height = 40,
  fill = true,
}: {
  seed?: number;
  points?: number;
  height?: number;
  fill?: boolean;
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
    const data = Array.from({ length: points }, () => rand());
    let t = 0;

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth;
      const h = height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // shift data slowly for a live feel
      t += 0.02;
      const pad = 2;
      const step = (w - pad * 2) / (points - 1);

      ctx.beginPath();
      data.forEach((d, i) => {
        const wobble = Math.sin(t + i * 0.4) * 0.06;
        const v = Math.min(1, Math.max(0, d + wobble));
        const x = pad + i * step;
        const y = pad + (1 - v) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#ededed";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (fill) {
        ctx.lineTo(w - pad, h);
        ctx.lineTo(pad, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(255,255,255,0.14)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fill();
      }
    }
    return startCanvasLoop(c, draw);
  }, [seed, points, height, fill]);

  return <canvas ref={ref} style={{ width: "100%", height }} />;
}
