import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createApp } from '../src/app.js';
import { createRateLimiter } from '../src/rate-limit.js';

async function setup(t, options = {}) {
  const server = createApp({ controlToken: 'test-token', ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, data, headers = {}) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data)
  });
  return {
    base, post,
    state: () => fetch(base + '/api/estado').then(r => r.json()),
    scene: action => post('/api/demo', { action }, { 'X-Demo-Token': 'test-token' }),
    send: (i = 1, headers = {}) => post('/api/registro', { nombre: `Prueba ${i}`, email: `prueba${i}@example.com` }, headers)
  };
}

test('sin protección, doce solicitudes generan doce registros', async t => {
  const app = await setup(t);
  const results = [];
  for (let i = 1; i <= 12; i++) results.push((await app.send(i)).status);
  assert.deepEqual(results, Array(12).fill(201));
  const state = await app.state();
  assert.equal(state.registros.length, 12);
  assert.deepEqual(state.metricas, { recibidas: 12, aceptadas: 12, bloqueadas: 0 });
});

test('con protección, un lote concurrente guarda cinco y rechaza siete antes de guardar', async t => {
  const app = await setup(t);
  await app.scene('despues');
  const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => app.send(i)));
  assert.equal(responses.filter(r => r.status === 201).length, 5);
  assert.equal(responses.filter(r => r.status === 429).length, 7);
  assert.ok(Number(responses.find(r => r.status === 429).headers.get('retry-after')) > 0);
  const state = await app.state();
  assert.equal(state.registros.length, 5);
  assert.deepEqual(state.metricas, { recibidas: 12, aceptadas: 5, bloqueadas: 7 });
});

test('falsificar X-Forwarded-For no crea cuotas nuevas', async t => {
  const app = await setup(t);
  await app.scene('despues');
  for (let i = 0; i < 5; i++) assert.equal((await app.send(i, { 'X-Forwarded-For': `192.0.2.${i}` })).status, 201);
  assert.equal((await app.send(6, { 'X-Forwarded-For': '192.0.2.99' })).status, 429);
});

test('la cuota vuelve al vencer la ventana y la limpieza reinicia una toma completa', async t => {
  let time = 1000;
  const app = await setup(t, { now: () => time });
  await app.scene('despues');
  for (let i = 0; i < 5; i++) await app.send(i);
  assert.equal((await app.send(6)).status, 429);
  time = 31000;
  assert.equal((await app.send(7)).status, 201);
  await app.scene('limpiar');
  const state = await app.state();
  assert.equal(state.proteccionActiva, true);
  assert.equal(state.registros.length, 0);
  assert.deepEqual(state.metricas, { recibidas: 0, aceptadas: 0, bloqueadas: 0 });
  assert.equal((await app.send(8)).status, 201);
  await app.scene('antes');
  assert.equal((await app.state()).proteccionActiva, false);
});

test('cada cliente tiene su cuota y el límite no se extiende con los rechazos', () => {
  let time = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
  assert.equal(limiter.check('a').allowed, true);
  assert.equal(limiter.check('a').allowed, true);
  assert.equal(limiter.check('a').allowed, false);
  assert.equal(limiter.check('b').allowed, true);
  time = 999;
  assert.equal(limiter.check('a').allowed, false);
  time = 1000;
  assert.equal(limiter.check('a').allowed, true);
});

test('el formulario rechaza datos inválidos y JSON mal formado sin guardar registros', async t => {
  const app = await setup(t);
  for (const data of [null, {}, { nombre: '', email: 'a@example.com' }, { nombre: 'Ana', email: 'no-es-correo' }]) {
    assert.equal((await app.post('/api/registro', data)).status, 400);
  }
  const response = await fetch(app.base + '/api/registro', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
  });
  assert.equal(response.status, 400);
  assert.equal((await app.state()).registros.length, 0);
});

test('rechaza cuerpos demasiado grandes y tipos de contenido incompatibles', async t => {
  const app = await setup(t);
  assert.equal((await app.post('/api/registro', { nombre: 'a'.repeat(9000), email: 'a@example.com' })).status, 413);
  const response = await fetch(app.base + '/api/registro', { method: 'POST', body: 'hello' });
  assert.equal(response.status, 415);
});

test('cambiar escenas exige token y se rechazan solicitudes desde otros orígenes', async t => {
  const app = await setup(t);
  assert.equal((await app.post('/api/demo', { action: 'despues' })).status, 403);
  assert.equal((await app.post('/api/demo', { action: 'despues' }, {
    'X-Demo-Token': 'test-token', Origin: 'https://example.com'
  })).status, 403);
  assert.equal((await app.send(1, { Origin: 'https://example.com' })).status, 403);
  assert.equal((await app.scene('unknown')).status, 400);
  assert.equal((await app.state()).proteccionActiva, false);
});

test('una ruta mal formada devuelve 400 y el servidor continúa funcionando', async t => {
  const app = await setup(t);
  const status = await new Promise((resolve, reject) => {
    const req = request(app.base, { path: '//[' }, res => {
      res.resume();
      resolve(res.statusCode);
    });
    req.setTimeout(1000, () => req.destroy(new Error('El servidor no respondió.')));
    req.on('error', reject);
    req.end();
  });
  assert.equal(status, 400);
  assert.equal((await fetch(app.base + '/api/estado')).status, 200);
});
