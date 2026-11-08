/** Small helpers for the catalogue screen. */

/**
 * Copy shown above the grid. It never reveals how many recipes exist, because
 * the catalogue grows and the count is not part of the product message.
 */
export function catalogueStatusText(loading: boolean, hasFilters: boolean): string {
  if (loading) return "Buscando recetas…";
  return hasFilters ? "Recetas que encajan con tus filtros" : "Todas las recetas";
}
