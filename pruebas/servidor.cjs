/* Servidor local que imita GitHub Pages: sirve el repositorio bajo /GF-Topcol/,
   comprime texto con gzip, usa 404.html para lo que no existe y nunca sirve
   archivos ocultos (.git, .htaccess...).
   Uso: node pruebas/servidor.cjs [puerto]   →  http://127.0.0.1:8766/GF-Topcol/ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RAIZ = path.resolve(__dirname, '..');
const BASE = '/GF-Topcol';
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.md': 'text/markdown; charset=utf-8',
};
const COMPRIMIR = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg)/;

function enviar(req, res, estado, archivo, extra) {
  const tipo = TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream';
  let cuerpo = fs.readFileSync(archivo);
  const cab = { 'Content-Type': tipo, 'Cache-Control': 'max-age=600', ...extra };
  if (COMPRIMIR.test(tipo) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    cuerpo = zlib.gzipSync(cuerpo, { level: 6 });
    cab['Content-Encoding'] = 'gzip';
    cab['Vary'] = 'Accept-Encoding';
  }
  cab['Content-Length'] = cuerpo.length;
  res.writeHead(estado, cab);
  res.end(req.method === 'HEAD' ? undefined : cuerpo);
}

function crear() {
  return http.createServer((req, res) => {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
    if (ruta === '/' || ruta === BASE) { res.writeHead(301, { Location: BASE + '/' }); return res.end(); }
    const no = () => enviar(req, res, 404, path.join(RAIZ, '404.html'));
    if (!ruta.startsWith(BASE + '/')) return no();
    const rel = ruta.slice(BASE.length + 1);
    if (rel.split('/').some(p => p.startsWith('.') || p === 'node_modules')) return no();
    let archivo = path.join(RAIZ, rel);
    if (!archivo.startsWith(RAIZ)) return no();
    try {
      if (fs.statSync(archivo).isDirectory()) {
        if (!ruta.endsWith('/')) { res.writeHead(301, { Location: ruta + '/' }); return res.end(); }
        archivo = path.join(archivo, 'index.html');
      }
      if (!fs.statSync(archivo).isFile()) return no();
    } catch (e) { return no(); }
    enviar(req, res, 200, archivo);
  });
}

/* Para las pruebas: arranca en un puerto libre y devuelve la dirección base */
function iniciar(puerto = 0) {
  return new Promise(ok => {
    const srv = crear().listen(puerto, '127.0.0.1', () => {
      ok({ url: `http://127.0.0.1:${srv.address().port}${BASE}/`, cerrar: () => new Promise(r => srv.close(r)) });
    });
  });
}

module.exports = { iniciar, RAIZ, BASE };

if (require.main === module) {
  const puerto = +process.argv[2] || 8766;
  iniciar(puerto).then(s => console.log('Sitio en ' + s.url));
}
