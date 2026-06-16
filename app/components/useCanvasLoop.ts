// Shared rAF driver for every canvas in the app.
// Pauses when the canvas scrolls offscreen (IntersectionObserver) and when the
// tab is hidden (Page Visibility) — keeps fans quiet and background tabs idle.
// Also honors prefers-reduced-motion by rendering a single static frame.

export function startCanvasLoop(
  canvas: HTMLCanvasElement,
  frame: () => void
): () => void {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  let raf = 0;
  let running = false;
  let onscreen = true;

  const loop = () => {
    frame();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduced) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = () => {
    const visible = document.visibilityState === "visible";
    if (visible && onscreen) start();
    else stop();
  };

  const io = new IntersectionObserver(
    ([e]) => {
      onscreen = e.isIntersecting;
      sync();
    },
    { threshold: 0.01 }
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", sync);

  // Render at least one frame so reduced-motion users still see the viz.
  frame();
  sync();

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener("visibilitychange", sync);
  };
}

// Clamp canvas drawing height on small screens (keeps dense viz presentable
// on phones without redesigning them).
export function responsiveHeight(base: number): number {
  if (typeof window === "undefined") return base;
  const w = window.innerWidth;
  if (w < 560) return Math.round(base * 0.62);
  if (w < 820) return Math.round(base * 0.78);
  return base;
}
