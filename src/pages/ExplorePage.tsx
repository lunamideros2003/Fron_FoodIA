import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApi } from "../hooks/useApi.ts";
import { useDebouncedValue } from "../hooks/useDebouncedValue.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { useUser } from "../context/UserContext.tsx";
import { api, ApiError } from "../lib/api.ts";
import { PageHeader } from "../components/PageHeader.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { Toast } from "../components/Toast.tsx";
import { EmptyState, ErrorState, Skeleton } from "../components/Feedback.tsx";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, DiceIcon, SearchIcon } from "../components/icons.tsx";
import { cn } from "../lib/cn.ts";
import type { Diet, DishQuery, DishSort } from "../types.ts";

const PAGE_SIZE = 12;

const SORTS: { value: DishSort; label: string }[] = [
  { value: "prep", label: "Más rápidas" },
  { value: "calories", label: "Más ligeras" },
  { value: "name", label: "Por nombre" },
];

const PREP_OPTIONS = [
  { value: "", label: "Cualquier tiempo" },
  { value: "10", label: "≤ 10 min" },
  { value: "20", label: "≤ 20 min" },
  { value: "30", label: "≤ 30 min" },
];

function asNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function ExplorePage() {
  useDocumentTitle("Explorar recetas");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useUser();
  const { toast, show, clear } = useToast();

  const search = params.get("q") ?? "";
  const debouncedSearch = useDebouncedValue(search, 320);
  const category = params.get("category") ?? "";
  const diet = (params.get("diet") ?? "") as Diet | "";
  const difficulty = params.get("difficulty") ?? "";
  const prep = params.get("prep") ?? "";
  const allergen = params.get("allergen") ?? "";
  const sort = (params.get("sort") ?? "") as DishSort | "";
  const offset = asNumber(params.get("offset")) ?? 0;

  const facets = useApi(() => api.facets(), []);

  const query: DishQuery = {
    q: debouncedSearch.trim() || undefined,
    category: category || undefined,
    diet: diet || undefined,
    difficulty: (difficulty || undefined) as DishQuery["difficulty"],
    maxPrepMinutes: asNumber(prep),
    excludeAllergen: allergen || undefined,
    sort: sort || undefined,
    offset,
    limit: PAGE_SIZE,
  };

  const dishes = useApi(() => api.dishes(query), [
    query.q,
    query.category,
    query.diet,
    query.difficulty,
    query.maxPrepMinutes,
    query.excludeAllergen,
    query.sort,
    offset,
  ]);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "offset") next.delete("offset");
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
  };

  const activeFilters = [
    search ? { key: "q", label: `«${search}»` } : null,
    category ? { key: "category", label: category } : null,
    diet ? { key: "diet", label: diet === "vegan" ? "Vegano" : diet === "vegetarian" ? "Vegetariano" : "Pescetariano" } : null,
    difficulty
      ? {
          key: "difficulty",
          label: difficulty === "facil" ? "Fácil" : difficulty === "media" ? "Media" : "Avanzada",
        }
      : null,
    prep ? { key: "prep", label: `≤ ${prep} min` } : null,
    allergen ? { key: "allergen", label: `Sin ${allergen.toLowerCase()}` } : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  const total = dishes.data?.total ?? 0;
  const count = dishes.data?.count ?? 0;
  const hasPrev = offset > 0;
  const hasNext = offset + count < total;

  const random = async () => {
    try {
      const response = await api.randomDish({
        category: category || undefined,
        diet: diet || undefined,
        difficulty: (difficulty || undefined) as DishQuery["difficulty"],
        maxPrepMinutes: asNumber(prep),
        excludeAllergen: allergen || undefined,
      });
      navigate(`/recetas/${response.dish.slug}`);
    } catch (cause) {
      show(
        cause instanceof ApiError ? cause.message : "No pudimos elegir una receta al azar.",
        "error",
      );
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
        eyebrow="Explorar recetas"
        title="Las 40 recetas del catálogo"
        description="Busca por nombre o ingrediente, filtra por lo que necesitas y guarda las que quieras probar."
        actions={
          <button type="button" className="fm-button fm-button-secondary" onClick={() => void random()}>
            <DiceIcon className="h-4 w-4" />
            Sorpréndeme
          </button>
        }
      />

      <section className="mt-6 rounded-2xl border border-line bg-surface p-4" aria-label="Filtros">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <label className="sr-only" htmlFor="explore-search">
              Buscar recetas
            </label>
            <input
              id="explore-search"
              type="search"
              value={search}
              onChange={(event) => update("q", event.target.value)}
              placeholder="Pollo, sopa, chocolate, sin gluten…"
              className="fm-input !pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="block">
              <span className="sr-only">Categoría</span>
              <select
                value={category}
                onChange={(event) => update("category", event.target.value)}
                className="fm-input cursor-pointer !py-2 text-xs"
              >
                <option value="">Todas las categorías</option>
                {facets.data?.categories.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.key} ({item.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Dieta</span>
              <select
                value={diet}
                onChange={(event) => update("diet", event.target.value)}
                className="fm-input cursor-pointer !py-2 text-xs"
              >
                <option value="">Cualquier dieta</option>
                <option value="vegetarian">Vegetariano</option>
                <option value="vegan">Vegano</option>
                <option value="pescatarian">Pescetariano</option>
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Dificultad</span>
              <select
                value={difficulty}
                onChange={(event) => update("difficulty", event.target.value)}
                className="fm-input cursor-pointer !py-2 text-xs"
              >
                <option value="">Cualquier dificultad</option>
                {facets.data?.difficulties.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.key === "facil" ? "Fácil" : item.key === "media" ? "Media" : "Avanzada"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Alérgeno a evitar</span>
              <select
                value={allergen}
                onChange={(event) => update("allergen", event.target.value)}
                className="fm-input cursor-pointer !py-2 text-xs"
              >
                <option value="">Sin excluir alérgenos</option>
                {facets.data?.allergens.map((item) => (
                  <option key={item.key} value={item.key}>
                    Sin {item.key.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex flex-wrap gap-1.5">
            {PREP_OPTIONS.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                onClick={() => update("prep", option.value)}
                aria-pressed={prep === option.value}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors",
                  prep === option.value
                    ? "border-clay-500 bg-clay-500 text-cream-50"
                    : "border-line bg-surface text-ink-soft hover:border-clay-300",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            Ordenar por
            <select
              value={sort}
              onChange={(event) => update("sort", event.target.value)}
              className="fm-input !w-auto cursor-pointer !py-1.5 text-xs"
            >
              <option value="">Relevancia</option>
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeFilters.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
              Filtros
            </span>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => update(filter.key, null)}
                className="inline-flex items-center gap-1 rounded-full bg-peach-100 px-2.5 py-1 text-[0.68rem] font-medium text-clay-600 hover:bg-peach-200"
              >
                {filter.label}
                <CloseIcon className="h-2.5 w-2.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-1 text-[0.68rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Limpiar todo
            </button>
          </div>
        ) : null}
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted" aria-live="polite">
          {dishes.loading
            ? "Buscando recetas…"
            : `${total} ${total === 1 ? "receta" : "recetas"}${activeFilters.length > 0 ? " con estos filtros" : ""}`}
        </p>
        {total > 0 ? (
          <p className="text-[0.68rem] text-muted">
            Mostrando {offset + 1}–{offset + count} de {total}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        {dishes.loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : dishes.error ? (
          <ErrorState message={dishes.error} onRetry={dishes.reload} />
        ) : count === 0 ? (
          <EmptyState
            title="No hay recetas con esos filtros"
            description="Prueba a quitar el alérgeno o el límite de tiempo. El catálogo solo muestra recetas que existen."
            action={
              <button type="button" className="fm-button fm-button-primary" onClick={clearAll}>
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.data?.items.map((dish) => (
              <RecipeCard
                key={dish.id}
                dish={dish}
                favorite={favoriteIds.has(dish.id)}
                onToggleFavorite={(item) => void toggleFavoriteDish(item.id, item.nameEs)}
              />
            ))}
          </div>
        )}
      </div>

      {total > PAGE_SIZE ? (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginación">
          <button
            type="button"
            className="fm-button fm-button-ghost !py-2 text-xs"
            disabled={!hasPrev}
            onClick={() => update("offset", String(Math.max(0, offset - PAGE_SIZE)))}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            Anterior
          </button>
          <span className="text-xs text-muted">
            {Math.floor(offset / PAGE_SIZE) + 1} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button
            type="button"
            className="fm-button fm-button-ghost !py-2 text-xs"
            disabled={!hasNext}
            onClick={() => update("offset", String(offset + PAGE_SIZE))}
          >
            Siguiente
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </nav>
      ) : null}

      <p className="mt-8 text-center text-[0.7rem] text-muted">
        ¿No sabes por dónde empezar?{" "}
        <Link to="/animo" className="fm-link">
          Cuéntame cómo te sientes
        </Link>
        .
      </p>

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
