# Extender el kit visual institucional a todo Mi Junta

## Objetivo
Aplicar el kit de la página 15 del manual (crema #EFEAE1, café #623E19, coral #FF7C80, lima #8EBC22, turquesa #009EAE, naranja #FBB03F; Montserrat; estética editorial) a **todo el sitio Mi Junta**, unificándolo con Datos Abiertos.

## Alcance
- **Solo visual**: no se tocan datos, consultas, filtros, lógica, rutas ni autenticación.
- Datos Abiertos ya usa el kit; se conservan sus estilos `.datos-abiertos` tal cual.
- Los colores de las gráficas NO cambian: Manizales en rojo Luker, escala de progreso rojo→teal, formato MM y % se mantienen.

## Cambios

### 1. Tokens globales (`src/index.css`, bloque `:root`)
Reemplazar la paleta base por la del kit:
- `--background` → crema #EFEAE1; `--foreground` → café #623E19.
- `--primary` → café; `--secondary` → lima; `--accent` → naranja; `--ring` → turquesa.
- `--border` e `--input` → café al ~16-20% de opacidad.
- Sombras de tarjeta: marrón suave (~34% opacidad según el kit, atenuada para fondos claros).
- Gradientes heredados (`--gradient-soft`, `--gradient-accent`, `--dashboard-bg`) → tonos crema/superficie limpia del kit, sin degradados genéricos.
- Tokens del sidebar acordes (fondo crema, texto café, acento coral).
- Añadir los colores del kit como tokens reutilizables (coral, lima, turquesa, naranja, café) para uso en componentes.
- Modo `.dark` se actualiza en coherencia (el sitio es claro; se deja funcional).

### 2. Encabezados y navegación
- `PageHeader.tsx`: encabezados grandes y bold (Montserrat 800), estilo editorial con "kicker" en mayúsculas, separadores finos café.
- Nav/tabs activos: cada módulo usa su color acento del kit con texto crema (coral para Inicio, lima, turquesa, naranja…), replicando el patrón ya probado en Datos Abiertos.

### 3. Tarjetas y superficies
- `Card` y paneles: fondo superficie cálida (#FDFBF7 aprox), borde café sutil, esquinas 0.75rem (sin cambio), sombra marrón suave, hover con el acento de la sección.
- Estados activos de tabs/botones con fondo café → texto crema (evitar el bug de texto café sobre café ya corregido en Contexto Socioeconómico).

### 4. Revisión de contraste sección por sección
Páginas: Index, StrategicIndicators, Financial, Education, Entrepreneurship, RuralDevelopment, SocioeconomicContext, SpecialProjects, Documents, Calendar, Admin (más `Map.tsx`).
- Cualquier texto café sobre fondo café o crema sobre crema se ajusta (texto crema sobre café, café sobre crema).
- Superposiciones heredadas de `bg-gradient-to-*` se neutralizan igual que en `.datos-abiertos` (`background-image: none` sobre superficie del kit).
- Gráficas: solo se ajustan los colores de contenedores/ejes/leyendas para leerse sobre crema; los datos y su codificación de color no se tocan.

## Fuera de alcance
- No se modifica `DatosAbiertos.tsx` ni las clases `da-*` existentes.
- No se cambian componentes de visualización, cálculos, consultas ni fuentes de datos.
- No se toca AccessGate, rutas, dominios ni lógica de acceso.

## Validación
1. Compilación sin errores (log de build) y consola limpia.
2. Capturas Playwright escritorio + móvil de: Inicio, Indicadores Estratégicos, Financiero, Educación, Documentos y Admin.
3. Comparar antes/después en Mi Junta para confirmar que solo cambió el estilo y que todas las gráficas siguen legibles.
4. Confirmar que `/datosabiertos` se ve exactamente igual que antes del cambio.
