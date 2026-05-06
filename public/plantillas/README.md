# Plantillas de Archivos para Carga Modular

Este directorio contiene las plantillas Excel necesarias para cargar datos en cada módulo del sistema.

## Archivos de Plantilla Disponibles

En esta carpeta encontrarás archivos CSV de ejemplo para cada módulo. Estos archivos pueden abrirse en Excel, Google Sheets o cualquier editor de hojas de cálculo:

- `1-indicadores-estrategicos.csv` - Plantilla para indicadores estratégicos (2025)
- `3-indicadores-estrategicos-2024.xlsx` - Plantilla para indicadores estratégicos (2024)
- `11-indicadores-estrategicos-2023.xlsx` - Plantilla para indicadores estratégicos (2023)
- `2-calendario.csv` - Plantilla para eventos del calendario
- `4-financiero-inversion-social.csv` - Plantilla para inversión social
- `5-educacion.csv` - Plantilla para indicadores de educación
- `6-emprendimiento.csv` - Plantilla para indicadores de emprendimiento
- `7-desarrollo-rural.csv` - Plantilla para indicadores de desarrollo rural
- `8-especiales.csv` - Plantilla para proyectos especiales
- `9-georreferenciacion.csv` - Plantilla para ubicaciones georreferenciadas
- `10-contexto-socioeconomico.csv` - Plantilla para contexto socioeconómico

**Cómo usar las plantillas:**
1. Descarga el archivo CSV correspondiente al módulo
2. Abre el archivo en Excel o Google Sheets
3. Edita los datos según tus necesidades (mantén la estructura de columnas)
4. Guarda el archivo como Excel (.xlsx) con el nombre especificado en la sección correspondiente
5. Sube el archivo en el panel de administración

## Estructura de Archivos por Módulo

### 1. Indicadores Estratégicos (`indicadores.xlsx`)

**IMPORTANTE - Gestión Multi-Año:**
- El sistema ahora soporta datos de múltiples años (2023, 2024, 2025)
- Cada archivo de indicadores se carga específicamente para su año correspondiente
- El archivo `1-indicadores-estrategicos.csv` contiene datos del año **2025**
- El archivo `3-indicadores-estrategicos-2024.xlsx` contiene datos del año **2024**
- El archivo `11-indicadores-estrategicos-2023.xlsx` contiene datos del año **2023**
- Al cargar un archivo, **solo se reemplazan los datos de ese año específico**
- Los datos de otros años permanecen intactos

Columnas requeridas:
- **Indicador** (texto): Nombre completo del indicador
- **Área** (texto): Educación, Emprendimiento, Desarrollo rural, Proyectos especiales, Estrategia, Comunicaciones, Financiero, Contexto socioeconómico, Innovación, o Cooperación
- **PALABRA CLAVE** (texto): Palabra clave corta para identificación (columna D)
- **Unidad** (texto): Porcentaje, Unidades, o Pesos
- **Logro 2023** (número, opcional): Valor alcanzado en 2023
- **Logro 2024** (número, opcional): Valor alcanzado en 2024

**📊 Mapeo específico por año:**

**Archivo 2025** (predeterminado):
- Columna F → Meta año
- Columna G → Valor acumulado  
- Columna H → % acumulado
- Columna D → PALABRA CLAVE

**Archivo 2024** (`Tablero_2024 con corte a diciembre 2024.xlsx`):
- Columna G → Meta año
- Columna H → Valor acumulado
- Columna I → % acumulado
- Columna D → PALABRA CLAVE

**Archivo 2023** (`Tablero_2023 con corte a diciembre 2023.xlsx`):
- Columna I → Meta año (Avance anual 2023)
- Columna J → Valor acumulado
- Columna K → % acumulado
- Columna B → PALABRA CLAVE

**Nota**: El archivo de 2023 tiene indicadores diferentes a 2024 y 2025, reflejando las prioridades estratégicas de ese año.

**Carga histórica no destructiva:**
- Al cargar un archivo de 2024, solo se actualizan los indicadores del año 2024
- Al cargar un archivo de 2025, solo se actualizan los indicadores del año 2025
- El sistema detecta automáticamente el año desde las columnas del archivo
- Use el selector de año en el dashboard para visualizar datos históricos

### 2. Calendario (`calendario.xlsx`)
Columnas requeridas:
- **Título** (texto): Nombre del evento
- **Descripción** (texto, opcional): Descripción detallada
- **Fecha inicio** (fecha): Fecha de inicio del evento (formato: YYYY-MM-DD)
- **Fecha fin** (fecha, opcional): Fecha de fin del evento
- **Color** (texto, opcional): Color hexadecimal (#3b82f6) - por defecto azul

### 3. Documentos (`documentos.zip`)
Archivo ZIP que contiene los documentos organizados en carpetas.
El sistema extraerá y organizará los archivos automáticamente.

### 4. Financiero - Inversión Social (`financiero.xlsx`)
Estructura del archivo (columnas de izquierda a derecha):
- **Columna A - Proyecto** (texto): Nombre del proyecto o categoría
- **Columna B - Categoría** (texto): Área del proyecto (Educación, Emprendimiento, Desarrollo rural, Proyectos especiales, etc.)
- **Columna C - Presupuesto 2025** (número): Presupuesto asignado en pesos
- **Columna D - Ejecutado** (número): Monto ejecutado en pesos
- **Columna E - Pendiente** (número): Monto pendiente en pesos
- **Columna F - % Ejecución** (número): Porcentaje de ejecución (0-100)
- **Columna G - Es Padre** (texto): "Sí" o "No" - indica si es categoría padre
- **Columna H - Categoría Padre** (texto, opcional): Nombre de la categoría padre si es un subproyecto

**IMPORTANTE**: El archivo debe tener exactamente esta estructura de columnas. No incluir headers adicionales o filas de título.

### 5-8. Módulos por Área (`educacion.xlsx`, `emprendimiento.xlsx`, `desarrollo_rural.xlsx`, `especiales.xlsx`)
Misma estructura que Indicadores Estratégicos, pero se filtran automáticamente por área.

### 9. Georreferenciación (`georreferenciacion.xlsx`)
Columnas requeridas:
- **Nombre** (texto): Nombre de la ubicación
- **Descripción** (texto, opcional): Descripción del punto
- **Latitud** (número): Coordenada latitud (ej: 5.0689)
- **Longitud** (número): Coordenada longitud (ej: -75.5174)
- **Categoría** (texto, opcional): Tipo de ubicación
- **Icono** (texto, opcional): Nombre del icono a usar

### 10. Contexto Socioeconómico (`contexto.xlsx`)
Misma estructura que Indicadores Estratégicos.

## Notas Importantes

1. **Formato de fechas**: Use formato YYYY-MM-DD (ej: 2025-12-31)
2. **Números**: Use punto como separador decimal (ej: 1234.56)
3. **Textos con tildes**: Asegúrese de guardar el Excel en formato UTF-8
4. **Columnas opcionales**: Pueden dejarse vacías si no aplican
5. **Primera fila**: Debe contener los nombres de columnas exactos
6. **Filas vacías**: Se ignoran automáticamente

## Ejemplo de Datos

Los archivos CSV de plantilla en esta carpeta contienen ejemplos completos de datos para cada módulo. Simplemente ábrelos y modifica los datos según tus necesidades manteniendo la estructura de columnas.
