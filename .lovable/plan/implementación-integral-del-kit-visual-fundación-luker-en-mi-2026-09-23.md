# Implementación integral del kit visual Fundación Luker en Mi Junta

## Diagnóstico
La plataforma ya usa parte de la paleta institucional, pero conserva la estructura de un dashboard genérico: retículas uniformes, exceso de tarjetas blancas, pestañas dentro de barras, gradientes decorativos, jerarquías débiles y estilos diferentes entre módulos. El cambio anterior fue principalmente cromático; falta trasladar el lenguaje editorial completo del kit.

## Objetivo
Reconstruir la presentación de **Mi Junta** como una publicación institucional interactiva: cálida, humana, asimétrica y ejecutiva, conservando intactos datos, cálculos, gráficas, filtros, rutas y permisos.

## Alcance
- Incluye portada, encabezados, navegación interna, páginas de indicadores, documentos, calendario, ayuda, acerca de y administración.
- Conserva la codificación funcional de las gráficas: Manizales en rojo, escala de progreso rojo→turquesa, formatos MM y %.
- Mantiene Montserrat, el logo transparente aprobado y todos los contenidos actuales.
- **Datos Abiertos no se rediseña**; solo se comprobará que permanezca visual y funcionalmente intacto.

## 1. Consolidar el sistema visual
- Convertir la paleta exacta del kit en una única fuente de verdad: crema `#EFEAE1`, café `#623E19`, coral `#FF7C80`, verde `#8EBC22`, turquesa `#009EAE` y naranja `#FBB03F`.
- Reorganizar los colores en tokens semánticos y eliminar de la interfaz general grises Tailwind, morados, azules corporativos y mezclas entre `luker-*` y `kit-*`; los colores especiales de datos se conservarán únicamente dentro de gráficas.
- Incorporar la sombra café institucional y un radio base consistente de `0.625rem` en superficies, controles y tarjetas.
- Estandarizar tipografía Montserrat, jerarquías, anchos de contenido, separadores y ritmos verticales.
- Retirar gradientes genéricos, halos borrosos, fondos decorativos abstractos y transparencias que no pertenecen al kit.

## 2. Crear una estructura compartida de página
- Rehacer el encabezado interior como apertura editorial: identificador de capítulo, título dominante, subtítulo opcional, acento propio del módulo, retorno y logo.
- Crear un contenedor común para que todas las páginas compartan ancho, márgenes y ritmo.
- Convertir la navegación secundaria en un índice de capítulo compacto y persistente, con estado activo claro y desplazamiento horizontal controlado en móvil.
- Incorporar un cierre institucional común: footer café con texto crema y franja inferior coral, verde, turquesa y naranja.
- Definir variantes reutilizables por módulo para que iconos, pestañas, enlaces y estados activos usen siempre el mismo acento.

## 3. Reconstruir la portada
- Sustituir el bloque centrado actual por un hero asimétrico con:
  - titular y relato a la izquierda;
  - fotografía recortada, sin fondo, de personas reales del contexto educativo y social latinoamericano;
  - letra “L” de gran formato y baja opacidad como textura tipográfica;
  - logo y acciones integrados con mayor claridad.
- Reemplazar la cuadrícula de diez tarjetas iguales por un directorio editorial asimétrico: módulos prioritarios más visibles, numeración, acentos rotados y descripción breve.
- Añadir un bloque de cifras de impacto con números grandes y colores rotados del kit.
- Integrar ayuda y “Acerca de” como enlaces editoriales secundarios, no como una gran tarjeta aislada.
- Aplicar entradas suaves y escalonadas, sin animación decorativa continua.

## 4. Reestructurar páginas de datos
Aplicar el mismo patrón en Indicadores Estratégicos, Financiero, Educación, Emprendimiento, Desarrollo Rural, Especiales y Contexto Socioeconómico:
- Apertura de capítulo con título, propósito, año/filtros y acento del módulo.
- KPIs principales como cifras editoriales; usar tarjetas solo cuando representen elementos repetidos comparables.
- Organizar gráficas en bandas de contenido con títulos, fuente y controles alineados, evitando una tarjeta dentro de otra.
- Diferenciar visualmente resumen, evolución histórica, comparaciones y detalle tabular mediante jerarquía y espaciado, no mediante cajas repetidas.
- Mantener tablas densas y legibles, con encabezados café, filas cálidas y barras de progreso en colores institucionales planos.
- Normalizar estados de carga, vacíos, errores, tooltips, selectores y leyendas.

## 5. Reestructurar páginas operativas
- **Documentos y Biblioteca:** convertir carpetas y publicaciones en un índice documental editorial, con mejor jerarquía de fechas, nombres y cantidades; mantener Escopios embebido.
- **Calendario:** destacar la próxima actividad y ordenar el resto como agenda cronológica, sin alterar su gestión.
- **Mapa:** integrar controles y leyenda dentro de una barra funcional compacta, preservando MapLibre y sus datos.
- **Administración:** mantener la alta densidad necesaria, pero unificar navegación, formularios, cargas y estados con el sistema institucional; eliminar gradientes y estilos de panel SaaS.
- **Ayuda, Acerca de y acceso guardado:** adoptar la misma apertura editorial, superficies y footer sin activar nuevamente el acceso restringido.

## 6. Componentes a estandarizar
- `PageHeader`: apertura editorial por módulo.
- `Card`: superficie cálida, borde café sutil y sombra institucional; sin imponer tarjeta donde no corresponde.
- `Tabs`: índice de capítulo con variantes de acento y comportamiento móvil.
- `Button`, selectores e inputs: estados de foco, activo y deshabilitado consistentes.
- Nuevos bloques compartidos: `PageShell`, `SectionHeading`, `ImpactStat`, `ChartSection`, `InstitutionalFooter` y mapa central de acentos por módulo.

## 7. Orden de implementación
1. Tokens, sombras, tipografía, contenedor y mapa de acentos.
2. Componentes compartidos y estructura de página.
3. Portada completa.
4. Indicadores Estratégicos, Financiero y Educación como páginas piloto.
5. Emprendimiento, Rural, Especiales y Contexto Socioeconómico.
6. Documentos, Calendario, Mapa, Ayuda y Acerca de.
7. Administración y pantallas auxiliares.
8. Limpieza final de estilos heredados y validación integral.

## Validación
- Comparación visual antes/después en escritorio y móvil de todas las rutas principales.
- Revisión específica de jerarquía, contraste, legibilidad, desbordes, navegación fija y coherencia del acento por módulo.
- Verificación de filtros, pestañas, tablas, gráficas, tooltips, exportaciones y formularios sin cambios funcionales.
- Confirmación de que no quedan gradientes genéricos, colores fuera del kit, tarjetas anidadas ni estilos grises hardcodeados en la interfaz general.
- Comprobación de consola y compilación sin errores.
- Capturas de regresión para confirmar que `/datosabiertos` no cambió.

## Resultado esperado
Mi Junta dejará de sentirse como un dashboard recoloreado y se convertirá en una experiencia editorial coherente con Fundación Luker: reconocible desde la portada, consistente entre capítulos y clara tanto para lectura ejecutiva como para consulta detallada.
