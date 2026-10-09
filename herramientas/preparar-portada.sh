#!/usr/bin/env bash
# =====================================================================
# EL FAROLITO — Prepara la portada a partir del video terminado
# ---------------------------------------------------------------------
# Uso:
#   ./herramientas/preparar-portada.sh fuente/portada.mp4
#
# Genera (todo dentro de assets/):
#   hero/desktop/f_0001.webp …   secuencia para escritorio (horizontal)
#   hero/mobile/f_0001.webp  …   secuencia para móvil (vertical 9:16, recorte central)
#   hero/poster-desktop.jpg      primer fotograma (carga inmediata)
#   hero/poster-mobile.jpg
#   hero/final.jpg               último fotograma (movimiento reducido / respaldo)
#   video/portada.mp4            MP4 optimizado (respaldo controlado por scroll)
#   video/portada-movil.mp4
#   hero/frames.js               manifiesto que lee js/hero.js
#
# Ajustes opcionales (variables de entorno):
#   FRAMES_DESKTOP=150  FRAMES_MOBILE=100   número de fotogramas
#   WIDTH_DESKTOP=1600                       ancho de la secuencia de escritorio
#   MOBILE_W=720 MOBILE_H=1280               tamaño de la secuencia móvil
#   QUALITY=70                               calidad WebP (0–100)
#   MOBILE_CROP_X=0.5                        centro del recorte móvil (0 = izq., 1 = der.)
# Requiere: ffmpeg y ffprobe.
# =====================================================================
set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" ]]; then
  SRC="$(ls fuente/*.{mp4,mov,MP4,MOV,webm,m4v} 2>/dev/null | head -n1 || true)"
fi
if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "✗ No encuentro el video. Uso: $0 ruta/al/video.mp4" >&2
  exit 1
fi
command -v ffmpeg >/dev/null || { echo "✗ Falta ffmpeg" >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "✗ Falta ffprobe" >&2; exit 1; }

SRC="$(cd "$(dirname "$SRC")" && pwd)/$(basename "$SRC")"   # ruta absoluta
cd "$(dirname "$0")/.."

FRAMES_DESKTOP="${FRAMES_DESKTOP:-150}"
FRAMES_MOBILE="${FRAMES_MOBILE:-100}"
WIDTH_DESKTOP="${WIDTH_DESKTOP:-1600}"
MOBILE_W="${MOBILE_W:-720}"
MOBILE_H="${MOBILE_H:-1280}"
QUALITY="${QUALITY:-70}"
MOBILE_CROP_X="${MOBILE_CROP_X:-0.5}"

HERO=assets/hero
VID=assets/video
mkdir -p "$HERO" "$VID"

DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")"
echo "→ Video: $SRC (${DUR}s)"

fps_for() { awk -v n="$1" -v d="$DUR" 'BEGIN { printf "%.6f", n / d }'; }

# Escala a lo alto y recorta a 9:16 alrededor de MOBILE_CROP_X
MOBILE_VF="scale=-2:${MOBILE_H}:flags=lanczos,crop=${MOBILE_W}:${MOBILE_H}:(iw-${MOBILE_W})*${MOBILE_CROP_X}:0"
DESKTOP_VF="scale='min(${WIDTH_DESKTOP},iw)':-2:flags=lanczos"

extract() { # $1 carpeta  $2 nº fotogramas  $3 filtro
  local dir="$HERO/$1" tmp="$HERO/.$1.tmp"
  rm -rf "$tmp"; mkdir -p "$tmp"
  ffmpeg -v error -stats -i "$SRC" -an \
    -vf "fps=$(fps_for "$2"),$3" \
    -c:v libwebp -quality "$QUALITY" -compression_level 6 -preset photo \
    "$tmp/f_%04d.webp"
  rm -rf "$dir"; mv "$tmp" "$dir"
  ls "$dir" | wc -l | tr -d ' '
}

echo "→ Secuencia de escritorio…"
COUNT_D="$(extract desktop "$FRAMES_DESKTOP" "$DESKTOP_VF" | tail -n1)"
echo "→ Secuencia móvil…"
COUNT_M="$(extract mobile "$FRAMES_MOBILE" "$MOBILE_VF" | tail -n1)"

echo "→ Pósters…"
ffmpeg -v error -y -i "$SRC" -frames:v 1 -vf "$DESKTOP_VF" -q:v 3 "$HERO/poster-desktop.jpg"
ffmpeg -v error -y -i "$SRC" -frames:v 1 -vf "$MOBILE_VF" -q:v 3 "$HERO/poster-mobile.jpg"
ffmpeg -v error -y -sseof -0.25 -i "$SRC" -update 1 -vf "$DESKTOP_VF" -q:v 3 "$HERO/final.jpg"

echo "→ MP4 de respaldo (fotogramas clave frecuentes para mover el video con el scroll)…"
ffmpeg -v error -stats -y -i "$SRC" -an -vf "scale='min(1280,iw)':-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 26 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$VID/portada.mp4"
ffmpeg -v error -stats -y -i "$SRC" -an -vf "scale=-2:960:flags=lanczos,crop=540:960:(iw-540)*${MOBILE_CROP_X}:0,format=yuv420p" \
  -c:v libx264 -preset slow -crf 27 -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$VID/portada-movil.mp4"

cat > "$HERO/frames.js" <<EOF
/* Generado por herramientas/preparar-portada.sh — no editar a mano. */
window.HERO_FRAMES = {
  desktop: { path: "assets/hero/desktop/", prefix: "f_", ext: "webp", pad: 4, count: ${COUNT_D} },
  mobile:  { path: "assets/hero/mobile/",  prefix: "f_", ext: "webp", pad: 4, count: ${COUNT_M} },
  posterDesktop: "assets/hero/poster-desktop.jpg",
  posterMobile: "assets/hero/poster-mobile.jpg",
  final: "assets/hero/final.jpg",
  video: "assets/video/portada.mp4",
  videoMobile: "assets/video/portada-movil.mp4"
};
EOF

echo "✓ Listo: ${COUNT_D} fotogramas de escritorio, ${COUNT_M} móviles."
du -sh "$HERO/desktop" "$HERO/mobile" "$VID"/*.mp4 2>/dev/null || true
