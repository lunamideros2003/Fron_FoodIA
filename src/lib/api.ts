import type {
  AdaptationRequest,
  AuthSessionResponse,
  RegisterInput,
  AdaptationResponse,
  AiStats,
  AssistantAnswer,
  AssistantTurn,
  BalanceRequest,
  BalanceResponse,
  CatalogFacets,
  Dish,
  DishListResponse,
  DishQuery,
  FavoriteToggleResponse,
  FavoriteWithDish,
  HealthCondition,
  HealthProfileInput,
  HealthReport,
  HistoryResponse,
  IngredientDiscoveryResponse,
  Interaction,
  MealPlanResponse,
  Mood,
  MoodDishesResponse,
  MoodKey,
  OverviewResponse,
  QuestionnairePayload,
  QuestionnaireVocabulary,
  RecipeAllergens,
  RecipeEntry,
  RecipeEntryStatus,
  RecipeSafety,
  RecommendationRequest,
  RecommendationResponse,
  SavedPreferenceCatalog,
  SimilarDish,
  SubstitutionResponse,
  TasteSummary,
  User,
  UserPreferences,
} from "../types.ts";
import { readAuthToken } from "./authSession.ts";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/**
 * Turns a record into a query string, dropping empty values so filters never
 * reach the backend as `"undefined"` or an empty string.
 */
export function queryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const token = readAuthToken();
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new ApiError(
      0,
      "No pudimos conectar con el servidor. Revisa que el backend esté corriendo.",
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = {};
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const body = payload as {
      error?: string;
      details?: { field: string; message: string }[];
    };
    throw new ApiError(
      response.status,
      body.error ?? "Algo salió mal. Inténtalo de nuevo.",
      body.details,
    );
  }

  return payload as T;
}

const json = (method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  health: () =>
    request<{
      status: string;
      service: string;
      version: string;
      aiProvider: string;
      catalogue: { dishes: number; moods: number };
      uptimeSeconds: number;
      timestamp: string;
    }>("/api/health"),

  aiStats: () => request<AiStats>("/api/ai/stats"),

  retrain: () =>
    request<{ message: string; stats: AiStats }>("/api/ai/retrain", { method: "POST" }),

  moods: () => request<{ items: Mood[] }>("/api/moods"),

  categories: () => request<{ items: { name: string; count: number }[] }>("/api/categories"),

  facets: () => request<CatalogFacets>("/api/catalog/facets"),

  dishes: (params: DishQuery = {}) =>
    request<DishListResponse>(`/api/dishes${queryString({ ...params })}`),

  randomDish: (params: DishQuery = {}) =>
    request<{ dish: Dish; total: number }>(`/api/dishes/random${queryString({ ...params })}`),

  moodDishes: (moodKey: MoodKey, limit = 4) =>
    request<MoodDishesResponse>(`/api/moods/${moodKey}/dishes${queryString({ limit })}`),

  dishBySlug: (slug: string) =>
    request<{
      dish: Dish;
      similar: SimilarDish[];
      allergens: { key: string; label: string }[];
      safetyNotes: { id: string; text: string; stepIndex?: number }[];
      generalSafetyNote: { id: string; text: string };
      substitutions: {
        original: string;
        replacement: string;
        quantity: string;
        note: string;
      }[];
    }>(`/api/dishes/${encodeURIComponent(slug)}`),

  users: () => request<{ items: User[] }>("/api/users"),

  createUser: (body: {
    email: string;
    displayName: string;
    preferences?: Partial<UserPreferences>;
  }) => request<User>("/api/users", json("POST", body)),

  register: (body: RegisterInput) =>
    request<AuthSessionResponse>("/api/auth/register", json("POST", body)),

  login: (body: { email: string; password: string }) =>
    request<AuthSessionResponse>("/api/auth/login", json("POST", body)),

  logout: () => request<{ ok: boolean; destroyed: boolean }>("/api/auth/logout", json("POST")),

  session: () => request<{ user?: User | null }>("/api/auth/session"),

  updatePreferences: (userId: number, patch: Partial<UserPreferences>) =>
    request<User>(`/api/users/${userId}/preferences`, json("PATCH", patch)),

  interactions: (userId: number, limit = 30) =>
    request<{ items: Interaction[] }>(`/api/users/${userId}/interactions?limit=${limit}`),

  taste: (userId: number) => request<TasteSummary>(`/api/users/${userId}/taste`),

  sessions: (userId: number) =>
    request<{
      items: {
        id: number;
        mood_key: string;
        model_version: string;
        strategy: string;
        created_at: string;
      }[];
    }>(`/api/users/${userId}/sessions`),

  recommend: (body: RecommendationRequest) =>
    request<RecommendationResponse>("/api/recommendations", json("POST", body)),

  questionnaire: () => request<QuestionnaireVocabulary>("/api/questionnaire"),

  recommendFromQuestionnaire: (body: QuestionnairePayload) =>
    request<RecommendationResponse>("/api/questionnaire/recommend", json("POST", body)),

  discoverByIngredients: (body: {
    ingredients: string[];
    limit?: number;
    maxPrepMinutes?: number | null;
    onlyComplete?: boolean;
    craving?: string;
    userId?: number;
  }) => request<IngredientDiscoveryResponse>("/api/discover/by-ingredients", json("POST", body)),

  planMeals: (body: {
    days: number;
    moodKey?: MoodKey;
    craving?: string;
    availableIngredients?: string[];
    maxPrepMinutes?: number | null;
    userId?: number;
  }) => request<MealPlanResponse>("/api/planning/meals", json("POST", body)),

  balance: (body: BalanceRequest) =>
    request<BalanceResponse>("/api/balance", json("POST", body)),

  healthConditions: () =>
    request<{ items: { key: HealthCondition; label: string }[]; question: string }>(
      "/api/health-conditions",
    ),

  saveHealthProfile: (userId: number, body: HealthProfileInput) =>
    request<User>(`/api/users/${userId}/health`, json("PUT", body)),

  healthReport: (userId: number) => request<HealthReport>(`/api/users/${userId}/health-report`),

  overview: (userId: number) => request<OverviewResponse>(`/api/users/${userId}/overview`),

  markConsumed: (
    userId: number,
    dishId: number,
    moodKey?: string | null,
    servings?: number,
  ) =>
    request<{ ok: boolean }>(
      `/api/users/${userId}/consumed`,
      json("POST", { dishId, moodKey, servings }),
    ),

  recordInteraction: (body: {
    userId: number;
    dishId: number;
    moodKey?: string | null;
    action: string;
    rating?: number | null;
  }) => request<Interaction>("/api/interactions", json("POST", body)),

  /* ---------------------------------------------------------------- *
   * Favourites
   * ---------------------------------------------------------------- */

  favorites: (userId: number) =>
    request<{ items: FavoriteWithDish[] }>(`/api/users/${userId}/favorites`),

  toggleFavorite: (userId: number, dishId: number) =>
    request<FavoriteToggleResponse>(`/api/users/${userId}/favorites/toggle`, json("POST", { dishId })),

  removeFavorite: (userId: number, dishId: number) =>
    request<{ saved: boolean; removed: boolean; ids: number[] }>(
      `/api/users/${userId}/favorites/${dishId}`,
      json("DELETE"),
    ),

  clearFavorites: (userId: number) =>
    request<{ removed: number; ids: number[] }>(`/api/users/${userId}/favorites`, json("DELETE")),

  /* ---------------------------------------------------------------- *
   * History
   * ---------------------------------------------------------------- */

  history: (
    userId: number,
    params: { status?: RecipeEntryStatus; limit?: number; offset?: number } = {},
  ) => request<HistoryResponse>(`/api/users/${userId}/history${queryString({ ...params })}`),

  addHistory: (
    userId: number,
    body: {
      dishId: number;
      status: RecipeEntryStatus;
      rating?: number | null;
      note?: string | null;
      feelingNote?: string | null;
    },
  ) => request<RecipeEntry>(`/api/users/${userId}/history`, json("POST", body)),

  updateHistory: (
    userId: number,
    dishId: number,
    patch: {
      status?: RecipeEntryStatus;
      rating?: number | null;
      note?: string | null;
      feelingNote?: string | null;
    },
  ) => request<RecipeEntry>(`/api/users/${userId}/history/${dishId}`, json("PATCH", patch)),

  removeHistory: (userId: number, dishId: number) =>
    request<{ ok: boolean; removed: boolean }>(
      `/api/users/${userId}/history/${dishId}`,
      json("DELETE"),
    ),

  clearHistory: (userId: number) =>
    request<{ ok: boolean; removed: number }>(`/api/users/${userId}/history`, json("DELETE")),

  /* ---------------------------------------------------------------- *
   * Saved preferences
   * ---------------------------------------------------------------- */

  savedPreferences: (userId: number) =>
    request<SavedPreferenceCatalog>(`/api/users/${userId}/saved-preferences`),

  savePreferences: (userId: number, items: { key: string; value: string }[]) =>
    request<SavedPreferenceCatalog & { saved: number; rejected: number }>(
      `/api/users/${userId}/saved-preferences`,
      json("PUT", { items }),
    ),

  removeSavedPreference: (userId: number, key: string) =>
    request<{ ok: boolean; removed: boolean; items: SavedPreferenceCatalog["items"] }>(
      `/api/users/${userId}/saved-preferences/${encodeURIComponent(key)}`,
      json("DELETE"),
    ),

  clearSavedPreferences: (userId: number) =>
    request<{ ok: boolean; removed: number; items: SavedPreferenceCatalog["items"] }>(
      `/api/users/${userId}/saved-preferences`,
      json("DELETE"),
    ),

  /* ---------------------------------------------------------------- *
   * Recipe assistant and safety
   * ---------------------------------------------------------------- */

  recipeAllergens: (slug: string) =>
    request<RecipeAllergens>(`/api/recipes/${encodeURIComponent(slug)}/allergens`),

  recipeSafety: (slug: string) =>
    request<RecipeSafety>(`/api/recipes/${encodeURIComponent(slug)}/safety`),

  askAssistant: (
    slug: string,
    body: {
      question: string;
      stepIndex?: number;
      history?: AssistantTurn[];
      ingredient?: string;
      servings?: number;
      userId?: number;
    },
  ) => request<AssistantAnswer>(`/api/recipes/${encodeURIComponent(slug)}/assistant`, json("POST", body)),

  substitute: (slug: string, body: { ingredient: string; userId?: number }) =>
    request<SubstitutionResponse>(
      `/api/recipes/${encodeURIComponent(slug)}/substitute`,
      json("POST", body),
    ),

  adapt: (slug: string, body: AdaptationRequest) =>
    request<AdaptationResponse>(`/api/recipes/${encodeURIComponent(slug)}/adapt`, json("POST", body)),
};
