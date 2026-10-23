# Guion de ensayo — 4 minutos y 40 segundos

Título enviado: **Cómo evitar que tus apps creadas con IA sean hackeadas**.

Resultado de esta clase: el estudiante puede explicar e incorporar un límite de solicitudes antes de guardar un formulario. La demo muestra abuso de registros, no una caída del servidor.

Las frases entre comillas son una base para ensayar con tus palabras, no un texto que debas leer durante la grabación. Los tiempos son un presupuesto; cronométrate dos veces. No se ha medido tu velocidad de explicación.

## Antes de pulsar grabar

1. Terminal A: `npm start`; mantenerla abierta.
2. Navegador en ventana completa: `http://127.0.0.1:4173`, zoom 125%. Comprueba que formulario y panel se ven juntos; ajusta el tamaño de ventana si hace falta.
3. Editor con `public/app.js`, `scripts/enviar-registros.js`, `src/registro.js` y `src/rate-limit.js` abiertos. Fuente 20–24 puntos.
4. Terminal B lista en la carpeta del repo. Ejecuta `npm run demo:antes`.
5. Cámara visible en una esquina que no tape los contadores, micrófono comprobado y notificaciones silenciadas. Pantalla, voz y cámara en una sola toma, sin edición.

## 0:00–0:25 · El problema ya está en pantalla

**Mostrar:** web vacía. Escribir Ana Torres y ana@example.com; pulsar el botón.

> “Creaste tu primera web con inteligencia artificial y ya estás capturando registros. Pero con este pequeño script puedo llenarte la lista de datos basura. Vamos a ponerle un límite a tu formulario para reducir ese abuso.”

**Verificar:** un registro visible y mensaje de éxito.

## 0:25–1:00 · Un archivo, doce registros

**Hacer:** terminal B:

```bash
npm run demo:limpiar
npm run demo:enviar
```

> “Voy a limpiar este registro para comparar las dos pruebas desde cero. Este archivo hace doce envíos, como el formulario. Mira: los doce se guardan en segundos.”

**Mostrar:** el panel con 12 solicitudes, 12 guardados y 0 bloqueados. Mostrar brevemente el bucle en `scripts/enviar-registros.js`.

> “Tener registros no significa tener personas interesadas. Nuestro servidor acepta todos estos envíos automatizados.”

**Experiencia personal:** si tienes un caso real, sustituye la última frase por una experiencia concreta de diez segundos: qué construías, qué observaste y qué cambiaste. No inventes una historia ni nombres clientes. La guía pide al menos un ejemplo vivido; este es el espacio reservado para el tuyo.

## 1:00–1:35 · Sigue el dato hasta el servidor

**Mostrar:** en `public/app.js`, el `fetch` del manejador de envío; luego el final de `src/registro.js`.

> “El navegador toma el nombre y el correo y los envía a esta ruta. En el servidor validamos el formato y guardamos el registro.”

> “El script llama directamente a esa misma ruta. Por eso, bloquear el botón no basta: necesitamos controlar los envíos en el servidor, antes de guardarlos.”

**Señalar:** `estado.registros.unshift(registro)`.

## 1:35–2:10 · Qué vamos a limitar

**Mostrar:** principio de `src/rate-limit.js`.

> “Rate limiting significa limitar cuántas solicitudes aceptamos durante un periodo. Es como alguien en la entrada que cuenta cuántas veces puedes pasar.”

> “Para verlo rápido, usaremos cinco solicitudes cada treinta segundos por IP. También puedes contar por usuario o por clave de API. El criterio depende de lo que necesitas proteger.”

> “Aquí elegí números pequeños para la demostración.”

No expliques otros algoritmos en esta toma. IP, usuario y clave de API son criterios de agrupación; ventana fija, deslizante y token bucket son algoritmos distintos. Las notas al final sirven para preguntas posteriores.

## 2:10–3:15 · Construye la explicación del límite

**Mostrar:** `src/rate-limit.js`, en dos tramos si no cabe con fuente grande. La implementación ya está preparada; explica el código real sin afirmar que lo escribiste en ese momento.

> “En este mapa guardamos un contador por IP. Si es la primera solicitud, o ya venció su ventana, creamos un contador en cero y calculamos cuándo se reinicia.”

**Señalar:** el primer `if` y `reinicio: ahora + windowMs`.

> “Si ya alcanzó las cinco solicitudes, rechazamos el siguiente intento y calculamos cuánto debe esperar. Si todavía tiene cuota, aumentamos el contador y lo dejamos continuar.”

**Mostrar:** bloque de protección en `src/registro.js`.

> “Ahora usamos esa decisión aquí, antes de guardar. Obtenemos la IP de la conexión. Si se pasó del límite, devolvemos 429: demasiadas solicitudes. Este return evita que el registro llegue al guardado.”

> “Para este ejemplo usamos memoria local. Con varios servidores, los contadores tendrían que compartirse.”

## 3:15–4:10 · La misma prueba, otro resultado

**Hacer:** terminal B:

```bash
npm run demo:despues
```

> “Este comando activa el bloque que acabamos de revisar y reinicia los datos y la cuota del laboratorio. Vamos a repetir exactamente las mismas doce solicitudes. ¿Cuántas crees que se van a guardar?”

**Pausa:** dos segundos. Ejecutar inmediatamente:

```bash
npm run demo:enviar
```

**Mostrar:** terminal con cinco respuestas 201 y siete respuestas 429. Volver a la web: 12 / 5 / 7.

> “Cinco guardadas y siete bloqueadas. Las que superaron el límite ya no llegaron a guardarse. Cuando termine la ventana, el cliente podrá volver a enviar.”

No hagas un envío manual entre activar la protección y ejecutar el script; consumiría una de las cinco solicitudes. No esperes treinta segundos para mostrar la recuperación: las pruebas automatizadas la verifican y ese tiempo no aporta a la toma.

## 4:10–4:40 · Lo que aprendieron y el siguiente problema

**Mostrar:** panel con el resultado protegido. Cámara visible.

> “Ya sabes limitar los envíos a tu formulario desde el servidor para reducir el abuso automatizado. Pero estas cinco solicitudes permitidas todavía podrían contener correos falsos. ¿Cómo comprobamos que esos registros pertenecen a personas reales?”

Termina ahí. Sin despedida y sin prometer que toda la aplicación quedó segura.

## Si vas largo

Recorta la analogía y la mención a otros criterios; conserva problema, recorrido, decisión en el servidor, segunda prueba y cierre. No aceleres la lectura del código. Cuatro minutos también cumple la guía.

## Notas técnicas para ti, fuera de la toma

| Concepto | Explicación breve |
|---|---|
| Por IP | Agrupa por origen de conexión. Personas en una misma red pueden compartir cuota. |
| Por usuario | Agrupa por identidad autenticada; requiere verificar esa identidad. |
| Por clave de API | Agrupa por cliente de integración; requiere validar la clave. |
| Ventana fija | Mantiene un contador durante una ventana. Aquí cada cliente la inicia con su primera solicitud. Puede permitir ráfagas cerca del cambio de ventana. |
| Ventana deslizante | Evalúa un periodo reciente que se desplaza con el tiempo. |
| Token bucket | Recarga permisos a una tasa y permite ráfagas hasta una capacidad. |

El limitador de esta demo cuenta solicitudes antes de la validación. Un JSON inválido también consume cuota. En la grabación solo usamos solicitudes válidas, por eso las aceptadas y bloqueadas suman doce.

La guía pide un ejemplo de experiencia propia. Debes completar ese punto con un hecho tuyo; este repositorio no puede inventarlo. Tras grabar, comprueba duración, audio, cámara y permisos del enlace antes de enviarlo a Wilson.
