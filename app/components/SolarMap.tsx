"use client";

import { useEffect, useRef, useState } from "react";
import { startCanvasLoop, responsiveHeight } from "./useCanvasLoop";

type Planet = {
  label: string;
  orbit: number;
  size: number;
  speed: number;
  phase: number;
  status: string;
  moons: number;
};

const PLANETS: Planet[] = [
  { label: "edge-fw", orbit: 70, size: 4, speed: 0.9, phase: 0, status: "OWNED", moons: 0 },
  { label: "dc-cluster", orbit: 115, size: 7, speed: 0.55, phase: 1.2, status: "OWNED", moons: 2 },
  { label: "sql-vault", orbit: 165, size: 5, speed: 0.38, phase: 2.4, status: "ENUM", moons: 1 },
  { label: "vpn-edge", orbit: 210, size: 6, speed: 0.27, phase: 4.1, status: "PROBE", moons: 0 },
  { label: "bak-grid", orbit: 260, size: 9, speed: 0.18, phase: 5.5, status: "TARGET", moons: 3 },
  { label: "iot-belt", orbit: 305, size: 3, speed: 0.12, phase: 0.7, status: "RECON", moons: 0 },
];

export default function SolarMap({ height = 560 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [sel, setSel] = useState<Planet | null>(null);
  const posRef = useRef<{ x: number; y: number; p: Planet }[]>([]);
  const [h, setH] = useState(height);

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
    let hover = -1;

    function size() {
      W = c!.clientWidth;
      H = h;
      c!.width = W * dpr;
      c!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const time = Date.now() / 1000;

      // orbit rings
      for (const p of PLANETS) {
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbit, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // core sun (c2)
      const pulse = 14 + Math.sin(time * 2) * 1.5;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, "rgba(255,255,255,0.5)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("C2-CORE", cx, cy + 30);
      ctx.textAlign = "left";

      const positions: { x: number; y: number; p: Planet }[] = [];

      PLANETS.forEach((p, i) => {
        const ang = p.phase + time * p.speed;
        const x = cx + Math.cos(ang) * p.orbit;
        const y = cy + Math.sin(ang) * p.orbit;
        positions.push({ x, y, p });
        const isHov = hover === i;

        // trailing arc
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbit, ang - 0.5, ang);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // planet
        ctx.beginPath();
        ctx.arc(x, y, p.size + (isHov ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle =
          p.status === "OWNED" ? "#ffffff" : "#0c0c0c";
        ctx.fill();
        ctx.strokeStyle = isHov ? "#ffffff" : "rgba(255,255,255,0.6)";
        ctx.lineWidth = isHov ? 1.6 : 1;
        ctx.stroke();

        // moons
        for (let m = 0; m < p.moons; m++) {
          const ma = ang * 3 + (m / p.moons) * Math.PI * 2;
          const mr = p.size + 8 + m * 4;
          const mx = x + Math.cos(ma) * mr;
          const my = y + Math.sin(ma) * mr;
          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fill();
        }

        // label
        ctx.fillStyle = isHov ? "#fff" : "rgba(255,255,255,0.5)";
        ctx.font = "10px monospace";
        ctx.fillText(p.label, x + p.size + 6, y + 3);
      });
      posRef.current = positions;
    }

    function onMove(e: MouseEvent) {
      const rect = c!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      hover = -1;
      posRef.current.forEach((pos, i) => {
        if ((mx - pos.x) ** 2 + (my - pos.y) ** 2 < (pos.p.size + 8) ** 2)
          hover = i;
      });
      c!.style.cursor = hover >= 0 ? "pointer" : "default";
    }
    function onClick() {
      setSel(hover >= 0 ? PLANETS[hover] : null);
    }
    c.addEventListener("mousemove", onMove);
    c.addEventListener("click", onClick);
    window.addEventListener("resize", size);
    const stop = startCanvasLoop(c, draw);
    return () => {
      stop();
      c.removeEventListener("mousemove", onMove);
      c.removeEventListener("click", onClick);
      window.removeEventListener("resize", size);
    };
  }, [h]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={ref} style={{ width: "100%", height: h, display: "block" }} />
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          minWidth: 160,
          padding: "10px 12px",
          border: "1px solid var(--line-bright)",
          background: "rgba(10,10,10,0.85)",
          fontSize: 10,
          letterSpacing: "0.12em",
        }}
      >
        <div style={{ color: "var(--ink-faint)", marginBottom: 6 }}>
          INSPECTOR
        </div>
        {sel ? (
          <>
            <div style={{ fontSize: 13, marginBottom: 4 }}>{sel.label}</div>
            <div style={{ color: "var(--ink-dim)" }}>STATUS // {sel.status}</div>
            <div style={{ color: "var(--ink-dim)" }}>
              SATELLITES // {sel.moons}
            </div>
            <div style={{ color: "var(--ink-dim)" }}>
              ORBIT // {sel.orbit}au
            </div>
          </>
        ) : (
          <div style={{ color: "var(--ink-dim)" }}>select a body</div>
        )}
      </div>
    </div>
  );
}
