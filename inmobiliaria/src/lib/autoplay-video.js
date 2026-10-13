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

// Botón de sonido sobre un video en bucle (empieza silenciado)
export function initSoundToggles() {
  document.querySelectorAll('[data-sound-toggle]').forEach((btn) => {
    const video = btn.parentElement.querySelector('video');
    const label = btn.querySelector('.sound-toggle__label');
    btn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) {
        video.preload = 'auto';
        video.play().catch(() => {});
      }
      btn.setAttribute('aria-pressed', String(!video.muted));
      label.textContent = video.muted ? 'Activar sonido' : 'Silenciar';
    });
  });
}
