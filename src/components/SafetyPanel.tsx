import type { SafetyNote } from "../types.ts";
import { CheckCircleIcon, InfoIcon, WarningIcon } from "./icons.tsx";

interface SafetyPanelProps {
  notes: SafetyNote[];
  general?: string;
  title?: string;
}

/**
 * Kitchen safety, not medical advice. Every note comes from the backend rules
 * and, when it belongs to a step, it says which one.
 */
export function SafetyPanel({ notes, general, title = "Antes de cocinar" }: SafetyPanelProps) {
  return (
    <section className="rounded-2xl border border-sage-200 bg-sage-100/70 p-5" aria-label={title}>
      <h3 className="flex items-center gap-2 font-display text-base text-ink">
        <CheckCircleIcon className="h-4 w-4 text-sage-600" />
        {title}
      </h3>

      {notes.length > 0 ? (
        <ul className="mt-3 space-y-2.5">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-2.5 text-xs leading-relaxed text-ink-soft">
              <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-600" />
              <span>
                {typeof note.stepIndex === "number" ? (
                  <span className="mr-1 font-semibold text-ink">Paso {note.stepIndex + 1}:</span>
                ) : null}
                {note.text}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          No hay advertencias específicas para esta receta. Cocina con las manos limpias y respeta
          los tiempos de cocción.
        </p>
      )}

      {general ? (
        <p className="mt-3 flex gap-2 border-t border-sage-200 pt-3 text-[0.7rem] leading-relaxed text-muted">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {general}
        </p>
      ) : null}
    </section>
  );
}
