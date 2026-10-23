import { localFetch } from './local.js';

try {
  const action = process.argv[2];
  if (!['antes', 'despues', 'limpiar', 'estado'].includes(action)) throw new Error('Usa antes, despues, limpiar o estado.');
  const response = action === 'estado'
    ? await localFetch('/api/estado')
    : await localFetch('/api/demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action })
    });
  const state = await response.json();
  if (!response.ok) throw new Error(state.error);
  console.log(`\n  ${state.proteccionActiva ? 'CON RATE LIMITING · 5 solicitudes / 30 segundos / IP' : 'SIN RATE LIMITING'}\n`);
  if (action !== 'estado') console.log('  Registros, métricas y cuota reiniciados. Lista para grabar.\n');
  console.log(`  Aceptadas: ${state.metricas.aceptadas}  |  Bloqueadas: ${state.metricas.bloqueadas}\n`);
} catch (error) {
  console.error(`\n  ${error.message}\n`);
  process.exitCode = 1;
}
