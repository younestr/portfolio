import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(file) {
  const source = await readFile(
    new URL("../src/" + file, import.meta.url),
    "utf8",
  );
  return import(
    "data:text/javascript;base64," +
      Buffer.from(
        ts.transpileModule(source, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      ).toString("base64")
  );
}
const [
  data,
  scenes,
  registry,
  actions,
  shell,
  fleet,
  matrix,
  vehicle,
  inspection,
  agent,
] = await Promise.all(
  [
    "content.ts",
    "projectScenes.ts",
    "system/registryCore.ts",
    "system/actions.ts",
    "system/shell.ts",
    "playgrounds/fleetLogic.ts",
    "playgrounds/matrixLogic.ts",
    "playgrounds/vehicleLogic.ts",
    "playgrounds/inspectionLogic.ts",
    "playgrounds/agentLogic.ts",
  ].map(load),
);
const projects = registry.assembleProjects(data.projects, scenes.projectScenes);
const fs = shell.createVirtualFS({ ...data, projects });
const ctx = {
  fs,
  projects,
  identity: data.profile.name,
  skills: "skills",
  experience: "experience",
  education: "education",
  contact: data.profile.email,
  status: { scene: "EXPLORER" },
  uptime: 12,
};
test("one validated registry maps all six projects to unique actions and virtual paths", () => {
  assert.equal(projects.length, 6);
  assert.equal(new Set(projects.map((p) => p.playground)).size, 6);
  const list = actions.createActions(projects);
  assert.equal(new Set(list.map((a) => a.id)).size, list.length);
  for (const p of projects) {
    assert.ok(fs[p.directory + "/README.md"]);
    assert.ok(list.some((a) => a.id === "simulate:" + p.id));
  }
  assert.throws(() => registry.assembleProjects([], []));
  assert.throws(() =>
    registry.assembleProjects(
      data.projects,
      scenes.projectScenes.map((s) => ({ ...s, slug: "same" })),
    ),
  );
  assert.ok(
    actions
      .searchActions(list, "CUDA", [], projects[0].id)
      .some((a) => a.id.includes("simulate:")),
  );
  assert.equal(actions.fuzzyScore("xyz", "abc"), -1);
  assert.equal(
    actions.searchActions(list, "", ["terminal"], projects[0].id)[0].id,
    "terminal",
  );
});
test("shell parses quoted paths, normalizes virtual traversal and rejects evaluation", () => {
  assert.deepEqual(shell.parseCommand('cat "a b.md"'), ["cat", "a b.md"]);
  assert.equal(shell.normalizePath("../../../../etc", shell.HOME), "/etc");
  assert.equal(shell.normalizePath("~/projects"), shell.HOME + "/projects");
  for (const s of ["ls | cat", "ls; pwd", 'cat "broken', "echo `x`"])
    assert.throws(() => shell.parseCommand(s));
});
test("shell directory, files, history, aliases, failures and completions are coherent", () => {
  let s = shell.initialShell();
  const run = (c) => {
    const r = shell.executeShell(s, c, ctx);
    s = r.state;
    return r.result;
  };
  assert.equal(run("pwd").lines[0], shell.HOME);
  run("cd projects");
  assert.equal(s.cwd, shell.HOME + "/projects");
  run("cd -");
  assert.equal(s.cwd, shell.HOME);
  assert.match(run("cat about.md").lines[0], /Younes/);
  assert.ok(run("ll").links.length);
  assert.equal(run("simulate 1").action, "simulate:" + projects[0].id);
  assert.equal(run("rm -rf /").error, true);
  assert.equal(run("cat /etc/passwd").error, true);
  assert.ok(shell.completeShell("sim", s.cwd, fs).includes("simulate "));
  assert.ok(shell.completeShell("cat abo", s.cwd, fs).includes("cat about.md"));
  assert.match(run("history").lines[0], /pwd/);
  run("clear");
  assert.equal(s.entries.length, 0);
  assert.ok(s.history.length > 0);
  for (let i = 0; i < 220; i++) run("pwd");
  assert.equal(s.history.length, 200);
  assert.equal(s.entries.length, 160);
});
test("fleet obeys capacity, serves unique stops and improves actual distance", () => {
  const nodes = fleet.fleetSeed(),
    r = fleet.solveFleet(nodes, 3, 8);
  assert.equal(r.improved.unassigned.length, 0);
  const ids = r.improved.routes.flatMap((r) => r.stops);
  assert.equal(new Set(ids).size, nodes.length);
  assert.ok(r.improved.routes.every((r) => r.load <= 8));
  assert.ok(r.improved.distance <= r.baseline.distance + 1e-8);
  assert.ok(fleet.solveFleet(nodes, 1, 1).improved.unassigned.length > 0);
});
test("every naive and tiled schedule calculates the same real matrix product", () => {
  assert.deepEqual(
    matrix.multiply(
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ],
    ),
    [
      [19, 22],
      [43, 50],
    ],
  );
  for (const n of [2, 4, 8])
    for (const tile of [1, 2, 4].filter((t) => n % t === 0))
      for (const mode of ["naive", "tiled"]) {
        const A = matrix.createMatrix(n),
          B = matrix.createMatrix(n, 2);
        let C = matrix.zeroMatrix(n),
          ops = 0;
        for (const event of matrix.matrixSchedule(n, tile, mode)) {
          C = matrix.applyTile(C, A, B, event);
          ops += event.rows.length * event.cols.length * event.ks.length;
        }
        assert.deepEqual(C, matrix.multiply(A, B));
        assert.equal(ops, n ** 3);
      }
  assert.throws(() => matrix.matrixSchedule(4, 3, "tiled"));
});
test("vehicle feedback advances position, senses obstacles and detects collisions", () => {
  const track = vehicle.makeTrack(),
    v = vehicle.initialVehicle(),
    config = { speed: 40, gain: 1, controller: "pursuit" },
    far = { x: 0, y: 0, radius: 12 };
  const next = vehicle.stepVehicle(v, 0.1, config, track, far);
  assert.ok(next.distance > 0);
  assert.notEqual(next.heading, v.heading);
  assert.ok(vehicle.sensorDistance(v, { x: 420, y: 195, radius: 10 }, 0) < 30);
  assert.equal(
    vehicle.stepVehicle(v, 0.1, config, track, { x: 420, y: 195, radius: 10 })
      .status,
    "obstacle braking",
  );
  assert.equal(
    vehicle.stepVehicle(v, 0.1, config, track, { x: 420, y: 160, radius: 10 })
      .status,
    "collision",
  );
  assert.equal(
    vehicle.stepVehicle({ ...v, x: 600 }, 0.1, config, track, far).status,
    "off track",
  );
});
test("conveyor classification is deterministic, threshold-sensitive and counted once", () => {
  const f = inspection.makeFeatures(2, "crack");
  assert.deepEqual(f, inspection.makeFeatures(2, "crack"));
  assert.equal(inspection.classify(f, 0.7).reject, true);
  assert.equal(inspection.classify(f, 0.99).reject, false);
  let state = {
    ...inspection.initialLine(),
    products: [{ id: 2, x: 260, features: f, counted: false }],
  };
  state = inspection.advanceLine(state, 1, 230, 0.7);
  assert.equal(state.inspected, 1);
  assert.equal(state.rejected, 1);
  state = inspection.advanceLine(state, 0.01, 10, 0.7);
  assert.equal(state.rejected, 1);
  assert.equal(
    inspection.injectProduct(state, "stain").nextId,
    state.nextId + 1,
  );
});
test("all fictional agent scenarios cite retrieved sources and compute expected facts", () => {
  for (const scenario of agent.scenarios) {
    const result = agent.agentExecution(scenario);
    assert.equal(result.stages.length, 6);
    assert.ok(
      result.checks.every((c) => c.pass),
      scenario.id,
    );
    assert.ok(result.answer.includes(scenario.expected));
  }
});

test("synthetic vision responds to pose and threshold without model inference", async () => {
  const v = await load("playgrounds/visionLogic.ts");
  assert.equal(v.attention(0, 0, false, 0.6), "attentive");
  assert.equal(v.attention(-35, 0, false, 0.6), "looking left");
  assert.equal(v.attention(0, 0, true, 0.6), "eyes closed");
  assert.equal(v.attention(35, 0, false, 0.99), "below detection threshold");
  assert.ok(v.gazeAngles(0.8, 0.5).yaw > 0);
  assert.ok(
    v
      .faceLandmarks(30, 15)
      .every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
  );
});
test("shared actions reveal projects through the existing atomic portal", async () => {
  const { initialState, navigationReducer: r } =
    await import("../src/navigation.mjs");
  const entering = r(initialState, {
    type: "REVEAL_PROJECT",
    index: 3,
    total: 6,
  });
  assert.equal(entering.scene, "ENTERING");
  assert.equal(entering.project, 3);
  assert.equal(
    r(entering, { type: "REVEAL_PROJECT", index: 1, total: 6 }),
    entering,
  );
  assert.equal(
    r(
      { ...initialState, scene: "EXPLORER" },
      { type: "REVEAL_PROJECT", index: 99, total: 6 },
    ).project,
    5,
  );
  assert.equal(r(entering, { type: "SET_PAUSED", value: true }).paused, true);
});
