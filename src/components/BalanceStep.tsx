import type { BalanceResponse } from "../types.ts";
import { DishThumb } from "./DishThumb.tsx";
import { formatPercent } from "../lib/format.ts";

interface BalanceStepProps {
  balance: BalanceResponse;
  onPick: (slug: string) => void;
  onClose: () => void;
}

const SEVERITY_STYLE: Record<BalanceResponse["severity"], { bar: string; chip: string; label: string }> = {
  ok: { bar: "#8FAE9B", chip: "bg-[#E4EFE8] text-[#3F5A4B]", label: "Bajo control" },
  watch: { bar: "#C9A66B", chip: "bg-sand-200 text-[#7A5A2A]", label: "Con cuidado" },
  high: { bar: "#D08FA0", chip: "bg-blush-200 text-plum-700", label: "Azúcar alta" },
  over: { bar: "#B08494", chip: "bg-mauve-500 text-cream-50", label: "Te pasaste" },
};

export function BalanceStep({ balance, onPick, onClose }: BalanceStepProps) {
  const style = SEVERITY_STYLE[balance.severity];
  const caloriePercent = Math.min(100, Math.round(balance.calorieProgress * 100));
  const sugarPercent = Math.min(100, Math.round((balance.totals.sugarGrams / 50) * 100));

  return (
    <div className="space-y-6">
      <div className="fm-card overflow-hidden">
        <div
          className="px-6 py-6"
          style={{ background: `linear-gradient(120deg, ${style.bar}22, #F6D3D655)` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl">{balance.headline}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.chip}`}>
              {style.label}
            </span>
          </div>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-cocoa-700">
            {balance.message}
          </p>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-plum-700">Energía del día</span>
              <span className="text-cocoa-600">
                {balance.totals.calories} de {balance.totals.goalCalories} kcal
              </span>
            </div>
            <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-sand-200">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${caloriePercent}%`, background: style.bar }}
              />
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-plum-700">Azúcares</span>
              <span className="text-cocoa-600">
                {balance.totals.sugarGrams} de 50 g recomendados
              </span>
            </div>
            <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-sand-200">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${sugarPercent}%`, background: "#B08494" }}
              />
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Comido", `${balance.consumed.length} platos`],
              ["Proteína", `${balance.totals.proteinGrams} g`],
              ["Fibra", `${balance.totals.fiberGrams} g`],
              ["Meta diaria", `${balance.totals.goalCalories} kcal`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-cream-100 px-4 py-3">
                <dt className="text-xs text-cocoa-500">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-plum-700">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div>
        <h4 className="text-xl">Para el resto del día</h4>
        <p className="mt-1 text-sm text-cocoa-600">
          Ligero, con fibra y proteína. Es lo que te va a dejar con energía hasta la noche.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {balance.suggestions.map((item) => (
            <button
              key={item.dish.id}
              type="button"
              onClick={() => onPick(item.dish.slug)}
              className="fm-card group overflow-hidden text-left transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <DishThumb
                category={item.dish.category}
                id={item.dish.id}
                className="h-24 w-full"
                label={`${item.dish.calories} kcal`}
              />
              <div className="p-4">
                <p className="font-display text-base text-plum-700 group-hover:text-mauve-600">
                  {item.dish.nameEs}
                </p>
                <p className="mt-1 text-xs text-cocoa-500">
                  {item.dish.nutrition.sugarGrams} g de azúcar ·{" "}
                  {item.dish.nutrition.fiberGrams} g de fibra
                </p>
                <p className="mt-2 text-xs leading-relaxed text-cocoa-600">{item.explanation}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {balance.comfortOption ? (
        <div className="fm-card border-gold-300 bg-sand-100 p-6">
          <h4 className="text-xl">¿Sigues con el ánimo bajo?</h4>
          <p className="mt-1 text-sm leading-relaxed text-cocoa-700">
            A veces un plato de verduras frías no es lo que hace falta. Si lo que quieres es que te
            abracen, esto también funciona:
          </p>
          <button
            type="button"
            onClick={() => onPick(balance.comfortOption!.dish.slug)}
            className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-cream-50 p-4 text-left transition-colors hover:bg-cream-100"
          >
            <DishThumb
              category={balance.comfortOption.dish.category}
              id={balance.comfortOption.dish.id}
              className="h-20 w-20 shrink-0 rounded-2xl"
            />
            <div className="min-w-0">
              <p className="font-display text-lg text-plum-700">
                {balance.comfortOption.dish.nameEs}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-cocoa-600">
                {balance.comfortOption.explanation}
              </p>
            </div>
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="fm-button fm-button-ghost" onClick={onClose}>
          Volver a las recomendaciones
        </button>
        <span className="self-center text-xs text-cocoa-500">
          Consumido hoy: {formatPercent(balance.calorieProgress)} de tu meta calórica
        </span>
      </div>
    </div>
  );
}
