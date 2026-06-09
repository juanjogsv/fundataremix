## Objetivo

Migrar los módulos **Educación** y **Contexto Socioeconómico** para que lean directamente del proyecto externo "Ecosistema de Datos" (Supabase `vbyrqktymwuuzdtvjruz`), manteniendo intacta la lógica de visualización actual. Los demás módulos (Rural, Emprendimiento, Financiero, Estratégicos, Calendario, Documentos, Biblioteca, Mapa, Participantes, Especiales) **no se tocan** y siguen con su upload de archivos.

## Estrategia: Adaptador con forma legacy

Para no reescribir ~20 componentes que ya leen de `education_indicators` y `mcv_indicators`, creamos una **capa de adaptación** que consulta el proyecto externo y devuelve filas con exactamente el mismo shape que las tablas legacy. Los componentes solo cambian la fuente de datos; nada de su lógica de UI, filtros, charts o exportación se modifica.

## Pasos

### 1. Cliente Supabase externo
- Crear `src/integrations/ecosistema/client.ts` con un `createClient` apuntando a `https://vbyrqktymwuuzdtvjruz.supabase.co` y la `anon key` proporcionada (publishable, va en el bundle).
- Sin `persistSession` ni storage (es solo lectura pública).
- **No** se modifica el cliente Cloud existente (`src/integrations/supabase/client.ts`).

### 2. Capa de adaptación
Crear `src/integrations/ecosistema/adapter.ts` que exponga dos funciones:

- `fetchEducationIndicators(filters)` → devuelve filas con shape de `education_indicators` (`seccion`, `indicador`, `descripcion`, `valor`, `unidad`, `departamento`, `municipio`, `year`, `categoria`, `categoria_2`).
- `fetchMcvIndicators(filters)` → devuelve filas con shape de `mcv_indicators` (`base`, `seccion`, `cod_indicador`, `indicador`, `categoria`, `cod_entidad`, `entidad`, `dato`, `year`, `periodicidad`, `fuente`, `unidad_medida`).

Internamente el adaptador:
1. Carga `catalogo_indicadores` y `catalogo_entidades` una sola vez (cache en módulo con `Map<cod, row>`).
2. Consulta `datos_maestros` filtrado por `cod_indicador IN (...)` según el indicador requerido.
3. Hace el join en memoria y aplica la misma lógica de `sync_legacy_from_dama`:
   - **Departamento/Municipio**: `length(cod_entidad) ≤ 2` → departamento; `= 5` → municipio (el departamento es el padre, primeros 2 dígitos).
   - **Sección socioeconómica**: misma rama CASE por prefijo (POB_→Demografía, CV_01..03→Pobreza, CV_04/05→Salud, ML_*/MLJ_*→Mercado laboral comparativo, ECO_*→Competitividad).
   - **Categoría 2**: normalización `"escuela activa urbana"` → `"Escuela Activa"`.

### 3. Hook unificado (opcional pero recomendado)
`src/hooks/useEcosistemaIndicators.ts` que envuelve el adaptador con React Query para cache y loading states consistentes.

### 4. Migración por componente
Reemplazar **solo la línea del query** en cada componente. La lógica de transformación, useMemo, charts y filtros permanece igual.

**Educación** (`src/components/education/`):
- EducationSaberOnce, EducationUTC, EducationUTCPrograms, EducationUniversityEnrollment, EducationATAL, EducationATL, EducationBeneficiaries, EducationContext, EducationDesertionRanking, EducationLaborMarket, EducationMediaRanking, EducationPreschoolRanking, EducationPrimaryRanking, EducationSecondaryRanking, EducationSocioemotional, EducationTransitRanking, EducationATALKPIs, ContextRankingChart.

**Socioeconómico** (`src/pages/SocioeconomicContext.tsx` y subcomponentes MCV en `src/components/mcv/`).

Cambio típico:
```ts
// antes
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from("education_indicators").select(...).eq("indicador", "...");

// después
import { fetchEducationIndicators } from "@/integrations/ecosistema/adapter";
const data = await fetchEducationIndicators({ indicador: "..." });
```

### 5. Desactivar uploads obsoletos
- En la pantalla de **Admin**, marcar como "deprecado / gestionado en Ecosistema de Datos" los uploaders de Educación y Socioeconómico (UploadDamaData, UploadATALData, UploadMCVData). No eliminar todavía — quedan accesibles por si hay rollback.
- Las tablas internas (`dama_data`, `dama_catalog`, `dama_entities`, `education_indicators`, `mcv_indicators`) **no se eliminan** en esta fase; quedan como respaldo.

### 6. Validación
- Comparar visualmente página por página (Educación → cada subsección, Socioeconómico → cada tarjeta) que los valores y años coinciden con el estado actual.
- Verificar el filtro "último año disponible por defecto" sigue funcionando con los datos del proyecto externo.
- Probar que el botón de exportación de charts sigue funcionando (no toca el origen de datos).

## Detalles técnicos

- **Sin service_role**: confirmado, no se necesita. Las 3 tablas externas deben tener RLS con `SELECT` para `anon` (si no responden, te aviso para que ajustes la policy).
- **Cache de catálogo**: el adaptador carga `catalogo_indicadores` y `catalogo_entidades` una sola vez por sesión (~cientos de filas, trivial).
- **Categoría 2 en `datos_maestros`**: el adaptador asume que existe ese campo. Si no, los componentes que lo usan (Saber 11 Escuela Activa, UTC por categoría_2) mostrarán solo "Total". Lo verificamos en el primer commit.
- **Límite de 1000 filas de PostgREST**: para queries grandes (Saber Once histórico) el adaptador paginará automáticamente con `.range()` hasta agotar resultados, igual que ya hace el componente comparativo.
- **Tipos TypeScript**: como el cliente externo no tiene `Database` generado, se tipa con `createClient<any>` y los tipos viven en el adaptador.

## Fuera de alcance

- Rural, Emprendimiento, Financiero, Estratégicos, Inversión Social, Calendario, Documentos, Biblioteca, Mapa, Participantes, Proyectos Especiales: sin cambios.
- Eliminación de tablas legacy o desactivación de funciones internas: fase posterior una vez validada la migración.
- Sincronización bidireccional o escritura al proyecto externo.

## Entregable de la primera iteración

1. Cliente y adaptador funcionando.
2. Un componente piloto migrado (sugiero **EducationSaberOnce** porque es el más complejo: si funciona ahí, el resto es mecánico).
3. Validación visual contra los datos actuales.
4. Una vez aprobado el piloto, migrar el resto en lote.

¿Procedo así, o prefieres migrar todo de una?