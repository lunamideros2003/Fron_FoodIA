import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useApi } from "../hooks/useApi.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useUser } from "../context/UserContext.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { SectionHeading, Skeleton, ErrorState } from "../components/Feedback.tsx";
import { StatCard } from "../components/StatCard.tsx";
import {
  ArrowIcon,
  BowlIcon,
  ChefIcon,
  HeartIcon,
  ScrollIcon,
  TextIcon,
} from "../components/icons.tsx";
import { firstName } from "../lib/text.ts";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function HomePage() {
  useDocumentTitle("Inicio");
  const { user, overview, favoriteIds, toggleFavorite } = useUser();
  const vocabulary = useApi(() => api.questionnaire(), []);
  const featured = useApi(() => api.dishes({ sort: "prep", limit: 3 }), []);

  const counts = overview?.counts;
  const recentFavorites = overview?.favorites ?? [];

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fm-rise">
          <p className="fm-eyebrow">{greeting()}{user ? `, ${firstName(user.displayName)}` : ""}</p>
          <h1 className="mt-3 text-balance text-4xl leading-[1.08] sm:text-5xl">
            <span className="block">La cocina empieza</span>
            <span className="block text-clay-600">por cómo te sientes hoy.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
            Dime qué ánimo traes y cuánto tiempo tienes. Te propongo recetas reales del catálogo,
            con el porqué de cada una y sin inventarme nada.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link to="/animo" className="fm-button fm-button-primary">
              Decirme cómo me siento
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link to="/recetas" className="fm-button fm-button-ghost">
              Explorar las 40 recetas
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted">
            ¿Solo quieres ver qué hay?{" "}
            <Link to="/recetas" className="fm-link">
              Empieza por el catálogo
            </Link>
            .
          </p>
        </div>

        <div className="animate-fm-rise rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6" style={{ animationDelay: "90ms" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Tu cocina

              </p>
              <p className="mt-1 font-display text-lg text-ink">
                {counts ? `${counts.prepared} recetas preparadas` : "Un lugar para tus recetas"}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peach-100 text-clay-600">
              <ChefIcon className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {(recentFavorites.slice(0, 3)).map((favorite) => (
              <Link
                key={favorite.dishId}
                to={`/recetas/${favorite.dish.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-cream-100 px-3.5 py-3 transition-colors hover:bg-peach-100"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {favorite.dish.nameEs}
                  </span>
                  <span className="block text-[0.68rem] text-muted">
                    {favorite.dish.category} · {favorite.dish.prepMinutes} min
                  </span>
                </span>
                <HeartIcon className="h-4 w-4 shrink-0 text-clay-500" />
              </Link>
            ))}

            {recentFavorites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center">
                <p className="text-sm text-ink-soft">
                  Todavía no guardaste ninguna receta.
                </p>
                <p className="mt-1 text-xs text-muted">
                  Cuando encuentres una que te guste, toca el corazón y aparecerá aquí.
                </p>
                <Link to="/recetas" className="fm-button fm-button-ghost mt-4 !py-2 text-xs">
                  Buscar una receta
                </Link>
              </div>
            ) : (
              <Link
                to="/favoritos"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-sage-100 px-3 py-2.5 text-xs font-semibold text-sage-600 transition-colors hover:bg-sage-200"
              >
                Ver todos mis favoritos
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="mood-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow="Empieza aquí" title="¿Cómo estás hoy?" titleId="mood-heading" />
          <Link to="/animo" className="fm-button fm-button-ghost !py-2 text-xs">
            Ir al cuestionario completo
          </Link>
        </div>

        <div className="mt-6">
          {vocabulary.loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          ) : vocabulary.error ? (
            <ErrorState message={vocabulary.error} onRetry={vocabulary.reload} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vocabulary.data?.moods.map((mood) => (
                <Link
                  key={mood.key}
                  to={`/animo?mood=${mood.key}`}
                  className="rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-soft"
                >
                  <span className="fm-eyebrow">Mi ánimo</span>
                  <span className="mt-1.5 block font-display text-base font-semibold text-ink">
                    {mood.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {mood.description}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {user ? (
        <section aria-label="Tu resumen">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Favoritos"
              value={counts?.favorites ?? favoriteIds.size}
              icon={HeartIcon}
              to="/favoritos"
              tone="peach"
            />
            <StatCard
              label="Preparadas"
              value={counts?.prepared ?? 0}
              icon={ChefIcon}
              to="/historial"
              tone="sage"
            />
            <StatCard
              label="Recetas vistas"
              value={counts?.viewed ?? 0}
              icon={ScrollIcon}
              to="/historial"
            />
            <StatCard
              label="Notas escritas"
              value={counts?.notes ?? 0}
              icon={TextIcon}
              to="/historial"
            />
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Herramientas de cocina">
        <Link
          to="/despensa"
          className="group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-soft"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-600">
            <BowlIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-display text-lg text-ink">Cocina con lo que tienes</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Añade los ingredientes de tu nevera y descubre qué recetas puedes hacer completas y
            cuáles te faltan uno o dos.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-clay-600">
            Abrir mi despensa
            <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          to="/plan"
          className="group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-soft"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-peach-100 text-clay-600">
            <ScrollIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-display text-lg text-ink">Planea unos días</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Desayuno, almuerzo, cena y merienda para 3, 5 o 7 días, con lista de compras armada
            desde las recetas que elijas.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-clay-600">
            Armar mi plan
            <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow="Del catálogo" title="Listas en menos de media hora" />
          <Link to="/recetas?sort=prep" className="fm-button fm-button-ghost !py-2 text-xs">
            Ver todas
          </Link>
        </div>

        <div className="mt-6">
          {featured.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-72" />
              ))}
            </div>
          ) : featured.error ? (
            <ErrorState message={featured.error} onRetry={featured.reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data?.items.map((dish) => (
                <RecipeCard
                  key={dish.id}
                  dish={dish}
                  favorite={favoriteIds.has(dish.id)}
                  onToggleFavorite={(item) => void toggleFavorite(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
