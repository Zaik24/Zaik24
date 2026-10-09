/**
 * Reels de YouTube con fachada liviana: se muestra la miniatura y el iframe
 * (youtube-nocookie) solo se crea al hacer clic. Sin JS, el enlace abre YouTube.
 * <meta name="reels-embed" content="off"> desactiva el reproductor en línea.
 */
export function initReels() {
  const inline = document.querySelector('meta[name="reels-embed"]')?.content !== 'off';

  document.addEventListener('click', (e) => {
    const reel = e.target.closest('a.reel[data-yt]');
    if (!reel || !inline || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${reel.dataset.yt}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    iframe.title = reel.getAttribute('aria-label')?.replace('Reproducir video: ', '') ?? 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    reel.replaceChildren(iframe);
    reel.removeAttribute('href');
  });

  // Miniaturas o logos que no cargan: queda el fondo degradado o las iniciales
  document.querySelectorAll('.client__logo img, .reel img').forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && !img.naturalWidth) drop();
    else img.addEventListener('error', drop, { once: true });
  });
}

/** Carrusel con scroll-snap nativo y botones anterior/siguiente. */
export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.carousel__track');
    const section = root.closest('section');
    const prev = section.querySelector('[data-carousel-prev]');
    const next = section.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    const step = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? (card.getBoundingClientRect().width + gap) * Math.max(1, Math.floor(track.clientWidth / card.offsetWidth)) : track.clientWidth;
    };
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
    next.addEventListener('click', () => track.scrollBy({ left: step() }));
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
  });
}
