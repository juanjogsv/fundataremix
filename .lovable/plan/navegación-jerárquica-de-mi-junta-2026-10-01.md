# Navegación jerárquica de Mi Junta

## Objetivo
Ordenar la navegación en tres niveles consistentes: orientación global en la cabecera fija, navegación de secciones dentro del banner y retorno contextual para vistas más profundas.

## Implementación
1. **Cabecera global fija**
   - Mantener el logo, el separador y “· Mi Junta” siempre visibles.
   - Mostrar junto a la marca `← Nombre de la sección` fuera de la portada, con retorno al nivel correcto.
   - Trasladar a la derecha las acciones de sesión; en móvil se agruparán en un menú accesible de 44 px sin desplazar la marca ni la ubicación.

2. **Banner de página**
   - Conservar la navegación de las diez secciones dentro de `PageHeader` y su estado activo por ruta.
   - En escritorio se distribuirá sin invadir el título; en móvil se mantendrá en una sola fila con desplazamiento táctil suave, foco visible y el elemento activo identificable.

3. **Profundidad adicional**
   - Permitir que la cabecera reciba una sección padre para mostrar `← Volver a [Sección]` en rutas de tercer nivel.
   - Aplicar ese retorno a las vistas internas existentes de administración, sin inventar nuevas rutas ni cambiar el comportamiento de documentos o tableros actuales.

4. **Consistencia y validación**
   - Centralizar nombres, rutas y acentos de secciones para que portada, cabecera y banner usen el mismo orden.
   - Validar portada, sección y ruta profunda en móvil, tableta y escritorio; comprobar navegación, cierre de sesión, foco, desbordes y compilación.

## Resultado
La cabecera servirá para orientarse y gestionar la sesión; el banner concentrará la navegación entre módulos; y las vistas profundas tendrán un retorno claro a su sección de origen.
