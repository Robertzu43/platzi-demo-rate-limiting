import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createRateLimiter } from './rate-limit.js';
import { registrar } from './registro.js';
import { json, readJson } from './http.js';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']]
]);

export function createApp({ now = Date.now, controlToken = randomUUID() } = {}) {
  const estado = {
    proteccionActiva: false,
    registros: [],
    metricas: { recibidas: 0, aceptadas: 0, bloqueadas: 0 }
  };
  const limitador = createRateLimiter({ limit: 5, windowMs: 30_000, now });

  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const port = req.socket.localPort;
    const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!hosts.includes(req.headers.host)) return json(res, 403, { error: 'Esta demo solo admite acceso local.' });
    const origin = req.headers.origin;
    if (origin && !hosts.map(host => `http://${host}`).includes(origin)) {
      req.resume();
      return json(res, 403, { error: 'Origen no permitido.' });
    }
    try {
      const path = new URL(req.url, `http://${req.headers.host}`).pathname;
      if (req.method === 'GET' && path === '/api/estado') {
        return json(res, 200, { ...estado, limite: 5, ventanaSegundos: 30 });
      }
      if (req.method === 'POST' && path === '/api/registro') {
        return await registrar(req, res, estado, limitador);
      }
      if (req.method === 'POST' && path === '/api/demo') {
        const supplied = Buffer.from(req.headers['x-demo-token'] || '');
        const expected = Buffer.from(controlToken);
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
          req.resume();
          return json(res, 403, { error: 'Usa los comandos locales para preparar la escena.' });
        }
        const { action } = (await readJson(req)) || {};
        if (!['antes', 'despues', 'limpiar'].includes(action)) return json(res, 400, { error: 'Escena desconocida.' });
        if (action !== 'limpiar') estado.proteccionActiva = action === 'despues';
        estado.registros = [];
        estado.metricas = { recibidas: 0, aceptadas: 0, bloqueadas: 0 };
        limitador.reset();
        return json(res, 200, { ...estado, limite: 5, ventanaSegundos: 30 });
      }
      if (req.method === 'GET' && assets.has(path)) {
        const [file, type] = assets.get(path);
        const body = await readFile(new URL(`../public/${file}`, import.meta.url));
        res.writeHead(200, { 'Content-Type': type });
        return res.end(body);
      }
      req.resume();
      return json(res, 404, { error: 'Ruta no encontrada.' });
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL') {
        req.resume();
        return json(res, 400, { error: 'La ruta de la solicitud no es válida.' });
      }
      return json(res, error.status || 500, { error: error.status ? error.message : 'No pudimos procesar la solicitud.' });
    }
  });
}
