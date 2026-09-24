---
name: fundacion-luker-kit
description: Use when creating, redesigning or extending any page, screen, component, landing, dashboard or directory for Fundación Luker, Funluker, Datos Funluker, META-FL or its programs. Úsala al crear o modificar interfaces, navegación, layouts, hero, banners, tarjetas, botones, filtros, tablas, formularios, animaciones o estados de UI para que todas las páginas compartan el mismo diseño y UX según el kit oficial de marca. Not for backend-only work (DB, RLS, edge functions) nor for documents, PDFs or slides.
---

# Kit de Diseño y UX · Fundación Luker

Objetivo: que cualquier página nueva sea indistinguible en diseño, navegación, animación y comportamiento de las existentes, y fiel al kit oficial de marca. Estética institucional, cálida, cercana e inclusiva, orientada a educación y desarrollo comunitario.

## Flujo obligatorio (seguir en orden)

1. **Revisar lo que ya existe.** Buscar el CSS global, el layout/shell, header, footer y `components/`. Si existen, REUTILIZARLOS; no crear variantes paralelas.
2. **Instalar la base si falta.** Copiar íntegro `references/tokens.css` al CSS global. No redefinir colores, radios ni animaciones en componentes sueltos.
3. **Verificar recursos de marca** (ver "Recursos"). Si falta alguno, usar el respaldo indicado y avisarlo al final; nunca dibujar ni recrear logo, números o textura.
4. **Montar la página dentro del `AppShell`** (header + `<main>` + footer). Ver `references/layout-navegacion.md`.
5. **Construir con los componentes del kit.** Ver `references/componentes.md`.
6. **Pasar la checklist** de `references/checklist-ux.md` e informar qué no se pudo verificar.

## Color

| Token | Hex | Rol |
|---|---|---|
| `--luker-cream` | `#EFEAE1` | Fondo general, superficies neutras, estado deshabilitado |
| `--luker-brown` | `#623E19` | Texto, títulos, footer, botón primario por defecto |
| `--luker-coral` | `#FF7C80` | Acento · fondo plano de banners |
| `--luker-green` | `#8EBC22` | Acento · estados "activo"/positivos |
| `--luker-teal` | `#009EAE` | Acento · información, datos, foco |
| `--luker-orange` | `#FBB03F` | Acento · alertas, cifras, detalles |

- **Superficies:** página en crema o blanco; tarjetas, filtros, tablas y modales en blanco.
- **Gráficas (regla obligatoria):** toda gráfica va encuadrada en una tarjeta de **blanco sólido `#FFFFFF`**, nunca translúcida ni con el crema de fondo. Prohibido `bg-card/90`, `bg-card/50`, `backdrop-filter`/blur y gradientes en el lienzo. Marco: borde `1px solid` café al 14–16 %, radio `0.625rem` y sombra de reposo `0 2px 8px -2px` café al 8 %. El encabezado y el contenido interno de la tarjeta quedan transparentes sobre ese blanco.
- **Línea de pestaña activa por sección (regla obligatoria):** la pestaña activa es **blanca con subrayado interior de 3 px** en el color temático de su sección, nunca un relleno sólido de acento ni un turquesa por defecto en todas. Cada sección declara su acento (`data-accent`) y la pestaña lo hereda: Educación coral, Emprendimiento naranja, Desarrollo Rural verde, Proyectos Especiales turquesa, Contexto Socioeconómico café. El texto siempre en café sobre el blanco.
- **Ancho de página elástico:** el contenido no se encierra en una columna central estrecha. Usa ancho completo con márgenes de seguridad `1.25rem` en móvil, `2.5rem` desde tableta y `3rem` desde escritorio, con tope de `1920px`. Prohibido `max-w-7xl` centrado como contenedor de secciones de datos.
- **Favicon:** el ícono del sitio es el árbol de marca en PNG cuadrado de 512 px con fondo transparente o blanco, nítido y sin recortes. Se declara en `index.html` y se mantiene idéntico en todas las variantes del sitio, incluida la versión pública de Datos Abiertos; el título de la pestaña sí cambia por dominio o ruta. Nunca recrear ni redibujar el árbol.
- **Fondos planos de color** (coral, verde, turquesa, naranja, café) SOLO en hero, banners y bloques destacados, siempre con la textura de letras y/o foto recortada. Nunca gradientes.
- **Rotación de acentos** en elementos repetidos: coral → verde → turquesa → naranja (`i % 4`).
- Prohibido: morados, índigos, azules corporativos, grises fríos, gradientes, modo oscuro.

### Contraste (obligatorio, WCAG AA)
| Combinación | Ratio | Uso permitido |
|---|---|---|
| Café sobre crema / blanco | 7.9 / 9.5 | Todo texto |
| Blanco sobre café | 9.5 | Todo texto |
| Café sobre naranja | 5.1 | Todo texto |
| Café sobre verde | 4.2 | Solo texto grande (≥ 24 px, o ≥ 18.7 px en negrita) |
| Café sobre coral | 3.8 | Solo texto grande |
| Blanco sobre turquesa | 3.2 | Solo texto grande |
| Blanco sobre coral / verde / naranja | 2.5 / 2.2 / 1.8 | Nunca para texto |
| Acentos como texto sobre blanco/crema | 1.8–3.2 | Nunca para texto de lectura |

**Regla de forma y texto (obligatoria):** ninguna ilustración, ícono, forma, insignia, pestaña activa o fondo puede tener el mismo color que el texto o glifo que lleva encima. Si la forma es café (color del texto), su contenido va en blanco. Revisar especialmente los acentos café en rotaciones, encabezados y estados hover/activo.

Consecuencia práctica: los acentos se usan como fondos, bordes, íconos, barras, etiquetas grandes y resaltados suaves; el texto casi siempre es café (o blanco sobre café).

## Tipografía
- **Fuente web: Montserrat** (Google Fonts, pesos 300, 400, 500, 700, 900), equivalente web de Gotham, la tipografía impresa de marca (no hay licencia web de Gotham; no usarla ni cargarla). Correspondencia: Gotham Light → Montserrat 300, Medium → 500, Black → 900. Nunca otra fuente.
- Escala única:
  - Display / cifras: `clamp(2.5rem, 5vw, 4rem)`, Black · H1: `clamp(2rem, 4vw, 3rem)`, Black
  - H2: `1.75rem`, Medium/Bold · H3: `1.25rem`, Medium
  - Cuerpo: `1rem`/1.6, Light o Regular · Pequeño: `0.875rem`
  - Etiquetas/CTA/encabezados de sección: `0.75–0.875rem`, Medium, MAYÚSCULAS, `letter-spacing: 0.06em`
- Un solo H1 por página; jerarquía sin saltos.

## Elementos gráficos de marca
- **Franja cromática vertical:** barra de 12–16 px en el borde izquierdo de hero y banners, en 4 tramos iguales. El orden es libre, con tres condiciones: 4 colores distintos, siempre incluye el café, y nunca repite el color del fondo del bloque. Clase `.luker-stripe-v` (variables `--s1..--s4`).
- **Franja horizontal** de cierre de página: `.luker-stripe`.
- **Textura de letras:** letras y estrellas dispersas, rotadas, en tono sobre tono (blanco ~15 % sobre color, o gris muy claro sobre blanco). Solo como fondo decorativo (`aria-hidden`). Existe también en forma de **círculo de letras** detrás de la persona fotografiada.
- **Números de marca:** numerales redondeados multicolor. Usarlos como SVG en cifras de impacto destacadas; si no están los archivos, usar la tipografía display en café.

## Imágenes e ilustraciones
- **Combinación foto/gráfico** (tratamiento principal): fotografía recortada sin fondo (PNG/WebP transparente) de personas reales de contexto latinoamericano (niñez, jóvenes estudiantes, egresados, docentes), sobre fondo plano de color + círculo de letras detrás + franja vertical a la izquierda. La persona se ancla al borde inferior del bloque.
- Fotos cálidas, naturales, luz de día, expresiones alegres. Nunca stock genérico con fondo, renders 3D ni tonos fríos.
- **Ilustraciones:** editoriales vectoriales, **monocromáticas** (un solo color de línea), trazo orgánico, contornos definidos, detalles simplificados, proporciones naturales, expresiones cálidas, diversidad racial e inclusión. Nada abstracto, sin rellenos degradados.
- Si no hay foto o ilustración real: contenedor con `aspect-ratio` fijo y `TODO: imagen de marca`; no generar personas ficticias sin aprobación.

## Íconos
- Glifo sólido o lineal simple **blanco dentro de un círculo sólido** del color de acento (tamaño 32–40 px) en resaltados, contenedores y tarjetas; o glifo suelto en café dentro de controles de UI. `lucide-react` es válido si se usa con este tratamiento.
- Indicadores de forma: círculo, cuadrado, triángulo, rombo, estrella y anillo, en los colores del kit (leyendas, estados).

## Movimiento (RESTRICTIVO · lista cerrada)

El movimiento solo existe para dar feedback de interacción. El contenido de la página NO se anima.

### Permitido (solo estas clases de `tokens.css`)
| Situación | Clase | Comportamiento |
|---|---|---|
| Tarjeta clicable | `card-interactive` | Hover/foco: sube 2 px, fondo acento 8 %, borde acento 62 %, sombra mayor · Presionado: fondo acento 14 %, sin elevación · 200 ms |
| Pestañas | `tabs-list` + `tab` | Hover: fondo café 8 % · Activa: fondo blanco + subrayado interior de 3 px en acento · 150 ms |
| Campo de filtro / select | `filter-control` | Sin cambio en hover; solo foco turquesa |
| Ítem de lista (select, dropdown) | `list-item` | Hover/foco: turquesa 10 %, instantáneo · Seleccionado: ícono Check + peso 600 |
| Chip de filtro | `chip` (`aria-pressed`) | Seleccionado: fondo acento 18 %, borde acento, texto café, ícono Check · 150 ms |
| Fila de tabla | `table-row` | Hover: turquesa 8 % · Seleccionada: turquesa 14 % + barra izquierda de 3 px · 150 ms |
| Navegación | `nav-link` | Subrayado verde estático; ruta actual con `aria-current="page"`. Sin animación |
| Enlace en texto | `text-link` | Subrayado verde fijo; en hover cambia a café. Sin animación |
| Checkbox, radio, switch | shadcn por defecto | Cambio de estado instantáneo, sin animación |
| Overlays: modal, popover, menú desplegable, menú móvil, toast | `animate-overlay-in` / `animate-overlay-out` | Aparece con opacidad y escala de 0.97 a 1 en 200 ms; desaparece con opacidad en 150 ms |
| Acordeón | `accordion-down` / `accordion-up` de shadcn | 200 ms |
| Carga de datos | `skeleton` | Pulso suave; si supera 10 s, pasar a estado de error |
| Carga dentro de botón o en línea | `spinner` en `Loader2` de 16 px | Nunca spinner de página completa |
| Iframe externo | `iframe-fade` | Fundido de 300 ms al terminar de cargar |

### Valores únicos
- Duraciones: `--dur-fast` 150 ms (color de controles) y `--dur-base` 200 ms (tarjetas y overlays). Ninguna otra.
- Curva: `--ease` (ease-out). Ninguna otra.
- Propiedades animables: `color`, `background-color`, `border-color`, `box-shadow`, `opacity` y `transform` (solo `translateY(-2px)` y `scale(0.97→1)`). Nunca `width`, `height`, `margin`, `top/left` ni `filter`.
- En componentes shadcn/Radix que traen `animate-in`/`animate-out` (Select, Dropdown, Popover, Dialog, Sheet, Toast): dejar solo `fade-in-0 zoom-in-[0.97]` y `fade-out-0`, con `duration-200`/`duration-150`. Quitar los `slide-in-from-*`.

### Prohibido
- Animar la entrada de contenido: secciones, tarjetas, hero, imágenes, textos, KPIs o gráficos al cargar o al hacer scroll. Sin retardos escalonados.
- Transiciones entre rutas o páginas.
- Hover con movimiento en elementos que no son clicables (tarjetas informativas, KPIs, imágenes sueltas).
- Zoom o escala de imágenes en hover; subrayados animados.
- Framer Motion, GSAP, AOS, Lottie o cualquier librería de animación.
- Clases `animate-bounce`, `animate-ping`, `animate-spin` (salvo `spinner`), gradientes animados y cualquier bucle decorativo.
- Keyframes nuevos o duraciones fuera de la escala.
- Animar la textura de letras, la franja o el logo.

### Movimiento reducido
Todo se desactiva con `prefers-reduced-motion: reduce` (bloque global en `tokens.css`): se mantienen los cambios de color y desaparecen los desplazamientos.

### Al trabajar sobre un proyecto existente
Si se detectan animaciones fuera de esta lista (por ejemplo `animate-gradient`, `logo-spin` de la plantilla de Vite, `group-hover:scale-105`), reportarlas al usuario y proponer eliminarlas. No eliminarlas sin confirmación.

## Accesibilidad y UX (mínimos)
- Respetar la tabla de contraste. Áreas táctiles ≥ 44 × 44 px.
- `hover` y `focus-visible` equivalentes; foco global: contorno turquesa de 2 px con separación de 2 px (`tokens.css`).
- Navegación completa por teclado; modales atrapan foco y cierran con Esc.
- `alt` descriptivo en español; decoraciones con `aria-hidden="true"`.
- `lang="es"`; números y fechas en `es-CO` (17.984 · 23 sep 2026).

## Estructura de página
- **Landing / directorio:** hero de color plano (foto recortada + círculo de letras + franja vertical) → módulos → cifras de impacto → footer.
- **Página interna:** encabezado (migas + H1 + descripción + acción) → filtros → contenido → relacionados → footer.
- **Tablero:** encabezado → filtros → KPIs → gráficos → tabla → fuente y fecha de corte.

## Recursos de marca (deben aportarse; no recrear)
| Recurso | Ruta esperada | Respaldo si falta |
|---|---|---|
| Logo (SVG) | `/public/brand/logo.svg` | Texto "Fundación Luker" en café, Medium |
| Textura de letras (SVG) | `/public/brand/textura-letras.svg` | Fondo plano sin textura |
| Círculo de letras (SVG) | `/public/brand/circulo-letras.svg` | Omitir |
| Números de marca (SVG 0–9) | `/public/brand/numeros/` | Tipografía display en café |

## Tono
Cálido, humano, en español. Microcopy concreto: "Ver módulo", "Descargar reporte", "No hay resultados para estos filtros".

## Evitar
- Duplicar header, footer, botón o tarjeta existentes.
- Hex sueltos o estilos en línea; siempre tokens.
- Texto blanco sobre coral, verde o naranja; texto de lectura en color de acento.
- Botones en forma de pastilla (el kit usa esquinas levemente redondeadas).
- Recrear el logo, los números o la textura con código o IA.
- Vistas sin estados de carga, vacío y error.

## Pestañas por módulo (Mi Junta)
- La línea de la pestaña activa toma el color del módulo de la página (el mismo del encabezado): Educación coral, Emprendimiento y Calendario naranja, Rural verde, Proyectos/Indicadores/Mapa turquesa, Socioeconómico y Documentos café. Pestaña activa en blanco, texto café.

## Prueba en Datos Abiertos
- Solo en las pestañas principales de cada sección: la pestaña seleccionada lleva fondo del acento y texto blanco. Es una prueba: el texto blanco solo cumple contraste sobre café; sobre coral, verde, naranja y turquesa no cumple AA.
