import { useState } from "react";
import { Link } from "react-router-dom";
import type { RecommendedDish, ScoreBreakdown } from "../types.ts";
import { AXIS_LABELS, DIFFICULTY_LABELS, PRICE_LABELS, SCORE_LABELS } from "../lib/format.ts";
import { formatPercent } from "../lib/format.ts";
import { DishThumb } from "./DishThumb.tsx";
import { StarIcon } from "./icons.tsx";

interface DishCardProps {
  item: RecommendedDish;
  rank?: number;
  onRate?: (dishId: number, rating: number) => void;
  onSave?: (dishId: number) => void;
  onDislike?: (dishId: number) => void;
  /** Opens the full recipe in place. */
  onPick?: () => void;
  canPick?: boolean;
  saved?: boolean;
  busy?: boolean;
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value)));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#F5EBE1"
            strokeWidth="5"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="#B08494"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[0.7rem] font-semibold text-plum-700">
          {formatPercent(value)}
        </span>
      </div>
      <span className="max-w-[5.5rem] text-center text-[0.65rem] leading-tight text-cocoa-500">
        {label}
      </span>
    </div>
  );
}

function ScoreBreakdownPanel({ breakdown }: { breakdown: ScoreBreakdown }) {
  const [open, setOpen] = useState(false);

  const channels: { key: keyof ScoreBreakdown; value: number }[] = [
    { key: "moodAffinity", value: breakdown.moodAffinity },
    { key: "tasteMatch", value: breakdown.tasteMatch },
    { key: "collaborative", value: breakdown.collaborative },
    { key: "preferenceFit", value: breakdown.preferenceFit },
    { key: "novelty", value: breakdown.novelty },
    { key: "popularity", value: breakdown.popularity },
  ].filter((channel) => typeof channel.value === "number") as {
    key: keyof ScoreBreakdown;
    value: number;
  }[];

  return (
    <div className="mt-4 rounded-2xl bg-cream-100/80 p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
          Por qué te lo recomienda
        </span>
        <span className="text-xs font-medium text-cocoa-500">
          {open ? "Ocultar" : "Ver desglose"}
        </span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap justify-between gap-4">
            <ScoreRing value={breakdown.moodAffinity} label="Encaje con tu ánimo" />
            <ScoreRing value={breakdown.tasteMatch} label="Tu gusto" />
            <ScoreRing value={breakdown.collaborative} label="Otros como tú" />
            <ScoreRing value={breakdown.preferenceFit} label="Preferencias" />
          </div>

          <div className="space-y-1.5 border-t border-sand-200 pt-3">
            {channels.map((channel) => (
              <div key={String(channel.key)} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-cocoa-600">
                  {SCORE_LABELS[String(channel.key)]}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200">
                  <span
                    className="block h-full rounded-full bg-rose-400"
                    style={{ width: formatPercent(channel.value) }}
                  />
                </span>
                <span className="w-9 text-right text-xs font-medium text-cocoa-500">
                  {formatPercent(channel.value)}
                </span>
              </div>
            ))}
          </div>

          {breakdown.topReasons.length > 0 ? (
            <div className="border-t border-sand-200 pt-3">
              <p className="text-xs font-medium text-cocoa-600">Rasgos que más pesaron:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {breakdown.topReasons.map((reason) => (
                  <span key={reason.axis} className="fm-chip">
                    {AXIS_LABELS[reason.axis] ?? reason.axis}
                    <span className="text-cocoa-500">{formatPercent(reason.contribution)}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function DishCard({
  item,
  rank,
  onRate,
  onSave,
  onDislike,
  onPick,
  canPick = true,
  saved = false,
  busy = false,
}: DishCardProps) {
  const { dish, explanation, breakdown } = item;
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <article
      className="fm-card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
      style={{ animationDelay: `${(rank ?? 0) * 60}ms` }}
    >
      <Link to={`/plato/${dish.slug}`} className="block">
        <div className="relative">
          <DishThumb category={dish.category} id={dish.id} className="h-40 w-full" />
          {rank !== undefined ? (
            <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 font-display text-sm font-semibold text-plum-700 backdrop-blur">
              {rank}
            </span>
          ) : null}
          <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-plum-700 backdrop-blur">
            {formatPercent(breakdown.total)} match
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/plato/${dish.slug}`}
              className="font-display text-xl leading-tight text-plum-700 hover:text-mauve-600"
            >
              {dish.nameEs}
            </Link>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-rose-400">
              {dish.category}
            </p>
          </div>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cocoa-600">
          <span>{dish.prepMinutes} min</span>
          <span>{dish.calories} kcal</span>
          <span>{dish.proteinGrams} g proteína</span>
          <span>{PRICE_LABELS[dish.priceLevel]}</span>
          <span>{DIFFICULTY_LABELS[dish.difficulty]}</span>
          {dish.nutrition.sugarGrams >= 12 ? (
            <span className="text-rose-400">{dish.nutrition.sugarGrams} g azúcar</span>
          ) : null}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-cocoa-600">{explanation}</p>

        {onRate || onSave || onDislike || onPick ? (
          <div className="mt-4 border-t border-sand-200 pt-4">
            {onPick ? (
              <button
                type="button"
                disabled={busy || !canPick}
                onClick={onPick}
                className="fm-button fm-button-primary w-full justify-center text-sm"
                title={
                  canPick
                    ? "Ver la receta y armar el plan del resto del día"
                    : "Crea un perfil para usar esta opción"
                }
              >
                {canPick ? "Lo quiero, ver receta" : "Crea un perfil para elegir"}
              </button>
            ) : null}

            {onRate || onSave || onDislike ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <div
                  className="flex items-center gap-1"
                  role="group"
                  aria-label={`Calificar ${dish.nameEs}`}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={busy}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => onRate?.(dish.id, value)}
                      className={`rounded-lg p-1 transition-transform ${
                        value <= hoverRating ? "scale-110" : "opacity-40 hover:opacity-80"
                      }`}
                      aria-label={`${value} de 5`}
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  {onSave ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onSave(dish.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        saved
                          ? "border-transparent bg-mauve-600 text-cream-50"
                          : "border-sand-300 text-cocoa-600 hover:border-rose-300 hover:text-mauve-600"
                      }`}
                    >
                      {saved ? "Guardado" : "Guardar"}
                    </button>
                  ) : null}
                  {onDislike ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDislike(dish.id)}
                      className="rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-cocoa-600 transition-colors hover:border-rose-400 hover:text-rose-500"
                    >
                      No es para mí
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <ScoreBreakdownPanel breakdown={breakdown} />
      </div>
    </article>
  );
}
