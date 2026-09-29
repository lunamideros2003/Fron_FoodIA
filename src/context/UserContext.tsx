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
  HealthProfileInput,
  Interaction,
  User,
  UserPreferences,
} from "../types.ts";

const STORAGE_KEY = "foodmood.userId";

interface UserContextValue {
  user: User | null;
  users: User[];
  interactions: Interaction[];
  loading: boolean;
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
  ratedDishIds: Set<number>;
}

const UserContext = createContext<UserContextValue | null>(null);

function readStoredUserId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(true);

  const loadInteractions = useCallback(async (userId: number) => {
    const result = await api.interactions(userId, 60);
    setInteractions(result.items);
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
        await loadInteractions(selected.id);
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
    } finally {
      setLoading(false);
    }
  }, [loadInteractions]);

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
      }
    },
    [users, loadInteractions],
  );

  const createUser = useCallback<UserContextValue["createUser"]>(
    async (input) => {
      const created = await api.createUser(input);
      setUsers((current) => [...current, created]);
      setUser(created);
      localStorage.setItem(STORAGE_KEY, String(created.id));
      setInteractions([]);
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

  const ratedDishIds = useMemo(
    () => new Set(interactions.filter((item) => item.action === "rate").map((item) => item.dishId)),
    [interactions],
  );

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      users,
      interactions,
      loading,
      error,
      apiOnline,
      selectUser,
      createUser,
      updatePreferences,
      saveHealthProfile,
      recordInteraction,
      ratedDishIds,
    }),
    [
      user,
      users,
      interactions,
      loading,
      error,
      apiOnline,
      selectUser,
      createUser,
      updatePreferences,
      saveHealthProfile,
      recordInteraction,
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
