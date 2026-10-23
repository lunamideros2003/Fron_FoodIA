import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn.ts";
import { Brand } from "./Brand.tsx";
import { NAV_ITEMS } from "./navItems.tsx";
import { ProfileMenu } from "./ProfileMenu.tsx";
import { PanelIcon, SparkIcon } from "./icons.tsx";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface/90 backdrop-blur lg:flex",
        collapsed ? "w-[5.25rem]" : "w-[17rem]",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-line px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Brand compact={collapsed} />
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="fm-icon-button !h-8 !w-8"
            aria-label="Contraer la barra lateral"
            title="Contraer"
          >
            <PanelIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-cream-100 hover:text-ink"
          aria-label="Expandir la barra lateral"
          title="Expandir"
        >
          <PanelIcon className="h-4 w-4" />
        </button>
      ) : null}

      <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "px-3",
                isActive
                  ? "bg-peach-100 font-semibold text-ink"
                  : "text-ink-soft hover:bg-cream-100 hover:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn("h-[1.15rem] w-[1.15rem] shrink-0", isActive ? "text-clay-600" : "text-muted")}
                />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed ? (
        <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-peach-100 to-cream-100 p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-clay-600">
            <SparkIcon className="h-4 w-4" />
          </span>
          <p className="mt-2.5 font-display text-sm font-semibold leading-snug text-ink">
            ¿No sabes qué cocinar?
          </p>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-ink-soft">
            Cuéntame cómo te sientes y te propongo algo.
          </p>
          <NavLink
            to="/animo"
            className="mt-3 flex items-center justify-center rounded-lg bg-clay-500 px-3 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-clay-600"
          >
            Abrir Mi ánimo
          </NavLink>
        </div>
      ) : null}

      <div className={cn("border-t border-line p-3", collapsed && "flex justify-center")}>
        <ProfileMenu compact={collapsed} />
      </div>
    </aside>
  );
}
