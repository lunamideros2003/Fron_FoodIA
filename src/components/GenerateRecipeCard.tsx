import { useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api.ts";
import {
  clampRecipeIdea,
  cleanRecipeIdea,
  GENERATED_RECIPE_HINT,
  MAX_RECIPE_IDEA,
} from "../lib/generatedRecipe.ts";
import { useUser } from "../context/UserContext.tsx";
import type { Dish } from "../types.ts";
import { ArrowIcon, ChefIcon, SparkIcon } from "./icons.tsx";

interface GenerateRecipeCardProps {
  onCreated: (dish: Dish) => void;
}

/**
 * Asks the backend for a new recipe and adds it to the catalogue.
 * The idea is optional: with no text, the model chooses a varied recipe.
 */
export function GenerateRecipeCard({ onCreated }: GenerateRecipeCardProps) {
  const { user } = useUser();
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    try {
      const result = await api.generateRecipe({
        idea: cleanRecipeIdea(idea),
        userId: user?.id,
      });
      setIdea("");
      onCreated(result.dish);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "No pudimos crear la receta. Inténtalo otra vez.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-clay-200 bg-peach-100/60">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-clay-600">
            <SparkIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg text-ink">Crea una receta nueva con IA</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
              Pide una idea y Chef la escribirá, la revisará y la guardará como una receta más.{" "}
              {GENERATED_RECIPE_HINT}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:max-w-sm">
          <label className="sr-only" htmlFor="recipe-idea">
            Idea para la receta
          </label>
          <textarea
            id="recipe-idea"
            rows={2}
            value={idea}
            maxLength={MAX_RECIPE_IDEA}
            onChange={(event) => setIdea(clampRecipeIdea(event.target.value))}
            placeholder="Ej. cena rápida con calabaza, sin gluten…"
            className="fm-input resize-none !py-2 text-xs"
            disabled={busy}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.62rem] text-muted">
              {idea.length}/{MAX_RECIPE_IDEA}
            </span>
            <button
              type="submit"
              disabled={busy}
              className="fm-button fm-button-primary !py-2 text-xs"
            >
              {busy ? (
                <>
                  <ChefIcon className="h-4 w-4" />
                  Creando…
                </>
              ) : (
                <>
                  Crear receta
                  <ArrowIcon className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error ? (
        <p role="alert" className="border-t border-clay-200 px-4 py-2.5 text-xs text-clay-600">
          {error}
        </p>
      ) : null}
    </section>
  );
}
