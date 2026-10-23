import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCalories,
  formatPercent,
  formatRelativeDate,
  formatServings,
  dishVisual,
} from "../src/lib/format.ts";

test("formatPercent rounds the coverage to a whole percentage", () => {
  assert.equal(formatPercent(0.836), "84%");
  assert.equal(formatPercent(1), "100%");
});

test("formatServings switches between singular and plural", () => {
  assert.equal(formatServings(1), "1 porción");
  assert.equal(formatServings(3), "3 porciones");
});

test("formatCalories rounds and adds the unit", () => {
  assert.equal(formatCalories(419.6), "420 kcal");
});

test("formatRelativeDate uses singular for one day", () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeDate(yesterday), "hace 1 día");
});

test("formatRelativeDate keeps recent values in minutes", () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  assert.equal(formatRelativeDate(fiveMinutesAgo), "hace 5 min");
});

test("dishVisual always returns a usable gradient", () => {
  const visual = dishVisual({ category: "Desayuno", id: 7 });
  assert.match(visual.gradient, /^linear-gradient\(\d+deg,/);
  assert.match(visual.ink, /^#[0-9A-F]{6}$/i);
});
