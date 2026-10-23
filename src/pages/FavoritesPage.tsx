import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { PageHeader } from "../components/PageHeader.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { Toast } from "../components/Toast.tsx";
import { EmptyState, ErrorState, Skeleton } from "../components/Feedback.tsx";
import { ChefIcon, DiceIcon, HeartFilledIcon, SearchIcon, TrashIcon } from "../components/icons.tsx";

type FavoriteSort = "recent" | "name" | "time";

function isFavoriteSort(value: string | null): value is FavoriteSort {
  return value === "recent" || value === "name" || value === "time";
}

export function FavoritesPage() {
  useDocumentTitle("Mis favoritos");
  const { favorites, savedLoading, error, refreshSaved, toggleFavorite, clearFavorites } = useUser();
  const { toast, show, clear } = useToast();
  const navigate = useNavigate();

  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = isFavoriteSort(params.get("sort")) ? (params.get("sort") as FavoriteSort) : "recent";
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const setSearch = (value: string) => update("q", value || null);
  const setCategory = (value: string) => update("category", value || null);
  const setSort = (value: FavoriteSort) => update("sort", value === "recent" ? null : value);

  const categories = useMemo(
    () => Array.from(new Set(favorites.map((item) => item.dish.category))).sort(),
    [favorites],
  );

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return favorites
      .filter((item) => {
        if (category && item.dish.category !== category) return false;
        if (!term) return true;
        return (
          item.dish.nameEs.toLowerCase().includes(term) ||
          item.dish.description.toLowerCase().includes(term) ||
          item.dish.ingredients.some((ingredient) => ingredient.label.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        if (sort === "name") return a.dish.nameEs.localeCompare(b.dish.nameEs, "es");
        if (sort === "time") return a.dish.prepMinutes - b.dish.prepMinutes;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [favorites, search, category, sort]);

  const remove = async (dishId: number, name: string) => {
    setBusy(true);
    try {
      await toggleFavorite(dishId);
      show(`Quitaste ${name} de tus favoritos.`, "success");
    } catch {
      show("No pudimos quitar el favorito.", "error");
    } finally {
      setBusy(false);
    }
  };

  const random = () => {
    if (items.length === 0) {
      show("Ninguna receta coincide con los filtros.", "info");
      return;
    }
    const pick = items[Math.floor(Math.random() * items.length)];
    navigate(`/recetas/${pick.dish.slug}`);
  };

  const clearAll = async () => {
    setBusy(true);
    try {
      await clearFavorites();
      setConfirmClear(false);
      show("Tus favoritos quedaron vacíos.", "success");
    } catch {
      show("No pudimos vaciar los favoritos.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (savedLoading && favorites.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-14" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshSaved()} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mis favoritos"
        title="Tu lista para cocinar"
        description="Las recetas que guardaste, reunidas en un solo lugar. Quita las que ya no te llamen y empieza por una."
        actions={
          favorites.length > 0 ? (
            <>
              <button
                type="button"
                onClick={random}
                className="fm-button fm-button-secondary"
              >
                <DiceIcon className="h-4 w-4" />
                Elegir una
              </button>
              <Link to="/recetas" className="fm-button fm-button-ghost">
                <ChefIcon className="h-4 w-4" />
                Añadir más
              </Link>
            </>
          ) : undefined
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <HeartFilledIcon className="h-3.5 w-3.5 text-clay-500" />
        <span aria-live="polite">
          {favorites.length} {favorites.length === 1 ? "receta guardada" : "recetas guardadas"}
        </span>
        {favorites.length > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {Math.round(
                favorites.reduce((total, item) => total + item.dish.prepMinutes, 0) /
                  favorites.length,
              )}{" "}
              min de media
            </span>
          </>
        ) : null}
      </div>

      {favorites.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Todavía no tienes favoritos"
            description="Pulsa el corazón en cualquier receta y aparecerá aquí. Puedes guardarlas desde Explorar, desde una recomendación o desde el detalle."
            action={
              <Link to="/recetas" className="fm-button fm-button-primary">
                Explorar recetas
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <section className="mt-4 rounded-2xl border border-line bg-surface p-3" aria-label="Filtros de favoritos">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <label className="sr-only" htmlFor="favorites-search">
                  Buscar en favoritos
                </label>
                <input
                  id="favorites-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por receta, ingrediente o descripción…"
                  className="fm-input !py-2 !pl-9 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <label className="block">
                  <span className="sr-only">Categoría</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="fm-input cursor-pointer !py-2 text-xs"
                  >
                    <option value="">Todas</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="sr-only">Ordenar favoritos</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as FavoriteSort)}
                    className="fm-input cursor-pointer !py-2 text-xs"
                  >
                    <option value="recent">Recientes</option>
                    <option value="name">Nombre</option>
                    <option value="time">Más rápidas</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <div className="mt-4">
            {items.length === 0 ? (
              <EmptyState
                title="Ninguna coincide con la búsqueda"
                description="Prueba con otro ingrediente o cambia la categoría."
                action={
                  <button
                    type="button"
                    className="fm-button fm-button-ghost"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                    }}
                  >
                    Limpiar búsqueda
                  </button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <RecipeCard
                    key={item.dishId}
                    dish={item.dish}
                    favorite
                    onToggleFavorite={(dish) => void remove(dish.id, dish.nameEs)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-4 sm:flex-row">
            <p className="text-[0.7rem] text-muted">
              Tus favoritos se sincronizan con tu perfil de FoodMood.
            </p>

            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-[0.7rem] font-semibold text-ink">¿Vaciar toda la lista?</span>
                <button
                  type="button"
                  onClick={() => void clearAll()}
                  disabled={busy}
                  className="rounded-md bg-danger-500 px-2.5 py-1.5 text-[0.68rem] font-semibold text-cream-50"
                >
                  Sí, vaciar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-[0.68rem] font-semibold text-muted"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-muted hover:text-danger-600"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Vaciar favoritos
              </button>
            )}
          </div>
        </>
      )}

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
