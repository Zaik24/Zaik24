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
