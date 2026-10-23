import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, api } from "../lib/api.ts";
import { useApi } from "../hooks/useApi.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { useUser } from "../context/UserContext.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { MoodOptionCard } from "../components/MoodOptionCard.tsx";
import { MoodResultCard } from "../components/MoodResultCard.tsx";
import { Toast } from "../components/Toast.tsx";
import { ErrorState, Skeleton } from "../components/Feedback.tsx";
import { ChevronDownIcon, DiceIcon, SparkIcon, WarningIcon } from "../components/icons.tsx";
import { cn } from "../lib/cn.ts";
import { parseIngredientInput } from "../lib/text.ts";
import type {
  CravingKey,
  Diet,
  MoodOptionKey,
  QuestionnaireMood,
  RecommendationResponse,
  TimeBudgetKey,
} from "../types.ts";

const QUICK_NOTES = [
  "no tengo ganas de cocinar",
  "algo rapidísimo",
  "dulce pero no empalagoso",
  "barato y rico",
  "con pollo",
  "que no pique",
];

function isMoodOption(value: string | null): value is MoodOptionKey {
  return (
    value === "energized" ||
    value === "low" ||
    value === "stressed_tired" ||
    value === "bored" ||
    value === "calm" ||
    value === "celebrating"
  );
}

export function MoodPage() {
  useDocumentTitle("Mi ánimo");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, favoriteIds, toggleFavorite } = useUser();
  const { toast, show, clear } = useToast();

  const vocabulary = useApi(() => api.questionnaire(), []);

  const initialMood = searchParams.get("mood");
  const [moodOption, setMoodOption] = useState<MoodOptionKey | null>(
    isMoodOption(initialMood) ? initialMood : null,
  );
  const [timeBudget, setTimeBudget] = useState<TimeBudgetKey>("between_10_30");
  const [craving, setCraving] = useState<CravingKey>("surprise");
  const [note, setNote] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [available, setAvailable] = useState("");
  const [excluded, setExcluded] = useState("");
  const [allergies, setAllergies] = useState("");
  const [diet, setDiet] = useState<Diet | "">("");
  const [difficulty, setDifficulty] = useState<"facil" | "media" | "avanzada" | "">("");
  const [servings, setServings] = useState(2);

  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("mood");
    if (isMoodOption(fromUrl) && fromUrl !== moodOption) setMoodOption(fromUrl);
    // Only react to external changes in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedMood: QuestionnaireMood | undefined = vocabulary.data?.moods.find(
    (mood) => mood.key === moodOption,
  );

  const submit = async () => {
    if (!moodOption) {
      show("Primero elige cómo te sientes.", "info");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchParams({ mood: moodOption }, { replace: true });

    try {
      const response = await api.recommendFromQuestionnaire({
        moodOption,
        timeBudget,
        craving,
        note: note.trim() || undefined,
        availableIngredients: parseIngredientInput(available),
        excludedIngredients: parseIngredientInput(excluded),
        allergies: parseIngredientInput(allergies),
        diet: diet || undefined,
        difficulty: difficulty || undefined,
        servings,
        userId: user?.id,
        limit: 3,
      });

      setResult(response);
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch (cause) {
      setResult(null);
      setError(
        cause instanceof ApiError
          ? cause.message
          : "No pudimos encontrar recetas para esa combinación.",
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
        eyebrow="Mi ánimo"
        title="Cuéntame cómo es tu día"
        description="No hay respuestas correctas. Con dos o tres toques ya tengo lo necesario para proponerte algo que puedas cocinar hoy."
      />

      <form
        className="mt-8 space-y-9"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <section aria-labelledby="step-mood">
          <div className="flex items-baseline gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-500 text-[0.7rem] font-bold text-cream-50">
              1
            </span>
            <h2 id="step-mood" className="font-display text-lg text-ink">
              ¿Cómo te sientes ahora?
            </h2>
          </div>

          <div className="mt-4">
            {vocabulary.loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-24" />
                ))}
              </div>
            ) : vocabulary.error ? (
              <ErrorState message={vocabulary.error} onRetry={vocabulary.reload} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {vocabulary.data?.moods.map((mood) => (
                  <MoodOptionCard
                    key={mood.key}
                    mood={mood}
                    selected={moodOption === mood.key}
                    onSelect={(next) => setMoodOption(next.key)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="step-time">
          <div className="flex items-baseline gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-500 text-[0.7rem] font-bold text-cream-50">
              2
            </span>
            <h2 id="step-time" className="font-display text-lg text-ink">
              ¿Cuánto tiempo tienes?
            </h2>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-labelledby="step-time">
            {vocabulary.data?.timeBudgets.map((budget) => {
              const active = timeBudget === budget.key;
              return (
                <button
                  key={budget.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTimeBudget(budget.key)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-clay-500 bg-peach-100"
                      : "border-line bg-surface hover:border-clay-300",
                  )}
                >
                  <span className="block text-sm font-semibold text-ink">{budget.label}</span>
                  <span className="mt-1 block text-[0.7rem] leading-relaxed text-muted">
                    {budget.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="step-craving">
          <div className="flex items-baseline gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-500 text-[0.7rem] font-bold text-cream-50">
              3
            </span>
            <h2 id="step-craving" className="font-display text-lg text-ink">
              ¿Qué se te antoja?
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="step-craving">
            {vocabulary.data?.cravings.map((option) => {
              const active = craving === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCraving(option.key)}
                  title={option.description}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-clay-500 bg-clay-500 text-cream-50"
                      : "border-line bg-surface text-ink-soft hover:border-clay-300 hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            aria-expanded={showAdvanced}
          >
            <span>
              <span className="block text-sm font-semibold text-ink">Detalles opcionales</span>
              <span className="mt-0.5 block text-xs text-muted">
                Alergias, dieta, ingredientes que tienes o una nota con tus palabras.
              </span>
            </span>
            <ChevronDownIcon
              className={cn("h-4 w-4 shrink-0 text-muted transition-transform", showAdvanced && "rotate-180")}
            />
          </button>

          {showAdvanced ? (
            <div className="grid gap-4 border-t border-line px-5 py-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="fm-label">Cuéntalo con tus palabras</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={240}
                  rows={2}
                  placeholder="Ej: algo calientito y barato, no muy picante"
                  className="fm-input resize-none"
                />
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_NOTES.map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setNote(quick)}
                      className="fm-chip transition-colors hover:bg-peach-200"
                    >
                      {quick}
                    </button>
                  ))}
                </span>
              </label>

              <label className="block">
                <span className="fm-label">Ingredientes que ya tienes</span>
                <input
                  value={available}
                  onChange={(event) => setAvailable(event.target.value)}
                  placeholder="huevo, tortilla, aguacate"
                  className="fm-input"
                />
                <span className="fm-hint">Sepáralos con comas.</span>
              </label>

              <label className="block">
                <span className="fm-label">Ingredientes que no quieres ver</span>
                <input
                  value={excluded}
                  onChange={(event) => setExcluded(event.target.value)}
                  placeholder="cerdo, cilantro"
                  className="fm-input"
                />
                <span className="fm-hint">Se excluyen del resultado, no son una preferencia.</span>
              </label>

              <label className="block">
                <span className="fm-label">Alergias o intolerancias</span>
                <input
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="gluten, leche, frutos secos"
                  className="fm-input"
                />
                <span className="fm-hint">Se tratan como un límite duro.</span>
              </label>

              <label className="block">
                <span className="fm-label">Dieta</span>
                <select
                  value={diet}
                  onChange={(event) => setDiet(event.target.value as Diet | "")}
                  className="fm-input cursor-pointer"
                >
                  <option value="">La de mi perfil</option>
                  {vocabulary.data?.diets
                    .filter((option) => option.value !== "omnivore")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Dificultad máxima</span>
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as "facil" | "media" | "avanzada" | "")
                  }
                  className="fm-input cursor-pointer"
                >
                  <option value="">Me da igual</option>
                  {vocabulary.data?.difficulties.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Porciones</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(event) =>
                    setServings(Math.max(1, Math.min(12, Number(event.target.value) || 1)))
                  }
                  className="fm-input"
                />
              </label>
            </div>
          ) : null}
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-clay-300 bg-peach-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ink-soft">
            {selectedMood
              ? `Me dijiste que te sientes «${selectedMood.label.toLowerCase()}». Con eso ya puedo buscar.`
              : "Elige cómo te sientes para que pueda buscar."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/recetas" className="fm-button fm-button-ghost !py-2 text-xs">
              Ver el catálogo
            </Link>
            <button type="submit" className="fm-button fm-button-primary" disabled={!moodOption || loading}>
              {loading ? (
                "Buscando…"
              ) : (
                <>
                  <SparkIcon className="h-4 w-4" />
                  Buscar recetas para mí
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div ref={resultsRef} className="scroll-mt-24">
        {error ? (
          <div className="mt-8">
            <ErrorState message={error} onRetry={() => void submit()} />
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        ) : null}

        {result && !loading ? (
          <section className="mt-10 space-y-6" aria-live="polite">
            <div className="rounded-2xl border border-line bg-gradient-to-br from-peach-100 to-cream-100 p-5 sm:p-6">
              <p className="fm-eyebrow">
                {result.questionnaire?.moodLabel ?? "Tu resultado"}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink">
                {result.summary}
              </p>
              {result.supportHint ? (
                <p className="mt-3 flex gap-2 rounded-xl bg-surface/70 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
                  <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-600" />
                  {result.supportHint}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-muted">
                <span>Modelo {result.modelVersion}</span>
                <span>{result.strategy}</span>
                <span>
                  {new Date(result.generatedAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl text-ink">Tres opciones para hoy</h2>
              <button
                type="button"
                onClick={() => void submit()}
                className="fm-button fm-button-ghost !py-2 text-xs"
              >
                <DiceIcon className="h-4 w-4" />
                Sorpréndeme otra vez
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((item, index) => (
                <MoodResultCard
                  key={item.dish.id}
                  item={item}
                  rank={index + 1}
                  structured={result.structured.find(
                    (entry) => entry.recipeId === item.dish.id,
                  )}
                  favorite={favoriteIds.has(item.dish.id)}
                  onToggleFavorite={() =>
                    void toggleFavoriteDish(item.dish.id, item.dish.nameEs)
                  }
                />
              ))}
            </div>

            {result.alternatives.length > 0 ? (
              <div>
                <h3 className="font-display text-base text-ink">Si ninguna te convence</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {result.alternatives.map((alternative) => (
                    <Link
                      key={alternative.dish.id}
                      to={`/recetas/${alternative.dish.slug}`}
                      className="rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-clay-300"
                    >
                      <p className="text-sm font-semibold text-ink">{alternative.dish.nameEs}</p>
                      <p className="mt-1 text-[0.68rem] text-muted">
                        {alternative.dish.prepMinutes} min · {alternative.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-[0.7rem] leading-relaxed text-muted">
              Las recomendaciones se basan en los datos de la receta y en lo que nos contaste.
              No son consejo médico ni nutricional.
            </p>
          </section>
        ) : null}
      </div>

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
