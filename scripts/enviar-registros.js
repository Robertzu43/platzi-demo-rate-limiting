// Doce envíos ficticios a TU demo local. No acepta URLs externas.
import { setTimeout as pause } from 'node:timers/promises';
import { localFetch } from './local.js';

try {
  const stateResponse = await localFetch('/api/estado');
  if (!stateResponse.ok) throw new Error('La demo no está disponible.');
  const state = await stateResponse.json();
  if (state.metricas.recibidas > 0) {
    console.log('\n  Aviso: ya hay solicitudes. Para una toma limpia: npm run demo:limpiar\n');
  }
  console.log('\n  ENVIANDO 12 REGISTROS FICTICIOS\n');
  let aceptadas = 0;
  let bloqueadas = 0;

  for (let i = 1; i <= 12; i++) {
    const response = await localFetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: `Registro de prueba ${i}`, email: `prueba${i}@example.com` })
    });

    if (response.status === 201) aceptadas++;
    else if (response.status === 429) bloqueadas++;
    else throw new Error(`Respuesta inesperada: ${response.status}. Reinicia la escena y revisa el servidor.`);

    console.log(`  ${String(i).padStart(2, '0')}  →  HTTP ${response.status}  ${response.status === 201 ? 'GUARDADO' : 'BLOQUEADO'}`);
    await pause(120);
  }

  console.log(`\n  ${aceptadas} guardados · ${bloqueadas} bloqueados · 12 solicitudes\n`);
} catch (error) {
  console.error(`\n  ${error.message}\n`);
  process.exitCode = 1;
}
