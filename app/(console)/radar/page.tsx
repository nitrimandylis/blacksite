import Radar from "../../components/Radar";
import s from "../console.module.css";

const TRACKS = [
  { name: "scanner-7", note: "repeated TCP SYN · bearing 042", tag: "HOSTILE", hot: true },
  { name: "honeypot?", note: "too-open ports · likely trap", tag: "AVOID", hot: true },
  { name: "c2-peer", note: "friendly implant check-in", tag: "FRIEND", hot: false },
  { name: "sensor-3", note: "passive · classification pending", tag: "UNKNOWN", hot: false },
];

export default function RadarPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Threat Radar</h1>
          <p className={s.pageDesc}>
            360° sweep of the local segment. Contacts brighten as the beam
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
            <span className={s.panelMeta}>classified</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {TRACKS.map((tk, i) => (
                <li key={tk.name} className={s.listRow}>
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
