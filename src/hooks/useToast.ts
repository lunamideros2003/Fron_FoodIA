import { useCallback, useEffect, useRef, useState } from "react";

export type ToastTone = "success" | "info" | "error";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

/**
 * A single transient message, used for confirmations that do not deserve a
 * modal. Every new toast replaces the previous one and the timer resets.
 */
export function useToast(duration = 3200) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<number | null>(null);
  const counter = useRef(0);

  const clear = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const show = useCallback(
    (text: string, tone: ToastTone = "info") => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      counter.current += 1;
      setToast({ id: counter.current, text, tone });
      timer.current = window.setTimeout(() => {
        setToast(null);
        timer.current = null;
      }, duration);
    },
    [duration],
  );

  useEffect(() => clear, [clear]);

  return { toast, show, clear };
}
