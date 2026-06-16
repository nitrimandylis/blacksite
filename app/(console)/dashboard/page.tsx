import Link from "next/link";
import Sparkline from "../../components/Sparkline";
import s from "../console.module.css";

const STATS = [
  { label: "live hosts", value: "312", unit: "online", delta: "+18 / 24h", seed: 7 },
  { label: "open shells", value: "47", unit: "sessions", delta: "+3 / 1h", seed: 31 },
  { label: "data exfil", value: "8.4", unit: "GB", delta: "+1.2 / 1h", seed: 91 },
  { label: "evasion score", value: "A+", unit: "stealth", delta: "stable", seed: 53 },
];

const FEED = [
  { t: "shell opened", sub: "14.221.9.40 :: root@edge-fw", tag: "OWNED", hot: true },
  { t: "cred dump", sub: "ad.corp.local :: 1,204 hashes", tag: "LOOT", hot: true },
  { t: "port scan", sub: "10.0.0.0/16 :: 65535 ports", tag: "RECON", hot: false },
  { t: "lateral move", sub: "win-dc-02 → win-sql-07", tag: "PIVOT", hot: false },
  { t: "beacon check-in", sub: "implant 0xAE :: 41ms", tag: "C2", hot: false },
  { t: "payload staged", sub: "loader.bin :: 244kb", tag: "ARM", hot: false },
];

const TARGETS = [
  { name: "EDGE-FW-01", pct: 100, status: "OWNED" },
  { name: "WIN-DC-02", pct: 86, status: "ELEVATING" },
  { name: "SQL-CLUSTER", pct: 54, status: "ENUM" },
  { name: "VPN-GATEWAY", pct: 32, status: "PROBE" },
  { name: "MAIL-RELAY", pct: 12, status: "QUEUED" },
];

export default function Dashboard() {
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
        {STATS.map((st) => (
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
              {FEED.map((f, i) => (
                <li key={i} className={s.listRow}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{f.t}</span>
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
            <span className={s.panelMeta}>5 active</span>
          </div>
          <div className={s.panelBody}>
            {TARGETS.map((tg) => (
              <div key={tg.name} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                  }}
                >
                  <span>{tg.name}</span>
                  <span style={{ color: "var(--ink-dim)" }}>{tg.status}</span>
                </div>
                <div className={s.bar}>
                  <span className={s.barFill} style={{ width: `${tg.pct}%` }} />
                </div>
              </div>
            ))}
            <Link href="/network" className={s.pageTag} style={{ display: "inline-block", marginTop: 8 }}>
              OPEN NET GRAPH →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
