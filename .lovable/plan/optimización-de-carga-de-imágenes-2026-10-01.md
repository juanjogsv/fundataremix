# Optimización de carga de imágenes

## Objetivo
Reducir el peso y los saltos visuales de las imágenes sin cambiar su apariencia, disposición ni comportamiento.

## Cambios
- Mantener la portada en WebP y prioritaria, porque ya está comprimida y aparece al cargar.
- Crear versiones WebP redimensionadas de los logos institucionales y usarlas en encabezados, pies y páginas internas.
- Reservar dimensiones explícitas para cada logo y portada.
- Añadir carga diferida y decodificación asíncrona a imágenes fuera de la primera pantalla.
- Añadir un skeleton discreto mientras cargan las portadas de Biblioteca y ocultarlo al completar o fallar.
- Mantener una sola consulta para todas las publicaciones; no generar URLs individualmente.
- No transformar las dos portadas alojadas en un almacenamiento externo, porque su servicio de transformación no puede verificarse desde este proyecto. Las demás portadas son URLs externas de Fundación Luker y tampoco se reescribirán.

## Verificación
- Comparar peso, formato, prioridad y dimensiones en Network.
- Revisar portada, Biblioteca, Datos Abiertos y páginas interiores en móvil y escritorio.
- Confirmar ausencia de saltos, imágenes rotas y errores de compilación.

## Detalles técnicos
- Los logos se redimensionarán a 320 px de ancho, suficiente para su tamaño máximo renderizado y pantallas de alta densidad.
- La portada conservará `fetchPriority="high"`, sin `loading="lazy"`.
- Logos y portadas inferiores usarán `loading="lazy"` cuando estén fuera de la primera pantalla y todas usarán `decoding="async"`.
