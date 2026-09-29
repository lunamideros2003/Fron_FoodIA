import type { ReactNode } from "react";
import { WarningIcon } from "./icons.tsx";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`fm-skeleton fm-skeleton-after rounded-2xl ${className}`} />;
}

export function CardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="fm-card overflow-hidden p-0">
          <Skeleton className="h-36 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="fm-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <h3 className="text-xl">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-cocoa-600">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="fm-card flex flex-col items-center gap-3 border-rose-300 bg-blush-100 px-6 py-12 text-center">
      <WarningIcon className="h-8 w-8 text-mauve-600" />
      <h3 className="text-xl text-plum-700">Algo salió mal</h3>
      <p className="max-w-md text-sm text-cocoa-600">{message}</p>
      {onRetry ? (
        <button type="button" className="fm-button fm-button-primary" onClick={onRetry}>
          Intentar de nuevo
        </button>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-400">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-2 text-3xl leading-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-[0.98rem] leading-relaxed text-cocoa-600">{description}</p>
      ) : null}
    </div>
  );
}
