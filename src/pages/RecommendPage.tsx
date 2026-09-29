import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api.ts";
import { useUser } from "../context/UserContext.tsx";
import { MoodCard } from "../components/MoodCard.tsx";
import { DishCard } from "../components/DishCard.tsx";
import { HealthQuestionnaire } from "../components/HealthQuestionnaire.tsx";
import { RecipeView } from "../components/RecipeView.tsx";
import { BalanceStep } from "../components/BalanceStep.tsx";
import { SectionHeading, ErrorState, CardSkeletonList } from "../components/Feedback.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { DIET_LABELS } from "../lib/format.ts";
import type {
  BalanceResponse,
  Diet,
  HealthCondition,
  HealthProfileInput,
  Mood,
  MoodKey,
  RecommendationResponse,
} from "../types.ts";

const QUICK_NOTES = [
  "no tengo ganas de cocinar",
  "algo rapidísimo",
  "dulce pero no empalagoso",
  "barato y rico",
  "con pollo",
  "que no sea muy picante",
];

const MOOD_HINTS: Record<MoodKey, string> = {
  tired: "Cosas que se sienten abrazo, sin demasiada complicación.",
  happy: "Platos con personalidad, para celebrar el buen día.",
  stressed: "Calma en un plato: sabor familiar y cero complicación.",
  sad: "Aquí lo dulce está permitido, e incluso recomendado.",
  no_energy: "Ligero pero que te llene, fácil de digerir.",
  in_a_hurry: "Menos de 20 minutos y a la mesa.",
};

/** Moods where asking about health before serving is most valuable. */
const HEALTH_SENSITIVE_MOODS: MoodKey[] = ["sad", "no_energy"];

/**
 * The health profile uses camelCase keys (it is a stored user object) while the
 * `conditions` filter on the API uses the snake_case condition ids. This is the
 * single place where the two meet.
 */
const CONDITION_IDS: Partial<Record<keyof HealthProfileInput, HealthCondition>> = {
  diabetes: "diabetes",
  hypertension: "hypertension",
  celiac: "celiac",
  lactoseIntolerance: "lactose_intolerance",
  highCholesterol: "high_cholesterol",
};

function toConditionList(value: HealthProfileInput | null): HealthCondition[] {
  if (!value) return [];
  return (Object.keys(CONDITION_IDS) as (keyof HealthProfileInput)[])
    .filter((key) => value[key] === true)
    .map((key) => CONDITION_IDS[key]!)
    .filter(Boolean);
}

type Stage = "recommend" | "recipe" | "balance";

export function RecommendPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, users, recordInteraction, interactions, saveHealthProfile } = useUser();

  const initialMood = (searchParams.get("mood") as MoodKey | null) ?? null;
  const initialNote = searchParams.get("nota") ?? "";

  const [moods, setMoods] = useState<Mood[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [mood, setMood] = useState<MoodKey | null>(initialMood);
  const [note, setNote] = useState(initialNote);
  const [maxPrep, setMaxPrep] = useState<number | null>(null);
  const [diet, setDiet] = useState<Diet | null>(null);
  const [conditions, setConditions] = useState<HealthCondition[]>([]);

  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyDishId, setBusyDishId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [showHealth, setShowHealth] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);

  const [stage, setStage] = useState<Stage>("recommend");
  const [chosenSlug, setChosenSlug] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const savedDishIds = useMemo(
    () =>
      new Set(
        interactions
          .filter((item) => item.action === "save" || item.action === "cook")
          .map((item) => item.dishId),
      ),
    [interactions],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    api
      .moods()
      .then((response) => active && setMoods(response.items))
      .catch(() => active && setMoods([]))
      .finally(() => active && setMoodsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    async (targetMood: MoodKey | null = mood) => {
      if (!targetMood) return;

      setLoading(true);
      setError(null);
      setStage("recommend");

      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          next.set("mood", targetMood);
          if (note.trim()) next.set("nota", note.trim());
          else next.delete("nota");
          return next;
        },
        { replace: true },
      );

      try {
        const response = await api.recommend({
          moodKey: targetMood,
          userId: user?.id,
          limit: 6,
          freeText: note.trim() || undefined,
          maxPrepMinutes: maxPrep ?? undefined,
          diet: diet ?? undefined,
          conditions: conditions.length > 0 ? conditions : undefined,
        });
        setResult(response);
        if (response.needsHealthInfo) setShowHealth(true);
      } catch (cause) {
        setResult(null);
        setError(
          cause instanceof ApiError
            ? cause.message
            : "No pudimos generar recomendaciones. Inténtalo de nuevo.",
        );
      } finally {
        setLoading(false);
      }
    },
    [note, maxPrep, diet, conditions, user?.id, mood, setSearchParams],
  );

  useEffect(() => {
    if (initialMood) void run(initialMood);
    // Only fire on arrival with a mood already in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMood]);

  const handleRate = async (dishId: number, rating: number) => {
    if (!user) {
      setToast("Crea un perfil para que el modelo pueda aprender de ti.");
      return;
    }
    setBusyDishId(dishId);
    try {
      await recordInteraction({
        dishId,
        action: "rate",
        rating,
        moodKey: result?.mood.key ?? mood,
      });
      setToast("¡Gracias! El modelo ya tomó en cuenta tu opinión.");
    } catch {
      setToast("No pudimos guardar tu opinión.");
    } finally {
      setBusyDishId(null);
    }
  };

  const handleSave = async (dishId: number) => {
    if (!user) return setToast("Crea un perfil para guardar tus favoritos.");
    setBusyDishId(dishId);
    try {
      await recordInteraction({ dishId, action: "save", moodKey: result?.mood.key ?? mood });
      setToast("Guardado en tu perfil.");
    } finally {
      setBusyDishId(null);
    }
  };

  const handleDislike = async (dishId: number) => {
    if (!user) return setToast("Crea un perfil para que el modelo aprenda.");
    setBusyDishId(dishId);
    try {
      await recordInteraction({ dishId, action: "dislike", moodKey: result?.mood.key ?? mood });
      setResult((current) =>
        current
          ? { ...current, items: current.items.filter((item) => item.dish.id !== dishId) }
          : current,
      );
      setToast("Listo, no te volvemos a mostrar ese plato.");
    } finally {
      setBusyDishId(null);
    }
  };

  /** User picked a dish: show the recipe, then the balance for the rest of the day. */
  const handleEat = async (dishId: number, slug: string, servings: number) => {
    if (!user) {
      setToast("Crea un perfil para que podamos armarte el plan del día.");
      return;
    }

    setStage("recipe");
    setChosenSlug(slug);
    setBalanceLoading(true);

    try {
      await api.markConsumed(user.id, dishId, result?.mood.key ?? mood);
    } catch {
      // Logging is best-effort; the balance still works without it.
    }

    try {
      const response = await api.balance({
        userId: user.id,
        moodKey: result?.mood.key ?? mood ?? undefined,
        justChosenDishId: dishId,
        servingsEaten: servings,
        conditions: conditions.length > 0 ? conditions : undefined,
      });
      setBalance(response);
      setStage("balance");
    } catch {
      setToast("No pudimos calcular el balance del día.");
    } finally {
      setBalanceLoading(false);
    }
  };

  const submitHealth = async (value: HealthProfileInput | null) => {
    setConditions(toConditionList(value));

    if (!value || !user) {
      setShowHealth(false);
      return;
    }

    setSavingHealth(true);
    try {
      await saveHealthProfile(value);
      setToast("Listo, tu perfil de salud ya está activo.");
      if (mood) void run(mood);
    } catch {
      setToast("No pudimos guardar tus condiciones, pero las aplicamos para esta búsqueda.");
    } finally {
      setSavingHealth(false);
      setShowHealth(false);
    }
  };

  const chosenDish = useMemo(() => {
    if (!chosenSlug) return null;
    return (
      result?.items.find((item) => item.dish.slug === chosenSlug)?.dish ??
      result?.alternatives.find((item) => item.dish.slug === chosenSlug)?.dish ??
      null
    );
  }, [chosenSlug, result]);

  const selectedMood = moods.find((item) => item.key === mood) ?? null;
  const healthAskedOnce = Boolean(user?.preferences.health.answeredAt);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <SectionHeading
        eyebrow="Recomendaciones"
        title="Dinos cómo estás y buscamos qué comer"
        description="El modelo cruza tu ánimo, tus preferencias, tus notas, tu salud y lo que has cocinado antes."
      />

      {/* Step 1 */}
      <section className="mt-10">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs text-cream-50">
            1
          </span>
          Tu estado de ánimo
        </h3>

        {moodsLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="fm-skeleton h-24 rounded-4xl" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moods.map((item) => (
              <MoodCard
                key={item.key}
                mood={item}
                selected={mood === item.key}
                onSelect={(next) => {
                  setMood(next.key);
                  void run(next.key);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Step 2 */}
      <section className="mt-10">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs text-cream-50">
            2
          </span>
          Afina los detalles
        </h3>

        <div className="fm-card mt-4 grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-plum-700">
              ¿Qué se te antoja? Cuéntalo como sea
            </span>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && mood) void run();
              }}
              placeholder="Ej: algo calientito y barato, no muy picante"
              className="fm-input"
              maxLength={240}
            />
            <span className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => {
                    setNote(quick);
                    if (mood) window.setTimeout(() => void run(), 0);
                  }}
                  className="fm-chip transition-colors hover:bg-blush-200"
                >
                  {quick}
                </button>
              ))}
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-plum-700">Tiempo máximo</span>
            <select
              value={maxPrep ?? ""}
              onChange={(event) => {
                const value = event.target.value ? Number(event.target.value) : null;
                setMaxPrep(value);
                if (mood) window.setTimeout(() => void run(), 0);
              }}
              className="fm-input cursor-pointer"
            >
              <option value="">Sin límite</option>
              <option value="10">10 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-plum-700">Dieta</span>
            <select
              value={diet ?? ""}
              onChange={(event) => {
                const value = event.target.value ? (event.target.value as Diet) : null;
                setDiet(value);
                if (mood) window.setTimeout(() => void run(), 0);
              }}
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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="fm-button fm-button-primary"
            onClick={() => void run()}
            disabled={!mood || loading}
          >
            {loading ? "Pensando…" : "Recomendar"}
          </button>

          {!healthAskedOnce && mood && HEALTH_SENSITIVE_MOODS.includes(mood) ? (
            <button
              type="button"
              className="fm-button fm-button-ghost"
              onClick={() => setShowHealth((open) => !open)}
            >
              Tengo una condición de salud
            </button>
          ) : null}

          {mood ? (
            <span className="text-sm text-cocoa-500">{MOOD_HINTS[mood]}</span>
          ) : (
            <span className="text-sm text-cocoa-500">Elige un estado de ánimo primero</span>
          )}
        </div>

        {showHealth ? (
          <div className="mt-5">
            <HealthQuestionnaire
              question={
                result?.healthQuestion ??
                "Antes de armarte el plan, ¿tienes alguna condición de salud que debamos tener en cuenta?"
              }
              initial={{
                diabetes: user?.preferences.health.diabetes ?? false,
                hypertension: user?.preferences.health.hypertension ?? false,
                celiac: user?.preferences.health.celiac ?? false,
                lactoseIntolerance: user?.preferences.health.lactoseIntolerance ?? false,
                highCholesterol: user?.preferences.health.highCholesterol ?? false,
              }}
              saving={savingHealth}
              onSubmit={(value) => void submitHealth(value)}
              onDismiss={() => setShowHealth(false)}
            />
          </div>
        ) : null}
      </section>

      {/* Step 3 */}
      <section className="mt-12">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs text-cream-50">
            3
          </span>
          {loading ? "Analizando…" : stage === "balance" ? "Tu plan para el resto del día" : "Tu resultado"}
        </h3>

        {error ? (
          <div className="mt-5">
            <ErrorState message={error} onRetry={() => void run()} />
          </div>
        ) : null}

        {loading && !result ? <div className="mt-5"><CardSkeletonList count={3} /></div> : null}

        {result && !loading && stage === "recommend" ? (
          <div className="mt-5 space-y-8">
            <div className="fm-card overflow-hidden">
              <div
                className="flex items-center gap-4 px-6 py-5"
                style={{ background: `linear-gradient(120deg, ${result.mood.accent}33, #F6D3D655)` }}
              >
                <span className="text-4xl" aria-hidden="true">
                  {result.mood.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mauve-600">
                    Te sientes {result.mood.label.toLowerCase()}
                  </p>
                  <p className="mt-1 text-[0.98rem] leading-relaxed text-cocoa-700">
                    {result.narrative}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-sand-200 px-6 py-3 text-xs text-cocoa-500">
                <span>Modelo {result.modelVersion}</span>
                <span>{result.strategy}</span>
                <span>
                  {new Date(result.generatedAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {user && conditions.length === 0 && user.preferences.health.diabetes ? (
                  <span className="text-mauve-600">Filtros de tu perfil de salud activos</span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((item, index) => (
                <DishCard
                  key={item.dish.id}
                  item={item}
                  rank={index + 1}
                  saved={savedDishIds.has(item.dish.id)}
                  busy={busyDishId === item.dish.id}
                  onRate={handleRate}
                  onSave={handleSave}
                  onDislike={handleDislike}
                  onPick={() => void handleEat(item.dish.id, item.dish.slug, 1)}
                  canPick={Boolean(user)}
                />
              ))}
            </div>

            {result.alternatives.length > 0 ? (
              <div>
                <h4 className="text-lg">Si ninguno te convence</h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {result.alternatives.map((alternative) => (
                    <div key={alternative.dish.id} className="fm-card overflow-hidden">
                      <DishThumb
                        category={alternative.dish.category}
                        id={alternative.dish.id}
                        className="h-24 w-full"
                      />
                      <div className="p-4">
                        <p className="font-display text-base text-plum-700">
                          {alternative.dish.nameEs}
                        </p>
                        <p className="mt-1 text-xs text-cocoa-500">
                          {alternative.dish.prepMinutes} min · {alternative.dish.calories} kcal
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-cocoa-600">
                          {alternative.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="fm-button fm-button-ghost" onClick={() => void run()}>
                Otras opciones
              </button>
              <button
                type="button"
                className="fm-button fm-button-ghost"
                onClick={() => navigate("/perfil")}
              >
                Ver mi historial
              </button>
            </div>
          </div>
        ) : null}

        {/* Stage: recipe */}
        {result && stage === "recipe" && chosenDish ? (
          <div className="mt-5">
            <RecipeView dish={chosenDish} onClose={() => setStage("recommend")} />
          </div>
        ) : null}

        {/* Stage: balance */}
        {balance && stage === "balance" ? (
          <div className="mt-5">
            {balanceLoading ? (
              <CardSkeletonList count={3} />
            ) : (
              <BalanceStep
                balance={balance}
                onPick={(slug) => navigate(`/plato/${slug}`)}
                onClose={() => {
                  setStage("recommend");
                  setBalance(null);
                }}
              />
            )}
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <p className="mt-6 rounded-2xl bg-blush-100 px-5 py-6 text-sm text-cocoa-600">
            Selecciona cómo te sientes arriba y te decimos qué comer. Podrás ver la receta completa y
            qué te conviene comer el resto del día.
          </p>
        ) : null}
      </section>

      {users.length === 0 && !moodsLoading ? (
        <p className="mt-8 text-center text-xs text-cocoa-500">
          Crea un perfil en <span className="font-medium">Mi perfil</span> para que el modelo pueda
          aprender de ti y armar el balance del día.
        </p>
      ) : null}

      {selectedMood && stage === "recommend" && result ? (
        <p className="sr-only">{MOOD_HINTS[selectedMood.key]}</p>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-plum-700 px-5 py-3 text-sm font-medium text-cream-50 shadow-lift">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
