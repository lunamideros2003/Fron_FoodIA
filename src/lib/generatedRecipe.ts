/** Small helpers for the AI recipe generator form. */

export const MAX_RECIPE_IDEA = 240;

export const GENERATED_RECIPE_HINT =
  "El catálogo no tiene un número fijo: cada receta nueva se guarda como una más.";

export function clampRecipeIdea(value: string): string {
  return value.slice(0, MAX_RECIPE_IDEA);
}

/** An empty idea is valid: the model picks a varied recipe on its own. */
export function cleanRecipeIdea(value: string): string | undefined {
  const clean = value.trim();
  return clean.length > 0 ? clean : undefined;
}
