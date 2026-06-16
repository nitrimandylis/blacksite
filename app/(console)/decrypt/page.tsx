import Decrypt from "../../components/Decrypt";
import s from "../console.module.css";

export default function DecryptPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Decrypt</h1>
          <p className={s.pageDesc}>
            Live cryptanalysis bench. Recovered material resolves out of the
            cipher noise as the rig grinds. Everything shown is fabricated.
          </p>
        </div>
        <div className={s.pageTag}>GPU RIG // 4.2 GH/s</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 24 }}>
          <Decrypt />
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Rig Status</span>
            <span className={s.panelMeta}>8× accelerator</span>
          </div>
          <div className={s.panelBody}>
            {[
              ["temperature", "74°C"],
              ["wordlist", "rockyou+rules"],
              ["candidates", "1.4e12"],
              ["algo", "AES-256-GCM"],
              ["mode", "mask + dict"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--ink-faint)" }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
