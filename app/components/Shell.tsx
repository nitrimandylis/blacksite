"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../shell.module.css";

const NAV = [
  { href: "/dashboard", label: "Overview", idx: "01" },
  { href: "/network", label: "Net Graph", idx: "02" },
  { href: "/orbit", label: "Target Orbit", idx: "03" },
  { href: "/map", label: "Attack Map", idx: "04" },
  { href: "/killchain", label: "Kill Chain", idx: "05" },
  { href: "/radar", label: "Threat Radar", idx: "06" },
  { href: "/telemetry", label: "Telemetry", idx: "07" },
  { href: "/decrypt", label: "Decrypt", idx: "08" },
  { href: "/terminal", label: "Shell", idx: "09" },
];

function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNow(d.toUTCString().slice(17, 25));
      setUptime((u) => u + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={styles.clock}>
      <span>UPTIME {String(Math.floor(uptime / 60)).padStart(2, "0")}:{String(uptime % 60).padStart(2, "0")}</span>
      <span>UTC {now}</span>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const active = NAV.find((n) => path.startsWith(n.href));

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandMark}>
            <span className={styles.brandDot} />
            BLACKSITE
          </Link>
          <div className={styles.brandSub}>ops console v2.6</div>
        </div>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.navLink} ${
                path.startsWith(n.href) ? styles.navActive : ""
              }`}
            >
              <span className={styles.navIndex}>{n.idx}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <div className={styles.statusRow}>
            <span className={styles.statusDot} />
            LINK SECURE
          </div>
          <div>NODE 0x4F.AE.11</div>
          <div>OPERATOR // GHOST</div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.crumbs}>
            <span>BLACKSITE</span>
            <span className={styles.crumbSep}>/</span>
            <span>{active ? active.label : "Console"}</span>
          </div>
          <Clock />
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
