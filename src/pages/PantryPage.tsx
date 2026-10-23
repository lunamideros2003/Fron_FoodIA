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
  CheckIcon,
  CloseIcon,
  HeartFilledIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  SparkIcon,
} from "../components/icons.tsx";
import { cn } from "../lib/cn.ts";
import { formatPercent } from "../lib/format.ts";
import { parseIngredientInput } from "../lib/text.ts";
import type { CravingKey, IngredientDiscoveryResponse } from "../types.ts";

const SUGGESTIONS = [
  "huevo",
  "pollo",
  "arroz",
  "pasta",
  "tomate",
  "cebolla",
  "ajo",
  "papas",
  "frijoles",
  "aguacate",
  "queso",
  "limón",
];

const CRAVINGS: { key: CravingKey; label: string }[] = [
  { key: "surprise", label: "Sorpréndeme" },
  { key: "savory", label: "Salado" },
  { key: "sweet", label: "Dulce" },
  { key: "light", label: "Ligero" },
  { key: "comfort", label: "Reconfortante" },
];

const PREP_OPTIONS = [
  { value: "", label: "Cualquier tiempo" },
  { value: "15", label: "Hasta 15 min" },
  { value: "30", label: "Hasta 30 min" },
  { value: "45", label: "Hasta 45 min" },
];

export function PantryPage() {
  useDocumentTitle("Cocina con lo que tienes");
  const { user, favoriteIds, toggleFavorite } = useUser();
  const { toast, show, clear } = useToast();

  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = usePersistentState<string[]>(
    "foodmood.pantry.ingredients",
    [],
  );
  const [maxPrep, setMaxPrep] = usePersistentState("foodmood.pantry.maxPrep", "");
  const [craving, setCraving] = usePersistentState<CravingKey>(
    "foodmood.pantry.craving",
    "surprise",
  );
  const [onlyComplete, setOnlyComplete] = usePersistentState(
    "foodmood.pantry.onlyComplete",
    false,
  );
  const [result, setResult] = useState<IngredientDiscoveryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addIngredients = (raw: string) => {
    const next = parseIngredientInput(raw).slice(0, 30);
    if (next.length === 0) return;
    setIngredients((current) =>
      Array.from(new Set([...current, ...next.map((item) => item.toLowerCase())])).slice(0, 30),
    );
    setInput("");
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients((current) => current.filter((item) => item !== ingredient));
  };

  const submit = async (override?: string[]) => {
    const pending = parseIngredientInput(input);
    const all = Array.from(new Set([...ingredients, ...pending, ...(override ?? [])]));
    if (all.length === 0) {
      show("Escribe al menos un ingrediente.", "info");
      return;
    }

    if (pending.length > 0) {
      setIngredients(all);
      setInput("");
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.discoverByIngredients({
        ingredients: all,
        limit: 12,
        maxPrepMinutes: maxPrep === "" ? undefined : Number(maxPrep),
        onlyComplete,
        craving: craving === "surprise" ? undefined : craving,
        userId: user?.id,
      });
      setResult(response);
    } catch (cause) {
      setResult(null);
      setError(
        cause instanceof ApiError ? cause.message : "No pudimos cruzar tus ingredientes.",
      );
    } finally {
      setLoading(false);
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
        eyebrow="Despensa"
        title="Cocina con lo que ya tienes"
        description="Dime qué hay en tu cocina y cruzo los ingredientes con las 40 recetas reales del catálogo. Te digo qué cubres y qué te falta."
        backTo={{ to: "/recetas", label: "Explorar recetas" }}
        actions={
          <Link to="/recetas" className="fm-button fm-button-ghost">
            <SearchIcon className="h-4 w-4" />
            Ver todo el catálogo
          </Link>
        }
      />

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5" aria-labelledby="pantry-form">
        <h2 id="pantry-form" className="font-display text-lg text-ink">
          Tu despensa
        </h2>
        <p className="mt-1 text-xs text-muted">
          Añade ingredientes con Enter o una coma. No necesitas cantidades.
        </p>

        <div className="mt-3 rounded-xl border border-line bg-cream-50 p-3">
          {ingredients.length > 0 ? (
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {ingredients.map((ingredient) => (
                <li key={ingredient}>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient)}
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-ink-soft shadow-sm hover:bg-peach-100"
                    aria-label={`Quitar ${ingredient}`}
                  >
                    {ingredient}
                    <CloseIcon className="h-2.5 w-2.5 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex gap-2">
            <label className="sr-only" htmlFor="pantry-input">
              Añadir ingrediente
            </label>
            <input
              id="pantry-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addIngredients(input);
                } else if (event.key === "Backspace" && input === "" && ingredients.length > 0) {
                  removeIngredient(ingredients[ingredients.length - 1]);
                }
              }}
              placeholder="Ej: huevo, jitomate, tortillas…"
              className="fm-input flex-1 !border-0 !bg-transparent !px-1 !py-1 focus:!shadow-none"
            />
            <button
              type="button"
              onClick={() => addIngredients(input)}
              disabled={!input.trim()}
              className="fm-icon-button"
              aria-label="Añadir ingrediente"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
            Suele haber en casa
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter((item) => !ingredients.includes(item)).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => addIngredients(item)}
                className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.68rem] text-ink-soft hover:border-clay-300 hover:text-ink"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <label className="block">
            <span className="fm-label">Tiempo disponible</span>
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

          <div>
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

          <label className="flex items-start gap-2 text-[0.7rem] leading-relaxed text-ink-soft sm:col-span-2">
            <input
              type="checkbox"
              checked={onlyComplete}
              onChange={(event) => setOnlyComplete(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-clay-500"
            />
            <span>
              Solo recetas que pueda hacer completas con estos ingredientes.
              <span className="block text-[0.65rem] text-muted">
                Desmárcalo para ver también las que te faltan uno o dos ingredientes.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[0.68rem] text-muted">
            {ingredients.length > 0
              ? `${ingredients.length} ${ingredients.length === 1 ? "ingrediente" : "ingredientes"} en tu despensa`
              : "Aún no has añadido ingredientes."}
          </p>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || (ingredients.length === 0 && !input.trim())}
            className="fm-button fm-button-primary"
          >
            <SparkIcon className="h-4 w-4" />
            {loading ? "Cruzando ingredientes…" : "Buscar qué puedo cocinar"}
          </button>
        </div>
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void submit()} />
        ) : result ? (
          result.items.length === 0 ? (
            <EmptyState
              title="No encontré una receta con esos ingredientes"
              description={
                onlyComplete
                  ? "Prueba a desmarcar «solo recetas completas»: puede que te falte solo un ingrediente."
                  : "Añade algún ingrediente más o quita el límite de tiempo."
              }
              action={
                <button
                  type="button"
                  className="fm-button fm-button-ghost"
                  onClick={() => setOnlyComplete(false)}
                >
                  Ver recetas casi completas
                </button>
              }
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted" aria-live="polite">
                  {result.items.length} {result.items.length === 1 ? "receta" : "recetas"} con{" "}
                  {result.ingredients.join(", ")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIngredients([]);
                    setResult(null);
                    setInput("");
                  }}
                  className="text-[0.68rem] font-semibold text-muted hover:text-ink"
                >
                  Empezar de cero
                </button>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((item) => {
                  const favorite = favoriteIds.has(item.dish.id);
                  const complete = item.missing.length === 0;
                  return (
                    <article
                      key={item.dish.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
                    >
                      <Link to={`/recetas/${item.dish.slug}`} className="relative block">
                        <DishThumb
                          category={item.dish.category}
                          id={item.dish.id}
                          className="h-32 w-full"
                        />
                        <span
                          className={cn(
                            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-bold backdrop-blur",
                            complete
                              ? "bg-sage-100/95 text-sage-600"
                              : item.almostThere
                                ? "bg-peach-100/95 text-clay-600"
                                : "bg-surface/90 text-muted",
                          )}
                        >
                          {formatPercent(item.coverage)} cubierto
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-full bg-surface/90 px-2 py-0.5 text-[0.62rem] font-semibold text-ink-soft">
                          {item.dish.prepMinutes} min
                        </span>
                      </Link>

                      <div className="flex flex-1 flex-col p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base leading-snug text-ink">
                            <Link to={`/recetas/${item.dish.slug}`} className="hover:text-clay-600">
                              {item.dish.nameEs}
                            </Link>
                          </h3>
                          <button
                            type="button"
                            onClick={() => void toggleFavoriteDish(item.dish.id, item.dish.nameEs)}
                            className="fm-icon-button shrink-0"
                            aria-label={
                              favorite ? "Quitar de favoritos" : "Añadir a favoritos"
                            }
                            aria-pressed={favorite}
                          >
                            {favorite ? (
                              <HeartFilledIcon className="h-4 w-4 text-clay-500" />
                            ) : (
                              <HeartIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <p className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-muted">
                          {item.reason}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.matched.slice(0, 4).map((ingredient) => (
                            <span
                              key={ingredient}
                              className="inline-flex items-center gap-0.5 rounded-full bg-sage-100 px-1.5 py-0.5 text-[0.6rem] text-sage-600"
                            >
                              <CheckIcon className="h-2 w-2" />
                              {ingredient}
                            </span>
                          ))}
                          {item.matched.length > 4 ? (
                            <span className="text-[0.6rem] text-muted">
                              +{item.matched.length - 4}
                            </span>
                          ) : null}
                        </div>

                        {item.missing.length > 0 ? (
                          <div className="mt-2 border-t border-line pt-2">
                            <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
                              Te falta
                            </p>
                            <p className="text-[0.65rem] leading-relaxed text-ink-soft">
                              {item.missing.slice(0, 3).join(", ")}
                              {item.missing.length > 3 ? ` y ${item.missing.length - 3} más` : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 inline-flex items-center gap-1 text-[0.65rem] font-semibold text-sage-600">
                            <CheckIcon className="h-3 w-3" />
                            Puedes hacerla completa
                          </p>
                        )}

                        <Link
                          to={`/recetas/${item.dish.slug}`}
                          className="mt-auto pt-3 text-[0.68rem] font-semibold text-clay-600 hover:underline"
                        >
                          Ver receta
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )
        ) : (
          <EmptyState
            title="Empieza por lo que tienes"
            description="Añade tres o cuatro ingredientes y te digo qué recetas puedes preparar sin salir a comprar."
            action={
              <button
                type="button"
                className="fm-button fm-button-secondary"
                onClick={() => {
                  const example = parseIngredientInput("huevo, tomate, cebolla, arroz");
                  addIngredients(example.join(", "));
                  void submit(example);
                }}
              >
                <SparkIcon className="h-4 w-4" />
                Probar con un ejemplo
              </button>
            }
          />
        )}
      </div>

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
