"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEF0123456789!@#$%&*<>/\\|=+-?";
const TARGETS = [
  "root:$6$x9f2.aQ::0:0:operator:/root:/bin/zsh",
  "vault_key = 7F3A-9C20-DE11-4488-AAB2-0091-FFC3",
  "BEGIN SESSION TOKEN eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "psk: correct-horse-battery-staple-14-omega",
  "exfil://ghost@10.0.9.5/backups/finance.tar.gz.enc",
  "AES-256-GCM key recovered :: integrity verified",
];

function rnd() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export default function Decrypt() {
  const [lines, setLines] = useState<string[]>(TARGETS.map(() => ""));
  const [pct, setPct] = useState(0);
  const progress = useRef<number[]>(TARGETS.map(() => 0));

  useEffect(() => {
    const t = setInterval(() => {
      const prog = progress.current;
      const out = TARGETS.map((target, i) => {
        // each line resolves left-to-right at a slight random pace
        if (prog[i] < target.length) {
          prog[i] += Math.random() < 0.55 ? 1 : 0;
        }
        const solved = Math.min(prog[i], target.length);
        let s = target.slice(0, solved);
        for (let k = solved; k < target.length; k++) {
          s += target[k] === " " ? " " : rnd();
        }
        return s;
      });
      setLines(out);
      const totalSolved = prog.reduce((a, b, i) => a + Math.min(b, TARGETS[i].length), 0);
      const totalLen = TARGETS.reduce((a, t) => a + t.length, 0);
      const p = Math.round((totalSolved / totalLen) * 100);
      setPct(p);
      if (p >= 100) {
        // hold a beat, then restart
        setTimeout(() => {
          progress.current = TARGETS.map(() => 0);
        }, 2200);
      }
    }, 55);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontSize: 13, lineHeight: 1.9 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
        }}
      >
        <span>brute-force // GPU rig · 4.2 GH/s</span>
        <span>{pct}% recovered</span>
      </div>
      <div
        style={{
          height: 4,
          background: "var(--line)",
          marginBottom: 22,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${pct}%`,
            background: "var(--ink)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {lines.map((l, i) => {
        const done = l === TARGETS[i];
        return (
          <div
            key={i}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              color: done ? "var(--ink)" : "var(--ink-dim)",
              marginBottom: 6,
            }}
          >
            <span style={{ color: "var(--ink-faint)", marginRight: 12 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            {l}
            {done && <span style={{ color: "var(--ink)" }}> ✓</span>}
          </div>
        );
      })}
    </div>
  );
}
