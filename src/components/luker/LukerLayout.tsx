import type { ReactNode } from "react";
import { LukerHeader, type LukerNavItem } from "./LukerHeader";
import { LukerFooter } from "./LukerFooter";

type Props = {
  children: ReactNode;
  navItems?: LukerNavItem[];
  currentPath?: string;
  projectName?: string;
  adminHref?: string;
};

export function LukerLayout({ children, navItems, currentPath, projectName, adminHref }: Props) {
  return (
    <div className="mi-junta-site flex min-h-dvh flex-col bg-luker-cream font-sans text-luker-brown">
      <a href="#contenido" className="luker-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-card focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <LukerHeader navItems={navItems} currentPath={currentPath} />
      <main id="contenido" className="flex-1">{children}</main>
      <LukerFooter projectName={projectName} adminHref={adminHref} />
    </div>
  );
}