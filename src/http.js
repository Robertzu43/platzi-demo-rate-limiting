export function json(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}

export function readJson(req) {
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    req.resume();
    return Promise.reject(Object.assign(new Error('Envía JSON en esta ruta.'), { status: 415 }));
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    let chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 8192) {
        chunks = [];
        reject(Object.assign(new Error('El formulario supera el tamaño permitido.'), { status: 413 }));
      } else chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > 8192) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('El cuerpo debe ser JSON válido.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
