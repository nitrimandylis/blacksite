"use client";

import { useEffect, useRef, useState } from "react";
import { useSim } from "../sim/context";

const SCRIPT = [
  { delay: 0, host: null, msg: "OPERATION GHOST-14 INITIATED" },
  { delay: 4000, host: "sql-07", msg: "EXPLOITING SQL-07..." },
  { delay: 8000, host: "vpn-gw", msg: "EXPLOITING VPN-GW..." },
  { delay: 12000, host: "bak-vault", msg: "EXPLOITING BAK-VAULT..." },
  { delay: 16000, host: "mail-relay", msg: "EXPLOITING MAIL-RELAY..." },
  { delay: 20000, host: "nas-01", msg: "EXPLOITING NAS-01..." },
  { delay: 24000, host: "cam-net", msg: "EXPLOITING CAM-NET..." },
  { delay: 28000, host: "iot-hub", msg: "EXPLOITING IOT-HUB..." },
  { delay: 32000, host: null, msg: "ALL TARGETS OWNED — EXFIL STAGE" },
];

export default function ReplayBanner({ active, onStop }: { active: boolean; onStop: () => void }) {
  const { exploitHost } = useSim();
  const [msg, setMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!active) return;
    const total = SCRIPT[SCRIPT.length - 1].delay + 4000;

    for (const step of SCRIPT) {
      timers.current.push(setTimeout(() => {
        setMsg(step.msg);
        if (step.host) exploitHost(step.host);
      }, step.delay));
    }

    const prog = setInterval(() => {
      setProgress(p => {
        const next = p + 100 / (total / 200);
        if (next >= 100) { clearInterval(prog); setTimeout(onStop, 2000); return 100; }
        return next;
      });
    }, 200);

    timers.current.push(setTimeout(onStop, total));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      clearInterval(prog);
    };
  }, [active, exploitHost, onStop]);

  if (!active) return null;

  return (
    <div className="replay-banner" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "var(--bg-panel)", borderBottom: "1px solid var(--line-bright)",
      padding: "10px 28px", display: "flex", alignItems: "center", gap: 16,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: "var(--ink)",
        animation: "blink 1s step-end infinite", flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", flex: 1 }}>
        REPLAY // {msg}
      </span>
      <div style={{ width: 200, height: 4, background: "var(--line)", position: "relative" }}>
        <span style={{
          position: "absolute", inset: 0, transformOrigin: "left",
          transform: `scaleX(${progress / 100})`,
          background: "var(--ink)", transition: "transform 0.2s",
        }} />
      </div>
      <button onClick={onStop} style={{
        background: "none", border: "1px solid var(--line-bright)", color: "var(--ink-dim)",
        fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", padding: "4px 10px",
        cursor: "pointer", textTransform: "uppercase",
      }}>STOP</button>
    </div>
  );
}
