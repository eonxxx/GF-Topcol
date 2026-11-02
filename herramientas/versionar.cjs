/* Pone la huella del contenido en cada referencia "?v=" de las páginas.
   Así el navegador descarga de nuevo solo los archivos que cambiaron.

   node herramientas/versionar.cjs            actualiza las páginas
   node herramientas/versionar.cjs --revisar  solo revisa (sale con error si alguna quedó vieja) */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..');
const BASE = '/GF-Topcol/';
const PAGINAS = ['index.html', 'privacidad.html', '404.html', 'landing/index.html'];
const REF = /((?:src|href)=")([^"?#]+)\?v=([^"]*)"/g;

const huella = archivo => crypto.createHash('sha256').update(fs.readFileSync(archivo)).digest('hex').slice(0, 10);

/* Ruta del archivo en el repositorio para una referencia hecha desde una página */
function resolver(pagina, ref) {
  if (ref.startsWith(BASE)) return path.join(RAIZ, ref.slice(BASE.length));
  return path.join(RAIZ, path.dirname(pagina), ref);
}

/* Lista de referencias cuya huella no coincide con el archivo: [{pagina, ref, actual, esperada}] */
function revisar() {
  const viejas = [];
  for (const pagina of PAGINAS) {
    const html = fs.readFileSync(path.join(RAIZ, pagina), 'utf8');
    for (const m of html.matchAll(REF)) {
      const archivo = resolver(pagina, m[2]);
      const esperada = fs.existsSync(archivo) ? huella(archivo) : '(no existe)';
      if (m[3] !== esperada) viejas.push({ pagina, ref: m[2], actual: m[3], esperada });
    }
  }
  return viejas;
}

function actualizar() {
  let cambios = 0;
  for (const pagina of PAGINAS) {
    const ruta = path.join(RAIZ, pagina);
    const html = fs.readFileSync(ruta, 'utf8');
    const nuevo = html.replace(REF, (todo, pre, ref, v) => {
      const archivo = resolver(pagina, ref);
      if (!fs.existsSync(archivo)) throw new Error(`${pagina}: ${ref} no existe`);
      const h = huella(archivo);
      if (h !== v) cambios++;
      return `${pre}${ref}?v=${h}"`;
    });
    if (nuevo !== html) fs.writeFileSync(ruta, nuevo);
  }
  return cambios;
}

module.exports = { revisar, actualizar };

if (require.main === module) {
  if (process.argv.includes('--revisar')) {
    const viejas = revisar();
    viejas.forEach(v => console.log(`${v.pagina}: ${v.ref}?v=${v.actual} debería ser ?v=${v.esperada}`));
    process.exit(viejas.length ? 1 : 0);
  }
  console.log(`${actualizar()} referencias actualizadas`);
}
