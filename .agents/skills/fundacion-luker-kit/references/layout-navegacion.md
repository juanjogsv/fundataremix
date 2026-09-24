# Layout y navegación

Toda página vive dentro de un único `AppShell`. Si ya existe en el proyecto, usarlo; si no, crearlo una sola vez en `src/components/layout/`.

## AppShell
```
<a href="#contenido" class="sr-only focus:not-sr-only">Saltar al contenido</a>
<SiteHeader />                 ← sticky, altura var(--header-h)
<main id="contenido">          ← flex-1, fondo crema
  <PageHeader />               ← en páginas internas
  {secciones}
</main>
<SiteFooter />                 ← café + franja cromática
```
- Contenedor único: `mx-auto w-full max-w-[var(--container)] px-5 md:px-8`. Nunca otro ancho máximo, salvo texto largo (`max-w-prose`).
- Breakpoints: los de Tailwind (`sm 640 · md 768 · lg 1024 · xl 1280`). Diseñar primero para 375 px.
- Sin scroll horizontal en ningún ancho.

## SiteHeader
- Fondo crema al 90 % con `backdrop-blur`, borde inferior `var(--border)` que aparece solo al hacer scroll.
- Izquierda: logo oficial (enlace a inicio, `aria-label="Fundación Luker, inicio"`).
- Centro/derecha: máx. 5–6 ítems de primer nivel con `nav-link`. El ítem de la ruta actual lleva `aria-current="page"` (subrayado verde fijo).
- Derecha: una sola acción principal (botón primario) si aplica; usuario/sesión en menú desplegable.
- Móvil (< lg): botón hamburguesa de 44 px → panel (`Sheet`) con `animate-overlay-in`; el ítem actual se marca igual que en desktop (café + subrayado verde, nunca texto turquesa) con los mismos ítems en el mismo orden, 1rem 600, separados por borde fino. Cierra con Esc, al tocar fuera y al navegar.
- Los ítems del menú los define cada sitio o página según su contenido; lo que es idéntico en todos es la **estructura y el comportamiento** del header. Si el usuario no indica los ítems, preguntarlos antes de inventarlos.
- Dentro de un mismo proyecto, los ítems se definen en un solo archivo (`src/config/navigation.ts`) y se consumen desde header, menú móvil y footer, para que el orden y los nombres no cambien entre sus páginas.

## PageHeader (páginas internas)
1. Migas de pan (`nav aria-label="Migas de pan"`): 0.75rem, separador `/`, último ítem sin enlace.
2. H1 + párrafo descriptivo (máx. 2 líneas, `max-w-2xl`, color `--muted-foreground`).
3. Acción principal a la derecha en desktop, debajo en móvil.
Espaciado: `pt-10 pb-8 md:pt-14`.

## SiteFooter
- Fondo café, texto crema. Tres columnas en desktop (institucional · navegación · contacto/redes), apiladas en móvil.
- Remate con `.luker-stripe` como último elemento de la página.

## Navegación y comportamiento
- Rutas en minúsculas y con guiones (`/modulos/fluidez-lectora`).
- Al cambiar de ruta: scroll al inicio y foco en el H1, sin transición animada.
- Enlaces internos con el router (sin recarga); externos con `target="_blank" rel="noopener"` e ícono `ArrowUpRight`.
- Pestañas: sincronizadas con la URL (`?tab=`) para que se puedan compartir y el botón atrás funcione.
- Filtros: se reflejan en la URL (`?anio=2025&programa=atal`) y se conservan al volver.
- Página 404 con el mismo shell, mensaje humano y botón "Volver al inicio".

## Plantillas

### Landing / directorio
1. **Hero** (`min-h-[70vh]`, `.bg-brand` con un acento plano, `.texture-letters`, `.luker-stripe-v`): grid `lg:grid-cols-12`; texto en cols 1–6 (etiqueta en mayúsculas, H1 Black, párrafo, 1–2 botones); en cols 7–12 foto recortada anclada al borde inferior, con el círculo de letras detrás. Color de fondo y color del texto según la tabla de contraste (naranja o coral con texto café; turquesa o café con texto blanco grande).
2. **Módulos**: grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5`.
3. **Cifras de impacto**: 3–4 KPIs en fila.
4. Footer.

### Página interna / de módulo
PageHeader → (FilterBar) → contenido en tarjetas o prosa (`max-w-prose` para texto) → bloque de "Relacionados" (3 tarjetas) → footer.

### Tablero de datos
PageHeader → FilterBar sticky bajo el header → fila de KPIs (`grid-cols-2 lg:grid-cols-4`) → gráficos (`lg:grid-cols-2`) → tabla detalle → nota de fuente y fecha de corte de los datos.
