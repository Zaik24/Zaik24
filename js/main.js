/* =====================================================================
   EL FAROLITO — INTERACCIÓN GENERAL
   Navegación, carta, fotos, parallax, apariciones y reservas.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var I18N = window.I18N;
  var reduce = document.documentElement.classList.contains('reduced-motion');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- Fotos: marcador elegante si falta el archivo ---------- */
  function guardImage(img, box) {
    box = box || img.parentElement;
    if (img.dataset.placeholder) box.setAttribute('data-placeholder', img.dataset.placeholder);
    function fail() { box.classList.add('is-missing'); }
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
  }
  $$('.photo img').forEach(function (img) { guardImage(img, img.closest('.photo')); });

  /* ---------- Carta (desde contenido/textos.js) ---------- */
  function renderCarta() {
    var cats = I18N.t('carta.categorias') || [];
    $$('#carta-grid .dish').forEach(function (card) {
      var cat = cats.filter(function (c) { return c.id === card.dataset.cat; })[0];
      if (!cat) { card.hidden = true; return; }
      card.hidden = false;

      var photo = $('.dish__photo', card);
      if (!photo) {
        photo = document.createElement('div');
        photo.className = 'dish__photo';
        var img = document.createElement('img');
        img.loading = 'lazy'; img.decoding = 'async';
        img.dataset.placeholder = card.dataset.placeholder || '';
        img.src = card.dataset.foto;
        photo.appendChild(img);
        card.appendChild(photo);
        guardImage(img, photo);
        card.appendChild(document.createElement('h3'));
        card.appendChild(document.createElement('p'));
      }
      $('img', photo).alt = cat.fotoAlt || cat.titulo;
      $('h3', card).textContent = cat.titulo;
      $('p', card).textContent = cat.desc || '';

      var old = $('.dish__list', card);
      if (old) old.remove();
      if (cat.platos && cat.platos.length) {
        var ul = document.createElement('ul');
        ul.className = 'dish__list';
        cat.platos.forEach(function (p) {
          var li = document.createElement('li');
          var n = document.createElement('span'); n.className = 'dish__name'; n.textContent = p.nombre || '';
          var pr = document.createElement('span'); pr.className = 'dish__price'; pr.textContent = p.precio || '';
          li.appendChild(n); li.appendChild(pr);
          if (p.desc) { var d = document.createElement('span'); d.className = 'dish__desc'; d.textContent = p.desc; li.appendChild(d); }
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }
    });
  }
  renderCarta();
  I18N.onChange(renderCarta);

  /* ---------- Datos de contacto (desde contenido/config.js) ---------- */
  var hrefs = {
    tel: CFG.telefono ? 'tel:' + CFG.telefono.replace(/[^\d+]/g, '') : '',
    mailto: CFG.email ? 'mailto:' + CFG.email : '',
    whatsapp: CFG.whatsapp ? 'https://wa.me/' + String(CFG.whatsapp).replace(/\D/g, '') : '',
    instagram: CFG.instagram || '',
    mapa: CFG.mapa || ''
  };
  $$('[data-cfg]').forEach(function (el) { el.textContent = CFG[el.dataset.cfg] || ''; });
  $$('[data-cfg-href]').forEach(function (el) {
    var h = hrefs[el.dataset.cfgHref];
    if (h) el.href = h; else el.hidden = true;
  });
  $$('[data-if]').forEach(function (el) {
    el.hidden = !el.dataset.if.split('|').some(function (k) { return CFG[k]; });
  });

  /* ---------- Navegación ---------- */
  var nav = $('#nav');
  var hero = $('#hero');
  var toggle = $('.nav__toggle');
  var links = $('#nav-links');

  function updateNav() {
    var limit = hero ? hero.offsetTop + hero.offsetHeight - nav.offsetHeight - 1 : 40;
    nav.classList.toggle('is-solid', window.scrollY > limit);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav, { passive: true });
  updateNav();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-label', I18N.t(open ? 'a11y.close' : 'a11y.menu'));
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  I18N.onChange(function () { setMenu(toggle.getAttribute('aria-expanded') === 'true'); });

  /* ---------- Apariciones al entrar en pantalla ---------- */
  var reveals = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Parallax suave en fotos (movimiento por capas) ---------- */
  var par = $$('.parallax');
  if (!reduce && par.length) {
    var pending = false;
    var update = function () {
      pending = false;
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.dataset.speed) || 0.08;
        // -1 (entrando por abajo) → 1 (saliendo por arriba)
        var t = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        var img = el.tagName === 'IMG' ? el : $('img', el);
        if (img) img.style.setProperty('--py', (-8 + t * speed * 100).toFixed(2) + '%');
      });
    };
    var req = function () { if (!pending) { pending = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req, { passive: true });
    update();
  }

  /* ---------- Reservas (WhatsApp o email; sin servidor) ---------- */
  var form = $('#booking');
  if (form) {
    var btnWa = $('[data-channel="whatsapp"]', form);
    var btnMail = $('[data-channel="email"]', form);
    btnWa.hidden = !hrefs.whatsapp;
    btnMail.hidden = !hrefs.mailto;
    $('.booking__none', form).hidden = !!(hrefs.whatsapp || hrefs.mailto);

    var fecha = $('#b-fecha');
    var d = new Date();
    fecha.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    var channel = 'whatsapp';
    [btnWa, btnMail].forEach(function (b) { b.addEventListener('click', function () { channel = b.dataset.channel; }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('input[required]', form).forEach(function (inp) {
        var bad = !inp.value.trim() || !inp.checkValidity();
        inp.closest('.field').classList.toggle('is-invalid', bad);
        inp.setAttribute('aria-invalid', String(bad));
        if (bad && ok) { inp.focus(); ok = false; }
      });
      $('.booking__error', form).hidden = ok;
      if (!ok) return;

      var f = form.elements;
      var L = function (k) { return I18N.t('reservas.' + k); };
      var body = [
        L('mensaje'), '',
        L('nombre') + ': ' + f.nombre.value.trim(),
        L('fecha') + ': ' + f.fecha.value,
        L('hora') + ': ' + f.hora.value,
        L('personas') + ': ' + f.personas.value,
        L('telefono') + ': ' + f.telefono.value.trim()
      ];
      if (f.notas.value.trim()) body.push(L('notas').replace(/\s*\(.*\)$/, '') + ': ' + f.notas.value.trim());
      var text = body.join('\n');

      if (channel === 'email' && hrefs.mailto) {
        location.href = hrefs.mailto + '?subject=' + encodeURIComponent(L('kicker') + ' — ' + (CFG.nombre || 'El Farolito')) +
          '&body=' + encodeURIComponent(text);
      } else if (hrefs.whatsapp) {
        window.open(hrefs.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    });
  }

  /* ---------- Año del pie ---------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
