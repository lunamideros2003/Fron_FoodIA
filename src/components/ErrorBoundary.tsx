import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { WarningIcon } from "./icons.tsx";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("FoodMood render error", error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div
          role="alert"
          className="w-full max-w-lg rounded-2xl border border-clay-300 bg-surface p-6 text-center shadow-soft sm:p-8"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-peach-100 text-clay-600">
            <WarningIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl text-ink">Se nos cruzó un ingrediente</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            Esta pantalla no pudo cargarse. Puedes intentarlo otra vez o volver al inicio sin
            perder lo que ya estaba guardado.
          </p>

          {import.meta.env.DEV ? (
            <details className="mt-4 rounded-xl bg-cream-100 px-3.5 py-2.5 text-left">
              <summary className="cursor-pointer text-xs font-semibold text-ink">
                Detalle técnico
              </summary>
              <p className="mt-2 break-words text-[0.7rem] leading-relaxed text-muted">
                {this.state.error.message}
              </p>
            </details>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={this.reset} className="fm-button fm-button-primary">
              Intentar de nuevo
            </button>
            <Link to="/" onClick={this.reset} className="fm-button fm-button-ghost">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
