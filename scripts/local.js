import { readFile } from 'node:fs/promises';

export async function localSession() {
  let session;
  try { session = JSON.parse(await readFile(new URL('../.demo-session.json', import.meta.url), 'utf8')); }
  catch { throw new Error('Primero inicia la web con npm start en otra terminal.'); }
  if (!Number.isInteger(session.port) || session.port < 1024 || session.port > 65535 || typeof session.controlToken !== 'string') {
    throw new Error('Sesión inválida. Reinicia la web con npm start.');
  }
  return { ...session, url: `http://127.0.0.1:${session.port}` };
}

export async function localFetch(path, options = {}) {
  const session = await localSession();
  try {
    return await fetch(session.url + path, {
      ...options, redirect: 'error', signal: AbortSignal.timeout(5000),
      headers: { ...options.headers, 'X-Demo-Token': session.controlToken }
    });
  } catch {
    throw new Error('No se pudo conectar a la demo local. Comprueba que npm start sigue abierto.');
  }
}
