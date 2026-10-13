# Imágenes del sitio

| Archivo | Proporción | Dónde se usa |
|---|---|---|
| `story-1.webp` | 4:5 · 640×800 | "Antes de existir…", flecha 1: planos |
| `story-2.webp` | 4:5 · 640×800 | Flecha 2: obra en construcción |
| `story-3.webp` | 4:5 · 640×800 | Flecha 3: render del patio terminado |
| `story-4.webp` | 4:5 · 640×800 | Flecha 4: vista aérea al atardecer |

Para cambiar una, reemplaza el archivo con el mismo nombre (recorte 4:5, 640×800, WebP).
Si partes de un JPG: `ffmpeg -i foto.jpg -vf "crop='min(iw,ih*4/5)':'min(ih,iw*5/4)',scale=640:800" -quality 80 story-1.webp`.

`npm run images` convierte cualquier `*.jpg` de esta carpeta a WebP (1600 px y `-800`).

Las miniaturas de los videos de clientes se cargan directamente de YouTube y los logos de clientes desde
`stateviewstudio.com/wp-content/uploads/…` (si un logo no carga, se muestran las iniciales).
