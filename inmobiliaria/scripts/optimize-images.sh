#!/usr/bin/env bash
# Genera las versiones WebP (1600px y 800px) de cada JPG de public/assets/img/
# y del póster del hero. Ejecuta después de reemplazar las fotos: npm run images
set -euo pipefail
cd "$(dirname "$0")/.."
command -v ffmpeg >/dev/null || { echo "✗ Falta ffmpeg"; exit 1; }

webp() { # $1 entrada, $2 salida, $3 ancho máximo
  ffmpeg -loglevel error -y -i "$1" -vf "scale='min($3,iw)':-2:flags=lanczos" \
    -c:v libwebp -quality 74 -compression_level 6 -preset photo "$2"
}

for f in public/assets/img/*.jpg; do
  base="${f%.jpg}"
  webp "$f" "$base.webp" 1600
  webp "$f" "$base-800.webp" 800
  echo "✓ $(basename "$f")"
done

if [ -f public/assets/hero-poster.jpg ]; then
  webp public/assets/hero-poster.jpg public/assets/hero-poster.webp 1920
  # versión móvil: recorte vertical centrado en el edificio
  ffmpeg -loglevel error -y -i public/assets/hero-poster.jpg \
    -vf "crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))/2':0,scale=-2:1080" \
    -c:v libwebp -quality 74 public/assets/hero-poster-mobile.webp
  # imagen Open Graph 1200×630
  ffmpeg -loglevel error -y -i public/assets/hero-poster.jpg \
    -vf "scale=1200:-2,crop=1200:630:0:(ih-630)/2" -q:v 4 public/assets/og-image.jpg
  echo "✓ hero-poster + og-image"
fi
