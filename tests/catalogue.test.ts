import assert from "node:assert/strict";
import test from "node:test";
import { catalogueStatusText } from "../src/lib/catalogue.ts";

test("the catalogue never shows a fixed recipe total", () => {
  const texts = [
    catalogueStatusText(false, false),
    catalogueStatusText(false, true),
    catalogueStatusText(true, false),
    catalogueStatusText(true, true),
  ];

  assert.deepEqual(texts, [
    "Todas las recetas",
    "Recetas que encajan con tus filtros",
    "Buscando recetas…",
    "Buscando recetas…",
  ]);
  assert.ok(texts.every((text) => !/\d/.test(text)));
});
