import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  PORTAL_DURATION,
  REDUCED_DURATION,
  portalTimeline,
} from "./portal.mjs";
import { PortalRenderer } from "./PortalRenderer";

type Props = {
  reverse: boolean;
  reduced: boolean;
  host: RefObject<HTMLElement | null>;
  onProgress: (progress: number) => void;
};

export default function CinematicPortalTransition({
  reverse,
  reduced,
  host,
  onProgress,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const currentProgress = useRef(0);
  const notify = useRef(onProgress);
  notify.current = onProgress;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const surface = canvas.current;
    const context = !reduced
      ? surface?.getContext("2d", { alpha: true, desynchronized: true })
      : null;
    const renderer =
      context && surface ? new PortalRenderer(surface, context) : null;
    const gentle = reduced || !renderer;
    if (gentle) element.classList.add("portal-fallback");
    const duration = gentle ? REDUCED_DURATION : PORTAL_DURATION;
    const from = currentProgress.current;
    let frame = 0,
      start = performance.now(),
      elapsed = 0,
      last = 0,
      lastNotify = -100;
    let frames = 0,
      totalFrame = 0,
      maxFrame = 0,
      totalDraw = 0,
      done = false;
    const tick = (now: number) => {
      elapsed = Math.min(duration, now - start);
      const p = from + ((1 - from) * elapsed) / duration;
      currentProgress.current = p;
      const timeline = portalTimeline(p, reverse, gentle);
      const drawStart = performance.now();
      renderer?.draw(p, reverse);
      totalDraw += performance.now() - drawStart;
      // The animation owns frame-level transforms; React receives coarse state
      // progress and the final completion, avoiding a full app render at 60Hz.
      element.style.setProperty("--entry", String(timeline.entry));
      element.style.setProperty(
        "--portal-chrome",
        String(gentle ? 1 : timeline.chrome),
      );
      element.style.setProperty(
        "--portal-recede",
        String(gentle ? 0 : timeline.departure),
      );
      if (last) {
        const dt = now - last;
        totalFrame += dt;
        maxFrame = Math.max(maxFrame, dt);
      }
      last = now;
      frames++;
      if (elapsed - lastNotify >= 200 || p === 1) {
        lastNotify = elapsed;
        if (surface) {
          surface.dataset.progress = p.toFixed(3);
          surface.dataset.frames = String(frames);
        }
        notify.current(p);
      }
      if (p < 1) frame = requestAnimationFrame(tick);
      else {
        done = true;
        // Keep bounded aggregate diagnostics, never a growing per-frame log.
        element.dataset.portalFrames = String(frames);
        element.dataset.portalMeanFrame = (
          totalFrame / Math.max(1, frames - 1)
        ).toFixed(2);
        element.dataset.portalMaxFrame = maxFrame.toFixed(2);
        element.dataset.portalDrawMs = (
          totalDraw / Math.max(1, frames)
        ).toFixed(2);
        element.dataset.portalDuration = String(duration);
        element.focus({ preventScroll: true });
      }
    };
    const resize = () => {
      renderer?.resize();
      renderer?.draw(currentProgress.current, reverse);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !done) {
        start = performance.now() - elapsed;
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    if (!document.hidden) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      renderer?.dispose();
      element.classList.remove("portal-fallback");
      element.style.removeProperty("--portal-chrome");
      element.style.removeProperty("--portal-recede");
    };
  }, [reverse, reduced, host]);
  return (
    <canvas
      ref={canvas}
      className={`cinematic-portal ${reduced ? "reduced-portal" : ""}`}
      aria-hidden="true"
      onPointerDown={(e) => e.preventDefault()}
    />
  );
}
