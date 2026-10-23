const form = document.querySelector('#signup-form');
const message = document.querySelector('#form-message');
const submit = document.querySelector('#submit-button');
const records = document.querySelector('#records');
const connection = document.querySelector('#connection');
let previousRecords = '';
let currentMode;

function render(state) {
  const active = state.proteccionActiva;
  document.querySelector('#protection').dataset.active = String(active);
  document.querySelector('#mode-symbol').textContent = active ? '✓' : '!';
  document.querySelector('#mode-title').textContent = active ? 'Rate limiting activo' : 'Sin límite de envíos';
  document.querySelector('#mode-detail').textContent = active
    ? 'Máximo 5 solicitudes cada 30 segundos por IP.'
    : 'Cada solicitud válida puede crear un registro.';
  document.querySelector('#received').textContent = state.metricas.recibidas;
  document.querySelector('#accepted').textContent = state.metricas.aceptadas;
  document.querySelector('#blocked').textContent = state.metricas.bloqueadas;
  document.querySelector('#record-count').textContent = `${state.registros.length} ${state.registros.length === 1 ? 'registro' : 'registros'}`;
  document.querySelector('#result-note').textContent = state.metricas.bloqueadas > 0
    ? 'HTTP 429 · límite alcanzado'
    : state.metricas.aceptadas > 0 ? 'HTTP 201 · registro guardado' : 'Esperando el primer envío';
  if (currentMode !== active || state.metricas.recibidas === 0) {
    message.textContent = '';
    currentMode = active;
  }

  const signature = state.registros.map(record => record.id).join(',');
  if (signature === previousRecords && records.children.length) return;
  previousRecords = signature;
  records.replaceChildren();
  if (!state.registros.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    const arrow = document.createElement('span');
    arrow.textContent = '↳';
    arrow.setAttribute('aria-hidden', 'true');
    const text = document.createElement('p');
    text.textContent = 'Tu primera persona todavía está por llegar.';
    empty.append(arrow, text);
    records.append(empty);
  }
  for (const record of state.registros) {
    const row = document.createElement('div');
    row.className = 'record';
    const person = document.createElement('div');
    person.className = 'record-person';
    const name = document.createElement('span');
    name.className = 'record-name';
    name.textContent = record.nombre;
    const email = document.createElement('span');
    email.className = 'record-email';
    email.textContent = record.email;
    const status = document.createElement('span');
    status.className = 'record-status';
    status.textContent = 'GUARDADO';
    person.append(name, email);
    row.append(person, status);
    records.append(row);
  }
  records.scrollTop = 0;
}

async function refresh() {
  try {
    const response = await fetch('/api/estado', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error('Sin conexión');
    render(await response.json());
    connection.dataset.offline = 'false';
    connection.lastChild.textContent = ' EN VIVO';
  } catch {
    connection.dataset.offline = 'true';
    connection.lastChild.textContent = ' SIN CONEXIÓN';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  submit.disabled = true;
  message.textContent = 'Enviando…';
  message.dataset.error = 'false';
  try {
    // El navegador envía los campos a la misma ruta que usa el script.
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    message.dataset.error = String(!response.ok);
    message.textContent = response.ok ? data.mensaje : data.error;
    if (response.ok) form.reset();
    await refresh();
  } catch {
    message.dataset.error = 'true';
    message.textContent = 'No pudimos conectar. Comprueba que la demo sigue abierta.';
  } finally {
    submit.disabled = false;
  }
});

async function poll() {
  await refresh();
  setTimeout(poll, 600);
}
poll();
