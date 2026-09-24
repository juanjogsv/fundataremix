import { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "@/assets/fundacion-luker-color-letra-cafe-horizontal.png.asset.json";

export type LukerNavItem = { label: string; href: string };

type Props = {
  navItems?: LukerNavItem[];
  currentPath?: string;
  homeHref?: string;
};

export function LukerHeader({ navItems = [], currentPath, homeHref = "/" }: Props) {
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => currentPath === href;

  return (
    <header className="sticky top-0 z-50 border-b border-luker-brown/10 bg-luker-cream">
      <div className="luker-container flex h-[var(--luker-header-h)] items-center justify-between gap-6">
        <Link to={homeHref} className="luker-focus flex min-h-11 items-center" aria-label="Fundación Luker, inicio">
          <img src={logoImage.url} alt="Fundación Luker" className="h-10 w-auto max-w-[9rem] object-contain sm:h-11 sm:max-w-[10rem]" />
        </Link>

        {navItems.length > 0 && (
          <>
            <nav aria-label="Principal" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="story-link luker-focus inline-flex min-h-11 items-center text-sm font-semibold text-luker-brown aria-[current=page]:underline aria-[current=page]:decoration-luker-green aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="luker-mobile-nav"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="luker-focus inline-flex size-11 items-center justify-center text-luker-brown md:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </>
        )}
      </div>

      {open && navItems.length > 0 && (
        <nav id="luker-mobile-nav" aria-label="Principal" className="animate-fade-in border-t border-luker-brown/10 bg-luker-cream md:hidden">
          <ul className="luker-container flex flex-col py-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="luker-focus flex min-h-11 items-center text-base font-semibold text-luker-brown aria-[current=page]:text-luker-teal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}