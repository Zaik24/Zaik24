import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Fade + 20px hacia arriba al entrar en el viewport, una sola vez.
 * Los elementos que entran juntos se escalonan levemente.
 */
export function initReveal({ reducedMotion }) {
  const els = gsap.utils.toArray('[data-reveal]');
  if (!els.length || reducedMotion) return;

  gsap.set(els, { opacity: 0, y: 20 });

  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.08,
        overwrite: true,
        clearProps: 'transform',
      }),
  });
}
