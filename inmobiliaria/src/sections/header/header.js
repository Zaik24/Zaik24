const DESKTOP = window.matchMedia('(min-width: 1024px)');
const CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)');

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const nav = header.querySelector('[data-nav]');
  const burger = header.querySelector('[data-burger]');
  const items = [...header.querySelectorAll('[data-dropdown]')];

  /* ---------- Transparente sobre el hero → blanco al hacer scroll ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Dropdowns ---------- */
  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav__toggle').setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => items.forEach((it) => it !== except && setOpen(it, false));

  items.forEach((item) => {
    const toggle = item.querySelector('.nav__toggle');
    let leaveTimer;
    let hoverOpenedAt = 0;

    toggle.addEventListener('click', () => {
      // si el hover acaba de abrirlo, el clic lo mantiene abierto en vez de cerrarlo
      if (Date.now() - hoverOpenedAt < 500) return;
      const open = !item.classList.contains('is-open');
      closeAll(item);
      setOpen(item, open);
    });

    // Hover en escritorio, con una pequeña tolerancia al salir
    item.addEventListener('pointerenter', () => {
      if (!DESKTOP.matches || !CAN_HOVER.matches) return;
      clearTimeout(leaveTimer);
      if (!item.classList.contains('is-open')) hoverOpenedAt = Date.now();
      closeAll(item);
      setOpen(item, true);
    });
    item.addEventListener('pointerleave', () => {
      if (!DESKTOP.matches || !CAN_HOVER.matches) return;
      leaveTimer = setTimeout(() => setOpen(item, false), 160);
    });

    // Cerrar al salir con el teclado
    item.addEventListener('focusout', (e) => {
      if (DESKTOP.matches && !item.contains(e.relatedTarget)) setOpen(item, false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-dropdown]')) closeAll();
  });

  /* ---------- Menú móvil ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (!open) closeAll();
  };

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  nav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && nav.classList.contains('is-open')) setMenu(false);
  });

  DESKTOP.addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
    closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = items.find((it) => it.classList.contains('is-open'));
    if (open) {
      setOpen(open, false);
      open.querySelector('.nav__toggle').focus();
    } else if (nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });
}
