# Actualización visual del portal Datos Abiertos

## Objetivo
Aplicar a `/datosabiertos` el lenguaje institucional de la página 15 del kit, manteniendo intactos los datos, filtros, cálculos y sincronización con Google Drive/DAMA.

## Diseño propuesto
- Usar fondo crema `#EFEAE1`, texto y estructura café `#623E19`, con coral `#FF7C80`, verde lima `#8EBC22`, turquesa `#009EAE` y naranja `#FBB03F` como acentos funcionales.
- Mantener Montserrat, con títulos grandes y editoriales, números destacados y jerarquía clara.
- Rehacer la cabecera y presentación inicial con composición asimétrica, textura tipográfica suave y bloques de color plano, sin gradientes ni tonos ajenos a la marca.
- Convertir los accesos rápidos en una navegación fija inspirada en los botones primarios, secundarios y estados de la página 15, conservando el acceso inmediato durante el desplazamiento.
- Dar a cada sección un acento propio, divisores editoriales y encabezados más reconocibles.
- Adaptar visualmente tarjetas, pestañas, filtros, avisos y estados dentro del portal: bordes sutiles, radio moderado, sombra café suave y hover según el acento de cada módulo.
- Reorganizar el cierre como footer institucional limpio y coherente con el nuevo sistema.
- Mantener todos los textos y controles legibles en escritorio y móvil, sin cambiar el contenido disponible.

## Protección frente a efectos en Mi Junta
- Encapsular los estilos bajo el contenedor exclusivo de Datos Abiertos.
- No modificar la apariencia base de `Card`, `Tabs`, `Select`, botones u otros elementos compartidos.
- No cambiar los componentes de visualización, sus consultas, cálculos, filtros ni fuentes de datos.
- No cambiar rutas, permisos, acceso público ni comportamiento del dominio.
- Añadir únicamente tokens visuales reutilizables y reglas explícitamente acotadas al portal público.

## Riesgos evaluados
1. **Cambios visuales involuntarios en Mi Junta — alto si se editan componentes compartidos.** Mitigación: estilos exclusivos de la página pública y revisión comparativa de ambas rutas.
2. **Pérdida de legibilidad en gráficas — medio.** Mitigación: preservar los colores semánticos de las series cuando sean necesarios y aplicar la paleta al marco, controles y jerarquía sin confundir categorías.
3. **Navegación fija superpuesta — medio.** Mitigación: calcular alturas estables y comprobar anclajes, pestañas y filtros en móvil y escritorio.
4. **Contraste insuficiente con crema o acentos claros — medio.** Mitigación: usar café para texto y validar estados normal, hover, activo, foco y deshabilitado.
5. **Regresiones funcionales — bajo con el enfoque propuesto.** Mitigación: no tocar lógica y probar filtros, pestañas, desplazamiento y carga de todas las secciones.
6. **Peso visual o lentitud por recursos decorativos — bajo.** Mitigación: construir la textura con elementos ligeros, sin añadir fotografías ni archivos pesados no incluidos en el alcance.

## Validación
- Revisar `/datosabiertos` en escritorio y móvil: composición, contraste, textos, desbordamientos y navegación fija.
- Probar pestañas, selectores, anclajes y estados de carga/error.
- Comparar páginas principales de Mi Junta antes y después para confirmar que no cambió su apariencia ni funcionamiento.
- Confirmar que la aplicación compila sin errores y que no aparecen errores nuevos en consola.

## Detalles técnicos
- Alcance principal: `DatosAbiertos` y estilos semánticos estrictamente delimitados por una clase raíz propia.
- Se conservarán los componentes compartidos como fuente única de lógica y datos; no se duplicarán.
- Los valores de marca se definirán como variables HSL del sistema y se consumirán mediante nombres semánticos, evitando colores directos dispersos.
- La implementación respetará movimiento reducido y estados de foco accesibles.
