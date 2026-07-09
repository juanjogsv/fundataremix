## Objetivo

Agregar una ruta pública `/datosabiertos` que muestre una versión reducida del dashboard, reutilizando los componentes ya existentes. Sin tocar auth, rutas actuales, ni componentes.

## Cambios

### 1. Nueva página `src/pages/DatosAbiertos.tsx`

Estructura tipo "landing + secciones", inspirada en `Index.tsx` para mantener identidad de marca (Montserrat, paleta Luker, `PageHeader`, gradientes suaves, contenedor `container mx-auto`).

Layout:

```text
[Header simple con logo Fundación Luker + título "Datos Abiertos"]
[Hero corto: 1 frase + subtítulo]
[Grid de 7 tarjetas de acceso rápido -> anchors a cada sección]
  - Financiero, Educación, Emprendimiento,
    Desarrollo Rural, Especiales, Contexto Socioeconómico, Mapa
[Sección #financiero]           -> reutiliza SocialInvestmentSection + OperatingExpensesSection (dentro de Tabs, igual que Financial.tsx)
[Sección #educacion]            -> reutiliza los sub-componentes tal cual los usa Education.tsx
[Sección #emprendimiento]       -> reutiliza EAPHistoricalCharts
[Sección #desarrollo-rural]     -> reutiliza los componentes de RuralDevelopment.tsx
[Sección #especiales]           -> reutiliza SpecialProjectsBeneficiaries + SpecialProjectsInvestment
[Sección #socioeconomico]       -> reutiliza el contenido de SocioeconomicContext.tsx
[Sección #mapa]                 -> reutiliza el componente que hoy usa /mapa (Map.tsx)
[Footer con crédito Fundación Luker]
```

Reglas:
- Importa componentes hijos ya existentes (`SocialInvestmentSection`, `EAPHistoricalCharts`, `SpecialProjectsBeneficiaries`, etc.) — nada nuevo, nada duplicado.
- Cada sección se envuelve en un `<section id="...">` con un título uniforme para permitir anchors desde las tarjetas.
- Consumo de datos idéntico: los componentes reutilizados ya llaman a `supabase` / conector Google Drive existente — no se toca fuente de datos.
- Mismo `PageHeader` visual del proyecto o un header propio con `bg-white/95 backdrop-blur` como en `Index.tsx`.
- No incluye botones de "Admin", "Salir" ni referencias a `useAuth`.

### 2. `src/App.tsx`

Agregar UNA sola línea antes del catch-all `*`:

```tsx
<Route path="/datosabiertos" element={<DatosAbiertos />} />
```

Más el `import DatosAbiertos from "./pages/DatosAbiertos";`. Ningún otro cambio.

### 3. Navegación

No se agrega `/datosabiertos` a `Index.tsx` ni a ningún menú. Acceso sólo por URL directa, como pediste.

## Lo que NO se toca

- `useAuth`, `RequireJunta`, `Auth.tsx`, `Admin.tsx`.
- Rutas `/`, `/indicadores`, `/financiero`, `/educacion`, `/emprendimiento`, `/desarrollo-rural`, `/especiales`, `/socioeconomico`, `/mapa`, `/admin`, `/auth`.
- Ningún componente de visualización existente: se importan tal cual.
- `supabase/client`, `types`, edge functions, migraciones.

## Nota técnica

Las páginas ampliadas actuales (`Financial`, `Education`, etc.) ya son accesibles sin `RequireJunta` a nivel de router — la restricción real está en el flujo de login y en el acceso a `/admin`. Esta nueva página simplemente omite cualquier UI de autenticación y no depende de `useAuth`, por lo que un usuario anónimo puede consumirla directamente. No se cambia la postura de auth del resto del sitio.
