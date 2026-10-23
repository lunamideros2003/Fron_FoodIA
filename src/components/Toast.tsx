import type { ToastMessage } from "../hooks/useToast.ts";
import { cn } from "../lib/cn.ts";
import { CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from "./icons.tsx";

const TONES: Record<ToastMessage["tone"], string> = {
  success: "border-sage-400 bg-sage-100 text-ink",
  info: "border-line bg-surface text-ink",
  error: "border-clay-300 bg-peach-100 text-ink",
};

const ICONS = {
  success: CheckCircleIcon,
  info: InfoIcon,
  error: WarningIcon,
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  if (!toast) return null;
  const Icon = ICONS[toast.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lift",
          TONES[toast.tone],
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{toast.text}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
