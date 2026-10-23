import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { PageHeader } from "../components/PageHeader.tsx";
import { StatCard } from "../components/StatCard.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { RatingStars } from "../components/RatingStars.tsx";
import { SegmentedControl } from "../components/SegmentedControl.tsx";
import { Toast } from "../components/Toast.tsx";
import { EmptyState, ErrorState, Skeleton } from "../components/Feedback.tsx";
import {
  ChefIcon,
  ClockIcon,
  HeartFilledIcon,
  HeartIcon,
  PencilIcon,
  ScrollIcon,
  TextIcon,
  TrashIcon,
} from "../components/icons.tsx";
import { formatRelativeDate } from "../lib/format.ts";
import type { RecipeEntryStatus, RecipeEntryWithDish } from "../types.ts";

type HistoryFilter = "all" | RecipeEntryStatus;
type HistorySort = "recent" | "rating";

interface Draft {
  status: RecipeEntryStatus;
  rating: number | null;
  note: string;
  feelingNote: string;
}

function draftFrom(entry: RecipeEntryWithDish): Draft {
  return {
    status: entry.status,
    rating: entry.rating,
    note: entry.note ?? "",
    feelingNote: entry.feelingNote ?? "",
  };
}

export function HistoryPage() {
  useDocumentTitle("Mi historial");
  const {
    user,
    history,
    overview,
    loading,
    savedLoading,
    error,
    refreshSaved,
    favoriteIds,
    toggleFavorite,
    updateHistoryEntry,
    removeHistoryEntry,
    clearHistory,
  } = useUser();
  const { toast, show, clear } = useToast();

  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [sort, setSort] = useState<HistorySort>("recent");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = history.filter((entry) => {
      if (filter !== "all" && entry.status !== filter) return false;
      if (!term) return true;
      return (
        entry.dish.nameEs.toLowerCase().includes(term) ||
        entry.dish.category.toLowerCase().includes(term) ||
        (entry.note ?? "").toLowerCase().includes(term)
      );
    });

    return items.sort((a, b) => {
      if (sort === "rating") {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [history, filter, search, sort]);

  const prepared = overview?.counts.prepared ?? history.filter((entry) => entry.status === "prepared").length;
  const viewed = overview?.counts.viewed ?? history.filter((entry) => entry.status === "viewed").length;
  const notes = overview?.counts.notes ?? history.filter((entry) => entry.note || entry.feelingNote).length;

  const openEditor = (entry: RecipeEntryWithDish) => {
    if (editingId === entry.dishId) {
      setEditingId(null);
      setDraft(null);
      return;
    }
    setEditingId(entry.dishId);
    setDraft(draftFrom(entry));
  };

  const save = async (entry: RecipeEntryWithDish) => {
    if (!draft) return;
    setBusy(true);
    try {
      await updateHistoryEntry(entry.dishId, {
        status: draft.status,
        rating: draft.rating,
        note: draft.note.trim() || null,
        feelingNote: draft.feelingNote.trim() || null,
      });
      show("Cambios guardados en tu historial.", "success");
      setEditingId(null);
      setDraft(null);
    } catch {
      show("No pudimos guardar los cambios.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (entry: RecipeEntryWithDish) => {
    setBusy(true);
    try {
      await removeHistoryEntry(entry.dishId);
      setConfirmId(null);
      if (editingId === entry.dishId) {
        setEditingId(null);
        setDraft(null);
      }
      show("Receta quitada del historial.", "success");
    } catch {
      show("No pudimos quitar la receta.", "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleFavoriteDish = async (entry: RecipeEntryWithDish) => {
    setBusy(true);
    try {
      const saved = await toggleFavorite(entry.dishId);
      show(saved ? "Guardada en tus favoritos." : "La quitamos de tus favoritos.", "success");
    } catch {
      show("No pudimos guardar el favorito.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshSaved()} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mi historial"
        title="Lo que has cocinado y lo que quieres recordar"
        description="Tus recetas vistas y preparadas, con notas, calificaciones y cómo te sentiste. Nada se guarda sin que lo decidas tú."
        actions={
          <Link to="/recetas" className="fm-button fm-button-secondary">
            <ChefIcon className="h-4 w-4" />
            Buscar una receta
          </Link>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Preparadas" value={prepared} hint="Recetas que ya cocinaste" icon={ChefIcon} tone="peach" />
        <StatCard label="Vistas" value={viewed} hint="Recetas que guardaste para después" icon={ScrollIcon} tone="cream" />
        <StatCard label="Con notas" value={notes} hint="Tus apuntes y sensaciones" icon={TextIcon} tone="sage" />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-4" aria-label="Filtros del historial">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              label="Estado"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "Todo", count: history.length },
                { value: "prepared", label: "Preparadas", count: prepared },
                { value: "viewed", label: "Vistas", count: viewed },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="history-search">
              Buscar en el historial
            </label>
            <input
              id="history-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por receta o nota…"
              className="fm-input !w-52 !py-1.5 text-xs"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <span className="sr-only">Ordenar historial</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as HistorySort)}
                className="fm-input !w-auto cursor-pointer !py-1.5 text-xs"
              >
                <option value="recent">Recientes</option>
                <option value="rating">Mejor valoradas</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="mt-4">
        {savedLoading && history.length === 0 ? (
          <Skeleton className="h-72" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={history.length === 0 ? "Tu historial está vacío" : "No hay recetas con ese filtro"}
            description={
              history.length === 0
                ? "Abre una receta y marca «Marcar como preparada» o guarda una vista para empezar tu historial."
                : "Cambia el filtro o limpia la búsqueda para ver el resto de tus recetas."
            }
            action={
              history.length === 0 ? (
                <Link to="/recetas" className="fm-button fm-button-primary">
                  Explorar recetas
                </Link>
              ) : (
                <button
                  type="button"
                  className="fm-button fm-button-ghost"
                  onClick={() => {
                    setFilter("all");
                    setSearch("");
                  }}
                >
                  Limpiar filtros
                </button>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((entry) => {
              const favorite = favoriteIds.has(entry.dishId);
              const isEditing = editingId === entry.dishId;
              const isConfirming = confirmId === entry.dishId;

              return (
                <li
                  key={entry.dishId}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                    <Link
                      to={`/recetas/${entry.dish.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <DishThumb
                        category={entry.dish.category}
                        id={entry.dish.id}
                        className="h-16 w-20 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-base leading-snug text-ink">
                          {entry.dish.nameEs}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.68rem] text-muted">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {entry.dish.prepMinutes} min
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.dish.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeDate(entry.updatedAt)}</span>
                        </span>
                        {entry.note ? (
                          <span className="mt-1 line-clamp-1 block text-[0.7rem] italic text-ink-soft">
                            «{entry.note}»
                          </span>
                        ) : null}
                      </span>
                    </Link>

                    <div className="flex shrink-0 items-center gap-1.5 sm:ml-2">
                      <span
                        className={
                          entry.status === "prepared"
                            ? "fm-chip fm-chip-sage"
                            : "fm-chip fm-chip-neutral"
                        }
                      >
                        {entry.status === "prepared" ? "Preparada" : "Vista"}
                      </span>

                      <div className="hidden sm:block">
                        <RatingStars
                          value={entry.rating}
                          label={`Valoración de ${entry.dish.nameEs}`}
                          size="sm"
                          disabled
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => void toggleFavoriteDish(entry)}
                        disabled={busy || !user}
                        className="fm-icon-button"
                        aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                        aria-pressed={favorite}
                      >
                        {favorite ? (
                          <HeartFilledIcon className="h-4 w-4 text-clay-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditor(entry)}
                        className="fm-icon-button"
                        aria-label={isEditing ? "Cerrar edición" : "Editar entrada"}
                        aria-expanded={isEditing}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      {isConfirming ? (
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void remove(entry)}
                            disabled={busy}
                            className="rounded-md bg-danger-500 px-2 py-1 text-[0.65rem] font-semibold text-cream-50"
                          >
                            Quitar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="rounded-md px-1.5 py-1 text-[0.65rem] font-semibold text-muted"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(entry.dishId)}
                          className="fm-icon-button hover:!text-danger-600"
                          aria-label="Quitar del historial"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && draft ? (
                    <div className="border-t border-line bg-cream-50/60 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="fm-label">Estado</p>
                          <SegmentedControl
                            label="Estado de la receta"
                            value={draft.status}
                            onChange={(status) => setDraft({ ...draft, status })}
                            options={[
                              { value: "viewed", label: "Vista" },
                              { value: "prepared", label: "Preparada" },
                            ]}
                          />

                          <p className="fm-label mt-4">Tu calificación</p>
                          <RatingStars
                            value={draft.rating}
                            onChange={(rating) => setDraft({ ...draft, rating })}
                            label={`Calificar ${entry.dish.nameEs}`}
                            disabled={busy}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block">
                            <span className="fm-label">Nota de cocina</span>
                            <textarea
                              value={draft.note}
                              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                              maxLength={500}
                              rows={2}
                              placeholder="Cambié la sal, quedó más tiempo en el horno…"
                              className="fm-input resize-none text-xs"
                            />
                          </label>

                          <label className="block">
                            <span className="fm-label">Cómo te sentiste</span>
                            <input
                              value={draft.feelingNote}
                              onChange={(event) =>
                                setDraft({ ...draft, feelingNote: event.target.value })
                              }
                              maxLength={200}
                              placeholder="Con energía, tranquila, satisfecha…"
                              className="fm-input text-xs"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="fm-button fm-button-ghost !py-1.5 text-xs"
                          onClick={() => {
                            setEditingId(null);
                            setDraft(null);
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="fm-button fm-button-primary !py-1.5 text-xs"
                          onClick={() => void save(entry)}
                          disabled={busy}
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {history.length > 0 ? (
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[0.7rem] text-muted">
            {history.length} {history.length === 1 ? "receta guardada" : "recetas guardadas"}
            {overview && overview.counts.prepared + overview.counts.viewed > history.length
              ? ` de ${overview.counts.prepared + overview.counts.viewed}`
              : ""}
            .
          </p>
          {confirmClear ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void clearHistory().then(() => {
                    setConfirmClear(false);
                    setEditingId(null);
                    show("Historial vaciado.", "success");
                  });
                }}
                className="rounded-md bg-danger-500 px-2.5 py-1.5 text-[0.68rem] font-semibold text-cream-50"
              >
                Sí, borrar todo
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-[0.68rem] font-semibold text-muted"
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-[0.68rem] font-semibold text-muted hover:text-danger-600"
            >
              Vaciar historial
            </button>
          )}
        </div>
      ) : null}

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
