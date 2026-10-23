import { useEffect } from "react";

/** Keeps the browser tab title in sync with the current screen. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · FoodMood IA`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
