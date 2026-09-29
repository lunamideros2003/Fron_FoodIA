import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useApi } from "../hooks/useApi.ts";
import { DishThumb } from "../components/DishThumb.tsx";
import { SectionHeading, Skeleton, ErrorState, EmptyState } from "../components/Feedback.tsx";
import { DIET_LABELS, PRICE_LABELS } from "../lib/format.ts";
import { ClockIcon, FlameIcon, LeafIcon } from "../components/icons.tsx";
import type { Diet } from "../types.ts";

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [diet, setDiet] = useState<Diet | "">("");
  const [maxPrep, setMaxPrep] = useState("");

  const categories = useApi(() => api.categories(), []);
  const dishes = useApi(
    () =>
      api.dishes({
        q: search.trim() || undefined,
        category: category || undefined,
        diet: diet || undefined,
        maxPrepMinutes: maxPrep || undefined,
      }),
    [search, category, diet, maxPrep],
  );

  const resultLabel = useMemo(() => {
    const total = dishes.data?.total ?? 0;
    return `${total} ${total === 1 ? "plato" : "platos"}`;
  }, [dishes.data]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <SectionHeading
        eyebrow="Catálogo"
        title="Los 40 platos que conoce FoodMood"
        description="El mismo catálogo que usa el recomendador. Filtra para explorar o para ver qué queda después de tus restricciones."
      />

      <div className="fm-card mt-8 grid gap-4 p-5 md:grid-cols-4">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-plum-700">Buscar</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pollo, sopa, chocolate, sin gluten…"
            className="fm-input"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-plum-700">Categoría</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="fm-input cursor-pointer"
          >
            <option value="">Todas</option>
            {categories.data?.items.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-plum-700">Dieta</span>
          <select
            value={diet}
            onChange={(event) => setDiet(event.target.value as Diet | "")}
            className="fm-input cursor-pointer"
          >
            <option value="">Sin restricciones</option>
            {Object.entries(DIET_LABELS)
              .filter(([key]) => key !== "omnivore")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-cocoa-500">{resultLabel}</span>
        <div className="flex gap-1.5">
          {["", "10", "20", "30", "45"].map((value) => (
            <button
              key={value || "all"}
              type="button"
              onClick={() => setMaxPrep(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                maxPrep === value
                  ? "bg-mauve-600 text-cream-50"
                  : "bg-sand-100 text-cocoa-600 hover:bg-blush-200"
              }`}
            >
              {value ? `≤ ${value} min` : "Cualquier tiempo"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {dishes.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-72" />
            ))}
          </div>
        ) : dishes.error ? (
          <ErrorState message={dishes.error} onRetry={dishes.reload} />
        ) : (dishes.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No encontramos nada con esos filtros"
            description="Prueba quitando la dieta o el límite de tiempo."
            action={
              <button
                type="button"
                className="fm-button fm-button-primary"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setDiet("");
                  setMaxPrep("");
                }}
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.data?.items.map((dish, index) => (
              <Link
                key={dish.id}
                to={`/plato/${dish.slug}`}
                className="fm-card group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="relative">
                  <DishThumb category={dish.category} id={dish.id} className="h-32 w-full" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[0.7rem] font-semibold text-plum-700 backdrop-blur">
                    {PRICE_LABELS[dish.priceLevel]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-lg leading-tight text-plum-700 group-hover:text-mauve-600">
                    {dish.nameEs}
                  </h3>
                  <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-rose-400">
                    {dish.category}
                  </p>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-cocoa-600">
                    {dish.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="fm-chip">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {dish.prepMinutes} min
                    </span>
                    <span className="fm-chip">
                      <FlameIcon className="h-3.5 w-3.5" />
                      {dish.calories} kcal
                    </span>
                    {dish.isVegan ? (
                      <span className="fm-chip">
                        <LeafIcon className="h-3.5 w-3.5" />
                        vegano
                      </span>
                    ) : null}
                    {dish.isVegetarian && !dish.isVegan ? (
                      <span className="fm-chip">
                        <LeafIcon className="h-3.5 w-3.5" />
                        vegetariano
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
