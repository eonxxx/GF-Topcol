# GF Topografías Colombia · Sitio web

Sitio estático (HTML, CSS y JavaScript, sin bases de datos ni instalaciones). Funciona en cualquier hosting.

## Qué hay en la carpeta

```
index.html            Página principal
privacidad.html       Política de tratamiento de datos (Ley 1581 de 2012)
404.html              Página que se muestra cuando una dirección no existe
css/styles.css        Todos los estilos (colores, tipografía, menús, secciones)
js/config.js          DATOS DE LA EMPRESA: WhatsApp, teléfono, correo, tema y animación
js/nucleo.js          Utilidades, modo claro/oscuro e interruptor de animación
js/fondo.js           Fondo animado de curvas de nivel
js/paisajes.js        Paisajes animados (hero, trabajos, panorama, pie de página)
js/main.js            Menús, servicios, calculadora, trabajos y formulario
fonts/                Fuentes Bricolage Grotesque, Figtree y JetBrains Mono (licencia libre OFL)
img/                  Logo sin fondo (SVG y PNG), íconos de la pestaña y del celular, e imagen para compartir
favicon.ico           Ícono de la pestaña del navegador
site.webmanifest      Permite "Agregar a la pantalla de inicio" en el celular
robots.txt            Instrucciones para buscadores
sitemap.xml           Mapa del sitio para Google
.htaccess             Ajustes para hostings con Apache/cPanel (caché, compresión, página 404); GitHub lo ignora
.nojekyll             Le indica a GitHub Pages que publique los archivos tal cual, sin procesarlos
```

## Logo

En `img/` están todas las versiones del logo, sin fondo:

- `logo.svg` y `logo.png`: logo completo para fondos claros (letras negras).
- `logo-blanco.svg` y `logo-blanco.png`: logo completo para fondos oscuros (letras blancas).
- `logo-horizontal.svg` y `logo-horizontal-blanco.svg` (también en PNG): versión horizontal que usa el encabezado.
- `logo-emblema.svg` y `logo-emblema.png`: solo el emblema dorado.
- `favicon.svg`, `favicon.ico` e `icon-*.png`: íconos de la pestaña del navegador y del celular.

La página cambia sola entre la versión blanca y la negra según el modo oscuro o claro.
Para cambiar el logo, reemplaza esos archivos por otros con el mismo nombre (SVG, o PNG con fondo transparente).
Si usas otro formato, cambia el nombre del archivo en `index.html`, `privacidad.html` y `404.html` (busca `logo-horizontal`).

## Cambiar los datos de la empresa

Abre `js/config.js` con cualquier editor de texto (Bloc de notas, VS Code):

- `whatsapp`: 57 + el número de celular, sin espacios ni signos (ej. `573204164329`).
- `telefono`: como quieres que se vea (ej. `+57 320 416 4329`).
- `correo`: si lo escribes, aparece la opción de responder por correo; si lo dejas vacío, se oculta.
- `temaInicial`: `'oscuro'`, `'claro'` o `'sistema'` (sigue el modo del celular o computador del visitante).
- `animacion`: `true` para que el fondo y los paisajes se muevan solos al abrir la página.
- `respetarReducirMovimiento`: `true` si quieres que empiece quieta para quien activó "reducir movimiento" en su equipo.

El visitante siempre puede cambiar el tema y pausar la animación con los dos interruptores del encabezado (en el celular, dentro del menú), y su elección se recuerda.

## Antes de publicar

1. La dirección del sitio ya está puesta: `https://eonxxx.github.io/GF-Topcol/` (en `index.html`, `privacidad.html`,
   `robots.txt` y `sitemap.xml`). De ella depende la vista previa al compartir el enlace por WhatsApp o Facebook (`img/og-image.jpg`).
   Si un día usas un dominio propio, cambia esa dirección en esos cuatro archivos y, en `404.html`, cambia `/GF-Topcol/` por `/`.
2. Si cambias el nombre de la empresa, cámbialo también en el `<title>` y las etiquetas `<meta>` de `index.html`.
3. Revisa `privacidad.html`: es un texto base. Si tienes NIT o correo, agrégalos, y si más adelante usas herramientas como Google Analytics, actualiza la sección 5.

## Publicar

- **Hosting con cPanel**: entra al Administrador de archivos y sube todo el contenido de esta carpeta a `public_html` (incluido `.htaccess`, que puede estar oculto). Cuando tengas certificado SSL, activa las tres líneas de HTTPS dentro de `.htaccess`.
- **Netlify** (gratis): entra a app.netlify.com/drop y arrastra la carpeta. Luego puedes conectar tu dominio.
- **GitHub Pages** (gratis, así está publicado): repositorio `eonxxx/GF-Topcol`, rama `main`, carpeta raíz (`/`).
  Para actualizar, sube los archivos nuevos al repositorio (Add file → Upload files → Commit changes); en un par de minutos se ve el cambio.

## Ver la página en tu computador

Puedes abrir `index.html` con doble clic. En ese caso el navegador no deja usar las fuentes de la carpeta `fonts`, así que la página las toma de Google Fonts (necesitas internet).
Para verla exactamente como en internet, abre una terminal en esta carpeta y ejecuta `python -m http.server`; luego entra a http://localhost:8000

## Cuando hagas cambios

Los estilos y scripts llevan `?v=5` en el HTML. Si cambias `styles.css` o algún `.js`, sube ese número (`?v=6`) en `index.html`, `privacidad.html` y `404.html` para que los visitantes reciban la versión nueva y no la guardada en su navegador.

## Notas

- Las tarjetas de Trabajos son ilustraciones animadas de referencia, no fotos de proyectos reales.
- La calculadora trabaja con coordenadas planas en metros (por ejemplo Origen Nacional, EPSG:9377).
- El formulario no guarda datos: arma el mensaje y lo abre en WhatsApp para que el cliente lo envíe.
