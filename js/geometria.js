/* =========================================================
   GF Topografías · Geometría de la calculadora de área
   Lee coordenadas pegadas (Excel en español, CSV, listas de
   puntos) y mide el polígono: área, perímetro, distancia y
   azimut de cada lado. No toca la página: la usan main.js y
   las pruebas (pruebas/geometria.test.cjs).
   ========================================================= */
const Geometria=(()=>{
  'use strict';
  const NUM=/^[+-]?\d+(\.\d+)?$/;

  /* "1048,40", "1.048,40", "1,048.40", "4.912.345" o "1048.4" → número (NaN si no es un número) */
  function aNumero(tok){
    let t=String(tok).trim().replace(/^[,;]+|[,;]+$/g,'');
    const c=t.lastIndexOf(','),p=t.lastIndexOf('.');
    if(c>=0&&p>=0)t=c>p?t.replace(/\./g,'').replace(',','.'):t.replace(/,/g,'');
    else if(c>=0)t=t.indexOf(',')<c?t.replace(/,/g,''):t.replace(',','.');
    else if(p>=0&&t.indexOf('.')<p)t=t.replace(/\./g,'');
    return NUM.test(t)?parseFloat(t):NaN;
  }

  /* Separa una línea en columnas: tabulador o punto y coma; si no hay, espacios; si tampoco, comas */
  function partir(linea){
    if(/[\t;]/.test(linea))return linea.split(/[\t;]+/);
    if(/\s/.test(linea.trim()))return linea.trim().split(/\s+/);
    return linea.split(',');
  }

  /* Texto pegado → [{e,n}] en orden Este, Norte. Ignora encabezados y etiquetas, la cota
     y la columna del número de punto (enteros pequeños y distintos antes de las coordenadas). */
  function leerCoordenadas(texto){
    const filas=[];
    String(texto||'').split(/\r?\n/).forEach(l=>{
      if(!l.trim())return;
      const nums=partir(l).map(t=>({t:t.trim(),v:aNumero(t)})).filter(x=>isFinite(x.v));
      if(nums.length>=2)filas.push(nums);
    });
    const conNumeroDePunto=filas.length>0&&filas.every(f=>f.length>=3)&&(()=>{
      const ids=filas.map(f=>f[0]);
      if(!ids.every(x=>/^\d+$/.test(x.t)))return false;
      const v=ids.map(x=>x.v);
      if(new Set(v).size!==v.length)return false;
      return Math.max(...v)<Math.min(...filas.map(f=>Math.min(Math.abs(f[1].v),Math.abs(f[2].v))));
    })();
    const k=conNumeroDePunto?1:0;
    const out=filas.map(f=>({e:f[k].v,n:f[k+1].v}));
    if(out.length>2){const a=out[0],b=out[out.length-1];if(a.e===b.e&&a.n===b.n)out.pop()}
    return out;
  }

  function seCruzan(a,b,c,d){
    const o=(p,q,r)=>(q.e-p.e)*(r.n-p.n)-(q.n-p.n)*(r.e-p.e);
    const d1=o(a,b,c),d2=o(a,b,d),d3=o(c,d,a),d4=o(c,d,b);
    return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
  }

  /* [{e,n}] → {area (m²), perimetro (m), lados:[{i,j,distancia,azimut}], cruza}; null si faltan datos */
  function medir(p){
    if(!p||p.length<3||!p.every(v=>isFinite(v.e)&&isFinite(v.n)))return null;
    const n=p.length,e0=p[0].e,n0=p[0].n,lados=[];let a2=0,perimetro=0;
    for(let i=0;i<n;i++){
      const j=(i+1)%n,x1=p[i].e-e0,y1=p[i].n-n0,x2=p[j].e-e0,y2=p[j].n-n0;
      a2+=x1*y2-x2*y1;
      const dE=p[j].e-p[i].e,dN=p[j].n-p[i].n,distancia=Math.hypot(dE,dN);
      perimetro+=distancia;lados.push({i,j,distancia,azimut:(Math.atan2(dE,dN)*180/Math.PI+360)%360});
    }
    let cruza=false;
    for(let i=0;i<n&&!cruza;i++)for(let j=i+2;j<n;j++){
      if(i===0&&j===n-1)continue;
      if(seCruzan(p[i],p[i+1],p[j],p[(j+1)%n])){cruza=true;break}
    }
    return{area:Math.abs(a2)/2,perimetro,lados,cruza};
  }

  /* Grados decimales → 80°23'03,0" (segundos con una cifra y coma decimal) */
  const SEG=new Intl.NumberFormat('es-CO',{minimumFractionDigits:1,maximumFractionDigits:1});
  function aDMS(g){
    g=((g%360)+360)%360;
    let d=Math.floor(g),m=Math.floor((g-d)*60),s=Math.round(((g-d)*60-m)*600)/10;
    if(s>=60){s=0;m++}
    if(m>=60){m=0;d++}
    if(d>=360)d-=360;
    return d+'°'+String(m).padStart(2,'0')+"'"+SEG.format(s).padStart(4,'0')+'"';
  }

  return{leerCoordenadas,medir,aDMS};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Geometria;
