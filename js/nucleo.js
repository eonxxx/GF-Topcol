/* =========================================================
   GF Topografías · Núcleo compartido
   Utilidades, colores, tema claro/oscuro, interruptor de
   animación, bucle de animación y curvas de nivel.
   Lo cargan todas las páginas del sitio.
   ========================================================= */
'use strict';

/* ---------- Utilidades ---------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const NF={};
const fmt=(v,d=2)=>(NF[d]||(NF[d]=new Intl.NumberFormat('es-CO',{minimumFractionDigits:d,maximumFractionDigits:d}))).format(v);
const root=document.documentElement;
const linspace=(a,b,n)=>Array.from({length:n},(_,i)=>n>1?a+(b-a)*i/(n-1):a);
const hex2rgb=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const rgba=(c,a)=>'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';
const mix=(a,b,t)=>[Math.round(lerp(a[0],b[0],t)),Math.round(lerp(a[1],b[1],t)),Math.round(lerp(a[2],b[2],t))];
const C={peach:hex2rgb('#F3B79A'),rose:hex2rgb('#E7A8C4'),lav:hex2rgb('#B7A6F2'),mint:hex2rgb('#9FD8C4')};
let HERO={a:C.peach,b:C.lav,dot:[255,255,255]};
function themeColors(){
  HERO=root.dataset.theme==='light'
    ?{a:hex2rgb('#C9764F'),b:hex2rgb('#6E5BC9'),dot:[35,33,44]}
    :{a:C.peach,b:C.lav,dot:[255,255,255]};
}

/* Estado del interruptor de animación */
const MOTION={get on(){return root.dataset.motion!=='off'}};

/* ---------- Avisos y portapapeles ---------- */
let toastT;
function toast(msg){
  const t=$('#toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);
}
async function copyText(txt){
  try{await navigator.clipboard.writeText(txt);return true}
  catch(e){const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}ta.remove();return ok}
}

/* ---------- Deslizadores: pintan el tramo recorrido ---------- */
function paintRange(el){const mn=+el.min||0,mx=+el.max||100;el.style.setProperty('--p',(clamp(+el.value,mn,mx)-mn)/((mx-mn)||1)*100+'%')}
document.addEventListener('input',e=>{if(e.target&&e.target.type==='range')paintRange(e.target)});

/* ---------- Ayudas de canvas ---------- */
function sizeCanvas(cv){
  const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  return{ctx,w,h};
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function tag(ctx,txt,x,y,col){
  ctx.font='500 11px "JetBrains Mono",ui-monospace,monospace';
  const tw=ctx.measureText(txt).width;
  rr(ctx,x,y-10,tw+14,20,10);ctx.fillStyle='rgba(20,18,26,.84)';ctx.fill();
  ctx.strokeStyle=rgba(col||C.lav,.55);ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#F2EFF7';ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillText(txt,x+7,y+.5);
  return tw+14;
}
function cross(ctx,x,y,s,color){ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-s,y);ctx.lineTo(x+s,y);ctx.moveTo(x,y-s);ctx.lineTo(x,y+s);ctx.stroke()}
function panelBg(ctx,w,h){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#201E2A');g.addColorStop(1,'#17151E');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;ctx.beginPath();
  for(let x=0;x<=w;x+=32){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,h)}
  for(let y=0;y<=h;y+=32){ctx.moveTo(0,y+.5);ctx.lineTo(w,y+.5)}
  ctx.stroke();
}

/* ---------- Terreno sintético + curvas de nivel (marching squares) ---------- */
function makeTerrain(seed){
  const p=[];
  for(let i=0;i<6;i++)p.push([Math.sin(seed*12.9898+i*78.233)*.5+.5,Math.sin(seed*4.1414+i*37.719)*.5+.5,.08+.14*(Math.sin(seed+i*3.3)*.5+.5),(i%3===2?-1:1)*(.5+.5*(Math.sin(seed*2+i)*.5+.5))]);
  const f=(x,y)=>{let h=.5;for(const[cx,cy,r,a]of p){const d=((x-cx)**2+(y-cy)**2)/(r*r);h+=a*.35*Math.exp(-d)}h+=.04*Math.sin(x*9+seed)*Math.cos(y*7-seed);return h};
  let lo=Infinity,hi=-Infinity;
  for(let j=0;j<=20;j++)for(let i=0;i<=20;i++){const v=f(i/20,j/20);if(v<lo)lo=v;if(v>hi)hi=v}
  f.lo=lo;f.hi=hi;return f;
}
function levelsFor(f,n){const d=f.hi-f.lo;return linspace(f.lo+.06*d,f.hi-.06*d,n)}
function buildGrid(f,w,h,cs){
  const cols=Math.ceil(w/cs),rows=Math.ceil(h/cs),g=new Float32Array((cols+1)*(rows+1));
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)g[j*(cols+1)+i]=f(i*cs/w,j*cs/h);
  return{g,cols,rows,cs,w,h};
}
/* Traza una curva de nivel L sobre la malla G (en el path actual del contexto) */
function traceLevel(ctx,G,L){
  const g=G.g,cols=G.cols,rows=G.rows,cs=G.cs,st=cols+1;
  for(let j=0;j<rows;j++){
    for(let i=0;i<cols;i++){
      const a=g[j*st+i],b=g[j*st+i+1],c=g[(j+1)*st+i+1],d=g[(j+1)*st+i];
      const idx=(a>L?8:0)|(b>L?4:0)|(c>L?2:0)|(d>L?1:0);
      if(idx===0||idx===15)continue;
      const x=i*cs,y=j*cs;
      const Tx=x+(L-a)/(b-a)*cs,Ty=y,Rx=x+cs,Ry=y+(L-b)/(c-b)*cs,Bx=x+(L-d)/(c-d)*cs,By=y+cs,Lx=x,Ly=y+(L-a)/(d-a)*cs;
      switch(idx){
        case 1:case 14:ctx.moveTo(Lx,Ly);ctx.lineTo(Bx,By);break;
        case 2:case 13:ctx.moveTo(Bx,By);ctx.lineTo(Rx,Ry);break;
        case 3:case 12:ctx.moveTo(Lx,Ly);ctx.lineTo(Rx,Ry);break;
        case 4:case 11:ctx.moveTo(Tx,Ty);ctx.lineTo(Rx,Ry);break;
        case 5:ctx.moveTo(Tx,Ty);ctx.lineTo(Rx,Ry);ctx.moveTo(Lx,Ly);ctx.lineTo(Bx,By);break;
        case 6:case 9:ctx.moveTo(Tx,Ty);ctx.lineTo(Bx,By);break;
        case 7:case 8:ctx.moveTo(Tx,Ty);ctx.lineTo(Lx,Ly);break;
        case 10:ctx.moveTo(Tx,Ty);ctx.lineTo(Lx,Ly);ctx.moveTo(Bx,By);ctx.lineTo(Rx,Ry);break;
      }
    }
  }
}
function drawContours(ctx,G,levels,ca,cb,amin,amaj,lw){
  const n=levels.length;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(let li=0;li<n;li++){
    const major=(li%5===0);
    ctx.strokeStyle=rgba(mix(ca,cb,n>1?li/(n-1):0),major?amaj:amin);
    ctx.lineWidth=major?lw*1.6:lw;
    ctx.beginPath();traceLevel(ctx,G,levels[li]);ctx.stroke();
  }
}

/* ---------- WhatsApp ---------- */
const waLink=t=>'https://wa.me/'+CONFIG.whatsapp+'?text='+encodeURIComponent(t);

/* ---------- Bucle de animación compartido ---------- */
const LOOP=(()=>{
  const fns=[];
  function frame(now){requestAnimationFrame(frame);if(document.hidden)return;for(let i=0;i<fns.length;i++)fns[i](now)}
  requestAnimationFrame(frame);
  return{add:f=>{fns.push(f)}};
})();

/* ---------- Tema y animación: un interruptor para cada uno ---------- */
function syncSwitches(){
  const dark=root.dataset.theme!=='light',on=MOTION.on;
  $$('[data-switch="theme"]').forEach(b=>{
    b.setAttribute('aria-checked',String(dark));
    if(b.hasAttribute('data-tip'))b.dataset.tip=dark?'Modo oscuro · cambiar a claro':'Modo claro · cambiar a oscuro';
  });
  $$('[data-switch="motion"]').forEach(b=>{
    b.setAttribute('aria-checked',String(on));
    if(b.hasAttribute('data-tip'))b.dataset.tip=on?'Animación encendida · pausar':'Animación pausada · encender';
  });
  $$('[data-state="theme"]').forEach(e=>{e.textContent=dark?'Activado':'Desactivado'});
  $$('[data-state="motion"]').forEach(e=>{e.textContent=on?'Las curvas y los paisajes se mueven':'Todo quieto'});
  const m=$('meta[name="theme-color"]');if(m)m.setAttribute('content',dark?'#23212C':'#F2EFF7');
}
function setTheme(mode,save){
  root.setAttribute('data-theme',mode);
  if(save){try{localStorage.setItem('gf-theme',mode)}catch(e){}}
  themeColors();syncSwitches();
  document.dispatchEvent(new CustomEvent('gf:theme',{detail:mode}));
}
function setMotion(on,save){
  root.setAttribute('data-motion',on?'on':'off');
  if(save){try{localStorage.setItem('gf-motion',on?'on':'off')}catch(e){}}
  syncSwitches();
  document.dispatchEvent(new CustomEvent('gf:motion',{detail:on}));
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-switch]');if(!b)return;
  if(b.dataset.switch==='theme')setTheme(root.dataset.theme==='light'?'dark':'light',true);
  else{setMotion(!MOTION.on,true);toast(MOTION.on?'Animación encendida':'Animación pausada')}
});
themeColors();syncSwitches();

/* ---------- Datos de la empresa en la página (desde config.js) ---------- */
(()=>{
  $$('[data-brand]').forEach(e=>{e.textContent=CONFIG.empresa});
  $$('[data-short]').forEach(e=>{e.textContent=CONFIG.corto});
  $$('[data-city]').forEach(e=>{e.textContent=CONFIG.ciudad});
  const mail=!!CONFIG.correo;
  $$('[data-mail]').forEach(a=>{if(mail){a.href='mailto:'+CONFIG.correo;a.textContent=CONFIG.correo;a.hidden=false}else a.hidden=true});
  $$('[data-tel]').forEach(a=>{a.href='tel:+'+CONFIG.whatsapp;if(!a.hasAttribute('data-keep'))a.textContent=CONFIG.telefono});
  $$('[data-wa]').forEach(a=>{a.href=waLink(a.dataset.wa||'Hola, quiero información sobre sus servicios de topografía.');a.target='_blank';a.rel='noopener'});
  $$('[data-year]').forEach(e=>{e.textContent=new Date().getFullYear()});
  if(!/^57\d{10}$/.test(CONFIG.whatsapp))console.info('[GF] Revisa CONFIG.whatsapp en js/config.js: debe ser 57 + número de 10 dígitos');
})();
