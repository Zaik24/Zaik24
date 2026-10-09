/* =====================================================================
   EL FAROLITO — IDIOMAS (ES / EN)
   Lee los textos de contenido/textos.js y los aplica a:
     data-i18n="clave"            → texto plano
     data-i18n-html="clave"       → texto con <em> / <br>
     data-i18n-attr="attr:clave"  → atributos (alt, aria-label…), separados por ;
     data-i18n-list="clave"       → lista de líneas
   ===================================================================== */
(function () {
  'use strict';

  var TEXT = window.SITE_TEXT || {};
  var CFG = window.SITE_CONFIG || {};
  var LANGS = ['es', 'en'];
  var STORAGE_KEY = 'elfarolito-lang';
  var listeners = [];
  var current = null;

  function get(lang, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, TEXT[lang]);
  }

  function t(path, lang) {
    lang = lang || current;
    var v = get(lang, path);
    if (v === undefined) v = get('es', path);
    return v;
  }

  function store(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  function initialLang() {
    var m = /[?&]lang=(es|en)\b/.exec(location.search);
    if (m) return m[1];
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.indexOf(saved) > -1) return saved;
    } catch (e) {}
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    nav = nav.slice(0, 2).toLowerCase();
    if (LANGS.indexOf(nav) > -1) return nav;
    return LANGS.indexOf(CFG.idiomaPorDefecto) > -1 ? CFG.idiomaPorDefecto : 'es';
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) < 0) lang = 'es';
    current = lang;
    document.documentElement.lang = lang;

    var title = t('meta.title');
    if (title) document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && t('meta.description')) desc.setAttribute('content', t('meta.description'));

    each('[data-i18n]', function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    });
    each('[data-i18n-html]', function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (typeof v === 'string') el.innerHTML = v;
    });
    each('[data-i18n-attr]', function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i < 0) return;
        var v = t(pair.slice(i + 1).trim());
        if (typeof v === 'string') el.setAttribute(pair.slice(0, i).trim(), v);
      });
    });
    each('[data-i18n-list]', function (el) {
      var v = t(el.getAttribute('data-i18n-list')) || [];
      el.innerHTML = '';
      v.forEach(function (line) {
        var s = document.createElement('span');
        s.className = 'line';
        s.textContent = line;
        el.appendChild(s);
      });
    });
    // Ocultar bloques cuyo texto/lista esté vacío
    each('[data-if-text]', function (el) {
      var v = t(el.getAttribute('data-if-text'));
      el.hidden = !(v && v.length);
    });

    each('.lang__btn', function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });

    listeners.forEach(function (fn) { fn(lang); });
  }

  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  function set(lang) {
    store(lang);
    apply(lang);
  }

  window.I18N = {
    t: t,
    set: set,
    get lang() { return current; },
    onChange: function (fn) { listeners.push(fn); }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang__btn');
    if (b) set(b.getAttribute('data-lang'));
  });

  apply(initialLang());
})();
