# Alineación integral de Mi Junta con el kit Fundación Luker

## Objetivo
Unificar toda la experiencia de Mi Junta con el kit oficial, sin cambiar textos, datos, cálculos, enlaces, permisos ni funcionalidades. La ruta pública `/datosabiertos` conservará su diseño aislado y se verificará como regresión.

## Implementación
1. **Estructura institucional compartida**
   - Incorporar los componentes oficiales `LukerHeader`, `LukerFooter` y `LukerLayout` con el contenedor, alturas, logos originales, salto al contenido y franja cromática definidos en el kit.
   - Envolver las rutas de Mi Junta en esa estructura y retirar encabezados/pies duplicados sin alterar la navegación existente.
   - Mantener el acceso administrativo oculto del recorrido público y conservar desactivado el acceso restringido.

2. **Sistema visual y espaciado**
   - Consolidar la paleta exacta en tokens semánticos, Montserrat, radio de 0.625 rem y sombra café institucional.
   - Sustituir medidas y contenedores heredados por `luker-container`, `luker-section` y la escala de 4 px del kit.
   - Eliminar residuos visuales fuera de marca en Mi Junta: gradientes, grises fríos, colores aproximados y estilos de panel genérico.

3. **Controles y superficies**
   - Normalizar botones a 44 px, primarios café con texto claro, foco turquesa y estados secundarios suaves.
   - Mantener filtros y menús en blanco con borde café; pestañas activas con superficie clara y subrayado del acento.
   - Homogeneizar tarjetas, tablas, diálogos, estados de carga y vacíos; evitar tarjetas anidadas y conservar la densidad necesaria en administración.

4. **Portada y páginas internas**
   - Ajustar la portada al encabezado, contenedor, cuadrícula de módulos y ritmos exactos del kit, conservando todos sus contenidos actuales.
   - Aplicar el mismo encabezado de capítulo, ancho, espaciado y cierre institucional a indicadores, calendario, documentos, mapa, financiero, educación, emprendimiento, rural, especiales, contexto, ayuda, acerca de y administración.
   - Mantener los colores funcionales de las gráficas, incluidos Manizales, porcentajes y escalas de avance.

5. **Validación**
   - Comprobar todas las rutas principales en escritorio, tableta y móvil: alineación, recortes, desbordamiento, áreas táctiles y foco visible.
   - Verificar filtros, pestañas, gráficas, tablas, formularios y navegación sin regresiones.
   - Confirmar compilación y consola limpias, y que `/datosabiertos` permanezca visual y funcionalmente intacto.

## Resultado
Mi Junta tendrá una estructura institucional única y consistente en todas sus páginas, con las proporciones, colores, controles, espacios y comportamiento responsive del kit oficial.
