import { gsap } from 'gsap';
import { FramePlayer } from './frame-player.js';

const MANIFEST_URL = '/assets/frames/manifest.json';

/**
 * Etapas del video (stateviewheader.mp4, 16,27 s) y en qué punto del scroll del hero ocurren.
 * El scroll se mapea por tramos al tiempo del video, así cada etapa coincide con su texto:
 *   0–15 %  terreno vacío (0–0,75 s)          → titular y subtítulo
 *  15–70 %  construcción (0,75–11 s)          → el texto se desvanece y sube 20 px
 *  70–85 %  casa terminada (11–13,5 s)        → botón "Ver proyectos"
 *  85–100 % la cámara sube a las nubes (13,5 s–fin) → el botón se va y todo se funde con #F6F5F2
 * Para otro video, ajusta los tiempos (segundos). `null` = final del video.
 */
export const STAGES = [
  { scroll: 0, time: 0 },
  { scroll: 0.15, time: 0.75 },
  { scroll: 0.7, time: 11.0 },
  { scroll: 0.85, time: 13.5 },
  { scroll: 1, time: null },
];

/** Momentos del texto (en progreso de scroll 0–1). */
const TEXT = {
  introOut: [0.15, 0.25], // titular y subtítulo se desvanecen
  ctaIn: [0.7, 0.74], // aparece el botón
  ctaOut: [0.85, 0.89], // se va el botón
  fadeToPage: [0.92, 1], // nubes → #F6F5F2
};

/** Progreso de scroll (0–1) → progreso del video (0–1), lineal por tramos. */
function scrollToVideo(p, duration) {
  const t = (s) => (s.time ?? duration) / duration;
  for (let i = 1; i < STAGES.length; i++) {
    const a = STAGES[i - 1];
    const b = STAGES[i];
    if (p <= b.scroll) {
      const k = (p - a.scroll) / (b.scroll - a.scroll || 1);
      return t(a) + (t(b) - t(a)) * Math.min(1, Math.max(0, k));
    }
  }
  return 1;
}

/** Secuencia vertical en pantallas en retrato (la casa queda centrada). */
function pickVariant(manifest) {
  const portrait = window.innerWidth / window.innerHeight < 0.8;
  return portrait && manifest.mobile
    ? { ...manifest.mobile, focusX: 0.5 }
    : { ...manifest.desktop, focusX: 0.57 };
}

/**
 * Empieza a descargar la secuencia con la primera interacción (scroll, toque, tecla) o a los 4 s.
 * El primer 15 % del scroll es el terreno vacío, casi idéntico al primer fotograma que ya se ve,
 * así que hay margen para que lleguen los fotogramas sin bloquear la carga inicial.
 */
function whenUserEngages(timeout = 4000) {
  return new Promise((resolve) => {
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    let timer;
    const go = () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, go));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    const arm = () => (timer = setTimeout(go, timeout));
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
  });
}

const SCRUB = 0.5; // segundos de suavizado: texto y video usan el mismo

function initHeroText(hero) {
  const at = ([start]) => start;
  const len = ([start, end]) => end - start;
  const intro = hero.querySelector('[data-hero-text]');
  const cta = hero.querySelector('[data-hero-cta]');
  const fade = hero.querySelector('[data-hero-fade]');

  // Línea de tiempo de duración 1 = progreso del scroll del hero; todo es reversible
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: SCRUB },
    })
    .to(intro, { opacity: 0, y: -20, ease: 'power1.in', duration: len(TEXT.introOut) }, at(TEXT.introOut))
    .fromTo(cta, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: len(TEXT.ctaIn) }, at(TEXT.ctaIn))
    .to(cta, { autoAlpha: 0, y: -12, ease: 'power1.in', duration: len(TEXT.ctaOut) }, at(TEXT.ctaOut))
    .to(fade, { opacity: 1, ease: 'power1.inOut', duration: len(TEXT.fadeToPage) }, at(TEXT.fadeToPage))
    .set({}, {}, 1);
}

export async function initHero({ reducedMotion }) {
  const hero = document.querySelector('[data-hero]');
  const canvas = hero?.querySelector('[data-hero-canvas]');
  if (!hero || !canvas || reducedMotion) return; // con movimiento reducido: solo el primer fotograma

  initHeroText(hero);

  await whenUserEngages();

  let manifest;
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(res.statusText);
    manifest = await res.json();
  } catch {
    return; // sin fotogramas: se queda el primer fotograma fijo
  }

  // Conexiones lentas o con ahorro de datos: no descargar la secuencia
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType))) return;

  const { focusX, ...seq } = pickVariant(manifest);
  const player = new FramePlayer(canvas, { pad: manifest.pad, count: manifest.count, ...seq }, { focusX });
  const duration = manifest.duration ?? manifest.count / manifest.fps;
  const state = { progress: 0 };
  const render = () => player.setProgress(scrollToVideo(state.progress, duration));

  gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: SCRUB },
    onUpdate: render,
  });

  await player.preload(navigator.hardwareConcurrency > 4 ? 6 : 4);
  render();
  hero.classList.add('is-ready');
}
