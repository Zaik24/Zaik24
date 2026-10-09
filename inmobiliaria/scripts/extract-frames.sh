#!/usr/bin/env bash
# Extrae los fotogramas del video del hero a WebP para el scroll scrubbing en <canvas>.
#
#   npm run frames                      # usa public/assets/hero.mp4
#   npm run frames -- otro-video.mp4
#
# Variables opcionales:
#   FPS=24             fotogramas por segundo a extraer (15 reduce el peso ~40%)
#   DESKTOP_W=1920     ancho de la secuencia de escritorio
#   MOBILE_H=1080      alto de la secuencia móvil (recorte vertical 9:16)
#   MOBILE_CROP_X=0.63 posición del recorte móvil (0 = izquierda, 1 = derecha); 0.63 centra la casa
#   QUALITY=62         calidad WebP (0-100)
#   OG_TIME=12         segundo del video usado para la imagen Open Graph (casa terminada)
#
# Genera además:
#   public/assets/hero-start.jpg|.webp|-mobile.webp  primer fotograma (se ve mientras cargan los demás)
#   public/assets/hero-poster.jpg                    último fotograma (nubes)
#   public/assets/og-image.jpg                       1200×630 para redes
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${1:-public/assets/hero.mp4}"
OUT="public/assets/frames"
FPS="${FPS:-24}"
DESKTOP_W="${DESKTOP_W:-1920}"
MOBILE_H="${MOBILE_H:-1080}"
MOBILE_CROP_X="${MOBILE_CROP_X:-0.63}"
QUALITY="${QUALITY:-62}"
OG_TIME="${OG_TIME:-12}"

command -v ffmpeg >/dev/null || {
  echo "✗ Falta ffmpeg. Instálalo con: brew install ffmpeg (macOS) · sudo apt install ffmpeg (Ubuntu/Debian) · winget install ffmpeg (Windows)"
  exit 1
}
[ -f "$SRC" ] || { echo "✗ No existe $SRC"; exit 1; }

MOBILE_CROP="crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))*${MOBILE_CROP_X}':0,scale=-2:${MOBILE_H}:flags=lanczos"
WEBP="-c:v libwebp -quality $QUALITY -compression_level 6 -preset photo"

rm -rf "$OUT/desktop" "$OUT/mobile"
mkdir -p "$OUT/desktop" "$OUT/mobile"

echo "→ Escritorio (${DESKTOP_W}px, ${FPS}fps)…"
ffmpeg -loglevel error -y -i "$SRC" -an -vf "fps=${FPS},scale=${DESKTOP_W}:-2:flags=lanczos" $WEBP "$OUT/desktop/%04d.webp"

echo "→ Móvil (${MOBILE_H}px de alto, recorte 9:16)…"
ffmpeg -loglevel error -y -i "$SRC" -an -vf "fps=${FPS},${MOBILE_CROP}" $WEBP "$OUT/mobile/%04d.webp"

COUNT=$(find "$OUT/desktop" -name '*.webp' | wc -l | tr -d ' ')
size() { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=,:p=0 "$1"; }
IFS=, read -r DW DH <<<"$(size "$OUT/desktop/0001.webp")"
IFS=, read -r MW MH <<<"$(size "$OUT/mobile/0001.webp")"
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")

cat >"$OUT/manifest.json" <<JSON
{
  "count": $COUNT,
  "fps": $FPS,
  "duration": $DURATION,
  "pad": 4,
  "desktop": { "path": "/assets/frames/desktop/", "width": $DW, "height": $DH },
  "mobile": { "path": "/assets/frames/mobile/", "width": $MW, "height": $MH }
}
JSON

echo "→ Pósters y Open Graph…"
A=public/assets
ffmpeg -loglevel error -y -i "$SRC" -vf "scale=${DESKTOP_W}:-2" -frames:v 1 -q:v 3 "$A/hero-start.jpg"
ffmpeg -loglevel error -y -i "$A/hero-start.jpg" -c:v libwebp -quality 72 "$A/hero-start.webp"
ffmpeg -loglevel error -y -i "$A/hero-start.jpg" -vf "${MOBILE_CROP}" -c:v libwebp -quality 72 "$A/hero-start-mobile.webp"
ffmpeg -loglevel error -y -sseof -0.1 -i "$SRC" -vf "scale=${DESKTOP_W}:-2" -update 1 -q:v 3 "$A/hero-poster.jpg"
ffmpeg -loglevel error -y -ss "$OG_TIME" -i "$SRC" -vf "scale=1200:-2,crop=1200:630:0:(ih-630)/2" -frames:v 1 -q:v 3 "$A/og-image.jpg"

echo "✓ $COUNT fotogramas (${DURATION}s) · escritorio ${DW}×${DH} ($(du -sh "$OUT/desktop" | cut -f1)) · móvil ${MW}×${MH} ($(du -sh "$OUT/mobile" | cut -f1))"
