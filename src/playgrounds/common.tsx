import { useEffect, useRef } from "react";
import type { MotionMode } from "./types";
export function useSimulationClock(
  running: boolean,
  active: boolean,
  motion: MotionMode,
  step: (dt: number) => void,
) {
  const callback = useRef(step);
  callback.current = step;
  useEffect(() => {
    if (!running || !active || motion === "off") return;
    let id = 0,
      last = 0,
      accumulated = 0;
    const tick = (time: number) => {
      if (last) accumulated += Math.min(0.1, (time - last) / 1000);
      last = time;
      const interval = motion === "reduced" ? 0.2 : 1 / 30;
      if (accumulated >= interval) {
        const delta = accumulated;
        accumulated = 0;
        callback.current(delta);
      }
      id = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(id);
      last = 0;
      accumulated = 0;
      if (!document.hidden) id = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", visibility);
    if (!document.hidden) id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [running, active, motion]);
}
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  return (
    <label className="yt-control">
      <span>
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="yt-metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
export function useStatus(status: string, report: (value: string) => void) {
  useEffect(() => {
    report(status);
  }, [status, report]);
}

// Use the SVG transform rather than its outer rectangle: responsive layouts
// can letterbox the viewBox, which otherwise makes dragged objects jump.
export function svgCoordinates(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
) {
  const transform = svg.getScreenCTM();
  if (!transform) return { x: 0, y: 0 };
  return new DOMPoint(clientX, clientY).matrixTransform(transform.inverse());
}
