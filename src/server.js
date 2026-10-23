import { randomUUID } from 'node:crypto';
import { writeFileSync, unlinkSync } from 'node:fs';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('PORT debe ser un número entre 1024 y 65535.');
  process.exit(1);
}
const controlToken = randomUUID();
const sessionFile = new URL('../.demo-session.json', import.meta.url);
const server = createApp({ controlToken });
server.requestTimeout = 10_000;
server.headersTimeout = 10_000;
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Cierra la otra demo o usa PORT=4174 npm start.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  writeFileSync(sessionFile, JSON.stringify({ port, controlToken }), { mode: 0o600 });
  console.log(`\n  LISTA / Demo class\n\n  Abre http://127.0.0.1:${port}\n  Escena inicial: SIN PROTECCIÓN\n\n  En otra terminal:\n  npm run demo:enviar\n  npm run demo:despues\n  npm run demo:enviar\n\n  Ctrl+C para cerrar.\n`);
});
function shutdown() {
  server.close(() => {
    try { unlinkSync(sessionFile); } catch {}
    process.exit(0);
  });
  server.closeAllConnections();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
