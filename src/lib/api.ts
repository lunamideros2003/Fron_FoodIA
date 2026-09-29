import type {
  AiStats,
  BalanceRequest,
  BalanceResponse,
  Dish,
  HealthCondition,
  HealthProfileInput,
  HealthReport,
  Interaction,
  Mood,
  RecommendationRequest,
  RecommendationResponse,
  SimilarDish,
  TasteSummary,
  User,
  UserPreferences,
} from "../types.ts";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

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
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      "No pudimos conectar con el servidor. Revisa que el backend esté corriendo.",
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    const body = payload as { error?: string; details?: { field: string; message: string }[] };
    throw new ApiError(
      response.status,
      body.error ?? "Algo salió mal. Inténtalo de nuevo.",
      body.details,
    );
  }

  return payload as T;
}

export const api = {
  health: () =>
    request<{ status: string; service: string; version: string; aiProvider: string }>(
      "/api/health",
    ),

  aiStats: () => request<AiStats>("/api/ai/stats"),

  retrain: () => request<{ message: string; stats: AiStats }>("/api/ai/retrain", { method: "POST" }),

  moods: () => request<{ items: Mood[] }>("/api/moods"),

  categories: () => request<{ items: { name: string; count: number }[] }>("/api/categories"),

  dishes: (params: Record<string, string | number | undefined> = {}) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const query = search.toString();
    return request<{ total: number; items: Dish[] }>(`/api/dishes${query ? `?${query}` : ""}`);
  },

  dishBySlug: (slug: string) =>
    request<{ dish: Dish; similar: SimilarDish[] }>(`/api/dishes/${slug}`),

  users: () => request<{ items: User[] }>("/api/users"),

  createUser: (body: { email: string; displayName: string; preferences?: Partial<UserPreferences> }) =>
    request<User>("/api/users", { method: "POST", body: JSON.stringify(body) }),

  updatePreferences: (userId: number, patch: Partial<UserPreferences>) =>
    request<User>(`/api/users/${userId}/preferences`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

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
    request<RecommendationResponse>("/api/recommendations", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  balance: (body: BalanceRequest) =>
    request<BalanceResponse>("/api/balance", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  healthConditions: () =>
    request<{ items: { key: HealthCondition; label: string }[]; question: string }>(
      "/api/health-conditions",
    ),

  saveHealthProfile: (userId: number, body: HealthProfileInput) =>
    request<User>(`/api/users/${userId}/health`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  healthReport: (userId: number) => request<HealthReport>(`/api/users/${userId}/health-report`),

  markConsumed: (userId: number, dishId: number, moodKey?: string | null) =>
    request<{ ok: boolean }>(`/api/users/${userId}/consumed`, {
      method: "POST",
      body: JSON.stringify({ dishId, moodKey }),
    }),

  recordInteraction: (body: {
    userId: number;
    dishId: number;
    moodKey?: string | null;
    action: string;
    rating?: number | null;
  }) => request<Interaction>("/api/interactions", { method: "POST", body: JSON.stringify(body) }),
};
