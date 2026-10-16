import { useMemo, useRef, useState } from "react";
import { depot, fleetSeed, solveFleet } from "./fleetLogic";
import { Metric, Range, useStatus, svgCoordinates } from "./common";
import type { PlaygroundProps } from "./types";
export default function FleetPlayground({ motion, onStatus }: PlaygroundProps) {
  const [nodes, setNodes] = useState(fleetSeed),
    [vehicles, setVehicles] = useState(3),
    [capacity, setCapacity] = useState(9),
    [selected, setSelected] = useState(1),
    [optimized, setOptimized] = useState(false),
    [baselineVisible, setBaselineVisible] = useState(true);
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<number | null>(null);
  const solution = useMemo(
    () => solveFleet(nodes, vehicles, capacity),
    [nodes, vehicles, capacity],
  );
  const plan = optimized ? solution.improved : solution.baseline;
  useStatus(
    `${optimized ? "heuristic" : "naive"} · ${plan.violations ? "infeasible" : "feasible"}`,
    onStatus,
  );
  const selectedNode = nodes.find((n) => n.id === selected);
  const path = (ids: number[]) =>
    [depot, ...ids.map((id) => nodes.find((n) => n.id === id)!), depot]
      .map((n, i) => `${i ? "L" : "M"}${n.x} ${n.y}`)
      .join(" ");
  const move = (id: number, x: number, y: number) =>
    setNodes((current) =>
      current.map((n) =>
        n.id === id
          ? {
              ...n,
              x: Math.max(20, Math.min(480, x)),
              y: Math.max(20, Math.min(300, y)),
            }
          : n,
      ),
    );
  const reset = () => {
    setNodes(fleetSeed());
    setVehicles(3);
    setCapacity(9);
    setSelected(1);
    setOptimized(false);
  };
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          CAPACITY-AWARE ROUTING / drag a stop or use its arrow keys
        </p>
        <svg
          ref={svg}
          viewBox="0 0 500 320"
          className="yt-simulation"
          aria-label="Interactive delivery network"
          onPointerMove={(e) => {
            if (drag.current === null || !svg.current) return;
            const point = svgCoordinates(svg.current, e.clientX, e.clientY);
            move(drag.current, point.x, point.y);
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <defs>
            <pattern
              id="fleet-grid"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <path d="M25 0H0V25" />
            </pattern>
          </defs>
          <rect
            width="500"
            height="320"
            fill="url(#fleet-grid)"
            className="yt-grid"
          />
          {optimized &&
            baselineVisible &&
            solution.baseline.routes.map((route) => (
              <path
                key={route.vehicle}
                d={path(route.stops)}
                className="yt-naive-route"
              />
            ))}
          {plan.routes.map((route) => (
            <g key={route.vehicle}>
              <path
                d={path(route.stops)}
                className={`yt-route route-${route.vehicle % 3}`}
              />
              <circle
                r="4"
                className={`yt-truck route-${route.vehicle % 3}`}
                cx={motion === "full" ? undefined : depot.x + route.vehicle * 8}
                cy={motion === "full" ? undefined : depot.y + 10}
              >
                {motion === "full" && (
                  <animateMotion
                    key={path(route.stops)}
                    path={path(route.stops)}
                    dur={`${6 + route.vehicle * 2}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            </g>
          ))}
          <rect
            x={depot.x - 6}
            y={depot.y - 6}
            width="12"
            height="12"
            className="yt-depot"
          />
          <text x={depot.x + 11} y={depot.y + 3}>
            DEPOT
          </text>
          {nodes.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.id === selected ? 8 : 5}
                className={`yt-stop ${plan.unassigned.includes(n.id) ? "unassigned" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Delivery ${n.id}, demand ${n.demand}`}
                onFocus={() => setSelected(n.id)}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setSelected(n.id);
                  drag.current = n.id;
                  svg.current?.setPointerCapture(e.pointerId);
                }}
                onKeyDown={(e) => {
                  const offsets: Record<string, number[]> = {
                    ArrowLeft: [-5, 0],
                    ArrowRight: [5, 0],
                    ArrowUp: [0, -5],
                    ArrowDown: [0, 5],
                  };
                  if (offsets[e.key]) {
                    e.preventDefault();
                    move(
                      n.id,
                      n.x + offsets[e.key][0],
                      n.y + offsets[e.key][1],
                    );
                  }
                }}
              />
              <text x={n.x + 10} y={n.y - 8}>
                {n.id} / {n.demand}u
              </text>
            </g>
          ))}
        </svg>
        <div className="yt-metrics">
          <Metric
            label="distance / canvas units"
            value={plan.distance.toFixed(1)}
          />
          <Metric
            label="vehicles used"
            value={`${plan.vehiclesUsed}/${vehicles}`}
          />
          <Metric label="unassigned / violations" value={plan.violations} />
          <Metric label="stops" value={nodes.length} />
        </div>
        <p
          className={plan.violations ? "yt-warning" : "yt-muted"}
          role="status"
        >
          {plan.violations
            ? `Infeasible: stops ${plan.unassigned.join(", ")} cannot be assigned with these vehicles and capacities.`
            : `All demands fit. ${optimized ? "Nearest-neighbor / 2-opt heuristic; not an exact optimum." : "Naive capacity-aware assignment in input order."}`}
        </p>
        <pre className="yt-log">
          {plan.routes
            .map(
              (route) =>
                `V${route.vehicle} · load ${route.load}/${capacity} · ${route.distance.toFixed(1)} units · depot → ${route.stops.join(" → ")} → depot`,
            )
            .join("\n")}
        </pre>
      </div>
      <aside className="yt-controls">
        <h2>route constraints</h2>
        <Range
          label="Vehicles"
          min={1}
          max={6}
          value={vehicles}
          onChange={setVehicles}
        />
        <Range
          label="Vehicle capacity"
          min={2}
          max={16}
          value={capacity}
          onChange={setCapacity}
        />
        {selectedNode && (
          <Range
            label={`Demand · stop ${selected}`}
            min={1}
            max={12}
            value={selectedNode.demand}
            onChange={(demand) =>
              setNodes(
                nodes.map((n) => (n.id === selected ? { ...n, demand } : n)),
              )
            }
          />
        )}
        <div className="yt-button-row">
          <button
            onClick={() => {
              const id = Math.max(0, ...nodes.map((n) => n.id)) + 1;
              setNodes([
                ...nodes,
                {
                  id,
                  x: 40 + ((id * 67) % 420),
                  y: 30 + ((id * 53) % 260),
                  demand: 2,
                },
              ]);
              setSelected(id);
            }}
            disabled={nodes.length >= 18}
          >
            + add stop
          </button>
          <button
            onClick={() => {
              setNodes(nodes.filter((n) => n.id !== selected));
              setSelected(nodes.find((n) => n.id !== selected)?.id ?? 0);
            }}
            disabled={!selectedNode || nodes.length <= 1}
          >
            − remove
          </button>
        </div>
        <button className="yt-primary" onClick={() => setOptimized(true)}>
          run route heuristic
        </button>
        <button onClick={() => setOptimized(false)}>
          show naive assignment
        </button>
        <label className="yt-check">
          <input
            type="checkbox"
            checked={baselineVisible}
            onChange={(e) => setBaselineVisible(e.target.checked)}
          />{" "}
          compare baseline
        </label>
        <Metric
          label="naive distance"
          value={solution.baseline.distance.toFixed(1)}
        />
        <Metric
          label="heuristic distance"
          value={solution.improved.distance.toFixed(1)}
        />
        <Metric
          label="distance improvement"
          value={
            solution.baseline.violations || solution.improved.violations
              ? "n/a · infeasible"
              : `${(((solution.baseline.distance - solution.improved.distance) / solution.baseline.distance) * 100).toFixed(1)}%`
          }
        />
        <button onClick={reset}>reset network</button>
        <p className="yt-muted">
          Each stop is served once. Routes start and end at the depot. Capacity
          and fleet limits are enforced.
        </p>
      </aside>
    </div>
  );
}
