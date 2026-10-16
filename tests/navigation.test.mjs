import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  navigationReducer as reduce,
} from "../src/navigation.mjs";
test("Enter choreographs intro and opens details only from explorer", () => {
  let s = reduce(initialState, { type: "ENTER" });
  assert.equal(s.scene, "ENTERING");
  s = reduce(s, { type: "PROGRESS", value: 0.5 });
  assert.equal(s.progress, 0.5);
  s = reduce(s, { type: "PROGRESS", value: 1 });
  assert.equal(s.scene, "EXPLORER");
  s = reduce(s, { type: "ENTER" });
  assert.equal(s.scene, "PROJECT_DETAIL");
  s = reduce(s, { type: "BACK" });
  assert.equal(s.scene, "EXPLORER");
  s = reduce(s, { type: "BACK" });
  assert.equal(s.scene, "LEAVING");
  assert.equal(reduce(s, { type: "PROGRESS", value: 1 }).scene, "INTRO");
});
test("finite project selection handles rapid navigation and directional feedback", () => {
  let s = { ...initialState, scene: "EXPLORER" };
  for (let i = 0; i < 20; i++)
    s = reduce(s, { type: "NAVIGATE", delta: 1, total: 6, modality: "wheel" });
  assert.equal(s.project, 5);
  assert.equal(s.direction, 1);
  assert.equal(s.key, "j");
  s = reduce(s, {
    type: "NAVIGATE",
    delta: -1,
    total: 6,
    modality: "keyboard",
  });
  assert.equal(s.project, 4);
  assert.equal(s.direction, -1);
  assert.equal(s.key, "k");
});
test("command Enter never enters the explorer and buffers restore context", () => {
  let s = reduce(
    { ...initialState, scene: "PROJECT_DETAIL", project: 3 },
    { type: "COMMAND" },
  );
  assert.equal(reduce(s, { type: "ENTER" }).scene, "COMMAND");
  s = reduce(s, { type: "BUFFER", name: "experience" });
  assert.equal(s.buffer, "experience");
  s = reduce(s, { type: "BACK" });
  assert.equal(s.scene, "PROJECT_DETAIL");
  assert.equal(s.project, 3);
});
test("project command enters from intro and preserves finite selection", () => {
  let s = reduce(initialState, { type: "PROJECTS" });
  assert.equal(s.scene, "ENTERING");
  s = reduce(s, { type: "PROGRESS", value: 1 });
  assert.equal(s.scene, "EXPLORER");
  assert.equal(reduce(s, { type: "NAVIGATE", delta: -1, total: 6 }).project, 0);
});

test("projects and home commands preserve intro transition context", () => {
  const command = reduce(initialState, { type: "COMMAND" });
  assert.equal(reduce(command, { type: "PROJECTS" }).scene, "ENTERING");
  assert.equal(reduce(command, { type: "HOME" }).scene, "INTRO");
});
