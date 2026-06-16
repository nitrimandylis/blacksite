import KillChain from "../../components/KillChain";
import s from "../console.module.css";

export default function KillChainPage() {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Kill Chain</h1>
          <p className={s.pageDesc}>
            Engagement progression through the seven intrusion phases. The
            pipeline loops continuously for demonstration.
          </p>
        </div>
        <div className={s.pageTag}>7 PHASES // AUTO</div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: "8px 24px" }}>
          <KillChain />
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Phase Notes</span>
            <span className={s.panelMeta}>doctrine</span>
          </div>
          <div className={s.panelBody}>
            <p style={{ fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.8 }}>
              The intrusion kill chain models an operation as a sequence of
              dependent phases. Breaking any single link disrupts the whole
              chain — which is exactly why defenders map it.
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--ink-faint)",
                lineHeight: 1.8,
                marginTop: 14,
              }}
            >
              This view is a stylized, fabricated walkthrough. No real targets,
              payloads, or systems are involved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
