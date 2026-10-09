# Alba — sitio web de inmobiliaria premium

Vite + HTML/CSS/JS vanilla + GSAP/ScrollTrigger. Sin frameworks.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

## Marca

El nombre se define en **`.env`** (`VITE_BRAND_NAME`, `VITE_BRAND_LEGAL`, `VITE_SITE_URL`) y se inyecta en todo el HTML
(título, meta tags, Open Graph, logo y textos). El símbolo del logo es un SVG en línea en `src/sections/header/header.html`
y `src/sections/footer/footer.html`; el favicon está en `public/favicon.svg`.

## Estructura

```
index.html                         Head (SEO/OG) + includes de cada sección
vite.config.js                     Plugin `<!-- @include … -->` + %VITE_*% → HTML estático en el build
src/main.js                        Estilos + header; GSAP se carga diferido (src/lib/motion.js)
src/styles/tokens.css              Colores, tipografía, espaciado (sistema de diseño)
src/styles/base.css                Reset, grilla, botones, tarjetas
src/sections/<sección>/            .html + .css (+ .js) por sección
  header/     Header sticky, dropdowns, menú móvil
  hero/       Hero con video controlado por scroll (frame-player.js = canvas)
  manifiesto/ agentes/ ayuda/ servicios/ footer/
src/lib/reveal.js                  Fade-up al entrar en viewport
public/assets/                     hero.mp4, póster, fotogramas, fotos
scripts/extract-frames.sh          npm run frames
scripts/optimize-images.sh         npm run images
scripts/dev/                       Generadores del video demo y de los placeholders
```

## Hero con video controlado por scroll

La sección mide 300vh y contiene un bloque sticky de 100vh. El video **no** se reproduce con `video.currentTime`:
se convierte a fotogramas WebP que se dibujan en un `<canvas>` según el progreso del scroll (fluido en Safari y móvil).

1. Reemplaza `public/assets/hero.mp4` por el video definitivo (lo ideal: 4–6 s, 1920×1080, el edificio centrado).
2. `npm run frames` (requiere **ffmpeg**) genera:
   - `public/assets/frames/desktop/0001.webp…` — 24 fps, 1920 px de ancho
   - `public/assets/frames/mobile/0001.webp…` — recorte vertical 9:16 centrado, 1080 px de alto
   - `public/assets/frames/manifest.json`
   Opciones: `FPS=24 QUALITY=72 MOBILE_CROP_X=0.5 npm run frames` (ver cabecera del script).
3. Exporta un fotograma como `public/assets/hero-poster.jpg` y ejecuta `npm run images` (póster WebP, póster móvil y `og-image.jpg`).

Comportamiento:
- Mientras cargan los fotogramas se ve el póster. La carga empieza cuando la página termina de cargar
  (no compite con el LCP) y es progresiva: primero el primer y el último fotograma y luego subdivide, así el scrub responde enseguida.
- Pantallas en retrato usan la secuencia móvil; el resto, la de escritorio.
- Con `prefers-reduced-motion: reduce`, ahorro de datos o 2G: solo el póster estático, sin scroll extendido (en reduce).

> El `hero.mp4` actual es un **video demo sintético** (`npm run demo:video`, requiere Python + numpy + Pillow).

## Fotos

Ver `public/assets/img/README.md`: nombres, proporciones y un prompt por foto. Tras reemplazarlas: `npm run images`.

## Despliegue en Netlify

El proyecto vive en la carpeta `inmobiliaria/` del repositorio. En Netlify: **Base directory = `inmobiliaria`**;
`netlify.toml` ya define `npm run build` → `dist/`, Node 22 y cabeceras de caché.
Actualiza `VITE_SITE_URL` en `.env` con el dominio real (se usa en canonical y Open Graph).

## Calidad (medido en local, build de producción)

Lighthouse 12 — móvil: 100 / 100 / 100 / 100 · escritorio: 100 / 100 / 100 / 100
(rendimiento / accesibilidad / buenas prácticas / SEO). Sin scroll horizontal a 360, 768 y 1440 px.
