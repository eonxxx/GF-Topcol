/* =========================================================
   GF Topografías · Página de inicio
   Menús, servicios, trabajos, calculadora, equipos, proceso,
   control de calidad, preguntas y formulario de cotización.
   Depende de: config.js, nucleo.js, fondo.js y paisajes.js
   ========================================================= */
(()=>{
'use strict';

/* ---------- Íconos de línea ---------- */
const ICO={
  lev:'<rect x="8" y="3.5" width="8" height="5.5" rx="1.5"/><path d="M12 9v1.5M12 10.5 6 21M12 10.5 18 21M12 10.5V21"/><path d="M16 6.2h1.8"/>',
  lin:'<path d="M4 7.5 11 4l9 4-2 11.5L5.5 20z"/><path d="M11 4l1.4 16"/><circle cx="11" cy="4" r="1"/><circle cx="12.4" cy="20" r="1"/>',
  vol:'<path d="M3.5 15.5C5 9 9 6.5 13.5 7s7 4.5 5.5 8.5-10 5.5-15.5 0z"/><path d="M8 14.5c1.2-3 3.4-4.2 5.3-4s3.2 2 2.2 4-4.7 2.8-7.5 0z"/>',
  rep:'<path d="M6.5 21V4"/><path d="M6.5 4.5h10l-2.2 3.2 2.2 3.3h-10"/><path d="M14 18h6M17 15v6"/>',
  dro:'<circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7.5 7.5l2.6 2.6M16.5 7.5l-2.6 2.6M7.5 16.5l2.6-2.6M16.5 16.5l-2.6-2.6"/><rect x="9.8" y="9.8" width="4.4" height="4.4" rx="1.2"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
};
const svg=(k,c)=>'<svg class="ico'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+ICO[k]+'</svg>';

/* =========================================================
   DATOS: servicios y trabajos
   ========================================================= */
const PLAZO='Según el área y el acceso; lo confirmamos al cotizar';
const SERVICES=[
  {key:'lev',name:'Levantamiento topográfico',short:'Fincas, lotes y proyectos',
   desc:'Medimos linderos, construcciones, vías y cotas para que tengas el estado real del terreno.',
   eq:'Estación total · GNSS RTK',plazo:PLAZO,out:['Plano topográfico DWG','Georreferenciado en MAGNA-SIRGAS','Puntos XYZ']},
  {key:'lin',name:'Loteo y linderos',short:'División de predios y mojones',
   desc:'Dividimos el terreno en lotes y ubicamos los linderos.',
   eq:'Estación total · GNSS RTK',plazo:PLAZO,out:['Plano de loteo','Cuadro de áreas y coordenadas','Mojones en campo']},
  {key:'vol',name:'Curvas de nivel y volúmenes',short:'Modelo 3D, cortes y llenos',
   desc:'Modelamos el terreno y calculamos cortes y llenos. Mueve la cota de proyecto y mira cómo cambian.',
   eq:'GNSS RTK · Estación total · Dron',plazo:PLAZO,out:['Curvas de nivel','Modelo 3D','Perfiles y secciones','Cálculo de volúmenes']},
  {key:'rep',name:'Apoyo topográfico en obras civiles',short:'Vías, puentes y urbanismo',
   desc:'Acompañamos la obra con replanteo, control de niveles y seguimiento del avance.',
   eq:'Estación total · GNSS RTK',plazo:PLAZO,out:['Replanteo de ejes y niveles','Control de cotas','Planos de obra construida']},
  {key:'dro',name:'Fotogrametría',short:'Áreas grandes o de difícil acceso',
   desc:'Con vuelos de dron cubrimos grandes extensiones en poco tiempo.',
   eq:'Dron · GNSS RTK',plazo:PLAZO,out:['Ortomosaico','Modelo 3D','Curvas de nivel','Cálculo de volúmenes']}
];
const PROJECTS=[
  {id:'p1',tipo:'predios',scene:'finca',pal:'day',seed:3,svc:'Levantamiento topográfico',tag:'Predios rurales',title:'Fincas y linderos',text:'Linderos, áreas y cercas de fincas ganaderas y agrícolas.',list:['Servicio: levantamiento topográfico y linderos','Entregables: plano DWG, cuadro de áreas y coordenadas']},
  {id:'p2',tipo:'obra',scene:'via',pal:'dusk',seed:5,svc:'Apoyo topográfico en obras civiles',tag:'Vías y carreteras',title:'Ejes y abscisado de vías',text:'Eje, perfil y secciones para carreteras, vías veredales y accesos.',list:['Servicio: apoyo topográfico en obras civiles','Entregables: perfil longitudinal, secciones y abscisado en campo']},
  {id:'p3',tipo:'predios',scene:'loteo',pal:'dawn',seed:7,svc:'Loteo y linderos',tag:'Loteo y urbanismo',title:'Loteo de un globo de terreno',text:'División en lotes, manzanas y vías, con su cuadro de áreas.',list:['Servicio: loteo y linderos','Entregables: plano de loteo, cuadro de áreas y mojones en campo']},
  {id:'p4',tipo:'modelos',scene:'dron',pal:'day',seed:9,svc:'Fotogrametría',tag:'Fotogrametría',title:'Ortomosaico y modelo del terreno',text:'Grandes extensiones fotografiadas desde el aire, con puntos de control en GNSS RTK.',list:['Servicio: fotogrametría con puntos de control GNSS RTK','Entregables: ortomosaico, nube de puntos y curvas de nivel']},
  {id:'p5',tipo:'modelos',scene:'curvas',pal:'night',seed:11,svc:'Curvas de nivel y volúmenes',tag:'Curvas de nivel',title:'Relieve en curvas de nivel',text:'Modelo digital del terreno con curvas a la equidistancia que necesites.',list:['Servicio: curvas de nivel y modelo 3D','Entregables: curvas en DWG, modelo del terreno y perfiles']},
  {id:'p6',tipo:'obra',scene:'vol',pal:'day',seed:13,svc:'Curvas de nivel y volúmenes',tag:'Movimiento de tierras',title:'Cortes, llenos y volúmenes',text:'Volúmenes calculados sobre el terreno real, antes y después de la obra.',list:['Servicio: curvas de nivel y volúmenes','Entregables: secciones, cuadro de volúmenes y plano de cortes y llenos']},
  {id:'p7',tipo:'predios',scene:'catastro',pal:'dawn',seed:15,svc:'Loteo y linderos',tag:'Planos de predio',title:'Plano con coordenadas',text:'Predio dibujado con sus linderos, vértices, áreas y colindantes.',list:['Servicio: levantamiento y linderos','Entregables: plano georreferenciado en MAGNA-SIRGAS y cuadro de coordenadas']},
  {id:'p8',tipo:'obra',scene:'replanteo',pal:'dawn',seed:17,svc:'Apoyo topográfico en obras civiles',tag:'Puentes',title:'Replanteo de puentes',text:'Ejes, apoyos y niveles marcados y verificados en campo.',list:['Servicio: apoyo topográfico en obras civiles','Entregables: cartera de replanteo y control de cotas']}
];
const CATS=[
  {k:'predios',name:'Predios',desc:'Fincas, lotes y planos'},
  {k:'obra',name:'Obras civiles',desc:'Vías, puentes y movimiento de tierras'},
  {k:'modelos',name:'Fotogrametría y modelos',desc:'Ortomosaicos y relieve'}
];
const go=id=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:MOTION.on?'smooth':'auto',block:'start'})};

/* ---------- Progreso de lectura y volver arriba ---------- */
const prog=$('#progress'),topBtn=$('#toTop');
function onScroll(){
  const max=root.scrollHeight-innerHeight;
  prog.style.transform='scaleX('+(max>0?clamp(scrollY/max,0,1):0)+')';
  topBtn.classList.toggle('show',scrollY>700);
}
addEventListener('scroll',onScroll,{passive:true});
topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:MOTION.on?'smooth':'auto'}));

/* ---------- Entrada al hacer scroll y contadores ---------- */
function countUp(el){
  const to=+el.dataset.count,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
  if(!MOTION.on){el.textContent=pre+to+suf;return}
  const t0=performance.now(),dur=1300;
  (function s(n){const p=clamp((n-t0)/dur,0,1);el.textContent=pre+Math.round(to*ease(p))+suf;if(p<1)requestAnimationFrame(s)})(t0);
}
const revIO=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');revIO.unobserve(e.target);$$('[data-count]',e.target).forEach(countUp)}
}),{threshold:.1});
$$('.reveal').forEach(el=>revIO.observe(el));

/* ---------- Hero: coordenadas y cota bajo el cursor ----------
   Sistema local de ejemplo (E 1000, N 1000, cota 100): no corresponde a ningún lugar real */
(()=>{
  const hero=$('#inicio'),chip=$('#readout');
  if(!hero||!chip||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  hero.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    Fondo.pointer(e.clientX,e.clientY,true);
    const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,v=Fondo.valueAt(e.clientX,e.clientY);
    chip.textContent='E '+fmt(1000+x*.35,0)+'\nN '+fmt(1000+(r.height-y)*.35,0)+'\nCota '+fmt(100+v*100,1)+' m';
    chip.style.opacity=1;chip.style.left=clamp(x,0,r.width-170)+'px';chip.style.top=clamp(y,0,r.height-84)+'px';
  });
  hero.addEventListener('pointerleave',()=>{Fondo.pointer(0,0,false);chip.style.opacity=0});
})();

/* =========================================================
   SERVICIOS: 5 animaciones en canvas
   ========================================================= */
const STATIC_T={lev:8400,lin:6800,vol:5000,rep:14000,dro:11500};
const TERR={lev:makeTerrain(5),dro:makeTerrain(9)};
const vol={P:10.2,W:20};
const prof=x=>10+3*Math.sin(x*.07+1)+1.6*Math.sin(x*.19+.4);
function volumes(P,W){let cut=0,fill=0;const dx=.5;for(let x=0;x<100;x+=dx){const d=prof(x+dx/2)-P;if(d>0)cut+=d*dx;else fill-=d*dx}return{cut:cut*W,fill:fill*W}}

const svc=(()=>{
  const cv=$('#svcCanvas'),extra=$('#svcExtra'),list=$('#svcList');
  let ctx,w=0,h=0,idx=0,t0=performance.now(),dirty=true,vis=false,cache={};

  function dLev(t){
    panelBg(ctx,w,h);
    const f=TERR.lev,gk='lev'+w+'x'+h;
    if(cache.k!==gk){cache.k=gk;cache.g=buildGrid(f,w,h,Math.max(9,Math.round(w/64)))}
    drawContours(ctx,cache.g,levelsFor(f,14),C.peach,C.lav,.26,.6,1);
    const P=[[.14,.34],[.32,.18],[.58,.2],[.82,.32],[.86,.62],[.62,.82],[.3,.76]],step=800,n=P.length,tt=t%9000,shown=Math.min(n,Math.floor(tt/step)+1);
    ctx.save();ctx.strokeStyle=rgba(C.mint,.9);ctx.lineWidth=1.6;ctx.setLineDash([6,5]);ctx.beginPath();
    for(let i=0;i<shown;i++){const x=P[i][0]*w,y=P[i][1]*h;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
    if(tt>n*step+300)ctx.closePath();
    ctx.stroke();ctx.restore();
    for(let i=0;i<shown;i++){
      const x=P[i][0]*w,y=P[i][1]*h,age=tt-i*step;
      cross(ctx,x,y,6,'#EEF2F4');ctx.fillStyle=rgba(C.mint,1);ctx.beginPath();ctx.arc(x,y,2.6,0,6.283);ctx.fill();
      if(age<700){const p=age/700;ctx.strokeStyle=rgba(C.mint,.8*(1-p));ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,6+p*24,0,6.283);ctx.stroke()}
      tag(ctx,'P'+(i+1)+' · '+fmt(400+f(P[i][0],P[i][1])*80,2)+' m',clamp(x+10,4,w-124),y-14,C.mint);
    }
  }

  function dLin(t){
    panelBg(ctx,w,h);
    const V=[[.18,.34],[.46,.2],[.8,.28],[.86,.62],[.52,.8],[.22,.68]],n=V.length,SX=72,SY=46,step=900,tt=t%8500,sp=tt/step;
    let a2=0;for(let i=0;i<n;i++){const j=(i+1)%n;a2+=(V[i][0]*SX)*(V[j][1]*SY)-(V[j][0]*SX)*(V[i][1]*SY)}
    const area=Math.abs(a2)/2;
    if(sp>n){const al=clamp((sp-n)/1.2,0,1)*.16;ctx.fillStyle=rgba(C.lav,al);ctx.beginPath();V.forEach((p,i)=>{if(i)ctx.lineTo(p[0]*w,p[1]*h);else ctx.moveTo(p[0]*w,p[1]*h)});ctx.closePath();ctx.fill()}
    ctx.save();ctx.strokeStyle=rgba(C.peach,.95);ctx.lineWidth=2;ctx.setLineDash([7,5]);
    for(let i=0;i<n;i++){
      const p=clamp(sp-i,0,1);if(p<=0)continue;
      const A=V[i],B=V[(i+1)%n],q=ease(p);
      ctx.beginPath();ctx.moveTo(A[0]*w,A[1]*h);ctx.lineTo(lerp(A[0],B[0],q)*w,lerp(A[1],B[1],q)*h);ctx.stroke();
    }
    ctx.restore();
    for(let i=0;i<n;i++){
      const s=clamp((sp-i)*3,0,1);if(s<=0)continue;
      const x=V[i][0]*w,y=V[i][1]*h,z=5*s;
      ctx.fillStyle='#EEF2F4';ctx.fillRect(x-z,y-z,z*2,z*2);ctx.strokeStyle=rgba(C.rose,1);ctx.lineWidth=1.5;ctx.strokeRect(x-z,y-z,z*2,z*2);
      ctx.fillStyle='rgba(238,242,244,.7)';ctx.font='500 11px "JetBrains Mono",monospace';ctx.textBaseline='alphabetic';ctx.fillText('V'+(i+1),x+9,y-9);
    }
    for(let i=0;i<n;i++){
      if(sp-i<1)continue;
      const A=V[i],B=V[(i+1)%n],d=Math.hypot((B[0]-A[0])*SX,(B[1]-A[1])*SY);
      tag(ctx,fmt(d,2)+' m',(A[0]+B[0])/2*w-24,(A[1]+B[1])/2*h,C.peach);
    }
    if(sp>n+.2){
      const txt='Área '+fmt(area,0)+' m²';ctx.font='500 11px "JetBrains Mono",monospace';
      const tw=ctx.measureText(txt).width+14;tag(ctx,txt,.52*w-tw/2,.5*h,C.lav);
    }
  }

  function dVol(t){
    panelBg(ctx,w,h);
    const padL=48,padR=14,padT=16,padB=28,gw=w-padL-padR,gh=h-padT-padB,ymin=4,ymax=16;
    const X=x=>padL+x/100*gw,Y=v=>padT+(1-(v-ymin)/(ymax-ymin))*gh;
    ctx.font='10px "JetBrains Mono",monospace';ctx.textBaseline='middle';ctx.textAlign='left';
    ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.fillStyle='rgba(238,242,244,.55)';
    for(let v=6;v<=14;v+=2){ctx.beginPath();ctx.moveTo(padL,Y(v));ctx.lineTo(w-padR,Y(v));ctx.stroke();ctx.fillText(v+' m',6,Y(v))}
    ctx.textBaseline='alphabetic';
    for(let x=0;x<=100;x+=20)ctx.fillText(x+' m',X(x)-10,h-9);
    const rev=MOTION.on?ease(clamp(t/1400,0,1)):1;
    ctx.save();ctx.beginPath();ctx.rect(padL,0,gw*rev+1,h);ctx.clip();
    const cutP=new Path2D(),fillP=new Path2D(),dx=.5;
    for(let x=0;x<100;x+=dx){
      const y1=prof(x),y2=prof(x+dx),q=((y1+y2)/2)>vol.P?cutP:fillP;
      q.moveTo(X(x),Y(y1));q.lineTo(X(x+dx),Y(y2));q.lineTo(X(x+dx),Y(vol.P));q.lineTo(X(x),Y(vol.P));q.closePath();
    }
    ctx.fillStyle=rgba(C.rose,.42);ctx.fill(cutP);ctx.fillStyle=rgba(C.mint,.4);ctx.fill(fillP);
    ctx.strokeStyle=rgba(C.peach,1);ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.beginPath();
    for(let x=0;x<=100;x+=1){if(x)ctx.lineTo(X(x),Y(prof(x)));else ctx.moveTo(X(x),Y(prof(x)))}
    ctx.stroke();ctx.restore();
    ctx.save();ctx.setLineDash([7,5]);ctx.strokeStyle=rgba(C.lav,.95);ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(padL,Y(vol.P));ctx.lineTo(w-padR,Y(vol.P));ctx.stroke();ctx.restore();
    tag(ctx,'Cota de proyecto '+fmt(vol.P,1)+' m',padL+8,clamp(Y(vol.P)-14,14,h-padB-8),C.lav);
    tag(ctx,'Terreno natural',w-padR-118,padT+10,C.peach);
  }

  function dRep(t){
    panelBg(ctx,w,h);
    const I=[.09,.5],cx=[.34,.5,.66,.82],cy=[.2,.5,.8],Tg=[];
    cy.forEach((y,r)=>{const row=cx.map(x=>[x,y]);if(r%2)row.reverse();row.forEach(p=>Tg.push(p))});
    const n=Tg.length,leg=1150,total=n*leg+1600,tt=t%total,finished=tt>=n*leg;
    const idx=Math.min(n-1,Math.floor(tt/leg)),local=finished?1:(tt-idx*leg)/leg,mp=ease(clamp(local/.72,0,1));
    const done=finished?n:idx+(local>.72?1:0);
    const prev=idx===0?I:Tg[idx-1],cur=Tg[idx],S=.14;
    const px=lerp(prev[0],cur[0],mp)*w,py=lerp(prev[1],cur[1],mp)*h;
    const ix=I[0]*w,iy=I[1]*h;
    if(!finished){
      ctx.save();ctx.setLineDash([5,6]);ctx.strokeStyle=rgba(C.lav,.55);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(cur[0]*w,cur[1]*h);ctx.stroke();ctx.restore();
    }
    ctx.font='500 10px "JetBrains Mono",monospace';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    Tg.forEach((p,i)=>{
      const x=p[0]*w,y=p[1]*h;ctx.lineWidth=1.5;
      if(i<done){ctx.fillStyle=rgba(C.mint,.95);ctx.beginPath();ctx.arc(x,y,6,0,6.283);ctx.fill();ctx.strokeStyle=rgba(C.mint,.35);ctx.beginPath();ctx.arc(x,y,12,0,6.283);ctx.stroke()}
      else{ctx.strokeStyle='rgba(238,242,244,.35)';ctx.beginPath();ctx.arc(x,y,6,0,6.283);ctx.stroke()}
      ctx.fillStyle='rgba(238,242,244,.55)';ctx.fillText('R'+(i+1),x+10,y-9);
    });
    ctx.fillStyle=rgba(C.peach,1);ctx.beginPath();ctx.moveTo(ix,iy-11);ctx.lineTo(ix+10,iy+8);ctx.lineTo(ix-10,iy+8);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(238,242,244,.6)';ctx.fillText('EST',ix-10,iy+22);
    if(!finished){
      ctx.strokeStyle='#EEF2F4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-18);ctx.stroke();
      ctx.fillStyle=rgba(C.rose,1);ctx.beginPath();ctx.arc(px,py-20,4,0,6.283);ctx.fill();
      const dE=(cur[0]-I[0])*w*S,dN=-(cur[1]-I[1])*h*S,d=Math.hypot(dE,dN),az=(Math.atan2(dE,dN)*180/Math.PI+360)%360;
      tag(ctx,'R'+(idx+1)+' · '+fmt(d,3)+' m · Az '+fmt(az,0)+'°',clamp((ix+cur[0]*w)/2-50,6,w-190),clamp((iy+cur[1]*h)/2-16,14,h-14),C.lav);
      if(local>.72){const e=[4,9,6,11,5,8,3,10,7,6,9,4][idx]/1000;tag(ctx,'Δ '+fmt(e,3)+' m',clamp(cur[0]*w+14,4,w-80),clamp(cur[1]*h+16,14,h-14),C.mint)}
    }else{
      tag(ctx,'12 de 12 puntos replanteados',w/2-90,h-18,C.mint);
    }
  }

  function dDro(t){
    panelBg(ctx,w,h);
    const f=TERR.dro,gk='dro'+w+'x'+h;
    if(cache.k2!==gk){cache.k2=gk;cache.g2=buildGrid(f,w,h,Math.max(9,Math.round(w/64)))}
    drawContours(ctx,cache.g2,levelsFor(f,12),C.lav,C.peach,.2,.42,1);
    const L=5,x0=.14,x1=.86,y0=.2,y1=.8,path=[];
    for(let k=0;k<L;k++){const y=lerp(y0,y1,k/(L-1));if(k%2){path.push([x1,y],[x0,y])}else{path.push([x0,y],[x1,y])}}
    const pp=path.map(p=>[p[0]*w,p[1]*h]),cum=[0];
    for(let i=1;i<pp.length;i++)cum.push(cum[i-1]+Math.hypot(pp[i][0]-pp[i-1][0],pp[i][1]-pp[i-1][1]));
    const Lt=cum[cum.length-1],prog=clamp((t%12000)/10500,0,1),dist=prog*Lt;
    const at=d=>{let i=1;while(i<cum.length-1&&cum[i]<d)i++;const s=clamp((d-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),0,1);return[lerp(pp[i-1][0],pp[i][0],s),lerp(pp[i-1][1],pp[i][1],s)]};
    ctx.save();ctx.setLineDash([4,6]);ctx.strokeStyle='rgba(238,242,244,.3)';ctx.lineWidth=1;ctx.strokeRect(x0*w-12,y0*h-12,(x1-x0)*w+24,(y1-y0)*h+24);ctx.restore();
    ctx.save();ctx.setLineDash([3,6]);ctx.strokeStyle='rgba(238,242,244,.2)';ctx.beginPath();pp.forEach((p,i)=>{if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1])});ctx.stroke();ctx.restore();
    const NF2=26,fw=w*.085,fh=fw*.7;
    for(let k=0;k<=NF2;k++){const d=k/NF2*Lt;if(d>dist)break;const p=at(d);ctx.fillStyle=rgba(C.mint,.07);ctx.fillRect(p[0]-fw/2,p[1]-fh/2,fw,fh);ctx.strokeStyle=rgba(C.mint,.26);ctx.lineWidth=1;ctx.strokeRect(p[0]-fw/2,p[1]-fh/2,fw,fh)}
    const cur=at(dist);
    ctx.strokeStyle=rgba(C.peach,.95);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);
    for(let i=1;i<pp.length&&cum[i]<=dist;i++)ctx.lineTo(pp[i][0],pp[i][1]);
    ctx.lineTo(cur[0],cur[1]);ctx.stroke();
    ctx.fillStyle=rgba(C.peach,1);ctx.beginPath();ctx.arc(cur[0],cur[1],5,0,6.283);ctx.fill();
    const ang=t*.03;ctx.strokeStyle='rgba(238,242,244,.85)';ctx.lineWidth=1.6;
    [[-9,-9],[9,-9],[-9,9],[9,9]].forEach(o=>{const rx=cur[0]+o[0],ry=cur[1]+o[1];ctx.beginPath();ctx.moveTo(rx-Math.cos(ang)*5,ry-Math.sin(ang)*5);ctx.lineTo(rx+Math.cos(ang)*5,ry+Math.sin(ang)*5);ctx.stroke()});
    tag(ctx,'Cobertura '+Math.round(prog*100)+'%',12,h-18,C.mint);
  }

  const DRAW={lev:dLev,lin:dLin,vol:dVol,rep:dRep,dro:dDro};
  function render(now){
    if(!ctx)return;
    const key=SERVICES[idx].key,t=MOTION.on?Math.max(0,now-t0):STATIC_T[key];   /* el tiempo del cuadro puede ser un poco anterior a t0 */
    ctx.textAlign='left';DRAW[key](t);dirty=false;
  }
  function resize(){const s=sizeCanvas(cv);ctx=s.ctx;w=s.w;h=s.h;cache={};dirty=true;render(performance.now())}
  function tick(now){if(!MOTION.on&&!dirty)return;render(now)}

  function updVol(){
    const r=volumes(vol.P,vol.W),b=r.cut-r.fill;
    $('#vCut').textContent=fmt(r.cut,0);$('#vFill').textContent=fmt(r.fill,0);
    $('#vBal').textContent=Math.abs(b)<1?'Balanceado':(b>0?'Sobran '+fmt(b,0)+' m³':'Faltan '+fmt(-b,0)+' m³');
    $('#oP').textContent=fmt(vol.P,1)+' m';$('#oW').textContent=vol.W+' m';
  }
  function buildExtra(){
    if(SERVICES[idx].key!=='vol'){extra.innerHTML='';return}
    extra.innerHTML='<div class="vol-ctl">'+
      '<label class="rng"><span>Cota de proyecto</span><output id="oP"></output><input type="range" id="sP" min="6" max="14" step="0.1" value="'+vol.P+'"></label>'+
      '<label class="rng"><span>Ancho de la sección</span><output id="oW"></output><input type="range" id="sW" min="5" max="40" step="1" value="'+vol.W+'"></label>'+
      '</div><div class="vol-res"><span class="cut"><i></i>Corte <b id="vCut">0</b> m³</span><span class="fill"><i></i>Lleno <b id="vFill">0</b> m³</span><span id="vBal"></span><button class="lnk" id="vEq" type="button">Equilibrar</button></div>';
    $$('input[type=range]',extra).forEach(paintRange);
    $('#sP').addEventListener('input',e=>{vol.P=+e.target.value;updVol();dirty=true});
    $('#sW').addEventListener('input',e=>{vol.W=+e.target.value;updVol();dirty=true});
    $('#vEq').addEventListener('click',()=>{
      let lo=4,hi=16;for(let i=0;i<40;i++){const mid=(lo+hi)/2,r=volumes(mid,1);if(r.cut>r.fill)lo=mid;else hi=mid}
      vol.P=Math.round((lo+hi)/2*10)/10;$('#sP').value=vol.P;paintRange($('#sP'));updVol();dirty=true;toast('Cota equilibrada: '+fmt(vol.P,1)+' m');
    });
    updVol();
  }
  function select(i,focus){
    idx=i;const s=SERVICES[i];
    $$('.svc-item',list).forEach((b,j)=>{b.setAttribute('aria-selected',String(j===i));b.tabIndex=j===i?0:-1});
    $('#svcTitle').textContent=s.name;$('#svcDesc').textContent=s.desc;
    $('#svcEq').textContent=s.eq;
    $('#svcDeliver').innerHTML=s.out.map(o=>'<li>'+o+'</li>').join('');
    buildExtra();t0=performance.now();dirty=true;cache={};render(t0);
    if(focus)$$('.svc-item',list)[i].focus();
  }
  SERVICES.forEach((s,i)=>{
    const b=document.createElement('button');
    b.type='button';b.className='svc-item';b.setAttribute('role','tab');
    b.innerHTML='<span class="si">'+svg(s.key)+'</span><h3>'+s.name+'</h3><p>'+s.short+'</p>';
    b.addEventListener('click',()=>select(i));
    list.appendChild(b);
  });
  list.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();select((idx+1)%SERVICES.length,true)}
    if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();select((idx+SERVICES.length-1)%SERVICES.length,true)}
  });
  $('#svcReplay').addEventListener('click',()=>{t0=performance.now();dirty=true;render(t0)});
  $('#svcQuote').addEventListener('click',()=>prefillQuote({servicio:SERVICES[idx].name}));
  select(0);
  return{resize,tick,select,redraw:()=>{cache={};dirty=true;render(performance.now())},get visible(){return vis},set visible(v){vis=v}};
})();

/* =========================================================
   CALCULADORA DE LOTE
   ========================================================= */
const calc=(()=>{
  const cv=$('#calcCanvas'),body=$('#vtx'),sidesEl=$('#sidesBody'),warn=$('#calcWarn');
  /* Lote de ejemplo en coordenadas locales (no corresponde a ningún lugar real) */
  const EXAMPLE=[[1000.00,1000.00],[1048.40,1008.20],[1052.90,1052.75],[1011.10,1061.30],[998.60,1040.40]];
  let ctx,w=0,h=0,pts=EXAMPLE.map(p=>({e:p[0],n:p[1]})),view=null,drag=-1,hover=-1,last=null;
  const num=(el,v,d)=>{
    const from=el._v||0;el._v=v;
    if(!MOTION.on){el.textContent=fmt(v,d);return}
    const t0=performance.now();cancelAnimationFrame(el._r);
    (function s(n){const p=clamp((n-t0)/350,0,1),q=1-Math.pow(1-p,3);el.textContent=fmt(lerp(from,v,q),d);if(p<1)el._r=requestAnimationFrame(s)})(t0);
  };
  const dms=deg=>{let d=Math.floor(deg),mm=(deg-d)*60,m=Math.floor(mm),s=(mm-m)*60;if(s>=59.95){s=0;m++}if(m>=60){m=0;d++}return d+'°'+String(m).padStart(2,'0')+"'"+fmt(s,1).padStart(4,'0')+'"'};
  const valid=()=>pts.length>=3&&pts.every(p=>isFinite(p.e)&&isFinite(p.n));

  function renderRows(){
    body.innerHTML='';
    pts.forEach((p,i)=>{
      const r=document.createElement('div');r.className='vrow';
      r.innerHTML='<span class="vnum">V'+(i+1)+'</span>'+
        '<input type="number" step="any" inputmode="decimal" aria-label="Este del vértice '+(i+1)+'" value="'+(isFinite(p.e)?p.e:'')+'" data-i="'+i+'" data-k="e">'+
        '<input type="number" step="any" inputmode="decimal" aria-label="Norte del vértice '+(i+1)+'" value="'+(isFinite(p.n)?p.n:'')+'" data-i="'+i+'" data-k="n">'+
        '<button type="button" class="x" aria-label="Quitar vértice '+(i+1)+'" data-del="'+i+'">×</button>';
      body.appendChild(r);
    });
  }
  function syncRow(i){const r=$$('.vrow',body)[i];if(!r)return;const ins=$$('input',r);ins[0].value=pts[i].e;ins[1].value=pts[i].n}

  function segInter(a,b,c,d){
    const o=(p,q,r)=>(q.e-p.e)*(r.n-p.n)-(q.n-p.n)*(r.e-p.e);
    const d1=o(a,b,c),d2=o(a,b,d),d3=o(c,d,a),d4=o(c,d,b);
    return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
  }
  function crosses(){
    const n=pts.length;if(n<4)return false;
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      if(j===i+1||(i===0&&j===n-1))continue;
      if(segInter(pts[i],pts[(i+1)%n],pts[j],pts[(j+1)%n]))return true;
    }
    return false;
  }
  function compute(){
    if(!valid()){last=null;return null}
    const n=pts.length,e0=pts[0].e,n0=pts[0].n;let a2=0,per=0;const sides=[];
    for(let i=0;i<n;i++){
      const j=(i+1)%n,x1=pts[i].e-e0,y1=pts[i].n-n0,x2=pts[j].e-e0,y2=pts[j].n-n0;
      a2+=x1*y2-x2*y1;
      const dE=pts[j].e-pts[i].e,dN=pts[j].n-pts[i].n,d=Math.hypot(dE,dN),az=(Math.atan2(dE,dN)*180/Math.PI+360)%360;
      per+=d;sides.push({i,j,d,az});
    }
    last={area:Math.abs(a2)/2,per,sides,crossing:crosses()};return last;
  }
  function update(){
    const r=compute();draw();
    const btns=['cCopy','cCsv','cQuote'].map(id=>$('#'+id));
    if(!r){
      ['rM2','rHa','rFan','rPer'].forEach(id=>{const el=$('#'+id);el._v=0;el.textContent='0'});
      sidesEl.innerHTML='';btns.forEach(b=>b.disabled=true);
      warn.textContent=pts.length<3?'Necesitas al menos 3 vértices con coordenadas válidas.':'Revisa que todas las coordenadas sean números.';
      return;
    }
    btns.forEach(b=>b.disabled=false);
    num($('#rM2'),r.area,2);num($('#rHa'),r.area/10000,4);num($('#rFan'),r.area/6400,4);num($('#rPer'),r.per,2);
    warn.textContent=r.crossing?'Atención: los lados del polígono se cruzan. Revisa el orden de los vértices.':'';
    sidesEl.innerHTML=r.sides.map(s=>'<tr><td>V'+(s.i+1)+'–V'+(s.j+1)+'</td><td>'+fmt(s.d,2)+'</td><td>'+dms(s.az)+'</td></tr>').join('');
  }

  /* Dibujo del plano */
  function mkView(){
    const v=pts.filter(p=>isFinite(p.e)&&isFinite(p.n));if(!v.length)return null;
    let minE=Infinity,maxE=-Infinity,minN=Infinity,maxN=-Infinity;
    v.forEach(p=>{minE=Math.min(minE,p.e);maxE=Math.max(maxE,p.e);minN=Math.min(minN,p.n);maxN=Math.max(maxN,p.n)});
    const sE=Math.max(maxE-minE,1),sN=Math.max(maxN-minN,1),pad=48,s=Math.min((w-2*pad)/sE,(h-2*pad)/sN);
    return{minE,minN,s,dx:(w-sE*s)/2,dy:(h-sN*s)/2};
  }
  const toXY=(V,e,n)=>[(e-V.minE)*V.s+V.dx,h-((n-V.minN)*V.s+V.dy)];
  const inv=(V,x,y)=>[(x-V.dx)/V.s+V.minE,(h-y-V.dy)/V.s+V.minN];
  const nice=x=>{const p=Math.pow(10,Math.floor(Math.log10(x))),f=x/p;return(f<1.5?1:f<3.5?2:f<7.5?5:10)*p};
  function draw(){
    if(!ctx)return;
    panelBg(ctx,w,h);
    if(drag<0)view=mkView();
    const V=view;if(!V)return;
    const gs=nice(60/V.s),e0=inv(V,0,h)[0],e1=inv(V,w,h)[0],n0=inv(V,0,h)[1],n1=inv(V,0,0)[1];
    ctx.strokeStyle='rgba(141,179,214,.12)';ctx.lineWidth=1;ctx.beginPath();
    for(let e=Math.ceil(e0/gs)*gs;e<=e1;e+=gs){const x=toXY(V,e,0)[0];ctx.moveTo(x,0);ctx.lineTo(x,h)}
    for(let n=Math.ceil(n0/gs)*gs;n<=n1;n+=gs){const y=toXY(V,0,n)[1];ctx.moveTo(0,y);ctx.lineTo(w,y)}
    ctx.stroke();
    const ok=pts.filter(p=>isFinite(p.e)&&isFinite(p.n)),P=ok.map(p=>toXY(V,p.e,p.n)),bad=last&&last.crossing;
    if(P.length>=2){
      ctx.beginPath();P.forEach((p,i)=>{if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1])});if(P.length>=3)ctx.closePath();
      if(P.length>=3){ctx.fillStyle=rgba(bad?C.rose:C.lav,.17);ctx.fill()}
      ctx.strokeStyle=rgba(bad?C.rose:C.peach,.98);ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.stroke();
      const n=P.length;
      for(let i=0;i<n;i++){
        const A=P[i],B=P[(i+1)%n];if(n===2&&i===1)break;
        const len=Math.hypot(B[0]-A[0],B[1]-A[1]);if(len<70)continue;
        const d=Math.hypot(ok[(i+1)%n].e-ok[i].e,ok[(i+1)%n].n-ok[i].n);
        ctx.font='500 11px "JetBrains Mono",monospace';const lab=fmt(d,2),tw=ctx.measureText(lab).width+14;
        tag(ctx,lab,(A[0]+B[0])/2-tw/2,(A[1]+B[1])/2,C.peach);
      }
    }
    const cx=P.reduce((a,p)=>a+p[0],0)/(P.length||1),cy=P.reduce((a,p)=>a+p[1],0)/(P.length||1);
    P.forEach((p,i)=>{
      const act=i===hover||i===drag,r=act?8:5;
      ctx.fillStyle=act?'#EEF2F4':'#111C25';ctx.strokeStyle=rgba(C.mint,1);ctx.lineWidth=2;ctx.beginPath();ctx.arc(p[0],p[1],r,0,6.283);ctx.fill();ctx.stroke();
      const vx=p[0]-cx,vy=p[1]-cy,l=Math.hypot(vx,vy)||1;
      ctx.fillStyle='rgba(238,242,244,.85)';ctx.font='500 11px "JetBrains Mono",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('V'+(i+1),p[0]+vx/l*20,p[1]+vy/l*20);ctx.textAlign='left';
    });
    /* escala gráfica */
    const L=nice(80/V.s),px=L*V.s;ctx.strokeStyle='rgba(238,242,244,.8)';ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(16,h-18);ctx.lineTo(16+px,h-18);ctx.moveTo(16,h-23);ctx.lineTo(16,h-13);ctx.moveTo(16+px,h-23);ctx.lineTo(16+px,h-13);ctx.stroke();
    ctx.fillStyle='rgba(238,242,244,.8)';ctx.font='500 11px "JetBrains Mono",monospace';ctx.textBaseline='alphabetic';ctx.fillText(fmt(L,0)+' m',16,h-28);
    /* norte */
    ctx.strokeStyle='rgba(238,242,244,.85)';ctx.fillStyle='rgba(238,242,244,.85)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(w-26,52);ctx.lineTo(w-26,22);ctx.stroke();ctx.beginPath();ctx.moveTo(w-26,16);ctx.lineTo(w-31,26);ctx.lineTo(w-21,26);ctx.closePath();ctx.fill();
    ctx.textAlign='center';ctx.fillText('N',w-26,66);ctx.textAlign='left';
  }
  function resize(){const s=sizeCanvas(cv);ctx=s.ctx;w=s.w;h=s.h;draw()}
  function pos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  function nearest(x,y){
    if(!view)return-1;let best=-1,bd=18;
    pts.forEach((p,i)=>{if(!isFinite(p.e)||!isFinite(p.n))return;const q=toXY(view,p.e,p.n),d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=i}});
    return best;
  }
  cv.addEventListener('pointerdown',e=>{
    const p=pos(e),i=nearest(p.x,p.y);
    if(i>=0){drag=i;view=mkView();try{cv.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault();cv.style.cursor='grabbing'}
  });
  cv.addEventListener('pointermove',e=>{
    const p=pos(e);
    if(drag>=0&&view){
      const q=inv(view,p.x,p.y);pts[drag].e=Math.round(q[0]*100)/100;pts[drag].n=Math.round(q[1]*100)/100;syncRow(drag);update();
    }else{
      const i=nearest(p.x,p.y);if(i!==hover){hover=i;cv.style.cursor=i>=0?'grab':'default';draw()}
    }
  });
  const end=()=>{if(drag>=0){drag=-1;cv.style.cursor='default';update()}};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  cv.addEventListener('pointerleave',()=>{if(drag<0&&hover!==-1){hover=-1;draw()}});

  body.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.k){pts[+t.dataset.i][t.dataset.k]=t.value===''?NaN:parseFloat(t.value);update()}});
  body.addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b){pts.splice(+b.dataset.del,1);renderRows();update()}});
  body.addEventListener('focusin',e=>{const t=e.target;if(t.dataset&&t.dataset.i){hover=+t.dataset.i;draw()}});
  body.addEventListener('focusout',()=>{hover=-1;draw()});

  $('#vAdd').addEventListener('click',()=>{
    const l=pts[pts.length-1];
    pts.push(l&&isFinite(l.e)?{e:Math.round((l.e+10)*100)/100,n:Math.round((l.n+10)*100)/100}:{e:1000,n:1000});
    renderRows();update();
  });
  $('#vExample').addEventListener('click',()=>{pts=EXAMPLE.map(p=>({e:p[0],n:p[1]}));renderRows();update();toast('Ejemplo cargado')});
  $('#vClear').addEventListener('click',()=>{pts=[];renderRows();update()});
  $('#vImport').addEventListener('click',()=>{
    const out=[];
    $('#vPaste').value.split(/\r?\n/).forEach(line=>{
      const toks=line.trim().split(/[\s;,\t]+/).filter(Boolean),isN=t=>/^-?\d+(\.\d+)?$/.test(t);
      if(toks.length&&!isN(toks[0]))toks.shift();
      const ns=toks.filter(isN).map(Number);if(ns.length>=2)out.push({e:ns[0],n:ns[1]});
    });
    if(out.length>2&&out[0].e===out[out.length-1].e&&out[0].n===out[out.length-1].n)out.pop();
    if(out.length<3){toast('No encontré al menos 3 vértices. Usa: Este Norte');return}
    pts=out;renderRows();update();toast(out.length+' vértices importados');
  });
  $('#cCopy').addEventListener('click',async()=>{
    if(!last)return;
    const t=['Área: '+fmt(last.area,2)+' m² ('+fmt(last.area/10000,4)+' ha · '+fmt(last.area/6400,4)+' fanegadas)','Perímetro: '+fmt(last.per,2)+' m','Vértices: '+pts.length,'']
      .concat(last.sides.map(s=>'V'+(s.i+1)+'–V'+(s.j+1)+': '+fmt(s.d,2)+' m · Az '+dms(s.az))).join('\n');
    toast(await copyText(t)?'Resultados copiados':'No se pudo copiar');
  });
  $('#cCsv').addEventListener('click',()=>{
    if(!last)return;
    const rows=['vertice,este,norte,distancia_al_siguiente_m,azimut_grados'].concat(pts.map((p,i)=>'V'+(i+1)+','+p.e+','+p.n+','+last.sides[i].d.toFixed(3)+','+last.sides[i].az.toFixed(4)));
    rows.push('','area_m2,'+last.area.toFixed(3),'perimetro_m,'+last.per.toFixed(3));
    const url=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
    a.href=url;a.download='lote.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('CSV descargado');
  });
  $('#cQuote').addEventListener('click',()=>{
    if(!last)return;
    prefillQuote({servicio:SERVICES[0].name,area:String(Math.round(last.area)),unidad:'m²',detalle:'Calculé en la web un lote de '+pts.length+' vértices: '+fmt(last.area,2)+' m² y perímetro de '+fmt(last.per,2)+' m.'});
  });
  renderRows();
  return{resize,redraw:draw,update};
})();

/* =========================================================
   COMPARADOR, EQUIPOS Y PROCESO
   ========================================================= */
const compare=(()=>{
  /* Los puntos medidos (derecha) y el plano de curvas (izquierda) salen de la misma medición:
     las curvas se calculan interpolando los puntos, así que con más puntos el plano tiene
     más detalle y las curvas pueden ir más seguidas. */
  const bot=$('#cmpBottom'),top=$('#cmpTop'),rng=$('#cmpRange'),bar=$('#cmpBar'),dens=$('#cmpDens'),info=$('#cmpInfo'),f=makeTerrain(21);
  const RELIEVE=12;                       // metros de desnivel del terreno de ejemplo
  const PASOS=[3,2,1.5,1,.75,.5];         // curvas cada X metros, de pocos a muchos puntos
  function medir(w,h){
    const t=clamp(+dens.value/100,0,1);
    const nx=Math.round(lerp(4,34,Math.pow(t,1.15))),ny=Math.max(3,Math.round(nx*h/w));
    const pts=[],z=new Float32Array(nx*ny);
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      // posición con un pequeño desorden, como las mediciones reales en campo
      const u=(i+.5+Math.sin(i*12.3+j*3.1)*.18)/nx,v=(j+.5+Math.cos(i*4.7+j*9.1)*.18)/ny,val=f(u,v);
      z[j*nx+i]=val;pts.push([u,v,val]);
    }
    const paso=PASOS[Math.min(PASOS.length-1,Math.floor(t*PASOS.length))];
    return{t,nx,ny,pts,z,paso};
  }
  /* Superficie suave (Catmull-Rom) que pasa por los puntos medidos */
  function superficie(M){
    const{nx,ny,z}=M,at=(i,j)=>z[clamp(j,0,ny-1)*nx+clamp(i,0,nx-1)];
    const cr=(p0,p1,p2,p3,t)=>.5*(2*p1+(p2-p0)*t+(2*p0-5*p1+4*p2-p3)*t*t+(3*p1-p0-3*p2+p3)*t*t*t);
    return(u,v)=>{
      const gx=u*nx-.5,gy=v*ny-.5,i=Math.floor(gx),j=Math.floor(gy),fx=gx-i,fy=gy-j,r=[];
      for(let k=-1;k<=2;k++)r.push(cr(at(i-1,j+k),at(i,j+k),at(i+1,j+k),at(i+2,j+k),fx));
      return cr(r[0],r[1],r[2],r[3],fy);
    };
  }
  function draw(){
    const sb=sizeCanvas(bot),st=sizeCanvas(top),w=sb.w,h=sb.h,M=medir(w,h),d=f.hi-f.lo;
    const color=v=>mix(C.lav,C.peach,clamp((v-f.lo)/d,0,1)),rad=lerp(3.4,1.7,M.t);
    // Derecha: los puntos medidos, de color según su altura
    panelBg(sb.ctx,w,h);
    M.pts.forEach(p=>{sb.ctx.fillStyle=rgba(color(p[2]),.95);sb.ctx.beginPath();sb.ctx.arc(p[0]*w,p[1]*h,rad,0,6.283);sb.ctx.fill()});
    // Izquierda: el plano de curvas calculado con esos puntos
    const ctx=st.ctx,S=superficie(M),pz=M.paso/RELIEVE*d,levels=[];
    panelBg(ctx,st.w,st.h);
    for(let L=Math.ceil(f.lo/pz)*pz;L<=f.hi;L+=pz)levels.push(L);
    drawContours(ctx,buildGrid(S,st.w,st.h,Math.max(5,Math.round(st.w/90))),levels,C.peach,C.lav,.5,.9,1.15);
    M.pts.forEach(p=>{ctx.fillStyle='rgba(238,242,244,.32)';ctx.beginPath();ctx.arc(p[0]*w,p[1]*h,1.2,0,6.283);ctx.fill()});
    const dec=M.paso%1===0?0:(M.paso*10)%1===0?1:2;
    if(info)info.textContent=fmt(M.pts.length,0)+' puntos · curvas cada '+fmt(M.paso,dec)+' m';
  }
  function upd(){top.style.clipPath='inset(0 '+(100-rng.value)+'% 0 0)';bar.style.left=rng.value+'%'}
  rng.addEventListener('input',upd);
  dens.addEventListener('input',draw);
  upd();
  return{draw};
})();

(()=>{
  const eqs=$$('.eq');
  eqs.forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';eqs.forEach(x=>x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',String(!o))}));
  const steps=$$('.step');
  steps.forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';steps.forEach(x=>x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',String(!o))}));
})();

/* =========================================================
   TRABAJOS: tarjetas con paisajes animados + detalle
   ========================================================= */
const proj=(()=>{
  const grid=$('#projGrid'),dlg=$('#pdlg');let cur=null;
  grid.innerHTML='';
  PROJECTS.forEach(p=>{
    const b=document.createElement('button');
    b.type='button';b.className='pcard glass';b.dataset.t=p.tipo;b.dataset.id=p.id;
    b.innerHTML='<canvas class="cv" aria-hidden="true"></canvas><span class="pb"><small>'+p.tag+'</small><h3>'+p.title+'</h3><span class="pt">'+p.text+'</span></span>';
    b.addEventListener('click',()=>open(p.id));
    grid.appendChild(b);
    Scape.mount($('canvas',b),p.scene,{pal:p.pal,seed:p.seed,dpr:1.25,fps:24});
  });
  const pd=Scape.mount($('#pdCanvas'),'finca',{pal:'day',dpr:1.5});
  function open(id){
    const p=PROJECTS.find(x=>x.id===id);if(!p)return;
    cur=p;$('#pdTag').textContent=p.tag+' · ilustración de referencia';$('#pdTitle').textContent=p.title;$('#pdText').textContent=p.text;
    $('#pdList').innerHTML=p.list.map(x=>'<li>'+x+'</li>').join('');
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
    requestAnimationFrame(()=>Scape.setScene(pd,p.scene,{pal:p.pal,seed:p.seed}));
  }
  function close(){if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open')}
  $('#pdClose').addEventListener('click',close);
  dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
  $('#pdQuote').addEventListener('click',()=>{const p=cur;close();prefillQuote({servicio:p&&p.svc,detalle:'Quiero algo similar a: '+(p?p.title:'')})});
  const chips=$$('#projChips .chip');
  chips.forEach(c=>{
    const k=c.dataset.f,n=k==='todos'?PROJECTS.length:PROJECTS.filter(p=>p.tipo===k).length;
    c.insertAdjacentHTML('beforeend','<span class="n">'+n+'</span>');
    c.addEventListener('click',()=>filter(k));
  });
  function filter(k){
    chips.forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.f===k)));
    $$('.pcard',grid).forEach(b=>{const show=k==='todos'||b.dataset.t===k;b.classList.toggle('hide',!show);if(show){b.style.animation='none';void b.offsetWidth;b.style.animation=''}});
  }
  /* Copia el cuadro actual de una tarjeta en un canvas pequeño (miniaturas de los menús) */
  function thumb(cv,id){
    const src=$('.pcard[data-id="'+id+'"] canvas',grid);if(!src||!src.width)return;
    const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2),W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
    cv.getContext('2d').drawImage(src,0,0,src.width,src.height,0,0,W,H);
  }
  return{open,filter,thumb};
})();

/* Paisajes del inicio, del panorama, de equipos y del pie de página */
const scLight=()=>root.dataset.theme==='light';
Scape.mount($('#heroScape'),'llano',{seed:3,hz:(w,h)=>w<760?.64:.7,amp:.8,palmS:.58,sunX:.8,clouds:4,birds:4,riverX:.46,palmX:[.86,.93,.8,.98],cows:[[.3,.93,1],[.35,.955,-1]],pal:()=>scLight()?'day':'dusk',dpr:1,fps:24});
Scape.mount($('#panoCanvas'),'llano',{seed:7,hz:.56,amp:.62,sunX:.82,riverX:.5,clouds:5,birds:5,palmX:[.08,.15,.93,.87],cows:[[.3,.9,1],[.36,.93,-1],[.7,.9,1]],pal:()=>scLight()?'dawn':'dusk',dpr:1.25,fps:30});
Scape.mount($('#nightCanvas'),'noche',{seed:5,pal:()=>scLight()?'dawn':'night',dpr:1,fps:24});
(()=>{
  const eqs=$$('.eq'),M=[['replanteo','dawn'],['finca','day'],['dron','day']];
  const inst=Scape.mount($('#eqScape'),M[0][0],{pal:M[0][1],seed:21,dpr:1.25,fps:24});
  eqs.forEach((b,k)=>b.addEventListener('click',()=>{if(M[k]&&b.getAttribute('aria-expanded')==='true')Scape.setScene(inst,M[k][0],{pal:M[k][1]})}));
})();

/* =========================================================
   MENÚS
   Escritorio: indicador que sigue al cursor y desplegables
   de Servicios y Trabajos. Móvil: panel con descripciones,
   submenús, ajustes y contacto.
   ========================================================= */
(()=>{
  const nav=$('.nav'),links=$('.links'),pill=$('.pill'),lks=$$('.lk',links);
  const mnav=$('#mnav'),mbtn=$('.menu-btn'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  let active=null,hovering=null,openDD=null,lastPT='';

  /* Contenido de los desplegables a partir de los datos */
  $('#megaServ').innerHTML=SERVICES.map((s,i)=>'<button class="mi" type="button" data-svc="'+i+'"><span class="si">'+svg(s.key)+'</span><b>'+s.name+'</b><small>'+s.short+'</small></button>').join('');
  $('#megaTrab').innerHTML=CATS.map(c=>{
    const ps=PROJECTS.filter(p=>p.tipo===c.k);
    return '<div class="mcol"><button class="mcat" type="button" data-cat="'+c.k+'">'+c.name+'<span>'+ps.length+' tipos</span></button>'+
      ps.map(p=>'<button class="mw" type="button" data-proj="'+p.id+'"><canvas aria-hidden="true"></canvas><b>'+p.title+'</b><small>'+p.tag+'</small></button>').join('')+'</div>';
  }).join('');
  $('#mSubServ').innerHTML=SERVICES.map((s,i)=>'<li><button type="button" data-svc="'+i+'"><span class="si">'+svg(s.key)+'</span>'+s.name+'</button></li>').join('');
  $('#mSubTrab').innerHTML=PROJECTS.map(p=>'<li><button type="button" data-proj="'+p.id+'"><canvas aria-hidden="true"></canvas>'+p.title+'</button></li>').join('');
  const thumbs=box=>$$('[data-proj] canvas',box).forEach(cv=>proj.thumb(cv,cv.parentElement.dataset.proj));

  /* Acciones de los elementos de menú (escritorio y móvil) */
  function act(e){
    const s=e.target.closest('[data-svc]'),p=e.target.closest('[data-proj]'),c=e.target.closest('[data-cat]');
    if(!s&&!p&&!c)return;
    closeAll();
    if(s){svc.select(+s.dataset.svc);go('servicios')}
    else if(p)proj.open(p.dataset.proj);
    else{proj.filter(c.dataset.cat);go('trabajos')}
  }
  $('#megaServ').addEventListener('click',act);$('#megaTrab').addEventListener('click',act);
  $('#mSubServ').addEventListener('click',act);$('#mSubTrab').addEventListener('click',act);
  $$('.mega').forEach(m=>m.addEventListener('click',e=>{if(e.target.closest('a'))closeAll()}));

  /* Indicador deslizante */
  function place(el){
    if(!el||!el.offsetParent){pill.style.opacity=0;return}
    const r=el.getBoundingClientRect(),n=nav.getBoundingClientRect();
    pill.style.width=r.width+'px';pill.style.transform='translateX('+(r.left-n.left)+'px)';pill.style.opacity=1;
  }
  links.addEventListener('pointerover',e=>{const l=e.target.closest('.lk');if(l&&l!==hovering){hovering=l;place(l)}});
  links.addEventListener('pointerleave',()=>{hovering=null;place(openDD?$('.lk',openDD):active)});
  links.addEventListener('focusin',e=>{const l=e.target.closest('.lk');if(l)place(l)});
  links.addEventListener('focusout',e=>{if(!links.contains(e.relatedTarget))place(hovering||active)});
  addEventListener('resize',()=>place(hovering||active));

  /* Sección activa según el scroll */
  const ids=['servicios','trabajos','calculadora','campo','proceso','faq'],seen={};
  function setActive(id){
    active=lks.find(l=>l.dataset.sec===id)||null;
    lks.forEach(l=>l.classList.toggle('active',l===active));
    $$('.mrow>a').forEach(a=>a.classList.toggle('active',a.dataset.sec===id));
    if(!hovering&&!openDD)place(active);
  }
  const io=new IntersectionObserver(es=>{es.forEach(e=>{seen[e.target.id]=e.isIntersecting});setActive(ids.find(id=>seen[id])||null)},{rootMargin:'-45% 0px -50% 0px'});
  ids.forEach(id=>{const s=document.getElementById(id);if(s)io.observe(s)});

  /* Desplegables: se abren al pasar el cursor o con clic/toque */
  document.addEventListener('pointerdown',e=>{lastPT=e.pointerType},true);
  document.addEventListener('keydown',()=>{lastPT='key'},true);
  function openD(dd){
    if(openDD&&openDD!==dd)closeD(openDD,true);
    clearTimeout(dd._t);clearTimeout(dd._h);
    const panel=$('.mega',dd);panel.hidden=false;void panel.offsetWidth;
    dd.classList.add('open');$('.lk',dd).setAttribute('aria-expanded','true');openDD=dd;place($('.lk',dd));
    if(dd.dataset.dd==='trab')thumbs(panel);
  }
  function closeD(dd,instant){
    clearTimeout(dd._t);clearTimeout(dd._h);
    dd.classList.remove('open');$('.lk',dd).setAttribute('aria-expanded','false');if(openDD===dd)openDD=null;
    const panel=$('.mega',dd);
    if(instant)panel.hidden=true;else dd._h=setTimeout(()=>{if(!dd.classList.contains('open'))panel.hidden=true},280);
    if(!hovering)place(active);
  }
  $$('.dd').forEach(dd=>{
    const btn=$('.lk',dd);
    btn.addEventListener('click',()=>{
      const isOpen=dd.classList.contains('open');
      if(isOpen&&lastPT==='mouse'&&fine.matches){closeD(dd);go(btn.dataset.sec);return}
      isOpen?closeD(dd):openD(dd);
    });
    dd.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&fine.matches){clearTimeout(dd._t);dd._t=setTimeout(()=>openD(dd),90)}});
    dd.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&fine.matches){clearTimeout(dd._t);dd._t=setTimeout(()=>closeD(dd),220)}});
    dd.addEventListener('focusout',e=>{if(dd.classList.contains('open')&&e.relatedTarget&&!dd.contains(e.relatedTarget))closeD(dd)});
  });
  document.addEventListener('click',e=>{if(openDD&&!openDD.contains(e.target))closeD(openDD)});

  /* Menú móvil */
  function openM(){
    mnav.hidden=false;void mnav.offsetWidth;mnav.classList.add('open');root.classList.add('menu-open');
    mbtn.setAttribute('aria-expanded','true');mbtn.setAttribute('aria-label','Cerrar menú');
  }
  function closeM(focusBtn){
    if(!mnav.classList.contains('open'))return;
    mnav.classList.remove('open');root.classList.remove('menu-open');
    mbtn.setAttribute('aria-expanded','false');mbtn.setAttribute('aria-label','Abrir menú');
    setTimeout(()=>{if(!mnav.classList.contains('open'))mnav.hidden=true},420);
    if(focusBtn)mbtn.focus();
  }
  function closeAll(){if(openDD)closeD(openDD);closeM()}
  mbtn.addEventListener('click',()=>mnav.classList.contains('open')?closeM():openM());
  mnav.addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target.closest('a[href^="#"]'))closeM()});
  $$('.mexp',mnav).forEach(b=>b.addEventListener('click',()=>{
    const o=b.getAttribute('aria-expanded')!=='true',sub=$('#'+b.getAttribute('aria-controls'));
    b.setAttribute('aria-expanded',String(o));sub.hidden=!o;
    if(o&&sub.id==='mSubTrab')thumbs(sub);
  }));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(mnav.classList.contains('open'))closeM(true);
      if(openDD){const b=$('.lk',openDD);closeD(openDD);b.focus()}
    }
    if(e.key==='Tab'&&mnav.classList.contains('open')){
      const f=[mbtn].concat($$('a[href],button',mnav).filter(x=>x.offsetParent!==null));
      const i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
      else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
    }
  });
  matchMedia('(min-width:1241px)').addEventListener('change',e=>{if(e.matches)closeM()});
  $$('.mlist>li',mnav).forEach((li,i)=>li.style.setProperty('--i',i));
})();

/* ---------- Preguntas frecuentes ---------- */
$$('#faqList .q>button').forEach(b=>b.addEventListener('click',()=>{
  const q=b.parentElement,o=!q.classList.contains('open');
  $$('#faqList .q').forEach(x=>{x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false')});
  if(o){q.classList.add('open');b.setAttribute('aria-expanded','true')}
}));

/* =========================================================
   COTIZACIÓN: formulario, vista previa y envío
   ========================================================= */
const form=$('#quoteForm'),fServ=$('#fServicio'),prev=$('#preview'),HAS_MAIL=!!CONFIG.correo;
SERVICES.forEach(s=>fServ.add(new Option(s.name,s.name)));
fServ.add(new Option('Otro / no estoy seguro','Otro / no estoy seguro'));
$$('[data-mailopt]').forEach(el=>{el.hidden=!HAS_MAIL});
if(!HAS_MAIL)$('#sendBtn').textContent='Enviar por WhatsApp';
function buildMsg(){
  const f=new FormData(form),v=k=>String(f.get(k)||'').trim();
  const area=v('area');
  return'Hola, quiero cotizar un servicio de topografía.\n'+
    'Nombre: '+(v('nombre')||'…')+'\n'+
    'Celular: '+(v('tel')||'…')+'\n'+
    'Ubicación: '+(v('lugar')||'…')+'\n'+
    'Servicio: '+v('servicio')+'\n'+
    'Área: '+(area?area+' '+v('unidad'):'por definir')+'\n'+
    'Urgencia: '+v('urg')+
    (v('msg')?'\nDetalles: '+v('msg'):'');
}
function updPrev(){if(prev)prev.textContent=buildMsg()}
form.addEventListener('input',updPrev);form.addEventListener('change',updPrev);
function prefillQuote(o){
  if(o.servicio)fServ.value=o.servicio;
  if(o.area)$('#fArea').value=o.area;
  if(o.unidad)$('#fUnidad').value=o.unidad;
  if(o.detalle)$('#fMsg').value=o.detalle;
  updPrev();
  go('cotizar');
  setTimeout(()=>$('#fNombre').focus({preventScroll:true}),MOTION.on?650:0);
  toast('Formulario listo: completa tus datos');
}
function validate(){
  const f=new FormData(form),v=k=>String(f.get(k)||'').trim();
  const rules=[['fNombre','eNombre',v('nombre').length>=2,'Escribe tu nombre'],['fTel','eTel',v('tel').replace(/\D/g,'').length>=7,'Escribe un celular válido'],['fLugar','eLugar',v('lugar').length>=3,'Indica el municipio y la vereda o barrio']];
  let first=null;
  rules.forEach(r=>{const el=$('#'+r[0]);el.setAttribute('aria-invalid',String(!r[2]));$('#'+r[1]).textContent=r[2]?'':r[3];if(!r[2]&&!first)first=el});
  return first;
}
['fNombre','fTel','fLugar'].forEach(id=>$('#'+id).addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true')validate()}));
form.addEventListener('submit',e=>{
  e.preventDefault();
  const bad=validate();
  if(bad){bad.focus();form.classList.remove('shake');void form.offsetWidth;form.classList.add('shake');toast('Revisa los campos marcados');return}
  const msg=buildMsg(),via=new FormData(form).get('via');
  if(via==='mail'&&HAS_MAIL){location.href='mailto:'+CONFIG.correo+'?subject='+encodeURIComponent('Cotización de topografía')+'&body='+encodeURIComponent(msg);toast('Abriendo tu correo…')}
  else{window.open(waLink(msg),'_blank','noopener');toast('Abriendo WhatsApp…')}
});
$('#fCopy').addEventListener('click',async()=>{toast(await copyText(buildMsg())?'Mensaje copiado':'No se pudo copiar')});
updPrev();

/* =========================================================
   ARRANQUE: bucle, tamaños y redibujos
   ========================================================= */
new IntersectionObserver(es=>{svc.visible=es[0].isIntersecting}).observe($('#svcCanvas'));
LOOP.add(now=>{if(svc.visible)svc.tick(now)});
document.addEventListener('gf:motion',()=>svc.redraw());
if('ResizeObserver' in window){
  const ro=(el,fn)=>{let first=true;new ResizeObserver(()=>{if(first){first=false;return}fn()}).observe(el)};
  ro($('#svcCanvas'),()=>svc.resize());
  ro($('#calcCanvas'),()=>calc.resize());
}
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>compare.draw(),140)});
$$('input[type=range]').forEach(paintRange);
svc.resize();calc.resize();calc.update();compare.draw();onScroll();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{svc.resize();calc.resize();calc.update();compare.draw()});
})();
