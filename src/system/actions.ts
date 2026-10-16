import type { ProjectRecord } from "./registryCore";
export type ActionDescriptor = {
  id: string;
  label: string;
  category: string;
  keywords: string;
  shortcut?: string;
};
export function createActions(projects: ProjectRecord[]): ActionDescriptor[] {
  const actions: ActionDescriptor[] = [
    {
      id: "terminal",
      label: "Open terminal",
      category: "Workspace",
      keywords: "shell console filesystem",
      shortcut: "~",
    },
    {
      id: "explorer",
      label: "Go to project explorer",
      category: "Navigation",
      keywords: "projects workspace",
    },
    {
      id: "home",
      label: "Return to introduction",
      category: "Navigation",
      keywords: "intro portal home",
    },
    {
      id: "diagnostics",
      label: "Open runtime diagnostics",
      category: "System",
      keywords: "telemetry fps status uptime",
    },
    {
      id: "boot",
      label: "Replay system boot",
      category: "System",
      keywords: "reboot initialization",
    },
    {
      id: "zen",
      label: "Toggle distraction-free view",
      category: "System",
      keywords: "zen focus",
    },
  ];
  for (const name of [
    "about",
    "experience",
    "skills",
    "contact",
    "resume",
    "help",
  ])
    actions.push({
      id: `view:${name}`,
      label: name === "resume" ? "Download résumé" : `View ${name}`,
      category: "Personal",
      keywords: name,
    });
  for (const [id, label] of [
    ["warm", "Warm terminal"],
    ["green", "Green phosphor"],
    ["paper", "Light paper"],
    ["slate", "Quiet slate"],
  ])
    actions.push({
      id: `theme:${id}`,
      label: `Theme · ${label}`,
      category: "Appearance",
      keywords: `theme ${id} colors`,
    });
  for (const motion of ["full", "reduced", "off"])
    actions.push({
      id: `motion:${motion}`,
      label: `Motion · ${motion}`,
      category: "Appearance",
      keywords: `animation ${motion}`,
    });
  for (const p of projects) {
    actions.push({
      id: `project:${p.id}`,
      label: `Open ${p.name}`,
      category: "Projects",
      keywords: `${p.id} ${p.area} ${p.stack}`,
    });
    actions.push({
      id: `simulate:${p.id}`,
      label: `Launch ${p.playground === "fleet" ? "VRP routing simulation" : p.playground === "matrix" ? "CUDA matrix playground" : p.name + " lab"}`,
      category: "Playgrounds",
      keywords: `${p.id} ${p.playground} run simulation playground`,
    });
  }
  if (new Set(actions.map((a) => a.id)).size !== actions.length)
    throw new Error("Duplicate action registration");
  return actions;
}
export function fuzzyScore(query: string, text: string): number {
  query = query.toLowerCase().trim();
  text = text.toLowerCase();
  if (!query) return 1;
  let position = 0,
    score = 0,
    previous = -2;
  for (const char of query) {
    if (char === " ") continue;
    const found = text.indexOf(char, position);
    if (found < 0) return -1;
    score += found === previous + 1 ? 8 : 2;
    score += found === 0 || /[ /·:-]/.test(text[found - 1]) ? 4 : 0;
    previous = found;
    position = found + 1;
  }
  return score - (text.length - query.length) * 0.015;
}
export function searchActions(
  actions: ActionDescriptor[],
  query: string,
  recent: string[],
  projectId: string,
): ActionDescriptor[] {
  return actions
    .map((action) => ({
      action,
      score:
        fuzzyScore(query, `${action.label} ${action.keywords}`) +
        (query ? 0 : recent.includes(action.id) ? 30 : 0) +
        (query ? 0 : action.id === `simulate:${projectId}` ? 20 : 0),
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map((x) => x.action);
}
