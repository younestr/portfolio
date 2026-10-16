import { useEffect, useMemo, useRef, useState } from "react";
import {
  initialVehicle,
  makeTrack,
  sensorDistance,
  stepVehicle,
} from "./vehicleLogic";
import type { Obstacle } from "./vehicleLogic";
import {
  Metric,
  Range,
  svgCoordinates,
  useSimulationClock,
  useStatus,
} from "./common";
import type { PlaygroundProps } from "./types";
export default function VehiclePlayground({
  motion,
  active,
  onStatus,
}: PlaygroundProps) {
  const track = useMemo(makeTrack, []),
    [vehicle, setVehicle] = useState(initialVehicle),
    [running, setRunning] = useState(false),
    [speed, setSpeed] = useState(45),
    [gain, setGain] = useState(1),
    [controller, setController] = useState<"basic" | "pursuit">("pursuit"),
    [sensors, setSensors] = useState(true),
    [obstacle, setObstacle] = useState<Obstacle>({
      x: 250,
      y: 160,
      radius: 16,
    }),
    [placing, setPlacing] = useState(false);
  const obstacleDrag = useRef(false),
    svg = useRef<SVGSVGElement>(null);
  const advance = (dt: number) =>
    setVehicle((previous) => {
      let next = previous;
      for (let t = 0; t < dt; t += 0.02)
        next = stepVehicle(
          next,
          Math.min(0.02, dt - t),
          { speed, gain, controller },
          track,
          obstacle,
        );
      return next;
    });
  useEffect(() => {
    if (motion === "off") setRunning(false);
  }, [motion]);
  useSimulationClock(running, active, motion, advance);
  useStatus(running ? vehicle.status : `paused · ${vehicle.status}`, onStatus);
  const position = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = svgCoordinates(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );
    return {
      x: Math.max(20, Math.min(480, point.x)),
      y: Math.max(20, Math.min(300, point.y)),
    };
  };
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          BICYCLE DYNAMICS / feedback control · click Place obstacle or drag it
        </p>
        <svg
          ref={svg}
          viewBox="0 0 500 320"
          className="yt-simulation"
          aria-label="Interactive autonomous vehicle course"
          onPointerDown={(e) => {
            if (placing) {
              setObstacle({ ...position(e), radius: 16 });
              setPlacing(false);
            }
          }}
          onPointerMove={(e) => {
            if (obstacleDrag.current)
              setObstacle({ ...position(e), radius: 16 });
          }}
          onPointerUp={() => {
            obstacleDrag.current = false;
          }}
          onPointerCancel={() => {
            obstacleDrag.current = false;
          }}
        >
          <ellipse cx="250" cy="160" rx="170" ry="100" className="yt-road" />
          <ellipse
            cx="250"
            cy="160"
            rx="170"
            ry="100"
            className="yt-track-center"
          />
          {track
            .filter((_, i) => i % 10 === 0)
            .map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" className="yt-waypoint" />
            ))}
          <path d="M250 42l8 14h-16Z" className="yt-road-sign" />
          <text x="265" y="53">
            COURSE / CW
          </text>
          <circle
            cx={obstacle.x}
            cy={obstacle.y}
            r={obstacle.radius}
            className="yt-obstacle"
            role="button"
            tabIndex={0}
            aria-label="Obstacle; arrow keys move it"
            onPointerDown={(e) => {
              e.stopPropagation();
              obstacleDrag.current = true;
              svg.current?.setPointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              const moves: Record<string, number[]> = {
                ArrowLeft: [-5, 0],
                ArrowRight: [5, 0],
                ArrowUp: [0, -5],
                ArrowDown: [0, 5],
              };
              if (moves[e.key]) {
                e.preventDefault();
                setObstacle({
                  ...obstacle,
                  x: obstacle.x + moves[e.key][0],
                  y: obstacle.y + moves[e.key][1],
                });
              }
            }}
          />
          {sensors &&
            [-0.5, -0.25, 0, 0.25, 0.5].map((angle) => {
              const d = sensorDistance(vehicle, obstacle, angle);
              return (
                <line
                  key={angle}
                  x1={vehicle.x}
                  y1={vehicle.y}
                  x2={vehicle.x + Math.cos(vehicle.heading + angle) * d}
                  y2={vehicle.y + Math.sin(vehicle.heading + angle) * d}
                  className={d < 90 ? "yt-sensor hit" : "yt-sensor"}
                />
              );
            })}
          <g
            transform={`translate(${vehicle.x},${vehicle.y}) rotate(${(vehicle.heading * 180) / Math.PI})`}
          >
            <rect
              x="-10"
              y="-6"
              width="20"
              height="12"
              rx="2"
              className="yt-car"
            />
            <path d="M3 -4L9 0L3 4" className="yt-car-heading" />
          </g>
          <text x="20" y="300">
            {placing
              ? "CLICK A POSITION FOR THE OBSTACLE"
              : vehicle.status.toUpperCase()}
          </text>
        </svg>
        <div className="yt-metrics">
          <Metric
            label="steering angle"
            value={`${((vehicle.steering * 180) / Math.PI).toFixed(1)}°`}
          />
          <Metric
            label="speed / units per s"
            value={vehicle.speed.toFixed(1)}
          />
          <Metric
            label="lateral error / units"
            value={vehicle.error.toFixed(2)}
          />
          <Metric
            label="distance traveled"
            value={vehicle.distance.toFixed(1)}
          />
        </div>
        <pre className="yt-log">{`controller = ${controller}\nstate = ${vehicle.status}\nwheelbase = 18 canvas units\nheading = ${((vehicle.heading * 180) / Math.PI).toFixed(1)}°\nforward sensor = ${sensorDistance(vehicle, obstacle, 0).toFixed(1)} units`}</pre>
      </div>
      <aside className="yt-controls">
        <h2>controller parameters</h2>
        <label>
          Controller
          <select
            aria-label="Vehicle controller"
            value={controller}
            onChange={(e) =>
              setController(e.target.value as "basic" | "pursuit")
            }
          >
            <option value="basic">Basic heading follower</option>
            <option value="pursuit">Pure-pursuit controller</option>
          </select>
        </label>
        <Range
          label="Vehicle speed"
          min={15}
          max={100}
          value={speed}
          onChange={setSpeed}
        />
        <Range
          label="Steering sensitivity"
          min={0.3}
          max={2.5}
          step={0.1}
          value={gain}
          onChange={setGain}
        />
        <div className="yt-button-row">
          <button
            className="yt-primary"
            disabled={motion === "off"}
            onClick={() => setRunning(!running)}
          >
            {running ? "stop navigation" : "start navigation"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              advance(0.2);
            }}
          >
            step 0.2s
          </button>
        </div>
        <label className="yt-check">
          <input
            type="checkbox"
            checked={sensors}
            onChange={(e) => setSensors(e.target.checked)}
          />{" "}
          sensor rays
        </label>
        <button aria-pressed={placing} onClick={() => setPlacing(!placing)}>
          {placing ? "cancel placement" : "place obstacle"}
        </button>
        <button
          onClick={() => {
            setVehicle(initialVehicle());
            setRunning(false);
            setObstacle({ x: 250, y: 160, radius: 16 });
            setSpeed(45);
            setGain(1);
            setController("pursuit");
            setPlacing(false);
          }}
        >
          reset course
        </button>
        <p className="yt-muted">
          Steering follows actual waypoints. Circle-intersection sensors brake
          for obstacles. Excessive tracking error or contact produces an
          explicit failure state; reset to retry.
        </p>
        {motion === "off" && (
          <p className="yt-muted">
            Motion is off. Step through the controller manually.
          </p>
        )}
      </aside>
    </div>
  );
}
