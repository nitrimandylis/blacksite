"use client";

import { useEffect, useRef } from "react";
import { startCanvasLoop } from "./useCanvasLoop";

export default function Gauge({
  value = 0.7,
  label = "load",
  size = 150,
}: {
  value?: number;
  label?: string;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let cur = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 14;
      const start = Math.PI * 0.75;
      const end = Math.PI * 2.25;
      cur += (value - cur) * 0.06;

      // track
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // value arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + (end - start) * cur);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.stroke();

      // ticks
      for (let i = 0; i <= 10; i++) {
        const a = start + ((end - start) / 10) * i;
        const x1 = cx + Math.cos(a) * (r - 12);
        const y1 = cy + Math.sin(a) * (r - 12);
        const x2 = cx + Math.cos(a) * (r - 8);
        const y2 = cy + Math.sin(a) * (r - 8);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.fillStyle = "#ededed";
      ctx.font = "600 26px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(cur * 100)}`, cx, cy + 4);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "9px monospace";
      ctx.fillText(label.toUpperCase(), cx, cy + 22);
      ctx.textAlign = "left";
    }
    return startCanvasLoop(c, draw);
  }, [value, label, size]);

  return <canvas ref={ref} style={{ width: size, height: size }} />;
}
