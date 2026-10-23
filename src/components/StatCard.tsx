import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn.ts";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  tone?: "cream" | "peach" | "sage";
}

const TONES = {
  cream: "bg-cream-100 text-ink-soft",
  peach: "bg-peach-100 text-clay-600",
  sage: "bg-sage-100 text-sage-600",
};

export function StatCard({ label, value, hint, icon: Icon, to, tone = "cream" }: StatCardProps) {
  const content = (
    <>
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONES[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-3 block font-display text-2xl leading-none text-ink">{value}</span>
      <span className="mt-1.5 block text-xs font-medium text-ink-soft">{label}</span>
      {hint ? <span className="mt-0.5 block text-[0.7rem] text-muted">{hint}</span> : null}
    </>
  );

  const className =
    "fm-card-flat block p-4 transition-all hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-soft";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
