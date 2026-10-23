import { Link } from "react-router-dom";
import type { RecommendedDish, StructuredRecommendation } from "../types.ts";
import { formatMinutes, formatCalories } from "../lib/format.ts";
import { cn } from "../lib/cn.ts";
import { DishThumb } from "./DishThumb.tsx";
import { HeartFilledIcon, HeartIcon, InfoIcon, WarningIcon } from "./icons.tsx";

interface MoodResultCardProps {
  item: RecommendedDish;
  structured?: StructuredRecommendation;
  rank: number;
  favorite: boolean;
  onToggleFavorite: () => void;
}

export function MoodResultCard({
  item,
  structured,
  rank,
  favorite,
  onToggleFavorite,
}: MoodResultCardProps) {
  const { dish } = item;
  const match = Math.round(item.breakdown.total * 100);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-surface transition-shadow hover:shadow-lift",
        rank === 1 ? "border-clay-300" : "border-line",
      )}
    >
      <div className="relative">
        <DishThumb category={dish.category} id={dish.id} className="h-40 w-full" />
        <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 font-display text-sm font-semibold text-ink backdrop-blur">
          {rank}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[0.68rem] font-semibold text-clay-600 backdrop-blur">
          {match}% de encaje
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-clay-600">
              {dish.category}
            </p>
            <h3 className="mt-1 font-display text-lg leading-snug text-ink">{dish.nameEs}</h3>
          </div>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? `Quitar ${dish.nameEs} de favoritos` : `Guardar ${dish.nameEs}`}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
              favorite
                ? "border-clay-500 bg-clay-500 text-cream-50"
                : "border-line text-ink-soft hover:border-clay-300 hover:text-clay-600",
            )}
          >
            {favorite ? <HeartFilledIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
          </button>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">
          {structured?.reason ?? dish.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] text-muted">
          <span>{formatMinutes(dish.prepMinutes)}</span>
          <span>{formatCalories(dish.calories)}</span>
          {structured?.timeMatch ? <span className="text-sage-600">Cabe en tu tiempo</span> : null}
        </div>

        {structured && structured.preferencesSatisfied.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {structured.preferencesSatisfied.slice(0, 4).map((reason) => (
              <li key={reason} className="fm-chip fm-chip-sage text-[0.65rem]">
                {reason}
              </li>
            ))}
          </ul>
        ) : null}

        {structured && structured.warnings.length > 0 ? (
          <ul className="mt-3 space-y-1.5 rounded-lg bg-peach-100 px-3 py-2">
            {structured.warnings.map((warning) => (
              <li key={warning} className="flex gap-1.5 text-[0.68rem] leading-relaxed text-clay-600">
                <WarningIcon className="mt-0.5 h-3 w-3 shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="inline-flex items-center gap-1 text-[0.65rem] text-muted">
            <InfoIcon className="h-3 w-3" />
            {dish.difficulty === "facil" ? "Fácil" : dish.difficulty === "media" ? "Media" : "Avanzada"}
          </span>
          <Link to={`/recetas/${dish.slug}`} className="fm-button fm-button-primary !px-3.5 !py-2 text-xs">
            Ver receta
          </Link>
        </div>
      </div>
    </article>
  );
}
