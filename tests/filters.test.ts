import assert from "node:assert/strict";
import test from "node:test";
import {
  parseDiet,
  parseDifficulty,
  parseMinutes,
  parseOffset,
  parseSort,
} from "../src/lib/filters.ts";

test("parseDiet only accepts known diets", () => {
  assert.equal(parseDiet("vegan"), "vegan");
  assert.equal(parseDiet("omnivore"), "omnivore");
  assert.equal(parseDiet("carne"), "");
  assert.equal(parseDiet(null), "");
});

test("parseDifficulty only accepts known difficulties", () => {
  assert.equal(parseDifficulty("facil"), "facil");
  assert.equal(parseDifficulty("imposible"), "");
  assert.equal(parseDifficulty(null), "");
});

test("parseSort only accepts known sort orders", () => {
  assert.equal(parseSort("calories"), "calories");
  assert.equal(parseSort("aleatorio"), "");
  assert.equal(parseSort(null), "");
});

test("parseOffset rejects negative, fractional and invalid offsets", () => {
  assert.equal(parseOffset("24"), 24);
  assert.equal(parseOffset("-1"), 0);
  assert.equal(parseOffset("2.5"), 0);
  assert.equal(parseOffset("abc"), 0);
  assert.equal(parseOffset(null), 0);
});

test("parseMinutes rejects invalid times and caps the maximum", () => {
  assert.equal(parseMinutes("15"), 15);
  assert.equal(parseMinutes("14.6"), 15);
  assert.equal(parseMinutes("0"), undefined);
  assert.equal(parseMinutes("-5"), undefined);
  assert.equal(parseMinutes("999"), 240);
  assert.equal(parseMinutes(null), undefined);
});
