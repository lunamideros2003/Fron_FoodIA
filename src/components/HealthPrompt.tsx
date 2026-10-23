import { useState } from "react";
import { WarningIcon } from "./icons.tsx";
import type { HealthProfileInput } from "../types.ts";

const QUESTIONS: { key: keyof Omit<HealthProfileInput, "answered">; label: string }[] = [
  { key: "diabetes", label: "Diabetes" },
  { key: "hypertension", label: "Hipertensión" },
  { key: "celiac", label: "Celiaquía" },
  { key: "lactoseIntolerance", label: "Intolerancia a la lactosa" },
  { key: "highCholesterol", label: "Colesterol alto" },
];

interface HealthPromptProps {
  question?: string | null;
  saving?: boolean;
  onSave: (profile: HealthProfileInput) => Promise<void>;
  onDismiss: () => void;
}

export function HealthPrompt({ question, saving = false, onSave, onDismiss }: HealthPromptProps) {
  const [profile, setProfile] = useState<HealthProfileInput>({
    diabetes: false,
    hypertension: false,
    celiac: false,
    lactoseIntolerance: false,
    highCholesterol: false,
    answered: true,
  });

  const toggle = (key: keyof Omit<HealthProfileInput, "answered">) => {
    setProfile((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <section
      className="rounded-2xl border border-clay-300 bg-peach-100 p-5"
      aria-labelledby="health-prompt-title"
    >
      <div className="flex items-start gap-2">
        <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-clay-600" />
        <div>
          <h2 id="health-prompt-title" className="font-display text-base text-ink">
            Una pregunta rápida antes de que elijas
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-soft">
            {question ??
              "Estas opciones son ricas en azúcar, sodio o grasa. Si tienes alguna de estas condiciones, prefiero avisarte y ajustar la propuesta."}
          </p>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          ¿Alguna de estas aplica para ti?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUESTIONS.map((item) => (
            <label
              key={item.key}
              className={
                profile[item.key]
                  ? "cursor-pointer rounded-full border border-clay-500 bg-clay-500 px-3 py-1.5 text-[0.7rem] font-semibold text-cream-50"
                  : "cursor-pointer rounded-full border border-line bg-surface px-3 py-1.5 text-[0.7rem] font-semibold text-ink-soft hover:border-clay-300"
              }
            >
              <input
                type="checkbox"
                checked={profile[item.key]}
                onChange={() => toggle(item.key)}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-3 text-[0.65rem] leading-relaxed text-muted">
        Se guarda en tu perfil y lo aplicamos en todas las búsquedas. No es un diagnóstico ni
        sustituye una consulta médica.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void onSave(profile)}
          disabled={saving}
          className="fm-button fm-button-primary !py-1.5 text-xs"
        >
          {saving ? "Guardando…" : "Guardar y ajustar recetas"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={saving}
          className="fm-button fm-button-ghost !py-1.5 text-xs"
        >
          Prefiero no decirlo ahora
        </button>
      </div>
    </section>
  );
}
