import type { ComponentType } from "react";
import type { MoodOptionIcon, QuestionnaireMood } from "../types.ts";
import { cn } from "../lib/cn.ts";
import {
  BoltIcon,
  CheckCircleIcon,
  FeatherIcon,
  LeafIcon,
  SoupIcon,
  SparkIcon,
  ToastIcon,
} from "./icons.tsx";

const ICONS: Record<MoodOptionIcon, ComponentType<{ className?: string }>> = {
  energy: BoltIcon,
  comfort: SoupIcon,
  calm: FeatherIcon,
  spark: SparkIcon,
  leaf: LeafIcon,
  toast: ToastIcon,
};

interface MoodOptionCardProps {
  mood: QuestionnaireMood;
  selected: boolean;
  onSelect: (mood: QuestionnaireMood) => void;
}

export function MoodOptionCard({ mood, selected, onSelect }: MoodOptionCardProps) {
  const Icon = ICONS[mood.icon] ?? SparkIcon;

  return (
    <button
      type="button"
      onClick={() => onSelect(mood)}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all",
        selected
          ? "border-clay-500 bg-peach-100 shadow-soft"
          : "border-line bg-surface hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-soft",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected ? "bg-clay-500 text-cream-50" : "bg-cream-100 text-clay-600",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.05rem] font-semibold leading-snug text-ink">
          {mood.label}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted">{mood.description}</span>
      </span>

      <CheckCircleIcon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 transition-opacity",
          selected ? "text-clay-500 opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
