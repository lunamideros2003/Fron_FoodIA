import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Dish } from "../types.ts";
import { cn } from "../lib/cn.ts";
import { difficultyLabel, formatCalories, formatMinutes } from "../lib/format.ts";
import { DishThumb } from "./DishThumb.tsx";
import { ClockIcon, FlameIcon, HeartFilledIcon, HeartIcon, LeafIcon } from "./icons.tsx";

interface RecipeCardProps {
  dish: Dish;
  favorite?: boolean;
  onToggleFavorite?: (dish: Dish) => void;
  badge?: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function RecipeCard({
  dish,
  favorite = false,
  onToggleFavorite,
  badge,
  footer,
  compact = false,
  className,
}: RecipeCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        <Link to={`/recetas/${dish.slug}`} aria-label={`Ver la receta de ${dish.nameEs}`}>
          <DishThumb
            category={dish.category}
            id={dish.id}
            className={compact ? "h-28 w-full" : "h-36 w-full"}
          />
        </Link>

        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[0.68rem] font-semibold text-ink backdrop-blur">
            {badge}
          </span>
        ) : null}

        {onToggleFavorite ? (
          <button
            type="button"
            onClick={() => onToggleFavorite(dish)}
            aria-label={favorite ? `Quitar ${dish.nameEs} de favoritos` : `Guardar ${dish.nameEs}`}
            aria-pressed={favorite}
            className={cn(
              "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-colors",
              favorite
                ? "border-clay-500 bg-clay-500 text-cream-50"
                : "border-line bg-surface/90 text-ink-soft hover:border-clay-300 hover:text-clay-600",
            )}
          >
            {favorite ? (
              <HeartFilledIcon className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-clay-600">
          {dish.category}
        </p>
        <h3 className="mt-1 font-display text-[1.05rem] leading-snug text-ink">
          <Link to={`/recetas/${dish.slug}`} className="hover:text-clay-600">
            {dish.nameEs}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
          {dish.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 text-sage-600" />
            {formatMinutes(dish.prepMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <FlameIcon className="h-3.5 w-3.5 text-clay-500" />
            {formatCalories(dish.calories)}
          </span>
          <span>{difficultyLabel(dish.difficulty)}</span>
          {dish.isVegan ? (
            <span className="inline-flex items-center gap-1 text-sage-600">
              <LeafIcon className="h-3.5 w-3.5" />
              vegano
            </span>
          ) : dish.isVegetarian ? (
            <span className="inline-flex items-center gap-1 text-sage-600">
              <LeafIcon className="h-3.5 w-3.5" />
              vegetariano
            </span>
          ) : null}
        </div>

        {footer ? <div className="mt-3 border-t border-line pt-3">{footer}</div> : null}
      </div>
    </article>
  );
}
