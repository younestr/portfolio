import { useEffect, useState } from "react";
import { advanceLine, initialLine, injectProduct } from "./inspectionLogic";
import type { DefectKind } from "./inspectionLogic";
import { Metric, Range, useSimulationClock, useStatus } from "./common";
import type { PlaygroundProps } from "./types";
export default function InspectionPlayground({
  motion,
  active,
  onStatus,
}: PlaygroundProps) {
  const [line, setLine] = useState(initialLine),
    [running, setRunning] = useState(false),
    [speed, setSpeed] = useState(85),
    [threshold, setThreshold] = useState(0.75),
    [overlays, setOverlays] = useState(true),
    [defect, setDefect] = useState<DefectKind>("crack");
  const advance = (dt: number) =>
    setLine((state) => advanceLine(state, dt, speed, threshold));
  useEffect(() => {
    if (motion === "off") setRunning(false);
  }, [motion]);
  useSimulationClock(running, active, motion, advance);
  useStatus(
    running ? "inspection line running" : "inspection line paused",
    onStatus,
  );
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          SYNTHETIC INSPECTION / deterministic features · no YOLO model running
        </p>
        <svg
          viewBox="0 0 640 300"
          className="yt-simulation"
          aria-label="Interactive inspection conveyor"
        >
          <path d="M10 177H630M10 211H630" className="yt-conveyor" />
          {Array.from({ length: 25 }, (_, i) => (
            <circle
              key={i}
              cx={15 + i * 25}
              cy="194"
              r="7"
              className="yt-roller"
            />
          ))}
          <rect
            x="230"
            y="75"
            width="100"
            height="120"
            className="yt-camera-region"
          />
          <path d="M259 25H298V48H259ZM278 48V74" className="yt-camera" />
          <text x="233" y="67">
            CAMERA / x=270
          </text>
          <line
            x1="480"
            y1="130"
            x2="480"
            y2="245"
            className="yt-decision-gate"
          />
          <text x="458" y="120">
            GATE
          </text>
          <text x="548" y="151">
            accept →
          </text>
          <text x="540" y="269">
            reject ↘
          </text>
          {line.products.map((product) => {
            const y =
              product.inspection?.reject && product.x > 480
                ? 167 + Math.min(73, (product.x - 480) * 0.45)
                : 167;
            const f = product.features;
            return (
              <g key={product.id} transform={`translate(${product.x},${y})`}>
                <path
                  d={
                    f.shape > 0.55
                      ? "M-20 0Q-18-28 3-13Q21-35 24 0Z"
                      : "M-20 0Q-19-28 0-27Q21-27 22 0Z"
                  }
                  className="yt-product"
                />
                {f.crack > 0.55 && (
                  <path
                    d="M-4-21L3-15L-2-10L6-3"
                    className="yt-defect-feature"
                  />
                )}
                {f.stain > 0.55 && (
                  <>
                    <circle cx="-7" cy="-12" r="4" className="yt-stain" />
                    <circle cx="5" cy="-18" r="3" className="yt-stain" />
                  </>
                )}
                {overlays && product.inspection && (
                  <>
                    <rect
                      x="-25"
                      y="-33"
                      width="52"
                      height="39"
                      className={
                        product.inspection.reject
                          ? "yt-box-reject"
                          : "yt-box-accept"
                      }
                    />
                    <text x="-23" y="-40">
                      {product.inspection.reject
                        ? product.inspection.label
                        : "PASS"}
                    </text>
                  </>
                )}
                <text x="-12" y="18">
                  #{product.id}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="yt-metrics">
          <Metric label="products inspected" value={line.inspected} />
          <Metric label="accepted at gate" value={line.accepted} />
          <Metric label="rejected at gate" value={line.rejected} />
          <Metric
            label="throughput / sim min"
            value={
              line.elapsed > 0
                ? ((line.inspected / line.elapsed) * 60).toFixed(1)
                : "0.0"
            }
          />
        </div>
        <pre className="yt-log">{`rule: max(crack, shape, stain) >= 0.55\nconfidence = 0.55 + 0.44 × severity\nreject only if rule matches and confidence >= ${threshold.toFixed(2)}\nlast simulated confidence: ${(line.lastConfidence * 100).toFixed(1)}%\nsimulation elapsed: ${line.elapsed.toFixed(1)}s\n${line.inspected - line.accepted - line.rejected} inspected product(s) still before the gate`}</pre>
      </div>
      <aside className="yt-controls">
        <h2>inspection controls</h2>
        <Range
          label="Conveyor speed"
          min={20}
          max={140}
          value={speed}
          onChange={setSpeed}
        />
        <Range
          label="Detection threshold"
          min={0.5}
          max={0.99}
          step={0.01}
          value={threshold}
          onChange={setThreshold}
        />
        <label>
          Injected defect
          <select
            aria-label="Injected defect"
            value={defect}
            onChange={(e) => setDefect(e.target.value as DefectKind)}
          >
            <option value="crack">Crack</option>
            <option value="shape">Deformation</option>
            <option value="stain">Contamination</option>
          </select>
        </label>
        <button
          onClick={() => setLine((state) => injectProduct(state, defect))}
        >
          inject defective product
        </button>
        <div className="yt-button-row">
          <button
            className="yt-primary"
            disabled={motion === "off"}
            onClick={() => setRunning(!running)}
          >
            {running ? "pause conveyor" : "start conveyor"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              advance(1);
            }}
          >
            step 1s
          </button>
        </div>
        <label className="yt-check">
          <input
            type="checkbox"
            checked={overlays}
            onChange={(e) => setOverlays(e.target.checked)}
          />{" "}
          detection overlays
        </label>
        <button
          onClick={() => {
            setLine(initialLine());
            setRunning(false);
          }}
        >
          reset line & counters
        </button>
        <p className="yt-muted">
          Features are fixed at product creation. Thresholds affect detection
          decisions, not the underlying defects. A high threshold can let
          defects pass. Counters update at the camera and gate respectively.
        </p>
        {motion === "off" && (
          <p className="yt-muted">
            Motion is off. Step advances the line manually.
          </p>
        )}
      </aside>
    </div>
  );
}
