"use client";

import SolarMap from "../../components/SolarMap";
import { useSim } from "../../sim/context";
import s from "../console.module.css";

const PLANET_HOST_MAP: Record<string, string> = {
  "edge-fw": "edge-fw-01",
  "dc-cluster": "win-dc-02",
  "sql-vault": "sql-07",
  "vpn-edge": "vpn-gw",
  "bak-grid": "bak-vault",
  "iot-belt": "iot-hub",
};

export default function OrbitPage() {
  const { hosts } = useSim();

  const statusMap: Record<string, string> = {};
  for (const [planet, hostId] of Object.entries(PLANET_HOST_MAP)) {
    const h = hosts.find(x => x.id === hostId);
    if (h) statusMap[planet] = h.status;
  }

  const bodies = [
    { name: "edge-fw", au: "0.4", note: "perimeter breach point" },
    { name: "dc-cluster", au: "0.7", note: "domain authority" },
    { name: "sql-vault", au: "1.1", note: "enumerating schemas" },
    { name: "vpn-edge", au: "1.6", note: "handshake captured" },
    { name: "bak-grid", au: "2.0", note: "primary objective" },
    { name: "iot-belt", au: "2.4", note: "fingerprinting devices" },
  ].map(b => ({
    ...b,
    status: statusMap[b.name] || "QUEUED",
    hot: statusMap[b.name] === "OWNED",
  }));

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Target Orbit</h1>
          <p className={s.pageDesc}>
            Engagement modeled as a solar system. The C2 core anchors the
            field; each body is a subsystem orbiting at a distance scaled to
            access difficulty.
          </p>
        </div>
        <div className={s.pageTag}>{bodies.length} BODIES // {bodies.filter(b => b.hot).length} OWNED</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Orbital View</span>
            <span className={s.panelMeta}>heliocentric &middot; live</span>
          </div>
          <div style={{ padding: 8 }}>
            <SolarMap height={560} statusMap={statusMap} />
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Body Catalogue</span>
            <span className={s.panelMeta}>by distance</span>
          </div>
          <div className={s.panelBody}>
            <ul className={s.list}>
              {bodies.map((b) => (
                <li key={b.name} className={s.listRow}>
                  <span className={s.listIdx}>{b.au}</span>
                  <span>
                    <span className={s.listMain}>{b.name}</span>
                    <br />
                    <span className={s.listSub}>{b.note}</span>
                  </span>
                  <span className={`${s.tag} ${b.hot ? s.tagHot : ""}`}>
                    {b.status}
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
