import type { Dish } from "../types.ts";

/* ------------------------------------------------------------------ *
 * Date / number formatting
 * ------------------------------------------------------------------ */

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Backend timestamps arrive as "YYYY-MM-DD HH:MM:SS" in UTC. */
function toDate(value: string): Date {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatRelativeDate(value: string): string {
  const date = toDate(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `hace ${days} días`;

  return dateFormatter.format(date);
}

export function formatDateTime(value: string): string {
  const date = toDate(value);
  return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/* ------------------------------------------------------------------ *
 * Dish presentation
 * ------------------------------------------------------------------ */

export interface DishVisual {
  gradient: string;
  /** Colour of the illustration stroke and the accents. */
  ink: string;
}

const CATEGORY_VISUALS: Record<string, DishVisual> = {
  Desayuno: {
    gradient: "linear-gradient(135deg, #F6D3D6 0%, #E9C3A8 100%)",
    ink: "#8C4A56",
  },
  Almuerzo: {
    gradient: "linear-gradient(135deg, #EFDFD2 0%, #DDAAB6 100%)",
    ink: "#6E4650",
  },
  Cena: {
    gradient: "linear-gradient(135deg, #C4B7C6 0%, #8A6C7B 100%)",
    ink: "#3F2A2C",
  },
  Snack: {
    gradient: "linear-gradient(135deg, #E0C08D 0%, #D08FA0 100%)",
    ink: "#7A4A45",
  },
  Postre: {
    gradient: "linear-gradient(135deg, #DDAAB6 0%, #6E4650 100%)",
    ink: "#FBF5EF",
  },
  Bebidas: {
    gradient: "linear-gradient(135deg, #B6CFC1 0%, #E0C08D 100%)",
    ink: "#3F5A4B",
  },
};

const FALLBACK_VISUAL: DishVisual = {
  gradient: "linear-gradient(135deg, #F5EBE1 0%, #D08FA0 100%)",
  ink: "#6E4650",
};

export function dishVisual(dish: Pick<Dish, "category" | "id">): DishVisual {
  const base = CATEGORY_VISUALS[dish.category] ?? FALLBACK_VISUAL;
  // Nudge the angle per dish so same-category plates do not look identical.
  const angle = 115 + ((dish.id * 37) % 70);
  const [from, to] = base.gradient
    .replace("linear-gradient(135deg, ", "")
    .replace(" 100%)", "")
    .split(" 0%, ");
  return { ...base, gradient: `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)` };
}

export const DIFFICULTY_LABELS: Record<Dish["difficulty"], string> = {
  facil: "Fácil",
  media: "Media",
  avanzada: "Avanzada",
};

export const DIET_LABELS = {
  omnivore: "Sin restricciones",
  vegetarian: "Vegetariano",
  vegan: "Vegano",
  pescatarian: "Pescetariano",
} as const;

export const AXIS_LABELS: Record<string, string> = {
  comfort: "Consuelo",
  energy: "Energía",
  speed: "Rapidez",
  lightness: "Ligereza",
  richness: "Riqueza",
  spice: "Picor",
  sweetness: "Dulzor",
  freshness: "Frescura",
  protein: "Proteína",
  indulgence: "Antojo",
  warmth: "Calidez",
  complexity: "Complejidad",
  value: "Precio",
};

export const SCORE_LABELS: Record<string, string> = {
  moodAffinity: "Encaje con tu ánimo",
  tasteMatch: "Similitud con tu gusto",
  collaborative: "Lo que les gusta a otros",
  preferenceFit: "Tus preferencias",
  novelty: "Novedad",
  popularity: "Popularidad",
};

export const PRICE_LABELS = ["", "Económico", "Precio medio", "Premium"];
