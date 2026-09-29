import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { useApi } from "../hooks/useApi.ts";
import { useUser } from "../context/UserContext.tsx";
import { SectionHeading, Skeleton, ErrorState, EmptyState } from "../components/Feedback.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { DIET_LABELS, formatPercent, formatRelativeDate } from "../lib/format.ts";
import { MindIcon, PeopleIcon, ScaleIcon, TextIcon } from "../components/icons.tsx";
import type { Diet, HealthProfile, UserPreferences } from "../types.ts";

const ACTION_LABELS: Record<string, string> = {
  impression: "visto en recomendaciones",
  view: "visto",
  like: "le gustó",
  save: "guardó",
  cook: "cocinó",
  eat: "comió",
  rate: "calificó",
  dislike: "no le gustó",
};

/** Short badge so the history stays scannable without emoji. */
const ACTION_BADGE: Record<string, string> = {
  impression: "V",
  view: "V",
  like: "+",
  save: "G",
  cook: "C",
  eat: "C",
  rate: "R",
  dislike: "−",
};

const BADGE_STYLE: Record<string, string> = {
  like: "bg-blush-200 text-plum-700",
  save: "bg-sand-200 text-[#7A5A2A]",
  cook: "bg-sand-200 text-[#7A5A2A]",
  eat: "bg-sand-200 text-[#7A5A2A]",
  dislike: "bg-mauve-500 text-cream-50",
};

const CONDITION_LABELS: Record<string, string> = {
  diabetes: "Diabetes",
  hypertension: "Hipertensión",
  celiac: "Celiaquía",
  lactose_intolerance: "Intolerancia a la lactosa",
  high_cholesterol: "Colesterol alto",
};

const CONDITION_OPTIONS: { key: keyof Omit<HealthProfile, "answeredAt">; label: string }[] = [
  { key: "diabetes", label: "Diabetes" },
  { key: "hypertension", label: "Hipertensión" },
  { key: "celiac", label: "Celiaquía" },
  { key: "lactoseIntolerance", label: "Intolerancia a la lactosa" },
  { key: "highCholesterol", label: "Colesterol alto" },
];

function activeConditions(health: HealthProfile): string[] {
  return CONDITION_OPTIONS.filter((option) => health[option.key]).map(
    (option) => CONDITION_LABELS[option.key],
  );
}

/** The taste summary only returns ids, so the catalogue fills in the visuals. */
function useDishLookup() {
  const catalogue = useApi(() => api.dishes(), []);
  const byId = new Map((catalogue.data?.items ?? []).map((dish) => [dish.id, dish]));
  return {
    dishSlug: (id: number) => byId.get(id)?.slug ?? null,
    dishCategory: (id: number) => byId.get(id)?.category ?? "Almuerzo",
  };
}

export function ProfilePage() {
  const { user, users, createUser, updatePreferences, saveHealthProfile, interactions, loading } =
    useUser();  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [form, setForm] = useState({ email: "", displayName: "", diet: "omnivore" as Diet });

  const stats = useApi(() => api.aiStats(), []);
  const taste = useApi(
    () => (user ? api.taste(user.id) : Promise.resolve(null)),
    [user?.id],
    { enabled: Boolean(user) },
  );
  const sessions = useApi(
    () => (user ? api.sessions(user.id) : Promise.resolve(null)),
    [user?.id],
    { enabled: Boolean(user) },
  );
  const healthReport = useApi(
    () => (user ? api.healthReport(user.id) : Promise.resolve(null)),
    [user?.id],
    { enabled: Boolean(user) },
  );
  const { dishSlug, dishCategory } = useDishLookup();

  const savePreferences = async (patch: Partial<UserPreferences>) => {
    if (!user) return;
    setSaving(true);
    try {
      await updatePreferences(patch);
      setNotice("Preferencias guardadas. El modelo ya las está usando.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No pudimos guardar.");
    } finally {
      setSaving(false);
    }
  };

  const toggleHealth = async (health: HealthProfile) => {
    if (!user) return;
    setSaving(true);
    try {
      await saveHealthProfile({
        diabetes: health.diabetes,
        hypertension: health.hypertension,
        celiac: health.celiac,
        lactoseIntolerance: health.lactoseIntolerance,
        highCholesterol: health.highCholesterol,
        answered: true,
      });
      healthReport.reload();
      setNotice("Filtros de salud actualizados.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No pudimos guardar.");
    } finally {
      setSaving(false);
    }
  };

  const submitSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createUser({
        email: form.email,
        displayName: form.displayName,
        preferences: { diet: form.diet },
      });
      setShowSignup(false);
      setForm({ email: "", displayName: "", diet: "omnivore" });
      setNotice("¡Listo! Tu perfil ya está aprendiendo.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No pudimos crear el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <SectionHeading
        eyebrow="Mi perfil"
        title={user ? `Hola, ${user.displayName}` : "Aún no tienes perfil"}
        description="Tus preferencias y tu historial son lo que le permiten al modelo afinar las recomendaciones."
      />

      {notice ? (
        <div className="mt-6 rounded-2xl bg-blush-100 px-5 py-3 text-sm text-plum-700">{notice}</div>
      ) : null}

      {/* Signup / profile switch */}
      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="fm-card p-6">
          <h3 className="text-xl">Perfiles guardados</h3>
          <p className="mt-1 text-sm text-cocoa-500">
            Puedes tener varias cuentas y ver cómo cambia la recomendación con cada una.
          </p>

          <div className="mt-4 space-y-2">
            {users.map((candidate) => (
              <div
                key={candidate.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-colors ${
                  candidate.id === user?.id ? "bg-blush-100" : "bg-cream-100"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-plum-700">{candidate.displayName}</p>
                  <p className="text-xs text-cocoa-500">{candidate.email}</p>
                </div>
                {candidate.id === user?.id ? (
                  <span className="fm-chip">Activo</span>
                ) : null}
              </div>
            ))}
          </div>

          {showSignup ? (
            <form onSubmit={submitSignup} className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={form.displayName}
                onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                placeholder="Nombre"
                className="fm-input"
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="correo@ejemplo.com"
                className="fm-input"
              />
              <select
                value={form.diet}
                onChange={(event) => setForm({ ...form, diet: event.target.value as Diet })}
                className="fm-input cursor-pointer"
              >
                {Object.entries(DIET_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="fm-button fm-button-primary" disabled={saving}>
                  Crear perfil
                </button>
                <button
                  type="button"
                  className="fm-button fm-button-ghost"
                  onClick={() => setShowSignup(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="fm-button fm-button-ghost mt-4"
              onClick={() => setShowSignup(true)}
            >
              + Nuevo perfil
            </button>
          )}
        </div>

        <div className="fm-card p-6">
          <h3 className="text-xl">Preferencias</h3>
          <p className="mt-1 text-sm text-cocoa-500">
            Se aplican como filtros y como penalizaciones suaves en el puntaje.
          </p>

          {!user ? (
            <p className="mt-4 text-sm text-cocoa-600">
              Crea o selecciona un perfil para editar sus preferencias.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-plum-700">Dieta</span>
                <select
                  value={user.preferences.diet}
                  onChange={(event) =>
                    void savePreferences({ diet: event.target.value as Diet })
                  }
                  className="fm-input cursor-pointer"
                  disabled={saving}
                >
                  {Object.entries(DIET_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-plum-700">
                  Tiempo máximo:{" "}
                  {user.preferences.maxPrepMinutes
                    ? `${user.preferences.maxPrepMinutes} min`
                    : "sin límite"}
                </span>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={user.preferences.maxPrepMinutes ?? 0}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    void savePreferences({ maxPrepMinutes: value === 0 ? null : value });
                  }}
                  className="w-full accent-[#B08494]"
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-plum-700">
                  Picor máximo: {formatPercent(user.preferences.maxSpiceLevel)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(user.preferences.maxSpiceLevel * 100)}
                  onChange={(event) =>
                    void savePreferences({ maxSpiceLevel: Number(event.target.value) / 100 })
                  }
                  className="w-full accent-[#B08494]"
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-plum-700">Nivel de precio</span>
                <select
                  value={user.preferences.maxPriceLevel}
                  onChange={(event) =>
                    void savePreferences({ maxPriceLevel: Number(event.target.value) })
                  }
                  className="fm-input cursor-pointer"
                  disabled={saving}
                >
                  <option value={3}>Sin límite</option>
                  <option value={2}>Hasta precio medio</option>
                  <option value={1}>Solo económico</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-plum-700">
                  Meta calórica diaria: {user.preferences.dailyCalorieGoal} kcal
                </span>
                <input
                  type="range"
                  min={1200}
                  max={3200}
                  step={100}
                  value={user.preferences.dailyCalorieGoal}
                  onChange={(event) =>
                    void savePreferences({ dailyCalorieGoal: Number(event.target.value) })
                  }
                  className="w-full accent-[#B08494]"
                  disabled={saving}
                />
                <span className="mt-1 block text-xs text-cocoa-500">
                  La usamos para decirte qué conviene comer el resto del día.
                </span>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* Health profile */}
      <section className="mt-5">
        <div className="fm-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl">Salud</h3>
              <p className="mt-1 text-sm leading-relaxed text-cocoa-600">
                Estas condiciones filtran la carta: lo que no sea seguro para ti desaparece de las
                recomendaciones, y lo que es dudoso aparece con una advertencia.
              </p>
            </div>
            {user ? (
              user.preferences.health.answeredAt ? (
                <span className="fm-chip">
                  <ScaleIcon className="h-3.5 w-3.5" />
                  {activeConditions(user.preferences.health).length > 0
                    ? `${activeConditions(user.preferences.health).length} activas`
                    : "Sin condiciones"}
                </span>
              ) : (
                <span className="fm-chip">Sin responder</span>
              )
            ) : null}
          </div>

          {!user ? (
            <p className="mt-4 text-sm text-cocoa-600">
              Crea o selecciona un perfil para configurar tu salud.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((option) => {
                  const active = user.preferences.health[option.key];
                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void toggleHealth({
                          ...user.preferences.health,
                          [option.key]: !active,
                          answeredAt: new Date().toISOString(),
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "border-mauve-600 bg-mauve-600 text-cream-50"
                          : "border-sand-300 bg-cream-100 text-cocoa-600 hover:border-rose-300"
                      }`}
                      aria-pressed={active}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {healthReport.data ? (
                <div className="mt-5 grid gap-3 border-t border-sand-200 pt-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-cream-100 px-4 py-3">
                    <p className="text-xs text-cocoa-500">Platos que puedes comer</p>
                    <p className="mt-0.5 text-sm font-semibold text-plum-700">
                      {healthReport.data.availableDishes} de 40
                    </p>
                  </div>
                  <div className="rounded-2xl bg-cream-100 px-4 py-3">
                    <p className="text-xs text-cocoa-500">Meta calórica</p>
                    <p className="mt-0.5 text-sm font-semibold text-plum-700">
                      {healthReport.data.dailyCalorieGoal} kcal
                    </p>
                  </div>
                </div>
              ) : null}

              {healthReport.data && healthReport.data.blocked.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400">
                    Fuera de tu carta
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {healthReport.data.blocked.map((entry) => (
                      <li key={entry.dishId} className="text-sm text-cocoa-600">
                        <span className="font-medium text-plum-700">{entry.nameEs}</span> —{" "}
                        {entry.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {healthReport.data && healthReport.data.warned.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
                    Con advertencia
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {healthReport.data.warned.map((entry) => (
                      <li key={entry.dishId} className="text-sm text-cocoa-600">
                        <span className="font-medium text-plum-700">{entry.nameEs}</span> —{" "}
                        {entry.warnings.join("; ")}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* Taste */}
      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="fm-card p-6">
          <h3 className="text-xl">Lo que más has elegido</h3>
          {!user ? (
            <p className="mt-3 text-sm text-cocoa-600">Necesitas un perfil activo.</p>
          ) : taste.loading ? (
            <Skeleton className="mt-4 h-24" />
          ) : taste.error ? (
            <ErrorState message={taste.error} onRetry={taste.reload} />
          ) : (taste.data?.favouriteDishes.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm text-cocoa-600">
              Todavía no hay platos guardados. Dale like a alguno y aparecerán aquí.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {taste.data?.favouriteDishes.map((entry) => (
                <li key={entry.dishId}>
                  <Link
                    to={`/plato/${dishSlug(entry.dishId) ?? ""}`}
                    className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-cream-100"
                  >
                    <DishThumb
                      category={dishCategory(entry.dishId)}
                      id={entry.dishId}
                      className="h-9 w-9 shrink-0 rounded-xl"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-cocoa-700">
                      {entry.nameEs}
                    </span>
                    <span className="fm-chip">{entry.times}×</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="fm-card p-6">
          <h3 className="text-xl">Tus ánimos más frecuentes</h3>
          {!user || taste.loading ? (
            <Skeleton className="mt-4 h-24" />
          ) : (taste.data?.moodDistribution.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm text-cocoa-600">Aún sin registros.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {taste.data?.moodDistribution.map((entry) => {
                const total = taste.data?.totalInteractions || 1;
                return (
                  <li key={entry.moodKey} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-cocoa-700">
                        {entry.moodKey.replace("_", " ")}
                      </span>
                      <span className="text-xs text-cocoa-500">{entry.count}</span>
                    </div>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-sand-200">
                      <span
                        className="block h-full rounded-full bg-rose-400"
                        style={{ width: `${(entry.count / total) * 100}%` }}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="fm-card p-6">
          <h3 className="text-xl">Estado del modelo</h3>
          {stats.loading ? (
            <Skeleton className="mt-4 h-24" />
          ) : stats.data ? (
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Versión", stats.data.version],
                ["Platos en el índice", String(stats.data.dishes)],
                ["Términos del vocabulario", String(stats.data.vocabulary)],
                ["Observaciones aprendidas", String(stats.data.observations)],
                ["Usuarios en el modelo", String(stats.data.collaborativeUsers)],
                ["Último entrenamiento", stats.data.trainedAt ? formatRelativeDate(stats.data.trainedAt) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-cocoa-600">{label}</dt>
                  <dd className="font-semibold text-plum-700">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-cocoa-600">Sin datos del modelo.</p>
          )}
        </div>
      </section>

      {/* History */}
      <section className="mt-10">
        <h3 className="text-2xl">Tu historial reciente</h3>
        {loading ? (
          <Skeleton className="mt-4 h-32" />
        ) : interactions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Todavía no hay historial"
              description="Pide una recomendación y califica los platos para empezar a entrenar al modelo."
              action={
                <Link to="/recomendar" className="fm-button fm-button-primary">
                  Ir a recomendaciones
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-sand-300/70 bg-cream-50">
            <ul className="divide-y divide-sand-200">
              {interactions.slice(0, 20).map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      BADGE_STYLE[item.action] ?? "bg-cream-200 text-cocoa-500"
                    }`}
                    aria-hidden="true"
                  >
                    {ACTION_BADGE[item.action] ?? "•"}
                  </span>
                  <span className="flex-1 text-sm text-cocoa-700">
                    <span className="font-medium">#{item.dishId}</span>{" "}
                    {ACTION_LABELS[item.action] ?? item.action}
                    {item.rating ? ` · ${item.rating}/5` : ""}
                    {item.moodKey ? ` · ${item.moodKey.replace("_", " ")}` : ""}
                  </span>
                  <span className="text-xs text-cocoa-500">{formatRelativeDate(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Sessions */}
      {sessions.data && sessions.data.items.length > 0 ? (
        <section className="mt-10">
          <h3 className="text-2xl">Consultas recientes al modelo</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sessions.data.items.map((session) => (
              <span key={session.id} className="fm-chip">
                {session.mood_key.replace("_", " ")} · {formatRelativeDate(session.created_at)}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12 grid gap-4 sm:grid-cols-4">
        {[
          {
            Icon: MindIcon,
            title: "Perfil de ánimo",
            text: "Cada estado tiene un vector objetivo de sabor que se va calibrando con lo que la gente confirma.",
          },
          {
            Icon: TextIcon,
            title: "Similitud textual",
            text: "TF-IDF convierte tu nota y las descripciones en vectores comparables.",
          },
          {
            Icon: PeopleIcon,
            title: "Filtrado colaborativo",
            text: "Lo que eligieron otros usuarios con tus mismos clics.",
          },
          {
            Icon: ScaleIcon,
            title: "Filtros de salud",
            text: "Diabetes, hipertensión, celiaquía, lactosa y colesterol filtran la carta.",
          },
        ].map((item) => (
          <div key={item.title} className="fm-card p-5">
            <item.Icon className="h-6 w-6 text-rose-400" />
            <h4 className="mt-3 text-base">{item.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-cocoa-600">{item.text}</p>
          </div>
        ))}
      </div>

      {user && user.preferences.dislikedIngredients.length > 0 ? (
        <>
          <h3 className="mt-10 text-2xl">Ingredientes que excluimos</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.preferences.dislikedIngredients.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  void savePreferences({
                    dislikedIngredients: user.preferences.dislikedIngredients.filter(
                      (entry) => entry !== item,
                    ),
                  })
                }
                className="fm-chip transition-colors hover:bg-blush-200"
                title="Quitar de la lista de ingredientes que no quieres"
              >
                {item} ×
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-cocoa-500">
            Toca un ingrediente para dejar de excluirlo de tus recomendaciones.
          </p>
        </>
      ) : null}
    </div>
  );
}
