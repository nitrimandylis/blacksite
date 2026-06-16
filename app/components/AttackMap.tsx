"use client";

import { useEffect, useRef, useState } from "react";
import { startCanvasLoop, responsiveHeight } from "./useCanvasLoop";

// Coarse land mask — read as continents, plotted as a dot grid.
const LAND = [
  "...........................................................",
  ".....####............#######........######.................",
  "...########........###########....#########....##..........",
  "..##########......#############...###########.######.......",
  "...#########.....##############..##############..###.......",
  ".....#######......############....##############...........",
  ".......####........##########......###########.............",
  "........###.........########.........########..............",
  ".........##..........######...........#####................",
  "..........#...........####....##.......###.................",
  ".........##............###...####......##..................",
  ".........###...........##....####..........................",
  ".........####..........##.....##.........##................",
  "..........###..........###.............####................",
  "..........###..........####.............##.................",
  "...........##...........###................................",
  "...........##...........##.................##..............",
  "............#............#................####.............",
  "..........................................##...............",
];

// Normalized "nodes" placed over the map (x,y in 0..1) with labels.
const NODES = [
  { x: 0.16, y: 0.28, label: "us-east" },
  { x: 0.46, y: 0.22, label: "ldn" },
  { x: 0.58, y: 0.2, label: "msk" },
  { x: 0.78, y: 0.28, label: "tok" },
  { x: 0.5, y: 0.55, label: "lag" },
  { x: 0.24, y: 0.7, label: "sao" },
  { x: 0.82, y: 0.74, label: "syd" },
  { x: 0.66, y: 0.4, label: "sgp" },
];

const STRIKE_LABELS = [
  "SYN flood",
  "cred stuff",
  "0day probe",
  "dns hijack",
  "beacon",
  "exfil",
  "brute ssh",
  "ransomware",
];

type Arc = { a: number; b: number; t: number; speed: number; label: string };

export default function AttackMap({ height = 460 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h, setH] = useState(height);
  const [ticker, setTicker] = useState<string[]>([]);

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
    const arcs: Arc[] = [];

    function size() {
      W = c!.clientWidth;
      H = h;
      c!.width = W * dpr;
      c!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    const cols = LAND[0].length;
    const rows = LAND.length;

    function spawn() {
      let a = Math.floor(Math.random() * NODES.length);
      let b = Math.floor(Math.random() * NODES.length);
      if (a === b) b = (b + 1) % NODES.length;
      const label = STRIKE_LABELS[Math.floor(Math.random() * STRIKE_LABELS.length)];
      arcs.push({ a, b, t: 0, speed: 0.004 + Math.random() * 0.006, label });
      const line = `${NODES[a].label.toUpperCase()} → ${NODES[b].label.toUpperCase()}  ${label}`;
      setTicker((tk) => [line, ...tk].slice(0, 8));
    }
    const spawner = setInterval(spawn, 900);
    spawn();

    function mapXY(n: { x: number; y: number }) {
      const padX = W * 0.04;
      const padY = H * 0.08;
      return {
        x: padX + n.x * (W - padX * 2),
        y: padY + n.y * (H - padY * 2),
      };
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const padX = W * 0.04;
      const padY = H * 0.08;
      const gw = W - padX * 2;
      const gh = H - padY * 2;

      // land dots
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          if (LAND[r][col] !== "#") continue;
          const x = padX + (col / (cols - 1)) * gw;
          const y = padY + (r / (rows - 1)) * gh;
          ctx.fillStyle = "rgba(255,255,255,0.16)";
          ctx.fillRect(x, y, 1.6, 1.6);
        }
      }

      // arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += arc.speed;
        if (arc.t > 1.4) {
          arcs.splice(i, 1);
          continue;
        }
        const A = mapXY(NODES[arc.a]);
        const B = mapXY(NODES[arc.b]);
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2 - Math.hypot(B.x - A.x, B.y - A.y) * 0.3;

        // full faint path
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo(mx, my, B.x, B.y);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // animated head (draw partial up to t)
        const tt = Math.min(1, arc.t);
        ctx.beginPath();
        const steps = 24;
        for (let s = 0; s <= steps; s++) {
          const u = (s / steps) * tt;
          const x =
            (1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * mx + u * u * B.x;
          const y =
            (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * my + u * u * B.y;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // impact ring at B once arrived
        if (arc.t > 1) {
          const rr = (arc.t - 1) * 30;
          ctx.beginPath();
          ctx.arc(B.x, B.y, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.5 - (arc.t - 1))})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // nodes
      const time = Date.now() / 600;
      NODES.forEach((n) => {
        const p = mapXY(n);
        const pulse = 2 + (Math.sin(time + n.x * 8) + 1) * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse + 3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "9px monospace";
        ctx.fillText(n.label, p.x + 6, p.y - 4);
      });
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
          bottom: 10,
          right: 12,
          width: 230,
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--ink-dim)",
          textAlign: "right",
          lineHeight: 1.7,
          pointerEvents: "none",
        }}
      >
        {ticker.map((l, i) => (
          <div key={i} style={{ opacity: 1 - i * 0.11 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
