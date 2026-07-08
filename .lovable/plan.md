## Estado actual de la migración a Ecosistema

Solo **1 archivo** está conectado al proyecto externo Ecosistema (`src/integrations/ecosistema/client.ts`):

- ✅ `EducationSaberOnce.tsx` (piloto validado)

Todo lo demás sigue leyendo del Supabase interno (`@/integrations/supabase/client`).

## Pendientes según el alcance confirmado

### Educación (leen `education_indicators` / `dama_*`)
- `EducationContext.tsx` + `ContextRankingChart.tsx`
- `EducationUTC.tsx` + `EducationUTCPrograms.tsx`
- `EducationATL.tsx` + `EducationATALKPIs.tsx`
- `EducationBeneficiaries.tsx`
- `EducationLaborMarket.tsx`
- `EducationSocioemotional.tsx`
- `EducationUniversityEnrollment.tsx`
- Rankings: `EducationPreschoolRanking`, `EducationPrimaryRanking`, `EducationSecondaryRanking`, `EducationMediaRanking`, `EducationTransitRanking`, `EducationDesertionRanking`

### Contexto Socioeconómico (lee `mcv_indicators` / `dama_*`)
- `src/pages/SocioeconomicContext.tsx` (concentra CV_*, ECO_*, POB_*, ML_*, GP_*, MLJ_*)

## Fuera de alcance — se quedan en Supabase interno
Se mantienen sobre el proyecto interno porque su lógica es carga por Excel/ZIP, no viene del Ecosistema:

- Indicadores Estratégicos, Mapa, Documentos, Biblioteca, Calendario, Admin
- Desarrollo Rural completo (Financiero, Productividad, Social, Beneficiarios, Asociatividad, Generación R, Sueño Chocolate)
- Emprendimiento / EAP
- Proyectos Especiales
- Inversión Social / Gastos Operativos / Participantes

## Plan de migración por lotes

Aplicar el mismo patrón validado en `EducationSaberOnce`:

1. Reemplazar `supabase` por `ecosistema` (import del nuevo client).
2. Renombrar tablas:
   - `education_indicators` / `mcv_indicators` → `catalogo_indicadores` (join por `cod_indicador`)
   - `dama_data` → `datos_maestros`
   - `dama_entities` → `catalogo_entidades`
3. Aplicar los dos fixes ya identificados en el piloto:
   - `categoria_2` vacío = "total" (helper `normCat2`).
   - `entityMap` con `String(cod_entidad)` para el join numérico.
4. Retirar consultas muertas a `education_indicators` cuando el componente usa listas hardcodeadas.
5. Casteo `as any[]` en resultados para evitar `unknown` (client sin `Database`).

### Orden sugerido (3 lotes)
- **Lote 1 – Educación KPIs/tablas**: Context, UTC + UTCPrograms, ATL + ATALKPIs, Beneficiaries, LaborMarket, Socioemotional, UniversityEnrollment.
- **Lote 2 – Rankings Educación**: los 6 rankings (comparten patrón `ContextRankingChart`).
- **Lote 3 – Contexto Socioeconómico**: `SocioeconomicContext.tsx` (una sola página, mapear cada sección CV/ECO/POB/ML/GP/MLJ).

Verificación después de cada lote: entrar a la ruta correspondiente y validar que gráficos y rankings muestran datos y nombres de ciudades.

## ¿Empezamos con el Lote 1?