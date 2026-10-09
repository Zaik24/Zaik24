import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHero } from '../sections/hero/hero.js';
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';

/** Todo lo que depende de GSAP: se carga aparte para no bloquear el primer pintado. */
export function initMotion({ reducedMotion }) {
  gsap.registerPlugin(ScrollTrigger);
  initReveal({ reducedMotion });
  initCounters({ reducedMotion });
  initHero({ reducedMotion });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
