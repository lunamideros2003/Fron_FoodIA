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

export function formatServings(count: number): string {
  return `${count} ${count === 1 ? "porción" : "porciones"}`;
}

export function formatMinutes(minutes: number): string {
  return `${minutes} min`;
}

export function formatCalories(calories: number): string {
  return `${Math.round(calories)} kcal`;
}

export function formatRating(rating: number | null): string {
  return rating === null ? "Sin calificar" : `${rating} de 5`;
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
    gradient: "linear-gradient(135deg, #F2D8C9 0%, #E3B7A4 100%)",
    ink: "#8A4C34",
  },
  Almuerzo: {
    gradient: "linear-gradient(135deg, #EEE9DE 0%, #C9B59B 100%)",
    ink: "#5A4B41",
  },
  Cena: {
    gradient: "linear-gradient(135deg, #DCE3D4 0%, #A8B59A 100%)",
    ink: "#46543C",
  },
  Snack: {
    gradient: "linear-gradient(135deg, #F7E8D6 0%, #D9B48A 100%)",
    ink: "#6B4A2E",
  },
  Postre: {
    gradient: "linear-gradient(135deg, #F2D8C9 0%, #C9795D 100%)",
    ink: "#5B3022",
  },
  Bebidas: {
    gradient: "linear-gradient(135deg, #E3EBE0 0%, #C3D0BA 100%)",
    ink: "#3F5137",
  },
};

const FALLBACK_VISUAL: DishVisual = {
  gradient: "linear-gradient(135deg, #F4EDE3 0%, #E3B7A4 100%)",
  ink: "#5A4B41",
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

export const STATUS_LABELS = {
  viewed: "Vista",
  prepared: "Preparada",
} as const;

export const MEAL_SLOT_LABELS = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  merienda: "Merienda",
} as const;

/** Names for the proteins the pescatarian filter understands. */
export const FISH_MARKERS = ["salmón", "salmon", "atún", "atun", "camarón", "camaron"];

export function dietLabel(diet: string): string {
  return DIET_LABELS[diet as keyof typeof DIET_LABELS] ?? diet;
}

export function difficultyLabel(difficulty: string): string {
  return DIFFICULTY_LABELS[difficulty as Dish["difficulty"]] ?? difficulty;
}
