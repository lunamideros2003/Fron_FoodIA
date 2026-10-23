import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useAsync } from "../hooks/useAsync.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { useUser } from "../context/UserContext.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { RecipeCard } from "../components/RecipeCard.tsx";
import { IngredientList } from "../components/IngredientList.tsx";
import { StepList } from "../components/StepList.tsx";
import { SafetyPanel } from "../components/SafetyPanel.tsx";
import { AllergenBadges } from "../components/AllergenBadges.tsx";
import { AssistantPanel } from "../components/AssistantPanel.tsx";
import { SubstitutionPanel } from "../components/SubstitutionPanel.tsx";
import { RatingStars } from "../components/RatingStars.tsx";
import { ServingsControl } from "../components/ServingsControl.tsx";
import { Toast } from "../components/Toast.tsx";
import { ErrorState, Skeleton } from "../components/Feedback.tsx";
import {
  CheckCircleIcon,
  ChefIcon,
  ClockIcon,
  FlameIcon,
  HeartFilledIcon,
  HeartIcon,
  ScaleIcon,
} from "../components/icons.tsx";
import { DIFFICULTY_LABELS, PRICE_LABELS, formatCalories, formatServings } from "../lib/format.ts";
import type { AdaptationResponse } from "../types.ts";

const MACROS = [
  { key: "proteinGrams", label: "Proteína", color: "#7d8c6f" },
  { key: "carbsGrams", label: "Carbohidratos", color: "#c9795d" },
  { key: "fatGrams", label: "Grasas", color: "#d79b83" },
] as const;

export function RecipeDetailPage() {
  const { slug = "" } = useParams();
  const { user, favoriteIds, toggleFavorite, history, addHistoryEntry, updateHistoryEntry } =
    useUser();
  const { toast, show, clear } = useToast();

  const state = useAsync(() => api.dishBySlug(slug), [slug]);
  const dish = state.data?.dish;

  useDocumentTitle(dish?.nameEs ?? "Receta");

  const [servings, setServings] = useState(1);
  const [adaptation, setAdaptation] = useState<AdaptationResponse | null>(null);
  const [adapting, setAdapting] = useState(false);
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (dish) setServings(dish.servings);
  }, [dish?.id, dish?.servings, dish]);

  useEffect(() => {
    if (!dish) return;
    if (servings === dish.servings) {
      setAdaptation(null);
      return;
    }

    let active = true;
    setAdapting(true);
    api
      .adapt(dish.slug, { servings })
      .then((response) => active && setAdaptation(response))
      .catch(() => active && setAdaptation(null))
      .finally(() => active && setAdapting(false));

    return () => {
      active = false;
    };
  }, [dish, servings]);

  const entry = useMemo(
    () => history.find((item) => item.dishId === dish?.id) ?? null,
    [history, dish?.id],
  );

  if (state.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64" />
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (state.error || !dish || !state.data) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorState message={state.error ?? "No encontramos esa receta."} onRetry={state.reload} />
        <div className="mt-4 text-center">
          <Link to="/recetas" className="fm-button fm-button-ghost">
            Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const detail = state.data;
  const ingredients = adaptation?.ingredients ?? dish.ingredients;
  const steps = adaptation?.steps ?? dish.steps;
  const safetyNotes = [
    ...detail.safetyNotes,
    ...(adaptation?.warnings ?? []).map((text, index) => ({
      id: `adaptation-${index}`,
      text,
    })),
  ];
  const favorite = favoriteIds.has(dish.id);
  const maxMacro = Math.max(dish.proteinGrams, dish.carbsGrams, dish.fatGrams, 1);

  const toggle = async () => {
    setBusy(true);
    try {
      const saved = await toggleFavorite(dish.id);
      show(saved ? "Guardada en tus favoritos." : "La quitamos de tus favoritos.", "success");
    } catch {
      show("No pudimos guardar el favorito.", "error");
    } finally {
      setBusy(false);
    }
  };

  const markPrepared = async () => {
    setBusy(true);
    try {
      await addHistoryEntry(dish.id, "prepared");
      show("Añadida a tu historial como preparada.", "success");
    } catch {
      show("No pudimos guardar la receta en tu historial.", "error");
    } finally {
      setBusy(false);
    }
  };

  const rate = async (rating: number) => {
    setBusy(true);
    try {
      await updateHistoryEntry(dish.id, { rating });
      show("Guardamos tu calificación.", "success");
    } catch {
      show("No pudimos guardar la calificación.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={dish.category}
        title={dish.nameEs}
        description={dish.description}
        backTo={{ to: "/recetas", label: "Explorar recetas" }}
        actions={
          <>
            <button
              type="button"
              onClick={() => void toggle()}
              disabled={busy || !user}
              className={
                favorite ? "fm-button fm-button-primary" : "fm-button fm-button-ghost"
              }
              title={user ? undefined : "Crea un perfil para guardar favoritos"}
            >
              {favorite ? <HeartFilledIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
              {favorite ? "Guardada" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setSubstituteFor(ingredients[0]?.label ?? "")}
              disabled={!ingredients.length}
              className="fm-button fm-button-ghost !px-3"
              aria-label="Ver sustituciones de ingredientes"
              title="Ver sustituciones de ingredientes"
            >
              <ChefIcon className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative">
              <DishThumb category={dish.category} id={dish.id} className="h-44 w-full sm:h-52" />
              <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-[0.68rem] font-semibold text-ink backdrop-blur">
                {formatServings(dish.servings)} en la receta original
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <div>
                <p className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted">
                  <ClockIcon className="h-3 w-3" /> Tiempo
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{dish.prepMinutes} min</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted">
                  <FlameIcon className="h-3 w-3" /> Energía
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{formatCalories(dish.calories)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted">
                  <ScaleIcon className="h-3 w-3" /> Dificultad
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {DIFFICULTY_LABELS[dish.difficulty]}
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted">Precio</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{PRICE_LABELS[dish.priceLevel]}</p>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="ingredients">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ingredients" className="font-display text-lg text-ink">
                Ingredientes
              </h2>
              <ServingsControl value={servings} onChange={setServings} max={12} disabled={adapting} />
            </div>

            <p className="mt-1 text-xs text-muted">
              {adaptation
                ? `Cantidades ajustadas a ${formatServings(servings)}. Las notas de la adaptación también se actualizaron.`
                : "Ajusta las porciones y las cantidades se recalculan."}
              {adapting ? " Ajustando…" : ""}
            </p>

            <div className="mt-3">
              <IngredientList
                ingredients={ingredients}
                onSubstitute={(ingredient) => setSubstituteFor(ingredient.label)}
              />
            </div>

            {adaptation && adaptation.notes.length > 0 ? (
              <ul className="mt-3 space-y-1 rounded-lg bg-sage-100 px-3 py-2">
                {adaptation.notes.map((note) => (
                  <li key={note} className="text-[0.7rem] leading-relaxed text-ink-soft">
                    {note}
                  </li>
                ))}
              </ul>
            ) : null}

            {substituteFor ? (
              <div className="mt-4">
                <SubstitutionPanel
                  slug={dish.slug}
                  ingredient={substituteFor}
                  userId={user?.id}
                  onClose={() => setSubstituteFor(null)}
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="steps">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="steps" className="font-display text-lg text-ink">
                  Preparación
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Pregúntame por cualquier paso y te respondo con esta receta delante.
                </p>
              </div>
              {dish.chefTip ? (
                <span className="fm-chip fm-chip-sage hidden sm:inline-flex">Consejo del chef</span>
              ) : null}
            </div>

            <div className="mt-4">
              <StepList
                steps={steps}
                safetyNotes={safetyNotes}
                activeStep={activeStep}
                onAsk={setActiveStep}
              />
            </div>

            {dish.chefTip ? (
              <div className="mt-4 rounded-xl bg-cream-100 px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-sage-600">
                  Consejo del chef
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{dish.chefTip}</p>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 sm:grid-cols-2" aria-label="Nutrición y alérgenos">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-display text-base text-ink">Por porción</h2>
              <p className="mt-1 text-xs text-muted">{formatCalories(dish.calories)} por porción</p>

              <div className="mt-4 space-y-3">
                {MACROS.map((macro) => {
                  const value = dish[macro.key];
                  return (
                    <div key={macro.key}>
                      <div className="flex items-baseline justify-between text-[0.7rem]">
                        <span className="text-ink-soft">{macro.label}</span>
                        <span className="font-semibold text-ink">{value} g</span>
                      </div>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-cream-100">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${(value / maxMacro) * 100}%`, background: macro.color }}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[0.7rem]">
                <div>
                  <dt className="text-muted">Azúcares</dt>
                  <dd className="font-semibold text-ink">{dish.nutrition.sugarGrams} g</dd>
                </div>
                <div>
                  <dt className="text-muted">Fibra</dt>
                  <dd className="font-semibold text-ink">{dish.nutrition.fiberGrams} g</dd>
                </div>
                <div>
                  <dt className="text-muted">Sodio</dt>
                  <dd className="font-semibold text-ink">{dish.nutrition.sodiumMg} mg</dd>
                </div>
                <div>
                  <dt className="text-muted">Porciones</dt>
                  <dd className="font-semibold text-ink">{dish.servings}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <h2 className="font-display text-base text-ink">Alérgenos</h2>
                <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
                  Calculados a partir de los ingredientes reales de esta receta.
                </p>
                <div className="mt-3">
                  <AllergenBadges
                    allergens={detail.allergens}
                    containsGluten={dish.containsGluten}
                  />
                </div>
              </div>

              <SafetyPanel
                notes={safetyNotes}
                general={detail.generalSafetyNote}
                title="Seguridad en la cocina"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-base text-ink">Tu recetario</h2>

            <div className="mt-3 space-y-2.5">
              <button
                type="button"
                onClick={() => void toggle()}
                disabled={busy || !user}
                className={favorite ? "fm-button fm-button-secondary w-full" : "fm-button fm-button-primary w-full"}
              >
                {favorite ? <HeartFilledIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
                {favorite ? "En favoritos" : "Guardar en favoritos"}
              </button>

              <button
                type="button"
                onClick={() => void markPrepared()}
                disabled={busy || !user}
                className="fm-button fm-button-ghost w-full"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {entry?.status === "prepared" ? "Ya la preparé" : "Marcar como preparada"}
              </button>

              {!user ? (
                <p className="text-[0.7rem] leading-relaxed text-muted">
                  Crea o elige un perfil para guardar recetas y llevar tu historial.
                </p>
              ) : null}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="fm-label">¿Qué te pareció?</p>
              <RatingStars
                value={entry?.rating ?? null}
                onChange={(rating) => void rate(rating)}
                label={`Calificar ${dish.nameEs}`}
                disabled={busy || !user}
              />
              {entry ? (
                <Link
                  to="/historial"
                  className="mt-2 inline-block text-[0.68rem] font-semibold text-clay-600 hover:underline"
                >
                  Ver en mi historial
                </Link>
              ) : null}
            </div>
          </div>

          <AssistantPanel
            slug={dish.slug}
            stepIndex={activeStep}
            userId={user?.id}
          />

          {activeStep !== null ? (
            <button
              type="button"
              onClick={() => setActiveStep(null)}
              className="w-full text-center text-[0.68rem] font-semibold text-muted hover:text-ink"
            >
              Quitar el foco del paso {activeStep + 1}
            </button>
          ) : null}

          <div className="rounded-2xl bg-sage-100 p-4">
            <p className="text-[0.7rem] leading-relaxed text-ink-soft">
              Las notas de seguridad y los alérgenos son informativos. Si tienes una condición
              médica, consulta con un profesional antes de cambiar tu alimentación.
            </p>
          </div>
        </aside>
      </div>

      {detail.similar.length > 0 ? (
        <section className="mt-12" aria-labelledby="similar">
          <h2 id="similar" className="font-display text-xl text-ink">
            También te puede gustar
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {detail.similar.slice(0, 4).map((entryItem) => (
              <RecipeCard
                key={entryItem.dish.id}
                dish={entryItem.dish}
                compact
                favorite={favoriteIds.has(entryItem.dish.id)}
                onToggleFavorite={(item) => void toggleFavorite(item.id)}
                badge={`${Math.round(entryItem.similarity * 100)}% parecido`}
              />
            ))}
          </div>
        </section>
      ) : null}

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
