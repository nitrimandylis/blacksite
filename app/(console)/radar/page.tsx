"use client";

import Radar from "../../components/Radar";
import { useSim } from "../../sim/context";
import s from "../console.module.css";

export default function RadarPage() {
  const { events } = useSim();
  const recentContacts = events
    .filter(e => ["RECON", "ENUM", "C2", "STEALTH"].includes(e.tag))
    .slice(0, 4)
    .map(e => ({
      name: e.sub.split("::")[0]?.trim() || "unknown",
      note: e.text,
      tag: e.tag === "C2" ? "FRIEND" : e.tag === "RECON" ? "HOSTILE" : "UNKNOWN",
      hot: e.tag === "RECON",
    }));

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Threat Radar</h1>
          <p className={s.pageDesc}>
            360&deg; sweep of the local segment. Contacts brighten as the beam
            passes and fade with age. Bearing in degrees, range by ring.
          </p>
        </div>
        <div className={s.pageTag}>SWEEP // 0.4 Hz</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>PPI Scope</span>
            <span className={s.panelMeta}>plan position indicator</span>
          </div>
          <div style={{ padding: 8 }}>
            <Radar height={480} />
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Track Log</span>
            <span className={s.panelMeta}>from event feed</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {recentContacts.map((tk, i) => (
                <li key={i} className={s.listRow}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{tk.name}</span>
                    <br />
                    <span className={s.listSub}>{tk.note}</span>
                  </span>
                  <span className={`${s.tag} ${tk.hot ? s.tagHot : ""}`}>
                    {tk.tag}
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
