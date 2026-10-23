# Verificación de la demo

- `npm test`: 9 pruebas aprobadas.
- Secuencia real con servidor: antes → 12 guardados / 0 bloqueados; después → 5 guardados / 7 bloqueados.
- Navegador: registro manual guardado, actualización automática del panel y error visible al agotar cuota.
- Diseño inspeccionado en ancho móvil y escritorio (1440 × 1000).
- Consola del navegador sin errores antes de probar la respuesta HTTP 429 esperada.
- Revisión independiente: detectó un error al analizar una ruta mal formada fuera del manejo de excepciones. Reproducido con test en rojo, corregido y suite completa en verde.
- `git diff --check`: sin errores.

El guion propone 4:40; el tiempo real depende del ensayo del profesor. El ejemplo de experiencia propia queda por completar con un hecho real del candidato. No se ha grabado ni publicado un video.
