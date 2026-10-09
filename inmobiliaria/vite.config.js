import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Componentes HTML por sección: `<!-- @include sections/hero/hero.html -->`
 * se reemplaza por el archivo (relativo a src/) en tiempo de build, así el HTML
 * final es estático (bueno para SEO y LCP). También sustituye %VITE_*% de .env.
 */
function htmlPartials(env) {
  const inject = (html, depth = 0) =>
    html
      .replace(/<!--\s*@include\s+([\w./-]+)\s*-->/g, (_, file) => {
        if (depth > 5) throw new Error(`Include demasiado profundo: ${file}`);
        return inject(readFileSync(resolve(root, 'src', file), 'utf8'), depth + 1);
      })
      .replace(/%(VITE_\w+)%/g, (m, key) => env[key] ?? m);

  return {
    name: 'html-partials',
    transformIndexHtml: { order: 'pre', handler: (html) => inject(html) },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html')) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, root, 'VITE_'), VITE_YEAR: String(new Date().getFullYear()) };
  return {
    plugins: [htmlPartials(env)],
    build: {
      target: 'es2020',
      assetsDir: 'static',
    assetsInlineLimit: 0,
    },
    server: { host: true },
  };
});
