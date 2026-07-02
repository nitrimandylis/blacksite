"use client";

import Link from "next/link";
import type { Host } from "../sim/context";

const HOST_PORTS: Record<string, string[]> = {
  "edge-fw-01": ["22/ssh", "443/https", "8443/admin-ui"],
  "win-dc-02": ["88/kerberos", "389/ldap", "445/smb", "3389/rdp"],
  "jump-box": ["22/ssh", "1080/socks-proxy"],
  "sql-07": ["445/smb", "1433/mssql", "3389/rdp"],
  "vpn-gw": ["443/https", "1194/openvpn"],
  "bak-vault": ["22/ssh", "9392/veeam-api"],
  "mail-relay": ["25/smtp", "587/submission", "993/imaps"],
  "nas-01": ["22/ssh", "5000/dsm-ui", "445/smb"],
  "cam-net": ["80/http", "554/rtsp", "8000/onvif"],
  "iot-hub": ["1883/mqtt", "8883/mqtts", "8080/dashboard"],
};

export default function HostDetail({ host, onClose }: { host: Host; onClose: () => void }) {
  const ports = HOST_PORTS[host.id] || ["22/ssh"];

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 280,
      background: "var(--bg-panel)", borderLeft: "1px solid var(--line-bright)",
      zIndex: 10, display: "flex", flexDirection: "column",
      animation: "slideIn 0.15s ease-out",
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 14px", borderBottom: "1px solid var(--line)",
      }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-dim)", textTransform: "uppercase" }}>
          HOST DETAIL
        </span>
        <button onClick={onClose} style={{
          background: "none", border: "1px solid var(--line-bright)", color: "var(--ink-dim)",
          fontFamily: "var(--mono)", fontSize: 10, padding: "2px 8px", cursor: "pointer",
        }}>ESC</button>
      </div>

      <div style={{ padding: 14, flex: 1, overflow: "auto" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{host.name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-dim)", marginBottom: 16 }}>
          {host.ip} &middot; {host.os}
        </div>

        <div style={{
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--ink-faint)", marginBottom: 6,
        }}>STATUS</div>
        <div style={{
          display: "inline-block", padding: "3px 8px", marginBottom: 16,
          border: `1px solid ${host.status === "OWNED" ? "var(--ink)" : "var(--line-bright)"}`,
          color: host.status === "OWNED" ? "var(--ink)" : "var(--ink-dim)",
          fontSize: 10, letterSpacing: "0.16em",
        }}>{host.status}</div>

        <div style={{
          height: 4, background: "var(--line)", marginBottom: 16, position: "relative",
        }}>
          <span style={{
            position: "absolute", inset: 0, transformOrigin: "left",
            transform: `scaleX(${host.pct / 100})`,
            background: "var(--ink)", transition: "transform 0.3s",
          }} />
        </div>

        <div style={{
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--ink-faint)", marginBottom: 6,
        }}>OPEN PORTS</div>
        {ports.map(p => (
          <div key={p} style={{ fontSize: 11, color: "var(--ink-dim)", padding: "3px 0" }}>
            {p}
          </div>
        ))}

        <div style={{ marginTop: 20 }}>
          {host.status === "OWNED" ? (
            <Link href={`/terminal?host=${host.id}`} style={{
              display: "block", textAlign: "center", padding: "8px 0",
              border: "1px solid var(--ink)", color: "var(--ink)",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            }}>OPEN SHELL &rarr;</Link>
          ) : (
            <Link href={`/terminal?host=${host.id}`} style={{
              display: "block", textAlign: "center", padding: "8px 0",
              border: "1px solid var(--line-bright)", color: "var(--ink-dim)",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            }}>VIEW IN TERMINAL &rarr;</Link>
          )}
        </div>
      </div>
    </div>
  );
}
