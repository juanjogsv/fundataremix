# Checklist antes de entregar

Reportar cada ítem como ✅ cumple · ❌ no cumple · ⚠️ requiere verificación manual.

## Consistencia
- [ ] Usa el AppShell, SiteHeader, SiteFooter y navegación existentes (no se crearon duplicados).
- [ ] Colores, radios, sombras y animaciones salen de `tokens.css`; no hay hex sueltos.
- [ ] Solo Montserrat y solo tamaños de la escala.
- [ ] Botones con esquinas levemente redondeadas (no pastilla) y combinaciones de texto/fondo permitidas.
- [ ] Logo, textura y números tomados de `/public/brand/`; no recreados.
- [ ] Acentos rotados en orden coral → verde → turquesa → naranja.
- [ ] Ningún texto de lectura en color de acento.

## Movimiento
- [ ] Solo clases de la lista cerrada; sin Framer Motion ni `animate-*` fuera de las excepciones.
- [ ] Ningún contenido se anima al cargar, al hacer scroll ni al cambiar de ruta.
- [ ] Hover con movimiento solo en elementos clicables.
- [ ] Duraciones 150/200 ms y curva `--ease` únicamente.
- [ ] Overlays de shadcn sin `slide-in-from-*`.
- [ ] Animaciones heredadas fuera de la lista reportadas al usuario.

## Navegación
- [ ] Ítem actual marcado con `aria-current="page"`.
- [ ] Migas de pan en páginas internas.
- [ ] Menú móvil con los mismos ítems y orden que el desktop, tomados de `navigation.ts`.
- [ ] Franja vertical: 4 colores distintos, incluye café, no repite el color de fondo.
- [ ] Filtros y pestañas reflejados en la URL.

## Estados
- [ ] Cargando, vacío, sin resultados y error implementados.
- [ ] Acciones destructivas piden confirmación.

## Accesibilidad
- [ ] Recorrido completo con teclado; foco visible en todo.
- [ ] Áreas táctiles ≥ 44 px.
- [ ] `alt` en imágenes; `lang="es"`.
- [ ] Funciona con `prefers-reduced-motion`.

## Responsive
- [ ] Sin scroll horizontal a 375 px.
- [ ] Cuadrículas sin huecos ni filas incompletas raras en 1, 2 y 5 columnas.

## Contenido
- [ ] Sin "Lorem ipsum", "TODO" visibles ni cifras inventadas.
- [ ] Datos con fuente y fecha de corte.
