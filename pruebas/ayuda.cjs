/* Ayudas comunes de las pruebas en navegador: un servidor como GitHub Pages
   y páginas que registran errores de JavaScript y archivos que no cargan. */
'use strict';
const { chromium } = require('playwright');
const { iniciar } = require('./servidor.cjs');

async function abrirNavegador() {
  const srv = await iniciar(0);
  const nav = await chromium.launch();
  return {
    url: srv.url,
    /* Abre una ruta del sitio con el tema y la animación indicados (por defecto: oscuro y quieto) */
    async pagina(ruta = '', { tema = 'dark', movimiento = 'off', ancho = 1280, alto = 800, celular = false } = {}) {
      const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, isMobile: celular, hasTouch: celular, deviceScaleFactor: celular ? 2 : 1 });
      /* Fija las preferencias solo al abrir la primera página: al recargar se conserva lo que el visitante eligió */
      await ctx.addInitScript(([t, m]) => { try { if (!sessionStorage.getItem('prueba')) { sessionStorage.setItem('prueba', '1'); localStorage.setItem('gf-theme', t); localStorage.setItem('gf-motion', m); } } catch (e) {} }, [tema, movimiento]);
      const p = await ctx.newPage();
      p.errores = [];
      p.on('pageerror', e => p.errores.push('JS: ' + e.message));
      p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(m.text())) p.errores.push('consola: ' + m.text()); });
      p.on('response', r => { if (r.status() >= 400 && !(r.request().isNavigationRequest() && r.request().frame() === p.mainFrame())) p.errores.push(r.status() + ' ' + r.url()); });
      p.on('requestfailed', r => { if (r.url().startsWith(srv.url)) p.errores.push('falló ' + r.url()); });
      p.cerrar = () => ctx.close();
      await p.goto(srv.url + ruta, { waitUntil: 'load' });
      return p;
    },
    async cerrar() { await nav.close(); await srv.cerrar(); },
  };
}

module.exports = { abrirNavegador };
