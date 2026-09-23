# Ajuste responsive de módulos y estados de botones

## Objetivo
Ordenar el directorio de módulos para que mantenga una composición equilibrada en escritorio, tablet y móvil, y corregir los estados de interacción para que siempre tengan contraste y foco visible.

## Cambios
- Eliminar los tamaños destacados que hoy generan huecos y filas desbalanceadas.
- Usar una cuadrícula uniforme de 5 columnas en pantallas amplias, 2 en pantallas medianas y 1 en móvil.
- Mantener altura, alineación y área táctil consistentes, permitiendo que los títulos largos se acomoden sin desbordarse.
- Cambiar el resaltado de los módulos: fondo de acento suave, borde/indicador visible y texto café estable, en lugar de rellenar todo el botón con colores que reducen el contraste.
- Unificar `hover`, foco por teclado y pulsación; conservar el color propio de cada módulo y respetar reducción de movimiento.
- Revisar los botones y pestañas compartidos para que sus estados activos no mezclen fondo y texto del mismo tono.
- Actualizar la guía visual de Fundación Luker con estas reglas de cuadrícula y estados interactivos mediante una nueva versión aprobable.

## Validación
- Comprobar la portada en escritorio, tablet y móvil, incluyendo 695 px de ancho.
- Verificar que no haya huecos, desbordes ni texto cortado.
- Probar resaltado con puntero y foco con teclado en módulos, botones y pestañas.
- Confirmar que Datos Abiertos no cambie y que la compilación permanezca limpia.
