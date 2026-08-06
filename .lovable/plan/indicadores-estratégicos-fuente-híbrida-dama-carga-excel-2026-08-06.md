# Indicadores estratégicos: fuente híbrida (DAMA + carga Excel)

## Diagnóstico

Los indicadores estratégicos **no se actualizan con la sincronización de Google Drive**. Hoy dependen 100% de la carga manual de Excel en `/admin`:

- La página consulta la tabla interna `strategic_indicators`, que solo se llena con el archivo de indicadores subido manualmente.
- Esa tabla tiene 12 registros de 2025 (última modificación: 7 de enero de 2026) y 6 de 2024. No hay 2026.
- El selector de año de la página está fijo en 2023 / 2024 / 2025 y arranca en "2025" por defecto.
- El catálogo sincronizado desde Drive (`bd_catalogo_indicadores`, 63 indicadores) solo cubre las dimensiones *Educación*, *Contexto socioeconómico* y *Gestión de proyectos*. No existe una dimensión "Estrategia", por lo que la meta anual, el acumulado y el % de cumplimiento no están en DAMA.

## Enfoque acordado: híbrido

Los indicadores cuyo valor real ya existe en DAMA se leen de la sincronización de Drive; el resto (metas, avances cualitativos, cooperación, comunicaciones) siguen viniendo del Excel.

### Indicadores que pasan a leerse de DAMA

| Indicador estratégico | Código DAMA | Cálculo |
|---|---|---|
| % de estudiantes de primero que alcanzan el estándar de lectura | `ATAL_02` | Manizales (17001), `categoria = 'Total'`, `categoria_2 = 'Primero'`, último año |
| % de jóvenes egresados vinculados al mundo productivo y/o estudiando | `MLJ_02` | Manizales (17001), último año, con la misma agregación de categorías que ya usa Mercado Laboral en Educación |
| # de personas impactadas a través del spin off | `GP_02` | Suma de beneficiarios del último año, con el mismo filtro de categorías que ya usa la gráfica de participantes |

La meta anual (`annual_goal`) sigue viniendo del Excel; el valor acumulado y el % de cumplimiento se recalculan con el dato de DAMA (`valor / meta`), de modo que se actualizan solos con cada sincronización.

### Indicadores que siguen por carga Excel

GEIAL, Emprendimiento colegios, Empresas silver aceleradas, Matriculados formación, Nuevos aliados, Avance Plan Silver, Alianza universidades, Recursos cooperación e Incremento cubrimiento educación. No existen en DAMA.

### Año dinámico

- El selector de año deja de estar codificado: se construye con los años presentes en `strategic_indicators` más el último año disponible en DAMA.
- El año seleccionado por defecto pasa a ser el más reciente disponible (hoy 2025; cuando exista 2026 lo tomará automáticamente).

## Detalle técnico

1. Nuevo hook `src/hooks/useStrategicDamaOverrides.ts`: consulta `datos_maestros` con el cliente `ecosistema` para `ATAL_02`, `MLJ_02` y `GP_02`, devuelve `{ valor, anio }` por *keyword* estratégica y reutiliza la lógica de agregación existente en `EducationLaborMarket` / `EducationBeneficiaries` para no duplicar reglas de negocio.
2. `src/pages/StrategicIndicators.tsx`:
   - fusiona los resultados de `strategic_indicators` con los overrides de DAMA por `keyword` (DAMA gana cuando hay dato del año seleccionado);
   - recalcula `accumulated_value` y `accumulated_percentage` para esos tres indicadores;
   - reemplaza el `Select` de años fijos por una lista derivada de los datos y selecciona el año máximo por defecto;
   - muestra una nota breve indicando qué tarjetas provienen de la sincronización de Drive.
3. Sin cambios de base de datos ni de la edge function `bd-fundata-sync`.

## Fuera de alcance

- No se modifican los uploads de Excel ni el resto de módulos.
- No se cargan datos 2026: cuando subas el archivo 2026 al administrador, el año aparecerá y se seleccionará automáticamente.
