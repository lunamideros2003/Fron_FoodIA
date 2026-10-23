import assert from "node:assert/strict";
import test from "node:test";
import { firstName, initials, normalise, parseIngredientInput } from "../src/lib/text.ts";

test("initials takes the first letters of the first and last names", () => {
  assert.equal(initials("Lucía Martínez"), "LM");
  assert.equal(initials("Lucía"), "LU");
  assert.equal(initials("   "), "?");
});

test("firstName keeps only the first word", () => {
  assert.equal(firstName("  Lucía Martínez  "), "Lucía");
});

test("parseIngredientInput accepts commas, semicolons and newlines", () => {
  assert.deepEqual(parseIngredientInput("huevo, tomate; cebolla\narroz"), [
    "huevo",
    "tomate",
    "cebolla",
    "arroz",
  ]);
});

test("parseIngredientInput removes duplicates without caring about case", () => {
  assert.deepEqual(parseIngredientInput("Huevo, huevo, HUEVO, tomate"), ["Huevo", "tomate"]);
});

test("parseIngredientInput respects the maximum", () => {
  assert.equal(parseIngredientInput("a,b,c,d", 2).length, 2);
});

test("normalise removes accents and extra case", () => {
  assert.equal(normalise("  Plátano  "), "platano");
});
