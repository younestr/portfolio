import test from "node:test";
import assert from "node:assert/strict";
import { advance, keyForChar, fingerForKey, rows } from "../src/engine.mjs";
test("typing emits the physical key for the same character shown by the editor", () => {
  const state = { file: 0, count: 0, phase: "typing", next: 0, key: "" };
  const next = advance(state, [{ code: "A:" }], 10, () => 0);
  assert.equal(next.count, 1);
  assert.equal(next.key, "a");
  const punctuation = advance(next, [{ code: "A:" }], 100, () => 0);
  assert.equal(punctuation.key, ";");
  assert.equal(punctuation.count, 2);
});
test("state machine holds completed code, changes mode, then switches files", () => {
  const snippets = [{ code: "a" }, { code: "b" }];
  const held = advance(
    { file: 0, count: 1, phase: "typing", next: 0, key: "a" },
    snippets,
    100,
  );
  assert.equal(held.phase, "hold");
  assert.equal(advance(held, snippets, 101), held);
  const switching = advance(held, snippets, 4400);
  assert.equal(switching.key, "esc");
  const next = advance(switching, snippets, 5000);
  assert.equal(next.file, 1);
  assert.equal(next.count, 0);
});
test("key mapping covers whitespace, punctuation and finger assignment", () => {
  for (const [char, key] of [
    ["\n", "enter"],
    [" ", "space"],
    ["{", "["],
    ['"', "'"],
    ["?", "/"],
  ])
    assert.equal(keyForChar(char), key);
  assert.deepEqual(fingerForKey("f"), [0, 3]);
  assert.deepEqual(fingerForKey("j"), [1, 3]);
  const physical = rows.flat();
  for (const char of "Hello_world(): {}[]\n")
    assert.ok(physical.includes(keyForChar(char)), char);
});
