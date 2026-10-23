import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api.ts";
import type {
  FavoriteWithDish,
  HealthProfileInput,
  HistoryResponse,
  Interaction,
  OverviewResponse,
  RecipeEntryStatus,
  RecipeEntryWithDish,
  User,
  UserPreferences,
} from "../types.ts";

const STORAGE_KEY = "foodmood.userId";

interface HistoryPatch {
  status?: RecipeEntryStatus;
  rating?: number | null;
  note?: string | null;
  feelingNote?: string | null;
}

interface UserContextValue {
  user: User | null;
  users: User[];
  interactions: Interaction[];
  favorites: FavoriteWithDish[];
  favoriteIds: Set<number>;
  history: RecipeEntryWithDish[];
  overview: OverviewResponse | null;
  loading: boolean;
  savedLoading: boolean;
  error: string | null;
  apiOnline: boolean;
  selectUser: (id: number) => void;
  createUser: (input: {
    email: string;
    displayName: string;
    preferences?: Partial<UserPreferences>;
  }) => Promise<User>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
  saveHealthProfile: (input: HealthProfileInput) => Promise<void>;
  recordInteraction: (input: {
    dishId: number;
    action: string;
    moodKey?: string | null;
    rating?: number | null;
  }) => Promise<void>;
  toggleFavorite: (dishId: number) => Promise<boolean>;
  isFavorite: (dishId: number) => boolean;
  clearFavorites: () => Promise<void>;
  refreshSaved: () => Promise<void>;
  addHistoryEntry: (dishId: number, status: RecipeEntryStatus) => Promise<void>;
  updateHistoryEntry: (dishId: number, patch: HistoryPatch) => Promise<void>;
  removeHistoryEntry: (dishId: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  ratedDishIds: Set<number>;
}

const UserContext = createContext<UserContextValue | null>(null);

function readStoredUserId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** The saved data is nice to have: a failure must never hide the catalogue. */
async function loadSavedData(userId: number): Promise<{
  favorites: FavoriteWithDish[];
  history: HistoryResponse | null;
  overview: OverviewResponse | null;
}> {
  const [favorites, history, overview] = await Promise.allSettled([
    api.favorites(userId),
    api.history(userId, { limit: 50 }),
    api.overview(userId),
  ]);

  return {
    favorites: favorites.status === "fulfilled" ? favorites.value.items : [],
    history: history.status === "fulfilled" ? history.value : null,
    overview: overview.status === "fulfilled" ? overview.value : null,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWithDish[]>([]);
  const [history, setHistory] = useState<RecipeEntryWithDish[]>([]);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(true);

  const loadInteractions = useCallback(async (userId: number) => {
    const result = await api.interactions(userId, 60);
    setInteractions(result.items);
  }, []);

  const hydrateSaved = useCallback(async (userId: number) => {
    setSavedLoading(true);
    try {
      const saved = await loadSavedData(userId);
      setFavorites(saved.favorites);
      setHistory(saved.history?.items ?? []);
      setOverview(saved.overview);
    } finally {
      setSavedLoading(false);
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await api.users();
      setUsers(items);
      setApiOnline(true);

      const stored = readStoredUserId();
      const selected =
        items.find((candidate) => candidate.id === stored) ??
        items.find((candidate) => candidate.email === "lucia@foodmood.app") ??
        items[0] ??
        null;

      setUser(selected);
      if (selected) {
        localStorage.setItem(STORAGE_KEY, String(selected.id));
        await Promise.all([loadInteractions(selected.id), hydrateSaved(selected.id)]);
      }
      setError(null);
    } catch (cause) {
      setApiOnline(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos cargar tu perfil. Revisa que el backend esté corriendo.",
      );
      setUser(null);
      setUsers([]);
      setInteractions([]);
      setFavorites([]);
      setHistory([]);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [loadInteractions, hydrateSaved]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const selectUser = useCallback(
    (id: number) => {
      const next = users.find((candidate) => candidate.id === id) ?? null;
      setUser(next);
      if (next) {
        localStorage.setItem(STORAGE_KEY, String(next.id));
        void loadInteractions(next.id);
        void hydrateSaved(next.id);
      }
    },
    [users, loadInteractions, hydrateSaved],
  );

  const createUser = useCallback<UserContextValue["createUser"]>(
    async (input) => {
      const created = await api.createUser(input);
      setUsers((current) => [...current, created]);
      setUser(created);
      localStorage.setItem(STORAGE_KEY, String(created.id));
      setInteractions([]);
      setFavorites([]);
      setHistory([]);
      setOverview(null);
      return created;
    },
    [],
  );

  const updatePreferences = useCallback<UserContextValue["updatePreferences"]>(
    async (patch) => {
      if (!user) return;
      const updated = await api.updatePreferences(user.id, patch);
      setUser(updated);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    },
    [user],
  );

  const saveHealthProfile = useCallback<UserContextValue["saveHealthProfile"]>(
    async (input) => {
      if (!user) return;
      const updated = await api.saveHealthProfile(user.id, input);
      setUser(updated);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    },
    [user],
  );

  const recordInteraction = useCallback<UserContextValue["recordInteraction"]>(
    async (input) => {
      if (!user) return;
      const created = await api.recordInteraction({ userId: user.id, ...input });
      setInteractions((current) => [created, ...current].slice(0, 60));
    },
    [user],
  );

  const refreshSaved = useCallback(async () => {
    if (!user) return;
    await hydrateSaved(user.id);
  }, [user, hydrateSaved]);

  const toggleFavorite = useCallback<UserContextValue["toggleFavorite"]>(
    async (dishId) => {
      if (!user) throw new Error("Crea un perfil para guardar favoritos.");
      const result = await api.toggleFavorite(user.id, dishId);
      await hydrateSaved(user.id);
      return result.saved;
    },
    [user, hydrateSaved],
  );

  const clearFavorites = useCallback(async () => {
    if (!user) return;
    await api.clearFavorites(user.id);
    await hydrateSaved(user.id);
  }, [user, hydrateSaved]);

  const addHistoryEntry = useCallback<UserContextValue["addHistoryEntry"]>(
    async (dishId, status) => {
      if (!user) return;
      await api.addHistory(user.id, { dishId, status });
      await hydrateSaved(user.id);
    },
    [user, hydrateSaved],
  );

  const updateHistoryEntry = useCallback<UserContextValue["updateHistoryEntry"]>(
    async (dishId, patch) => {
      if (!user) return;
      await api.updateHistory(user.id, dishId, patch);
      await hydrateSaved(user.id);
    },
    [user, hydrateSaved],
  );

  const removeHistoryEntry = useCallback<UserContextValue["removeHistoryEntry"]>(
    async (dishId) => {
      if (!user) return;
      await api.removeHistory(user.id, dishId);
      await hydrateSaved(user.id);
    },
    [user, hydrateSaved],
  );

  const clearHistory = useCallback(async () => {
    if (!user) return;
    await api.clearHistory(user.id);
    await hydrateSaved(user.id);
  }, [user, hydrateSaved]);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.dishId)), [favorites]);

  const isFavorite = useCallback((dishId: number) => favoriteIds.has(dishId), [favoriteIds]);

  const ratedDishIds = useMemo(
    () => new Set(interactions.filter((item) => item.action === "rate").map((item) => item.dishId)),
    [interactions],
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      users,
      interactions,
      favorites,
      favoriteIds,
      history,
      overview,
      loading,
      savedLoading,
      error,
      apiOnline,
      selectUser,
      createUser,
      updatePreferences,
      saveHealthProfile,
      recordInteraction,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      refreshSaved,
      addHistoryEntry,
      updateHistoryEntry,
      removeHistoryEntry,
      clearHistory,
      ratedDishIds,
    }),
    [
      user,
      users,
      interactions,
      favorites,
      favoriteIds,
      history,
      overview,
      loading,
      savedLoading,
      error,
      apiOnline,
      selectUser,
      createUser,
      updatePreferences,
      saveHealthProfile,
      recordInteraction,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      refreshSaved,
      addHistoryEntry,
      updateHistoryEntry,
      removeHistoryEntry,
      clearHistory,
      ratedDishIds,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return context;
}

