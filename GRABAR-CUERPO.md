# Tramo central — pantalla + explicación

Objetivo: grabar aproximadamente 3:20–3:40 de demostración. Suma las duraciones de tu intro y outro: el video completo debe quedar en cinco minutos o menos.

## Deja todo listo antes de grabar

- Web: http://127.0.0.1:4173 en Chrome, con formulario y panel visibles.
- Código: `scripts/enviar-registros.js`, `public/app.js`, `src/registro.js`, `src/rate-limit.js`. Fuente grande, 20–24 puntos.
- Terminal: pega este comando para entrar en la carpeta y preparar la escena:

```bash
cd /Users/robertozuniga/Documents/Codex/2026-10-23/hekl/outputs/platzi-demo-rate-limiting
npm run demo:antes
```

La web ya está encendida. No ejecutes otro `npm start` mientras siga funcionando.

En Zoom, prepara una grabación con micrófono y cámara visibles. Al compartir, selecciona la pantalla donde alternarás web, código y terminal; una única ventana de Chrome no mostrará el cambio al editor. Mantén esta guía en otro dispositivo o fuera del área compartida. Comprueba el encuadre antes de empezar; empieza la grabación tú cuando estés listo.

## 1. Un registro normal · 0:00–0:25

**En pantalla:** formulario. Escribe `Ana Torres` y `ana@example.com`. Haz clic en **Quiero estar en la lista**.

**Di, con tus palabras:**

> “Este es nuestro formulario. Escribo un nombre, un correo y envío. A la derecha aparece el registro: hasta aquí todo funciona como esperamos.”

## 2. El mismo formulario, doce veces · 0:25–0:55

**En pantalla:** `scripts/enviar-registros.js`, líneas 16–21. Señala el `for`, la ruta y los datos.

> “Este archivo llama a la misma ruta doce veces. No necesita hacer clic en el botón: envía las solicitudes directamente al servidor.”

**En la terminal, ejecuta:**

```bash
npm run demo:limpiar
npm run demo:enviar
```

**Vuelve a la web:** debe mostrar **12 solicitudes / 12 guardados / 0 bloqueados**.

> “Limpié el ejemplo anterior para empezar desde cero. Mira: los doce envíos se guardaron. Nuestra lista se acaba de llenar con datos de prueba.”

## 3. Dónde está el control · 0:55–1:30

**En pantalla:** `public/app.js`, líneas 84–90; luego `src/registro.js`, líneas 21–32.

> “El navegador recoge los campos y hace este POST. El servidor recibe los datos, valida su formato y los guarda aquí. El script usa la misma ruta. Por eso, desactivar el botón no basta: el límite debe estar en el servidor, antes de guardar.”

**Señala:** `estado.registros.unshift(registro)`.

## 4. Explica el límite · 1:30–2:40

**En pantalla:** `src/rate-limit.js`.

> “Rate limiting es poner un límite de solicitudes durante un periodo. Aquí permitiremos cinco cada treinta segundos por IP. Elegí números pequeños para que se vea en la demo.”

**Señala las líneas 3–13:**

> “Este mapa guarda un contador por cliente. Si es su primera solicitud, o la ventana ya venció, el contador empieza en cero y calculamos cuándo se reinicia.”

**Señala las líneas 16–24:**

> “Si llegó al límite, devolvemos que no puede continuar y cuánto debe esperar. Si aún tiene cuota, sumamos uno y dejamos pasar la solicitud.”

**Vuelve a `src/registro.js`, líneas 7–19:**

> “Aplicamos esa decisión antes del guardado. Si se pasó del límite, respondemos 429: demasiadas solicitudes. Este return impide que se guarden.”

> “También puedes limitar por usuario o por clave de API. Aquí usamos la IP y memoria local; con varios servidores, los contadores deben compartirse.”

No hace falta escribir todos los archivos en vivo. Explica el código preparado y luego activa ese mismo bloque con el comando del laboratorio.

## 5. Repite la prueba · 2:40–3:25

**En terminal:**

```bash
npm run demo:despues
```

> “Activo el control que acabamos de revisar y reinicio la cuota y los registros del laboratorio. Voy a enviar las mismas doce solicitudes. ¿Cuántas crees que se van a guardar?”

**Pausa dos segundos y ejecuta:**

```bash
npm run demo:enviar
```

**Muestra:** cinco respuestas 201 y siete respuestas 429. Vuelve a la web: **12 / 5 / 7**.

> “Las primeras cinco pasaron. Desde la sexta, el servidor bloqueó los envíos. Las siete solicitudes bloqueadas no llegaron a guardarse.”

Deja el resultado quieto unos segundos. Aquí termina el tramo central y encaja tu outro.

## Para que la toma salga como el ensayo

- No envíes nada manualmente entre `demo:despues` y `demo:enviar`.
- No ejecutes dos veces seguidas el script protegido sin reiniciar: cambiaría el resultado.
- Si te equivocas, `npm run demo:antes` deja todo listo para empezar otra vez.
- Incluye una experiencia tuya real en una frase de unos diez segundos junto al problema; la guía de Platzi lo pide.
- La guía original pide grabar sin edición. Los clips separados no cumplen literalmente ese punto; si necesitas ajustarte a la guía, usa este recorrido para una toma completa con intro y outro.
