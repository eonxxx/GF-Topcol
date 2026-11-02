/* Revisiones del contenido publicado, sin navegador: reglas de la empresa,
   archivos enlazados y versiones de caché. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { revisar } = require('../herramientas/versionar.cjs');

const RAIZ = path.resolve(__dirname, '..');
const PAGINAS = ['index.html', 'privacidad.html', '404.html', 'landing/index.html'];
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

/* Todo lo que se publica con texto: páginas, scripts, manifiesto y documentos */
function publicos(dir = '') {
  return fs.readdirSync(path.join(RAIZ, dir), { withFileTypes: true }).flatMap(e => {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) return /^(\.|node_modules$|pruebas$|herramientas$)/.test(e.name) ? [] : publicos(rel);
    return /\.(html|js|webmanifest|xml|md|txt)$/.test(e.name) && !/^LICENCIAS/.test(e.name) ? [rel] : [];
  });
}

test('las versiones "?v=" coinciden con el contenido de cada archivo (node herramientas/versionar.cjs)', () => {
  assert.deepEqual(revisar(), []);
});

test('todo archivo enlazado desde las páginas existe', () => {
  const faltan = [];
  for (const p of PAGINAS) {
    for (const m of leer(p).matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const ref = m[1].split('?')[0];
      if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(ref) || ref === '') continue;
      const archivo = ref.startsWith('/GF-Topcol/') ? path.join(RAIZ, ref.slice(11)) : path.join(RAIZ, path.dirname(p), ref);
      const real = fs.existsSync(archivo) && fs.statSync(archivo).isDirectory() ? path.join(archivo, 'index.html') : archivo;
      if (!fs.existsSync(real)) faltan.push(`${p}: ${m[1]}`);
    }
  }
  assert.deepEqual(faltan, []);
});

test('todas las páginas usan el mismo arranque de tema y animación', () => {
  const arranques = PAGINAS.map(p => (leer(p).match(/<script>\n\(function\(\)\{\n  var d=document\.documentElement[\s\S]*?<\/script>/) || ['(no tiene)'])[0]);
  assert.ok(arranques.every(a => a === arranques[0]), 'el script del <head> difiere entre páginas');
});

/* La empresa no publica su ubicación: solo "Colombia". (Pasto no está en la lista: también es la hierba de los paisajes) */
const LUGARES = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
  'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá', 'Leticia', 'Medellín',
  'Barranquilla', 'Cartagena', 'Tunja', 'Manizales', 'Florencia', 'Yopal', 'Popayán', 'Valledupar', 'Quibdó', 'Montería', 'Inírida', 'Neiva',
  'Riohacha', 'Santa Marta', 'Villavicencio', 'Cúcuta', 'Mocoa', 'Armenia', 'Pereira', 'Bucaramanga', 'Sincelejo', 'Ibagué', 'Cali',
  'Mitú', 'Puerto Carreño', 'Región Caribe', 'Pacífico', 'Andina', 'Amazonía', 'Orinoquía', 'Llanos Orientales', 'Eje Cafetero'];

test('no se publica ninguna ubicación más precisa que "Colombia"', () => {
  const hallados = [];
  for (const f of publicos()) {
    const txt = leer(f);
    for (const l of LUGARES) if (new RegExp(`(^|[^\\p{L}])${l}([^\\p{L}]|$)`, 'u').test(txt)) hallados.push(`${f}: ${l}`);
  }
  assert.deepEqual(hallados, []);
});

test('se usan los términos correctos: GNSS RTK, fotogrametría y ortomosaico', () => {
  const malos = [/GPS RTK/i, /ortofoto/i, /levantamiento con dron/i, /replanteo de obra\b/i];
  const hallados = [];
  for (const f of publicos()) for (const r of malos) if (r.test(leer(f))) hallados.push(`${f}: ${r.source}`);
  assert.deepEqual(hallados, []);
});
