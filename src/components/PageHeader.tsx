import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "./icons.tsx";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: { to: string; label: string };
}

export function PageHeader({ eyebrow, title, description, actions, backTo }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {backTo ? (
          <Link
            to={backTo.to}
            className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-clay-600"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {backTo.label}
          </Link>
        ) : null}
        {eyebrow ? <p className="fm-eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
