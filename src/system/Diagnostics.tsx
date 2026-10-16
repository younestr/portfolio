import { useEffect, useState } from "react";
export default function Diagnostics({
  started,
  values,
}: {
  started: number;
  values: Record<string, string | number>;
}) {
  const [uptime, setUptime] = useState(() =>
      Math.floor((performance.now() - started) / 1000),
    ),
    [samples, setSamples] = useState<number[]>([]);
  useEffect(() => {
    const timer = setInterval(
      () => setUptime(Math.floor((performance.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [started]);
  useEffect(() => {
    let id = 0,
      start = 0,
      count = 0;
    const frame = (time: number) => {
      if (!start) start = time;
      count++;
      if (time - start >= 750) {
        const fps = (count * 1000) / (time - start);
        setSamples((previous) => [...previous.slice(-29), fps]);
        count = 0;
        start = time;
      }
      id = requestAnimationFrame(frame);
    };
    const visibility = () => {
      cancelAnimationFrame(id);
      start = 0;
      count = 0;
      if (!document.hidden) id = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", visibility);
    if (!document.hidden) id = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const fps = samples.at(-1);
  return (
    <div className="yt-diagnostics">
      <div className="yt-diagnostic-heading">
        <span>OBSERVABLE RUNTIME / local session</span>
        <svg
          viewBox="0 0 180 32"
          role="img"
          aria-label="Recent measured animation frame rates"
        >
          <polyline
            points={samples
              .map(
                (sample, i) =>
                  `${i * 6},${30 - (Math.min(120, sample) / 120) * 28}`,
              )
              .join(" ")}
            fill="none"
          />
        </svg>
      </div>
      <dl>
        {Object.entries({
          ...values,
          uptime: `${uptime}s`,
          frameRate: fps === undefined ? "sampling…" : `~${fps.toFixed(1)} FPS`,
        }).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="yt-muted">
        FPS is sampled from actual requestAnimationFrame timestamps while this
        view is open. It reflects browser scheduling, not CPU/GPU utilization.
        Hidden tabs suspend sampling.
      </p>
    </div>
  );
}
