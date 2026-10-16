import type { ProjectRecord } from "./registryCore";
export const HOME = "/home/younes";
export type VirtualNode = {
  kind: "directory" | "file";
  text?: string;
  action?: string;
};
export type VirtualFS = Record<string, VirtualNode>;
export type ShellLink = {
  label: string;
  path: string;
  kind: "directory" | "file";
};
export type ShellResult = {
  lines: string[];
  links?: ShellLink[];
  action?: string;
  effect?: "matrix" | "konami";
  error?: boolean;
  cwd?: string;
  clear?: boolean;
};
export type ShellEntry = { command: string; cwd: string; result: ShellResult };
export type ShellState = {
  cwd: string;
  previous: string;
  history: string[];
  entries: ShellEntry[];
  count: number;
};
export type ShellContext = {
  fs: VirtualFS;
  projects: ProjectRecord[];
  identity: string;
  skills: string;
  experience: string;
  education: string;
  contact: string;
  status: Record<string, string | number>;
  uptime: number;
};
export const initialShell = (): ShellState => ({
  cwd: HOME,
  previous: HOME,
  history: [],
  entries: [],
  count: 0,
});
export function normalizePath(path: string, cwd = HOME): string {
  let input = path || HOME;
  if (input === "~" || input.startsWith("~/")) input = HOME + input.slice(1);
  const parts = (input.startsWith("/") ? input : `${cwd}/${input}`).split("/");
  const result: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") result.pop();
    else result.push(part);
  }
  return "/" + result.join("/");
}
export function parseCommand(source: string): string[] {
  const tokens: string[] = [];
  let current = "",
    quote = "",
    escaped = false,
    started = false;
  for (const char of source.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      started = true;
      continue;
    }
    if (char.charCodeAt(0) === 92) {
      escaped = true;
      started = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      else current += char;
      continue;
    }
    if (char.charCodeAt(0) === 34 || char.charCodeAt(0) === 39) {
      quote = char;
      started = true;
      continue;
    }
    if (/[|;&`]/.test(char))
      throw new Error(
        "Pipes, chaining and evaluation are unavailable in this simulated shell.",
      );
    if (/\s/.test(char)) {
      if (started) {
        tokens.push(current);
        current = "";
        started = false;
      }
    } else {
      current += char;
      started = true;
    }
  }
  if (quote) throw new Error("Unclosed quote. Close it and try again.");
  if (escaped) throw new Error("Incomplete escape sequence.");
  if (started) tokens.push(current);
  return tokens;
}
export function children(fs: VirtualFS, dir: string): ShellLink[] {
  return Object.keys(fs)
    .filter(
      (path) =>
        path !== dir && (path.slice(0, path.lastIndexOf("/")) || "/") === dir,
    )
    .sort()
    .map((path) => ({
      label:
        path.split("/").at(-1)! + (fs[path].kind === "directory" ? "/" : ""),
      path,
      kind: fs[path].kind,
    }));
}
export function createVirtualFS(data: {
  profile: { name: string; role: string; location: string; email: string };
  projects: ProjectRecord[];
  experience: { company: string; role: string; date: string; text: string }[];
  education: string[][];
  skills: string[][];
}): VirtualFS {
  const fs: VirtualFS = { "/": { kind: "directory" } };
  const dir = (path: string) => {
    let current = "";
    for (const part of path.split("/").filter(Boolean)) {
      current += "/" + part;
      fs[current] = { kind: "directory" };
    }
  };
  const file = (path: string, text: string, action?: string) => {
    dir(path.slice(0, path.lastIndexOf("/")));
    fs[path] = { kind: "file", text, action };
  };
  dir(HOME);
  dir(`${HOME}/projects`);
  dir(`${HOME}/experience`);
  file(
    `${HOME}/about.md`,
    `${data.profile.name}\n${data.profile.role}\n${data.profile.location}\n\nBuilding intelligent systems from models to production.`,
  );
  file(
    `${HOME}/contact.txt`,
    `${data.profile.email}\n${data.profile.location}`,
  );
  file(
    `${HOME}/resume.pdf`,
    "PDF document. Use resume to download the provided CV.",
    "view:resume",
  );
  file(
    `${HOME}/skills.md`,
    data.skills.map(([name, items]) => `${name}\n${items}`).join("\n\n"),
  );
  file(
    `${HOME}/education.md`,
    data.education.map((items) => items.join(" · ")).join("\n"),
  );
  data.experience.forEach((job, i) =>
    file(
      `${HOME}/experience/${["rim-telecom", "centrale-danone", "twd-services"][i] ?? i}.md`,
      `${job.company}\n${job.role} · ${job.date}\n\n${job.text}`,
    ),
  );
  for (const project of data.projects) {
    dir(project.directory);
    file(
      `${project.directory}/README.md`,
      `${project.name}\n${project.description}\n\nChallenge: ${project.challenge}\nContribution: ${project.contribution}\nTools: ${project.stack}\nStatus: ${project.status}\n\nCommands:\n${project.commands.join("\n")}`,
    );
    file(
      `${project.directory}/${project.scene.file.split("/").at(-1)}`,
      project.scene.code,
    );
  }
  file(
    `${HOME}/README.md`,
    "YT.OS is an entirely browser-local, simulated workspace. No terminal input is executed on an operating system.\nTry help, ls projects/, cat about.md, or simulate fleet.",
  );
  return fs;
}
type CommandSpec = {
  usage: string;
  description: string;
  run: (args: string[], state: ShellState, ctx: ShellContext) => ShellResult;
};
const text = (value: string): ShellResult => ({ lines: [value] });
function findProject(
  query: string,
  state: ShellState,
  projects: ProjectRecord[],
): ProjectRecord {
  const key = query || state.cwd.split("/").at(-1) || "";
  const number = Number(key);
  if (Number.isInteger(number) && number >= 1 && number <= projects.length)
    return projects[number - 1];
  const normalized = key.toLowerCase().replace(/\/$/, "");
  const matches = projects.filter(
    (p) =>
      p.id === normalized ||
      p.directory === normalizePath(key, state.cwd) ||
      p.id.includes(normalized) ||
      p.name.toLowerCase().includes(normalized),
  );
  if (matches.length !== 1)
    throw new Error(
      matches.length
        ? "Ambiguous project. Use its ID or number from projects."
        : "Project not found. Run projects to list IDs.",
    );
  return matches[0];
}
export const commandRegistry: Record<string, CommandSpec> = {
  help: {
    usage: "help",
    description: "Show commands",
    run: () =>
      text(
        Object.entries(commandRegistry)
          .filter(
            ([name]) =>
              !["coffee", "matrix", "sudo", "konami", "zen"].includes(name),
          )
          .map(([, c]) => `${c.usage.padEnd(26)} ${c.description}`)
          .join("\n"),
      ),
  },
  whoami: {
    usage: "whoami",
    description: "Professional identity",
    run: (_, __, c) => text(c.identity),
  },
  pwd: {
    usage: "pwd",
    description: "Current virtual directory",
    run: (_, s) => text(s.cwd),
  },
  ls: {
    usage: "ls [path]",
    description: "List virtual paths",
    run: (args, s, c) => {
      const path = normalizePath(
        args.find((a) => !a.startsWith("-")) ?? s.cwd,
        s.cwd,
      );
      if (!c.fs[path]) throw new Error(`No such virtual path: ${path}`);
      if (c.fs[path].kind === "file") return text(path);
      const links = children(c.fs, path);
      return { lines: links.length ? [] : ["(empty directory)"], links };
    },
  },
  cd: {
    usage: "cd [path]",
    description: "Change virtual directory",
    run: (args, s, c) => {
      const path =
        args[0] === "-" ? s.previous : normalizePath(args[0] ?? HOME, s.cwd);
      if (c.fs[path]?.kind !== "directory")
        throw new Error(`Not a virtual directory: ${path}`);
      return { lines: [], cwd: path };
    },
  },
  cat: {
    usage: "cat <path>",
    description: "Read a virtual file",
    run: (args, s, c) => {
      if (!args[0]) throw new Error("Usage: cat <path>");
      const path = normalizePath(args[0], s.cwd),
        node = c.fs[path];
      if (!node) throw new Error(`No such virtual file: ${path}`);
      if (node.kind === "directory")
        throw new Error("Path is a directory. Use ls.");
      return { lines: [node.text ?? ""], action: node.action };
    },
  },
  clear: {
    usage: "clear",
    description: "Clear output; retain history",
    run: () => ({ lines: [], clear: true }),
  },
  history: {
    usage: "history",
    description: "Executed commands",
    run: (_, s) => text(s.history.map((h, i) => `${i + 1}  ${h}`).join("\n")),
  },
  neofetch: {
    usage: "neofetch",
    description: "Compact workspace identity",
    run: (_, __, c) =>
      text(
        `  YT.  YT.OS / browser-local\n  /_   ${c.identity}\n       ${c.projects.length} engineering projects\n       React · TypeScript · Vite\n       No remote shell or model connection`,
      ),
  },
  projects: {
    usage: "projects [id]",
    description: "List or open projects",
    run: (a, s, c) =>
      a[0]
        ? {
            lines: [],
            action: `project:${findProject(a.join(" "), s, c.projects).id}`,
          }
        : {
            lines: c.projects
              .map((p) => `${p.index + 1}  ${p.id}\n   ${p.name}`)
              .slice(0),
            links: c.projects.map((p) => ({
              label: p.id + "/",
              path: p.directory,
              kind: "directory",
            })),
          },
  },
  open: {
    usage: "open <project id|number>",
    description: "Open project notes",
    run: (a, s, c) => ({
      lines: [],
      action: `project:${findProject(a.join(" "), s, c.projects).id}`,
    }),
  },
  simulate: {
    usage: "simulate <project>",
    description: "Launch a working playground",
    run: (a, s, c) => ({
      lines: [],
      action: `simulate:${findProject(a.join(" "), s, c.projects).id}`,
    }),
  },
  skills: {
    usage: "skills",
    description: "Tools and disciplines",
    run: (_, __, c) => text(c.skills),
  },
  experience: {
    usage: "experience",
    description: "Professional experience",
    run: (_, __, c) => text(c.experience),
  },
  education: {
    usage: "education",
    description: "Education",
    run: (_, __, c) => text(c.education),
  },
  contact: {
    usage: "contact",
    description: "Contact information",
    run: (_, __, c) => text(c.contact),
  },
  resume: {
    usage: "resume",
    description: "Download the supplied CV",
    run: () => ({
      lines: ["Downloading the provided résumé."],
      action: "view:resume",
    }),
  },
  theme: {
    usage: "theme [warm|green|paper|slate]",
    description: "Change workspace colors",
    run: (a) => {
      if (!a[0]) return text("Themes: warm, green, paper, slate");
      if (!["warm", "green", "paper", "slate"].includes(a[0]))
        throw new Error("Unknown theme. Choose warm, green, paper or slate.");
      return { lines: [`Theme: ${a[0]}`], action: `theme:${a[0]}` };
    },
  },
  status: {
    usage: "status",
    description: "Actual application state",
    run: (_, __, c) =>
      text(
        Object.entries(c.status)
          .map(([k, v]) => `${k.padEnd(18)} ${v}`)
          .join("\n"),
      ),
  },
  uptime: {
    usage: "uptime",
    description: "Elapsed session time",
    run: (_, __, c) => text(`Session uptime: ${Math.floor(c.uptime)} seconds`),
  },
  motion: {
    usage: "motion full|reduced|off",
    description: "Shared animation preference",
    run: (a) => {
      if (!["full", "reduced", "off"].includes(a[0]))
        throw new Error("Usage: motion full|reduced|off");
      return {
        lines: [`Motion preference: ${a[0]}`],
        action: `motion:${a[0]}`,
      };
    },
  },
  exit: {
    usage: "exit",
    description: "Close the terminal",
    run: () => ({ lines: [], action: "exit" }),
  },
  coffee: {
    usage: "coffee",
    description: "A small debugging ritual",
    run: () =>
      text(
        "  ( (\n   ) )\n .----.\n |____|]  Make a small change. Observe. Repeat.\n          Coffee optional; reproducibility required.",
      ),
  },
  sudo: {
    usage: "sudo hire younes",
    description: "A friendly contact shortcut",
    run: (a, _, c) =>
      a.join(" ") === "hire younes"
        ? text(`Permission granted to start a conversation.\n${c.contact}`)
        : text(
            "This is a simulated shell. No privileged operations are available.",
          ),
  },
  matrix: {
    usage: "matrix",
    description: "A brief terminal-only signal",
    run: () => ({
      lines: ["Signal field · local terminal only."],
      effect: "matrix",
    }),
  },
  konami: {
    usage: "konami",
    description: "A quiet discovery",
    run: () => ({
      lines: ["↑ ↑ ↓ ↓ ← → ← → B A\nCuriosity is a useful engineering tool."],
      effect: "konami",
    }),
  },
  zen: {
    usage: "zen",
    description: "Toggle nonessential visuals",
    run: () => ({
      lines: ["Toggled focus view. Run zen again to restore it."],
      action: "zen",
    }),
  },
  reboot: {
    usage: "reboot",
    description: "Replay the short boot detail",
    run: () => ({
      lines: ["Replaying local workspace initialization."],
      action: "boot",
    }),
  },
};
export const aliases: Record<string, string[]> = {
  ll: ["ls", "-l"],
  dir: ["ls"],
  cls: ["clear"],
  q: ["exit"],
  fetch: ["neofetch"],
  cv: ["resume"],
  run: ["simulate"],
  "?": ["help"],
};
export function executeShell(
  state: ShellState,
  source: string,
  context: ShellContext,
): { state: ShellState; result: ShellResult } {
  const command = source.trim();
  if (!command) return { state, result: { lines: [] } };
  let result: ShellResult;
  const next = {
    ...state,
    history: [...state.history, command].slice(-200),
    count: state.count + 1,
  };
  try {
    let tokens = parseCommand(command);
    const alias = aliases[tokens[0]];
    if (alias) tokens = [...alias, ...tokens.slice(1)];
    const spec = commandRegistry[tokens[0]];
    if (!spec) throw new Error(`Command not found: ${tokens[0]}. Try help.`);
    result = spec.run(tokens.slice(1), next, context);
  } catch (error) {
    result = {
      lines: [error instanceof Error ? error.message : "Command failed"],
      error: true,
    };
  }
  if (result.cwd) {
    next.previous = state.cwd;
    next.cwd = result.cwd;
  }
  next.entries = result.clear
    ? []
    : [...state.entries, { command, cwd: state.cwd, result }].slice(-160);
  return { state: next, result };
}
export function completeShell(
  input: string,
  cwd: string,
  fs: VirtualFS,
): string[] {
  const space = input.lastIndexOf(" ");
  if (space < 0)
    return [...Object.keys(commandRegistry), ...Object.keys(aliases)]
      .filter((s) => s.startsWith(input))
      .sort()
      .map((s) => s + " ");
  const prefix = input.slice(0, space + 1),
    partial = input.slice(space + 1).replace(/^["']/, ""),
    slash = partial.lastIndexOf("/");
  const directory =
    slash < 0 ? cwd : normalizePath(partial.slice(0, slash + 1), cwd);
  const basename = partial.slice(slash + 1);
  return children(fs, directory)
    .filter((n) => n.label.startsWith(basename))
    .map(
      (n) => prefix + (slash < 0 ? "" : partial.slice(0, slash + 1)) + n.label,
    );
}
