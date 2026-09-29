import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { useUser } from "../context/UserContext.tsx";
import { BowlIconFilled } from "./icons.tsx";

const NAV_ITEMS = [
  { to: "/", label: "Inicio" },
  { to: "/recomendar", label: "Recomendaciones" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/perfil", label: "Mi perfil" },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="FoodMood IA, inicio">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-2xl text-cream-50 transition-transform group-hover:rotate-6"
        style={{ background: "linear-gradient(135deg, #B08494 0%, #6E4650 100%)" }}
        aria-hidden="true"
      >
        <BowlIconFilled className="h-6 w-6" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-plum-700">
          FoodMood
        </span>
        <span className="block text-[0.6rem] font-semibold tracking-[0.32em] text-rose-400">
          IA
        </span>
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, users, selectUser, apiOnline } = useUser();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-cream-100/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-mauve-600 text-cream-50"
                      : "text-cocoa-600 hover:bg-blush-100 hover:text-plum-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {users.length > 0 ? (
              <label className="hidden items-center gap-2 rounded-full border border-sand-300 bg-cream-50 px-3 py-1.5 sm:flex">
                <span className="text-xs font-medium text-cocoa-500">Perfil</span>
                <select
                  value={user?.id ?? ""}
                  onChange={(event) => selectUser(Number(event.target.value))}
                  className="cursor-pointer bg-transparent text-sm font-semibold text-plum-700 focus:outline-none"
                  aria-label="Cambiar de perfil"
                >
                  {users.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.displayName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full border border-sand-300 bg-cream-50 p-2 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <span className="block space-y-1">
                <span className="block h-0.5 w-4 rounded bg-plum-700" />
                <span className="block h-0.5 w-4 rounded bg-plum-700" />
                <span className="block h-0.5 w-4 rounded bg-plum-700" />
              </span>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-sand-200 bg-cream-50 px-5 py-2 md:hidden" aria-label="Móvil">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-mauve-600 text-cream-50" : "text-cocoa-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>

      {!apiOnline ? (
        <div className="border-b border-rose-300/40 bg-blush-100 px-5 py-2.5 text-center text-sm text-plum-700">
          No hay conexión con el backend. Inícialo en <code>Back_FoodIA</code> y recarga.
        </div>
      ) : null}

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-sand-200 bg-sand-100/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="FoodMood IA, inicio"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-cream-50"
              style={{ background: "linear-gradient(135deg, #B08494 0%, #6E4650 100%)" }}
              aria-hidden="true"
            >
              <BowlIconFilled className="h-5 w-5" />
            </span>
            <span className="font-display text-base font-semibold text-plum-700">FoodMood</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cocoa-600">
            <Link className="hover:text-mauve-600" to="/recomendar">
              Recomendar
            </Link>
            <Link className="hover:text-mauve-600" to="/catalogo">
              Catálogo
            </Link>
            <Link className="hover:text-mauve-600" to="/perfil">
              Perfil
            </Link>
          </nav>
        </div>

        <div className="border-t border-sand-200 px-5 py-4 text-center text-xs text-cocoa-500">
          FoodMood IA · Caso de estudio
        </div>
      </footer>
    </div>
  );
}
