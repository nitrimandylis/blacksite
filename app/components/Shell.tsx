"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SimProvider, useSim } from "../sim/context";
import SoundController, { useSoundEngine } from "./SoundEngine";
import ReplayBanner from "./ReplayBanner";
import styles from "../shell.module.css";

type SoundAPI = { playKey: () => void; playTick: () => void; playAlert: () => void };
const SoundContext = createContext<SoundAPI>({ playKey: () => {}, playTick: () => {}, playAlert: () => {} });
export function useSound() { return useContext(SoundContext); }

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
  { href: "/timeline", label: "Timeline", idx: "10" },
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

function Toasts() {
  const { toasts, dismissToast } = useSim();
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    for (const t of toasts) {
      if (!timers.current.has(t.id)) {
        timers.current.set(t.id, setTimeout(() => {
          dismissToast(t.id);
          timers.current.delete(t.id);
        }, 4000));
      }
    }
  }, [toasts, dismissToast]);

  if (!toasts.length) return null;
  return (
    <div className={styles.toasts}>
      {toasts.map(t => (
        <div key={t.id} className={styles.toast}>
          <span className={styles.toastDot} />
          <span className={styles.toastText}>{t.text}</span>
          <span className={styles.toastSub}>{t.sub}</span>
        </div>
      ))}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = NAV.filter(n =>
    n.label.toLowerCase().includes(query.toLowerCase()) ||
    n.idx.includes(query)
  );

  function go(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div className={styles.paletteOverlay} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <div className={styles.paletteHead}>
          <span className={styles.paletteLabel}>JUMP TO</span>
          <span className={styles.paletteMeta}>ESC to close</span>
        </div>
        <input
          ref={inputRef}
          className={styles.paletteInput}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && filtered.length) go(filtered[0].href);
          }}
          placeholder="search pages..."
          spellCheck={false}
        />
        <div className={styles.paletteList}>
          {filtered.map(n => (
            <button key={n.href} className={styles.paletteItem} onClick={() => go(n.href)}>
              <span className={styles.paletteIdx}>{n.idx}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const active = NAV.find((n) => path.startsWith(n.href));
  const [palette, setPalette] = useState(false);
  const [replay, setReplay] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const sound = useSoundEngine();
  const { toasts, events } = useSim();
  const prevToastCount = useRef(toasts.length);
  const prevEventCount = useRef(events.length);

  // alert sound on hot toasts
  useEffect(() => {
    if (toasts.length > prevToastCount.current) sound.playAlert();
    prevToastCount.current = toasts.length;
  }, [toasts.length, sound]);

  // tick sound on new sim events
  useEffect(() => {
    if (events.length > prevEventCount.current) sound.playTick();
    prevEventCount.current = events.length;
  }, [events.length, sound]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPalette(p => !p);
        return;
      }
      if (e.key === "Escape") { setPalette(false); setReplay(false); return; }
      if (e.key === "r" || e.key === "R") { setReplay(r => !r); return; }
      const n = parseInt(e.key);
      // 1-9 for pages 1-9, 0 for page 10
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (n >= 1 && n <= 9) router.push(NAV[n - 1].href);
        else if (n === 0 && NAV[9]) router.push(NAV[9].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // close mobile nav on route change
  useEffect(() => { setMobileNav(false); }, [path]);

  return (
    <SoundContext value={{ playKey: sound.playKey, playTick: sound.playTick, playAlert: sound.playAlert }}>
      <div className={styles.shell}>
        <aside className={`${styles.sidebar} ${mobileNav ? styles.sidebarOpen : ""}`}>
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
            <div className={styles.shortcutHint}>1-9,0 nav · cmd+K jump · R replay</div>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className={styles.hamburger}
                onClick={() => setMobileNav(v => !v)}
                aria-label="Toggle navigation"
              >
                <span /><span /><span />
              </button>
              <div className={styles.crumbs}>
                <span>BLACKSITE</span>
                <span className={styles.crumbSep}>/</span>
                <span>{active ? active.label : "Console"}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <SoundController enabled={sound.enabled} onToggle={sound.toggle} />
              <Clock />
            </div>
          </header>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
      <Toasts />
      <ReplayBanner active={replay} onStop={() => setReplay(false)} />
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
      {mobileNav && <div className={styles.overlay} onClick={() => setMobileNav(false)} />}
    </SoundContext>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SimProvider>
      <ShellInner>{children}</ShellInner>
    </SimProvider>
  );
}
