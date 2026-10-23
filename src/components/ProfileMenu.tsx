import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import { cn } from "../lib/cn.ts";
import { firstName, initials } from "../lib/text.ts";
import { CheckCircleIcon, ChevronDownIcon, LogoutIcon, UserIcon } from "./icons.tsx";

export function ProfileMenu({
  compact = false,
  placement = "up",
}: {
  compact?: boolean;
  placement?: "up" | "down";
}) {
  const { user, logout, apiOnline } = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();

    const onPointer = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
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
        ref={trigger}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={compact ? "Abrir menú de perfil" : undefined}
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
                {user ? firstName(user.displayName) : "Invitada"}
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
          ref={menu}
          role="menu"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const items = Array.from(
              menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [],
            );
            const current = items.indexOf(document.activeElement as HTMLElement);
            const next =
              event.key === "ArrowDown"
                ? (current + 1) % items.length
                : (current - 1 + items.length) % items.length;
            items[next]?.focus();
          }}
          className={cn(
            "absolute z-50 w-60 rounded-xl border border-line bg-surface p-2 shadow-lift",
            placement === "up"
              ? "bottom-full left-0 mb-2"
              : "right-0 top-full mt-2",
          )}
        >
          <p className="px-2 pb-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Tu sesión
          </p>

          {!user ? (
            <Link
              to="/entrar"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-clay-600 hover:bg-peach-100"
            >
              <UserIcon className="h-3.5 w-3.5" />
              Iniciar sesión o crear cuenta
            </Link>
          ) : (
            <>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 rounded-lg bg-cream-100 px-2 py-2 text-left text-xs">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-[0.6rem] font-bold text-sage-600">
                    {initials(user.displayName)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {user.displayName}
                  </span>
                  <CheckCircleIcon className="h-3.5 w-3.5 text-clay-500" />
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  navigate("/");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-line px-2 py-2.5 text-left text-xs font-semibold text-clay-600 hover:bg-peach-100"
              >
                <LogoutIcon className="h-3.5 w-3.5" />
                Cerrar sesión
              </button>
            </>
          )}

          <Link
            to="/perfil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold text-clay-600 hover:bg-peach-100"
          >
            <UserIcon className="h-3.5 w-3.5" />
            Mi perfil y preferencias
          </Link>
        </div>
      ) : null}
    </div>
  );
}
