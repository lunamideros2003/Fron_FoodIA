import { MinusIcon, PlusIcon } from "./icons.tsx";
import { formatServings } from "../lib/format.ts";

interface ServingsControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function ServingsControl({
  value,
  onChange,
  min = 1,
  max = 12,
  disabled = false,
}: ServingsControlProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface p-1">
      <button
        type="button"
        className="fm-icon-button !h-8 !w-8 !border-0 !bg-transparent"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Una porción menos"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="min-w-24 text-center text-xs font-semibold text-ink" aria-live="polite">
        {formatServings(value)}
      </span>
      <button
        type="button"
        className="fm-icon-button !h-8 !w-8 !border-0 !bg-transparent"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Una porción más"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
