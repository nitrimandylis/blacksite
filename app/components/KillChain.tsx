"use client";

import { useEffect, useState } from "react";
import c from "./KillChain.module.css";

const STAGES = [
  { name: "Reconnaissance", desc: "passive osint · subdomain enum · port sweep" },
  { name: "Weaponization", desc: "payload crafted · loader packed · evasion baked" },
  { name: "Delivery", desc: "spear-phish dispatched · watering-hole armed" },
  { name: "Exploitation", desc: "CVE-2024-XXXX triggered · code exec gained" },
  { name: "Installation", desc: "implant persisted · scheduled task planted" },
  { name: "Command & Control", desc: "beacon online · 41ms · 7-hop onion" },
  { name: "Actions / Exfil", desc: "domain owned · 8.4GB staged for pull" },
];

export default function KillChain({ phase = 0 }: { phase?: number }) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    setFill(0);
    const t = setInterval(() => {
      setFill(f => f >= 92 ? 92 : f + 0.4);
    }, 60);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className={c.chain}>
      {STAGES.map((s, i) => {
        const state = i < phase ? c.done : i === phase ? c.active : "";
        const pct = i < phase ? 100 : i === phase ? Math.round(fill) : 0;
        return (
          <div key={s.name} className={`${c.stage} ${state}`}>
            <div className={c.rail}>
              <span className={c.connector} />
              <span className={c.node} />
            </div>
            <div>
              <div className={c.idx}>STAGE {String(i + 1).padStart(2, "0")}</div>
              <div className={c.name}>{s.name}</div>
              <div className={c.desc}>{s.desc}</div>
              {i === phase && (
                <div className={c.bar}>
                  <span className={c.barFill} style={{ transform: `scaleX(${pct / 100})` }} />
                </div>
              )}
            </div>
            <div className={c.status}>
              {i < phase ? "complete" : i === phase ? "running" : "pending"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
