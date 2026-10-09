import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Cuenta de 0 al número de [data-count] cuando entra en pantalla (una sola vez).
 * El HTML ya trae el número final: sin JS o con movimiento reducido se ve tal cual.
 */
export function initCounters({ reducedMotion }) {
  if (reducedMotion) return;
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    el.style.minWidth = `${String(target).length}ch`; // ancho final reservado: nada salta
    const state = { n: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          n: target,
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.15,
          onUpdate: () => (el.textContent = String(Math.round(state.n))),
        }),
    });
  });
}
