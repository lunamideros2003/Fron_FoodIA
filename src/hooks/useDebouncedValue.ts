import { useEffect, useState } from "react";

/**
 * Delays a fast-changing value (search boxes, sliders) so the API is not
 * called on every keystroke. The timeout is cleared whenever the value moves.
 */
export function useDebouncedValue<T>(value: T, delay = 320): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
