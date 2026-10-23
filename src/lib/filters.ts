import type { Diet, Dish, DishSort } from "../types.ts";

const DIETS: readonly Diet[] = ["omnivore", "vegetarian", "vegan", "pescatarian"];
const DIFFICULTIES: readonly Dish["difficulty"][] = ["facil", "media", "avanzada"];
const SORTS: readonly DishSort[] = ["prep", "calories", "name"];

export function parseDiet(value: string | null): Diet | "" {
  return DIETS.includes(value as Diet) ? (value as Diet) : "";
}

export function parseDifficulty(value: string | null): Dish["difficulty"] | "" {
  return DIFFICULTIES.includes(value as Dish["difficulty"])
    ? (value as Dish["difficulty"])
    : "";
}

export function parseSort(value: string | null): DishSort | "" {
  return SORTS.includes(value as DishSort) ? (value as DishSort) : "";
}

export function parseOffset(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function parseMinutes(value: string | null): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(240, Math.round(parsed)) : undefined;
}
