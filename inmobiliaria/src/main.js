import './styles/tokens.css';
import './styles/base.css';
import './sections/header/header.css';
import './sections/hero/hero.css';
import './sections/confianza/confianza.css';
import './sections/porque/porque.css';
import './sections/proceso/proceso.css';
import './sections/clientes/clientes.css';
import './sections/avatares/avatares.css';
import './sections/para-ti/para-ti.css';
import './sections/precios/precios.css';
import './sections/pagos/pagos.css';
import './sections/faq/faq.css';
import './sections/cta/cta.css';
import './sections/footer/footer.css';

import { initHeader } from './sections/header/header.js';
import { initCarousels, initReels } from './lib/reels.js';
import { initAutoplayVideos } from './lib/autoplay-video.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initHeader();
initReels();
initCarousels();
initAutoplayVideos({ reducedMotion });

// GSAP + ScrollTrigger (reveals y hero) se cargan cuando el navegador está libre
const loadMotion = () => import('./lib/motion.js').then((m) => m.initMotion({ reducedMotion }));
const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
if (document.readyState === 'complete') idle(loadMotion, { timeout: 1500 });
else window.addEventListener('load', () => idle(loadMotion, { timeout: 1500 }), { once: true });
