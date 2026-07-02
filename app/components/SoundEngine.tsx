"use client";

import { useCallback, useRef, useState } from "react";

// ponytail: all sounds synthesized via WebAudio — zero asset files
function createCtx() {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function beep(ctx: AudioContext, freq: number, dur: number, vol = 0.06) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

function tick(ctx: AudioContext) { beep(ctx, 600, 0.04, 0.03); }
function alert(ctx: AudioContext) { beep(ctx, 880, 0.08, 0.07); setTimeout(() => beep(ctx, 1100, 0.06, 0.05), 100); }
function keystroke(ctx: AudioContext) { beep(ctx, 300 + Math.random() * 200, 0.02, 0.02); }

export function useSoundEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);

  const init = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = createCtx();
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume();
    setEnabled(e => !e);
  }, []);

  const playTick = useCallback(() => { if (enabled && ctxRef.current) tick(ctxRef.current); }, [enabled]);
  const playAlert = useCallback(() => { if (enabled && ctxRef.current) alert(ctxRef.current); }, [enabled]);
  const playKey = useCallback(() => { if (enabled && ctxRef.current) keystroke(ctxRef.current); }, [enabled]);

  return { enabled, toggle: init, playTick, playAlert, playKey };
}

export default function SoundController({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: "none",
        border: "1px solid var(--line-bright)",
        color: enabled ? "var(--ink)" : "var(--ink-faint)",
        fontFamily: "var(--mono)",
        fontSize: 9,
        letterSpacing: "0.14em",
        padding: "4px 8px",
        cursor: "pointer",
        textTransform: "uppercase",
      }}
      title={enabled ? "Mute audio" : "Enable audio"}
    >
      {enabled ? "SND ON" : "SND OFF"}
    </button>
  );
}
