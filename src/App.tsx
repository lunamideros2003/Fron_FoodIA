import { Link, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { RecommendPage } from "./pages/RecommendPage.tsx";
import { CatalogPage } from "./pages/CatalogPage.tsx";
import { DishDetailPage } from "./pages/DishDetailPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recomendar" element={<RecommendPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/plato/:slug" element={<DishDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
      <h1 className="text-4xl">Esta página no existe</h1>
      <p className="mt-3 text-cocoa-600">
        Quizá se nos cayó un plato. Vuelve al inicio y dime de qué quieres comer.
      </p>
      <Link to="/" className="fm-button fm-button-primary mt-6">
        Volver al inicio
      </Link>
    </div>
  );
}
