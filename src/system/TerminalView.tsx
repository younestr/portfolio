import { useEffect, useRef, useState } from "react";
import { completeShell, HOME } from "./shell";
import type { ShellState, VirtualFS } from "./shell";
import type { MotionMode } from "../playgrounds/types";
export default function TerminalView({
  model,
  fs,
  onRun,
  motion,
  effect,
  onEffectDone,
  active,
}: {
  model: ShellState;
  fs: VirtualFS;
  onRun: (command: string) => void;
  motion: MotionMode;
  effect: string;
  onEffectDone: () => void;
  active: boolean;
}) {
  const [input, setInput] = useState(""),
    [cursor, setCursor] = useState(-1),
    [tick, setTick] = useState(0);
  const field = useRef<HTMLInputElement>(null),
    output = useRef<HTMLDivElement>(null),
    draft = useRef(""),
    completion = useRef({ base: "", items: [] as string[], index: 0 });
  useEffect(() => {
    if (active) field.current?.focus();
  }, [active]);
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [model.entries, tick]);
  useEffect(() => {
    if (!effect || !active) return;
    setTick(0);
    if (motion !== "full") {
      const timer = setTimeout(onEffectDone, 350);
      return () => clearTimeout(timer);
    }
    const timer = setInterval(() => setTick((n) => n + 1), 100),
      end = setTimeout(onEffectDone, 1600);
    return () => {
      clearInterval(timer);
      clearTimeout(end);
    };
  }, [effect, motion, active, onEffectDone]);
  const run = (command: string) => {
    onRun(command);
    setInput("");
    setCursor(-1);
    completion.current.items = [];
    queueMicrotask(() => field.current?.focus());
  };
  const suggestions = input
    ? completeShell(input, model.cwd, fs).slice(0, 6)
    : [];
  return (
    <div className="yt-terminal">
      <div
        ref={output}
        className="yt-terminal-output"
        role="log"
        aria-label="Terminal output"
      >
        <p className="yt-terminal-welcome">
          YT.OS / browser-local shell
          <br />
          <span>
            Type help. Paths, history and actions are simulated; no
            operating-system commands run.
          </span>
        </p>
        {model.entries.map((entry, index) => (
          <section
            className="yt-terminal-entry"
            key={`${index}-${entry.command}`}
          >
            <div className="yt-prompt">
              <span>younes@yt-os</span> {entry.cwd.replace(HOME, "~")} ${" "}
              <strong>{entry.command}</strong>
            </div>
            {entry.result.lines.map((line, i) => (
              <pre
                key={i}
                className={entry.result.error ? "yt-shell-error" : ""}
              >
                {line}
              </pre>
            ))}
            {entry.result.links && (
              <div className="yt-file-list">
                {entry.result.links.map((link) => (
                  <button
                    key={link.path}
                    onClick={() =>
                      run(
                        `${link.kind === "directory" ? "cd" : "cat"} ${JSON.stringify(link.path)}`,
                      )
                    }
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </section>
        ))}
        {effect === "matrix" && (
          <pre className="yt-matrix-egg" aria-label="Brief terminal signal">
            {Array.from({ length: 7 }, (_, row) =>
              Array.from({ length: 36 }, (_, column) =>
                row === (tick + column * 3) % 7
                  ? "01∴:·"[(column + tick) % 5]
                  : " ",
              ).join(""),
            ).join("\n")}
          </pre>
        )}
        {effect === "konami" && (
          <p className="yt-secret">
            [ curiosity noted / no extra lives required ]
          </p>
        )}
      </div>
      <form
        className="yt-terminal-input"
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
      >
        <label htmlFor="yt-shell-command">
          <span>younes@yt-os</span> {model.cwd.replace(HOME, "~")} $
        </label>
        <input
          ref={field}
          id="yt-shell-command"
          aria-label="Terminal command"
          value={input}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          onChange={(e) => {
            setInput(e.target.value);
            setCursor(-1);
            completion.current.items = [];
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (cursor < 0) draft.current = input;
              const next =
                cursor < 0 ? model.history.length - 1 : Math.max(0, cursor - 1);
              if (model.history[next] !== undefined) {
                setCursor(next);
                setInput(model.history[next]);
              }
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = cursor < 0 ? -1 : cursor + 1;
              if (next >= model.history.length || next < 0) {
                setCursor(-1);
                setInput(draft.current);
              } else {
                setCursor(next);
                setInput(model.history[next]);
              }
            }
            if (e.key === "Tab" && !e.shiftKey) {
              e.preventDefault();
              if (!completion.current.items.length)
                completion.current = {
                  base: input,
                  items: completeShell(input, model.cwd, fs),
                  index: 0,
                };
              const c = completion.current;
              if (c.items.length) {
                setInput(c.items[c.index % c.items.length]);
                c.index++;
              }
            }
          }}
        />
        <button type="submit">run ↵</button>
      </form>
      <div className="yt-shell-suggestions" aria-label="Shell suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              field.current?.focus();
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <small className="yt-shell-footnote">
        ↑ ↓ history · tab completion · ~ toggle shell · {model.count} command
        {model.count === 1 ? "" : "s"} executed
      </small>
    </div>
  );
}
