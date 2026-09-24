# Componentes

Usar shadcn/ui como base cuando ya esté en el proyecto, re-tematizado con estos tokens. Un solo componente por patrón; no duplicar.

## Botones (esquinas `--radius-sm`, altura 44 px, Medium; nunca pastilla)
| Variante | Clases | Uso |
|---|---|---|
| Primario | `btn btn-solid` (café, texto blanco) | Acción principal, 1 por vista |
| Primario de color | `btn btn-solid btn-orange` (texto café) | Banners y CTA destacados |
| Primario verde / coral | `btn btn-solid btn-green` / `btn-coral` | Solo con texto ≥ 18.7 px en negrita (contraste) |
| Secundario (contorno) | `btn btn-outline accent-n` | Borde de color, texto café |
| Con ícono | cualquiera + ícono 18 px a la izquierda | "Descargar", "Enviar" |
| Terciario | `text-link` + flecha | "Ver más" |
- Estados del kit: normal → hover más claro → activo más oscuro → deshabilitado fondo crema y texto café atenuado.
- El kit muestra botones de color con texto blanco; en coral, verde y naranja ese texto no alcanza contraste AA, por eso aquí van con texto café. El turquesa con texto blanco solo en texto grande.
- Carga: spinner de 16 px + "Guardando…", ancho fijo.
- Destructivo: `btn btn-outline accent-0` + ícono `Trash2`, siempre con confirmación.

## Contenedores, divisores y resaltados (del kit)
- **Contenedor:** `.box` (borde de color, redondeado), `.box box-dashed` (discontinuo), `.box box-square` (recto). Con `.icon-badge` a la izquierda y texto café.
- **Divisores:** `.divider` sólido, `.divider-dashed`, `.divider-dotted`, en café suave.
- **Resaltado:** `.highlight accent-n` con `.icon-badge` + texto. Semántica: coral = destacado afectivo, verde = información importante, turquesa = dato destacado, café = aviso o recordatorio.
- **Palabra clave:** `<mark class="mark">` dentro del párrafo.
- **Etiquetas:** `.tag accent-n` ("Nuevo" coral, "Activo" verde, "Info" turquesa, "Alerta" naranja) y `.tag tag-brown` ("Importante").
- **Indicadores de forma** (leyendas/estados): ● coral, ■ verde, ▲ turquesa, ◆ café, ★ naranja, ○ crema con borde.

## Tarjeta de módulo
- `<a>` completa como área clicable; blanca, borde `--border`, radio `--radius`, sombra `--luker-shadow`, `p-6`, `min-h-[260px]`, `flex flex-col`, clases `card-interactive accent-{i%4} overflow-hidden`.
- Arriba: `.icon-badge` con glifo blanco sobre `var(--accent)` (izq.) y `ArrowUpRight` 18 px en café (der.).
- Centro: título H3 (envuelve, sin truncar) + descripción 0.875rem `--muted-foreground`, máx. 3 líneas.
- Abajo (`mt-auto`): divisor fino → CTA en mayúsculas café.
- Número del módulo como `.luker-watermark` (`font-size: 7rem`, abajo-derecha, recortado).
- Sin animación de entrada.
- Controles de administración: esquina superior derecha, sobre la tarjeta, sin mover el contenido.

## Cifras de impacto (KPI)
- Tarjeta blanca con barra superior de 4 px en `var(--accent)`.
- Número en café, tamaño display Black (o los SVG de números de marca si están disponibles); etiqueta en mayúsculas 0.75rem; fuente/periodo en 0.75rem `--muted-foreground`.
- El color de acento va en la barra, nunca en el número (contraste insuficiente).
- Si el dato no está confirmado, no mostrarlo: usar "Dato por confirmar".

## Filtros y formularios
- Campo, select y buscador: `filter-control` (blanco, borde `--border-strong`, 44 px, sin cambio en hover). Menú desplegable blanco con `list-item`.
- Etiqueta visible encima (0.875rem 600), nunca solo placeholder.
- Error: borde coral + mensaje café con ícono `AlertCircle` coral, conectado con `aria-describedby`.
- FilterBar: fila en desktop; en móvil botón "Filtros (n)" que abre un Sheet. Botón "Limpiar filtros" cuando hay alguno activo.
- Filtros rápidos con `chip` y `aria-pressed`. Chip seleccionado con fondo suave del acento, borde del acento, texto café e ícono Check (nunca texto blanco sobre color).
- Checkbox: 16 px, borde café; marcado con fondo café y Check crema; cambio instantáneo. El área clicable incluye la etiqueta (≥ 44 px de alto).

## Pestañas
- `tabs-list` + `tab`. Inactiva en café 72 %; hover fondo café 8 %; activa fondo blanco con subrayado interior de 3 px en el acento del módulo (turquesa por defecto).
- Sincronizadas con la URL (`?tab=`).

## Tablas
- Contenedor blanco con radio y borde; `overflow-x-auto` propio.
- Encabezado 0.75rem 700 mayúsculas, sticky; filas `table-row`.
- Hover y selección se distinguen: la seleccionada lleva barra turquesa a la izquierda.
- Si las filas son clicables, el foco va a un enlace o botón interno, no al `tr`.
- Números alineados a la derecha con formato `es-CO`. Ordenación con `aria-sort`.
- Móvil: con más de 4 columnas, pasar a lista de tarjetas.

## Menús desplegables
- Ítems `list-item`: hover/foco turquesa 10 % (no naranja), seleccionado con Check. Mismo estilo en Select, DropdownMenu y Combobox.

## Modales, diálogos y paneles
- Overlay café al 40 %; panel blanco, radio `--radius`, `max-w-lg`, `animate-overlay-in`; cierre con ✕ (44 px), Esc y clic fuera.
- Título + descripción + acciones abajo a la derecha (secundaria, luego primaria).

## Banner / bloque de marca
- `.bg-brand accent-n` + `.texture-letters` + `.luker-stripe-v` (variables `--s1..--s4` sin repetir el color de fondo).
- Texto café sobre naranja o coral (grande); blanco sobre café o turquesa (grande). Foto recortada anclada abajo, con círculo de letras detrás.

## Notificaciones (toast)
- Abajo a la derecha (arriba en móvil), blanco con borde izquierdo de 4 px: verde éxito, coral error, naranja aviso, turquesa info. Duración 4 s; los de error no se cierran solos.

## Estados obligatorios en cualquier vista con datos
- **Cargando:** `.skeleton` con la misma forma del contenido final (no spinners de página completa).
- **Vacío:** ilustración lineal pequeña o ícono, título ("Aún no hay registros"), explicación y acción siguiente.
- **Sin resultados por filtros:** mensaje + botón "Limpiar filtros".
- **Error:** mensaje humano, qué pasó y botón "Reintentar"; nunca mostrar trazas técnicas.

## Gráficos
- Serie única: café o turquesa; varias series: rotación coral → verde → turquesa → naranja.
- Ejes y rejilla en café al 20 %; etiquetas en café. Tooltip blanco con sombra del kit.
- Siempre título, unidad, fuente y fecha de corte. No usar el color como único portador de significado (añadir etiquetas o leyenda).
