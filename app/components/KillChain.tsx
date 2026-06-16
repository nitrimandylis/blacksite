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

export default function KillChain() {
  // progress in [0, STAGES.length]; fractional part = active stage fill
  const [p, setP] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setP((v) => {
        const nv = v + 0.012;
        return nv >= STAGES.length + 1 ? 0 : nv;
      });
    }, 60);
    return () => clearInterval(t);
  }, []);

  const activeIdx = Math.floor(p);
  const frac = p - activeIdx;

  return (
    <div className={c.chain}>
      {STAGES.map((s, i) => {
        const state =
          i < activeIdx ? c.done : i === activeIdx ? c.active : "";
        const fill = i < activeIdx ? 100 : i === activeIdx ? Math.round(frac * 100) : 0;
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
              {i === activeIdx && (
                <div className={c.bar}>
                  <span className={c.barFill} style={{ width: `${fill}%` }} />
                </div>
              )}
            </div>
            <div className={c.status}>
              {i < activeIdx ? "complete" : i === activeIdx ? "running" : "pending"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
