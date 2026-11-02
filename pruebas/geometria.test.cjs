/* Calculadora de área: lectura de coordenadas y medición del polígono.
   Los valores esperados vienen de cálculos independientes (a mano o con otra
   implementación), no de repetir la fórmula del código. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Geometria = require('../js/geometria.js');

const cerca = (real, esperado, tol, msg) => assert.ok(Math.abs(real - esperado) <= tol, `${msg}: ${real} ≠ ${esperado}`);
const LOTE = [[1000, 1000], [1048.4, 1008.2], [1052.9, 1052.75], [1011.1, 1061.3], [998.6, 1040.4]].map(([e, n]) => ({ e, n }));

test('lee coordenadas copiadas de Excel en español (tabulador y coma decimal)', () => {
  const p = Geometria.leerCoordenadas('1000,00\t1000,00\n1048,40\t1008,20\n1052,90\t1052,75');
  assert.deepEqual(p, [{ e: 1000, n: 1000 }, { e: 1048.4, n: 1008.2 }, { e: 1052.9, n: 1052.75 }]);
});

test('salta el encabezado y la columna con el número de punto', () => {
  const texto = 'Punto\tEste\tNorte\n1\t1000,00\t1000,00\n2\t1048,40\t1008,20\n3\t1052,90\t1052,75\n4\t1011,10\t1061,30';
  assert.deepEqual(Geometria.leerCoordenadas(texto).map(p => [p.e, p.n]), [[1000, 1000], [1048.4, 1008.2], [1052.9, 1052.75], [1011.1, 1061.3]]);
});

test('acepta separador de miles con punto y decimales con coma', () => {
  const p = Geometria.leerCoordenadas('V1; 4.912.345,67; 2.045.678,90\nV2; 4.912.400,10; 2.045.700,00\nV3; 4.912.380,00; 2.045.750,50');
  assert.deepEqual(p[0], { e: 4912345.67, n: 2045678.9 });
  assert.equal(p.length, 3);
});

test('lee CSV con punto decimal y etiquetas de texto', () => {
  assert.deepEqual(Geometria.leerCoordenadas('V1,1048.4,1008.2\nV2,1052.9,1052.75\nV3,1011.1,1061.3')[1], { e: 1052.9, n: 1052.75 });
});

test('con este, norte y cota toma solo este y norte', () => {
  assert.deepEqual(Geometria.leerCoordenadas('1000.000 1000.000 50.20\n1048.400 1008.200 51.10\n1052.900 1052.750 52.00')[2], { e: 1052.9, n: 1052.75 });
});

test('quita el último vértice cuando repite el primero (polígono cerrado)', () => {
  assert.equal(Geometria.leerCoordenadas('0 0\n100 0\n100 100\n0 100\n0 0').length, 4);
});

test('mide el lote de ejemplo: área, perímetro, distancia y azimut', () => {
  const r = Geometria.medir(LOTE);
  cerca(r.area, 2655.4125, 1e-6, 'área');
  cerca(r.perimetro, 201.309, 1e-3, 'perímetro');
  cerca(r.lados[0].distancia, 49.0897, 1e-4, 'distancia V1-V2');
  cerca(r.lados[0].azimut, 80.384173, 1e-5, 'azimut V1-V2');
  assert.equal(r.cruza, false);
});

test('azimut de cada rumbo en un cuadrado de 100 m', () => {
  const r = Geometria.medir([{ e: 0, n: 0 }, { e: 100, n: 0 }, { e: 100, n: 100 }, { e: 0, n: 100 }]);
  assert.equal(r.area, 10000);
  assert.equal(r.perimetro, 400);
  assert.deepEqual(r.lados.map(l => l.azimut), [90, 0, 270, 180]);
});

test('detecta linderos que se cruzan', () => {
  assert.equal(Geometria.medir([{ e: 0, n: 0 }, { e: 100, n: 100 }, { e: 100, n: 0 }, { e: 0, n: 100 }]).cruza, true);
});

test('sin tres vértices válidos no hay medición', () => {
  assert.equal(Geometria.medir([{ e: 0, n: 0 }, { e: 1, n: 1 }]), null);
  assert.equal(Geometria.medir([{ e: 0, n: 0 }, { e: 1, n: NaN }, { e: 2, n: 0 }]), null);
});

test('azimut en grados, minutos y segundos', () => {
  assert.equal(Geometria.aDMS(80.384173), '80°23\'03,0"');
  assert.equal(Geometria.aDMS(90), '90°00\'00,0"');
  assert.equal(Geometria.aDMS(88.39542), '88°23\'43,5"');
});

test('un azimut casi de 360° se muestra como 0°, no como 360°', () => {
  assert.equal(Geometria.aDMS(359.99999), '0°00\'00,0"');
});
