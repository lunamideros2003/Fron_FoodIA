import { useState } from "react";
import { ApiError, api } from "../lib/api.ts";
import type { AssistantTurn } from "../types.ts";
import { cn } from "../lib/cn.ts";
import { ArrowIcon, ChefIcon, SparkIcon } from "./icons.tsx";

const QUICK_QUESTIONS = [
  "¿Cómo sé que está en su punto?",
  "¿Qué puedo usar si no tengo un ingrediente?",
  "¿Puedo prepararlo con menos tiempo?",
];

interface AssistantPanelProps {
  slug: string;
  stepIndex?: number | null;
  userId?: number;
  compact?: boolean;
}

export function AssistantPanel({ slug, stepIndex, userId, compact = false }: AssistantPanelProps) {
  const [history, setHistory] = useState<AssistantTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyNotes, setSafetyNotes] = useState<string[]>([]);
  const [source, setSource] = useState<string | null>(null);

  const ask = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;

    setBusy(true);
    setError(null);
    const nextHistory: AssistantTurn[] = [...history, { role: "user", content: clean }];
    setHistory(nextHistory);
    setQuestion("");

    try {
      const answer = await api.askAssistant(slug, {
        question: clean,
        stepIndex: stepIndex ?? undefined,
        history: history.slice(-8),
        userId,
      });

      setHistory([...nextHistory, { role: "assistant", content: answer.answer }]);
      setSafetyNotes(answer.safetyNotes);
      setSource(answer.source);
    } catch (cause) {
      setHistory(nextHistory);
      setError(
        cause instanceof ApiError
          ? cause.message
          : "No pudimos responderte ahora. Inténtalo otra vez.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-surface",
        compact ? "p-4" : "p-5",
      )}
      aria-label="Asistente de cocina"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base text-ink">
            <ChefIcon className="h-4 w-4 text-clay-500" />
            Cocinar conmigo
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Te respondo con esta receta delante, así no tienes que explicarme qué cocinas.
          </p>
        </div>
        {stepIndex !== null && stepIndex !== undefined ? (
          <span className="fm-chip fm-chip-peach">Paso {stepIndex + 1}</span>
        ) : null}
      </div>

      {history.length > 0 ? (
        <div className="mt-4 space-y-3" aria-live="polite">
          {history.map((turn, index) => (
            <div
              key={index}
              className={cn(
                "max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                turn.role === "user"
                  ? "ml-auto bg-clay-500 text-cream-50"
                  : "bg-cream-100 text-ink",
              )}
            >
              {turn.content}
            </div>
          ))}
          {busy ? <p className="text-xs text-muted">Pensando con la receta delante…</p> : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void ask(prompt)}
              className="fm-chip transition-colors hover:bg-peach-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-3 rounded-lg bg-peach-100 px-3 py-2 text-xs text-clay-600">{error}</p>
      ) : null}

      {safetyNotes.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-lg bg-sage-100 px-3 py-2">
          {safetyNotes.map((note) => (
            <li key={note} className="text-[0.7rem] leading-relaxed text-ink-soft">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {source ? (
        <p className="mt-2 text-[0.65rem] text-muted">
          {source === "llm"
            ? "Respuesta generada con apoyo de un modelo de lenguaje."
            : "Respuesta construida con las reglas locales de la receta."}
        </p>
      ) : null}

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <label className="sr-only" htmlFor={`assistant-${slug}`}>
          Tu pregunta
        </label>
        <input
          id={`assistant-${slug}`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={600}
          placeholder="Escribe tu duda…"
          className="fm-input !py-2 text-sm"
        />
        <button
          type="submit"
          className="fm-button fm-button-primary !px-3 !py-2"
          disabled={busy || question.trim().length === 0}
          aria-label="Enviar pregunta"
        >
          {busy ? <SparkIcon className="h-4 w-4 animate-pulse" /> : <ArrowIcon className="h-4 w-4" />}
        </button>
      </form>
    </section>
  );
}
