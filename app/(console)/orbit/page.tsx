import SolarMap from "../../components/SolarMap";
import s from "../console.module.css";

const BODIES = [
  { name: "edge-fw", au: "0.4", note: "perimeter breach point", tag: "OWNED", hot: true },
  { name: "dc-cluster", au: "0.7", note: "domain authority · 2 sats", tag: "OWNED", hot: true },
  { name: "sql-vault", au: "1.1", note: "enumerating schemas", tag: "ENUM", hot: false },
  { name: "vpn-edge", au: "1.6", note: "handshake captured", tag: "PROBE", hot: false },
  { name: "bak-grid", au: "2.0", note: "primary objective · 3 sats", tag: "TARGET", hot: false },
  { name: "iot-belt", au: "2.4", note: "fingerprinting devices", tag: "RECON", hot: false },
];

export default function OrbitPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Target Orbit</h1>
          <p className={s.pageDesc}>
            Engagement modeled as a solar system. The C2 core anchors the
            field; each body is a subsystem orbiting at a distance scaled to
            access difficulty. Satellites are dependent services.
          </p>
        </div>
        <div className={s.pageTag}>6 BODIES // 6 SATELLITES</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Orbital View</span>
            <span className={s.panelMeta}>heliocentric · live</span>
          </div>
          <div style={{ padding: 8 }}>
            <SolarMap height={560} />
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Body Catalogue</span>
            <span className={s.panelMeta}>by distance</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {BODIES.map((b, i) => (
                <li key={b.name} className={s.listRow}>
                  <span className={s.listIdx}>{b.au}</span>
                  <span>
                    <span className={s.listMain}>{b.name}</span>
                    <br />
                    <span className={s.listSub}>{b.note}</span>
                  </span>
                  <span className={`${s.tag} ${b.hot ? s.tagHot : ""}`}>
                    {b.tag}
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
