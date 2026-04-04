import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';

const API_TARGET = process.env['API_TARGET'] || 'http://api:3000';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Proxy /ws/* → NestJS (WebSocket upgrade)
  server.use('/ws', createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    ws: true,
  }));

  // Proxy /api/* → NestJS REST
  server.use('/api', createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
  }));

  // Serve static assets (JS, CSS, images) from browser build
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }));

  server.use((req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
