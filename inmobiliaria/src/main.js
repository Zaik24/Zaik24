import './styles/tokens.css';
import './styles/base.css';
import './sections/header/header.css';
import './sections/hero/hero.css';
import './sections/manifiesto/manifiesto.css';
import './sections/agentes/agentes.css';
import './sections/ayuda/ayuda.css';
import './sections/servicios/servicios.css';
import './sections/footer/footer.css';

import { initHeader } from './sections/header/header.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initHeader();

// GSAP + ScrollTrigger (reveals y hero) se cargan cuando el navegador está libre
const loadMotion = () => import('./lib/motion.js').then((m) => m.initMotion({ reducedMotion }));
const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
if (document.readyState === 'complete') idle(loadMotion, { timeout: 1500 });
else window.addEventListener('load', () => idle(loadMotion, { timeout: 1500 }), { once: true });
