# StateView — sitio web

Reels con renderizado 3D para terrenos y proyectos inmobiliarios.
Vite + HTML/CSS/JS vanilla + GSAP/ScrollTrigger. Sin frameworks.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

## Marca y contacto

En **`.env`**: `VITE_BRAND_NAME`, `VITE_BRAND_LEGAL`, `VITE_SITE_URL`, `VITE_WHATSAPP` (formato wa.me, sin +) y
`VITE_WHATSAPP_DISPLAY`. Se inyectan en todo el HTML: títulos, meta tags, Open Graph, logo, textos y enlaces de WhatsApp.
Los textos de cada sección están en `src/sections/<sección>/            .html + .css (+ .js) por sección
  header/    Header fijo con navegación por anclas y menú móvil
  hero/      Hero con video controlado por scroll (frame-player.js = canvas)
  problema/  "Vender solo con fotos ya no alcanza" + galería bento
  clientes/  Carrusel de reels de clientes (YouTube, se carga al hacer clic)
  caso/      Caso real Siu
  para-ti/ precios/ pagos/ faq/ cta/ footer/ (incluye botón flotante de WhatsApp)
src/lib/reels.js                   Reels de YouTube con fachada liviana + carrusel
src/lib/reveal.js                  Fade-up al entrar en viewport
public/assets/                     hero.mp4, póster, fotogramas, fotos
scripts/extract-frames.sh          npm run frames
scripts/optimize-images.sh         npm run images
scripts/dev/                       Generadores del video demo y de los placeholders
```

## Hero con video controlado por scroll

La sección mide 400vh (`--hero-scroll` en `hero.css`) y contiene un bloque sticky de 100vh. El video **no** se reproduce
con `video.currentTime`: se convierte a fotogramas WebP que se dibujan en un `<canvas>` según el scroll (fluido en Safari y móvil).

Video actual: `public/assets/hero.mp4` (16,27 s, 1920×1080, 30 fps). Etapas y sincronización (`src/sections/hero/hero.js` → `STAGES` y `TEXT`):

| Scroll del hero | Video | Escena | Texto |
|---|---|---|---|
| 0–15 % | 0–0,75 s | Terreno vacío | "STATEVIEW" + subtítulo |
| 15–70 % | 0,75–11 s | Construcción | El texto se desvanece y sube 20 px (15–25 %) |
| 70–85 % | 11–13,5 s | Casa terminada | Aparece "Ver proyectos →" (70–74 %) |
| 85–100 % | 13,5–16,27 s | La cámara sube a las nubes | El botón se va (85–89 %); fundido a #F6F5F2 (92–100 %) |

El scroll se mapea **por tramos** al tiempo del video: cada etapa ocupa exactamente su tramo de scroll aunque dure distinto en el video.
Todas las transiciones son GSAP + ScrollTrigger (opacity/transform), con el mismo suavizado que el video, y se revierten al subir.

Para cambiar el video:
1. Reemplaza `public/assets/hero.mp4`.
2. `npm run frames` (requiere **ffmpeg**: `brew install ffmpeg` · `sudo apt install ffmpeg` · `winget install ffmpeg`). Genera:
   - `public/assets/frames/desktop/` — 24 fps, 1920 px · `public/assets/frames/mobile/` — recorte 9:16 sobre la casa, 1080 px de alto
   - `public/assets/frames/manifest.json` (cantidad, fps, duración)
   - `hero-start.*` (primer fotograma: se ve mientras cargan los demás), `hero-poster.jpg` (último fotograma) y `og-image.jpg`
   Opciones: `FPS=15 QUALITY=62 MOBILE_CROP_X=0.57 OG_TIME=12 npm run frames`.
3. Ajusta los tiempos de `STAGES` en `hero.js` a las escenas del nuevo video.

Peso con el video actual: 390 fotogramas ≈ 33 MB (escritorio) / 11 MB (móvil). Se descargan recién con la primera interacción
(o a los 4 s), en orden progresivo (primero, último y luego mitades), así no afectan la carga inicial.
`FPS=15` reduce el peso cerca de un 40 % con un scrub algo menos fino.

Con `prefers-reduced-motion: reduce`, ahorro de datos o 2G: primer fotograma fijo con todo el texto visible.

## Fotos

Ver `public/assets/img/README.md`: nombres, proporciones y un prompt por foto. Tras reemplazarlas: `npm run images`.

## Despliegue en Netlify

El proyecto vive en la carpeta `inmobiliaria/` del repositorio. En Netlify: **Base directory = `inmobiliaria`**;
`netlify.toml` ya define `npm run build` → `dist/`, Node 22 y cabeceras de caché.
Actualiza `VITE_SITE_URL` en `.env` con el dominio real (se usa en canonical y Open Graph).

## Calidad (medido en local, build de producción)

Lighthouse 12 — móvil: 100 / 100 / 100 / 100 · escritorio: 100 / 100 / 100 / 100
(rendimiento / accesibilidad / buenas prácticas / SEO). Sin scroll horizontal a 360, 768 y 1440 px.
