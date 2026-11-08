import { CheckCircleIcon } from "./icons.tsx";

const ALLOWED = [
  "Recetas, ingredientes y técnicas de cocina",
  "Dietas, alergias e intolerancias",
  "Cómo usar FoodMood IA",
];

/**
 * The scope card shown before the conversation.
 *
 * It repeats what the welcome says, but with examples on both sides: the three
 * topics Chef does answer, and the kind of question it refuses instead of
 * inventing an answer.
 */
export function ChatScopeNotice() {
  return (
    <section className="border-b border-line bg-surface px-4 py-3.5 sm:px-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-clay-600">
        De qué puedo hablar
      </p>

      <ul className="mt-2 grid gap-1.5 text-xs text-ink-soft sm:grid-cols-3">
        {ALLOWED.map((topic) => (
          <li key={topic} className="flex items-start gap-1.5">
            <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-600" />
            <span>{topic}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
