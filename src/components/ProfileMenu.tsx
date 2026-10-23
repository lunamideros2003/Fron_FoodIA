import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import { cn } from "../lib/cn.ts";
import { firstName, initials } from "../lib/text.ts";
import { CheckCircleIcon, ChevronDownIcon, UserIcon } from "./icons.tsx";

export function ProfileMenu({
  compact = false,
  placement = "up",
}: {
  compact?: boolean;
  placement?: "up" | "down";
}) {
  const { user, users, selectUser, apiOnline } = useUser();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface p-2 text-left transition-colors hover:border-clay-300",
          compact && "justify-center border-0 bg-transparent p-1 hover:bg-peach-100",
        )}
      >
        <span className="relative">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-200 text-[0.7rem] font-bold text-sage-600">
            {user ? initials(user.displayName) : <UserIcon className="h-4 w-4" />}
          </span>
          {apiOnline ? (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-sage-400" />
          ) : (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-clay-500" />
          )}
        </span>
        {!compact ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-ink">
                {user ? firstName(user.displayName) : "Sin perfil"}
              </span>
              <span className="block truncate text-[0.65rem] text-muted">
                {apiOnline ? "Conectado" : "Sin conexión"}
              </span>
            </span>
            <ChevronDownIcon
              className={cn("h-3.5 w-3.5 text-muted transition-transform", open && "rotate-180")}
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-60 rounded-xl border border-line bg-surface p-2 shadow-lift",
            placement === "up"
              ? "bottom-full left-0 mb-2"
              : "right-0 top-full mt-2",
          )}
        >
          <p className="px-2 pb-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Cambiar de perfil
          </p>

          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {users.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  selectUser(candidate.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors hover:bg-cream-100",
                  candidate.id === user?.id && "bg-cream-100",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-[0.6rem] font-bold text-sage-600">
                  {initials(candidate.displayName)}
                </span>
                <span className="min-w-0 flex-1 truncate text-ink">{candidate.displayName}</span>
                {candidate.id === user?.id ? (
                  <CheckCircleIcon className="h-3.5 w-3.5 text-clay-500" />
                ) : null}
              </button>
            ))}
          </div>

          <Link
            to="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg border-t border-line px-2 py-2.5 text-xs font-semibold text-clay-600 hover:bg-peach-100"
          >
            <UserIcon className="h-3.5 w-3.5" />
            Mi perfil y preferencias
          </Link>
        </div>
      ) : null}
    </div>
  );
}
