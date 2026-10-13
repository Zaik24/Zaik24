import { gsap } from 'gsap';

// "Antes de existir…": las 4 flechas aparecen una tras otra, de izquierda a derecha.
export function initStory({ reducedMotion }) {
  const list = document.querySelector('.story');
  if (!list || reducedMotion) return;
  const items = list.querySelectorAll('.story__item');

  gsap.set(items, { opacity: 0, x: -28 });
  gsap.to(items, {
    opacity: 1,
    x: 0,
    duration: 0.9,
    ease: 'power2.out',
    stagger: 0.22,
    clearProps: 'transform',
    scrollTrigger: { trigger: list, start: 'top 80%', once: true },
  });
}
