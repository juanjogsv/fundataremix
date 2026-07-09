
# Plan: Migración de fuente de datos a Google Drive

## Objetivo

Reemplazar la lectura desde el proyecto Supabase "Ecosistema" por lectura desde Google Drive (`bd_fundata/`), respetando el protocolo `TEC_PROTOCOLO-BD-002`. Usaremos una **edge function con caché** para mantener latencia baja y reducir consumo de cuota Google.

## Arquitectura

```text
Google Drive (bd_fundata)                Lovable Cloud
├── data/AAAAMMDD_datos_fundata.xlsx  ─┐
├── catalogo/                          │      ┌─────────────────────┐
│   ├── catalogo_indicadores (Sheet) ──┼───►  │  Edge Function      │
│   └── catalogo_entidades   (Sheet) ──┘      │  bd-fundata-sync    │
└── manuales/                                 │                     │
                                              │  1. Lee último xlsx │
                                              │  2. Lee ambos Sheets│
                                              │  3. Escribe caché   │
                                              └─────────┬───────────┘
                                                        │
                                              ┌─────────▼───────────┐
                                              │  Tabla caché (Cloud)│
                                              │  bd_datos_cache     │
                                              │  bd_catalogo_ind    │
                                              │  bd_catalogo_ent    │
                                              │  bd_sync_meta       │
                                              └─────────┬───────────┘
                                                        │
                                              ┌─────────▼───────────┐
                                              │  Frontend React     │
                                              │  (mismos componentes│
                                              │  ya migrados)       │
                                              └─────────────────────┘
```

**Ventajas de este enfoque**
- Frontend cambia poco: los componentes ya normalizados a `datos_maestros` / `catalogo_*` solo cambian el cliente Supabase de destino (del "Ecosistema" externo al Cloud interno de este proyecto).
- Cuota Google se consume 1 vez por sync (no por usuario).
- Compatible con RLS y filtros SQL server-side (`.eq('cod_indicador', ...)`).
- Cumple con el rol **Data Operator** del protocolo: n8n queda opcional; esta edge function replica su rol.

## Credenciales necesarias

Ya tengo del protocolo y de tu respuesta:

| Dato | Valor | Sensible |
|---|---|---|
| Folder ID `bd_fundata` | `1I5UDNXx75HP5sdYYwE6xL_ivi-wivNKl` | No |
| Spreadsheet ID `catalogo_indicadores` | `1BxMNkQByvuGFFNcKMUHddh--9lD4mIg26DcfLUd89VQ` | No |
| Spreadsheet ID `catalogo_entidades` | `116kMxwBo3m3mtEoPyQ2AQiL8tkxM_A_SHBeCIdkLZhU` | No |

**Lo que necesito de ti durante la implementación:**

1. Autorizar los conectores de Lovable **Google Drive** y **Google Sheets** con la cuenta institucional del Equipo META. Yo lanzo el diálogo de conexión — tú solo haces click en "Continuar con Google" y eliges la cuenta. **No hay que pegar API keys ni service account JSONs.** Lovable custodia el refresh token cifrado.
2. Confirmar que esa cuenta tiene permiso de **lectura** sobre la carpeta `bd_fundata/` (y sobre ambos Sheets del catálogo).

No necesito: contraseñas, service account keys, JSON de GCP, ni acceso a la Google Cloud Console. El OAuth managed de Lovable ya gestiona el proyecto GCP subyacente.

## Pasos

### 1. Conectar Google Drive y Google Sheets
- Llamar `standard_connectors--connect` para `google_drive` y `google_sheets` (dos diálogos separados que autorizas con la cuenta institucional).
- Verificar con una llamada de prueba al gateway que puedo listar `bd_fundata/data/` y leer los headers de ambos Sheets.

### 2. Crear tablas de caché en Lovable Cloud (backend interno)
Migración SQL que crea 4 tablas espejando la estructura del Ecosistema:

- `bd_datos_cache` — mismos campos que `datos_maestros`: `cod_indicador`, `categoria`, `categoria_2`, `cod_entidad`, `fecha_actualizacion`, `valor`, `anio`.
- `bd_catalogo_indicadores` — espejo de `catalogo_indicadores`.
- `bd_catalogo_entidades` — espejo de `catalogo_entidades`.
- `bd_sync_meta` — 1 fila con: `last_file_name`, `last_file_id`, `last_sync_at`, `rows_ingested`, `status`, `error_message`.

Con RLS: lectura pública (o `authenticated`), escritura solo `service_role`. GRANTs completos.

### 3. Edge function `bd-fundata-sync`

Responsable de replicar el pipeline n8n descrito en el protocolo (§5.2):

1. Lista `bd_fundata/data/` filtrando por regex `^[0-9]{8}_datos_fundata\.xlsx$`, ordena descendente, toma el más reciente.
2. Compara `id` con `bd_sync_meta.last_file_id`; si es el mismo, sale con `no-op`.
3. Descarga el binario del xlsx, lo parsea con `xlsx` (npm), valida cabeceras contra el contrato (snake_case: `cod_indicador`, `categoria`, `categoria_2`, `cod_entidad`, `fecha_actualizacion`, `valor`, `anio`).
4. Lee ambos Google Sheets (`values.batchGet`) de la carpeta `catalogo/`.
5. **Validación referencial (§6 del protocolo)**: verifica que todo `cod_indicador` y `cod_entidad` en el lote exista en los catálogos. Si no, aborta con `ROLLBACK` lógico (no toca `bd_datos_cache`) y registra el error en `bd_sync_meta`.
6. Si valida: `TRUNCATE + INSERT` transaccional en las 3 tablas espejo (bulk insert por lotes de 1000).
7. Devuelve JSON con contadores y timestamp.

Endpoints:
- `POST /bd-fundata-sync` — dispara sync manual (protegido por `verify_jwt`, solo admins).
- `GET /bd-fundata-status` — devuelve `bd_sync_meta` para mostrar en el panel Admin.

### 4. Programación (opcional, fase 2)
Cron diario a las 06:00 vía `pg_cron` que invoca la edge function. Fase 1 = sync manual desde Admin.

### 5. Panel Admin
Agregar sección "Sincronización BDM Fundata" en `/admin`:
- Botón "Sincronizar ahora".
- Muestra `last_file_name`, `last_sync_at`, `rows_ingested`, `status`.
- Si hubo error, muestra `error_message` y códigos huérfanos (§6).

### 6. Repuntar el frontend
- `src/integrations/ecosistema/client.ts` — mantener temporalmente como fallback, marcado como deprecated.
- Cambiar los ~20 componentes ya migrados (`EducationContext`, `EducationSaberOnce`, `EducationUTC`, `ContextRankingChart`, `MCVSubsection`, etc.) para leer de `supabase` (interno) apuntando a `bd_datos_cache` / `bd_catalogo_*` en vez del cliente `ecosistema`.
- Como los nombres de columnas y la semántica son idénticos, es un **find-and-replace** más un cambio de nombres de tabla. Los fixes ya aplicados (`normCat2`, `String(cod_entidad)`) se mantienen.

### 7. Verificación
- Ejecutar sync manual y confirmar `rows_ingested > 0`.
- Playwright en `/educacion` y `/contexto-socioeconomico`: los rankings deben mostrar ciudades y valores idénticos a los que hoy vienen del Ecosistema.
- Comparar spot-check: 3 KPIs de Educación y 3 de Contexto contra el xlsx del día.

## Fuera de alcance
- Escritura hacia Drive (el frontend nunca escribe).
- Migrar Desarrollo Rural, Emprendimiento, Proyectos Especiales, Financiero, Mapa, etc. — siguen en su fuente actual.
- Reemplazo total del pipeline n8n (esta edge function puede convivir con n8n; ambas apuntan al mismo Drive).

## Detalles técnicos

**Parseo xlsx en Deno**: `import * as XLSX from "npm:xlsx@0.18.5"`.

**Llamadas a Google via gateway** (sin manejar tokens):
- Drive: `https://connector-gateway.lovable.dev/google_drive/drive/v3/files?q='<folderId>' in parents and name contains 'datos_fundata'&orderBy=name desc`
- Sheets: `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/<id>/values/Sheet1`

**Seguridad**:
- Tokens OAuth de Google → custodiados por Lovable (`LOVABLE_API_KEY` + `GOOGLE_DRIVE_API_KEY` inyectados en la edge function; nunca en frontend).
- `bd_fundata-sync` valida rol admin del invocador antes de correr.
- Rate limiting implícito: caché evita spam a Drive.

## Rollback
Si algo falla en producción, cambiar el frontend de vuelta al cliente `ecosistema` es un revert de un commit. Las tablas `bd_*` no interfieren con nada existente.
