import logoImage from "@/assets/fundacion-luker-color-letra-blanca-horizontal.png.asset.json";

type Props = { projectName?: string; tagline?: string; adminHref?: string };

export function LukerFooter({
  projectName = "Mi Junta",
  tagline = "Información para decidir, aprender y transformar.",
  adminHref,
}: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-luker-brown text-luker-cream">
      <div className="luker-container grid grid-cols-1 items-center gap-4 py-10 sm:grid-cols-[9rem_1fr_auto] sm:gap-8">
        <img src={logoImage.url} alt="Fundación Luker" className="h-auto w-36 max-w-full" />
        <div>
          <p className="text-[1.25rem] font-extrabold leading-tight">{projectName}</p>
          <p className="mt-1 text-[0.78rem] text-luker-cream/80">{tagline}</p>
        </div>
        <div className="text-[0.78rem] text-luker-cream/80 sm:text-right">
          <p>© {year} Fundación Luker</p>
          {adminHref && (
            <a href={adminHref} className="luker-focus sr-only focus:not-sr-only focus:inline-flex focus:min-h-11 focus:items-center">
              Acceso administrativo
            </a>
          )}
        </div>
      </div>
      <div className="luker-strip" aria-hidden="true">
        <span className="bg-luker-coral" />
        <span className="bg-luker-green" />
        <span className="bg-luker-teal" />
        <span className="bg-luker-orange" />
      </div>
    </footer>
  );
}