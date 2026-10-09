/* Manifiesto de la portada.
   Se genera automáticamente con herramientas/preparar-portada.sh.
   Mientras "count" sea 0, la portada usa el MP4 y, si tampoco existe,
   la foto fija o un degradado de respaldo. */
window.HERO_FRAMES = {
  desktop: { path: "assets/hero/desktop/", prefix: "f_", ext: "webp", pad: 4, count: 0 },
  mobile:  { path: "assets/hero/mobile/",  prefix: "f_", ext: "webp", pad: 4, count: 0 },
  posterDesktop: "assets/hero/poster-desktop.jpg",
  posterMobile: "assets/hero/poster-mobile.jpg",
  final: "assets/hero/final.jpg",
  video: "assets/video/portada.mp4",
  videoMobile: "assets/video/portada-movil.mp4"
};
