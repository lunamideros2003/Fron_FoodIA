import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MoodPage } from "./pages/MoodPage.tsx";
import { ExplorePage } from "./pages/ExplorePage.tsx";
import { PantryPage } from "./pages/PantryPage.tsx";
import { PlanPage } from "./pages/PlanPage.tsx";
import { RecipeDetailPage } from "./pages/RecipeDetailPage.tsx";
import { HistoryPage } from "./pages/HistoryPage.tsx";
import { FavoritesPage } from "./pages/FavoritesPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/animo" element={<MoodPage />} />
        <Route path="/recetas" element={<ExplorePage />} />
        <Route path="/recetas/:slug" element={<RecipeDetailPage />} />
        <Route path="/despensa" element={<PantryPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/perfil" element={<ProfilePage />} />

        <Route path="/recomendar" element={<Navigate to="/animo" replace />} />
        <Route path="/catalogo" element={<Navigate to="/recetas" replace />} />
        <Route path="/plato/:slug" element={<LegacyDishRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
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
