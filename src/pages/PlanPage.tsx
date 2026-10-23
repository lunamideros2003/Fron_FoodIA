import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, api } from "../lib/api.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { usePersistentState } from "../hooks/usePersistentState.ts";
import { useUser } from "../context/UserContext.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { Toast } from "../components/Toast.tsx";
import { EmptyState, ErrorState, Skeleton } from "../components/Feedback.tsx";
import {
  BowlIcon,
  CheckIcon,
  ChefIcon,
  ClockIcon,
  DiceIcon,
  HeartFilledIcon,
  HeartIcon,
  ScrollIcon,
  SparkIcon,
} from "../components/icons.tsx";
import { cn } from "../lib/cn.ts";
import { MEAL_SLOT_LABELS, formatCalories } from "../lib/format.ts";
import { parseIngredientInput } from "../lib/text.ts";
import type { CravingKey, MealPlanResponse, MoodKey } from "../types.ts";

const MOODS: { key: MoodKey | ""; label: string }[] = [
  { key: "", label: "Sin ánimo concreto" },
  { key: "tired", label: "Cansada" },
  { key: "happy", label: "Con ganas" },
  { key: "stressed", label: "Estresada" },
  { key: "sad", label: "Bajita" },
  { key: "no_energy", label: "Sin energía" },
  { key: "in_a_hurry", label: "Con prisa" },
];

const CRAVINGS: { key: CravingKey; label: string }[] = [
  { key: "surprise", label: "Variado" },
  { key: "savory", label: "Salado" },
  { key: "sweet", label: "Dulce" },
  { key: "light", label: "Ligero" },
  { key: "comfort", label: "Reconfortante" },
];

const DAY_OPTIONS = [3, 5, 7];

const PREP_OPTIONS = [
  { value: "", label: "Sin límite de tiempo" },
  { value: "15", label: "15 minutos por comida" },
  { value: "30", label: "30 minutos por comida" },
  { value: "45", label: "45 minutos por comida" },
];

function formatDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function PlanPage() {
  useDocumentTitle("Mi plan de comidas");
  const { user, favoriteIds, toggleFavorite } = useUser();
  const { toast, show, clear } = useToast();

  const [days, setDays] = usePersistentState("foodmood.plan.days", 3);
  const [mood, setMood] = usePersistentState<MoodKey | "">("foodmood.plan.mood", "");
  const [craving, setCraving] = usePersistentState<CravingKey>(
    "foodmood.plan.craving",
    "surprise",
  );
  const [maxPrep, setMaxPrep] = usePersistentState("foodmood.plan.maxPrep", "");
  const [pantry, setPantry] = usePersistentState("foodmood.plan.pantry", "");
  const [plan, setPlan] = usePersistentState<MealPlanResponse | null>(
    "foodmood.plan.result",
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const response = await api.planMeals({
        days,
        moodKey: mood || undefined,
        craving: craving === "surprise" ? undefined : craving,
        maxPrepMinutes: maxPrep === "" ? undefined : Number(maxPrep),
        availableIngredients: parseIngredientInput(pantry),
        userId: user?.id,
      });
      setPlan(response);
    } catch (cause) {
      setPlan(null);
      setError(
        cause instanceof ApiError ? cause.message : "No pudimos armar el plan esta vez.",
      );
    } finally {
      setLoading(false);
    }
  };

  const useSavedPantry = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("foodmood.pantry.ingredients") ?? "[]");
      const items = Array.isArray(stored)
        ? stored.filter((item): item is string => typeof item === "string")
        : [];

      if (items.length === 0) {
        show("Tu despensa todavía está vacía.", "info");
        return;
      }

      setPantry(items.join(", "));
      show("Trajimos los ingredientes de tu despensa.", "success");
    } catch {
      show("No pudimos leer tu despensa.", "error");
    }
  };

  const copyList = async () => {
    if (!plan) return;
    const lines = plan.shoppingList.map(
      (item) => `- ${item.name} (${item.quantity}) · ${item.fromRecipes} receta(s)`,
    );
    const text = ["Lista de compras · FoodMood", "", ...lines].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      show("Lista copiada al portapapeles.", "success");
    } catch {
      show("No pudimos copiar la lista. Puedes seleccionarla a mano.", "error");
    }
  };

  const toggleFavoriteDish = async (dishId: number, name: string) => {
    try {
      const saved = await toggleFavorite(dishId);
      show(saved ? `Guardaste ${name}.` : `Quitaste ${name} de favoritos.`, "success");
    } catch {
      show("No pudimos guardar el favorito.", "error");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Mi plan"
        title="Un plan que sí puedes seguir"
        description="Elige cuántos días quieres organizar y te propongo recetas reales para desayuno, almuerzo, cena y merienda, con lista de compras incluida."
        actions={
          plan ? (
            <button
              type="button"
              onClick={() => void generate()}
              disabled={loading}
              className="fm-button fm-button-secondary"
            >
              <DiceIcon className="h-4 w-4" />
              Regenerar plan
            </button>
          ) : undefined
        }
      />

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5" aria-labelledby="plan-form">
        <h2 id="plan-form" className="font-display text-lg text-ink">
          Arma tu plan
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          No es una dieta ni un objetivo calórico. Solo una forma de no pensar cada día qué cocinar.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="fm-label">Días</span>
            <div className="flex gap-1.5">
              {DAY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  aria-pressed={days === option}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                    days === option
                      ? "border-clay-500 bg-clay-500 text-cream-50"
                      : "border-line bg-surface text-ink-soft hover:border-clay-300",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="fm-label">Ánimo de partida</span>
            <select
              value={mood}
              onChange={(event) => setMood(event.target.value as MoodKey | "")}
              className="fm-input cursor-pointer text-xs"
            >
              {MOODS.map((option) => (
                <option key={option.key || "none"} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="fm-label">Tiempo por comida</span>
            <select
              value={maxPrep}
              onChange={(event) => setMaxPrep(event.target.value)}
              className="fm-input cursor-pointer text-xs"
            >
              {PREP_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="fm-label">Ingredientes que quieres usar</span>
            <input
              value={pantry}
              onChange={(event) => setPantry(event.target.value)}
              placeholder="arroz, huevo, tomate"
              className="fm-input text-xs"
            />
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="fm-hint">Opcional, separados por comas.</span>
              <button
                type="button"
                onClick={useSavedPantry}
                className="shrink-0 text-[0.65rem] font-semibold text-clay-600 hover:underline"
              >
                Usar mi despensa
              </button>
            </span>
          </label>
        </div>

        <div className="mt-3">
          <span className="fm-label">Antojo</span>
          <div className="flex flex-wrap gap-1.5">
            {CRAVINGS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setCraving(option.key)}
                aria-pressed={craving === option.key}
                className={cn(
                  "rounded-full border px-2.5 py-1.5 text-[0.68rem] font-semibold transition-colors",
                  craving === option.key
                    ? "border-clay-500 bg-clay-500 text-cream-50"
                    : "border-line bg-surface text-ink-soft hover:border-clay-300",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[0.68rem] text-muted">
            {days * 4} comidas · sin repetir platos
          </p>
          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading}
            className="fm-button fm-button-primary"
          >
            <SparkIcon className="h-4 w-4" />
            {loading ? "Armando el plan…" : `Planear ${days} ${days === 1 ? "día" : "días"}`}
          </button>
        </div>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </div>
            <Skeleton className="h-80" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void generate()} />
        ) : plan ? (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              {plan.days.map((day, index) => (
                <section
                  key={day.date}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                  aria-labelledby={`day-${index}`}
                >
                  <header className="flex items-center justify-between gap-3 border-b border-line bg-cream-50 px-4 py-3">
                    <h2 id={`day-${index}`} className="font-display text-base capitalize text-ink">
                      {formatDay(day.date)}
                    </h2>
                    <span className="fm-chip fm-chip-neutral">
                      {day.meals.length} comidas
                    </span>
                  </header>

                  <ul className="divide-y divide-line">
                    {day.meals.map((meal) => {
                      const favorite = favoriteIds.has(meal.dish.id);
                      return (
                        <li key={meal.slot} className="flex gap-3 p-3.5">
                          <Link
                            to={`/recetas/${meal.dish.slug}`}
                            className="group flex min-w-0 flex-1 gap-3"
                          >
                            <DishThumb
                              category={meal.dish.category}
                              id={meal.dish.id}
                              className="h-16 w-20 shrink-0 rounded-lg"
                            />
                            <span className="min-w-0">
                              <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-clay-600">
                                {MEAL_SLOT_LABELS[meal.slot]}
                              </span>
                              <span className="mt-0.5 block truncate font-display text-sm text-ink group-hover:text-clay-600">
                                {meal.dish.nameEs}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.65rem] text-muted">
                                <span className="inline-flex items-center gap-1">
                                  <ClockIcon className="h-3 w-3" />
                                  {meal.dish.prepMinutes} min
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{formatCalories(meal.dish.calories)}</span>
                              </span>
                              <span className="mt-1 line-clamp-1 block text-[0.65rem] leading-relaxed text-muted">
                                {meal.reason}
                              </span>
                            </span>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              void toggleFavoriteDish(meal.dish.id, meal.dish.nameEs)
                            }
                            className="fm-icon-button self-start"
                            aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                            aria-pressed={favorite}
                          >
                            {favorite ? (
                              <HeartFilledIcon className="h-4 w-4 text-clay-500" />
                            ) : (
                              <HeartIcon className="h-4 w-4" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-display text-base text-ink">
                    <BowlIcon className="h-4 w-4 text-clay-500" />
                    Lista de compras
                  </h2>
                  <button
                    type="button"
                    onClick={() => void copyList()}
                    className="text-[0.65rem] font-semibold text-clay-600 hover:underline"
                  >
                    {copied ? "Copiada" : "Copiar"}
                  </button>
                </div>
                <p className="mt-1 text-[0.65rem] text-muted">
                  {plan.shoppingList.length} ingredientes para {plan.days.length} días.
                </p>

                <ul className="mt-3 max-h-[28rem] space-y-2 overflow-auto pr-1">
                  {plan.shoppingList.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-start justify-between gap-2 border-b border-line pb-2 last:border-0"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold capitalize text-ink">
                          {item.name}
                        </span>
                        <span className="block truncate text-[0.62rem] text-muted">
                          {item.dishes.slice(0, 2).join(", ")}
                          {item.dishes.length > 2 ? ` +${item.dishes.length - 2}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[0.65rem] font-semibold text-ink-soft">
                          {item.quantity}
                        </span>
                        <span className="block text-[0.6rem] text-muted">
                          {item.fromRecipes} receta{item.fromRecipes === 1 ? "" : "s"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 flex items-start gap-1.5 border-t border-line pt-3 text-[0.65rem] leading-relaxed text-muted">
                  <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-sage-600" />
                  {plan.note}
                </p>
              </section>

              <section className="rounded-2xl bg-sage-100 p-4">
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold text-sage-600">
                  <ScrollIcon className="h-3.5 w-3.5" />
                  Cómo usarlo
                </p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-ink-soft">
                  Cámbialo sin culpa: salta una comida, repite la que te gustó o cocina de más para
                  llevar. El plan es una sugerencia, no una regla.
                </p>
              </section>
            </aside>
          </div>
        ) : (
          <EmptyState
            title="Tu semana, sin decidir a última hora"
            description="Genera un plan de 3, 5 o 7 días con recetas del catálogo. Cada comida enlaza a su receta y la lista de compras se arma sola."
            action={
              <button type="button" className="fm-button fm-button-primary" onClick={() => void generate()}>
                <ChefIcon className="h-4 w-4" />
                Generar mi primer plan
              </button>
            }
          />
        )}
      </div>

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
