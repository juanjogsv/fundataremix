# Participantes (Indicadores Estratégicos) desde la sincronización de Drive

El cuadro "Participantes" de Indicadores Estratégicos hoy lee la tabla interna de carga Excel y además excluye 2025, por lo que quedó congelado en 2024. Pasa a leer la base sincronizada de Google Drive (indicador GP_02), igual que la gráfica de participantes de Educación.

## Qué cambia

- La serie histórica se construye con todos los años disponibles en la base sincronizada (2003 a 2025 hoy, y los siguientes aparecerán solos al sincronizar).
- Las barras se consolidan en 4 grupos:
  - **Educación**: categoría Educación + Otras Iniciativas
  - **Formare**: categoría Formare
  - **Rural**: Generación R + Cacao
  - **Especiales**: todas las categorías de Proyectos Especiales (Salud, Primera Infancia, Formación, Religiosos) + Emprendimiento
- El encabezado sigue mostrando el total por grupo del último año disponible y el gran total, con el rango de años calculado automáticamente.
- Se mantienen intactos el diseño, los colores de marca, el tooltip y el formato de números (K / M).

## Detalle técnico

- `src/components/indicators/BeneficiariesCompactCard.tsx`: reemplazar la consulta a `participants` (cliente interno, `.lt("year", 2025)`) por una consulta al cliente `ecosistema` sobre `datos_maestros` con `cod_indicador = "GP_02"`, ordenada por `anio`.
- Añadir un mapa de normalización de `categoria` a los 4 grupos y agregar por año antes de armar el stacked bar; el resto de la lógica de render no se toca.
- Sin cambios de base de datos ni de otros componentes.
