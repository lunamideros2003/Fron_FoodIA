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

/* Navigation ------------------------------------------------------- */

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m4 10.5 8-6.5 8 6.5" />
      <path d="M6.5 9.5v9h11v-9" />
      <path d="M10 18.5v-5h4v5" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 19.5S4.5 15 4.5 9.5A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5C19.5 15 12 19.5 12 19.5Z" />
    </svg>
  );
}

export function HeartFilledIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path
        d="M12 19.5S4.5 15 4.5 9.5A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5C19.5 15 12 19.5 12 19.5Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function PanelIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.5 4.5v15" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m10 6 6 6-6 6" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/* Actions ---------------------------------------------------------- */

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DiceIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 7h14M10 4.5h4M7 7l1 12h8l1-12" />
      <path d="M10.5 10.5v5M13.5 10.5v5" opacity="0.6" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 19l1-4 9.5-9.5a2.1 2.1 0 0 1 3 3L9 18l-4 1Z" />
      <path d="m14 6.5 3.5 3.5" opacity="0.6" />
    </svg>
  );
}

export function ChefIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M7 13a3.5 3.5 0 1 1 .9-6.9A4.5 4.5 0 0 1 16 6a3.5 3.5 0 1 1 1 7" />
      <path d="M7 13v6.5h10V13" />
      <path d="M10 16.5v3M14 16.5v3" opacity="0.5" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8 12.5 2.7 2.7L16 9.5" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* Mood glyphs ------------------------------------------------------ */

export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M13 3.5 5.5 13H11l-1 7.5L18.5 11H13l0-7.5Z" />
    </svg>
  );
}

export function SoupIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 11.5h16c0 4.4-3.6 8-8 8s-8-3.6-8-8Z" />
      <path d="M9 8.5c-1-1-1-2.5 0-3.5M13 8.5c-1-1-1-2.5 0-3.5" opacity="0.6" />
    </svg>
  );
}

export function FeatherIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M19 5c-7 0-11 4-11 9v3l6-1c4-1 5-5 5-11Z" />
      <path d="M5 19 12 12" opacity="0.6" />
    </svg>
  );
}

export function ToastIcon({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M8.5 7h7l1 12h-9l1-12Z" />
      <path d="M8.5 7a2 2 0 1 1 1.7-3 2 2 0 0 1 3.6 0A2 2 0 1 1 15.5 7" opacity="0.6" />
    </svg>
  );
}
