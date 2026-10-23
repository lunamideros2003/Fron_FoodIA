import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useApi } from "../hooks/useApi.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useToast } from "../hooks/useToast.ts";
import { useUser } from "../context/UserContext.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { StatCard } from "../components/StatCard.tsx";
import { Toast } from "../components/Toast.tsx";
import { ErrorState, SectionHeading, Skeleton } from "../components/Feedback.tsx";
import {
  CheckIcon,
  ChefIcon,
  HeartFilledIcon,
  LeafIcon,
  ScaleIcon,
  TextIcon,
  UserIcon,
  WarningIcon,
} from "../components/icons.tsx";
import { DIET_LABELS, formatDateTime } from "../lib/format.ts";
import type { Diet, HealthProfileInput, UserPreferences } from "../types.ts";

const DIETS: Diet[] = ["omnivore", "vegetarian", "vegan", "pescatarian"];

const PRICES = [
  { value: 1, label: "Económico" },
  { value: 2, label: "Precio medio" },
  { value: 3, label: "Premium" },
];

const SPICE = ["Sin picante", "Suave", "Medio", "Alto"];

const HEALTH_QUESTIONS: { key: keyof Omit<HealthProfileInput, "answered">; label: string; help: string }[] = [
  { key: "diabetes", label: "Diabetes", help: "Ajustamos el azúcar y los carbohidratos de las sugerencias." },
  { key: "hypertension", label: "Hipertensión", help: "Priorizamos recetas con menos sodio." },
  { key: "celiac", label: "Celiaquía", help: "Excluimos recetas con gluten." },
  { key: "lactoseIntolerance", label: "Intolerancia a la lactosa", help: "Evitamos lácteos en las recomendaciones." },
  { key: "highCholesterol", label: "Colesterol alto", help: "Favorecemos opciones con menos grasa saturada." },
];

function splitList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function prefsEqual(a: UserPreferences, b: UserPreferences): boolean {
  return (
    a.diet === b.diet &&
    a.maxPrepMinutes === b.maxPrepMinutes &&
    a.maxSpiceLevel === b.maxSpiceLevel &&
    a.maxPriceLevel === b.maxPriceLevel &&
    a.dailyCalorieGoal === b.dailyCalorieGoal &&
    a.allergies.join("|") === b.allergies.join("|") &&
    a.dislikedIngredients.join("|") === b.dislikedIngredients.join("|")
  );
}

export function ProfilePage() {
  useDocumentTitle("Mi perfil");
  const {
    user,
    users,
    overview,
    loading,
    error,
    selectUser,
    createUser,
    updatePreferences,
    saveHealthProfile,
    refreshSaved,
  } = useUser();
  const { toast, show, clear } = useToast();

  const [diet, setDiet] = useState<Diet>("omnivore");
  const [maxPrep, setMaxPrep] = useState("");
  const [maxPrice, setMaxPrice] = useState("2");
  const [maxSpice, setMaxSpice] = useState("1");
  const [calories, setCalories] = useState("2000");
  const [allergies, setAllergies] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [health, setHealth] = useState<HealthProfileInput>({
    diabetes: false,
    hypertension: false,
    celiac: false,
    lactoseIntolerance: false,
    highCholesterol: false,
    answered: false,
  });
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const savedPrefs = useApi(
    () => (user ? api.savedPreferences(user.id) : Promise.resolve(null)),
    [user?.id],
    { enabled: Boolean(user) },
  );

  useEffect(() => {
    if (!user) return;
    const prefs = user.preferences;
    setDiet(prefs.diet);
    setMaxPrep(prefs.maxPrepMinutes === null ? "" : String(prefs.maxPrepMinutes));
    setMaxPrice(String(prefs.maxPriceLevel));
    setMaxSpice(String(prefs.maxSpiceLevel));
    setCalories(String(prefs.dailyCalorieGoal));
    setAllergies(prefs.allergies.join(", "));
    setDislikes(prefs.dislikedIngredients.join(", "));
    setHealth({
      diabetes: prefs.health.diabetes,
      hypertension: prefs.health.hypertension,
      celiac: prefs.health.celiac,
      lactoseIntolerance: prefs.health.lactoseIntolerance,
      highCholesterol: prefs.health.highCholesterol,
      answered: Boolean(prefs.health.answeredAt),
    });
  }, [user?.id, user?.preferences]);

  const draft: UserPreferences | null = useMemo(() => {
    if (!user) return null;
    return {
      ...user.preferences,
      diet,
      maxPrepMinutes: maxPrep === "" ? null : Number(maxPrep),
      maxPriceLevel: Number(maxPrice),
      maxSpiceLevel: Number(maxSpice),
      dailyCalorieGoal: Number(calories) || 2000,
      allergies: splitList(allergies),
      dislikedIngredients: splitList(dislikes),
      health: {
        ...user.preferences.health,
        ...health,
        answeredAt: health.answered ? user.preferences.health.answeredAt ?? new Date().toISOString() : null,
      },
    };
  }, [user, diet, maxPrep, maxPrice, maxSpice, calories, allergies, dislikes, health]);

  const dirty = Boolean(user && draft && !prefsEqual(user.preferences, draft));
  const healthDirty = Boolean(
    user &&
      (user.preferences.health.diabetes !== health.diabetes ||
        user.preferences.health.hypertension !== health.hypertension ||
        user.preferences.health.celiac !== health.celiac ||
        user.preferences.health.lactoseIntolerance !== health.lactoseIntolerance ||
        user.preferences.health.highCholesterol !== health.highCholesterol ||
        Boolean(user.preferences.health.answeredAt) !== health.answered),
  );

  const savePreferences = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await updatePreferences({
        diet: draft.diet,
        maxPrepMinutes: draft.maxPrepMinutes,
        maxPriceLevel: draft.maxPriceLevel,
        maxSpiceLevel: draft.maxSpiceLevel,
        dailyCalorieGoal: draft.dailyCalorieGoal,
        allergies: draft.allergies,
        dislikedIngredients: draft.dislikedIngredients,
      });
      show("Preferencias guardadas.", "success");
    } catch {
      show("No pudimos guardar tus preferencias.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveHealth = async () => {
    setSaving(true);
    try {
      await saveHealthProfile({ ...health, answered: true });
      setHealth((current) => ({ ...current, answered: true }));
      await refreshSaved();
      show("Perfil de salud actualizado.", "success");
    } catch {
      show("No pudimos guardar el perfil de salud.", "error");
    } finally {
      setSaving(false);
    }
  };

  const create = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    try {
      await createUser({
        displayName: newName.trim(),
        email: newEmail.trim().toLowerCase(),
      });
      setNewName("");
      setNewEmail("");
      setShowCreate(false);
      show("Perfil creado. Ya puedes guardar recetas.", "success");
    } catch {
      show("No pudimos crear el perfil. Revisa el correo.", "error");
    } finally {
      setCreating(false);
    }
  };

  const toggleHealth = (key: keyof typeof health) => {
    setHealth((current) => ({ ...current, [key]: !current[key], answered: true }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32" />
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refreshSaved()} />;
  }

  if (!user || !overview) {
    return (
      <ErrorState
        message="No pudimos cargar tu perfil. Revisa que el backend esté corriendo."
        onRetry={() => void refreshSaved()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mi perfil"
        title="Tus gustos, tu ritmo y tu seguridad"
        description="Con estos datos filtramos las recetas y ajustamos los avisos. Puedes cambiarlos cuando quieras."
      />

      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-peach-200 font-display text-xl text-clay-600">
            {user.displayName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xl leading-tight text-ink">{user.displayName}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-0.5 text-[0.68rem] text-muted">
              En FoodMood desde {formatDateTime(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {users.length > 1 ? (
            <label className="flex items-center gap-2 text-[0.68rem] text-muted">
              Cambiar perfil
              <select
                value={user.id}
                onChange={(event) => {
                  selectUser(Number(event.target.value));
                  clear();
                }}
                className="fm-input !w-auto cursor-pointer !py-1.5 text-xs"
              >
                {users.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.displayName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            className="fm-button fm-button-ghost !py-2 text-xs"
            onClick={() => setShowCreate((current) => !current)}
            aria-expanded={showCreate}
          >
            <UserIcon className="h-4 w-4" />
            {showCreate ? "Cerrar" : "Nuevo perfil"}
          </button>
        </div>
      </section>

      {showCreate ? (
        <section className="mt-3 rounded-2xl border border-clay-200 bg-cream-50 p-4" aria-label="Crear perfil">
          <h2 className="font-display text-base text-ink">Crear un perfil nuevo</h2>
          <p className="mt-1 text-[0.7rem] text-muted">
            Cada perfil guarda sus propios favoritos, historial y preferencias.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label>
              <span className="fm-label">Nombre</span>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                className="fm-input text-xs"
                placeholder="Lucía"
                maxLength={60}
              />
            </label>
            <label>
              <span className="fm-label">Correo</span>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="fm-input text-xs"
                placeholder="lucia@ejemplo.com"
                maxLength={120}
              />
            </label>
            <button
              type="button"
              onClick={() => void create()}
              disabled={creating || !newName.trim() || !newEmail.trim()}
              className="fm-button fm-button-primary self-end !py-2 text-xs"
            >
              Crear perfil
            </button>
          </div>
        </section>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="Favoritos" value={overview.counts.favorites} icon={HeartFilledIcon} tone="peach" />
        <StatCard label="Preparadas" value={overview.counts.prepared} icon={ChefIcon} tone="sage" />
        <StatCard label="Notas" value={overview.counts.notes} icon={TextIcon} tone="cream" />
        <StatCard
          label="Preferencias guardadas"
          value={overview.counts.savedPreferences}
          icon={LeafIcon}
          tone="cream"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="taste-title">
            <SectionHeading
              eyebrow="Cómo comes"
              title="Preferencias de cocina"
              titleId="taste-title"
              description="Las usamos para ordenar y filtrar recomendaciones. Nunca excluyen una receta por su cuenta si hay un alérgeno de por medio."
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="fm-label">Dieta</span>
                <select
                  value={diet}
                  onChange={(event) => setDiet(event.target.value as Diet)}
                  className="fm-input cursor-pointer text-xs"
                >
                  {DIETS.map((option) => (
                    <option key={option} value={option}>
                      {DIET_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Tiempo máximo para cocinar</span>
                <select
                  value={maxPrep}
                  onChange={(event) => setMaxPrep(event.target.value)}
                  className="fm-input cursor-pointer text-xs"
                >
                  <option value="">Sin límite</option>
                  <option value="10">10 minutos</option>
                  <option value="20">20 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Presupuesto por ración</span>
                <select
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  className="fm-input cursor-pointer text-xs"
                >
                  {PRICES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Picante que toleras</span>
                <select
                  value={maxSpice}
                  onChange={(event) => setMaxSpice(event.target.value)}
                  className="fm-input cursor-pointer text-xs"
                >
                  {SPICE.map((label, value) => (
                    <option key={label} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="fm-label">Objetivo calórico diario</span>
                <input
                  type="number"
                  min={1200}
                  max={4000}
                  step={50}
                  value={calories}
                  onChange={(event) => setCalories(event.target.value)}
                  className="fm-input text-xs"
                />
              </label>

              <div className="rounded-lg bg-sage-100 px-3 py-2 text-[0.68rem] leading-relaxed text-ink-soft">
                <CheckIcon className="mr-1 inline h-3 w-3 text-sage-600" />
                Los filtros duros de alergias se revisan siempre contra los ingredientes reales.
              </div>

              <label className="block sm:col-span-2">
                <span className="fm-label">Alergias e intolerancias</span>
                <input
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="gluten, lactosa, frutos secos…"
                  className="fm-input text-xs"
                />
                <span className="mt-1 block text-[0.65rem] text-muted">
                  Separa cada alérgeno con una coma. Se aplican como exclusión estricta.
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="fm-label">Ingredientes que no te gustan</span>
                <input
                  value={dislikes}
                  onChange={(event) => setDislikes(event.target.value)}
                  placeholder="cilantro, hígado, aceitunas…"
                  className="fm-input text-xs"
                />
                <span className="mt-1 block text-[0.65rem] text-muted">
                  Se usan para bajar posiciones, no para bloquear recetas.
                </span>
              </label>
            </div>

            {draft ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
                <p className="text-[0.68rem] text-muted">
                  {dirty ? "Tienes cambios sin guardar." : "Todo guardado."}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="fm-button fm-button-ghost !py-1.5 text-xs"
                    disabled={!dirty || saving}
                    onClick={() => {
                      setDiet(user.preferences.diet);
                      setMaxPrep(
                        user.preferences.maxPrepMinutes === null
                          ? ""
                          : String(user.preferences.maxPrepMinutes),
                      );
                      setMaxPrice(String(user.preferences.maxPriceLevel));
                      setMaxSpice(String(user.preferences.maxSpiceLevel));
                      setCalories(String(user.preferences.dailyCalorieGoal));
                      setAllergies(user.preferences.allergies.join(", "));
                      setDislikes(user.preferences.dislikedIngredients.join(", "));
                    }}
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className="fm-button fm-button-primary !py-1.5 text-xs"
                    disabled={!dirty || saving}
                    onClick={() => void savePreferences()}
                  >
                    Guardar preferencias
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5" aria-labelledby="health-title">
            <SectionHeading
              eyebrow="Seguridad"
              title="Perfil de salud"
              titleId="health-title"
              description="Marca solo lo que tu médico te haya diagnosticado. La app avisa y bloquea recetas incompatibles, pero no sustituye una consulta."
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {HEALTH_QUESTIONS.map((question) => (
                <label
                  key={question.key}
                  className={
                    health[question.key]
                      ? "cursor-pointer rounded-xl border border-clay-300 bg-peach-100 p-3"
                      : "cursor-pointer rounded-xl border border-line bg-cream-50 p-3 hover:border-clay-200"
                  }
                >
                  <span className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(health[question.key])}
                      onChange={() => toggleHealth(question.key)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-clay-500"
                    />
                    <span>
                      <span className="block text-xs font-semibold text-ink">{question.label}</span>
                      <span className="mt-0.5 block text-[0.65rem] leading-relaxed text-muted">
                        {question.help}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-muted">
                <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-500" />
                Si tienes una condición médica, consulta con un profesional antes de cambiar tu
                alimentación.
              </p>
              <button
                type="button"
                className="fm-button fm-button-secondary !py-1.5 text-xs"
                disabled={!healthDirty || saving}
                onClick={() => void saveHealth()}
              >
                <ScaleIcon className="h-4 w-4" />
                Guardar perfil de salud
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-base text-ink">Tu resumen</h2>
            <ul className="mt-3 space-y-3 text-xs">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Recetas vistas</span>
                <span className="font-semibold text-ink">{overview.counts.viewed}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Recetas preparadas</span>
                <span className="font-semibold text-ink">{overview.counts.prepared}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Favoritos</span>
                <span className="font-semibold text-ink">{overview.counts.favorites}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">Notas escritas</span>
                <span className="font-semibold text-ink">{overview.counts.notes}</span>
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <Link to="/historial" className="fm-button fm-button-ghost !px-2.5 !py-1.5 text-[0.68rem]">
                Ver historial
              </Link>
              <Link to="/favoritos" className="fm-button fm-button-ghost !px-2.5 !py-1.5 text-[0.68rem]">
                Ver favoritos
              </Link>
            </div>
          </section>

          {overview.recent.length > 0 ? (
            <section className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-display text-base text-ink">Actividad reciente</h2>
              <ul className="mt-3 space-y-3">
                {overview.recent.slice(0, 4).map((item) => (
                  <li key={item.dish.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/recetas/${item.dish.slug}`}
                        className="block truncate text-xs font-semibold text-ink hover:text-clay-600"
                      >
                        {item.dish.nameEs}
                      </Link>
                      <span className="text-[0.65rem] text-muted">
                        {item.status === "prepared" ? "Preparada" : "Vista"} ·{" "}
                        {formatDateTime(item.updatedAt)}
                      </span>
                    </div>
                    {item.rating ? (
                      <span className="shrink-0 text-[0.68rem] font-semibold text-clay-600">
                        {item.rating}/5
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {savedPrefs.data && savedPrefs.data.items.length > 0 ? (
            <section className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base text-ink">Preferencias guardadas</h2>
                <button
                  type="button"
                  onClick={() => {
                    void api.clearSavedPreferences(user.id).then(() => {
                      savedPrefs.reload();
                      show("Preferencias guardadas eliminadas.", "success");
                    });
                  }}
                  className="text-[0.65rem] font-semibold text-muted hover:text-danger-600"
                >
                  Limpiar
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {savedPrefs.data.items.map((item) => (
                  <span key={item.key} className="fm-chip fm-chip-neutral">
                    {item.key}: {item.value}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      <Toast toast={toast} onDismiss={clear} />
    </div>
  );
}
