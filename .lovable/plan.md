## Diagnóstico: por qué solo se ingieren 53.722 de ~108.852 filas

El archivo tiene ~108.852 filas normalizadas, pero en modo permissive solo se cargan **53.722**. La diferencia (~55.000) son filas cuyos `cod_entidad` (y/o `cod_indicador`) **no existen en los catálogos maestros**. Aunque el resumen del panel solo muestra 20 códigos por brevedad, en realidad hay **93 entidades huérfanas** (según el último log). Cada huérfano puede aparecer en cientos o miles de filas, por eso se pierde tanto volumen.

Para poder arreglarlo necesitas ver **todos** los códigos huérfanos y **cuántas filas** representa cada uno, así sabes cuáles agregar al catálogo primero (mayor impacto).

## Qué construir

### 1. Ampliar el edge function `bd-fundata-sync`
Guardar en `bd_sync_meta` (o en un nuevo campo JSON `diagnostics`) el detalle completo:

- Lista completa de `cod_indicador` huérfanos con conteo de filas.
- Lista completa de `cod_entidad` huérfanos con conteo de filas.
- Total de filas en el archivo, filas filtradas, filas ingeridas.
- Top 20 huérfanos por impacto (filas descartadas).

Actualmente `error_message` es texto truncado a 20 códigos y sin conteo — hay que reemplazarlo por un JSON estructurado.

### 2. Migración: agregar columna `diagnostics jsonb` en `bd_sync_meta`

```sql
ALTER TABLE public.bd_sync_meta ADD COLUMN diagnostics jsonb;
```

### 3. Ampliar `BdFundataSyncPanel.tsx` con una sección "Detalle de problemas"

Nueva tarjeta colapsable debajo del estado que muestra:

- **Resumen numérico**: filas en archivo · ingeridas · descartadas · % pérdida.
- **Tabla de entidades huérfanas** (ordenada por filas descartadas desc):
  - `cod_entidad` | filas descartadas | acción
  - Botón "Copiar códigos" para pegarlos en el Google Sheet del catálogo.
- **Tabla de indicadores huérfanos** con el mismo formato.
- **Botón "Descargar CSV de huérfanos"** para trabajar offline.

### 4. Flujo de corrección sugerido al usuario

1. Ejecutar sync permissive (ya funciona).
2. Abrir la sección "Detalle de problemas".
3. Copiar los `cod_entidad` huérfanos con más filas.
4. Agregarlos al `catalogo_entidades` en Drive con su nombre correspondiente.
5. Repetir el sync — cada iteración recupera más filas hasta llegar al 100%.

## Detalles técnicos

- El conteo se hace en memoria durante el paso de normalización (paso 6 del edge function). Ya recorremos cada fila; solo hay que sumar en dos `Map<string, number>`.
- El JSON `diagnostics` se serializa entero (posiblemente varios KB por 93 entidades). Postgres jsonb lo maneja sin problema.
- Se mantiene el campo `error_message` como resumen legible para retrocompatibilidad.
- El panel usa `Collapsible` de shadcn para no saturar la vista inicial.

## Fuera de alcance

- No se auto-completa el catálogo: agregar entidades sigue siendo manual en Drive (evita duplicados y nombres incorrectos).
- No cambia la lógica de modo estricto vs. permissive.
