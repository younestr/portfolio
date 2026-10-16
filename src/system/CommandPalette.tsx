import { useEffect, useMemo, useRef, useState } from "react";
import { searchActions } from "./actions";
import type { ActionDescriptor } from "./actions";
export default function CommandPalette({
  actions,
  recent,
  projectId,
  invoke,
}: {
  actions: ActionDescriptor[];
  recent: string[];
  projectId: string;
  invoke: (id: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(0),
    input = useRef<HTMLInputElement>(null);
  const results = useMemo(
    () => searchActions(actions, query, recent, projectId),
    [actions, query, recent, projectId],
  );
  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    document
      .getElementById(`yt-action-${selected}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  return (
    <div className="yt-palette">
      <input
        ref={input}
        className="yt-palette-input"
        role="combobox"
        aria-label="Find an action"
        aria-expanded="true"
        aria-controls="yt-action-results"
        aria-activedescendant={
          results.length ? `yt-action-${selected}` : undefined
        }
        placeholder="Find an action, project or playground…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(0);
        }}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            setSelected((i) =>
              results.length
                ? (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                  results.length
                : 0,
            );
          }
          if (e.key === "Enter") {
            e.preventDefault();
            if (results[selected]) invoke(results[selected].id);
          }
        }}
      />
      <div
        id="yt-action-results"
        role="listbox"
        aria-label="Available actions"
        className="yt-action-results"
      >
        {!results.length && (
          <p className="yt-muted">No action matches that query.</p>
        )}
        {results.map((action, i) => (
          <button
            id={`yt-action-${i}`}
            key={action.id}
            role="option"
            aria-selected={selected === i}
            tabIndex={-1}
            className={selected === i ? "selected" : ""}
            onPointerMove={() => setSelected(i)}
            onClick={() => invoke(action.id)}
          >
            <small>
              {action.category}
              {recent.includes(action.id) ? " · recent" : ""}
            </small>
            <span>{action.label}</span>
            <kbd>{action.shortcut ?? (selected === i ? "↵" : "")}</kbd>
          </button>
        ))}
      </div>
      <small className="yt-palette-hint">
        ↑ ↓ navigate · enter execute · esc return · results include
        current-project and recent actions
      </small>
    </div>
  );
}
