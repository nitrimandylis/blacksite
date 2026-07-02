"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// --- Types ---

const STATUSES = ["QUEUED", "RECON", "PROBE", "ENUM", "ELEVATING", "OWNED"] as const;
type HostStatus = (typeof STATUSES)[number];

export type Host = {
  id: string;
  ip: string;
  name: string;
  os: string;
  status: HostStatus;
  pct: number;
};

export type SimEvent = {
  id: number;
  time: number;
  text: string;
  sub: string;
  tag: string;
  hot: boolean;
};

export type Toast = { id: number; text: string; sub: string };

type Sim = {
  hosts: Host[];
  events: SimEvent[];
  toasts: Toast[];
  dataExfil: number;
  killPhase: number;
  exploitHost: (id: string) => void;
  dismissToast: (id: number) => void;
};

// --- Data ---

const INIT_HOSTS: Host[] = [
  { id: "edge-fw-01", ip: "14.221.9.40", name: "edge-fw-01", os: "FortiOS 7.2", status: "OWNED", pct: 100 },
  { id: "win-dc-02", ip: "10.0.4.12", name: "win-dc-02", os: "Win Srv 2022", status: "OWNED", pct: 100 },
  { id: "jump-box", ip: "10.0.3.8", name: "jump-box", os: "Ubuntu 22.04", status: "OWNED", pct: 100 },
  { id: "sql-07", ip: "10.0.4.77", name: "sql-07", os: "Win Srv 2019", status: "ENUM", pct: 54 },
  { id: "vpn-gw", ip: "10.0.1.1", name: "vpn-gw", os: "OpenVPN", status: "PROBE", pct: 32 },
  { id: "bak-vault", ip: "10.0.9.5", name: "bak-vault", os: "Veeam 12", status: "RECON", pct: 12 },
  { id: "mail-relay", ip: "10.0.5.20", name: "mail-relay", os: "Postfix", status: "QUEUED", pct: 0 },
  { id: "nas-01", ip: "10.0.7.3", name: "nas-01", os: "Synology DSM", status: "QUEUED", pct: 0 },
  { id: "cam-net", ip: "10.0.8.1", name: "cam-net", os: "Hikvision", status: "QUEUED", pct: 0 },
  { id: "iot-hub", ip: "10.0.8.40", name: "iot-hub", os: "MQTT Broker", status: "QUEUED", pct: 0 },
];

const AMBIENT = [
  { text: "beacon check-in", tag: "C2", sub: (h: Host) => `implant 0x${hex()} :: ${30 + rn(40)}ms` },
  { text: "port scan", tag: "RECON", sub: (h: Host) => `${h.ip} :: ${rn(65535)} ports` },
  { text: "dns query", tag: "ENUM", sub: (h: Host) => `${h.name}.corp.local :: A record` },
  { text: "circuit check", tag: "C2", sub: () => `onion :: ${5 + rn(5)} hops :: ${30 + rn(30)}ms` },
  { text: "edr bypass", tag: "STEALTH", sub: (h: Host) => `${h.name} :: hook patched` },
  { text: "cred spray", tag: "ATTACK", sub: () => `ad.corp.local :: ${50 + rn(200)} accounts` },
  { text: "payload staged", tag: "ARM", sub: () => `loader_${hex()}.bin :: ${64 + rn(300)}kb` },
  { text: "lateral move", tag: "PIVOT", sub: (h: Host) => `-> ${h.name} :: smb relay` },
];

const ADVANCE_MAP: Record<string, { text: string; tag: string }> = {
  RECON: { text: "recon started", tag: "RECON" },
  PROBE: { text: "probe initiated", tag: "RECON" },
  ENUM: { text: "service enumeration", tag: "ENUM" },
  ELEVATING: { text: "privilege escalation", tag: "ATTACK" },
  OWNED: { text: "shell opened", tag: "OWNED" },
};

const STATUS_PCT: Record<HostStatus, number> = {
  QUEUED: 0, RECON: 15, PROBE: 35, ENUM: 55, ELEVATING: 80, OWNED: 100,
};

// --- Helpers ---

let eid = 0;
function rn(n: number) { return Math.floor(Math.random() * n); }
function hex() { return rn(0xFFFF).toString(16).padStart(4, "0").toUpperCase(); }
function evt(text: string, sub: string, tag: string, hot = false): SimEvent {
  return { id: ++eid, time: Date.now(), text, sub, tag, hot };
}

const INIT_EVENTS: SimEvent[] = [
  evt("shell opened", "14.221.9.40 :: root@edge-fw", "OWNED", true),
  evt("cred dump", "ad.corp.local :: 1,204 hashes", "LOOT", true),
  evt("lateral move", "win-dc-02 -> jump-box", "PIVOT", false),
  evt("beacon check-in", "implant 0xAE41 :: 41ms", "C2", false),
  evt("port scan", "10.0.0.0/16 :: 65535 ports", "RECON", false),
  evt("payload staged", "loader.bin :: 244kb", "ARM", false),
];

// --- Context ---

const SimContext = createContext<Sim | null>(null);

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim requires SimProvider");
  return ctx;
}

export function SimProvider({ children }: { children: React.ReactNode }) {
  const [hosts, setHosts] = useState(INIT_HOSTS);
  const [events, setEvents] = useState(INIT_EVENTS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dataExfil, setDataExfil] = useState(8.4);
  const hostsRef = useRef(hosts);
  hostsRef.current = hosts;

  useEffect(() => {
    const t = setInterval(() => {
      const cur = hostsRef.current;
      const advanceable = cur.filter(h => h.status !== "OWNED");
      let newEvent: SimEvent | null = null;

      if (advanceable.length && Math.random() < 0.25) {
        const h = advanceable[rn(advanceable.length)];
        const si = STATUSES.indexOf(h.status);
        const ns = STATUSES[si + 1];
        const info = ADVANCE_MAP[ns];
        newEvent = evt(info.text, `${h.ip} :: ${h.name}`, info.tag, ns === "OWNED" || ns === "ELEVATING");
        const hid = h.id;
        setHosts(prev => prev.map(p =>
          p.id === hid ? { ...p, status: ns, pct: STATUS_PCT[ns] } : p
        ));
      } else if (Math.random() < 0.4) {
        const tpl = AMBIENT[rn(AMBIENT.length)];
        const h = cur[rn(cur.length)];
        newEvent = evt(tpl.text, tpl.sub(h), tpl.tag);
      }

      if (newEvent) {
        const e = newEvent;
        setEvents(prev => [e, ...prev].slice(0, 50));
        if (e.hot) setToasts(prev => [...prev, { id: e.id, text: e.text, sub: e.sub }]);
      }

      // ponytail: animate pct bars toward their target
      setHosts(prev => {
        let changed = false;
        const next = prev.map(h => {
          const target = STATUS_PCT[h.status];
          if (h.pct < target) { changed = true; return { ...h, pct: Math.min(target, h.pct + 3) }; }
          return h;
        });
        return changed ? next : prev;
      });

      setDataExfil(d => +(d + Math.random() * 0.12).toFixed(1));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const exploitHost = useCallback((id: string) => {
    const h = hostsRef.current.find(p => p.id === id);
    if (!h || h.status === "OWNED") return;
    const e = evt("shell opened", `${h.ip} :: root@${h.name}`, "OWNED", true);
    setHosts(prev => prev.map(p => p.id === id ? { ...p, status: "OWNED" as const, pct: 100 } : p));
    setEvents(ev => [e, ...ev].slice(0, 50));
    setToasts(t => [...t, { id: e.id, text: e.text, sub: e.sub }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const owned = hosts.filter(h => h.status === "OWNED").length;
  const killPhase = owned <= 1 ? 0 : owned <= 2 ? 1 : owned <= 3 ? 2 : owned <= 4 ? 3 : owned <= 6 ? 4 : owned <= 8 ? 5 : 6;

  return (
    <SimContext value={{ hosts, events, toasts, dataExfil, killPhase, exploitHost, dismissToast }}>
      {children}
    </SimContext>
  );
}
