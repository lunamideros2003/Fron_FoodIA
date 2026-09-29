import { dishVisual } from "../lib/format.ts";
import { DishIllustration } from "./DishIllustration.tsx";

export interface DishVisual {
  gradient: string;
  ink: string;
}

interface DishThumbProps {
  category: string;
  id: number;
  className?: string;
  label?: string;
}

/**
 * Gradient tile with a flat line illustration on top. Deterministic per dish,
 * on brand, and never a broken image.
 */
export function DishThumb({ category, id, className = "", label }: DishThumbProps) {
  const visual = dishVisual({ category, id });

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: visual.gradient, color: visual.ink }}
    >
      <DishIllustration
        category={category}
        className="h-[58%] w-[58%] opacity-90 transition-transform duration-300 group-hover:scale-105"
      />
      {label ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-plum-700 backdrop-blur">
          {label}
        </span>
      ) : null}
    </div>
  );
}
