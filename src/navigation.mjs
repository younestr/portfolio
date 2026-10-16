export const initialState = {
  scene: "INTRO",
  project: 0,
  previousProject: 0,
  direction: 1,
  progress: 1,
  modality: "keyboard",
  query: "",
  error: "",
  buffer: "about",
  returnScene: "INTRO",
  paused: false,
  activity: "idle",
  key: "",
};
const stable = (scene) =>
  ["EXPLORER", "PROJECT_DETAIL"].includes(scene) ? scene : "INTRO";
export function navigationReducer(state, action) {
  // Portal travel is atomic: keyboard, pointer and commands cannot redirect it.
  if (
    ["ENTERING", "LEAVING"].includes(state.scene) &&
    !["PROGRESS", "PAUSE"].includes(action.type)
  )
    return state;
  switch (action.type) {
    case "ENTER":
      if (state.scene === "INTRO")
        return {
          ...state,
          scene: "ENTERING",
          progress: 0,
          modality: action.modality || "keyboard",
          activity: "entering",
          key: "enter",
        };
      if (state.scene === "EXPLORER")
        return {
          ...state,
          scene: "PROJECT_DETAIL",
          progress: 1,
          activity: "reading",
          key: "enter",
        };
      return state;
    case "NAVIGATE": {
      if (
        !["EXPLORER", "PROJECT_TRANSITION", "PROJECT_DETAIL"].includes(
          state.scene,
        )
      )
        return state;
      const next = Math.max(
        0,
        Math.min(
          action.total - 1,
          action.index ?? state.project + action.delta,
        ),
      );
      if (next === state.project) return state;
      return {
        ...state,
        scene: "PROJECT_TRANSITION",
        previousProject: state.project,
        project: next,
        direction: next > state.project ? 1 : -1,
        progress: 0,
        modality: action.modality,
        activity: "selecting",
        key: next > state.project ? "j" : "k",
      };
    }
    case "PROGRESS":
      if (!["ENTERING", "LEAVING", "PROJECT_TRANSITION"].includes(state.scene))
        return state;
      return {
        ...state,
        progress: action.value,
        scene:
          action.value < 1
            ? state.scene
            : state.scene === "LEAVING"
              ? "INTRO"
              : "EXPLORER",
        activity: action.value < 1 ? state.activity : "idle",
        key: action.value < 1 ? state.key : "",
      };
    case "PROJECTS": {
      const origin = ["COMMAND", "BUFFER"].includes(state.scene)
        ? state.returnScene
        : state.scene;
      return {
        ...state,
        scene: origin === "INTRO" ? "ENTERING" : "EXPLORER",
        progress: origin === "INTRO" ? 0 : 1,
        query: "",
        error: "",
        activity: "selecting",
      };
    }
    case "COMMAND":
      if (["ENTERING", "LEAVING"].includes(state.scene)) return state;
      return {
        ...state,
        returnScene:
          state.scene === "BUFFER"
            ? state.returnScene
            : stable(
                state.scene === "PROJECT_TRANSITION" ? "EXPLORER" : state.scene,
              ),
        scene: "COMMAND",
        query: "",
        error: "",
        activity: "command",
        key: "",
      };
    case "QUERY":
      return { ...state, query: action.value, error: "" };
    case "ERROR":
      return { ...state, error: action.message };
    case "BUFFER":
      return {
        ...state,
        scene: "BUFFER",
        buffer: action.name,
        returnScene: ["COMMAND", "BUFFER"].includes(state.scene)
          ? state.returnScene
          : stable(
              state.scene === "PROJECT_TRANSITION" ? "EXPLORER" : state.scene,
            ),
        query: "",
        error: "",
        activity: "reading",
        key: "",
      };
    case "BACK":
      if (["COMMAND", "BUFFER"].includes(state.scene))
        return {
          ...state,
          scene: state.returnScene,
          error: "",
          activity: "idle",
          key: "",
        };
      if (state.scene === "PROJECT_DETAIL")
        return { ...state, scene: "EXPLORER", activity: "idle", key: "esc" };
      if (["EXPLORER", "PROJECT_TRANSITION"].includes(state.scene))
        return {
          ...state,
          scene: "LEAVING",
          progress: 0,
          activity: "returning",
          key: "esc",
        };
      return state;
    case "HOME": {
      const origin = ["COMMAND", "BUFFER"].includes(state.scene)
        ? state.returnScene
        : state.scene;
      return {
        ...state,
        scene: origin === "INTRO" ? "INTRO" : "LEAVING",
        progress: origin === "INTRO" ? 1 : 0,
        query: "",
        error: "",
        activity: "returning",
      };
    }
    case "CLOSE_COMMAND":
      return {
        ...state,
        scene: state.returnScene,
        query: "",
        error: "",
        activity: "idle",
      };
    case "PAUSE":
      return { ...state, paused: !state.paused };
    default:
      return state;
  }
}
