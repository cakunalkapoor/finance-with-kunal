import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../src/lib/range-position.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { rangePosition } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

test("52-week marker maps low, midpoint and high to their positions", () => {
  assert.equal(rangePosition(5, 5, 10), 0);
  assert.equal(rangePosition(7.5, 5, 10), 50);
  assert.equal(rangePosition(10, 5, 10), 100);
});
test("rounding outside the interval keeps the marker inside the bar", () => {
  assert.equal(rangePosition(4.999, 5, 10), 0);
  assert.equal(rangePosition(10.001, 5, 10), 100);
});
test("constant ranges avoid division by zero", () => assert.equal(rangePosition(5, 5, 5), 50));
test("missing, invalid and inverted ranges are unavailable", () => {
  for (const args of [[5, null, 10], [5, 1, undefined], [NaN, 1, 10], [5, 10, 1], [5, 1, Infinity]]) {
    assert.equal(rangePosition(...args), null);
  }
});
test("negative yields and precise exchange rates retain their positions", () => {
  assert.equal(rangePosition(-0.25, -1, 0), 75);
  assert.ok(Math.abs(rangePosition(1.105, 1.1, 1.11) - 50) < 1e-8);
});
