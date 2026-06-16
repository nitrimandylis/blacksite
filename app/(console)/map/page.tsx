import AttackMap from "../../components/AttackMap";
import s from "../console.module.css";

const ORIGINS = [
  { name: "us-east", note: "primary egress · 142 strikes/h", tag: "ACTIVE", hot: true },
  { name: "ldn", note: "relay node · low noise", tag: "RELAY", hot: false },
  { name: "tok", note: "staging · payload mirror", tag: "STAGE", hot: false },
  { name: "syd", note: "decoy traffic generator", tag: "DECOY", hot: false },
];

export default function MapPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Global Attack Map</h1>
          <p className={s.pageDesc}>
            Live trajectory of outbound operations across the relay mesh. Each
            arc is a strike in flight; rings mark impact. All traffic fabricated.
          </p>
        </div>
        <div className={s.pageTag}>8 NODES // LIVE FEED</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Operations Theatre</span>
            <span className={s.panelMeta}>equirectangular · live</span>
          </div>
          <div style={{ padding: 8 }}>
            <AttackMap height={460} />
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Relay Nodes</span>
            <span className={s.panelMeta}>by load</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {ORIGINS.map((o, i) => (
                <li key={o.name} className={s.listRow}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{o.name}</span>
                    <br />
                    <span className={s.listSub}>{o.note}</span>
                  </span>
                  <span className={`${s.tag} ${o.hot ? s.tagHot : ""}`}>
                    {o.tag}
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
