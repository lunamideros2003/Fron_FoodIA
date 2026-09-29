import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Small data-fetching hook. `deps` behaves like a useEffect dependency list,
 * and every response is checked against a request id so a slow response can
 * never overwrite a newer one.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {},
): AsyncState<T> & { reload: () => void } {
  const { enabled = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });
  const [nonce, setNonce] = useState(0);
  const latestRequest = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    latestRequest.current += 1;
    const requestId = latestRequest.current;

    setState((current) => ({ ...current, loading: true, error: null }));

    loaderRef
      .current()
      .then((data) => {
        if (latestRequest.current !== requestId) return;
        setState({ data, loading: false, error: null });
      })
      .catch((cause: unknown) => {
        if (latestRequest.current !== requestId) return;
        setState({
          data: null,
          loading: false,
          error: cause instanceof Error ? cause.message : "Ocurrió un error inesperado.",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { ...state, reload };
}
