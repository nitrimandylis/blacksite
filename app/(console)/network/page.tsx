"use client";

import { useState } from "react";
import Link from "next/link";
import NodeGraph from "../../components/NodeGraph";
import HostDetail from "../../components/HostDetail";
import { useSim, type Host } from "../../sim/context";
import s from "../console.module.css";

export default function NetworkPage() {
  const { hosts } = useSim();
  const [detail, setDetail] = useState<Host | null>(null);

  const statusMap: Record<string, string> = {};
  for (const h of hosts) {
    statusMap[h.id] = h.status === "OWNED" ? "owned" : h.status === "QUEUED" ? "host" : "target";
  }

  function onNodeSelect(label: string | null) {
    if (!label) { setDetail(null); return; }
    const h = hosts.find(x => x.id === label || x.name === label);
    setDetail(h || null);
  }

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Network Graph</h1>
          <p className={s.pageDesc}>
            Live force-directed map of discovered hosts and active pivots.
            Packets flow along compromised routes. Click nodes to inspect.
          </p>
        </div>
        <div className={s.pageTag}>{hosts.length} NODES // {hosts.filter(h => h.status === "OWNED").length} OWNED</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0, position: "relative", overflow: "hidden" }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Topology // sector-14</span>
            <span className={s.panelMeta}>force-directed</span>
          </div>
          <div style={{ padding: 8 }}>
            <NodeGraph height={520} statusMap={statusMap} onSelect={onNodeSelect} />
          </div>
          <div className={s.legend} style={{ padding: "0 16px 16px" }}>
            <span className={s.legendItem}>
              <span className={s.legendSwatch} style={{ background: "#fff" }} />
              c2 core
            </span>
            <span className={s.legendItem}>
              <span className={s.legendSwatch} style={{ background: "#e0e0e0" }} />
              owned
            </span>
            <span className={s.legendItem}>
              <span className={s.legendSwatch} style={{ background: "#0a0a0a" }} />
              target
            </span>
            <span className={s.legendItem}>
              <span className={s.legendSwatch} style={{ background: "#1a1a1a" }} />
              host
            </span>
          </div>
          {detail && <HostDetail host={detail} onClose={() => setDetail(null)} />}
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Host Registry</span>
            <span className={s.panelMeta}>nmap -sV</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {hosts.map((h, i) => (
                <li key={h.id} className={s.listRow} style={{ cursor: "pointer" }} onClick={() => setDetail(h)}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{h.name}</span>
                    <br />
                    <span className={s.listSub}>
                      {h.ip} &middot; {h.os}
                    </span>
                  </span>
                  <span className={`${s.tag} ${h.status === "OWNED" ? s.tagHot : ""}`}>
                    {h.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
