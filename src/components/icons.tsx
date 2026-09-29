/**
 * Small inline icon set. The reference design uses flat illustration and
 * typography, so the UI avoids emoji: they render differently on every OS and
 * break the palette. These are plain SVG, inherit currentColor and always look
 * the same.
 */

interface IconProps {
  className?: string;
}

function base(className = "h-4 w-4") {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3.5c3 3 4.5 5.5 4.5 8.2A4.5 4.5 0 0 1 12 16.2a4.5 4.5 0 0 1-4.5-4.5C7.5 9 9 6.5 12 3.5Z" />
      <path d="M12 20.5a5 5 0 0 0 5-5" opacity="0.4" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 19c0-7 4.5-11 14-11 0 8-4.5 11-10 11-2 0-3.2-.7-4-2Z" />
      <path d="M8 16c2-3 4.5-5 8-6" opacity="0.5" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function BowlIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3.5 11h17c0 4.7-3.8 8.5-8.5 8.5S3.5 15.7 3.5 11Z" />
      <path d="M2.5 11h19" />
      <path d="M9.5 7.5c0-1.6 3-1.6 3 0" opacity="0.55" />
    </svg>
  );
}

export function BowlIconFilled({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M3.5 11h17c0 4.7-3.8 8.5-8.5 8.5S3.5 15.7 3.5 11Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M2.5 11h19" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function ScrollIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function MindIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M15 5.5A6.5 6.5 0 0 0 5.5 12a6.5 6.5 0 0 0 9 6" />
      <path d="M18.5 8.5A6.5 6.5 0 0 1 12 18" />
      <path d="M18 4.5c.8 2 .6 3.6-.6 4.8" opacity="0.6" />
    </svg>
  );
}

export function TextIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 6h14M5 11h14M5 16h9" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.5a3 3 0 0 1 0 5.8M17 14.5c2 .7 3.5 2.4 3.5 4.5" opacity="0.6" />
    </svg>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 4.5v15M6 8h12" />
      <path d="M6 8 3 15h6L6 8ZM18 8l-3 7h6l-3-7Z" />
      <path d="M8.5 19.5h7" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4.5V10h-5.5" />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3.5 13.8 9 19 10.8 13.8 12.6 12 18l-1.8-5.4L5 10.8 10.2 9 12 3.5Z" />
    </svg>
  );
}
