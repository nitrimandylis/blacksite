"use client";

import Link from "next/link";
import Sparkline from "../../components/Sparkline";
import { useSim } from "../../sim/context";
import s from "../console.module.css";

export default function Dashboard() {
  const { hosts, events, dataExfil } = useSim();
  const owned = hosts.filter(h => h.status === "OWNED").length;

  const stats = [
    { label: "live hosts", value: String(hosts.length), unit: "online", delta: `${hosts.filter(h => h.status !== "QUEUED").length} active`, seed: 7 },
    { label: "open shells", value: String(owned), unit: "sessions", delta: owned > 3 ? `+${owned - 3} / session` : "stable", seed: 31 },
    { label: "data exfil", value: dataExfil.toFixed(1), unit: "GB", delta: "+0.1 / tick", seed: 91 },
    { label: "evasion score", value: owned <= 4 ? "A+" : owned <= 7 ? "A" : "B+", unit: "stealth", delta: owned <= 4 ? "stable" : "degrading", seed: 53 },
  ];

  const feed = events.slice(0, 6);

  const targets = [...hosts]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Operations Overview</h1>
          <p className={s.pageDesc}>
            Real-time posture across the engagement. All figures simulated for
            demonstration.
          </p>
        </div>
        <div className={s.pageTag}>SESSION // GHOST-14</div>
      </div>

      <div className={`${s.grid} ${s.cols4}`} style={{ marginBottom: 18 }}>
        {stats.map((st) => (
          <div key={st.label} className={`${s.card} ticks`}>
            <div className={s.statLabel}>{st.label}</div>
            <div className={s.statBig}>
              {st.value}
              <small>{st.unit}</small>
            </div>
            <div className={s.statDelta}>{st.delta}</div>
            <div className={s.spark}>
              <Sparkline seed={st.seed} />
            </div>
          </div>
        ))}
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Live Event Feed</span>
            <span className={s.panelMeta}>tail -f /var/ops.log</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {feed.map((f, i) => (
                <li key={f.id} className={s.listRow}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{f.text}</span>
                    <br />
                    <span className={s.listSub}>{f.sub}</span>
                  </span>
                  <span className={`${s.tag} ${f.hot ? s.tagHot : ""}`}>
                    {f.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Target Progress</span>
            <span className={s.panelMeta}>{hosts.length} tracked</span>
          </div>
          <div className={s.panelBody}>
            {targets.map((tg) => (
              <div key={tg.id} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                  }}
                >
                  <span>{tg.name.toUpperCase()}</span>
                  <span style={{ color: "var(--ink-dim)" }}>{tg.status}</span>
                </div>
                <div className={s.bar}>
                  <span className={s.barFill} style={{ width: `${tg.pct}%` }} />
                </div>
              </div>
            ))}
            <Link href="/network" className={s.pageTag} style={{ display: "inline-block", marginTop: 8 }}>
              OPEN NET GRAPH &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
