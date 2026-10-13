import { gsap } from 'gsap';

/** Zoom suave ligado al scroll en imágenes [data-parallax] (de 1.12 a 1 mientras cruzan la pantalla). */
export function initParallax({ reducedMotion }) {
  if (reducedMotion) return;
  gsap.utils.toArray('[data-parallax]').forEach((img) => {
    img.style.transition = 'none'; // el zoom lo maneja el scroll, no la transición de hover
    gsap.fromTo(
      img,
      { scale: 1.12 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}
