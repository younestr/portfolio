export type PlaygroundKind =
  "fleet" | "vision" | "agent" | "matrix" | "vehicle" | "inspection";
export type Overview = {
  name: string;
  file: string;
  area: string;
  stack: string;
  description: string;
  challenge: string;
  contribution: string;
  status: string;
  url?: string;
};
export type ExplorerScene = {
  slug: string;
  short: string;
  file: string;
  mode: string;
  command: string;
  notes: string[];
  code: string;
  meta: string;
  caption: string;
};
export type ProjectRecord = Overview & {
  id: string;
  index: number;
  directory: string;
  playground: PlaygroundKind;
  scene: ExplorerScene;
  commands: string[];
};
export function assembleProjects(
  overviews: Overview[],
  scenes: ExplorerScene[],
): ProjectRecord[] {
  if (overviews.length !== scenes.length || overviews.length !== 6)
    throw new Error("Project registry requires six matched scenes.");
  const kinds: PlaygroundKind[] = [
    "fleet",
    "vision",
    "agent",
    "matrix",
    "vehicle",
    "inspection",
  ];
  const ids = new Set<string>();
  return overviews.map((project, index) => {
    const scene = scenes[index];
    if (!scene.slug || ids.has(scene.slug))
      throw new Error("Project IDs must be unique.");
    ids.add(scene.slug);
    return {
      ...project,
      id: scene.slug,
      index,
      directory: `/home/younes/projects/${scene.slug}`,
      playground: kinds[index],
      scene,
      commands: [`open ${scene.slug}`, `simulate ${scene.slug}`],
    };
  });
}
