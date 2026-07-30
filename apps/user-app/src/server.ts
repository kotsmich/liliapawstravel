import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const API_TARGET = process.env['API_TARGET'] || 'http://api:3000';

const allowedHosts = process.env['ALLOWED_HOSTS']
  ? process.env['ALLOWED_HOSTS'].split(',')
  : ['liliapawstravel.com', 'www.liliapawstravel.com', 'localhost'];

const SUPPORTED_LANGS = ['el', 'en', 'de'] as const;
const DEFAULT_LANG = 'el';
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

// Mirrors the top-level lang children in apps/user-app/src/app/app.routes.ts.
// Anything not in this set after the lang prefix maps to the wildcard 404 route
// and must return HTTP 404 — search engines need the status, not just <meta robots>.
// Keep in sync if a new top-level feature route is added.
const KNOWN_LANG_CHILDREN: ReadonlySet<string> = new Set([
  'about', 'contact', 'request', 'transport-documents', 'faq', 'results',
]);

function isSupportedLang(value: string): value is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(value);
}

function statusForPath(path: string): 200 | 404 {
  const segs = path.split('/').filter(Boolean);
  if (segs.length === 0) return 200;                    // "/" — middleware redirects to /:lang
  if (!isSupportedLang(segs[0])) return 200;            // bare path — middleware redirects
  if (segs.length === 1) return 200;                    // "/:lang" — home
  return KNOWN_LANG_CHILDREN.has(segs[1]) ? 200 : 404;
}

function readCookie(name: string, header: string | undefined): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

function parseAcceptLanguage(header: string | undefined): SupportedLang {
  if (!header) return DEFAULT_LANG;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const primary = tag.split('-')[0];
    if (isSupportedLang(primary)) return primary;
  }
  return DEFAULT_LANG;
}

function detectLang(req: express.Request): SupportedLang {
  const cookieLang = readCookie('lang', req.headers.cookie);
  if (cookieLang && isSupportedLang(cookieLang)) return cookieLang;
  return parseAcceptLanguage(req.headers['accept-language']);
}

const commonEngine = new CommonEngine({ allowedHosts });

const app = express();

// Proxy /ws/* → NestJS (WebSocket upgrade)
app.use('/ws', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  ws: true,
}));

// Proxy /api/* → NestJS REST
app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
}));

// Serve static assets from browser build
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// Redirect bare paths (e.g. "/", "/about") to a detected language prefix.
// Anything that already starts with /el, /en, /de falls through to SSR.
// 302 (not 301) because the target depends on cookie + Accept-Language —
// 301 would let crawlers permanently bind the bare URL to whichever locale
// was served first. Vary tells caches to key on the same signals.
app.use((req, res, next) => {
  const path = req.path;
  const firstSeg = path.split('/').filter(Boolean)[0] ?? '';
  if (isSupportedLang(firstSeg)) return next();

  const lang = detectLang(req);
  const tail = path === '/' ? '' : path;
  const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.vary('Cookie, Accept-Language');
  return res.redirect(302, `/${lang}${tail}${search}`);
});

// All other routes → Angular SSR
app.use((req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.status(statusForPath(req.path)).send(html))
    .catch((err) => next(err));
});

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
