import { NavLink } from "react-router-dom";
import { cn } from "../lib/cn.ts";
import { NAV_ITEMS } from "./navItems.tsx";

export function MobileNav() {
  return (
    <nav
      className="fm-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pt-1.5 backdrop-blur-md lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[0.6rem] font-medium transition-colors",
                  isActive ? "text-clay-600" : "text-muted hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-7 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-peach-100" : "bg-transparent",
                    )}
                  >
                    <item.icon className="h-[1.05rem] w-[1.05rem]" />
                  </span>
                  {item.shortLabel}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
