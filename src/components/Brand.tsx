import { Link } from "react-router-dom";
import { cn } from "../lib/cn.ts";
import { BowlIconFilled } from "./icons.tsx";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5"
      aria-label="FoodMood IA, ir al inicio"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-cream-50 transition-transform group-hover:rotate-6"
        style={{ background: "linear-gradient(140deg, #C9795D 0%, #A9603F 100%)" }}
        aria-hidden="true"
      >
        <BowlIconFilled className="h-5 w-5" />
      </span>
      <span className={cn("leading-tight", compact && "lg:hidden")}>
        <span className="block font-display text-[1.05rem] font-semibold text-ink">FoodMood</span>
        <span className="block text-[0.58rem] font-semibold tracking-[0.3em] text-clay-600">
          IA
        </span>
      </span>
    </Link>
  );
}
