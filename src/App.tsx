import { useEffect, useReducer, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { commands, profile, snippets, themes } from "./content";
import { initialState, navigationReducer } from "./navigation.mjs";
import {
  projectRegistry as projects,
  registryScenes as projectScenes,
} from "./system/projects";
import YTEnvironment, {
  isSystemCommand,
  systemColonCommands,
} from "./system/YTEnvironment";
import type { EnvironmentHandle } from "./system/YTEnvironment";
import { useMotionPreference } from "./system/useMotionPreference";
import "./system/system.css";
import { useTyping } from "./TypingEngine";
import KeyboardVisualizer from "./KeyboardVisualizer";
import ContentBuffer from "./ContentBuffer";
import ProjectRail from "./ProjectRail";
import ProjectVisual from "./ProjectVisual";
import CinematicPortalTransition from "./CinematicPortalTransition";
import { portalTimeline } from "./portal.mjs";

function Highlight({ text }: { text: string }) {
  const tokens = text.split(
    /("[^"\n]*"|'[^'\n]*'|#[^\n]*|\/\/[^\n]*|\b(?:class|def|return|from|import|async|await|for|in|if|not|and|continue|export|interface|type|throw|new|const|void|int)\b|\b\d+(?:\.\d+)?\b)/g,
  );
  return (
    <>
      {tokens.map((t, i) => (
        <span
          key={i}
          className={
            t.startsWith("#") || t.startsWith("//")
              ? "comment"
              : /^['"]/.test(t)
                ? "string"
                : /^(class|def|return|from|import|async|await|for|in|if|not|and|continue|export|interface|type|throw|new|const|void|int)$/.test(
                      t,
                    )
                  ? "keyword"
                  : /^\d/.test(t)
                    ? "number"
                    : ""
          }
        >
          {t}
        </span>
      ))}
    </>
  );
}
function Code({ text }: { text: string }) {
  return (
    <div className="code-buffer">
      {text.split("\n").map((line, i) => (
        <div className="code-line" key={i}>
          <span className="line-number">{String(i + 1).padStart(2, " ")}</span>
          <code>
            <Highlight text={line} />
          </code>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const [theme, setTheme] = useState(() => {
    try {
      const t = localStorage.getItem("yt-theme");
      return themes.some((x) => x.id === t) ? t! : "warm";
    } catch {
      return "warm";
    }
  });
  const { motion, preference, setPreference } = useMotionPreference();
  const reduced = motion !== "full";
  const [systemOpen, setSystemOpen] = useState(false);
  const [zen, setZen] = useState(false);
  const environment = useRef<EnvironmentHandle>(null);
  const pendingDetail = useRef<number | null>(null);
  const allCommands = [...commands, ...systemColonCommands];
  const [visible, setVisible] = useState(!document.hidden);
  const input = useRef<HTMLInputElement>(null);
  const introCode = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLElement>(null);
  const wheel = useRef({ sum: 0, last: 0, lastStep: 0, locked: false });
  const portalActive = ["ENTERING", "LEAVING"].includes(state.scene);
  const isOverlay = ["COMMAND", "BUFFER"].includes(state.scene);
  const baseScene = isOverlay ? state.returnScene : state.scene;
  const explorer = !["INTRO", "ENTERING", "LEAVING"].includes(baseScene);
  const typing = useTyping(
    state.paused || baseScene !== "INTRO" || isOverlay || reduced || systemOpen,
  );
  const snippet = snippets[typing.file];
  const project = projects[state.project];
  const scene = projectScenes[state.project];
  const move = (delta: number, modality = "keyboard") =>
    dispatch({ type: "NAVIGATE", delta, total: projects.length, modality });
  const open = () => dispatch({ type: "ENTER", modality: "pointer" });
  const prompt = () => {
    focusTarget.current = document.activeElement as HTMLElement;
    dispatch({ type: "COMMAND" });
  };
  const back = () => dispatch({ type: "BACK" });
  const execute = (raw: string) => {
    if (isSystemCommand(raw)) {
      if (isOverlay) dispatch({ type: "CLOSE_COMMAND" });
      environment.current?.executeColon(raw);
      return;
    }
    const command = raw.trim().replace(/^:/, "").toLowerCase();
    if (!commands.includes(command as (typeof commands)[number])) {
      dispatch({
        type: "ERROR",
        message: `E492: Unknown command: ${command}. Try :help`,
      });
      return;
    }
    if (command === "resume") {
      const a = document.createElement("a");
      a.href = profile.resume;
      a.download = "Younes-Traouki-CV.pdf";
      a.click();
      dispatch({ type: "CLOSE_COMMAND" });
    } else if (command === "projects") dispatch({ type: "PROJECTS" });
    else if (command === "home") dispatch({ type: "HOME" });
    else dispatch({ type: "BUFFER", name: command });
  };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("yt-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (state.scene !== "PROJECT_TRANSITION") return;
    if (reduced || state.paused) {
      dispatch({ type: "PROGRESS", value: 1 });
      return;
    }
    let frame = 0;
    let start = 0;
    const duration = 480;
    const tick = (now: number) => {
      if (!start) start = now;
      const value = Math.min(1, (now - start) / duration);
      dispatch({ type: "PROGRESS", value });
      if (value < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.scene, state.project, reduced, state.paused]);
  useEffect(() => {
    if (state.scene === "COMMAND") input.current?.focus();
    else if (state.scene === "BUFFER" || state.scene === "PROJECT_DETAIL") {
      panel.current?.focus({ preventScroll: true });
      if (panel.current) panel.current.scrollTop = 0;
    }
  }, [state.scene, state.buffer, state.project]);
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (portalActive) {
        if (
          [
            "Enter",
            "Escape",
            "ArrowDown",
            "ArrowUp",
            "j",
            "k",
            ":",
            "?",
            "Tab",
          ].includes(e.key)
        )
          e.preventDefault();
        return;
      }
      if (environment.current?.handleKey(e) || systemOpen) return;
      if (target.closest("input,textarea,select,[contenteditable=true]")) {
        if (e.key === "Escape") {
          e.preventDefault();
          back();
          focusTarget.current?.focus();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        back();
        return;
      }
      if (e.key === ":") {
        e.preventDefault();
        prompt();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        dispatch({ type: "BUFFER", name: "help" });
        return;
      }
      if (isOverlay) return;
      if (["ArrowDown", "j", "ArrowUp", "k"].includes(e.key) && explorer) {
        e.preventDefault();
        move(["ArrowDown", "j"].includes(e.key) ? 1 : -1);
      }
      if (e.key === "Enter" && !target.closest("button,a")) {
        e.preventDefault();
        dispatch({ type: "ENTER", modality: "keyboard" });
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });
  useEffect(() => {
    const element = workspace.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (
        !["EXPLORER", "PROJECT_TRANSITION"].includes(state.scene) ||
        event.ctrlKey ||
        systemOpen
      )
        return;
      event.preventDefault();
      const now = performance.now();
      const w = wheel.current;
      if (now - w.last > 160) {
        w.sum = 0;
        w.locked = false;
      }
      w.last = now;
      if (w.locked) return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.sign(w.sum) !== Math.sign(delta)) w.sum = 0;
      w.sum += delta;
      if (Math.abs(w.sum) >= 45 && now - w.lastStep > 550) {
        move(w.sum > 0 ? 1 : -1, "wheel");
        w.lastStep = now;
        w.sum = 0;
        w.locked = true;
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [state.scene, systemOpen]);
  useEffect(() => {
    if (state.scene === "PROJECT_TRANSITION" && state.modality === "keyboard")
      document
        .querySelector<HTMLElement>('.rail-object[aria-current="true"]')
        ?.focus({ preventScroll: true });
  }, [state.scene, state.project, state.modality]);
  useEffect(() => {
    const code = introCode.current?.querySelector(".code-buffer");
    if (code) code.scrollTop = code.scrollHeight;
  }, [typing.count]);
  useEffect(() => {
    dispatch({ type: "SET_PAUSED", value: motion === "off" });
  }, [motion]);
  useEffect(() => {
    if (state.scene === "EXPLORER" && pendingDetail.current === state.project) {
      pendingDetail.current = null;
      dispatch({ type: "ENTER" });
    }
  }, [state.scene, state.project]);
  const revealProject = (index: number, detail: boolean) => {
    pendingDetail.current = detail ? index : null;
    dispatch({ type: "REVEAL_PROJECT", index, total: projects.length });
  };
  const openSystem = (
    panel: "terminal" | "palette" | "diagnostics" | "simulation",
  ) => {
    if (isOverlay) dispatch({ type: "CLOSE_COMMAND" });
    environment.current?.open(panel);
  };
  const pressed =
    isOverlay || systemOpen ? "" : explorer ? state.key : typing.key;
  const transition = portalActive
    ? portalTimeline(
        state.progress,
        state.scene === "LEAVING",
        reduced || state.paused,
      ).entry
    : explorer
      ? 1
      : 0;
  const style = {
    "--entry": transition,
    "--direction": state.direction,
  } as CSSProperties;
  return (
    <main
      ref={workspace}
      className={`app scene-${state.scene.toLowerCase()} ${explorer ? "exploring" : ""} ${portalActive ? "portal-active" : ""} ${portalActive && (reduced || state.paused) ? "portal-reduced" : ""} ${state.paused || reduced || !visible ? "motion-paused" : ""} ${zen ? "yt-zen" : ""}`}
      style={style}
      tabIndex={-1}
      aria-busy={portalActive}
      data-scene={state.scene}
      data-project={state.project}
    >
      <header
        className="topbar"
        inert={
          systemOpen ||
          portalActive ||
          isOverlay ||
          state.scene === "PROJECT_DETAIL"
        }
      >
        <a
          href="#"
          className="identity"
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: "HOME" });
          }}
          aria-label="Return to introduction"
        >
          <strong>yt.</strong>
          <span>younes / traouki</span>
        </a>
        <nav aria-label="Personal links">
          <button
            className="yt-launch"
            aria-label="Open terminal"
            onClick={() => openSystem("terminal")}
          >
            ~
          </button>
          <button
            className="yt-launch"
            aria-label="Open command palette"
            onClick={() => openSystem("palette")}
          >
            ⌘K
          </button>
          <button onClick={() => execute("about")}>whoami</button>
          <a href={profile.github} target="_blank" rel="noreferrer">
            github ↗
          </a>
        </nav>
      </header>
      <div
        className="intro-scene"
        aria-hidden={baseScene !== "INTRO"}
        inert={systemOpen || baseScene !== "INTRO" || isOverlay}
      >
        <div className="intro-code" ref={introCode}>
          <div className="buffer-heading">// {snippet.path}</div>
          <Code text={snippet.code.slice(0, typing.count)} />
          <span className="intro-cursor cursor" />
          <div className="vim-status">
            <span>
              {typing.phase === "typing" && !state.paused && !reduced
                ? "INSERT"
                : "NORMAL"}
            </span>
            <span>{snippet.path}</span>
            <span>
              {snippet.code.slice(0, typing.count).split("\n").length}:1 Top
            </span>
          </div>
        </div>
        <div className="intro-identity">
          <p>{profile.name}</p>
          <span>AI / optimization / systems</span>
        </div>
        <button
          className="enter-hint"
          onClick={() => dispatch({ type: "ENTER", modality: "pointer" })}
        >
          enter ↩<small>explore the workspace</small>
        </button>
      </div>
      <section
        className="explorer-scene"
        aria-label="Spatial project explorer"
        aria-hidden={!explorer}
        inert={
          systemOpen ||
          !explorer ||
          isOverlay ||
          state.scene === "PROJECT_DETAIL"
        }
      >
        <ProjectRail
          active={state.project}
          move={move}
          open={open}
          select={(index, modality) =>
            dispatch({
              type: "NAVIGATE",
              index,
              total: projects.length,
              modality,
            })
          }
        />
        <div className="project-stage">
          <div className="terminal-title">
            <span>fish — ~/younes/{scene.slug}</span>
            <span>{String(state.project + 1).padStart(2, "0")} / 06</span>
          </div>
          <article
            key={state.project}
            className={`project-terminal project-${state.project}`}
            aria-live="polite"
          >
            <p className="terminal-prompt">
              <span>
                younes<span className="comment">@casablanca</span>
              </span>{" "}
              ~/projects/{scene.slug} <span className="comment">(main)</span>
              <br />
              <span className="accent">›</span> {scene.command}
            </p>
            <small className="project-category">{project.area}</small>
            <h1>{project.name}</h1>
            <p className="project-description">{project.description}</p>
            <div className="project-art">
              <ProjectVisual project={state.project} />
              <span className="art-caption">
                {scene.caption}
                <small>ORIGINAL / ILLUSTRATIVE STUDY</small>
              </span>
            </div>
            <div className="project-notes">
              {scene.notes.map((note, i) => (
                <p key={note}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {note}
                </p>
              ))}
            </div>
            <div className="project-source">
              <div className="buffer-heading">// {scene.file}</div>
              <Code text={scene.code} />
            </div>
            <div className="project-actions">
              <button onClick={() => openSystem("simulation")}>
                ↳ launch simulation
              </button>
              <button onClick={open}>open project notes ↩</button>
              <small>{project.status}</small>
            </div>
          </article>
        </div>
        <aside
          className="technical-aside"
          aria-label="Selected project technical study"
        >
          <div className="orbital-label">
            [{String(state.project + 1).padStart(2, "0")}] / {scene.meta}
          </div>
          <div className="aside-visual" key={state.project}>
            <ProjectVisual project={state.project} />
          </div>
          <dl>
            <dt>discipline</dt>
            <dd>{scene.short}</dd>
            <dt>representation</dt>
            <dd>original technical study</dd>
            <dt>source</dt>
            <dd>owner-provided overview</dd>
          </dl>
          <svg className="connectors" viewBox="0 0 300 400" aria-hidden="true">
            <path d="M220 42 L42 210 L0 210 M220 42 V355 H80" />
            <circle cx="220" cy="42" r="3" />
          </svg>
          <span className="aside-coordinate">selection → context → system</span>
        </aside>
      </section>
      <div className="input-deck">
        <KeyboardVisualizer
          pressed={pressed}
          reduced={
            reduced ||
            state.paused ||
            isOverlay ||
            !visible ||
            portalActive ||
            systemOpen
          }
        />
        <div className="input-device">
          <svg viewBox="0 0 60 95" aria-hidden="true">
            <rect x="12" y="5" width="36" height="66" rx="18" />
            <path d="M12 31 H48 M30 5 V31" />
            <rect
              className={state.modality === "wheel" ? "wheel-active" : ""}
              x="27"
              y="14"
              width="6"
              height="12"
              rx="3"
            />
          </svg>
          <small>
            {state.modality} / {state.activity}
          </small>
        </div>
      </div>
      <footer
        className="system-footer"
        inert={
          systemOpen ||
          portalActive ||
          isOverlay ||
          state.scene === "PROJECT_DETAIL"
        }
      >
        <div className="footer-identity">
          <strong>YOUNES / TRAOUKI</strong>
          <span>
            {explorer
              ? `${String(state.project + 1).padStart(2, "0")} — ${scene.slug}`
              : "// intelligence, engineered."}
          </span>
        </div>
        <div className="footer-controls">
          <button
            onClick={() => move(-1, "pointer")}
            disabled={!explorer || state.project === 0}
            aria-label="Select previous project"
          >
            ↑
          </button>
          <button
            onClick={() => move(1, "pointer")}
            disabled={!explorer || state.project === projects.length - 1}
            aria-label="Select next project"
          >
            ↓
          </button>
          <span>project</span>
          <button
            onClick={() =>
              explorer
                ? open()
                : dispatch({ type: "ENTER", modality: "pointer" })
            }
          >
            ↩ {explorer ? "open" : "enter"}
          </button>
          <button onClick={prompt}>: cmd</button>
          <button onClick={() => execute("help")}>? help</button>
        </div>
        <div className="footer-mode">
          <small>MODE</small>
          <span>
            {isOverlay ? state.scene : explorer ? scene.mode : "INTRO"}
          </span>
        </div>
        <div className="footer-input">
          <small>INPUT</small>
          <span>{state.modality}</span>
        </div>
        <div className="footer-actions">
          <button
            onClick={() => openSystem("diagnostics")}
            aria-label="Open runtime diagnostics"
          >
            status
          </button>
          <button onClick={() => execute("theme")}>
            :theme <i />
          </button>
          <button
            onClick={() => setPreference(preference === "off" ? "full" : "off")}
            aria-pressed={state.paused}
          >
            {state.paused ? "resume motion" : "pause motion"}
          </button>
        </div>
      </footer>
      {(state.scene === "BUFFER" || state.scene === "PROJECT_DETAIL") && (
        <div
          className="overlay-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) back();
          }}
        >
          <div
            className="buffer-panel"
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={
              state.scene === "PROJECT_DETAIL"
                ? project.name
                : `${state.buffer} buffer`
            }
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const items = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    "button,a,input",
                  ),
                );
                const first = items[0],
                  last = items.at(-1);
                if (
                  e.shiftKey &&
                  (document.activeElement === first ||
                    document.activeElement === e.currentTarget)
                ) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className="panel-header">
              <span>
                ~/younes/
                {state.scene === "PROJECT_DETAIL"
                  ? project.file
                  : `${state.buffer}.md`}
              </span>
              <button onClick={back}>
                close <kbd>esc</kbd>
              </button>
            </div>
            {state.scene === "PROJECT_DETAIL" ? (
              <>
                <small>{project.area}</small>
                <h1>{project.name}</h1>
                <ProjectVisual project={state.project} />
                <p>{project.description}</p>
                <div className="detail-source">
                  <div className="buffer-heading">// {scene.file}</div>
                  <Code text={scene.code} />
                </div>
                <h2>engineering challenge</h2>
                <p>{project.challenge}</p>
                <h2>my contribution</h2>
                <p>{project.contribution}</p>
                <h2>tools & concepts</h2>
                <p className="string">{project.stack}</p>
                <small>{project.status}</small>
                <p className="comment">
                  Public overview. Code and diagrams in this workspace are
                  illustrative, without confidential implementation details.
                </p>
              </>
            ) : (
              <ContentBuffer
                name={state.buffer}
                theme={theme}
                onTheme={setTheme}
                execute={execute}
              />
            )}
          </div>
        </div>
      )}
      {state.scene === "COMMAND" && (
        <div
          className="command-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              const items = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("button,input"),
              );
              const first = items[0],
                last = items.at(-1);
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              execute(state.query);
            }}
          >
            <label htmlFor="command">:</label>
            <input
              ref={input}
              id="command"
              value={state.query}
              onChange={(e) =>
                dispatch({ type: "QUERY", value: e.target.value })
              }
              aria-label="Vim command"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit">enter ↩</button>
            <button type="button" onClick={back}>
              esc
            </button>
          </form>
          <div className="command-suggestions">
            {allCommands
              .filter((c) => c.startsWith(state.query.replace(/^:/, "")))
              .map((c) => (
                <button key={c} onClick={() => execute(c)}>
                  :{c}
                </button>
              ))}
          </div>
          {state.error && (
            <p role="alert" className="error">
              {state.error}
            </p>
          )}
        </div>
      )}
      <YTEnvironment
        ref={environment}
        scene={state.scene}
        project={state.project}
        theme={theme}
        motion={motion}
        preference={preference}
        onMotion={setPreference}
        onTheme={setTheme}
        onPage={execute}
        onReveal={revealProject}
        onHome={() => dispatch({ type: "HOME" })}
        onBlockingChange={setSystemOpen}
        onZen={() => setZen((value) => !value)}
      />
      {portalActive && (
        <CinematicPortalTransition
          key={state.scene}
          reverse={state.scene === "LEAVING"}
          reduced={reduced || state.paused}
          disabled={motion === "off"}
          host={workspace}
          onProgress={(value) => dispatch({ type: "PROGRESS", value })}
        />
      )}
      <span className="sr-only" role="status">
        {explorer
          ? `Selected project ${state.project + 1} of ${projects.length}: ${project.name}`
          : "Introduction. Press Enter to explore projects."}
      </span>
    </main>
  );
}
