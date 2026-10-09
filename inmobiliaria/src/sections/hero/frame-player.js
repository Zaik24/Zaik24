/**
 * Reproduce una secuencia de fotogramas WebP en un <canvas> (scroll scrubbing).
 * - Carga progresiva: primero el primer y el último fotograma, luego subdivide,
 *   así el scrub funciona "a saltos" en seguida y gana fluidez mientras carga.
 * - Dibuja solo en requestAnimationFrame y solo si cambia el fotograma.
 * - Si el fotograma pedido aún no cargó, muestra el más cercano disponible.
 */
export class FramePlayer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{count:number, pad:number, path:string, width:number, height:number}} seq
   * @param {{focusX?:number, focusY?:number}} [opts] punto focal del recorte (0–1)
   */
  constructor(canvas, seq, { focusX = 0.5, focusY = 0.5 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.seq = seq;
    this.focusX = focusX;
    this.focusY = focusY;
    this.frames = new Array(seq.count);
    this.target = 0;
    this.drawn = -1;
    this.raf = 0;
    this.destroyed = false;

    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(canvas);
    this.resize();
  }

  url(i) {
    return `${this.seq.path}${String(i + 1).padStart(this.seq.pad, '0')}.webp`;
  }

  /** Orden de carga: 0, último, y luego mitades sucesivas. */
  loadOrder() {
    const n = this.seq.count;
    const order = [0, n - 1];
    const seen = new Set(order);
    for (let step = 2 ** Math.ceil(Math.log2(n)); step >= 1; step /= 2) {
      for (let i = 0; i < n; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    return order;
  }

  /**
   * Precarga todos los fotogramas con concurrencia limitada.
   * @returns {Promise<void>} se resuelve cuando el primer fotograma está listo.
   */
  preload(concurrency = 6) {
    const queue = this.loadOrder();
    let resolveFirst;
    const first = new Promise((r) => (resolveFirst = r));

    const next = async () => {
      while (queue.length && !this.destroyed) {
        const i = queue.shift();
        const img = new Image();
        img.decoding = 'async';
        img.src = this.url(i);
        try {
          await img.decode();
        } catch {
          continue; // fotograma faltante: se usará el vecino más cercano
        }
        this.frames[i] = img;
        if (i === 0) resolveFirst();
        // redibuja si este fotograma está más cerca del objetivo que el actual
        if (Math.abs(i - this.target) < Math.abs(this.drawn - this.target)) this.requestDraw();
      }
    };
    for (let k = 0; k < concurrency; k++) next();
    return first;
  }

  nearest(i) {
    const n = this.seq.count;
    if (this.frames[i]) return i;
    for (let d = 1; d < n; d++) {
      if (i - d >= 0 && this.frames[i - d]) return i - d;
      if (i + d < n && this.frames[i + d]) return i + d;
    }
    return -1;
  }

  /** @param {number} progress 0–1 */
  setProgress(progress) {
    const n = this.seq.count;
    this.target = Math.min(n - 1, Math.max(0, Math.round(progress * (n - 1))));
    this.requestDraw();
  }

  requestDraw() {
    if (!this.raf) this.raf = requestAnimationFrame(this.draw);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (w && h && (w !== this.canvas.width || h !== this.canvas.height)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.drawn = -1;
      this.requestDraw();
    }
  }

  draw() {
    this.raf = 0;
    const i = this.nearest(this.target);
    if (i < 0 || i === this.drawn) return;
    const img = this.frames[i];
    const { width: cw, height: ch } = this.canvas;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // equivalente a object-fit: cover con punto focal
    const s = Math.max(cw / iw, ch / ih);
    const dw = iw * s;
    const dh = ih * s;
    this.ctx.drawImage(img, (cw - dw) * this.focusX, (ch - dh) * this.focusY, dw, dh);
    this.drawn = i;
  }

  destroy() {
    this.destroyed = true;
    this.ro.disconnect();
    cancelAnimationFrame(this.raf);
  }
}
