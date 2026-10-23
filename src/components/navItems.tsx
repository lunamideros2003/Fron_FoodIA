import type { ComponentType } from "react";
import { HeartIcon, HomeIcon, MindIcon, ScrollIcon, SearchIcon } from "./icons.tsx";

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
}

/** The five sections of the app, shared by the sidebar and the mobile bar. */
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Inicio", shortLabel: "Inicio", icon: HomeIcon },
  { to: "/animo", label: "Mi ánimo", shortLabel: "Ánimo", icon: MindIcon },
  { to: "/recetas", label: "Explorar recetas", shortLabel: "Recetas", icon: SearchIcon },
  { to: "/historial", label: "Mi historial", shortLabel: "Historial", icon: ScrollIcon },
  { to: "/favoritos", label: "Mis favoritos", shortLabel: "Favoritos", icon: HeartIcon },
];
