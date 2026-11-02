/* Accesibilidad con axe-core (reglas WCAG 2.1 A/AA y buenas prácticas),
   en el sitio y la landing, en modo oscuro y claro. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { abrirNavegador } = require('./ayuda.cjs');
const AXE = require.resolve('axe-core/axe.min.js');

let nav;
test.before(async () => { nav = await abrirNavegador(); });
test.after(async () => { await nav.cerrar(); });

for (const ruta of ['', 'landing/', 'privacidad.html']) {
  for (const tema of ['dark', 'light']) {
    test(`"/${ruta}" en modo ${tema === 'dark' ? 'oscuro' : 'claro'} no tiene fallas de accesibilidad`, async () => {
      const p = await nav.pagina(ruta, { tema });
      await p.addScriptTag({ path: AXE });
      const fallas = await p.evaluate(async () => {
        const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
        return r.violations.map(v => v.id + ': ' + v.nodes.slice(0, 4).map(n => n.target.join(' ')).join(' | '));
      });
      assert.deepEqual(fallas, []);
      await p.cerrar();
    });
  }
}
