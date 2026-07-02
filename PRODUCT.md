# Product

## Register

brand

## Users

Portfolio reviewers — hiring managers, engineers, designers — landing on the page cold, deciding within seconds whether to keep scrolling. Secondary: developers who click through to the repo to see how the canvas work is done. They are on desktop most of the time; mobile visitors get a presentable scaled-down view, never a redesigned one.

## Product Purpose

BLACKSITE is a data-visualization showcase dressed as a fictional "intrusion ops console": a landing page plus ten console pages (dashboard, network, orbit, map, killchain, radar, telemetry, decrypt, terminal, timeline) where every visualization is hand-drawn on `<canvas>` with zero runtime UI dependencies. All data is simulated, forever — no backend is planned. Success is a reviewer stopping their scroll, poking at the console, and thinking "how was this made?"

## Brand Personality

Confident, precise, cinematic. The hacker fiction is played straight as *craft*, not camp — the tone of a movie command center that was never made, with a small "concept piece · fabricated data" credit instead of an apologetic disclaimer. Strict monochrome (near-black to white, no hue anywhere), terminal-flavored typography, HUD details (corner ticks, scanlines, grid) used with restraint. Note: the monochrome + monospace terminal lane is a locked identity decision — this is a *literal* fictional terminal, so the lane is earned, not a reflex; preserve it.

## Anti-references

- **Matrix green-on-black**: the phosphor-green terminal cliché. No green, no hue at all.
- **Neon cyberpunk**: magenta/cyan glows, chromatic aberration, Blade Runner grading.
- **Generic SaaS dashboard**: rounded cards, soft shadows, chart-library defaults. Nothing here should look like a real analytics product or use a charting library.
- **Campy movie hacking**: "ACCESS GRANTED" popups, skulls, progress-bar theatrics that undercut the craft framing.

## Design Principles

1. **Hand-drawn or nothing.** Every visualization is raw 2D canvas + `requestAnimationFrame`. No chart libraries, no runtime UI deps. The constraint IS the portfolio point.
2. **Fiction as craft, not costume.** Fabricated data is presented with a straight face and a small honest credit. Confidence over apology; precision over theatrics.
3. **Quiet fans.** Every canvas loop runs through `useCanvasLoop` (pauses offscreen, pauses on hidden tabs, respects reduced motion). Spectacle never costs battery.
4. **Monochrome discipline.** One ramp from `#050505` to `#ffffff` (tokens in `app/globals.css`). Hierarchy comes from luminance, weight, and motion — never hue.
5. **Desktop-first, never broken.** Canvases scale down on mobile (`responsiveHeight`); layouts compress but never collapse. Don't redesign viz for touch.

## Accessibility & Inclusion

Pragmatic showcase level, not a formal WCAG target:

- `prefers-reduced-motion` honored globally (CSS animations disabled; canvas loops respect it via `useCanvasLoop`).
- All text stays readable against the near-black ramp — dim/faint inks are for labels and chrome, never body copy.
- Navigation keyboard-usable; the terminal page is genuinely typeable.
