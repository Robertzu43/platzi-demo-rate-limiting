import { randomUUID } from 'node:crypto';
import { json, readJson } from './http.js';

export async function registrar(req, res, estado, limitador) {
  estado.metricas.recibidas += 1;

  // El control ocurre en el servidor, ANTES de guardar el registro.
  if (estado.proteccionActiva) {
    const ip = req.socket.remoteAddress; // No confiamos en X-Forwarded-For.
    const resultado = limitador.check(ip);

    if (!resultado.allowed) {
      estado.metricas.bloqueadas += 1;
      req.resume();
      return json(res, 429, {
        error: `Demasiados envíos. Intenta de nuevo en ${resultado.retryAfter} segundos.`
      }, { 'Retry-After': String(resultado.retryAfter) });
    }
  }

  const datos = await readJson(req);
  const nombre = typeof datos?.nombre === 'string' ? datos.nombre.trim() : '';
  const email = typeof datos?.email === 'string' ? datos.email.trim() : '';
  if (!nombre || nombre.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: 'Escribe un nombre y un correo con formato válido.' });
  }

  const registro = { id: randomUUID(), nombre, email, fecha: new Date().toISOString() };
  estado.registros.unshift(registro);
  estado.registros = estado.registros.slice(0, 500); // Historial acotado para ensayos.
  estado.metricas.aceptadas += 1;
  return json(res, 201, { mensaje: '¡Ya estás en la lista!', registro });
}
