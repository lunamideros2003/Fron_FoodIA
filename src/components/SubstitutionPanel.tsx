import { useEffect, useState } from "react";
import { ApiError, api } from "../lib/api.ts";
import type { SubstitutionResponse } from "../types.ts";
import { CheckCircleIcon, CloseIcon, WarningIcon } from "./icons.tsx";

interface SubstitutionPanelProps {
  slug: string;
  ingredient: string | null;
  userId?: number;
  onClose: () => void;
}

export function SubstitutionPanel({ slug, ingredient, userId, onClose }: SubstitutionPanelProps) {
  const [data, setData] = useState<SubstitutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingredient) {
      setData(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    api
      .substitute(slug, { ingredient, userId })
      .then((response) => active && setData(response))
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "No pudimos buscar sustituciones para ese ingrediente.",
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [slug, ingredient, userId]);

  if (!ingredient) return null;

  return (
    <section className="rounded-2xl border border-clay-300 bg-peach-100 p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="fm-eyebrow">Sustituciones revisadas</p>
          <h3 className="mt-1 font-display text-base text-ink">En lugar de {ingredient}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-ink-soft opacity-60 hover:opacity-100"
          aria-label="Cerrar sustituciones"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {loading ? <p className="mt-3 text-xs text-ink-soft">Buscando en las sustituciones verificadas…</p> : null}
      {error ? <p className="mt-3 text-xs text-clay-600">{error}</p> : null}

      {data ? (
        <>
          <ul className="mt-3 space-y-2">
            {data.options.map((option) => (
              <li
                key={`${option.original}-${option.replacement}`}
                className="rounded-xl border border-line bg-surface p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {option.replacement}
                    <span className="ml-2 text-xs font-normal text-muted">{option.quantity}</span>
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-sage-600"
                    aria-label={option.safe ? "Compatible con tus alergias" : "Revisa tus alergias"}
                  >
                    {option.safe ? (
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                    ) : (
                      <WarningIcon className="h-3.5 w-3.5 text-clay-600" />
                    )}
                    {option.safe ? "Compatible" : "Revisa"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{option.note}</p>
              </li>
            ))}
          </ul>
          {data.options.length === 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">{data.note}</p>
          ) : (
            <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">{data.note}</p>
          )}
        </>
      ) : null}
    </section>
  );
}
