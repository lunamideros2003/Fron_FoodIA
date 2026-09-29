import { useState } from "react";
import { CheckIcon } from "./icons.tsx";
import type { HealthProfileInput } from "../types.ts";

interface HealthQuestionnaireProps {
  question: string;
  initial?: Partial<HealthProfileInput>;
  saving?: boolean;
  /** Called with the answers, or with `null` when the user declines to answer. */
  onSubmit: (value: HealthProfileInput | null) => void;
  onDismiss?: () => void;
  compact?: boolean;
}

type ConditionKey = Exclude<keyof HealthProfileInput, "answered">;

const CONDITION_OPTIONS: { key: ConditionKey; label: string; hint: string }[] = [
  {
    key: "diabetes",
    label: "Diabetes",
    hint: "Ocultamos lo que tenga demasiado azúcar o poca fibra.",
  },
  {
    key: "hypertension",
    label: "Hipertensión",
    hint: "Preferimos opciones con menos sodio.",
  },
  {
    key: "celiac",
    label: "Celiaquía",
    hint: "Fuera todo lo que tenga gluten.",
  },
  {
    key: "lactoseIntolerance",
    label: "Intolerancia a la lactosa",
    hint: "Sin leche, queso ni mantequilla.",
  },
  {
    key: "highCholesterol",
    label: "Colesterol alto",
    hint: "Bajamos la grasa y favorecemos la fibra.",
  },
];

const EMPTY: HealthProfileInput = {
  diabetes: false,
  hypertension: false,
  celiac: false,
  lactoseIntolerance: false,
  highCholesterol: false,
  answered: true,
};

export function HealthQuestionnaire({
  question,
  initial,
  saving = false,
  onSubmit,
  onDismiss,
  compact = false,
}: HealthQuestionnaireProps) {
  const [answers, setAnswers] = useState<HealthProfileInput>({ ...EMPTY, ...initial });

  const toggle = (key: ConditionKey) => {
    setAnswers((current) => ({ ...current, [key]: !current[key] }));
  };

  const hasAny = CONDITION_OPTIONS.some((option) => answers[option.key]);

  return (
    <div className="fm-card overflow-hidden">
      <div
        className="px-6 py-5"
        style={{ background: "linear-gradient(120deg, #F6D3D655, #E0C08D44)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mauve-600">
          Antes de seguir
        </p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-cocoa-700">{question}</p>
      </div>

      <div className="space-y-2 px-6 py-5">
        {CONDITION_OPTIONS.map((option) => {
          const checked = answers[option.key];
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => toggle(option.key)}
              aria-pressed={checked}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                checked
                  ? "border-rose-400 bg-blush-100"
                  : "border-sand-300 bg-cream-100 hover:border-rose-300"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  checked ? "border-mauve-600 bg-mauve-600 text-cream-50" : "border-sand-300"
                }`}
                aria-hidden="true"
              >
                {checked ? <CheckIcon className="h-3.5 w-3.5" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-plum-700">{option.label}</span>
                {!compact ? (
                  <span className="mt-0.5 block text-xs leading-snug text-cocoa-600">
                    {option.hint}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            className="fm-button fm-button-primary"
            disabled={saving}
            onClick={() => onSubmit(answers)}
          >
            {saving ? "Guardando…" : hasAny ? "Aplicar mis condiciones" : "Continuar sin condiciones"}
          </button>

          <button
            type="button"
            className="fm-button fm-button-ghost"
            disabled={saving}
            onClick={() => onSubmit({ ...EMPTY, answered: false })}
          >
            Prefiero no decir
          </button>

          {onDismiss ? (
            <button
              type="button"
              className="text-xs font-medium text-cocoa-500 underline-offset-4 hover:underline"
              onClick={onDismiss}
            >
              Ahora no
            </button>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-cocoa-500">
          Solo lo usamos para filtrar la carta. No se comparte con nadie y puedes borrarlo cuando
          quieras desde tu perfil.
        </p>
      </div>
    </div>
  );
}
