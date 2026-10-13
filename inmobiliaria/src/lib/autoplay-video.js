// Videos decorativos (muted + loop): se cargan y reproducen solo mientras están en pantalla.
// Con reduced motion se queda el póster.
export function initAutoplayVideos({ reducedMotion }) {
  const videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length || reducedMotion || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const { target: video, isIntersecting } of entries) {
        if (isIntersecting) {
          video.preload = 'auto';
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      }
    },
    { rootMargin: '200px 0px', threshold: 0.15 },
  );
  videos.forEach((v) => io.observe(v));
}
