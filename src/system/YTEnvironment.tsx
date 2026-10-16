import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { education, experience, profile, skills } from "../content";
import { projectRegistry } from "./projects";
import { createActions } from "./actions";
import { createVirtualFS, executeShell, initialShell } from "./shell";
import type { ShellState } from "./shell";
import type { MotionMode } from "../playgrounds/types";
import WorkspaceWindow from "./WorkspaceWindow";
import PlaygroundHost from "./PlaygroundHost";
import TerminalView from "./TerminalView";
import CommandPalette from "./CommandPalette";
import Diagnostics from "./Diagnostics";
import BootSequence from "./BootSequence";

type Panel =
  "TERMINAL" | "PALETTE" | "PLAYGROUND" | "DIAGNOSTICS" | "BOOT" | "WAITING";
type State = {
  stack: Panel[];
  playground: number;
  pending: boolean;
  shell: ShellState;
  recent: string[];
  effect: string;
  simulation: string;
};
type Event =
  | { type: "PUSH"; panel: Panel }
  | { type: "POP" }
  | { type: "CLEAR" }
  | { type: "LAUNCH"; project: number }
  | { type: "READY" }
  | { type: "SHELL"; shell: ShellState; effect?: string }
  | { type: "RECENT"; id: string }
  | { type: "EFFECT_DONE" }
  | { type: "STATUS"; value: string };
function firstState(): State {
  let seen = false,
    recent: string[] = [];
  try {
    seen = localStorage.getItem("yt-boot-seen") === "1";
    recent = JSON.parse(localStorage.getItem("yt-recent-actions") ?? "[]");
    if (!Array.isArray(recent)) recent = [];
  } catch {}
  return {
    stack: seen ? [] : ["BOOT"],
    playground: 0,
    pending: false,
    shell: initialShell(),
    recent: recent.filter((x) => typeof x === "string").slice(0, 8),
    effect: "",
    simulation: "none",
  };
}
function reducer(state: State, event: Event): State {
  switch (event.type) {
    case "PUSH": {
      const found = state.stack.indexOf(event.panel);
      return {
        ...state,
        stack:
          found < 0
            ? [...state.stack, event.panel]
            : state.stack.slice(0, found + 1),
      };
    }
    case "POP":
      return { ...state, stack: state.stack.slice(0, -1) };
    case "CLEAR":
      return { ...state, stack: [], pending: false, simulation: "none" };
    case "LAUNCH":
      return {
        ...state,
        stack: ["WAITING"],
        playground: event.project,
        pending: true,
        simulation: "loading",
      };
    case "READY":
      return { ...state, stack: ["PLAYGROUND"], pending: false };
    case "SHELL":
      return {
        ...state,
        shell: event.shell,
        effect: event.effect ?? state.effect,
      };
    case "RECENT":
      return {
        ...state,
        recent: [
          event.id,
          ...state.recent.filter((id) => id !== event.id),
        ].slice(0, 8),
      };
    case "EFFECT_DONE":
      return { ...state, effect: "" };
    case "STATUS":
      return state.simulation === event.value
        ? state
        : { ...state, simulation: event.value };
  }
}
export type EnvironmentHandle = {
  open: (panel: "terminal" | "palette" | "diagnostics" | "simulation") => void;
  handleKey: (event: KeyboardEvent) => boolean;
  executeColon: (raw: string) => void;
};
type Props = {
  scene: string;
  project: number;
  theme: string;
  motion: MotionMode;
  preference: MotionMode;
  onMotion: (value: MotionMode) => void;
  onTheme: (value: string) => void;
  onPage: (page: string) => void;
  onReveal: (project: number, detail: boolean) => void;
  onHome: () => void;
  onBlockingChange: (value: boolean) => void;
  onZen: () => void;
};
export const systemColonCommands = [
  "terminal",
  "palette",
  "sim",
  "simulate",
  "diagnostics",
  "status",
  "boot",
  "reboot",
  "motion",
  "zen",
];
export function isSystemCommand(raw: string) {
  return systemColonCommands.includes(
    raw.trim().replace(/^:/, "").split(/\s+/)[0],
  );
}

const YTEnvironment = forwardRef<EnvironmentHandle, Props>(
  function YTEnvironment(props, ref) {
    const [state, dispatch] = useReducer(reducer, undefined, firstState);
    const started = useRef(performance.now());
    const top = state.stack.at(-1),
      blocking = !!top && top !== "WAITING",
      traveling = ["ENTERING", "LEAVING"].includes(props.scene);
    const actions = useMemo(() => createActions(projectRegistry), []),
      fs = useMemo(
        () =>
          createVirtualFS({
            profile,
            projects: projectRegistry,
            experience,
            education,
            skills,
          }),
        [],
      );
    useEffect(
      () => props.onBlockingChange(blocking),
      [blocking, props.onBlockingChange],
    );
    useEffect(() => {
      if (
        state.pending &&
        props.scene === "EXPLORER" &&
        props.project === state.playground
      )
        dispatch({ type: "READY" });
    }, [state.pending, state.playground, props.scene, props.project]);
    useEffect(() => {
      try {
        localStorage.setItem("yt-recent-actions", JSON.stringify(state.recent));
      } catch {}
    }, [state.recent]);
    const finishBoot = useCallback(() => {
      try {
        localStorage.setItem("yt-boot-seen", "1");
      } catch {}
      dispatch({ type: "POP" });
    }, []);
    const close = useCallback(() => {
      if (top === "BOOT") finishBoot();
      else dispatch({ type: "POP" });
    }, [top, finishBoot]);
    const report = useCallback(
      (value: string) => dispatch({ type: "STATUS", value }),
      [],
    );
    const effectDone = useCallback(() => dispatch({ type: "EFFECT_DONE" }), []);
    const invoke = (
      id: string,
      source: "palette" | "terminal" | "interface" = "interface",
    ) => {
      if (traveling) return;
      if (id === "exit") {
        dispatch({ type: "POP" });
        return;
      }
      if (id === "palette") {
        dispatch({ type: "PUSH", panel: "PALETTE" });
        return;
      }
      const action = actions.find((a) => a.id === id);
      if (!action) return;
      dispatch({ type: "RECENT", id });
      const [kind, value] = id.split(":");
      if (kind === "terminal") {
        if (top === "PALETTE") dispatch({ type: "POP" });
        dispatch({ type: "PUSH", panel: "TERMINAL" });
        return;
      }
      if (kind === "diagnostics") {
        if (top === "PALETTE") dispatch({ type: "POP" });
        dispatch({ type: "PUSH", panel: "DIAGNOSTICS" });
        return;
      }
      if (kind === "boot") {
        if (top === "PALETTE") dispatch({ type: "POP" });
        dispatch({ type: "PUSH", panel: "BOOT" });
        return;
      }
      if (kind === "simulate" || kind === "project") {
        const project = projectRegistry.find((p) => p.id === value);
        if (!project) return;
        if (kind === "simulate")
          dispatch({ type: "LAUNCH", project: project.index });
        else dispatch({ type: "CLEAR" });
        props.onReveal(project.index, kind === "project");
        return;
      }
      if (kind === "home") {
        dispatch({ type: "CLEAR" });
        props.onHome();
        return;
      }
      if (kind === "explorer") {
        dispatch({ type: "CLEAR" });
        props.onReveal(props.project, false);
        return;
      }
      if (kind === "view") {
        if (value === "resume") {
          const link = document.createElement("a");
          link.href = profile.resume;
          link.download = "Younes-Traouki-CV.pdf";
          link.click();
          if (source === "palette") dispatch({ type: "POP" });
        } else {
          dispatch({ type: "CLEAR" });
          props.onPage(value);
        }
        return;
      }
      if (kind === "theme") props.onTheme(value);
      if (kind === "motion") props.onMotion(value as MotionMode);
      if (kind === "zen") props.onZen();
      if (source === "palette") dispatch({ type: "POP" });
    };
    const open = (
      panel: "terminal" | "palette" | "diagnostics" | "simulation",
    ) => {
      if (traveling) return;
      if (panel === "simulation")
        invoke(`simulate:${projectRegistry[props.project].id}`);
      else if (panel === "palette")
        dispatch({ type: "PUSH", panel: "PALETTE" });
      else invoke(panel);
    };
    useImperativeHandle(ref, () => ({
      open,
      handleKey(event) {
        const target = event.target as HTMLElement,
          editing = !!target.closest(
            'input,textarea,select,[contenteditable="true"]',
          );
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k" &&
          !editing
        ) {
          event.preventDefault();
          open("palette");
          return true;
        }
        if (
          (event.key === "~" || (event.ctrlKey && event.key === "`")) &&
          !editing
        ) {
          event.preventDefault();
          if (top === "TERMINAL") close();
          else open("terminal");
          return true;
        }
        if (blocking) {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
          if (top === "BOOT" && event.key === "Enter") {
            event.preventDefault();
            finishBoot();
          }
          return true;
        }
        return false;
      },
      executeColon(raw) {
        const [name, arg] = raw.trim().replace(/^:/, "").split(/\s+/);
        if (name === "sim" || name === "simulate")
          invoke(`simulate:${projectRegistry[props.project].id}`);
        else if (name === "terminal" || name === "palette") open(name);
        else if (name === "diagnostics" || name === "status")
          open("diagnostics");
        else if (name === "boot" || name === "reboot") invoke("boot");
        else if (name === "motion")
          invoke(
            `motion:${["full", "reduced", "off"].includes(arg) ? arg : "reduced"}`,
          );
        else if (name === "zen") invoke("zen");
      },
    }));
    const values = {
      scene: props.scene,
      activeProject: projectRegistry[props.project].id,
      inputPanel: top ?? "none",
      motion: props.motion,
      motionPreference: props.preference,
      theme: props.theme,
      simulation: state.stack.includes("PLAYGROUND")
        ? state.simulation
        : "none",
      terminalCommands: state.shell.count,
    };
    const runShell = (command: string) => {
      const result = executeShell(state.shell, command, {
        fs,
        projects: projectRegistry,
        identity: `${profile.name}\n${profile.role}\n${profile.location}`,
        skills: skills.map((row) => row.join(": ")).join("\n"),
        experience: experience
          .map(
            (job) => `${job.company} / ${job.role} / ${job.date}\n${job.text}`,
          )
          .join("\n\n"),
        education: education.map((row) => row.join(" · ")).join("\n"),
        contact: `${profile.email}\n${profile.location}`,
        status: values,
        uptime: (performance.now() - started.current) / 1000,
      });
      dispatch({
        type: "SHELL",
        shell: result.state,
        effect: result.result.effect,
      });
      if (result.result.action) invoke(result.result.action, "terminal");
    };
    const playground = projectRegistry[state.playground];
    return (
      <div className={`yt-system yt-motion-${props.motion}`}>
        {state.stack.includes("PLAYGROUND") && (
          <WorkspaceWindow
            hidden={top !== "PLAYGROUND"}
            wide
            title={`~/playgrounds/${playground.id}`}
            subtitle={`${playground.name} / local educational demonstration`}
            onClose={close}
          >
            <div className="yt-lab-toolbar">
              <span>YT.OS / {playground.playground.toUpperCase()}</span>
              <div>
                <button onClick={() => open("terminal")}>~ terminal</button>
                <button onClick={() => open("palette")}>⌘ K actions</button>
                <button onClick={() => open("diagnostics")}>runtime ↗</button>
              </div>
            </div>
            <PlaygroundHost
              kind={playground.playground}
              motion={props.motion}
              active={top === "PLAYGROUND"}
              onStatus={report}
            />
          </WorkspaceWindow>
        )}
        {state.stack.includes("TERMINAL") && (
          <WorkspaceWindow
            hidden={top !== "TERMINAL"}
            title="younes@yt-os / shell"
            subtitle="simulated filesystem · browser-local actions"
            onClose={close}
          >
            <TerminalView
              model={state.shell}
              fs={fs}
              onRun={runShell}
              motion={props.motion}
              active={top === "TERMINAL"}
              effect={state.effect}
              onEffectDone={effectDone}
            />
          </WorkspaceWindow>
        )}
        {top === "PALETTE" && (
          <WorkspaceWindow
            title="YT.OS / command launcher"
            subtitle="projects · simulations · workspace actions"
            onClose={close}
          >
            <CommandPalette
              actions={actions}
              recent={state.recent}
              projectId={projectRegistry[props.project].id}
              invoke={(id) => invoke(id, "palette")}
            />
          </WorkspaceWindow>
        )}
        {top === "DIAGNOSTICS" && (
          <WorkspaceWindow
            title="YT.OS / runtime diagnostics"
            subtitle="actual application values"
            onClose={close}
          >
            <Diagnostics started={started.current} values={values} />
          </WorkspaceWindow>
        )}
        {top === "BOOT" && (
          <div
            className="yt-boot-layer"
            role="dialog"
            aria-modal="true"
            aria-label="YT.OS initialization"
          >
            <BootSequence
              motion={props.motion}
              projects={projectRegistry.length}
              actions={actions.length}
              finish={finishBoot}
            />
          </div>
        )}
      </div>
    );
  },
);
export default YTEnvironment;
