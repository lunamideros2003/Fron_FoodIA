import { useCallback } from "react";
import { useAsync } from "./useAsync.ts";

interface UseApiOptions {
  enabled?: boolean;
}

/** Wraps a promise-returning API call in loading / error / reload state. */
export function useApi<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
  options: UseApiOptions = {},
) {
  const stableLoader = useCallback(loader, deps);
  return useAsync(stableLoader, deps, options);
}
