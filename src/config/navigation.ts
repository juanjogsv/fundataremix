export type SectionAccent = "teal" | "orange" | "brown" | "lime" | "coral";

export type SectionNavigationItem = {
  label: string;
  shortLabel?: string;
  href: string;
  accent: SectionAccent;
};

export const SECTION_NAVIGATION: SectionNavigationItem[] = [
  { label: "Indicadores Estratégicos", shortLabel: "Indicadores", href: "/indicadores", accent: "teal" },
  { label: "Calendario", href: "/calendario", accent: "orange" },
  { label: "Documentos", href: "/documentos", accent: "brown" },
  { label: "Financiero", href: "/financiero", accent: "lime" },
  { label: "Educación", href: "/educacion", accent: "coral" },
  { label: "Emprendimiento", href: "/emprendimiento", accent: "orange" },
  { label: "Desarrollo Rural", href: "/desarrollo-rural", accent: "lime" },
  { label: "Especiales", href: "/especiales", accent: "coral" },
  { label: "Mapa", href: "/mapa", accent: "teal" },
  { label: "Contexto Socioeconómico", href: "/socioeconomico", accent: "orange" },
];

type RouteContext = {
  label: string;
  backHref: string;
  backLabel: string;
  isDeep: boolean;
};

const SECONDARY_ROUTES: Record<string, Omit<RouteContext, "isDeep">> = {
  "/contexto": { label: "Contexto", backHref: "/", backLabel: "Inicio" },
  "/about": { label: "Acerca de Mi Junta", backHref: "/", backLabel: "Inicio" },
  "/help": { label: "Guía de usuario", backHref: "/", backLabel: "Inicio" },
  "/auth": { label: "Acceso", backHref: "/", backLabel: "Inicio" },
  "/admin": { label: "Administración", backHref: "/", backLabel: "Inicio" },
  "/admin/documentos": { label: "Gestión de documentos", backHref: "/admin", backLabel: "Administración" },
  "/admin/biblioteca": { label: "Gestión de biblioteca", backHref: "/admin", backLabel: "Administración" },
};

export function getRouteContext(pathname: string): RouteContext | null {
  if (pathname === "/") return null;

  const section = SECTION_NAVIGATION.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  if (section) {
    const isDeep = pathname !== section.href;
    return {
      label: section.label,
      backHref: isDeep ? section.href : "/",
      backLabel: isDeep ? section.label : "Inicio",
      isDeep,
    };
  }

  const secondary = SECONDARY_ROUTES[pathname];
  if (secondary) return { ...secondary, isDeep: secondary.backHref !== "/" };

  if (pathname.startsWith("/admin/")) {
    return { label: "Administración", backHref: "/admin", backLabel: "Administración", isDeep: true };
  }

  return null;
}