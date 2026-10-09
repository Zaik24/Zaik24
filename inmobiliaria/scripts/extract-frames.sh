#!/usr/bin/env bash
# Extrae los fotogramas del video del hero a WebP para el scroll scrubbing en <canvas>.
#
#   npm run frames                      # usa public/assets/hero.mp4
#   npm run frames -- otro-video.mp4
#
# Variables opcionales:
#   FPS=24            fotogramas por segundo a extraer
#   DESKTOP_W=1920    ancho de la secuencia de escritorio
#   MOBILE_H=1080     alto de la secuencia móvil (recorte vertical 9:16 centrado en el edificio)
#   MOBILE_CROP_X=0.5 centro horizontal del recorte móvil (0 = izquierda, 1 = derecha)
#   QUALITY=72        calidad WebP (0-100)
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${1:-public/assets/hero.mp4}"
OUT="public/assets/frames"
FPS="${FPS:-24}"
DESKTOP_W="${DESKTOP_W:-1920}"
MOBILE_H="${MOBILE_H:-1080}"
MOBILE_CROP_X="${MOBILE_CROP_X:-0.5}"
QUALITY="${QUALITY:-72}"

command -v ffmpeg >/dev/null || { echo "✗ Falta ffmpeg (brew install ffmpeg / apt install ffmpeg)"; exit 1; }
[ -f "$SRC" ] || { echo "✗ No existe $SRC"; exit 1; }

rm -rf "$OUT/desktop" "$OUT/mobile"
mkdir -p "$OUT/desktop" "$OUT/mobile"

echo "→ Escritorio (${DESKTOP_W}px, ${FPS}fps)…"
ffmpeg -loglevel error -y -i "$SRC" \
  -vf "fps=${FPS},scale=${DESKTOP_W}:-2:flags=lanczos" \
  -c:v libwebp -quality "$QUALITY" -compression_level 6 -preset photo \
  "$OUT/desktop/%04d.webp"

echo "→ Móvil (${MOBILE_H}px de alto, recorte 9:16)…"
ffmpeg -loglevel error -y -i "$SRC" \
  -vf "fps=${FPS},crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))*${MOBILE_CROP_X}':0,scale=-2:${MOBILE_H}:flags=lanczos" \
  -c:v libwebp -quality "$QUALITY" -compression_level 6 -preset photo \
  "$OUT/mobile/%04d.webp"

COUNT=$(find "$OUT/desktop" -name '*.webp' | wc -l | tr -d ' ')
size() { ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=,:p=0 "$1"; }
IFS=, read -r DW DH <<<"$(size "$OUT/desktop/0001.webp")"
IFS=, read -r MW MH <<<"$(size "$OUT/mobile/0001.webp")"

cat >"$OUT/manifest.json" <<JSON
{
  "count": $COUNT,
  "fps": $FPS,
  "pad": 4,
  "desktop": { "path": "/assets/frames/desktop/", "width": $DW, "height": $DH },
  "mobile": { "path": "/assets/frames/mobile/", "width": $MW, "height": $MH }
}
JSON

echo "✓ $COUNT fotogramas · escritorio ${DW}×${DH} ($(du -sh "$OUT/desktop" | cut -f1)) · móvil ${MW}×${MH} ($(du -sh "$OUT/mobile" | cut -f1))"
