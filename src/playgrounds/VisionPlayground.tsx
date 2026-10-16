import { useMemo, useState } from "react";
import {
  attention,
  faceLandmarks,
  gazeAngles,
  syntheticConfidence,
} from "./visionLogic";
import type { DriverState } from "./visionLogic";
import { Metric, Range, useStatus, svgCoordinates } from "./common";
import type { PlaygroundProps } from "./types";
export default function VisionPlayground({ onStatus }: PlaygroundProps) {
  const [yaw, setYaw] = useState(0),
    [pitch, setPitch] = useState(0),
    [threshold, setThreshold] = useState(0.6),
    [closed, setClosed] = useState(false),
    [landmarks, setLandmarks] = useState(true),
    [boxes, setBoxes] = useState(true),
    [gaze, setGaze] = useState({ yaw: 0, pitch: 0 }),
    [preset, setPreset] = useState<DriverState>("attentive");
  const points = useMemo(() => faceLandmarks(yaw, pitch), [yaw, pitch]),
    confidence = syntheticConfidence(yaw, pitch, closed),
    detected = confidence >= threshold,
    state = attention(yaw, pitch, closed, threshold);
  useStatus(`synthetic pose · ${state}`, onStatus);
  const choose = (value: DriverState) => {
    setPreset(value);
    setYaw(value === "left" ? -35 : value === "right" ? 35 : 0);
    setPitch(value === "down" ? 32 : 0);
    setClosed(value === "closed");
  };
  const bounds = {
    left: Math.min(...points.map((p) => p.x)) - 12,
    right: Math.max(...points.map((p) => p.x)) + 12,
    top: Math.min(...points.map((p) => p.y)) - 12,
    bottom: Math.max(...points.map((p) => p.y)) + 12,
  };
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          SYNTHETIC DRIVER MONITORING / no webcam, no AI model
        </p>
        <svg
          viewBox="0 0 480 300"
          className="yt-simulation"
          aria-label="Synthetic face landmarks and gaze"
          onPointerMove={(e) => {
            const point = svgCoordinates(e.currentTarget, e.clientX, e.clientY);
            setGaze(
              gazeAngles(
                Math.max(0, Math.min(1, point.x / 480)),
                Math.max(0, Math.min(1, point.y / 300)),
              ),
            );
          }}
        >
          <path
            d="M20 45V20H45 M435 20H460V45 M20 255V280H45 M435 280H460V255"
            className="yt-frame"
          />
          <text x="24" y="38">
            LOCAL / SYNTHETIC INPUT
          </text>
          <path d="M240 30V270 M100 145H380" className="yt-guide" />
          {detected ? (
            <>
              <polygon
                points={points
                  .slice(0, 24)
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                className="yt-face"
              />
              {landmarks && (
                <g className="yt-landmarks">
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="2" />
                      {i < 24 && (
                        <line
                          x1={p.x}
                          y1={p.y}
                          x2={points[28].x}
                          y2={points[28].y}
                        />
                      )}
                    </g>
                  ))}
                </g>
              )}
              {boxes && (
                <rect
                  x={bounds.left}
                  y={bounds.top}
                  width={bounds.right - bounds.left}
                  height={bounds.bottom - bounds.top}
                  className="yt-detection"
                />
              )}
              <path
                d={
                  closed
                    ? `M${points[24].x} ${points[24].y}H${points[25].x} M${points[26].x} ${points[26].y}H${points[27].x}`
                    : `M${points[24].x} ${points[24].y}Q${points[25].x} ${points[25].y - 8} ${points[25].x + 5} ${points[25].y} M${points[26].x - 5} ${points[26].y}Q${points[26].x} ${points[26].y - 8} ${points[27].x} ${points[27].y}`
                }
                className="yt-eyes"
              />
              <line
                x1={points[28].x}
                y1={points[28].y}
                x2={points[28].x + Math.sin((gaze.yaw * Math.PI) / 180) * 90}
                y2={points[28].y + Math.sin((gaze.pitch * Math.PI) / 180) * 90}
                className="yt-gaze"
              />
              <line
                x1="240"
                y1="250"
                x2={240 + Math.sin((yaw * Math.PI) / 180) * 65}
                y2={250 - Math.cos((pitch * Math.PI) / 180) * 40}
                className="yt-pose"
              />
            </>
          ) : (
            <text x="130" y="145">
              NO DETECTION ABOVE THRESHOLD
            </text>
          )}
          <text x="24" y="274">
            {state.toUpperCase()}
          </text>
        </svg>
        <div className="yt-metrics">
          <Metric label="head yaw" value={`${yaw}°`} />
          <Metric label="head pitch" value={`${pitch}°`} />
          <Metric
            label="synthetic confidence"
            value={`${(confidence * 100).toFixed(1)}%`}
          />
          <Metric
            label="gaze / yaw, pitch"
            value={`${gaze.yaw.toFixed(0)}°, ${gaze.pitch.toFixed(0)}°`}
          />
        </div>
        <pre className="yt-log">
          {JSON.stringify(
            {
              input: "synthetic",
              yaw,
              pitch,
              eyes: closed ? "closed" : "open",
              threshold,
              attention: state,
            },
            null,
            2,
          )}
        </pre>
      </div>
      <aside className="yt-controls">
        <h2>pose controls</h2>
        <label>
          Driver preset
          <select
            aria-label="Driver preset"
            value={preset}
            onChange={(e) => choose(e.target.value as DriverState)}
          >
            <option value="attentive">Attentive</option>
            <option value="left">Looking left</option>
            <option value="right">Looking right</option>
            <option value="down">Looking down</option>
            <option value="closed">Eyes closed</option>
          </select>
        </label>
        <Range
          label="Head yaw"
          min={-60}
          max={60}
          value={yaw}
          onChange={setYaw}
          unit="°"
        />
        <Range
          label="Head pitch"
          min={-35}
          max={50}
          value={pitch}
          onChange={setPitch}
          unit="°"
        />
        <Range
          label="Confidence threshold"
          min={0.3}
          max={0.99}
          step={0.01}
          value={threshold}
          onChange={setThreshold}
        />
        <label className="yt-check">
          <input
            type="checkbox"
            checked={landmarks}
            onChange={(e) => setLandmarks(e.target.checked)}
          />{" "}
          landmarks
        </label>
        <label className="yt-check">
          <input
            type="checkbox"
            checked={boxes}
            onChange={(e) => setBoxes(e.target.checked)}
          />{" "}
          bounding box
        </label>
        <button
          onClick={() => {
            choose("attentive");
            setThreshold(0.6);
            setGaze({ yaw: 0, pitch: 0 });
            setLandmarks(true);
            setBoxes(true);
          }}
        >
          reset model
        </button>
        <p className="yt-muted">
          Move over the frame to change gaze. Landmarks use a rotated 3D face
          scaffold. Confidence is a documented synthetic rule, not measured
          model accuracy.
        </p>
      </aside>
    </div>
  );
}
