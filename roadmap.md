# Roadmap

## Hecho
- [x] Renombrar primer botón de la portada: "Explorar indicadores" → "Explorar módulos", con desplazamiento suave hasta la sección de módulos (#directory), replicando el Hub (ancla + scroll-padding del header + scroll suave con fallback a reduced-motion). Verificado en Playwright (baja 829 px, la sección queda bajo el encabezado) y build OK.
- [x] Skill fundacion-luker-kit aplicada: regla permanente de botones de áreas (hover/foco: fondo del acento del módulo, texto blanco, excepción de contraste aprobada 24 sep 2026).
- [x] Corregir superposición del título del hero con la imagen en pantallas grandes: el H1 ahora escala con el ancho real del panel (cqw) en escritorio y con 10vw en móvil; verificado en 390/768/1024/1366/1920/2560 px sin desbordes ni solapamiento. Build OK.
- [x] Reemplazar el cultivador de cacao por un joven universitario en la imagen del hero (src/assets/mi-junta-hero-people-v2.png, fondo transparente); se eliminó la imagen anterior y se actualizó el alt.
- [x] Dar más amplitud a Datos Abiertos: mayor escala y separación en el panel inicial, secciones y navegación; pestañas de una sola fila con desplazamiento horizontal para evitar compresión; ancho editorial máximo de 1600 px.
