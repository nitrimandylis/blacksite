"use client";

import { useEffect, useRef, useState } from "react";
import { startCanvasLoop, responsiveHeight } from "./useCanvasLoop";

type Kind = "core" | "host" | "owned" | "target";
type Node = {
  id: string;
  label: string;
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};
type Edge = { a: number; b: number };

const KIND_R: Record<Kind, number> = { core: 12, owned: 8, target: 9, host: 5 };

const LABELS: [string, Kind][] = [
  ["c2-core", "core"],
  ["edge-fw-01", "owned"],
  ["win-dc-02", "owned"],
  ["jump-box", "owned"],
  ["sql-07", "target"],
  ["vpn-gw", "target"],
  ["bak-vault", "target"],
  ["mail-relay", "host"],
  ["ws-114", "host"],
  ["ws-119", "host"],
  ["nas-01", "host"],
  ["cam-net", "host"],
  ["badge-ctl", "host"],
  ["dev-srv", "host"],
  ["printer-3", "host"],
  ["iot-hub", "host"],
  ["ws-203", "host"],
  ["ws-208", "host"],
];

const EDGE_PAIRS: [number, number][] = [
  [0, 1], [0, 3], [1, 2], [1, 7], [2, 3], [2, 4], [3, 5], [3, 13],
  [2, 8], [2, 9], [4, 10], [4, 11], [13, 14], [13, 16], [16, 17],
  [5, 6], [7, 8], [9, 10], [11, 12], [1, 15], [3, 14], [0, 2],
];

function buildGraph(w: number, h: number) {
  const nodes: Node[] = LABELS.map(([label, kind], i) => {
    const ang = (i / LABELS.length) * Math.PI * 2;
    const rad = kind === "core" ? 0 : 120 + (i % 5) * 30;
    return {
      id: `n${i}`,
      label,
      kind,
      x: w / 2 + Math.cos(ang) * rad,
      y: h / 2 + Math.sin(ang) * rad,
      vx: 0,
      vy: 0,
      r: KIND_R[kind],
    };
  });
  const edges: Edge[] = EDGE_PAIRS.map(([a, b]) => ({ a, b }));
  return { nodes, edges };
}

export default function NodeGraph({ height = 520 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selRef = useRef<number | null>(null);
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
    const { nodes, edges } = buildGraph(W, H);
    let hover: number | null = null;

    function size() {
      W = c!.clientWidth;
      H = h;
      c!.width = W * dpr;
      c!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    function tick() {
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy || 0.01;
          const d = Math.sqrt(d2);
          const f = 1400 / d2;
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      // springs
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - 90) * 0.008;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
      // gravity to center + integrate
      for (const n of nodes) {
        n.vx += (W / 2 - n.x) * 0.0015;
        n.vy += (H / 2 - n.y) * 0.0015;
        n.vx *= 0.86;
        n.vy *= 0.86;
        if (n.kind !== "core") {
          n.x += n.vx;
          n.y += n.vy;
        }
        n.x = Math.max(n.r + 4, Math.min(W - n.r - 4, n.x));
        n.y = Math.max(n.r + 4, Math.min(H - n.r - 4, n.y));
      }
      nodes[0].x = W / 2;
      nodes[0].y = H / 2;
    }

    function draw() {
      if (!ctx) return;
      tick();
      ctx.clearRect(0, 0, W, H);

      // edges
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const active =
          selRef.current === e.a || selRef.current === e.b;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = active
          ? "rgba(255,255,255,0.6)"
          : "rgba(255,255,255,0.12)";
        ctx.lineWidth = active ? 1.2 : 0.6;
        ctx.stroke();

        // traveling packet
        const t = (Date.now() / 1400 + e.a * 0.1) % 1;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        ctx.fillStyle = active
          ? "rgba(255,255,255,0.9)"
          : "rgba(255,255,255,0.25)";
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }

      // nodes
      nodes.forEach((n, i) => {
        const isSel = selRef.current === i;
        const isHov = hover === i;
        // outer ring for owned/target/core
        if (n.kind !== "host") {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        if (n.kind === "core") ctx.fillStyle = "#ffffff";
        else if (n.kind === "owned") ctx.fillStyle = "#e0e0e0";
        else if (n.kind === "target") ctx.fillStyle = "#0a0a0a";
        else ctx.fillStyle = "#1a1a1a";
        ctx.fill();
        ctx.strokeStyle =
          isSel || isHov ? "#ffffff" : "rgba(255,255,255,0.5)";
        ctx.lineWidth = isSel || isHov ? 1.6 : 0.8;
        ctx.stroke();

        if (isSel || isHov || n.kind !== "host") {
          ctx.fillStyle = isSel || isHov ? "#ffffff" : "rgba(255,255,255,0.55)";
          ctx.font = "10px monospace";
          ctx.fillText(n.label, n.x + n.r + 6, n.y + 3);
        }
      });
    }

    function pick(mx: number, my: number) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if ((mx - n.x) ** 2 + (my - n.y) ** 2 < (n.r + 6) ** 2) return i;
      }
      return null;
    }
    function onMove(e: MouseEvent) {
      const rect = c!.getBoundingClientRect();
      hover = pick(e.clientX - rect.left, e.clientY - rect.top);
      c!.style.cursor = hover !== null ? "pointer" : "default";
    }
    function onClick(e: MouseEvent) {
      const rect = c!.getBoundingClientRect();
      const i = pick(e.clientX - rect.left, e.clientY - rect.top);
      selRef.current = i;
      setSelected(i !== null ? nodes[i].label : null);
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
          bottom: 12,
          left: 12,
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "var(--ink-dim)",
          textTransform: "uppercase",
        }}
      >
        {selected ? `SELECTED // ${selected}` : "click a node to inspect"}
      </div>
    </div>
  );
}
