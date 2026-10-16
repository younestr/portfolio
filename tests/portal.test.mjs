import test from "node:test";
import assert from "node:assert/strict";
import {
  portalTimeline,
  createParticleField,
  projectStreak,
} from "../src/portal.mjs";
import {
  initialState,
  navigationReducer as reduce,
} from "../src/navigation.mjs";
test("travel accelerates with perspective and decelerates into arrival", () => {
  assert.ok(portalTimeline(0.65).speed > portalTimeline(0.2).speed * 3);
  assert.ok(portalTimeline(0.98).speed < portalTimeline(0.65).speed * 0.2);
  let distance = -1;
  for (let i = 0; i <= 100; i++) {
    const t = portalTimeline(i / 100);
    assert.ok(t.travel >= distance);
    distance = t.travel;
    assert.ok(Object.values(t).every(Number.isFinite));
  }
  const near = projectStreak(1, 0.4, 500, 4),
    far = projectStreak(1, 2, 500, 4);
  assert.ok(near[0] - near[1] > (far[0] - far[1]) * 10);
  assert.ok(
    projectStreak(1, 1, 500, 4, true)[1] > projectStreak(1, 1, 500, 4, true)[0],
  );
});
test("arrival is prepared under the opaque warp in either direction", () => {
  assert.equal(portalTimeline(0).entry, 0);
  assert.equal(portalTimeline(1).entry, 1);
  assert.equal(portalTimeline(0, true).entry, 1);
  assert.equal(portalTimeline(1, true).entry, 0);
  assert.equal(portalTimeline(0).opacity, 0);
  assert.equal(portalTimeline(1).opacity, 0);
  assert.ok(portalTimeline(0.8).entry > 0.98);
  assert.ok(portalTimeline(0.6).opacity > 0.99);
  assert.equal(portalTimeline(0.5, false, true).entry, 0.5);
});
test("repeated navigation cannot interrupt a portal or reset its progress", () => {
  for (const scene of ["ENTERING", "LEAVING"]) {
    const s = {
      ...initialState,
      scene,
      progress: 0.45,
      project: 3,
      paused: true,
    };
    for (const type of [
      "ENTER",
      "HOME",
      "BACK",
      "COMMAND",
      "BUFFER",
      "PROJECTS",
      "NAVIGATE",
    ])
      assert.equal(reduce(s, { type, index: 0, total: 6 }), s);
    const complete = reduce(s, { type: "PROGRESS", value: 1 });
    assert.equal(complete.scene, scene === "ENTERING" ? "EXPLORER" : "INTRO");
    assert.equal(complete.project, 3);
    assert.equal(complete.paused, true);
  }
});
test("particle field is finite, preallocated and repeatable", () => {
  const a = createParticleField(1500),
    b = createParticleField(1500);
  assert.equal(a.length, 9000);
  assert.deepEqual(a, b);
  assert.ok(a.every(Number.isFinite));
});
