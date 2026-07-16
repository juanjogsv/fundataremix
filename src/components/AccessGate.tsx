import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import lukerLogo from "@/assets/fundacion-luker-logo.jpeg";

const LOCAL_FLAG = "fl_access_granted_v1";

/**
 * AccessGate — Overlay a pantalla completa que exige un código compartido.
 * La seguridad real vive en RLS + Edge Function; este componente es UX.
 * Se salta automáticamente en rutas /datosabiertos (ver App.tsx).
 */
export const AccessGate = ({ children }: { children: React.ReactNode }) => {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(Boolean(session));
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!codigo.trim()) return;
    setSubmitting(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "validar-codigo",
        { body: { codigo: codigo.trim() } },
      );
      if (fnErr) throw fnErr;
      if (!data?.valid) {
        setError("Código inválido. Verifica e intenta nuevamente.");
        setSubmitting(false);
        return;
      }
      const { error: signErr } = await supabase.auth.signInAnonymously();
      if (signErr) throw signErr;
      try {
        localStorage.setItem(LOCAL_FLAG, "1");
      } catch {
        /* ignore */
      }
      setCodigo("");
    } catch (err) {
      console.error("Error validando código:", err);
      setError("No pudimos validar el código. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-luker-green" />
      </div>
    );
  }

  if (hasSession) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-gradient-to-br from-white via-gray-50 to-luker-green/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 shadow-xl border-luker-green/20">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <img
            src={lukerLogo}
            alt="Fundación Luker"
            className="h-14 w-auto object-contain"
          />
          <div className="flex items-center gap-2 text-luker-brown">
            <Shield className="h-4 w-4 text-luker-green" />
            <span className="text-sm font-semibold">Acceso restringido</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Esta plataforma es de uso interno. Ingresa el código compartido para
            continuar.
            <br />
            <span className="text-xs text-gray-500">
              ¿Buscas los datos públicos? Visita{" "}
              <a
                href="/datosabiertos"
                className="text-luker-green underline font-medium"
              >
                /datosabiertos
              </a>
              .
            </span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="password"
            autoFocus
            placeholder="Código de acceso"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            maxLength={200}
            className="text-center tracking-widest"
          />
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <Button
            type="submit"
            disabled={submitting || !codigo.trim()}
            className="w-full bg-luker-green hover:bg-luker-green/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Validando…
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AccessGate;
