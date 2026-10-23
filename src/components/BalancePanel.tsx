import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { cn } from "../lib/cn.ts";
import { formatCalories, formatPercent } from "../lib/format.ts";
import { ServingsControl } from "./ServingsControl.tsx";
import { ErrorState, Skeleton } from "./Feedback.tsx";
import { CheckCircleIcon, RefreshIcon, ScaleIcon } from "./icons.tsx";
import type { BalanceResponse, Dish, MoodKey } from "../types.ts";

const SEVERITY = {
  ok: { label: "Bajo control", chip: "fm-chip fm-chip-sage" },
  watch: { label: "Para vigilar", chip: "fm-chip fm-chip-peach" },
  high: { label: "Carga alta", chip: "fm-chip fm-chip-warning" },
  over: { label: "Por encima del objetivo", chip: "fm-chip bg-danger-500/10 text-danger-600" },
} as const;

interface BalancePanelProps {
  userId: number;
  dish: Dish;
  defaultServings?: number;
  moodKey?: MoodKey | null;
  onLogged?: () => Promise<void> | void;
}

export function BalancePanel({
  userId,
  dish,
  defaultServings = 1,
  moodKey,
  onLogged,
}: BalancePanelProps) {
  const [open, setOpen] = useState(false);
  const [servings, setServings] = useState(Math.min(6, Math.max(1, defaultServings)));
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = async (nextServings = servings, includeDish = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.balance({
        userId,
        moodKey: moodKey ?? undefined,
        justChosenDishId: includeDish ? dish.id : null,
        servingsEaten: includeDish ? nextServings : undefined,
      });
      setBalance(response);
    } catch {
      setError("No pudimos calcular el resto de tu día.");
    } finally {
      setLoading(false);
    }
  };

  const openPanel = () => {
    setOpen(true);
    if (!balance) void preview();
  };

  const logMeal = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.markConsumed(userId, dish.id, moodKey ?? null, servings);
      await onLogged?.();
      setLogged(true);
      await preview(servings, false);
    } catch {
      setError("No pudimos registrar la receta en tu día.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="flex items-center gap-2 font-display text-base text-ink">
          <ScaleIcon className="h-4 w-4 text-clay-500" />
          El resto de tu día
        </h2>
        <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
          Si hoy ya comiste algo pesado, te propongo opciones ligeras para compensar sin saltarte
          comidas.
        </p>
        <button
          type="button"
          onClick={openPanel}
          className="fm-button fm-button-secondary mt-3 w-full !py-2 text-xs"
        >
          Planear con esta receta
        </button>
      </section>
    );
  }

  const severity = balance ? SEVERITY[balance.severity] : null;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base text-ink">
            <ScaleIcon className="h-4 w-4 text-clay-500" />
            El resto de tu día
          </h2>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
            Estimación con lo que ya registraste hoy más esta receta.
          </p>
        </div>
        {severity ? <span className={severity.chip}>{severity.label}</span> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-50 px-3 py-2">
        <span className="text-[0.7rem] font-semibold text-ink-soft">Porciones que vas a comer</span>
        <ServingsControl
          value={servings}
          max={6}
          disabled={loading || busy}
          onChange={(next) => {
            setServings(next);
            setLogged(false);
            void preview(next);
          }}
        />
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <div className="mt-3">
          <ErrorState message={error} onRetry={() => void preview()} />
        </div>
      ) : balance ? (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold leading-snug text-ink">{balance.headline}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-soft">{balance.message}</p>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-[0.68rem]">
              <span className="text-muted">
                {formatCalories(balance.totals.calories)} de{" "}
                {formatCalories(balance.totals.goalCalories)}
              </span>
              <span className="font-semibold text-ink">{formatPercent(balance.calorieProgress)}</span>
            </div>
            <span className="mt-1 block h-2 overflow-hidden rounded-full bg-cream-100">
              <span
                className={cn(
                  "block h-full rounded-full",
                  balance.calorieProgress > 1 ? "bg-danger-500" : "bg-clay-500",
                )}
                style={{ width: `${Math.min(100, Math.max(2, balance.calorieProgress * 100))}%` }}
              />
            </span>
            <div className="mt-1 flex flex-wrap gap-x-3 text-[0.65rem] text-muted">
              <span>Azúcar {balance.totals.sugarGrams} g</span>
              <span>Proteína {balance.totals.proteinGrams} g</span>
              <span>Fibra {balance.totals.fiberGrams} g</span>
            </div>
          </div>

          {balance.consumed.length > 0 ? (
            <details className="rounded-lg bg-cream-50 px-3 py-2">
              <summary className="cursor-pointer text-[0.68rem] font-semibold text-ink-soft">
                Lo que suma hoy ({balance.consumed.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {balance.consumed.map((item) => (
                  <li
                    key={`${item.dishId}-${item.eatenAt}`}
                    className="flex items-center justify-between gap-2 text-[0.65rem] text-muted"
                  >
                    <span className="truncate">
                      {item.nameEs}
                      {item.servings > 1 ? ` ×${item.servings}` : ""}
                    </span>
                    <span className="shrink-0">{formatCalories(item.calories)}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {balance.suggestions.length > 0 ? (
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                Para el resto del día
              </p>
              <ul className="mt-2 space-y-2">
                {balance.suggestions.slice(0, 3).map((item) => (
                  <li key={item.dish.id}>
                    <Link
                      to={`/recetas/${item.dish.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream-50 px-3 py-2 transition-colors hover:border-clay-300"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-ink">
                          {item.dish.nameEs}
                        </span>
                        <span className="block truncate text-[0.65rem] text-muted">
                          {item.dish.prepMinutes} min · {item.explanation}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-[0.65rem] text-muted">
                        <span className="block font-semibold text-ink">
                          {formatCalories(item.dish.calories)}
                        </span>
                        {item.dish.nutrition.sugarGrams} g azúcar
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {balance.comfortOption ? (
            <Link
              to={`/recetas/${balance.comfortOption.dish.slug}`}
              className="block rounded-xl border border-sage-200 bg-sage-100 px-3 py-2"
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-sage-600">
                Si el ánimo sigue bajo
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-ink">
                {balance.comfortOption.dish.nameEs}
              </span>
              <span className="block text-[0.65rem] text-muted">
                {formatCalories(balance.comfortOption.dish.calories)} · cálido y ligero
              </span>
            </Link>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => void preview()}
              disabled={loading || busy}
              className="fm-button fm-button-ghost !px-2 !py-1.5 text-[0.68rem]"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              Recalcular
            </button>

            {onLogged ? (
              logged ? (
                <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-sage-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Registrada en tu día
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void logMeal()}
                  disabled={busy}
                  className="fm-button fm-button-primary !px-2.5 !py-1.5 text-[0.68rem]"
                >
                  {busy ? "Registrando…" : "Registrar en mi día"}
                </button>
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
