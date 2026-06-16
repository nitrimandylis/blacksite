import NodeGraph from "../../components/NodeGraph";
import s from "../console.module.css";

const HOSTS = [
  { ip: "14.221.9.40", name: "edge-fw-01", os: "FortiOS 7.2", tag: "OWNED", hot: true },
  { ip: "10.0.4.12", name: "win-dc-02", os: "Win Srv 2022", tag: "OWNED", hot: true },
  { ip: "10.0.4.77", name: "sql-07", os: "Win Srv 2019", tag: "TARGET", hot: false },
  { ip: "10.0.1.1", name: "vpn-gw", os: "OpenVPN", tag: "TARGET", hot: false },
  { ip: "10.0.9.5", name: "bak-vault", os: "Veeam 12", tag: "TARGET", hot: false },
];

export default function NetworkPage() {
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
        <div className={s.pageTag}>18 NODES // 22 LINKS</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Topology // sector-14</span>
            <span className={s.panelMeta}>force-directed</span>
          </div>
          <div style={{ padding: 8 }}>
            <NodeGraph height={520} />
          </div>
          <div
            className={s.legend}
            style={{ padding: "0 16px 16px" }}
          >
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
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Host Registry</span>
            <span className={s.panelMeta}>nmap -sV</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {HOSTS.map((h, i) => (
                <li key={h.ip} className={s.listRow}>
                  <span className={s.listIdx}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={s.listMain}>{h.name}</span>
                    <br />
                    <span className={s.listSub}>
                      {h.ip} · {h.os}
                    </span>
                  </span>
                  <span className={`${s.tag} ${h.hot ? s.tagHot : ""}`}>
                    {h.tag}
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
