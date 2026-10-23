import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import { cn } from "../lib/cn.ts";
import { Brand } from "./Brand.tsx";
import { MobileNav } from "./MobileNav.tsx";
import { ProfileMenu } from "./ProfileMenu.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { WarningIcon } from "./icons.tsx";

const SIDEBAR_KEY = "foodmood.sidebarCollapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-cream-50/90 px-4 backdrop-blur-md print:hidden lg:hidden">
      <Brand />
      <ProfileMenu compact placement="down" />
    </header>
  );
}

function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-clay-300 bg-peach-100 px-4 py-2 text-center text-xs font-medium text-clay-600 print:hidden">
      <WarningIcon className="h-3.5 w-3.5 shrink-0" />
      No hay conexión con el backend. Inícialo en Back_FoodIA y recarga.
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-cream-100/60 px-4 py-8 print:hidden lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Brand />
          <p className="mt-2 text-[0.7rem] text-muted">
            Recetas reales para días reales. No sustituye consejo médico.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft" aria-label="Pie de página">
          <Link className="hover:text-clay-600" to="/animo">
            Mi ánimo
          </Link>
          <Link className="hover:text-clay-600" to="/recetas">
            Explorar recetas
          </Link>
          <Link className="hover:text-clay-600" to="/historial">
            Mi historial
          </Link>
          <Link className="hover:text-clay-600" to="/favoritos">
            Mis favoritos
          </Link>
          <Link className="hover:text-clay-600" to="/perfil">
            Mi perfil
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { apiOnline } = useUser();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      // Private mode: the preference simply does not persist.
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen">
      <a
        href="#contenido"
        className="sr-only rounded-lg bg-clay-500 px-4 py-2 text-sm font-semibold text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 print:hidden"
      >
        Saltar al contenido
      </a>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div className={cn(
          "flex min-h-screen flex-col transition-[padding] print:block print:pl-0",
          collapsed ? "lg:pl-[5.25rem]" : "lg:pl-[17rem]",
        )}>
        <MobileHeader />
        {!apiOnline ? <OfflineBanner /> : null}

        <main
          id="contenido"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-14 lg:pt-10 print:max-w-none print:px-0 print:pb-0 print:pt-0"
        >
          {children}
        </main>

        <Footer />
      </div>

      <MobileNav />
    </div>
  );
}
