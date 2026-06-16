import BigChart from "../../components/BigChart";
import Gauge from "../../components/Gauge";
import s from "../console.module.css";

export default function TelemetryPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Telemetry</h1>
          <p className={s.pageDesc}>
            Channel throughput, beacon jitter, and resource draw across the
            implant fleet. Streaming at 1Hz.
          </p>
        </div>
        <div className={s.pageTag}>STREAM // LIVE</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`} style={{ marginBottom: 18 }}>
        <div className={s.card} style={{ display: "flex", justifyContent: "center" }}>
          <Gauge value={0.82} label="c2 load" />
        </div>
        <div className={s.card} style={{ display: "flex", justifyContent: "center" }}>
          <Gauge value={0.41} label="detection" />
        </div>
        <div className={s.card} style={{ display: "flex", justifyContent: "center" }}>
          <Gauge value={0.67} label="exfil rate" />
        </div>
      </div>

      <div className={`${s.grid} ${s.cols2}`} style={{ marginBottom: 18 }}>
        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Channel Throughput</span>
            <span className={s.panelMeta}>kb/s · onion</span>
          </div>
          <div style={{ padding: 16 }}>
            <BigChart seed={11} height={220} />
          </div>
        </div>
        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Beacon Jitter</span>
            <span className={s.panelMeta}>ms · per check-in</span>
          </div>
          <div style={{ padding: 16 }}>
            <BigChart seed={29} height={220} bars />
          </div>
        </div>
      </div>

      <div className={s.card} style={{ padding: 0 }}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Fleet Resource Draw — 24h window</span>
          <span className={s.panelMeta}>cpu · mem · net composite</span>
        </div>
        <div style={{ padding: 16 }}>
          <BigChart seed={47} height={260} />
        </div>
      </div>
    </>
  );
}
