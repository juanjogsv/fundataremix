# Alineación integral con el Kit Fundación Luker

## Objetivo
Actualizar toda la plataforma Mi Junta para que sus páginas, componentes y estados cumplan de forma consistente la guía activa de Fundación Luker, conservando la lógica, los datos y el diseño aislado de Datos Abiertos.

## Implementación
1. **Consolidar el sistema visual global**
   - Alinear los tokens globales con la paleta oficial, Montserrat, radios, sombras, foco y movimiento reducido.
   - Eliminar el modo oscuro y los gradientes decorativos que contradicen el kit.
   - Mantener colores especiales de datos solo cuando representen información funcional y asegurar contraste.

2. **Completar la estructura compartida**
   - Incorporar salto accesible al contenido y un contenedor institucional único.
   - Completar encabezados internos con migas de pan, título, descripción y acción cuando corresponda.
   - Mantener el footer café y la franja cromática, sin duplicar encabezados ni pies.
   - Ajustar el cambio de página para volver arriba y llevar el foco al título principal.

3. **Normalizar componentes comunes**
   - Tarjetas y KPIs: fondo blanco, borde y sombra institucional, acento discreto y texto café.
   - Botones: altura táctil mínima de 44 px, radios correctos, estados de foco, pulsación y deshabilitado.
   - Pestañas: fondo blanco activo, texto café y subrayado con el acento del módulo.
   - Filtros, formularios y menús: fondo blanco sólido, etiqueta visible, borde café suave y foco turquesa.
   - Tablas, diálogos, menús y notificaciones: superficies blancas, contraste, cierres accesibles y estados coherentes.

4. **Actualizar páginas y visualizaciones**
   - Corregir los residuos visuales en Educación, Financiero, Indicadores, Contexto, Rural, Emprendimiento, Especiales, Documentos, Calendario, Mapa, ayuda y administración.
   - Sustituir gradientes, grises fríos y colores fuera de marca por tokens semánticos.
   - Uniformar títulos de tarjetas, iconos, divisores, espacios y paneles de filtros.
   - Alinear gráficos con la rotación coral → verde → turquesa → naranja, ejes café, tooltip blanco y unidades legibles, preservando el rojo funcional de Manizales.

5. **Completar estados y comportamiento**
   - Sustituir cargas de página con spinner por esqueletos equivalentes al contenido.
   - Homogeneizar estados vacío, sin resultados y error con mensajes humanos y acciones pertinentes.
   - Mantener controles táctiles, foco visible, navegación por teclado y textos sin recortes.

6. **Actualizar la guía activa**
   - Registrar las decisiones consolidadas que hoy solo existen en la implementación: tarjetas editoriales de módulos, cuadrícula 5/2/1, estados de botones y filtros siempre blancos.
   - Resolver contradicciones entre la guía principal y sus referencias para que futuras páginas apliquen el mismo criterio.

## Alcance protegido
- No se modificarán consultas, cálculos, sincronización de Google Drive, permisos ni acceso restringido.
- `/datosabiertos` conservará su diseño aislado; solo se comprobará que los cambios compartidos no lo afecten.
- No se inventarán imágenes, cifras, fuentes o fechas de corte.

## Validación
- Revisar portada y todas las rutas principales en escritorio (1280 px), tablet (695/767 px) y móvil (375/390 px).
- Verificar ausencia de desbordes, contraste, foco por teclado, áreas táctiles, menús, diálogos, filtros, pestañas y estados de datos.
- Confirmar que no queden gradientes decorativos, colores fuera del kit ni errores visibles.
- Confirmar compilación correcta y regresión visual de Datos Abiertos.
