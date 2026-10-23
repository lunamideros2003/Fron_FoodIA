import { useEffect, useRef, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MoodPage } from "./pages/MoodPage.tsx";
import { ExplorePage } from "./pages/ExplorePage.tsx";
import { PantryPage } from "./pages/PantryPage.tsx";
import { PlanPage } from "./pages/PlanPage.tsx";
import { RecipeDetailPage } from "./pages/RecipeDetailPage.tsx";
import { HistoryPage } from "./pages/HistoryPage.tsx";
import { FavoritesPage } from "./pages/FavoritesPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { useUser } from "./context/UserContext.tsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    document.getElementById("contenido")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

export function App() {
  const { pathname } = useLocation();

  return (
    <Layout>
      <ErrorBoundary key={pathname}>
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/entrar" element={<AuthPage />} />
        <Route path="/animo" element={<MoodPage />} />
        <Route path="/recetas" element={<ExplorePage />} />
        <Route path="/recetas/:slug" element={<RecipeDetailPage />} />
        <Route path="/despensa" element={<PantryPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/historial" element={<RequireUser><HistoryPage /></RequireUser>} />
        <Route path="/favoritos" element={<RequireUser><FavoritesPage /></RequireUser>} />
        <Route path="/perfil" element={<RequireUser><ProfilePage /></RequireUser>} />

        <Route path="/recomendar" element={<Navigate to="/animo" replace />} />
        <Route path="/catalogo" element={<Navigate to="/recetas" replace />} />
        <Route path="/plato/:slug" element={<LegacyDishRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

/**
 * Pages that talk to owner-scoped endpoints farita of a session. A guest is
 * gently walked to the sign-in screen instead of shown a wall of errors.
 */
function RequireUser({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to="/entrar" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted" role="status">
      Cargando tu cocina…
    </div>
  );
}

function LegacyDishRedirect() {
  const { pathname, search } = useLocation();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  return <Navigate to={`/recetas/${slug}${search}`} replace />;
}

function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
      <span className="fm-eyebrow">Error 404</span>
      <h1 className="mt-2 font-display text-4xl text-ink">Esta página no existe</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        Quizá se nos cayó un plato. Vuelve al inicio y cuéntame de qué quieres comer.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link to="/" className="fm-button fm-button-primary">
          Volver al inicio
        </Link>
        <Link to="/recetas" className="fm-button fm-button-ghost">
          Explorar recetas
        </Link>
      </div>
    </div>
  );
}
