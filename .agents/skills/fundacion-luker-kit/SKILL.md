---
name: fundacion-luker-kit
description: Kit de diseño visual de Fundación Luker. Aplicar siempre que el usuario pida diseñar, rediseñar o crear interfaces, documentos, presentaciones o piezas visuales relacionadas con Fundación Luker, Funluker, Datos Funluker o cualquier proyecto que deba seguir su identidad de marca.
---

# Kit de Diseño Fundación Luker

Identidad visual editorial e institucional. Cálida, cercana y con propósito social; nunca corporativa fría ni genérica.

## Paleta de colores (exacta, no sustituir)

| Color | Hex | Uso |
|---|---|---|
| Crema | `#EFEAE1` | Fondo principal de todas las superficies |
| Café | `#623E19` | Texto principal, títulos, footer |
| Coral | `#FF7C80` | Acentos, íconos, estados hover, elementos destacados |
| Verde | `#8EBC22` | Color primario de acción (botones, indicadores positivos) |
| Turquesa | `#009EAE` | Acento secundario, datos, enlaces destacados |
| Naranja | `#FBB03F` | Acentos cálidos, cifras, detalles |

Reglas de color:
- Fondo siempre crema o blanco; nunca fondos oscuros como base (el café solo en secciones puntuales como footer).
- Los acentos (coral, verde, turquesa, naranja) se rotan entre elementos repetidos (tarjetas, íconos) para dar variedad vibrante.
- Prohibido: morados, índigos, azules corporativos y gradientes genéricos fuera de esta paleta.
- En CSS usar formato oklch; referencia de conversión ya validada: crema `oklch(0.9385 0.0132 82.4)`, café `oklch(0.3983 0.0718 63.67)`, coral `oklch(0.7387 0.1598 19.89)`, verde `oklch(0.7358 0.177 125.92)`, turquesa `oklch(0.6393 0.1097 207.45)`, naranja `oklch(0.8103 0.1505 73.15)`.

## Tipografía

- Montserrat en todo: títulos y cuerpo. Cargarla como webfont (Google Fonts) con pesos 400, 500, 600, 700, 800.
- Títulos grandes y con peso 700–800; cifras de impacto en tamaño display (text-5xl en adelante).
- Prohibido usar Inter, Poppins, serif o cualquier otra fuente.

## Estilo visual

- Estética editorial/institucional: composiciones asimétricas, mucho aire, jerarquía clara.
- Textura tipográfica de fondo: una letra "L" gigante en crema/café a muy baja opacidad como marca de agua en el hero.
- Fotografías recortadas (sin fondo, transparent background) de personas reales del contexto latinoamericano: educadores, comunidades, territorio. Nunca ilustraciones genéricas de stock ni renders 3D.
- Ilustraciones de apoyo en estilo lineal (stroke) con los colores del kit, no abstractas: escenas figurativas de territorio, aprendizaje o datos cuando se pidan.
- Tarjetas blancas sobre crema, bordes redondeados generosos (radius 0.625rem base), sombras suaves en café: `0 16px 40px -24px color-mix(in oklab, var(--luker-brown) 34%, transparent)`.
- En directorios de módulos, usar una cuadrícula uniforme: 5 columnas amplias, 2 medianas y 1 móvil. No combinar tarjetas de doble ancho si generan huecos o filas incompletas.
- Mantener altura, alineación y área táctil consistentes; permitir que títulos largos envuelvan sin cortarse ni desplazar la cuadrícula.
- En estados `hover`, foco y pulsación, conservar el texto café: aplicar el acento como fondo suave (aprox. 16–24%), borde o indicador lateral. No rellenar todo el control con un acento si compromete contraste.
- Hacer equivalentes `hover` y `focus-visible`, añadir un foco perceptible y respetar `prefers-reduced-motion`.
- En pestañas activas, usar superficie clara y subrayado del acento; nunca fondo y texto del mismo tono.
- Todos los cuadros, barras y campos destinados a filtrar datos usan fondo blanco sólido, incluidos selectores y sus menús desplegables. Mantener borde café suave, texto café y foco turquesa; no usar crema ni acentos sólidos como fondo del filtro.
- Franja cromática inferior (coral, verde, turquesa, naranja) como cierre de página.
- Footer en café con texto crema.

## Tarjetas de módulos (referencia visual)

- Cada módulo es una tarjeta independiente blanca sobre fondo crema, con borde fino café de baja opacidad, radio `0.625rem` y sombra café muy suave. No unir las tarjetas en una tabla ni compartir bordes entre ellas.
- Usar una composición vertical editorial: ícono lineal arriba a la izquierda, flecha diagonal pequeña arriba a la derecha, título y descripción en el centro, divisor fino antes de la acción y CTA en mayúsculas abajo a la izquierda.
- Mostrar el número del módulo como marca de agua grande, parcialmente recortada en la esquina inferior derecha y con opacidad muy baja. Mantenerlo detrás del contenido para que nunca compita con el CTA.
- Presentar el ícono sin círculo, pastilla ni fondo sólido: solo trazo lineal en el acento de la tarjeta. Mantener la flecha y el CTA en café.
- Rotar el acento en el orden coral → verde → turquesa → naranja. Aplicarlo al ícono y a detalles discretos, nunca como relleno total de la tarjeta.
- Mantener mucho aire interior, alineación izquierda y una altura mínima estable. Permitir que los títulos largos envuelvan sin desplazar el divisor o el CTA.
- En `hover` y `focus-visible`, elevar la tarjeta sutilmente y aplicar el acento como borde, indicador o fondo de baja intensidad. Conservar título, descripción, flecha y CTA en café.
- Usar una cuadrícula uniforme con separación visible: 5 columnas amplias, 2 medianas y 1 móvil. Todas las tarjetas conservan la misma altura y área táctil.
- Aplicar `animate-fade-in` con retardo escalonado de 80 ms y `animation-fill-mode: both`; respetar `prefers-reduced-motion`.
- Superponer controles administrativos sobre la tarjeta sin alterar su composición base.

## Estructura de página preferida

Landing/directorio: hero asimétrico con textura tipográfica → sección de tarjetas/módulos → bloque de cifras de impacto → footer institucional con franja cromática.

## Tono

Cálido, humano, orientado a educación, datos y transformación social. Español por defecto.

## Tokens CSS de referencia (Tailwind v4)

```css
@theme inline {
  --font-sans: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  --color-luker-cream: var(--luker-cream);
  --color-luker-brown: var(--luker-brown);
  --color-luker-coral: var(--luker-coral);
  --color-luker-green: var(--luker-green);
  --color-luker-orange: var(--luker-orange);
  --color-luker-teal: var(--luker-teal);
}

:root {
  --luker-cream: oklch(0.9385 0.0132 82.4);
  --luker-brown: oklch(0.3983 0.0718 63.67);
  --luker-coral: oklch(0.7387 0.1598 19.89);
  --luker-green: oklch(0.7358 0.177 125.92);
  --luker-teal: oklch(0.6393 0.1097 207.45);
  --luker-orange: oklch(0.8103 0.1505 73.15);
  --background: var(--luker-cream);
  --foreground: var(--luker-brown);
  --primary: var(--luker-green);
  --primary-foreground: var(--luker-brown);
  --accent: var(--luker-teal);
}
```

## Animaciones (siempre las mismas)

Animaciones suaves y discretas, acordes al tono institucional. Usar las utilidades estándar del proyecto (`animate-fade-in`, `animate-scale-in`, `hover-scale`, `story-link`), nunca animaciones bruscas, rebotes exagerados ni efectos tipo parallax pesado.

- **Entrada de secciones y tarjetas:** `animate-fade-in` (suben 10px y aparecen, 0.3s). Aplicar con retardo escalonado en listas de tarjetas: `style={{ animationDelay: `${i * 80}ms` }}` y `animation-fill-mode: both`.
- **Hero:** título y texto con `animate-fade-in`, la imagen recortada con `animate-scale-in` (0.2s, leve).
- **Tarjetas e imágenes interactivas:** `hover-scale` (escala 1.05 al pasar el cursor, 200ms).
- **Enlaces de navegación y texto:** `story-link` (subrayado animado en el color primario verde).
- **Modales y diálogos:** entrada con `animate-scale-in`, salida con `animate-fade-out`.
- **Indicadores de estado o carga:** `pulse` suave, nunca spinners agresivos sin marca.
- Duraciones cortas (200–300ms), easing `ease-out`. Prohibido: animaciones infinitas decorativas, rotaciones, gradientes animados.

## Imágenes e ilustraciones (reglas de uso)

- **Hero:** siempre una fotografía recortada con fondo transparente (PNG) de personas reales del contexto latinoamericano (educadores, jóvenes, comunidades, trabajadores del campo), en composición asimétrica junto al título. Generar con fondo transparente, nunca fotos con marco rectangular ni stock genérico.
- **Fotografías:** tonos cálidos y naturales, luz de día, coherencia con la paleta del kit. Evitar imágenes frías, azuladas o corporativas.
- **Ilustraciones de apoyo:** estilo lineal (stroke) con los colores del kit, figurativas y concretas (territorio, aprendizaje, personas con datos). No usar ilustraciones abstractas salvo que el usuario las pida explícitamente.
- **Cifras de impacto:** números grandes en Montserrat 700–800 con los colores de acento del kit rotados (coral, verde, turquesa, naranja).
- **Iconos:** estilo lineal simple, en los colores del kit, sin librerías de íconos con estilo corporativo ajeno a la marca.
- **Favicon y logo:** usar siempre el logo de Fundación Luker.
