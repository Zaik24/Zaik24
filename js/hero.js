/* =====================================================================
   EL FAROLITO — PORTADA CONTROLADA POR SCROLL
   ---------------------------------------------------------------------
   Bajar avanza el video, subir lo retrocede, parar congela el fotograma.
   Sin autoplay, sin loop y sin secuestrar el scroll: la portada es una
   sección alta con un bloque "sticky"; el scroll normal del navegador
   decide qué fotograma se dibuja.

   Orden de respaldo:
     1. Secuencia de imágenes en <canvas> (assets/hero/frames.js)
     2. MP4 controlado por scroll (assets/video/…)
     3. Foto fija (póster / fotograma final)
   Con movimiento reducido: foto final fija, sin scroll extendido.
   ===================================================================== */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  if (!hero) return;

  var CFG = (window.SITE_CONFIG && window.SITE_CONFIG.portada) || {};
  var M = window.HERO_FRAMES || {};
  var SCREENS = CFG.alturaPantallas || 4;
  var SCENES = CFG.escenas || [[0, .3], [.36, .64], [.72, 1]];
  var FADE = 0.06; // fracción del recorrido que dura cada fundido de texto

  var media = hero.querySelector('.hero__media');
  var poster = hero.querySelector('.hero__poster');
  var canvas = hero.querySelector('.hero__canvas');
  var sceneEls = Array.prototype.slice.call(hero.querySelectorAll('.hero__scene'));
  var root = document.documentElement;

  var mqReduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var mqMobile = window.matchMedia ? matchMedia('(max-width: 760px) and (orientation: portrait)') : { matches: false };

  var mode = 'static';   // 'canvas' | 'video' | 'static'
  var progress = 0;
  var ticking = false;
  var seq = null;        // estado de la secuencia de imágenes
  var video = null;

  hero.style.setProperty('--hero-screens', SCREENS);

  /* ---------- Utilidades ---------- */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function variant() { return mqMobile.matches && M.mobile && M.mobile.count ? 'mobile' : 'desktop'; }
  function src(v, i) {
    var d = M[v];
    var n = String(i + 1);
    while (n.length < (d.pad || 4)) n = '0' + n;
    return d.path + (d.prefix || '') + n + '.' + d.ext;
  }

  /* ---------- Póster inmediato ---------- */
  function setPoster(final) {
    var p = final ? M.final : (mqMobile.matches ? M.posterMobile : M.posterDesktop);
    p = p || M.final || M.posterDesktop;
    if (!p) return;
    // Quitamos <source> para que el <picture> no sobrescriba la imagen elegida
    var source = poster.parentNode.querySelector('source');
    if (source) source.remove();
    if (poster.getAttribute('src') !== p) {
      poster.classList.remove('is-missing');
      poster.src = p;
    }
  }
  poster.addEventListener('error', function () {
    // Si el póster no existe, probamos con la foto final y si no, degradado CSS
    if (M.final && poster.getAttribute('src') !== M.final) { poster.src = M.final; return; }
    poster.classList.add('is-missing');
  });

  /* ---------- Progreso de scroll ---------- */
  function readProgress() {
    var r = hero.getBoundingClientRect();
    var range = hero.offsetHeight - window.innerHeight;
    return range > 0 ? clamp(-r.top / range, 0, 1) : 1;
  }

  /* ---------- Textos sincronizados por escena ---------- */
  function updateScenes(p) {
    sceneEls.forEach(function (el, i) {
      var s = SCENES[i] || [0, 1];
      var last = i === sceneEls.length - 1;
      var first = i === 0;
      var inT = first ? 1 : smooth((p - s[0]) / FADE);           // la primera ya está visible al llegar
      var outT = last ? 1 : smooth((s[1] - p) / FADE);            // la última no se va
      var o = Math.min(inT, outT);
      // Movimiento por capas: el texto sube un poco mientras está en escena
      var local = clamp((p - s[0]) / Math.max(.001, s[1] - s[0]), 0, 1);
      var y = (1 - o) * (p < s[0] ? 30 : -30) + (last ? 0 : (0.5 - local) * 24);
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--y', y.toFixed(1) + 'px');
      el.style.setProperty('--b', ((1 - o) * 6).toFixed(1) + 'px');
      el.classList.toggle('is-active', o > .5);
      el.setAttribute('aria-hidden', o > .5 ? 'false' : 'true');
    });
    hero.style.setProperty('--p', p.toFixed(4));
    // "Zoom" lento del video para dar profundidad (efecto 3D sutil)
    media.style.setProperty('--hero-scale', (1.04 + p * 0.06).toFixed(4));
  }

  /* =================================================================
     1) SECUENCIA DE IMÁGENES EN CANVAS
     ================================================================= */
  function startSequence() {
    var v = variant();
    var d = M[v];
    if (!d || !d.count) return false;

    // Cancelar la carga anterior (p. ej. al girar el móvil)
    if (seq) seq.cancelled = true;

    seq = {
      v: v, count: d.count, frames: new Array(d.count), loaded: new Uint8Array(d.count),
      loadedCount: 0, failed: 0, drawn: -1, cancelled: false, ctx: canvas.getContext('2d')
    };
    var s = seq;

    // Orden de precarga progresiva: primero un fotograma de cada 16, luego 8, 4, 2, 1.
    // Así toda la línea de tiempo es navegable enseguida y gana detalle poco a poco.
    var order = [], seen = new Uint8Array(d.count);
    [16, 8, 4, 2, 1].forEach(function (step) {
      for (var i = 0; i < d.count; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    if (!seen[d.count - 1]) order.push(d.count - 1);
    // El fotograma donde está el usuario (si recarga a mitad de página) va primero
    var here = Math.round(progress * (d.count - 1));
    order.splice(order.indexOf(here), 1);
    order.unshift(here);

    var next = 0, active = 0, PARALLEL = 6;

    function pump() {
      while (!s.cancelled && active < PARALLEL && next < order.length) load(order[next++]);
    }
    function load(i) {
      active++;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        active--;
        if (s.cancelled) return;
        s.frames[i] = img; s.loaded[i] = 1; s.loadedCount++;
        if (s.loadedCount === 1) onFirstFrame();
        if (Math.abs(i - targetFrame()) < 24) requestDraw();
        pump();
      };
      img.onerror = function () {
        active--;
        if (s.cancelled) return;
        s.failed++;
        // Si fallan los primeros fotogramas, la secuencia no existe: pasamos al MP4
        if (s.loadedCount === 0 && s.failed >= 3) { s.cancelled = true; fallbackToVideo(); return; }
        pump();
      };
      img.src = src(s.v, i);
    }

    function onFirstFrame() {
      mode = 'canvas';
      sizeCanvas();
      hero.classList.add('has-canvas');
      requestDraw();
    }

    pump();
    return true;
  }

  function targetFrame() {
    return seq ? Math.round(progress * (seq.count - 1)) : 0;
  }

  function nearestLoaded(i) {
    if (seq.loaded[i]) return i;
    for (var k = 1; k < seq.count; k++) {
      if (i - k >= 0 && seq.loaded[i - k]) return i - k;
      if (i + k < seq.count && seq.loaded[i + k]) return i + k;
    }
    return -1;
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      if (seq) seq.drawn = -1;
    }
  }

  function drawFrame() {
    if (!seq) return;
    var i = nearestLoaded(targetFrame());
    if (i < 0 || i === seq.drawn) return;
    var img = seq.frames[i], ctx = seq.ctx;
    var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    // "object-fit: cover"
    var sc = Math.max(cw / iw, ch / ih), dw = iw * sc, dh = ih * sc;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    seq.drawn = i;
  }

  /* =================================================================
     2) RESPALDO: MP4 CONTROLADO POR SCROLL
     ================================================================= */
  function fallbackToVideo() {
    hero.classList.remove('has-canvas');
    var file = (mqMobile.matches && M.videoMobile) || M.video;
    if (!file) return fallbackToStatic();

    video = document.createElement('video');
    video.className = 'hero__video';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.preload = 'auto';
    video.style.opacity = '0';
    video.style.transition = 'opacity .6s';
    if (M.posterDesktop) video.poster = mqMobile.matches && M.posterMobile ? M.posterMobile : M.posterDesktop;

    var ready = false;
    video.addEventListener('loadedmetadata', function () {
      ready = true;
      mode = 'video';
      hero.classList.add('has-video');
      video.style.opacity = '1';
      requestDraw();
    });
    video.addEventListener('error', fallbackToStatic);
    var srcEl = document.createElement('source');
    srcEl.src = file; srcEl.type = /\.webm$/i.test(file) ? 'video/webm' : 'video/mp4';
    srcEl.addEventListener('error', fallbackToStatic);
    video.appendChild(srcEl);
    media.appendChild(video);
    // Algunos navegadores móviles no cargan nada hasta una interacción
    setTimeout(function () { if (!ready && video) video.load(); }, 50);
    return true;
  }

  var seeking = false, pendingTime = null;
  function seekVideo() {
    if (!video || !video.duration) return;
    var t = progress * (video.duration - 0.05);
    if (seeking) { pendingTime = t; return; }
    if (Math.abs(video.currentTime - t) < 0.01) return;
    seeking = true;
    if (video.fastSeek && Math.abs(video.currentTime - t) > 1.5) video.fastSeek(t); else video.currentTime = t;
  }
  document.addEventListener('seeked', function (e) {
    if (e.target !== video) return;
    seeking = false;
    if (pendingTime !== null) { pendingTime = null; seekVideo(); }
  }, true);

  /* =================================================================
     3) RESPALDO FINAL: FOTO FIJA
     ================================================================= */
  function fallbackToStatic() {
    if (mode === 'static' && hero.classList.contains('is-static')) return;
    if (video) { video.remove(); video = null; }
    mode = 'static';
    hero.classList.remove('has-video', 'has-canvas');
    hero.classList.add('is-static');
    setPoster(true);
    progress = 1;
    updateScenes(1);
  }

  /* ---------- Bucle de dibujo (solo cuando hay scroll) ---------- */
  function requestDraw() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }
  function render() {
    ticking = false;
    if (mode === 'static') return;
    progress = readProgress();
    updateScenes(progress);
    if (mode === 'canvas') drawFrame();
    else if (mode === 'video') seekVideo();
  }

  function onScroll() { if (mode !== 'static') requestDraw(); }
  function onResize() {
    if (mode === 'canvas') sizeCanvas();
    requestDraw();
  }

  /* ---------- Arranque ---------- */
  function start() {
    if (mqReduce.matches) { fallbackToStatic(); return; }
    hero.classList.remove('is-static');
    setPoster(false);
    progress = readProgress();
    updateScenes(progress);
    mode = 'pending';
    if (!startSequence()) fallbackToVideo();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  // Cambiar de escritorio a móvil (o girar la pantalla) cambia la secuencia
  function onVariantChange() {
    if (mode !== 'canvas' || !seq || seq.v === variant()) return;
    startSequence();
  }
  if (mqMobile.addEventListener) mqMobile.addEventListener('change', onVariantChange);

  // Si el usuario activa "reducir movimiento" en marcha, respetarlo
  function onReduceChange() {
    root.classList.toggle('reduced-motion', mqReduce.matches);
    if (mqReduce.matches) { if (seq) seq.cancelled = true; fallbackToStatic(); }
    else location.reload();
  }
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduceChange);

  start();
})();
