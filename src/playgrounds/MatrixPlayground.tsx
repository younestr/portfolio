import { useEffect, useMemo, useState } from "react";
import {
  applyTile,
  createMatrix,
  matrixSchedule,
  multiply,
  zeroMatrix,
} from "./matrixLogic";
import type { Matrix } from "./matrixLogic";
import { Metric, useStatus } from "./common";
import type { PlaygroundProps } from "./types";
export default function MatrixPlayground({
  motion,
  active,
  onStatus,
}: PlaygroundProps) {
  const [size, setSize] = useState(4),
    [tile, setTile] = useState(2),
    [mode, setMode] = useState<"naive" | "tiled">("tiled"),
    [index, setIndex] = useState(0),
    [C, setC] = useState<Matrix>(() => zeroMatrix(4)),
    [running, setRunning] = useState(false),
    [selected, setSelected] = useState([0, 0]);
  const A = useMemo(() => createMatrix(size), [size]),
    B = useMemo(() => createMatrix(size, 2), [size]),
    schedule = useMemo(
      () => matrixSchedule(size, tile, mode),
      [size, tile, mode],
    ),
    expected = useMemo(() => multiply(A, B), [A, B]),
    current = schedule[Math.max(0, index - 1)];
  useEffect(() => {
    if (motion === "off") setRunning(false);
  }, [motion]);
  const reset = () => {
    setRunning(false);
    setIndex(0);
    setC(zeroMatrix(size));
  };
  useEffect(() => {
    reset();
    setSelected([0, 0]);
  }, [size, tile, mode]);
  const advance = (count = 1) => {
    setC((previous) => {
      let next = previous;
      for (const event of schedule.slice(index, index + count))
        next = applyTile(next, A, B, event);
      return next;
    });
    setIndex((previous) => Math.min(schedule.length, previous + count));
  };
  useEffect(() => {
    if (!running || !active || motion === "off") return;
    if (index >= schedule.length) {
      setRunning(false);
      return;
    }
    const timer = setTimeout(
      () => advance(Math.max(1, Math.ceil(schedule.length / 35))),
      motion === "reduced" ? 220 : 100,
    );
    return () => clearTimeout(timer);
  }, [running, active, motion, index, schedule]);
  useStatus(
    running
      ? "matrix computing"
      : index === schedule.length
        ? "matrix complete"
        : "matrix paused",
    onStatus,
  );
  const render = (matrix: Matrix, name: string) => (
    <div className="yt-matrix-block">
      <h3>{name}</h3>
      <div
        className="yt-matrix"
        style={{ gridTemplateColumns: `repeat(${size},1fr)` }}
      >
        {matrix.flatMap((row, r) =>
          row.map((value, c) => {
            const highlight =
              name === "A"
                ? r === selected[0]
                : name === "B"
                  ? c === selected[1]
                  : r === selected[0] && c === selected[1];
            const loaded =
              index > 0 &&
              current &&
              (name === "A"
                ? current.rows.includes(r) && current.ks.includes(c)
                : name === "B"
                  ? current.ks.includes(r) && current.cols.includes(c)
                  : current.rows.includes(r) && current.cols.includes(c));
            return (
              <button
                key={`${r}-${c}`}
                className={`${highlight ? "selected" : ""} ${loaded ? "loaded" : ""}`}
                aria-label={`${name} row ${r + 1} column ${c + 1}: ${value}`}
                onClick={() =>
                  setSelected(
                    name === "A"
                      ? [r, selected[1]]
                      : name === "B"
                        ? [selected[0], c]
                        : [r, c],
                  )
                }
              >
                {value}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          CPU-SIDE EDUCATIONAL COMPUTATION / no CUDA execution or benchmark
        </p>
        <div className="yt-matrix-row">
          {render(A, "A")}
          <span>×</span>
          {render(B, "B")}
          <span>=</span>
          {render(C, "C")}
        </div>
        <pre className="yt-log">{`C[${selected[0] + 1}, ${selected[1] + 1}] = Σ A[${selected[0] + 1}, k] × B[k, ${selected[1] + 1}]\n${A[selected[0]].map((a, k) => `${a}×${B[k][selected[1]]}`).join(" + ")}\nCurrent partial sum: ${C[selected[0]][selected[1]]}\nCompleted dot product: ${expected[selected[0]][selected[1]]}`}</pre>
        <div className="yt-metrics">
          <Metric label="multiplications / full result" value={size ** 3} />
          <Metric
            label="mathematical additions"
            value={size * size * (size - 1)}
          />
          <Metric label="naive input loads · model" value={2 * size ** 3} />
          <Metric
            label="tiled input loads · model"
            value={(2 * size ** 3) / tile}
          />
        </div>
        <p className="yt-muted">
          Traffic model assumes square tiles divide N, each input tile is loaded
          once per output tile/K block, and ignores caches, output stores and
          hardware effects. It is not a measured speedup.
        </p>
        <p role="status" className="yt-result">
          {index === schedule.length
            ? `Complete · result ${JSON.stringify(C) === JSON.stringify(expected) ? "matches" : "does not match"} direct matrix multiplication`
            : `${index}/${schedule.length} compute steps · highlighted cells show the current input tile and output block`}
        </p>
      </div>
      <aside className="yt-controls">
        <h2>matrix controls</h2>
        <label>
          Matrix size
          <select
            aria-label="Matrix size"
            value={size}
            onChange={(e) => {
              const next = Number(e.target.value);
              setRunning(false);
              setSelected([0, 0]);
              setIndex(0);
              setC(zeroMatrix(next));
              setTile((t) => Math.min(t, next));
              setSize(next);
            }}
          >
            {[2, 4, 8].map((n) => (
              <option value={n} key={n}>
                {n} × {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tile size
          <select
            aria-label="Tile size"
            value={tile}
            onChange={(e) => setTile(Number(e.target.value))}
          >
            {[1, 2, 4]
              .filter((t) => t <= size)
              .map((t) => (
                <option key={t} value={t}>
                  {t} × {t}
                </option>
              ))}
          </select>
        </label>
        <label>
          Explanation
          <select
            aria-label="Multiplication mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "naive" | "tiled")}
          >
            <option value="tiled">Tiled / shared-memory concept</option>
            <option value="naive">Naive / scalar products</option>
          </select>
        </label>
        <div className="yt-button-row">
          <button
            className="yt-primary"
            disabled={motion === "off" || index === schedule.length}
            onClick={() => setRunning(!running)}
          >
            {running ? "pause" : "run computation"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              advance();
            }}
            disabled={index === schedule.length}
          >
            step →
          </button>
        </div>
        <button onClick={reset}>reset computation</button>
        <p className="yt-muted">
          Select a result cell to highlight its input row and column. Each step
          performs real multiply-accumulate work, grouped by the selected tile.
        </p>
        {motion === "off" && (
          <p className="yt-muted">Motion is off. Step remains available.</p>
        )}
      </aside>
    </div>
  );
}
