import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <p className="home-kicker mb-4">Página no encontrada</p>
        <h1 id="page-title" tabIndex={-1} className="mb-4 text-4xl font-black sm:text-5xl">404</h1>
        <p className="mb-8 text-lg text-muted-foreground">No encontramos el contenido que buscas.</p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
