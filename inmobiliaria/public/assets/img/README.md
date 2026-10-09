# Fotos del sitio: guía para generarlas

Las imágenes actuales son **placeholders** (llevan la etiqueta `PLACEHOLDER · nombre.jpg`).
Reemplaza cada JPG por la imagen definitiva **con el mismo nombre** y ejecuta `npm run images`
para regenerar las versiones WebP (`nombre.webp` a 1600 px y `nombre-800.webp`).

Lo ideal es usar fotogramas reales de tus videos (render 3D) o un antes/después de un proyecto entregado.
Estilo común: luz cálida de atardecer, cielo limpio, sin texto ni logos.

| Archivo | Proporción / mínimo | Dónde se usa | Descripción |
|---|---|---|---|
| `render-casa-campo.jpg` | 1:1 · 1200×1200 | Sección "Vender solo con fotos…", imagen grande | Render 3D de una casa de campo terminada sobre su lote, con jardín y luz de atardecer. |
| `lotes-aereo.jpg` | 2.2:1 · 1800×820 | Panorámica arriba a la derecha | Vista aérea (dron) de una habilitación urbana: lotes delimitados, vías y algunas viviendas renderizadas en 3D. |
| `terreno-vacio.jpg` | 14:9 · 1400×900 | Abajo a la izquierda | El "antes": foto común de un terreno vacío con estacas o cerco, tal como lo publicaría una inmobiliaria. |
| `reel-movil.jpg` | 11:9 · 1100×900 | Abajo a la derecha | Un celular mostrando uno de tus reels verticales sobre un escritorio o en la mano. |

Las miniaturas de los videos de clientes se cargan directamente de YouTube y los logos de clientes desde
`stateviewstudio.com/wp-content/uploads/…` (si un logo no carga, se muestran las iniciales).

También son placeholders: `../hero-poster.jpg` (primer fotograma del video demo) y `../og-image.jpg`.
