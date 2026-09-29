import { Link } from "react-router-dom";
import type { Mood } from "../types.ts";

interface MoodCardProps {
  mood: Mood;
  selected?: boolean;
  onSelect?: (mood: Mood) => void;
}

export function MoodCard({ mood, selected = false, onSelect }: MoodCardProps) {
  const content = (
    <>
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${mood.accent}22` }}
        aria-hidden="true"
      >
        {mood.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold text-plum-700">{mood.label}</span>
        <span className="mt-0.5 block text-sm leading-snug text-cocoa-600">
          {mood.description}
        </span>
      </span>

      {onSelect ? (
        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            selected
              ? "border-transparent bg-mauve-600 text-cream-50"
              : "border-sand-300 text-cocoa-500 group-hover:border-rose-300 group-hover:text-mauve-600"
          }`}
        >
          {selected ? "Elegido" : "Elegir"}
        </span>
      ) : null}
    </>
  );

  const className = `fm-card group flex w-full items-center gap-4 p-4 text-left transition-all duration-200 ${
    selected
      ? "border-rose-400 bg-blush-100 shadow-lift"
      : "hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lift"
  }`;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(mood)}
        className={className}
        aria-pressed={selected}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={`/recomendar?mood=${mood.key}`}
      className={className}
    >
      {content}
    </Link>
  );
}
