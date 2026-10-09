#!/usr/bin/env bash
# Genera las versiones WebP (1600px y 800px) de cada JPG de public/assets/img/
# Ejecuta después de reemplazar las fotos: npm run images
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

# Los pósters del hero y og-image.jpg los genera `npm run frames` a partir del video.
