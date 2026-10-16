import { useEffect, useMemo, useState } from "react";
import { agentExecution, scenarios } from "./agentLogic";
import { Metric, useStatus } from "./common";
import type { PlaygroundProps } from "./types";
export default function AgentPlayground({
  motion,
  active,
  onStatus,
}: PlaygroundProps) {
  const [scenarioIndex, setScenarioIndex] = useState(0),
    [step, setStep] = useState(-1),
    [playing, setPlaying] = useState(false);
  const scenario = scenarios[scenarioIndex],
    execution = useMemo(() => agentExecution(scenario), [scenario]);
  useEffect(() => {
    if (motion === "off") setPlaying(false);
  }, [motion]);
  useStatus(
    playing
      ? "workflow running"
      : step === 5
        ? "workflow complete"
        : "workflow paused",
    onStatus,
  );
  useEffect(() => {
    if (!playing || !active || motion === "off") return;
    if (step >= 5) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => setStep((s) => Math.min(5, s + 1)),
      motion === "reduced" ? 1000 : 700,
    );
    return () => clearTimeout(timer);
  }, [playing, active, motion, step]);
  return (
    <div className="yt-lab-grid">
      <div>
        <p className="yt-lab-caption">
          DETERMINISTIC WORKFLOW / fictional Demo Works dataset · no live LLM
        </p>
        <div
          className="yt-agent-pipeline"
          role="group"
          aria-label="Agent execution stages"
        >
          {execution.stages.map((stage, i) => (
            <button
              key={stage.title}
              className={i === step ? "active" : i < step ? "complete" : ""}
              onClick={() => {
                setPlaying(false);
                setStep(i);
              }}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              {stage.title}
              <span>{i <= step ? "✓" : "·"}</span>
            </button>
          ))}
        </div>
        <p className="yt-request">{scenario.request}</p>
        <div className="yt-agent-logs" aria-live="polite">
          {step < 0 ? (
            <p className="yt-muted">
              Choose Play or Step to inspect the workflow.
            </p>
          ) : (
            execution.stages.slice(0, step + 1).map((stage, i) => (
              <section key={stage.title}>
                <h3>
                  {String(i + 1).padStart(2, "0")} / {stage.title}
                </h3>
                <pre className="yt-log">{stage.log}</pre>
              </section>
            ))
          )}
        </div>
        {step >= 4 && (
          <div className="yt-evaluation">
            {execution.checks.map((check) => (
              <span key={check.label} className={check.pass ? "pass" : "fail"}>
                {check.pass ? "PASS" : "FAIL"} · {check.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <aside className="yt-controls">
        <h2>execution controls</h2>
        <label>
          Sample scenario
          <select
            aria-label="Sample scenario"
            value={scenarioIndex}
            onChange={(e) => {
              setScenarioIndex(Number(e.target.value));
              setStep(-1);
              setPlaying(false);
            }}
          >
            {scenarios.map((s, i) => (
              <option key={s.id} value={i}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <div className="yt-button-row">
          <button
            className="yt-primary"
            disabled={motion === "off" || step === 5}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? "pause" : "play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(5, s + 1));
            }}
            disabled={step === 5}
          >
            step →
          </button>
        </div>
        <button
          onClick={() => {
            setStep(-1);
            setPlaying(false);
          }}
        >
          restart workflow
        </button>
        <Metric label="stage" value={`${Math.max(0, step + 1)} / 6`} />
        <h2>retrieval sources</h2>
        {execution.sources.map((source) => (
          <details key={source.id}>
            <summary>{source.id}</summary>
            <p>{source.text}</p>
          </details>
        ))}
        <p className="yt-muted">
          Tools return deterministic sample records. Evaluation checks source
          IDs, required computed facts and fictional scope. Logs show
          operations, not a live model’s reasoning.
        </p>
        {motion === "off" && (
          <p className="yt-muted">
            Motion is off. Use Step for manual execution.
          </p>
        )}
      </aside>
    </div>
  );
}
