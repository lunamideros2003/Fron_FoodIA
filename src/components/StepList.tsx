import type { SafetyNote } from "../types.ts";
import { cn } from "../lib/cn.ts";
import { ChefIcon, WarningIcon } from "./icons.tsx";

interface StepListProps {
  steps: string[];
  safetyNotes?: SafetyNote[];
  activeStep?: number | null;
  onAsk?: (index: number) => void;
}

export function StepList({ steps, safetyNotes = [], activeStep = null, onAsk }: StepListProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const notes = safetyNotes.filter((note) => note.stepIndex === index);
        const active = activeStep === index;

        return (
          <li
            key={index}
            className={cn(
              "rounded-xl border p-3.5 transition-colors",
              active ? "border-clay-300 bg-peach-100" : "border-transparent",
            )}
          >
            <div className="flex gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-clay-500 text-cream-50" : "bg-cream-100 text-ink-soft",
                )}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-ink">{step}</p>

                {notes.map((note) => (
                  <p
                    key={note.id}
                    className="mt-2 flex gap-1.5 rounded-lg bg-surface/70 px-2.5 py-1.5 text-[0.7rem] leading-relaxed text-clay-600"
                  >
                    <WarningIcon className="mt-0.5 h-3 w-3 shrink-0" />
                    {note.text}
                  </p>
                ))}

                {onAsk ? (
                  <button
                    type="button"
                    onClick={() => onAsk(index)}
                    className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-semibold text-clay-600 hover:underline"
                  >
                    <ChefIcon className="h-3 w-3" />
                    Preguntar sobre este paso
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
