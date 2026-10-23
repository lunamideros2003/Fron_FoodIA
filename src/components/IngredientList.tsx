import type { DishIngredient, ScaledIngredient } from "../types.ts";
import { cn } from "../lib/cn.ts";

type Ingredient = DishIngredient | ScaledIngredient;

function isScaled(item: Ingredient): item is ScaledIngredient {
  return "originalQuantity" in item;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  onSubstitute?: (ingredient: Ingredient) => void;
  busyIngredient?: string | null;
}

export function IngredientList({ ingredients, onSubstitute, busyIngredient }: IngredientListProps) {
  return (
    <ul className="divide-y divide-line">
      {ingredients.map((item) => {
        const scaled = isScaled(item);
        const changed = scaled && item.originalQuantity !== item.quantity;

        return (
          <li
            key={`${item.ingredientId}-${item.label}`}
            className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
          >
            <span className="min-w-0 text-ink">
              {item.label}
              {item.optional ? (
                <span className="ml-2 text-[0.68rem] font-medium text-muted">opcional</span>
              ) : null}
              {scaled && item.approximate ? (
                <span
                  className="ml-2 text-[0.68rem] font-medium text-clay-600"
                  title="La cantidad no se puede escalar con precisión"
                >
                  aproximadamente
                </span>
              ) : null}
            </span>

            <span className="flex shrink-0 items-baseline gap-2">
              <span className={cn("text-xs font-semibold", changed ? "text-clay-600" : "text-ink-soft")}>
                {item.quantity}
              </span>
              {changed ? (
                <span className="text-[0.65rem] text-muted line-through">{item.originalQuantity}</span>
              ) : null}
              {onSubstitute ? (
                <button
                  type="button"
                  onClick={() => onSubstitute(item)}
                  disabled={busyIngredient === item.label}
                  className="text-[0.68rem] font-semibold text-clay-600 underline-offset-2 hover:underline disabled:opacity-50"
                >
                  {busyIngredient === item.label ? "…" : "Sustituir"}
                </button>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
