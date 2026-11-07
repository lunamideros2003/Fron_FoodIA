import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useUser } from "../context/UserContext.tsx";
import { cn } from "../lib/cn.ts";
import { ApiError } from "../lib/api.ts";
import { Brand } from "../components/Brand.tsx";
import {
  validateLogin,
  validateRegister,
  validateEmail,
  validatePassword,
  validateDisplayName,
  passwordStrength,
  EMAIL_HINT,
  PASSWORD_HINT,
  DISPLAY_NAME_HINT,
  type FormErrors,
  hasErrors,
} from "../lib/authValidation.ts";

type AuthMode = "login" | "register";

const detailMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.details?.length) {
    return `${error.details[0].message}`;
  }
  return error instanceof Error ? error.message : "Algo salió mal. Intenta de nuevo.";
};

/** Copia los detalles del backend al campo que les corresponde. */
const applyServerErrors = (
  setErrors: Dispatch<SetStateAction<FormErrors>>,
  error: unknown,
): boolean => {
  if (!(error instanceof ApiError) || !error.details?.length) return false;

  const details = error.details;
  setErrors((prev) => {
    const next = { ...prev };
    for (const detail of details) {
      if (detail.field === "email" || detail.field === "password" || detail.field === "displayName") {
        next[detail.field] = detail.message;
      }
    }
    return next;
  });
  return true;
};

export function AuthPage() {
  useDocumentTitle("Inicia sesión");
  const { login, register } = useUser();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({ email: null, password: null, displayName: null });

  useEffect(() => {
    emailRef.current?.focus({ preventScroll: true });
  }, []);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setFeedback(null);
    setErrors({ email: null, password: null, displayName: null });
  };

  const validateCurrent = (patch?: Partial<{ email: string; password: string; displayName: string }>) => {
    const data = { email, password, displayName, ...patch };
    return mode === "login" ? validateLogin(data) : validateRegister(data);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validateCurrent();
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstInvalid: HTMLInputElement | null | undefined =
        mode === "register" && nextErrors.displayName
          ? displayNameRef.current
          : nextErrors.email
          ? emailRef.current
          : nextErrors.password
          ? passwordRef.current
          : undefined;
      firstInvalid?.focus({ preventScroll: true });
      return;
    }

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
      const mapped = applyServerErrors(setErrors, cause);
      setFeedback({
        tone: "error",
        text: mapped ? "Revisa los avisos marcados en el formulario." : detailMessage(cause),
      });
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

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {hasErrors(errors) ? (
            <p
              role="alert"
              className="rounded-lg px-3 py-2 text-xs leading-relaxed bg-peach-100 text-clay-600 border border-peach-200"
            >
              Revisa los campos marcados: el aviso en rojo te dice qué falta corregir.
            </p>
          ) : null}
          {mode === "register" ? (
            <label className="block">
              <span className="fm-label">¿Cómo te llamamos?</span>
              <input
                ref={displayNameRef}
                className={cn("fm-input w-full", errors.displayName ? "border-peach-500" : "")}
                type="text"
                value={displayName}
                onChange={(event) => {
                  const value = (event.target as HTMLInputElement).value;
                  setDisplayName(value);
                  setErrors((prev) =>
                    prev.displayName ? { ...prev, displayName: validateDisplayName(value) } : prev,
                  );
                }}
                onBlur={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  if (!target) return;
                  setErrors((prev) => ({
                    ...prev,
                    displayName: validateDisplayName(target.value),
                  }));
                }}
                required
                minLength={2}
                maxLength={40}
                autoComplete="name"
                placeholder="Luna Mideros"
                aria-invalid={errors.displayName !== null}
                aria-describedby={
                  errors.displayName ? "displayName-hint displayName-error" : "displayName-hint"
                }
              />
              <p id="displayName-hint" className="mt-1 text-[0.7rem] text-muted">
                {DISPLAY_NAME_HINT}
              </p>
              {errors.displayName ? (
                <p id="displayName-error" className="mt-1 text-xs text-peach-600" role="alert">
                  {errors.displayName}
                </p>
              ) : null}
            </label>
          ) : null}

          <label className="block">
            <span className="fm-label">Correo</span>
            <input
              ref={emailRef}
              className={cn("fm-input w-full", errors.email ? "border-peach-500" : "")}
              type="email"
              value={email}
              onChange={(event) => {
                const value = (event.target as HTMLInputElement).value;
                setEmail(value);
                setErrors((prev) =>
                  prev.email ? { ...prev, email: validateEmail(value) } : prev,
                );
              }}
              onBlur={(event) => {
                const target = event.target as HTMLInputElement | null;
                if (!target) return;
                setErrors((prev) => ({ ...prev, email: validateEmail(target.value) }));
              }}
              required
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tu@correo.com"
              aria-invalid={errors.email !== null}
              aria-describedby={errors.email ? "email-hint email-error" : "email-hint"}
            />
            <p id="email-hint" className="mt-1 text-[0.7rem] text-muted">
              {EMAIL_HINT}
            </p>
            {errors.email ? (
              <p id="email-error" className="mt-1 text-xs text-peach-600" role="alert">
                {errors.email}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="fm-label">Contraseña</span>
            <input
              ref={passwordRef}
              className={cn("fm-input w-full", errors.password ? "border-peach-500" : "")}
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => {
                const value = (event.target as HTMLInputElement).value;
                setPassword(value);
                setErrors((prev) =>
                  prev.password ? { ...prev, password: validatePassword(value) } : prev,
                );
              }}
              onBlur={(event) => {
                const target = event.target as HTMLInputElement | null;
                setCapsLock(false);
                if (!target) return;
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(target.value),
                }));
              }}
              onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
              required
              minLength={8}
              autoComplete={passwordVisible ? "off" : mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "••••••••"}
              aria-invalid={errors.password !== null}
              aria-describedby={errors.password ? "password-hint password-error" : "password-hint"}
            />
            <p id="password-hint" className="mt-1 text-[0.7rem] text-muted">
              {PASSWORD_HINT}
            </p>
            {errors.password ? (
              <p id="password-error" className="mt-1 text-xs text-peach-600" role="alert">
                {errors.password}
              </p>
            ) : null}
            {capsLock ? (
              <p className="mt-1 text-xs text-clay-600" role="status">
                Bloq Mayús está activado.
              </p>
            ) : null}
            {mode === "register" && password && !errors.password ? (
              <div className="mt-1 space-y-1">
                <span className="text-[0.65rem] text-muted">{passwordStrength(password).label}</span>
                <div className="flex w-full gap-1 h-1.5 rounded overflow-hidden bg-clay-200">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`h-full ${index < passwordStrength(password).score ? "bg-emerald-500" : "bg-clay-300"}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="mt-1 text-xs font-medium text-clay-600 hover:text-clay-800 underline-offset-2 hover:underline"
              aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
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

          <button
            type="submit"
            className="fm-button fm-button-primary w-full"
            disabled={busy}
          >
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
