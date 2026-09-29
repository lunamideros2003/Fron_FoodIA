/**
 * Hand-drawn SVG illustrations, one per dish category.
 *
 * The catalogue has no photography, and emoji placeholders were not the answer:
 * they break the palette, look different on every OS and read as unfinished.
 * These are flat line illustrations in the brand colours, so they always look
 * the same and always match the reference design.
 */

export type IllustrationName =
  | "Desayuno"
  | "Almuerzo"
  | "Cena"
  | "Snack"
  | "Postre"
  | "Bebidas";

interface IllustrationProps {
  className?: string;
}

const STROKE = "currentColor";

function Egg(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <ellipse cx="24" cy="27" rx="14" ry="11" fill="currentColor" opacity="0.18" />
      <ellipse cx="24" cy="27" rx="14" ry="11" stroke={STROKE} strokeWidth="2" />
      <circle cx="24" cy="27" r="5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function Bowl(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <path
        d="M8 24h32c0 9-7 16-16 16S8 33 8 24Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path d="M8 24h32c0 9-7 16-16 16S8 33 8 24Z" stroke={STROKE} strokeWidth="2" />
      <path d="M6 24h36" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 18c0-3 6-3 6 0M26 20c0-3 5-3 5 0" stroke={STROKE} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Plate(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <circle cx="24" cy="24" r="15" fill="currentColor" opacity="0.18" />
      <circle cx="24" cy="24" r="15" stroke={STROKE} strokeWidth="2" />
      <circle cx="24" cy="24" r="9" stroke={STROKE} strokeWidth="1.6" opacity="0.55" />
      <path d="M24 15v18M15 24h18" stroke={STROKE} strokeWidth="1.4" opacity="0.35" />
    </svg>
  );
}

function Mug(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <path d="M11 18h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8V18Z" fill="currentColor" opacity="0.18" />
      <path d="M11 18h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8V18Z" stroke={STROKE} strokeWidth="2" />
      <path d="M33 22h4a5 5 0 0 1 0 10h-4" stroke={STROKE} strokeWidth="2" />
      <path d="M18 12c0-2 2-2 2-4M25 12c0-2 2-2 2-4" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Cake(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <path d="M10 26h28v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V26Z" fill="currentColor" opacity="0.18" />
      <path d="M10 26h28v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V26Z" stroke={STROKE} strokeWidth="2" />
      <path d="M10 26c3 0 3-4 6-4s3 4 6 4 3-4 6-4 3 4 6 4 4-2 4-2" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 18v-5" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 13c1.5-1.5 3-1.5 3 0 0-1.5 1.5-1.5 3 0" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Glass(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={props.className} aria-hidden="true">
      <path d="M14 12h20l-3 24a3 3 0 0 1-3 2.6h-8a3 3 0 0 1-3-2.6L14 12Z" fill="currentColor" opacity="0.18" />
      <path d="M14 12h20l-3 24a3 3 0 0 1-3 2.6h-8a3 3 0 0 1-3-2.6L14 12Z" stroke={STROKE} strokeWidth="2" />
      <path d="M16 24h16" stroke={STROKE} strokeWidth="1.8" opacity="0.6" />
      <path d="M32 8 40 4" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<IllustrationName, (props: IllustrationProps) => React.ReactElement> = {
  Desayuno: Egg,
  Almuerzo: Bowl,
  Cena: Plate,
  Snack: Mug,
  Postre: Cake,
  Bebidas: Glass,
};

export function DishIllustration({
  category,
  className = "h-full w-full",
}: {
  category: string;
  className?: string;
}) {
  const Illustration = ILLUSTRATIONS[category as IllustrationName] ?? Plate;
  return <Illustration className={className} />;
}

export const CATEGORY_LABELS: Record<string, string> = {
  Desayuno: "Desayuno",
  Almuerzo: "Almuerzo",
  Cena: "Cena",
  Snack: "Snack",
  Postre: "Postre",
  Bebidas: "Bebida",
};
