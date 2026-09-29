import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useAsync } from "../hooks/useAsync.ts";
import { useUser } from "../context/UserContext.tsx";
import { RecipeView } from "../components/RecipeView.tsx";
import { SectionHeading, Skeleton, ErrorState } from "../components/Feedback.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { AXIS_LABELS, dishVisual } from "../lib/format.ts";
import { formatPercent } from "../lib/format.ts";
import { ClockIcon, FlameIcon, LeafIcon, ScaleIcon } from "../components/icons.tsx";
import type { AxisName } from "../types.ts";

const MACROS = [
  { key: "proteinGrams", label: "Proteína", unit: "g", color: "#6E4650" },
  { key: "carbsGrams", label: "Carbohidratos", unit: "g", color: "#C9A66B" },
  { key: "fatGrams", label: "Grasas", unit: "g", color: "#B08494" },
] as const;

export function DishDetailPage() {
  const { slug = "" } = useParams();
  const { user, recordInteraction } = useUser();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const state = useAsync(() => api.dishBySlug(slug), [slug]);

  const dish = state.data?.dish;
  const similar = state.data?.similar ?? [];

  const react = async (action: string, rating?: number) => {
    if (!dish || !user) {
      setToast("Crea un perfil para avisarle al modelo qué te gusta.");
      return;
    }
    setBusy(true);
    try {
      await recordInteraction({ dishId: dish.id, action, rating: rating ?? null });
      setToast("¡Listo! El modelo ya lo tiene en cuenta.");
    } catch {
      setToast("No pudimos guardar tu opinión.");
    } finally {
      setBusy(false);
    }
  };

  if (state.loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12">
        <Skeleton className="h-64" />
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (state.error || !dish) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12">
        <ErrorState message={state.error ?? "No encontramos ese plato."} onRetry={state.reload} />
        <div className="mt-5 text-center">
          <Link to="/catalogo" className="fm-button fm-button-ghost">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const visual = dishVisual(dish);
  const axisEntries = Object.entries(dish.axes) as [AxisName, number][];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <nav className="text-xs text-cocoa-500" aria-label="Ruta de navegación">
        <Link to="/" className="hover:text-mauve-600">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link to="/catalogo" className="hover:text-mauve-600">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-plum-700">{dish.nameEs}</span>
      </nav>

      <div className="mt-6">
        <RecipeView dish={dish} />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="fm-card p-6">
          <h3 className="text-xl">Perfil de sabor</h3>
          <p className="mt-1 text-xs leading-relaxed text-cocoa-500">
            Estos son los valores que usa el modelo para comparar este plato con tu estado de ánimo.
          </p>
          <div className="mt-4 space-y-2">
            {axisEntries
              .sort((a, b) => b[1] - a[1])
              .map(([axis, value]) => (
                <div key={axis} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-cocoa-600">
                    {AXIS_LABELS[axis] ?? axis}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand-200">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: formatPercent(value), background: visual.ink }}
                    />
                  </span>
                  <span className="w-9 text-right text-xs font-medium text-cocoa-500">
                    {formatPercent(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="fm-card p-6">
            <h3 className="text-xl">Macronutrientes por porción</h3>
            {MACROS.map((macro) => {
              const value = dish[macro.key];
              const max = Math.max(dish.proteinGrams, dish.carbsGrams, dish.fatGrams, 1);
              return (
                <div key={macro.key} className="mt-3 flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-cocoa-600">{macro.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand-200">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(value / max) * 100}%`, background: macro.color }}
                    />
                  </span>
                  <span className="w-14 text-right text-xs font-medium text-cocoa-500">
                    {value} {macro.unit}
                  </span>
                </div>
              );
            })}

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-sand-200 pt-5">
              <div className="rounded-2xl bg-cream-100 px-4 py-3">
                <p className="text-xs text-cocoa-500">Azúcares</p>
                <p className="mt-0.5 text-sm font-semibold text-plum-700">
                  {dish.nutrition.sugarGrams} g
                </p>
              </div>
              <div className="rounded-2xl bg-cream-100 px-4 py-3">
                <p className="text-xs text-cocoa-500">Fibra</p>
                <p className="mt-0.5 text-sm font-semibold text-plum-700">
                  {dish.nutrition.fiberGrams} g
                </p>
              </div>
              <div className="rounded-2xl bg-cream-100 px-4 py-3">
                <p className="text-xs text-cocoa-500">Sodio</p>
                <p className="mt-0.5 text-sm font-semibold text-plum-700">
                  {dish.nutrition.sodiumMg} mg
                </p>
              </div>
              <div className="rounded-2xl bg-cream-100 px-4 py-3">
                <p className="text-xs text-cocoa-500">Tiempo total</p>
                <p className="mt-0.5 text-sm font-semibold text-plum-700">{dish.prepMinutes} min</p>
              </div>
            </div>
          </div>

          <div className="fm-card p-6">
            <h3 className="text-xl">¿Qué te pareció?</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void react("like")}
                className="fm-button fm-button-primary !px-4 !py-2 text-sm"
              >
                Me encantó
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void react("cook")}
                className="fm-button fm-button-ghost !px-4 !py-2 text-sm"
              >
                Lo cociné
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void react("dislike")}
                className="fm-button fm-button-ghost !px-4 !py-2 text-sm"
              >
                No me gustó
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-cocoa-500">
              {user
                ? "Cada respuesta reentrena el modelo al instante."
                : "Estás viendo sin perfil: crea uno para que el modelo aprenda."}
            </p>
          </div>

          <div className="fm-card flex flex-wrap items-center gap-2 p-5">
            <ClockIcon className="h-4 w-4 text-rose-400" />
            <FlameIcon className="h-4 w-4 text-rose-400" />
            <LeafIcon className="h-4 w-4 text-rose-400" />
            <ScaleIcon className="h-4 w-4 text-rose-400" />
            <span className="ml-1 text-xs text-cocoa-500">
              {dish.isVegan
                ? "Vegano"
                : dish.isVegetarian
                  ? "Vegetariano"
                  : "Con proteína animal"}
              {dish.containsGluten ? " · con gluten" : " · sin gluten"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {dish.tags.map((tag) => (
              <span key={tag} className="fm-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="mt-14">
          <SectionHeading
            eyebrow="También te puede gustar"
            title="Platos parecidos a este"
            description="Calculado con filtrado colaborativo sobre lo que ha elegido la gente, y con el perfil de sabor cuando no hay historial."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((entry) => (
              <Link
                key={entry.dish.id}
                to={`/plato/${entry.dish.slug}`}
                className="fm-card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <DishThumb
                  category={entry.dish.category}
                  id={entry.dish.id}
                  className="h-24 w-full"
                />
                <div className="p-4">
                  <p className="font-display text-base text-plum-700 group-hover:text-mauve-600">
                    {entry.dish.nameEs}
                  </p>
                  <p className="mt-1 text-xs text-cocoa-500">
                    {entry.dish.prepMinutes} min · {formatPercent(entry.similarity)} de parecido
                  </p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-wider text-rose-400">
                    {entry.strategy === "collaborative"
                      ? "Según otros usuarios"
                      : "Por perfil de sabor"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-plum-700 px-5 py-3 text-sm font-medium text-cream-50 shadow-lift">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
