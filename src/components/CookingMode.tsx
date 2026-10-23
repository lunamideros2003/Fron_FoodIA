import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn.ts";
import type { SafetyNote } from "../types.ts";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, WarningIcon } from "./icons.tsx";

interface CookingModeProps {
  title: string;
  steps: string[];
  safetyNotes: SafetyNote[];
  onClose: () => void;
  onFinish: () => void;
}

export function CookingMode({ title, steps, safetyNotes, onClose, onFinish }: CookingModeProps) {
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const totalRef = useRef(steps.length);
  const total = steps.length;
  const step = steps[index] ?? "";
  const notes = safetyNotes.filter((note) => note.stepIndex === index);
  const isLast = index === total - 1;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "ArrowRight") {
        setIndex((value) => Math.min(totalRef.current - 1, value + 1));
      }
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, []);

  if (total === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cooking-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-soft sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="fm-eyebrow">Modo cocina</p>
            <h2 id="cooking-title" className="mt-1 truncate font-display text-xl text-ink">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="fm-icon-button shrink-0"
            aria-label="Salir del modo cocina"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="h-1.5 bg-cream-100">
          <span
            className="block h-full bg-clay-500 transition-[width]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-clay-600">
              Paso {index + 1} de {total}
            </p>
            <div className="flex gap-1" aria-hidden="true">
              {steps.map((_, dot) => (
                <span
                  key={dot}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    dot === index ? "w-5 bg-clay-500" : "w-1.5 bg-cream-200",
                  )}
                />
              ))}
            </div>
          </div>

          <p
            className="mt-4 font-display text-xl leading-relaxed text-ink sm:text-2xl"
            aria-live="polite"
          >
            {step}
          </p>

          {notes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex gap-2 rounded-xl bg-peach-100 px-3 py-2.5 text-xs leading-relaxed text-ink-soft"
                >
                  <WarningIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-600" />
                  {note.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            className="fm-button fm-button-ghost !py-2 text-xs"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            Anterior
          </button>

          <span className="text-[0.68rem] text-muted">
            Usa las flechas del teclado o los botones
          </span>

          <button
            type="button"
            onClick={() => {
              if (isLast) {
                onFinish();
                return;
              }
              setIndex((value) => Math.min(total - 1, value + 1));
            }}
            className="fm-button fm-button-primary !py-2 text-xs"
          >
            {isLast ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                Terminar
              </>
            ) : (
              <>
                Siguiente
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
