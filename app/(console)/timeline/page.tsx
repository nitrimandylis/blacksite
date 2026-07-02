"use client";

import { useCallback } from "react";
import { useSim } from "../../sim/context";
import s from "../console.module.css";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toUTCString().slice(17, 25);
}

function elapsed(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function generateSitrep(hosts: ReturnType<typeof useSim>["hosts"], events: ReturnType<typeof useSim>["events"], killPhase: number, dataExfil: number) {
  const owned = hosts.filter(h => h.status === "OWNED");
  const inProgress = hosts.filter(h => h.status !== "OWNED" && h.status !== "QUEUED");
  const hot = events.filter(e => e.hot);

  const lines = [
    `BLACKSITE — OPERATION GHOST-14 — SITREP`,
    `Generated: ${new Date().toUTCString()}`,
    `${"=".repeat(52)}`,
    ``,
    `ENGAGEMENT STATUS`,
    `  Kill chain phase: ${killPhase + 1} / 7`,
    `  Hosts discovered: ${hosts.length}`,
    `  Hosts owned:      ${owned.length}`,
    `  In progress:      ${inProgress.length}`,
    `  Data exfiltrated: ${dataExfil.toFixed(1)} GB`,
    ``,
    `OWNED HOSTS`,
    ...owned.map(h => `  ${h.ip.padEnd(16)} ${h.name.padEnd(15)} ${h.os}`),
    ``,
    `IN PROGRESS`,
    ...inProgress.map(h => `  ${h.ip.padEnd(16)} ${h.name.padEnd(15)} ${h.status} (${h.pct}%)`),
    ``,
    `CRITICAL EVENTS (${hot.length})`,
    ...hot.slice(0, 20).map(e => `  [${formatTime(e.time)}] ${e.tag.padEnd(8)} ${e.text} — ${e.sub}`),
    ``,
    `FULL EVENT LOG (${events.length} entries)`,
    ...events.slice(0, 40).map(e => `  [${formatTime(e.time)}] ${e.tag.padEnd(8)} ${e.text}`),
    ``,
    `${"=".repeat(52)}`,
    `END OF REPORT — CONCEPT PIECE — ALL DATA FABRICATED`,
  ];
  return lines.join("\n");
}

export default function TimelinePage() {
  const { events, hosts, killPhase, dataExfil } = useSim();
  const owned = hosts.filter(h => h.status === "OWNED").length;

  const exportSitrep = useCallback(() => {
    const text = generateSitrep(hosts, events, killPhase, dataExfil);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitrep-ghost14-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [hosts, events, killPhase, dataExfil]);

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Operation Timeline</h1>
          <p className={s.pageDesc}>
            Chronological record of the engagement. Hot events mark pivotal
            moments &mdash; shell acquisitions, cred dumps, escalations.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={exportSitrep} className={s.pageTag} style={{
            background: "none", cursor: "pointer", fontFamily: "var(--mono)",
          }}>EXPORT SITREP</button>
          <div className={s.pageTag}>{events.length} EVENTS</div>
        </div>
      </div>

      <div className={`${s.grid} ${s.cols3}`}>
        <div className={`${s.card} ${s.span2}`} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Event Stream</span>
            <span className={s.panelMeta}>newest first</span>
          </div>
          <div className={s.panelBody} style={{ maxHeight: 640, overflow: "auto" }}>
            {events.map((ev, i) => (
              <div key={ev.id} style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 12,
              }}>
                <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>
                  <div suppressHydrationWarning>{formatTime(ev.time)}</div>
                  <div suppressHydrationWarning style={{ fontSize: 9, marginTop: 2 }}>{elapsed(ev.time)}</div>
                </div>
                <div>
                  <div style={{ color: ev.hot ? "var(--ink)" : "var(--ink-dim)" }}>
                    {ev.hot && <span style={{ display: "inline-block", width: 5, height: 5, background: "var(--ink)", marginRight: 8, verticalAlign: "middle" }} />}
                    {ev.text}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 2 }}>{ev.sub}</div>
                </div>
                <span style={{
                  fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                  padding: "3px 8px",
                  border: `1px solid ${ev.hot ? "var(--ink)" : "var(--line-bright)"}`,
                  color: ev.hot ? "var(--ink)" : "var(--ink-dim)",
                  whiteSpace: "nowrap",
                }}>{ev.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.card} style={{ padding: 0 }}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Engagement Summary</span>
            <span className={s.panelMeta}>live</span>
          </div>
          <div className={s.panelBody}>
            {[
              ["hosts discovered", String(hosts.length)],
              ["hosts owned", String(owned)],
              ["kill chain phase", String(killPhase + 1) + " / 7"],
              ["hot events", String(events.filter(e => e.hot).length)],
              ["total events", String(events.length)],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                padding: "9px 0", borderBottom: "1px solid var(--line)",
                fontSize: 12,
              }}>
                <span style={{ color: "var(--ink-faint)" }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}

            <div style={{
              marginTop: 16, fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 6,
            }}>OWNED HOSTS</div>
            {hosts.filter(h => h.status === "OWNED").map(h => (
              <div key={h.id} style={{ fontSize: 11, color: "var(--ink-dim)", padding: "3px 0" }}>
                {h.name} &middot; {h.ip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
