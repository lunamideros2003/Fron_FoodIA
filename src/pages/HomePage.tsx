import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi.ts";
import { MoodCard } from "../components/MoodCard.tsx";
import { SectionHeading, Skeleton, ErrorState } from "../components/Feedback.tsx";
import { DishThumb } from "../components/DishThumb.tsx";
import { ArrowIcon, BowlIcon, BowlIconFilled, MindIcon, ScaleIcon, TextIcon } from "../components/icons.tsx";
import { api } from "../lib/api.ts";
import type { Mood } from "../types.ts";

const HOW_IT_WORKS = [
  {
    step: "01",
    Icon: MindIcon,
    title: "Eliges cómo te sientes",
    body: "Cansado, feliz, estresado, triste, sin energía o con prisa. Sin cuestionarios eternos.",
  },
  {
    step: "02",
    Icon: TextIcon,
    title: "La IA analiza el contexto",
    body: "Compara tu ánimo con lo que la gente realmente confirma, tus notas, tu salud y tu historial.",
  },
  {
    step: "03",
    Icon: BowlIcon,
    title: "Recibes opciones con explicación",
    body: "Cada recomendación viene con el desglose de por qué encaja contigo, y la receta completa.",
  },
  {
    step: "04",
    Icon: ScaleIcon,
    title: "Te armamos el plan del día",
    body: "Si elegiste algo dulce o pesado, te decimos qué conviene comer el resto del día.",
  },
];

const TASTE_NOTES = [
  "no tengo ganas de cocinar",
  "algo rapidísimo",
  "algo que me llene",
  "dulce pero no empalagoso",
  "barato y rico",
  "con pollo",
  "que no sea muy picante",
];

export function HomePage() {
  const moods = useApi(() => api.moods(), []);
  const featured = useApi(() => api.dishes({ limit: 3 }), []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1000px 460px at 12% -5%, #F6D3D6 0%, transparent 60%), radial-gradient(760px 420px at 92% 0%, #E0C08D 0%, transparent 62%)",
          }}
          aria-hidden="true"
        />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="animate-fm-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-blush-300 bg-cream-50/80 px-4 py-1.5 text-xs font-semibold text-mauve-600 backdrop-blur">
              <BowlIcon className="h-4 w-4" />
              La comida según tu estado de ánimo
            </span>

            <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Hoy no sabes qué comer.
              <span className="block text-rose-500">Te entendemos.</span>
            </h1>

            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-cocoa-600">
              FoodMood IA recibe cómo te sientes, qué tienes en el refri, si tienes alguna condición
              de salud y qué te ha gustado antes. Te propone platos con una explicación de por qué
              son los indicados, y después te arma el plan del resto del día.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/recomendar" className="fm-button fm-button-primary">
                Probar el recomendador
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link to="/catalogo" className="fm-button fm-button-ghost">
                Ver el catálogo
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-cocoa-500">Prueba diciendo:</span>
              {TASTE_NOTES.map((note) => (
                <Link
                  key={note}
                  to={`/recomendar?nota=${encodeURIComponent(note)}`}
                  className="fm-chip transition-colors hover:bg-blush-200"
                >
                  «{note}»
                </Link>
              ))}
            </div>
          </div>

          <HeroArtwork />
        </div>
      </section>

      {/* Moods */}
      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <SectionHeading
          eyebrow="Empieza por aquí"
          title="¿Cómo te sientes ahora?"
          description="Toca tu estado de ánimo y deja que el modelo haga el resto."
        />

        <div className="mt-8">
          {moods.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-24" />
              ))}
            </div>
          ) : moods.error ? (
            <ErrorState message={moods.error} onRetry={moods.reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moods.data?.items.map((mood: Mood, index) => (
                <div key={mood.key} className="animate-fm-rise" style={{ animationDelay: `${index * 70}ms` }}>
                  <MoodCard mood={mood} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-sand-200 bg-sand-100/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            eyebrow="Cómo funciona"
            title="No es una lista fija: es un modelo que aprende"
            description="Cada like, guardado o «no es para mí» vuelve a entrenar el recomendador. Con el tiempo conoce mejor tu gusto."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="fm-card p-6">
                <div className="flex items-center justify-between">
                  <item.Icon className="h-7 w-7 text-rose-400" />
                  <span className="font-display text-3xl text-blush-300">{item.step}</span>
                </div>
                <h3 className="mt-4 text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Del catálogo"
            title="Algunos platos que ya conoces"
          />
          <Link to="/catalogo" className="fm-button fm-button-ghost">
            Ver los 40 →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.loading
            ? Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-64" />)
            : featured.data?.items.map((dish, index) => (
                <Link
                  key={dish.id}
                  to={`/plato/${dish.slug}`}
                  className="fm-card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <DishThumb category={dish.category} id={dish.id} className="h-36 w-full" />
                  <div className="p-5">
                    <h3 className="font-display text-lg text-plum-700 group-hover:text-mauve-600">
                      {dish.nameEs}
                    </h3>
                    <p className="mt-1 text-xs text-cocoa-500">
                      {dish.category} · {dish.prepMinutes} min · {dish.calories} kcal
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-cocoa-600">{dish.description}</p>
                  </div>
                  <span className="sr-only">{index + 1}</span>
                </Link>
              ))}
        </div>
      </section>
    </>
  );
}

function HeroArtwork() {
  return (
    <div className="animate-fm-rise relative mx-auto w-full max-w-md" style={{ animationDelay: "120ms" }}>
      <div
        className="absolute -inset-6 -z-10 rounded-[3rem] opacity-70 blur-2xl"
        style={{ background: "linear-gradient(140deg, #F6D3D6, #E0C08D)" }}
        aria-hidden="true"
      />
      <div className="fm-card overflow-hidden">
        <div
          className="flex h-56 items-center justify-center"
          style={{ background: "linear-gradient(150deg, #B08494 0%, #6E4650 100%)" }}
        >
          <span className="text-cream-50" aria-hidden="true">
            <BowlIconFilled className="h-28 w-28 opacity-95" />
          </span>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
              style={{ backgroundColor: "#B0849422" }}
              aria-hidden="true"
            >
              <MindIcon className="h-5 w-5 text-mauve-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-plum-700">Te sientes estresado</p>
              <p className="text-xs text-cocoa-500">Analizando tu historial…</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {["Ramen de miso instantáneo", "Sopa de tomate y albahaca", "Crema de avena con fruta"].map(
              (label, index) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-2.5"
                >
                  <span className="text-sm text-cocoa-700">{label}</span>
                  <span className="text-xs font-semibold text-rose-400">
                    {[94, 88, 81][index]}% match
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
