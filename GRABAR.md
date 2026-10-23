# Tarjeta de grabación

## Preparar

- Terminal A: `npm start`.
- Navegador completo: http://127.0.0.1:4173 (zoom 125%).
- Editor: `public/app.js`, `scripts/enviar-registros.js`, `src/registro.js`, `src/rate-limit.js` (fuente 20–24).
- Cámara + pantalla + micrófono; sin edición.
- Terminal B: `npm run demo:antes`.
- Ensayar dos veces. Añadir una experiencia propia breve al bloque del problema.

## La toma

| Tiempo | Pantalla / acción | Idea |
|---|---|---|
| 0:00 | Web: enviar Ana / ana@example.com | “Creaste tu primera web con IA…” |
| 0:25 | `npm run demo:limpiar` → `npm run demo:enviar` | 12 solicitudes, 12 guardados. |
| 1:00 | `public/app.js` → `src/registro.js` | Navegador → ruta → guardado. |
| 1:35 | `src/rate-limit.js` | 5 solicitudes / 30 segundos / IP. |
| 2:10 | Contador, vencimiento y `return`; luego `src/registro.js` | Rechazar ANTES de guardar. |
| 3:15 | `npm run demo:despues` | Activar y reiniciar la escena. |
| 3:25 | Pregunta → pausa → `npm run demo:enviar` | ¿Cuántas se guardan? |
| 3:40 | Web: 12 / 5 / 7 | 5 guardados, 7 bloqueados con 429. |
| 4:10 | Panel y cámara | ¿Cómo verificamos los correos que sí pasaron? |
| 4:40 | Terminar | Sin despedida. |

## Otra toma

```bash
npm run demo:antes
```

Recarga la web si dejaste campos escritos. No reinicies el servidor: el comando ya borra registros, métricas y cuota.

## Antes de enviar

Video de máximo 5:00. Se ve tu cámara y se entiende tu voz. El código se lee. Incluyes experiencia propia y cierras con lo que sigue. Comprueba que el enlace se puede abrir sin iniciar sesión.
