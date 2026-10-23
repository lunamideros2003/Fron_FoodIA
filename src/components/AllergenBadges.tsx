import type { AllergenInfo } from "../types.ts";
import { WarningIcon } from "./icons.tsx";

interface AllergenBadgesProps {
  allergens: AllergenInfo[];
  containsGluten?: boolean;
  compact?: boolean;
}

/**
 * Allergens always come from the backend, derived from the real ingredient
 * list. When there are none, the app says it explicitly instead of leaving
 * the reader guessing.
 */
export function AllergenBadges({ allergens, containsGluten, compact = false }: AllergenBadgesProps) {
  if (allergens.length === 0 && !containsGluten) {
    return (
      <p className="text-xs text-muted">
        No detectamos alérgenos declarados en los ingredientes.
      </p>
    );
  }

  return (
    <ul className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
      {allergens.map((allergen) => (
        <li
          key={allergen.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-clay-300 bg-peach-100 px-2.5 py-1 text-[0.7rem] font-semibold text-clay-600"
        >
          <WarningIcon className="h-3 w-3" />
          {allergen.label}
        </li>
      ))}
    </ul>
  );
}
