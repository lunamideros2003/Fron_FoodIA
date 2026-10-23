import { useState } from "react";
import { cn } from "../lib/cn.ts";
import { StarIcon } from "./icons.tsx";

interface RatingStarsProps {
  value: number | null;
  onChange?: (rating: number) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

const VALUES = [1, 2, 3, 4, 5];

export function RatingStars({
  value,
  onChange,
  label,
  disabled = false,
  size = "md",
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value || 0;
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${label}: ${value ?? 0} de 5`}>
        {VALUES.map((star) => (
          <StarIcon
            key={star}
            className={cn(
              icon,
              star <= (value ?? 0) ? "text-clay-500" : "text-line",
            )}
          />
        ))}
      </span>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {VALUES.map((star) => {
        const active = star <= shown;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
            aria-label={`${star} de 5`}
            aria-pressed={value === star}
            className={cn(
              "rounded-md p-1 transition-transform disabled:cursor-not-allowed disabled:opacity-50",
              active ? "scale-105" : "opacity-45 hover:opacity-80",
            )}
          >
            <StarIcon className={cn(icon, active ? "text-clay-500" : "text-ink-soft")} />
          </button>
        );
      })}
    </div>
  );
}
