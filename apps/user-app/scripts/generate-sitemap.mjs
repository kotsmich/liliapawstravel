// Generates apps/user-app/src/assets/sitemap.xml.
// Emits one <url> per (route, locale) pair with sibling <xhtml:link rel="alternate">
// blocks for each supported language plus an x-default pointing at the el URL.
// <lastmod> is the date of the last git commit touching each route's feature
// folder; falls back to today's date if git is unavailable or the path has
// no history (e.g. fresh checkout, shallow clone, no git in Docker image).
// Run: node apps/user-app/scripts/generate-sitemap.mjs

import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(HERE, '..', '..', '..');
const OUT_PATH = join(HERE, '..', 'src', 'assets', 'sitemap.xml');

const ORIGIN = 'https://liliapawstravel.com';
const LANGS = ['el', 'en', 'de'];
const DEFAULT_LANG = 'el';

const ROUTES = [
  { path: '/',                    feature: 'home',                 priority: '1.0', changefreq: 'weekly'  },
  { path: '/request',             feature: 'trip-request',         priority: '0.9', changefreq: 'weekly'  },
  { path: '/contact',             feature: 'contact',              priority: '0.7', changefreq: 'monthly' },
  { path: '/about',               feature: 'about',                priority: '0.7', changefreq: 'monthly' },
  { path: '/faq',                 feature: 'faq',                  priority: '0.7', changefreq: 'monthly' },
  { path: '/transport-documents', feature: 'transport-documents',  priority: '0.6', changefreq: 'monthly' },
];

const today = () => new Date().toISOString().slice(0, 10);

function lastCommitDate(featureFolder) {
  const relPath = `apps/user-app/src/app/features/${featureFolder}`;
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', relPath],
      { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out || today();
  } catch {
    return today();
  }
}

// Matches server.ts redirect target and SeoService.urlFor: `/${lang}` for the
// home route (no trailing slash), `/${lang}${path}` otherwise.
function localizedUrl(lang, path) {
  const tail = path === '/' ? '' : path;
  return `${ORIGIN}/${lang}${tail}`;
}

function renderEntry(route, lang) {
  const alternates = LANGS
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${localizedUrl(l, route.path)}"/>`)
    .join('\n');
  return (
    `  <url>\n` +
    `    <loc>${localizedUrl(lang, route.path)}</loc>\n` +
    `    <lastmod>${route.lastmod}</lastmod>\n` +
    `    <changefreq>${route.changefreq}</changefreq>\n` +
    `    <priority>${route.priority}</priority>\n` +
    `${alternates}\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(DEFAULT_LANG, route.path)}"/>\n` +
    `  </url>`
  );
}

function renderXml(routes) {
  const urls = routes
    .flatMap((route) => LANGS.map((lang) => renderEntry(route, lang)))
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${urls}\n` +
    `</urlset>\n`
  );
}

async function main() {
  const routes = ROUTES.map((r) => ({ ...r, lastmod: lastCommitDate(r.feature) }));
  await writeFile(OUT_PATH, renderXml(routes), 'utf8');

  for (const r of routes) {
    console.log(`${r.path.padEnd(22)} lastmod=${r.lastmod}  (${LANGS.length} locales)`);
  }
  console.log(`\nWrote ${OUT_PATH} — ${routes.length * LANGS.length} <url> entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
