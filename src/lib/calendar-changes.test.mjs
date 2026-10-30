import test from "node:test";
import assert from "node:assert/strict";
import { calendarChanges, monthlyLastObservations } from "./calendar-changes.mjs";

test("missing CPI release cannot shift the year-ago comparison", () => {
  const levels = [
    { date: "2025-08-01", value: 323.976 },
    { date: "2025-09-01", value: 324.245 },
    ...Array.from({ length: 10 }, (_, n) => ({ date: `${2025 + Math.floor((10 + n) / 12)}-${String((10 + n) % 12 + 1).padStart(2, "0")}`, value: 325 + n })),
    { date: "2026-09-01", value: 336.298 },
  ];
  const last = calendarChanges(levels, 12).at(-1);
  assert.equal(last.date, "2026-09");
  assert.equal(Math.round(last.value * 100) / 100, 3.72);
});

test("absent and zero year-ago levels do not create invented observations", () => {
  assert.deepEqual(calendarChanges([{ date: "2025-10", value: 0 }, { date: "2026-09", value: 123 }, { date: "2026-10", value: 124 }], 12), []);
});

test("monthly changes skip a missing month, while quarterly changes use three months", () => {
  const levels = [{ date: "2026-01", value: 100 }, { date: "2026-03", value: 105 }, { date: "2026-04", value: 110 }];
  assert.deepEqual(calendarChanges(levels, 1, { difference: true }), [{ date: "2026-04", value: 5 }]);
  assert.equal(Math.round(calendarChanges(levels, 3)[0].value), 10);
});

test("provider precision is applied once after the complete calculation", () => {
  const rate = calendarChanges([{ date: "2025-08", value: 70780386 }, { date: "2026-08", value: 74567349 }], 12)[0].value;
  assert.equal(Math.round(rate * 10) / 10, 5.4);
});

test("sort observations, ignore missing levels and reject conflicting duplicate months", () => {
  assert.equal(calendarChanges([{ date: "2026-01", value: 110 }, { date: "2025-01", value: 100 }, { date: "2025-06", value: null }], 12).length, 1);
  assert.throws(() => calendarChanges([{ date: "2025-01", value: 100 }, { date: "2025-01", value: 101 }], 12), /Conflicting/);
});

test("bond chart points retain actual observation dates and respect the paired as-of date", () => {
  const observations = [{ date: "2026-09-30", value: 5.29 }, { date: "2026-10-01", value: 5.2 }, { date: "2026-10-22", value: 4.96 }, { date: "2026-10-23", value: 5 }];
  assert.deepEqual(monthlyLastObservations(observations, "2026-10-22"), [observations[0], observations[2]]);
});
