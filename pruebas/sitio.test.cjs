/* Lo que un visitante hace en el sitio y en la landing. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { abrirNavegador } = require('./ayuda.cjs');

let nav;
test.before(async () => { nav = await abrirNavegador(); });
test.after(async () => { await nav.cerrar(); });

for (const ruta of ['', 'landing/', 'privacidad.html', 'esta-pagina-no-existe']) {
  test(`"/${ruta}" carga sin errores ni archivos faltantes`, async () => {
    const p = await nav.pagina(ruta);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
    await p.waitForTimeout(400);
    assert.deepEqual(p.errores, []);
    await p.cerrar();
  });
}

test('el interruptor de tema cambia el modo y lo recuerda al volver', async () => {
  const p = await nav.pagina('');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'dark');
  await p.click('.hdr [data-switch="theme"]');
  assert.equal(await p.getAttribute('html', 'data-theme'), 'light');
  await p.evaluate(() => localStorage.removeItem('gf-motion'));
  await p.reload({ waitUntil: 'load' });
  assert.equal(await p.evaluate(() => localStorage.getItem('gf-theme')), 'light');
  await p.cerrar();
});

test('la calculadora importa coordenadas copiadas de Excel en español', async () => {
  const p = await nav.pagina('#calculadora');
  await p.click('#calculadora summary');
  await p.fill('#vPaste', 'Punto\tEste\tNorte\n1\t1000,00\t1000,00\n2\t1048,40\t1008,20\n3\t1052,90\t1052,75\n4\t1011,10\t1061,30\n5\t998,60\t1040,40');
  await p.click('#vImport');
  assert.equal((await p.textContent('#rM2')).trim(), '2.655,41');
  assert.equal(await p.inputValue('#vtx .vrow:nth-child(2) input[data-k="e"]'), '1048.4');
  assert.deepEqual(p.errores, []);
  await p.cerrar();
});

test('los botones de WhatsApp abren el chat de la empresa', async () => {
  for (const ruta of ['', 'landing/']) {
    const p = await nav.pagina(ruta);
    const hrefs = await p.$$eval('[data-wa]', as => as.map(a => a.href));
    assert.ok(hrefs.length >= 2, 'hay botones de WhatsApp en ' + ruta);
    for (const h of hrefs) assert.match(h, /^https:\/\/wa\.me\/573204164329\?text=/);
    await p.cerrar();
  }
});

test('en el celular el menú abre y se cierra al elegir una sección', async () => {
  const p = await nav.pagina('', { ancho: 390, alto: 844, celular: true });
  await p.click('.menu-btn');
  assert.equal(await p.getAttribute('.menu-btn', 'aria-expanded'), 'true');
  await p.click('#mnav a[href="#calculadora"]');
  await p.waitForTimeout(300);
  assert.equal(await p.getAttribute('.menu-btn', 'aria-expanded'), 'false');
  assert.deepEqual(p.errores, []);
  await p.cerrar();
});

test('las miniaturas del menú de trabajos se ven aunque un filtro oculte la tarjeta', async () => {
  const p = await nav.pagina('', { ancho: 390, alto: 844, celular: true });
  await p.evaluate(() => document.getElementById('projChips').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(300);
  await p.click('#projChips [data-f="predios"]');
  await p.click('.menu-btn');
  await p.click('button.mexp[aria-controls="mSubTrab"]');
  await p.waitForTimeout(300);
  const vacias = await p.$$eval('#mSubTrab [data-proj]', bs => bs.filter(b => {
    const c = b.querySelector('canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) return false;
    return true;
  }).map(b => b.dataset.proj));
  assert.deepEqual(vacias, []);
  assert.deepEqual(p.errores, []);
  await p.cerrar();
});
