import { gsap } from 'gsap';
import { FramePlayer } from './frame-player.js';

const MANIFEST_URL = '/assets/frames/manifest.json';

/** Secuencia vertical en pantallas en retrato (mantiene el edificio centrado). */
function pickVariant(manifest) {
  const portrait = window.innerWidth / window.innerHeight < 0.8;
  return portrait && manifest.mobile ? manifest.mobile : manifest.desktop;
}

/** Espera a que la página termine de cargar (no competir con el LCP) y a un momento ocioso. */
function whenIdle() {
  return new Promise((resolve) => {
    const go = () => ('requestIdleCallback' in window ? requestIdleCallback(resolve, { timeout: 1200 }) : setTimeout(resolve, 200));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });
}

export async function initHero({ reducedMotion }) {
  const hero = document.querySelector('[data-hero]');
  const canvas = hero?.querySelector('[data-hero-canvas]');
  if (!hero || !canvas || reducedMotion) return; // con movimiento reducido: solo el póster

  // Desplazamiento muy sutil del texto mientras avanza el video
  gsap.to('[data-hero-content]', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true },
  });

  await whenIdle();

  let manifest;
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(res.statusText);
    manifest = await res.json();
  } catch {
    return; // sin fotogramas: se queda el póster
  }

  // Conexiones lentas o con ahorro de datos: no descargar la secuencia
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType))) return;

  const player = new FramePlayer(canvas, { pad: manifest.pad, count: manifest.count, ...pickVariant(manifest) });
  const state = { progress: 0 };

  // Suavizado del scrub: el progreso "persigue" al scroll
  gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    onUpdate: () => player.setProgress(state.progress),
  });

  await player.preload();
  player.setProgress(state.progress);
  hero.classList.add('is-ready');
}
