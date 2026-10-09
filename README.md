# El Farolito — sitio web

Sitio estático (HTML + CSS + JavaScript vanilla) para **El Farolito**, cocina uruguaya e italiana en Corralejo, Fuerteventura.
Sin frameworks, sin base de datos y sin compilación: funciona en cualquier hosting estático y abriendo `index.html` directamente.

## Estructura

```
index.html                  Página única
css/styles.css              Estilos (paleta y tipografías en :root)
js/i18n.js                  Selector ES | EN
js/hero.js                  Portada controlada por scroll
js/main.js                  Navegación, carta, fotos, reservas
contenido/textos.js         ← TODOS los textos, en español e inglés
contenido/config.js         ← Teléfono, WhatsApp, email, dirección, sincronía de la portada
assets/fotos/               ← Fotos del restaurante
assets/hero/                Secuencia de la portada (generada)
assets/video/               MP4 de respaldo (generado)
assets/fonts/               Playfair Display + Inter (licencia OFL, locales)
herramientas/preparar-portada.sh   Convierte el video en secuencia + pósters + MP4
```

## 1. Añadir el video de portada

Necesitas `ffmpeg` instalado.

```bash
mkdir -p fuente
cp /ruta/a/tu-video.mp4 fuente/portada.mp4      # original guardado en el repositorio
./herramientas/preparar-portada.sh fuente/portada.mp4
```

El script genera la secuencia de escritorio (horizontal) y la de móvil (vertical 9:16, recorte central),
el póster inicial, la foto final, dos MP4 optimizados para mover el video con el scroll y `assets/hero/frames.js`.
Comando usado con el video actual (5 s, 1178×786, 121 fotogramas):
`FRAMES_DESKTOP=121 FRAMES_MOBILE=121 MOBILE_W=442 MOBILE_H=786 MOBILE_CROP_X=0.45 QUALITY=78 ./herramientas/preparar-portada.sh fuente/portada.mp4`

Opciones: `FRAMES_DESKTOP=180 QUALITY=75 MOBILE_CROP_X=0.4 ./herramientas/preparar-portada.sh …` (ver cabecera del script).

**Sincronizar los textos con las escenas:** en `contenido/config.js` → `portada.escenas`, cada par `[inicio, fin]`
indica en qué tramo del video (0 = principio, 1 = final) se ve cada frase. `alturaPantallas` controla cuánto dura la portada (4 por defecto).

Comportamiento: bajar avanza el video, subir lo retrocede y al parar se congela el fotograma. Sin autoplay ni loop, y el scroll del navegador no se intercepta.
Respaldo automático: secuencia en canvas → MP4 controlado por scroll → foto fija → degradado.
Con "reducir movimiento" activado en el sistema se muestra la foto final fija, sin scroll extendido.

## 2. Añadir las fotos

Copia las fotos en `assets/fotos/` con estos nombres exactos (JPG, idealmente de 2000 px de ancho como máximo):

| Archivo | Sección |
|---|---|
| `fachada-terraza.jpg` | El lugar → La terraza |
| `salon.jpg` | El lugar → El salón |
| `cocina-parrilla.jpg` | La cocina |
| `platos-principales.jpg` | Carta → Platos principales |
| `postres.jpg` | Carta → Postres |
| `bebidas.jpg` | Carta → Bebidas |
| `equipo.jpg` | El equipo |

Si falta una foto, el sitio muestra un recuadro "Foto pendiente" en su lugar.

## 3. Editar textos y datos

- **Textos** (ES y EN): `contenido/textos.js`. Se puede usar `<em>` para cursiva.
- **Platos de la carta:** en `carta.categorias[].platos` añade `{ nombre, desc, precio }`. Vacío = solo foto y descripción.
- **Horario:** `reservas.horarioLineas`, una línea por franja.
- **Contacto:** `contenido/config.js`. Si rellenas `whatsapp` o `email`, el formulario de reservas envía la solicitud por ese canal
  (WhatsApp con el mensaje ya escrito, o el programa de correo). Lo que quede vacío no se muestra.

## 4. Publicar

Sube la carpeta completa (`fuente/` no hace falta en el servidor) a cualquier hosting estático: GitHub Pages, Netlify, Cloudflare Pages o un servidor Apache/Nginx.
