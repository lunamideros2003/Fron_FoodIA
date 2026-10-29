import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useUser } from "../context/UserContext.tsx";
import { cn } from "../lib/cn.ts";
import { ApiError } from "../lib/api.ts";
import { Brand } from "../components/Brand.tsx";

type AuthMode = "login" | "register";

const detailMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.details?.length) {
    return `${error.details[0].message}`;
  }
  return error instanceof Error ? error.message : "Algo salió mal. Intenta de nuevo.";
};

export function AuthPage() {
  useDocumentTitle("Inicia sesión");
  const { login, register } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setFeedback(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email: email.trim(), password, displayName: displayName.trim() });
      }
      navigate("/", { replace: true });
    } catch (cause) {
      setFeedback({ tone: "error", text: detailMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-6 flex justify-center lg:hidden">
        <Brand />
      </div>

      <div className="fm-card p-6 sm:p-8">
        <span className="fm-eyebrow">{mode === "login" ? "Bienvenida de vuelta" : "Únete"}</span>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {mode === "login"
            ? "Vuelve a tus favoritos, tu historial y tus preferencias."
            : "Guarda tus gustos y te recomendamos comida según tu ánimo."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <label className="block">
              <span className="fm-label">¿Cómo te llamamos?</span>
              <input
                className="fm-input w-full"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                minLength={2}
                maxLength={40}
                autoComplete="name"
                placeholder="Luna Mideros"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="fm-label">Correo</span>
            <input
              className="fm-input w-full"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="tu@correo.com"
            />
          </label>

          <label className="block">
            <span className="fm-label">Contraseña</span>
            <input
              className="fm-input w-full"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "••••••••"}
            />
          </label>

          {feedback ? (
            <p
              role={feedback.tone === "error" ? "alert" : "status"}
              className={cn(
                "rounded-lg px-3 py-2 text-xs leading-relaxed",
                feedback.tone === "error"
                  ? "bg-peach-100 text-clay-600"
                  : "bg-sage-100 text-sage-600",
              )}
            >
              {feedback.text}
            </p>
          ) : null}

          <button type="submit" className="fm-button fm-button-primary w-full" disabled={busy}>
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          {mode === "login" ? "¿Todavía no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-clay-600 underline-offset-2 hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Seguir mirando recetas sin cuenta
        </Link>
      </p>
    </div>
  );
}
