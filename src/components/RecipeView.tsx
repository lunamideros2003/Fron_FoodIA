import { useState } from "react";
import { Link } from "react-router-dom";
import type { Dish } from "../types.ts";
import { DishThumb } from "./DishThumb.tsx";
import { DIFFICULTY_LABELS, PRICE_LABELS } from "../lib/format.ts";

interface RecipeViewProps {
  dish: Dish;
  onClose?: () => void;
  /** Called when the user says they are going to eat it. */
  onEat?: (servings: number) => void;
  eating?: boolean;
  compact?: boolean;
}

const SERVING_CHOICES = [1, 2, 3];

/**
 * Full recipe: ingredients as plain text, numbered steps and the chef tip.
 * No emoji anywhere, on brand with the reference design.
 */
export function RecipeView({ dish, onClose, onEat, eating = false, compact = false }: RecipeViewProps) {
  const [servings, setServings] = useState(1);

  return (
    <article className="fm-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[0.85fr_1.15fr]">
        <div className="relative">
          <DishThumb
            category={dish.category}
            id={dish.id}
            className={compact ? "h-40 w-full md:h-full" : "h-48 w-full md:h-full"}
            label={dish.category}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl leading-tight">{dish.nameEs}</h3>
              <p className="mt-1 text-sm leading-relaxed text-cocoa-600">{dish.description}</p>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-cocoa-600 transition-colors hover:border-rose-300"
              >
                Cerrar
              </button>
            ) : null}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-cocoa-500">Tiempo</dt>
              <dd className="text-sm font-semibold text-plum-700">{dish.prepMinutes} min</dd>
            </div>
            <div>
              <dt className="text-xs text-cocoa-500">Energía</dt>
              <dd className="text-sm font-semibold text-plum-700">{dish.calories} kcal</dd>
            </div>
            <div>
              <dt className="text-xs text-cocoa-500">Dificultad</dt>
              <dd className="text-sm font-semibold text-plum-700">
                {DIFFICULTY_LABELS[dish.difficulty]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-cocoa-500">Precio</dt>
              <dd className="text-sm font-semibold text-plum-700">{PRICE_LABELS[dish.priceLevel]}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-0 border-t border-sand-200 md:grid-cols-2">
        <section className="border-b border-sand-200 p-6 md:border-b-0 md:border-r">
          <h4 className="text-lg">Ingredientes</h4>
          <p className="mt-1 text-xs text-cocoa-500">
            Para {dish.servings} {dish.servings === 1 ? "porción" : "porciones"}
          </p>
          <ul className="mt-4 space-y-2.5">
            {dish.ingredients.map((item) => (
              <li
                key={item.ingredientId}
                className="flex items-baseline justify-between gap-4 border-b border-dashed border-sand-200 pb-2.5 text-sm"
              >
                <span className="text-cocoa-700">
                  {item.label}
                  {item.optional ? (
                    <span className="ml-2 text-xs text-cocoa-500">opcional</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs font-semibold text-rose-400">
                  {item.quantity}
                </span>
              </li>
            ))}
          </ul>

          <h4 className="mt-6 text-lg">Porción</h4>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Información nutricional por porción</caption>
            <tbody>
              {[
                ["Azúcares", `${dish.nutrition.sugarGrams} g`],
                ["Fibra", `${dish.nutrition.fiberGrams} g`],
                ["Proteína", `${dish.proteinGrams} g`],
                ["Sodio", `${dish.nutrition.sodiumMg} mg`],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-sand-200 last:border-0">
                  <th scope="row" className="py-2 text-left font-normal text-cocoa-600">
                    {label}
                  </th>
                  <td className="py-2 text-right font-semibold text-plum-700">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="p-6">
          <h4 className="text-lg">Preparación</h4>
          <ol className="mt-4 space-y-4">
            {dish.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mauve-600 text-xs font-semibold text-cream-50">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-cocoa-700">{step}</span>
              </li>
            ))}
          </ol>

          {dish.chefTip ? (
            <div className="mt-6 rounded-2xl border border-gold-300 bg-sand-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
                Consejo del chef
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-cocoa-700">{dish.chefTip}</p>
            </div>
          ) : null}

          {onEat ? (
            <div className="mt-6 rounded-2xl bg-blush-100 p-4">
              <p className="text-sm font-medium text-plum-700">
                ¿Cuántas porciones vas a comer? Así te decimos qué va bien para el resto del día.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {SERVING_CHOICES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setServings(value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      servings === value
                        ? "border-mauve-600 bg-mauve-600 text-cream-50"
                        : "border-sand-300 bg-cream-50 text-cocoa-600 hover:border-rose-300"
                    }`}
                  >
                    {value} {value === 1 ? "porción" : "porciones"}
                  </button>
                ))}

                <button
                  type="button"
                  className="fm-button fm-button-primary"
                  disabled={eating}
                  onClick={() => onEat(servings)}
                >
                  {eating ? "Cargando…" : "Ya me lo como"}
                </button>
              </div>
              <p className="mt-2 text-xs text-cocoa-600">
                Con {servings} {servings === 1 ? "porción" : "porciones"} serían{" "}
                {Math.round(dish.calories * servings)} kcal y{" "}
                {(dish.nutrition.sugarGrams * servings).toFixed(1).replace(".0", "")} g de azúcar.
              </p>
            </div>
          ) : null}

          <Link
            to={`/plato/${dish.slug}`}
            className="mt-4 inline-block text-sm font-medium text-mauve-600 underline-offset-4 hover:underline"
          >
            Ver la ficha completa
          </Link>
        </section>
      </div>
    </article>
  );
}
