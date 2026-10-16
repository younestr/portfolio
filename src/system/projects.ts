import { projects } from "../content";
import { projectScenes } from "../projectScenes";
import { assembleProjects } from "./registryCore";
export const projectRegistry = assembleProjects(projects, projectScenes);
export const registryScenes = projectRegistry.map((project) => project.scene);
