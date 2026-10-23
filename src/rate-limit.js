// Ventana fija por cliente: cinco solicitudes durante treinta segundos.
// Memoria local para la demo; no comparte contadores entre servidores.
export function createRateLimiter({ limit = 5, windowMs = 30_000, now = Date.now } = {}) {
  const clientes = new Map();

  function check(ip) {
    const ahora = now();
    let cliente = clientes.get(ip);

    // La primera solicitud inicia una ventana; al vencer, empezamos otra.
    if (!cliente || ahora >= cliente.reinicio) {
      cliente = { solicitudes: 0, reinicio: ahora + windowMs };
      clientes.set(ip, cliente);
    }

    if (cliente.solicitudes >= limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((cliente.reinicio - ahora) / 1000))
      };
    }

    cliente.solicitudes += 1;
    return { allowed: true, remaining: limit - cliente.solicitudes };
  }

  return { check, reset: () => clientes.clear() };
}
