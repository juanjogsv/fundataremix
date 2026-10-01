import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import logoImage from "@/assets/fundacion-luker-color-letra-cafe-horizontal.webp.asset.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { getRouteContext } from "@/config/navigation";

export type LukerNavItem = { label: string; href: string };

type Props = {
  navItems?: LukerNavItem[];
  currentPath?: string;
  homeHref?: string;
};

export function LukerHeader({ navItems = [], currentPath, homeHref = "/" }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const isActive = (href: string) => currentPath === href;
  const routeContext = currentPath ? getRouteContext(currentPath) : null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-luker-brown/10 bg-luker-cream">
      <div className="luker-container flex h-[var(--luker-header-h)] items-center justify-between gap-2 sm:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link to={homeHref} className="luker-focus flex min-h-11 items-center gap-2" aria-label="Fundación Luker · Mi Junta, inicio">
            <img src={logoImage.url} alt="Fundación Luker" width={320} height={139} fetchPriority="high" decoding="async" className="h-10 w-auto max-w-[9rem] object-contain sm:h-11 sm:max-w-[10rem]" />
            <span className="luker-platform-name shrink-0" aria-hidden="true">
              <span className="luker-platform-name__dot">·</span> Mi Junta
            </span>
          </Link>

          {routeContext && (
            <nav aria-label="Ubicación actual" className="luker-breadcrumb min-w-0">
              <Link
                to={routeContext.backHref}
                className="luker-focus inline-flex min-h-11 min-w-0 items-center gap-1"
                aria-label={`Volver a ${routeContext.backLabel}`}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {routeContext.isDeep ? `Volver a ${routeContext.backLabel}` : routeContext.label}
                </span>
              </Link>
            </nav>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {navItems.length > 0 && (
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
          )}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="max-w-56" aria-label="Abrir menú de usuario">
                  <UserRound aria-hidden="true" />
                  <span className="truncate">{user.email ?? "Usuario"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="truncate">{user.email ?? "Usuario"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onSelect={() => navigate("/admin")} className="min-h-11 cursor-pointer gap-2">
                    <Settings aria-hidden="true" /> Administración
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={handleSignOut} className="min-h-11 cursor-pointer gap-2">
                  <LogOut aria-hidden="true" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {(user || navItems.length > 0) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="luker-mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="shrink-0 md:hidden"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        )}
      </div>

      {open && (user || navItems.length > 0) && (
        <nav id="luker-mobile-nav" aria-label="Menú de usuario" className="animate-overlay-in border-t border-luker-brown/10 bg-luker-cream md:hidden">
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
            {isAdmin && (
              <li>
                <Button variant="ghost" onClick={() => { setOpen(false); navigate("/admin"); }} className="w-full justify-start">
                  <Settings aria-hidden="true" /> Administración
                </Button>
              </li>
            )}
            {user && (
              <li>
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                  <LogOut aria-hidden="true" /> Cerrar sesión
                </Button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
