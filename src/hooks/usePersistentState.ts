import { useEffect, useState } from "react";

export function usePersistentState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      return typeof fallback === "function" ? (fallback as () => T)() : fallback;
    }

    return typeof fallback === "function" ? (fallback as () => T)() : fallback;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue] as const;
}
