import assert from "node:assert/strict";
import test from "node:test";
import {
  clampRecipeIdea,
  cleanRecipeIdea,
  GENERATED_RECIPE_HINT,
  MAX_RECIPE_IDEA,
} from "../src/lib/generatedRecipe.ts";

test("the idea never grows past the limit", () => {
  assert.equal(clampRecipeIdea("a".repeat(MAX_RECIPE_IDEA + 20)).length, MAX_RECIPE_IDEA);
  assert.equal(clampRecipeIdea("cena con calabaza"), "cena con calabaza");
});

test("an empty idea is left undefined so the model can choose", () => {
  assert.equal(cleanRecipeIdea(""), undefined);
  assert.equal(cleanRecipeIdea("   "), undefined);
});

test("the idea is trimmed before it is sent", () => {
  assert.equal(cleanRecipeIdea("  cena rápida  "), "cena rápida");
});

test("the hint says the catalogue has no fixed number", () => {
  assert.match(GENERATED_RECIPE_HINT, /no tiene un número fijo/);
});
