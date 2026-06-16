"use client";

import { useEffect, useRef, useState } from "react";
import s from "../console.module.css";
import t from "./terminal.module.css";

type Line = { kind: "in" | "out" | "bright" | "err"; text: string };

const PS1 = "ghost@blacksite:~$";

const BANNER: Line[] = [
  { kind: "bright", text: "BLACKSITE shell // build 2.6.0-rc — simulated environment" },
  { kind: "out", text: "all output is fabricated for demonstration. type `help`." },
];

const HELP = [
  "help            this list",
  "scan <subnet>   sweep a subnet for live hosts",
  "hosts           list discovered hosts",
  "exploit <host>  attempt access on a target",
  "loot            show captured artifacts",
  "whoami          current operator context",
  "status          link + circuit status",
  "clear           wipe the screen",
];

const HOSTS = [
  "14.221.9.40    edge-fw-01     OWNED",
  "10.0.4.12      win-dc-02      OWNED",
  "10.0.4.77      sql-07         TARGET",
  "10.0.1.1       vpn-gw         TARGET",
  "10.0.9.5       bak-vault      TARGET",
];

const LOOT = [
  "ad_hashes.ntds        1,204 entries     12.4 MB",
  "vpn_config.ovpn       1 file            8.1 KB",
  "db_dump_finance.sql   partial           2.2 GB",
  "kerberos.tickets      37 TGTs           440 KB",
];

function run(raw: string): Line[] {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  switch (cmd) {
    case "help":
      return HELP.map((h) => ({ kind: "out", text: "  " + h }));
    case "hosts":
      return [
        { kind: "out", text: "ADDRESS         HOSTNAME       STATE" },
        ...HOSTS.map((h) => ({ kind: "bright" as const, text: "  " + h })),
      ];
    case "scan": {
      const net = args[0] || "10.0.0.0/24";
      return [
        { kind: "out", text: `sweeping ${net} ...` },
        { kind: "out", text: "  [####################] 256/256" },
        { kind: "bright", text: "  5 live hosts · 23 open ports · 2 owned" },
      ];
    }
    case "exploit": {
      const target = args[0];
      if (!target)
        return [{ kind: "err", text: "usage: exploit <host>" }];
      return [
        { kind: "out", text: `staging payload against ${target} ...` },
        { kind: "out", text: "  CVE-2024-XXXX :: heap overflow ...... matched" },
        { kind: "out", text: "  bypassing edr ...................... ok" },
        { kind: "bright", text: `  shell opened on ${target} :: root` },
      ];
    }
    case "loot":
      return [
        { kind: "out", text: "ARTIFACT              DETAIL            SIZE" },
        ...LOOT.map((l) => ({ kind: "bright" as const, text: "  " + l })),
      ];
    case "whoami":
      return [
        { kind: "bright", text: "operator: GHOST" },
        { kind: "out", text: "clearance: OMEGA · session GHOST-14 · node 0x4F.AE.11" },
      ];
    case "status":
      return [
        { kind: "out", text: "link ........ SECURE (41ms, 7 hops)" },
        { kind: "out", text: "circuit ..... 99.4% integrity" },
        { kind: "out", text: "implants .... 47 active / 312 hosts" },
      ];
    case "":
      return [];
    default:
      return [{ kind: "err", text: `${cmd}: command not found — try \`help\`` }];
  }
}

export default function TerminalPage() {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [val, setVal] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  function submit(raw: string) {
    const entry: Line = { kind: "in", text: raw };
    if (raw.trim() === "clear") {
      setLines([]);
      return;
    }
    setLines((ls) => [...ls, entry, ...run(raw)]);
    if (raw.trim()) setHist((h) => [...h, raw]);
    setHi(-1);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      submit(val);
      setVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      const ni = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(ni);
      setVal(hist[ni]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hi < 0) return;
      const ni = hi + 1;
      if (ni >= hist.length) {
        setHi(-1);
        setVal("");
      } else {
        setHi(ni);
        setVal(hist[ni]);
      }
    }
  }

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Shell</h1>
          <p className={s.pageDesc}>
            Interactive operator console. Sandboxed and fully simulated — no
            real systems are touched. Try{" "}
            <span style={{ color: "var(--ink)" }}>scan</span>,{" "}
            <span style={{ color: "var(--ink)" }}>hosts</span>,{" "}
            <span style={{ color: "var(--ink)" }}>exploit win-dc-02</span>.
          </p>
        </div>
        <div className={s.pageTag}>PTY // /dev/ghost</div>
      </div>

      <div className={t.term} onClick={() => inputRef.current?.focus()}>
        <div className={t.termHead}>
          <div className={t.dots}>
            <span className={t.dot} />
            <span className={t.dot} />
            <span className={t.dot} />
          </div>
          <span className={t.termTitle}>ghost@blacksite — bash</span>
          <span className={t.termTitle}>80×24</span>
        </div>

        <div className={t.body} ref={bodyRef}>
          {lines.map((l, i) => {
            if (l.kind === "in")
              return (
                <div key={i} className={t.line}>
                  <span className={t.ps1}>{PS1}</span>{" "}
                  <span className={t.user}>{l.text}</span>
                </div>
              );
            const cls =
              l.kind === "bright"
                ? t.outBright
                : l.kind === "err"
                ? t.err
                : t.out;
            return (
              <div key={i} className={`${t.line} ${cls}`}>
                {l.text}
              </div>
            );
          })}
        </div>

        <div className={t.inputRow}>
          <span className={t.ps1}>{PS1}</span>
          <input
            ref={inputRef}
            className={t.input}
            value={val}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            aria-label="terminal input"
          />
        </div>
      </div>

      <div className={t.hint}>
        ↑/↓ history · `help` for commands · `clear` to reset
      </div>
    </>
  );
}
