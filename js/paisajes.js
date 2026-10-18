/* =========================================================
   GF Topografías · Paisajes semi-animados en canvas
   Paisajes de campo dibujados con código:
   capa A = cielo, capa B = tierra, actores = lo que se mueve.
   Depende de nucleo.js (colores, utilidades y bucle).
   ========================================================= */
const Scape=(()=>{
const TAU=Math.PI*2,STILL=7.5,list=[],SCENES={};
const css=c=>'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')';
const H=hex2rgb,mh=(x,y,t)=>css(mix(H(x),H(y),t));
const wrap=(v,m)=>((v%m)+m)%m;
function R(seed){let s=(seed>>>0)||1;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)}
function N1(seed){const r=R(seed*7919+13),t=Array.from({length:256},r);return x=>{const i=Math.floor(x),f=x-i,a=t[i&255],b=t[(i+1)&255],u=f*f*(3-2*f);return a+(b-a)*u}}
function fbm(n,x,o){let s=0,a=.5,f=1;o=o||4;for(let i=0;i<o;i++){s+=a*n(x*f+i*17.3);a*=.5;f*=2}return s/.9375}

/* Paletas semi-pastel (cielo de arriba hacia el horizonte) */
const PAL={
  dawn:{sky:['#5D86B0','#A8C2D9','#F2DDB4'],sun:'#FFF0CF',glow:'255,224,175',ga:.5,cr:'255,255,255',ca:.85,
    far:'#93A9BA',mid:'#7690A3',near:'#5F8077',gr0:'#9EC08D',gr1:'#5C8A63',ink:'#26343B',water:'#B3CADB',mist:'246,236,218',acc:'#E2A21C'},
  day:{sky:['#6FA3D3','#AFCDE6','#EAF2F6'],sun:'#FFF4D6',glow:'255,240,205',ga:.3,cr:'255,255,255',ca:1,
    far:'#A3B8C6',mid:'#86A1B0',near:'#6F927C',gr0:'#A8C98B',gr1:'#6A9C5C',ink:'#2C3A33',water:'#93BEDC',mist:'255,255,255',acc:'#E2A21C'},
  dusk:{sky:['#0F2033','#2B4A66','#C98A55','#F3C27B'],sun:'#FFE7B0',glow:'255,200,120',ga:.55,cr:'255,212,170',ca:.55,
    far:'#4A6378',mid:'#384F63',near:'#2A3D4E',gr0:'#4E6B4C',gr1:'#1E2D25',ink:'#0D161D',water:'#8FA6B8',mist:'230,196,150',acc:'#F2B731'},
  night:{sky:['#0A131B','#0E1C28','#15283A','#1F3A52'],sun:'#EEF2F4',glow:'170,195,225',ga:.35,moon:1,stars:1,cr:'120,140,165',ca:.3,
    far:'#1A2B3A',mid:'#142230',near:'#0F1A25',gr0:'#1B2B26',gr1:'#0E1814',ink:'#070E13',water:'#2A4258',mist:'90,115,140',acc:'#F2B731'}
};

function cloudSprite(g,cy){
  const P=g.P,rnd=g.rnd,dpr=g.i.dpr,cw=Math.round((110+rnd()*190)*(g.w>700?1.25:.85)),ch=Math.round(cw*(.24+rnd()*.12));
  const c=document.createElement('canvas');c.width=Math.max(2,Math.round(cw*dpr));c.height=Math.max(2,Math.round(ch*dpr));
  const x=c.getContext('2d');x.scale(dpr,dpr);
  const n=5+Math.floor(rnd()*4);
  for(let j=0;j<n;j++){
    const t=(j+.5)/n,px=cw*(.14+.72*t),py=ch*(.66-.2*Math.sin(t*Math.PI)*(.6+rnd()*.5)),pr=ch*(.3+rnd()*.26)*(.75+.5*Math.sin(t*Math.PI));
    const gr=x.createRadialGradient(px,py,0,px,py,pr);
    gr.addColorStop(0,'rgba('+P.cr+',.95)');gr.addColorStop(.55,'rgba('+P.cr+',.5)');gr.addColorStop(1,'rgba('+P.cr+',0)');
    x.fillStyle=gr;x.beginPath();x.arc(px,py,pr,0,TAU);x.fill();
  }
  x.globalCompositeOperation='source-atop';
  const hc=H(g.hor),tg=x.createLinearGradient(0,ch*.2,0,ch);tg.addColorStop(0,'rgba('+hc+',0)');tg.addColorStop(1,'rgba('+hc+',.6)');
  x.fillStyle=tg;x.fillRect(0,0,cw,ch);
  return{c,w:cw,h:ch,x:rnd()*(g.w+cw),y:g.h*(cy[0]+rnd()*(cy[1]-cy[0])),sp:(2.5+rnd()*6)*(cw/200),al:(.55+.4*rnd())*P.ca};
}

function makeG(i){
  const w=i.w,h=i.h,P=i.P,a=i.a,b=i.b,rnd=i.rnd,u=Math.min(w,h*1.35);
  const g={i,w,h,u,P,a,b,rnd,acts:[],hor:P.sky[P.sky.length-1],mh,H,R,N1,fbm,TAU,wrap};
  g.hz=(c,t)=>mh(c,g.hor,t);
  g.add=f=>{g.acts.push(f)};

  /* Cielo: degradado estático + sol/luna y nubes dinámicos */
  g.sky=o=>{
    o=o||{};
    const n=P.sky.length,gr=a.createLinearGradient(0,0,0,h*(o.hz||.72));
    P.sky.forEach((c,k)=>gr.addColorStop(k/(n-1),c));
    a.fillStyle=gr;a.fillRect(0,0,w,h);
    if(P.stars){const r=R(11),ns=Math.round(w*h/2400);for(let k=0;k<ns;k++){const s=r()*1.3+.3;a.fillStyle='rgba(255,255,255,'+(.15+r()*.6).toFixed(2)+')';a.fillRect(r()*w,r()*h*.66,s,s)}}
    const sun=o.sun?{x:o.sun[0]*w,y:o.sun[1]*h,r:o.sun[2]*u}:null;
    const nc=o.clouds==null?Math.max(2,Math.round(w/240)):o.clouds,cl=[];
    for(let k=0;k<nc;k++)cl.push(cloudSprite(g,o.cy||[.06,.34]));
    g.sun=sun;
    i.sky=(c,t)=>{
      if(sun){
        const pr=1+.04*Math.sin(t*.8),R0=sun.r,gl=R0*7*pr;
        c.globalCompositeOperation='lighter';
        const g2=c.createRadialGradient(sun.x,sun.y,R0*.3,sun.x,sun.y,gl);
        g2.addColorStop(0,'rgba('+P.glow+','+P.ga+')');g2.addColorStop(.4,'rgba('+P.glow+','+(P.ga*.28).toFixed(3)+')');g2.addColorStop(1,'rgba('+P.glow+',0)');
        c.fillStyle=g2;c.fillRect(sun.x-gl,sun.y-gl,gl*2,gl*2);
        c.globalCompositeOperation='source-over';
        c.fillStyle=P.sun;c.beginPath();c.arc(sun.x,sun.y,R0,0,TAU);c.fill();
        if(P.moon){c.fillStyle='rgba(120,110,170,.18)';[[.3,-.2,.22],[-.25,.25,.15],[.1,.35,.1]].forEach(m=>{c.beginPath();c.arc(sun.x+m[0]*R0,sun.y+m[1]*R0,m[2]*R0,0,TAU);c.fill()})}
      }
      for(const s of cl){c.globalAlpha=s.al;c.drawImage(s.c,wrap(s.x+t*s.sp,w+s.w)-s.w,s.y,s.w,s.h)}
      c.globalAlpha=1;
    };
  };

  /* Cordillera / lomas: silueta con bruma hacia el horizonte */
  g.ridge=o=>{
    const n=N1(o.seed||1),st=Math.max(2,w/180),pts=[];let top=h;
    for(let x=0;x<=w+st;x+=st){
      let v=fbm(n,x/w*(o.freq||3)+(o.off||0),o.oct||4);
      if(o.sharp)v=1-Math.abs(v*2-1)*.9;
      const y=h*(o.base-(o.amp||.1)*v);pts.push([x,y]);if(y<top)top=y;
    }
    const ca=mix(H(P[o.c||'far']),H(g.hor),o.hz==null?.4:o.hz),cb=mix(ca,H(g.hor),.65);
    const gr=b.createLinearGradient(0,top,0,h*(o.fade||o.base+.12));gr.addColorStop(0,css(ca));gr.addColorStop(1,css(cb));
    b.fillStyle=gr;b.beginPath();b.moveTo(0,h);pts.forEach(p=>b.lineTo(p[0],p[1]));b.lineTo(w+st,h);b.closePath();b.fill();
    if(o.rim!==false){b.strokeStyle=rgba(mix(ca,[255,255,255],.4),.32);b.lineWidth=1;b.beginPath();pts.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.stroke()}
    return x=>{const k=clamp(x/st,0,pts.length-1.001),j=k|0;return lerp(pts[j][1],pts[j+1][1],k-j)};
  };

  /* Llano: terreno con textura de pasto */
  g.ground=o=>{
    const n=N1(o.seed||9),y0=h*o.y,am=h*(o.amp==null?.018:o.amp),pts=[];
    for(let x=0;x<=w+8;x+=8)pts.push([x,y0-am*fbm(n,x/w*2.4,3)*2]);
    const gr=b.createLinearGradient(0,y0-am*2,0,h);
    gr.addColorStop(0,g.hz(P.gr0,o.hz==null?.25:o.hz));gr.addColorStop(.3,P.gr0);gr.addColorStop(1,P.gr1);
    b.fillStyle=gr;b.beginPath();b.moveTo(0,h);pts.forEach(p=>b.lineTo(p[0],p[1]));b.lineTo(w+8,h);b.closePath();b.fill();
    const r=R((o.seed||9)*3+1),cnt=Math.round(w*(h-y0)/(o.dens||240)),lt=rgba(mix(H(P.gr0),[255,255,255],.35),.28),dk=rgba(mix(H(P.gr1),H(P.ink),.4),.3);
    for(let k=0;k<cnt;k++){
      const x=r()*w,t=Math.pow(r(),.75),y=y0+(h-y0)*t,s=.35+t*2.4;
      b.strokeStyle=r()<.5?lt:dk;b.lineWidth=Math.max(.6,s*.45);b.beginPath();b.moveTo(x,y);b.lineTo(x+(r()-.5)*3*s,y-(2+r()*5)*s);b.stroke();
    }
    return x=>{const k=clamp(x/8,0,pts.length-1.001),j=k|0;return lerp(pts[j][1],pts[j+1][1],k-j)};
  };

  /* Río que se ensancha hacia el frente, con destellos animados */
  g.river=o=>{
    const y0=h*o.y0,y1=h*o.y1,cx0=o.cx*w,sw=(o.sway==null?.12:o.sway)*w,w0=(o.w0==null?.02:o.w0)*w,w1=(o.w1==null?.22:o.w1)*w;
    const at=y=>{const s=clamp((y-y0)/(y1-y0),0,1);return{cx:cx0+sw*Math.sin(s*2.6+(o.ph||0))*(.3+.7*s),wd:lerp(w0,w1,Math.pow(s,1.25))}};
    const L=[],Rr=[],N=36;
    for(let k=0;k<=N;k++){const y=lerp(y0,y1,k/N),p=at(y);L.push([p.cx-p.wd/2,y]);Rr.push([p.cx+p.wd/2,y])}
    const gr=b.createLinearGradient(0,y0,0,y1);
    gr.addColorStop(0,mh(P.water,g.hor,.45));gr.addColorStop(1,mh(P.water,P.sky[Math.max(0,P.sky.length-2)],.2));
    b.fillStyle=gr;b.beginPath();L.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));for(let k=N;k>=0;k--)b.lineTo(Rr[k][0],Rr[k][1]);b.closePath();b.fill();
    b.strokeStyle=rgba(mix(H(P.gr1),H(P.ink),.35),.45);b.lineWidth=1.2;b.beginPath();
    L.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.moveTo(Rr[0][0],Rr[0][1]);Rr.forEach(p=>b.lineTo(p[0],p[1]));b.stroke();
    const r=R(77),S=Array.from({length:o.n||Math.round(w/12)},()=>({s:Math.pow(r(),1.1),o:r(),ph:r()*TAU,l:.4+r()*1.2}));
    g.add((c,t)=>{
      c.lineWidth=1;c.lineCap='round';
      for(const q of S){
        const y=lerp(y0,y1,q.s),p=at(y),x=p.cx+(q.o-.5)*p.wd*.82+Math.sin(t*.45+q.ph)*p.wd*.03,len=(4+q.s*26)*q.l,al=.1+.32*Math.max(0,Math.sin(t*1.5+q.ph));
        c.strokeStyle='rgba('+P.glow+','+al.toFixed(3)+')';c.beginPath();c.moveTo(x-len/2,y);c.lineTo(x+len/2,y);c.stroke();
      }
    });
    return at;
  };

  /* Bosque de galería: matas oscuras a lo largo de una línea de terreno */
  g.treeline=o=>{
    const r=R((o.seed||5)*13+3);
    b.fillStyle=css(mix(mix(H(P.gr1),H(P.ink),.5),mix(H(P.mid),H(g.hor),.25),o.hz==null?.15:o.hz));
    for(let x=o.x0*w;x<=o.x1*w;x+=o.s*(.5+r()*.5)){
      const y=o.f(x),rad=o.s*(.55+r()*.6);
      b.beginPath();b.arc(x,y-rad*.45,rad,0,TAU);b.fill();
      if(r()<.4){b.beginPath();b.arc(x+rad*.6,y-rad*.8,rad*.7,0,TAU);b.fill()}
    }
  };

  /* Bruma que se desplaza despacio */
  g.mist=o=>{
    const sw=Math.round(w*1.3),mhh=Math.max(8,Math.round(h*(o.h||.12))),dpr=i.dpr,c=document.createElement('canvas');
    c.width=Math.round(sw*dpr);c.height=Math.round(mhh*dpr);
    const x=c.getContext('2d');x.scale(dpr,dpr);
    const r=R((o.seed||3)*5+1);
    for(let k=0;k<Math.round(sw/90);k++){
      const cx=r()*sw,cy=mhh*(.35+r()*.4),rx=60+r()*140,ry=mhh*(.25+r()*.3);
      x.save();x.translate(cx,cy);x.scale(rx,ry);
      const gr=x.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba('+P.mist+','+(o.a||.35)+')');gr.addColorStop(1,'rgba('+P.mist+',0)');
      x.fillStyle=gr;x.beginPath();x.arc(0,0,1,0,TAU);x.fill();x.restore();
    }
    const y=h*o.y-mhh/2,sp=o.sp||6;
    g.add((cc,t)=>{const off=wrap(t*sp,sw);cc.drawImage(c,-off,y,sw,mhh);cc.drawImage(c,sw-off,y,sw,mhh)});
  };

  extendLife(g);extendProps(g);
  return g;
}

/* ---------- Flora y fauna ---------- */
function palmDraw(c,x,y,s,t,ph,ink){
  const sw=Math.sin(t*.8+ph)*.035+Math.sin(t*.37+ph*2)*.02,lean=.06*Math.sin(ph*5),tx=x+s*(lean+sw*2.2),ty=y-s;
  c.strokeStyle=ink;c.fillStyle=ink;c.lineCap='round';c.lineWidth=Math.max(1.2,s*.045);
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*lean*.3,y-s*.55,tx,ty);c.stroke();
  const nf=11,L=s*.42;
  for(let k=0;k<nf;k++){
    const q=k/(nf-1),ang=-Math.PI*(.04+.92*q)+sw*1.4+Math.sin(t*1.3+ph+k)*.03,droop=.35+.35*Math.abs(Math.cos(ang));
    const ex=tx+Math.cos(ang)*L,ey=ty+Math.sin(ang)*L*.75+droop*L*.35,mx=tx+Math.cos(ang)*L*.55,my=ty+Math.sin(ang)*L*.8-L*.1,wd=L*.14;
    c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(mx-Math.sin(ang)*wd,my+Math.cos(ang)*wd,ex,ey);c.quadraticCurveTo(mx+Math.sin(ang)*wd,my-Math.cos(ang)*wd,tx,ty);c.fill();
  }
}
function cowDraw(c,x,y,s,t,ph,dir,ink){
  c.save();c.translate(x,y);c.scale(dir,1);c.fillStyle=ink;c.strokeStyle=ink;c.lineCap='round';
  const bob=Math.sin(t*.9+ph)*.5+.5,hx=s*.62,hy=-s*(.42-.16*bob);
  c.beginPath();c.ellipse(0,-s*.34,s*.5,s*.22,0,0,TAU);c.fill();
  c.beginPath();c.ellipse(s*.28,-s*.55,s*.14,s*.12,0,0,TAU);c.fill();
  c.lineWidth=s*.13;c.beginPath();c.moveTo(s*.4,-s*.42);c.lineTo(hx,hy);c.stroke();
  c.beginPath();c.ellipse(hx+s*.05,hy+s*.04,s*.09,s*.065,.6,0,TAU);c.fill();
  c.beginPath();c.ellipse(hx-s*.02,hy-s*.06,s*.045,s*.02,-.5,0,TAU);c.fill();
  c.lineWidth=Math.max(1,s*.06);
  [-.34,-.2,.2,.34].forEach((px,k)=>{const d=Math.sin(t*1.4+ph+k*1.7)*.025*s;c.beginPath();c.moveTo(s*px,-s*.2);c.lineTo(s*px+d,0);c.stroke()});
  c.lineWidth=Math.max(1,s*.035);c.beginPath();c.moveTo(-s*.48,-s*.4);c.quadraticCurveTo(-s*.62,-s*.3,-s*.58,-s*.1+Math.sin(t*2+ph)*s*.02);c.stroke();
  c.restore();
}

function extendLife(g){
  const w=g.w,h=g.h,P=g.P,b=g.b,TAU=g.TAU,R=g.R,wrap=g.wrap;

  /* Samán / ceiba: copa en sombrilla (estático) */
  g.saman=(x,y,s,hz)=>{
    const col=g.hz(P.ink,hz||0);
    b.strokeStyle=col;b.fillStyle=col;b.lineCap='round';
    b.lineWidth=Math.max(1.5,s*.07);b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x-s*.05,y-s*.45,x+s*.04,y-s*.78);b.stroke();
    b.lineWidth=Math.max(1,s*.035);b.beginPath();b.moveTo(x+s*.03,y-s*.7);b.lineTo(x-s*.3,y-s*.98);b.moveTo(x+s*.03,y-s*.7);b.lineTo(x+s*.34,y-s*.96);b.stroke();
    const n=7;
    for(let k=0;k<n;k++){const q=k/(n-1)-.5;b.beginPath();b.ellipse(x+q*s*.9,y-s*(1+.06*Math.cos(q*3)),s*(.3-Math.abs(q)*.16),s*.13,0,0,TAU);b.fill()}
    b.fillStyle='rgba('+P.glow+',.12)';
    for(let k=1;k<n-1;k++){const q=k/(n-1)-.5;b.beginPath();b.ellipse(x+q*s*.9,y-s*(1.05+.06*Math.cos(q*3)),s*(.22-Math.abs(q)*.12),s*.05,0,0,TAU);b.fill()}
  };

  /* Cerca de postes y alambre (estático) */
  g.fence=(xa,ya,xb,yb,sa,sb,n)=>{
    const col=g.hz(P.ink,.12),px=[],py=[],ps=[];
    for(let k=0;k<=n;k++){const t=k/n;px.push(lerp(xa,xb,t));py.push(lerp(ya,yb,t));ps.push(lerp(sa,sb,t))}
    b.strokeStyle=col;b.lineCap='round';b.lineWidth=1;b.beginPath();
    [.9,.55].forEach(f=>{for(let k=0;k<=n;k++){const X=px[k],Y=py[k]-ps[k]*f;k?b.lineTo(X,Y):b.moveTo(X,Y)}});
    b.stroke();
    for(let k=0;k<=n;k++){b.lineWidth=Math.max(1,ps[k]*.1);b.beginPath();b.moveTo(px[k],py[k]);b.lineTo(px[k],py[k]-ps[k]);b.stroke()}
  };

  /* Palmas y ganado (dinámicos) */
  g.palm=(x,y,s,ph,hz)=>{const col=g.hz(P.ink,hz||0);g.add((c,t)=>palmDraw(c,x,y,s,t,ph||0,col))};
  g.cow=(x,y,s,dir,ph)=>{const col=g.hz(P.ink,.1);g.add((c,t)=>cowDraw(c,x,y,s,t,ph||0,dir||1,col))};

  /* Aves cruzando el cielo */
  g.birds=(n,y0,dy,s,v)=>{
    const r=R(901),B=Array.from({length:n},()=>({x:r()*w,y:h*(y0+r()*dy),s:s*(.7+.6*r()),v:v*(.8+.4*r()),ph:r()*TAU})),col=g.hz(P.ink,.15);
    g.add((c,t)=>{
      c.strokeStyle=col;c.lineCap='round';c.lineJoin='round';
      for(const q of B){
        const x=wrap(q.x+t*q.v,w+80)-40,y=q.y+Math.sin(t*.5+q.ph)*3,f=Math.sin(t*7+q.ph),z=q.s;
        c.lineWidth=Math.max(1,z*.16);c.beginPath();c.moveTo(x-z,y-f*z*.45);c.quadraticCurveTo(x-z*.4,y-z*.32+f*z*.15,x,y);c.quadraticCurveTo(x+z*.4,y-z*.32+f*z*.15,x+z,y-f*z*.45);c.stroke();
      }
    });
  };

  /* Pasto del primer plano que se mece con el viento */
  g.grass=(n,hmax,col)=>{
    const r=R(401),bl=Array.from({length:n},()=>({x:r()*w,s:.5+r()*.5,ph:r()*TAU})),c1=col||g.mh(P.gr1,P.ink,.35),c2=g.mh(P.gr0,P.gr1,.4);
    g.add((c,t)=>{
      c.lineCap='round';c.lineWidth=1.3;
      [[c1,0],[c2,1]].forEach(z=>{
        c.strokeStyle=z[0];c.beginPath();
        for(let k=z[1];k<bl.length;k+=2){const q=bl[k],ht=hmax*q.s,sw=Math.sin(t*1.5+q.x*.02+q.ph)*ht*.22+Math.sin(t*.6+q.ph)*ht*.08;c.moveTo(q.x,h+2);c.quadraticCurveTo(q.x+sw*.4,h-ht*.55,q.x+sw,h-ht)}
        c.stroke();
      });
    });
  };

  /* Luciérnagas (escenas nocturnas) */
  g.fireflies=(n,y0,y1)=>{
    const r=R(777),F=Array.from({length:n},()=>({x:r()*w,y:h*(y0+r()*(y1-y0)),ph:r()*TAU,sp:.2+r()*.5,a:6+r()*14})),col=g.H(P.acc);
    g.add((c,t)=>{
      c.globalCompositeOperation='lighter';
      for(const q of F){
        const x=q.x+Math.sin(t*q.sp+q.ph)*q.a,y=q.y+Math.cos(t*q.sp*1.3+q.ph)*q.a*.6,al=Math.max(0,Math.sin(t*1.1+q.ph*3))*.9;
        if(al<.05)continue;
        const gr=c.createRadialGradient(x,y,0,x,y,7);gr.addColorStop(0,'rgba('+col+','+al.toFixed(2)+')');gr.addColorStop(1,'rgba('+col+',0)');
        c.fillStyle=gr;c.fillRect(x-7,y-7,14,14);
      }
    });
  };
}

/* ---------- Elementos de topografía y obra ---------- */
function extendProps(g){
  const w=g.w,h=g.h,P=g.P,b=g.b,TAU=g.TAU,H=g.H;

  /* Etiqueta tipo chip, con opacidad */
  g.lbl=(c,txt,x,y,col,al)=>{
    if(al!=null&&al<.02)return;
    c.font='500 11px "JetBrains Mono",ui-monospace,monospace';
    const tw=c.measureText(txt).width+14;
    x=Math.min(Math.max(x,4),w-tw-4);y=Math.min(Math.max(y,14),h-14);
    c.globalAlpha=al==null?1:al;tag(c,txt,x,y,col);c.globalAlpha=1;
  };

  /* Dron: cuerpo, brazos, rotores borrosos y LED */
  g.droneDraw=(c,x,y,s,t)=>{
    c.save();c.translate(x,y);
    const body=g.hz(P.ink,0);
    c.fillStyle=body;c.strokeStyle=body;c.lineCap='round';
    c.lineWidth=Math.max(1.2,s*.09);c.beginPath();c.moveTo(-s*1.05,-s*.18);c.lineTo(-s*.25,0);c.moveTo(s*1.05,-s*.18);c.lineTo(s*.25,0);c.stroke();
    c.beginPath();c.ellipse(0,0,s*.42,s*.2,0,0,TAU);c.fill();
    c.beginPath();c.arc(0,s*.22,s*.1,0,TAU);c.fill();
    const sp=Math.sin(t*38);
    [-1,1].forEach(sg=>{c.fillStyle='rgba(255,255,255,'+(.35+.15*sp*sg).toFixed(2)+')';c.beginPath();c.ellipse(sg*s*1.05,-s*.24,s*.52,s*.07,0,0,TAU);c.fill()});
    c.fillStyle=Math.sin(t*4)>0?'#E8705F':'#8CCB8F';c.beginPath();c.arc(s*.34,0,Math.max(1.2,s*.06),0,TAU);c.fill();
    c.restore();
  };

  /* Estación total sobre trípode */
  g.totalStation=(c,x,y,s,col)=>{
    c.strokeStyle=col;c.fillStyle=col;c.lineCap='round';
    const hx=x,hy=y-s*.95;
    c.lineWidth=Math.max(1.2,s*.05);
    c.beginPath();c.moveTo(hx,hy);c.lineTo(x-s*.38,y);c.moveTo(hx,hy);c.lineTo(x+s*.05,y+s*.04);c.moveTo(hx,hy);c.lineTo(x+s*.42,y);c.stroke();
    c.fillRect(hx-s*.1,hy-s*.06,s*.2,s*.08);
    rr(c,hx-s*.09,hy-s*.33,s*.18,s*.28,s*.03);c.fill();
    c.fillRect(hx-s*.13,hy-s*.3,s*.26,s*.06);
    c.beginPath();c.arc(hx+s*.14,hy-s*.27,s*.03,0,TAU);c.fill();
  };

  /* Topógrafo (silueta) con casco */
  g.person=(c,x,y,s,col,t)=>{
    c.strokeStyle=col;c.fillStyle=col;c.lineCap='round';
    const hy=y-s*1.7;
    c.beginPath();c.arc(x,hy,s*.16,0,TAU);c.fill();
    c.lineWidth=s*.34;c.beginPath();c.moveTo(x,hy+s*.28);c.lineTo(x,y-s*.82);c.stroke();
    c.lineWidth=s*.15;c.beginPath();c.moveTo(x-s*.07,y-s*.82);c.lineTo(x-s*.12,y);c.moveTo(x+s*.07,y-s*.82);c.lineTo(x+s*.14,y);c.stroke();
    c.lineWidth=s*.1;c.beginPath();c.moveTo(x+s*.1,hy+s*.4);c.lineTo(x+s*.5,hy+s*.3+Math.sin(t*1.2)*s*.02);c.stroke();
    c.fillStyle='#F2B731';c.beginPath();c.ellipse(x,hy-s*.1,s*.19,s*.09,0,Math.PI,0);c.fill();
  };

  /* Jalón con prisma */
  g.prism=(c,x,y,s,col)=>{
    c.strokeStyle=col;c.fillStyle=col;c.lineCap='round';c.lineWidth=Math.max(1.2,s*.05);
    c.beginPath();c.moveTo(x,y);c.lineTo(x,y-s*1.6);c.stroke();
    c.beginPath();c.moveTo(x,y-s*.5);c.lineTo(x-s*.18,y);c.moveTo(x,y-s*.5);c.lineTo(x+s*.18,y);c.stroke();
    c.fillStyle='#E8705F';c.beginPath();c.arc(x,y-s*1.68,s*.1,0,TAU);c.fill();
  };

  /* Estaca con bandera que ondea */
  g.stake=(c,x,y,s,col,t,ph)=>{
    c.strokeStyle='#EEF2F4';c.lineWidth=Math.max(1.2,s*.12);c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x,y-s);c.stroke();
    const fl=Math.sin(t*5+ph)*s*.1;
    c.fillStyle=col;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s*.55+fl,y-s*.85+fl*.3);c.lineTo(x+fl*.5,y-s*.62);c.closePath();c.fill();
  };

  /* Casa sencilla (estático, en la capa de tierra) */
  g.house=(x,y,s,wall,roof)=>{
    b.fillStyle=wall;b.fillRect(x-s*.5,y-s*.5,s,s*.5);
    b.fillStyle=roof;b.beginPath();b.moveTo(x-s*.6,y-s*.5);b.lineTo(x,y-s*.95);b.lineTo(x+s*.6,y-s*.5);b.closePath();b.fill();
    b.fillStyle='rgba(19,32,42,.35)';b.fillRect(x-s*.12,y-s*.3,s*.22,s*.3);
    b.fillStyle='rgba(255,255,255,.5)';b.fillRect(x+s*.2,y-s*.38,s*.16,s*.14);
  };

  /* Excavadora con brazo animado */
  g.excavator=(c,x,y,s,t,col,dir)=>{
    c.save();c.translate(x,y);c.scale(dir||1,1);c.fillStyle=col;c.strokeStyle=col;c.lineCap='round';c.lineJoin='round';
    rr(c,-s*.62,-s*.2,s*1.24,s*.2,s*.1);c.fill();
    rr(c,-s*.4,-s*.62,s*.62,s*.42,s*.05);c.fill();
    rr(c,-s*.55,-s*.5,s*.2,s*.3,s*.04);c.fill();
    c.fillStyle='rgba(255,255,255,.4)';c.fillRect(-s*.02,-s*.56,s*.18,s*.2);
    const p=(t%7)/7,a1=-.95+.35*Math.sin(p*TAU),a2=.9+.75*Math.sin(p*TAU+1.1),a3=.6+.8*Math.sin(p*TAU+2);
    const px=s*.18,py=-s*.52,L1=s*.95,L2=s*.62,x1=px+Math.cos(a1)*L1,y1=py+Math.sin(a1)*L1,x2=x1+Math.cos(a1+a2)*L2,y2=y1+Math.sin(a1+a2)*L2;
    c.lineWidth=s*.13;c.beginPath();c.moveTo(px,py);c.lineTo(x1,y1);c.stroke();
    c.lineWidth=s*.09;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
    const ba=a1+a2+a3;c.fillStyle=col;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2+Math.cos(ba)*s*.3,y2+Math.sin(ba)*s*.3);c.lineTo(x2+Math.cos(ba+1.2)*s*.22,y2+Math.sin(ba+1.2)*s*.22);c.closePath();c.fill();
    c.restore();
  };

  /* Volqueta */
  g.truck=(c,x,y,s,col,dir)=>{
    c.save();c.translate(x,y);c.scale(dir||1,1);c.fillStyle=col;
    c.beginPath();c.moveTo(-s*.62,-s*.34);c.lineTo(s*.1,-s*.34);c.lineTo(s*.2,-s*.12);c.lineTo(-s*.62,-s*.12);c.closePath();c.fill();
    rr(c,s*.14,-s*.42,s*.34,s*.3,s*.05);c.fill();
    c.fillStyle='rgba(255,255,255,.4)';c.fillRect(s*.32,-s*.38,s*.12,s*.12);
    c.fillStyle=col;c.fillRect(-s*.62,-s*.14,s*1.1,s*.06);
    [-.4,.3,.4].forEach(px=>{c.beginPath();c.arc(s*px,-s*.07,s*.1,0,TAU);c.fill()});
    c.fillStyle='#EEF2F4';[-.4,.3,.4].forEach(px=>{c.beginPath();c.arc(s*px,-s*.07,s*.035,0,TAU);c.fill()});
    c.restore();
  };

  /* Franjas de cultivo en perspectiva (estático) */
  g.furrows=(yTop,vx,n,ca,cb)=>{
    const yv=h*.5,k=(yTop-yv)/(h-yv);
    for(let i=0;i<n;i++){
      const xb0=lerp(-.7*w,1.7*w,i/n),xb1=lerp(-.7*w,1.7*w,(i+1)/n),xt0=vx+(xb0-vx)*k,xt1=vx+(xb1-vx)*k;
      b.fillStyle=i%2?ca:cb;b.beginPath();b.moveTo(xt0,yTop);b.lineTo(xt1,yTop);b.lineTo(xb1,h);b.lineTo(xb0,h);b.closePath();b.fill();
    }
    b.strokeStyle='rgba(255,255,255,.10)';b.lineWidth=1;b.beginPath();
    for(let i=0;i<=n*3;i++){const xb=lerp(-.7*w,1.7*w,i/(n*3)),xt=vx+(xb-vx)*k;b.moveTo(xt,yTop);b.lineTo(xb,h)}
    b.stroke();
  };
}

/* =========================================================
   Escenas (cada una devuelve la lista de actores animados)
   ========================================================= */

/* Llanura con montañas al fondo: hero y panorama */
SCENES.llano=g=>{
  const w=g.w,h=g.h,u=g.u,o=g.i.o,sd=o.seed||3,hz=typeof o.hz==='function'?o.hz(w,h):(o.hz==null?.6:o.hz),A=o.amp||1,PS=o.palmS||1;
  g.sky({sun:[o.sunX==null?.74:o.sunX,hz-.12,.055],hz:hz+.12,clouds:o.clouds});
  g.ridge({base:hz-.02,amp:.26*A,seed:sd,sharp:true,hz:.55,freq:2.6});
  g.ridge({base:hz+.03,amp:.09,seed:sd+4,c:'mid',hz:.38,freq:3.4,off:7});
  const gy=g.ground({y:hz+.07,amp:.018,seed:sd+9,hz:.3});
  g.treeline({f:gy,x0:0,x1:1,s:u*.03,seed:4,hz:.35});
  g.river({y0:hz+.1,y1:1.02,cx:o.riverX==null?.42:o.riverX,sway:.14,w0:.03,w1:.34,ph:1.2});
  (o.palmX||[.82,.9,.76,.96]).forEach((x,k)=>g.palm(x*w,(hz+.17+(k%2)*.03)*h,u*(.22+.07*((k*7)%3)/2)*PS,k*1.7));
  (o.cows||[]).forEach((q,k)=>g.cow(q[0]*w,q[1]*h,u*.075,q[2],k*2.3));
  g.birds(o.birds==null?4:o.birds,.14,.16,u*.016,u*.04);
  g.mist({y:hz+.07,h:.1,a:.3});
  g.grass(Math.round(w/9),u*.07);
  return g.acts;
};

/* Finca: samán, ganado, cerca, río y lindero con mojones */
SCENES.finca=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,TAU=g.TAU;
  g.sky({sun:[.74,.3,.05],hz:.62,clouds:3});
  g.ridge({base:.5,amp:.2,seed:5,sharp:true,hz:.55,freq:2.4});
  g.ridge({base:.58,amp:.08,seed:8,c:'mid',hz:.35,freq:3,off:3});
  const gy=g.ground({y:.62,amp:.02,seed:6,hz:.25});
  g.treeline({f:gy,x0:0,x1:1,s:u*.035,seed:2,hz:.3});
  g.river({y0:.66,y1:1.02,cx:.8,sway:.06,w0:.02,w1:.26,ph:.4});
  g.saman(.17*w,.8*h,.42*u);
  g.fence(.02*w,.93*h,.46*w,.72*h,.1*u,.035*u,9);
  [[.5,.78,1],[.6,.84,-1],[.44,.88,1],[.66,.76,-1]].forEach((q,k)=>g.cow(q[0]*w,q[1]*h,u*(.05+.07*(q[1]-.7)),q[2],k*1.9));
  g.palm(.94*w,.8*h,.3*u,.5);g.palm(.9*w,.73*h,.2*u,2.1);
  g.birds(3,.12,.14,u*.018,u*.05);
  g.mist({y:.64,h:.09,a:.28});
  const bx=[.05,.5,.95],by=[.95,.92,.89],acc=rgba(g.H(P.acc),.9);
  g.add((c,t)=>{
    c.setLineDash([7,6]);c.lineDashOffset=-t*14;c.strokeStyle=acc;c.lineWidth=1.6;
    c.beginPath();bx.forEach((x,k)=>k?c.lineTo(x*w,by[k]*h):c.moveTo(x*w,by[k]*h));c.stroke();c.setLineDash([]);
    bx.forEach((x,k)=>{
      const px=x*w,py=by[k]*h,pu=(t*.8+k*.33)%1;
      c.strokeStyle=rgba(g.H(P.acc),.6*(1-pu));c.lineWidth=1.2;c.beginPath();c.arc(px,py,3+pu*10,0,TAU);c.stroke();
      c.fillStyle='#EEF2F4';c.save();c.translate(px,py);c.rotate(Math.PI/4);c.fillRect(-3,-3,6,6);c.restore();
    });
    g.lbl(c,'Lindero',bx[1]*w-26,by[1]*h-17,C.mint,clamp(Math.sin(t*.6)*1.6+.7,0,1));
  });
  g.grass(Math.round(w/10),u*.05);
  return g.acts;
};

/* Vía: carretera con curva, abscisas, faros y estacas */
SCENES.via=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,b=g.b,yh=.56,y0=yh+.015;
  g.sky({sun:[.5,.5,.06],hz:.64,clouds:3,cy:[.08,.3]});
  g.ridge({base:.52,amp:.22,seed:12,sharp:true,hz:.5,freq:2.2});
  g.ridge({base:.57,amp:.07,seed:15,c:'mid',hz:.3,freq:3.2,off:5});
  const gy=g.ground({y:yh+.02,amp:.012,seed:3,hz:.2});
  g.treeline({f:gy,x0:0,x1:1,s:u*.03,seed:7,hz:.3});
  const cx=v=>w*(.5+.17*Math.sin(v*3.1+.6)*v),hw=v=>lerp(.012,.36,v)*w,Y=v=>h*(y0+(1.02-y0)*Math.pow(v,1.7));
  const N=40,Lp=[],Rp=[];
  for(let k=0;k<=N;k++){const v=k/N;Lp.push([cx(v)-hw(v),Y(v)]);Rp.push([cx(v)+hw(v),Y(v)])}
  const gr=b.createLinearGradient(0,h*y0,0,h);gr.addColorStop(0,g.mh(P.ink,g.hor,.55));gr.addColorStop(1,g.mh(P.ink,P.mid,.25));
  b.fillStyle=gr;b.beginPath();Lp.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));for(let k=N;k>=0;k--)b.lineTo(Rp[k][0],Rp[k][1]);b.closePath();b.fill();
  b.strokeStyle='rgba(255,236,214,.35)';b.lineWidth=1.4;b.beginPath();
  Lp.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.moveTo(Rp[0][0],Rp[0][1]);Rp.forEach(p=>b.lineTo(p[0],p[1]));b.stroke();
  [[.42,-1.7],[.42,1.7],[.72,-1.55],[.72,1.55]].forEach((q,k)=>g.palm(cx(q[0])+hw(q[0])*q[1],Y(q[0]),u*(.1+.22*q[0]),k*1.3,.1));
  const sv=[.28,.5,.76],lab=['K0+000','K0+020','K0+040'];
  g.add((c,t)=>{
    const M=14,off=(t*.3)%1;c.fillStyle='rgba(255,236,214,.75)';
    for(let k=0;k<M;k++){
      const v0=(k+off)/M,v1=v0+.42/M;if(v0<.04)continue;
      const a0=Math.max(.5,hw(v0)*.035),a1=Math.max(.5,hw(v1)*.035);
      c.beginPath();c.moveTo(cx(v0)-a0,Y(v0));c.lineTo(cx(v0)+a0,Y(v0));c.lineTo(cx(v1)+a1,Y(v1));c.lineTo(cx(v1)-a1,Y(v1));c.closePath();c.fill();
    }
    sv.forEach((v,k)=>{
      const x=cx(v)+hw(v)*1.18,y=Y(v),s=u*(.03+.1*v);
      g.stake(c,x,y,s,'#E8705F',t,k);
      const d=((t/2.2-k)%3+3)%3;
      g.lbl(c,lab[k],x+s*.7,y-s*1.15,C.mint,d<1?Math.sin(d*Math.PI):0);
    });
    c.globalCompositeOperation='lighter';
    [[0,1,.055,'255,240,215',14],[.5,-1,.045,'255,120,150',9]].forEach(q=>{
      const ph=wrap(t*q[2]+q[0],1),v=q[1]>0?ph:1-ph,a=Math.min(1,v*6,(1-v)*4);if(a<.02||v<.05)return;
      const x=cx(v)+hw(v)*(q[1]>0?-.5:.5),y=Y(v),sp=hw(v)*.13,r=1.5+v*q[4];
      [-1,1].forEach(sg=>{const gl=c.createRadialGradient(x+sg*sp,y,0,x+sg*sp,y,r*2.4);gl.addColorStop(0,'rgba('+q[3]+','+a.toFixed(2)+')');gl.addColorStop(1,'rgba('+q[3]+',0)');c.fillStyle=gl;c.fillRect(x+sg*sp-r*2.4,y-r*2.4,r*4.8,r*4.8)});
    });
  });
  g.mist({y:.62,h:.08,a:.25});
  return g.acts;
};

/* Loteo: lotes en perspectiva con casas, pueblo al fondo y lote resaltado */
SCENES.loteo=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,b=g.b,yh=.57,TAU=g.TAU;
  g.sky({sun:[.2,.36,.045],hz:.62,clouds:4});
  g.ridge({base:.52,amp:.16,seed:31,sharp:true,hz:.55,freq:2.2});
  g.ridge({base:.58,amp:.05,seed:34,c:'mid',hz:.4,freq:3.2,off:1});
  const gy=g.ground({y:yh+.015,amp:.01,seed:4,hz:.25}),r=g.R(5);
  for(let x=.52*w;x<.96*w;){const bw=u*(.018+r()*.02),bh=u*(.02+r()*.05);b.fillStyle=g.mh('#A9B8C6',g.hor,.35+r()*.3);b.fillRect(x,gy(x)-bh*.8,bw,bh);x+=bw+u*.004}
  const ys=h*(yh+.02),Y=v=>ys+(h*1.04-ys)*Math.pow(v,1.6),S=v=>(Y(v)-ys)/(h*1.04-ys),X=(q,v)=>w/2+q*S(v)*w*.9;
  const rows=[[.14,.3],[.38,.6],[.68,.97]],cols=[-1.5,-1.1,-.7,-.3,.1,.5,.9,1.3,1.7];
  [[.3,.38],[.6,.68]].forEach(q=>{b.fillStyle='rgba(236,241,243,.45)';b.beginPath();b.moveTo(X(-3,q[0]),Y(q[0]));b.lineTo(X(3,q[0]),Y(q[0]));b.lineTo(X(3,q[1]),Y(q[1]));b.lineTo(X(-3,q[1]),Y(q[1]));b.closePath();b.fill()});
  const roofs=['#C8694B','#9AA7B0','#B5603F','#7F9AA8'],walls=['#F4EFE6','#EDF0F1','#EEF3EC'],lots=[];
  rows.forEach((rw,ri)=>cols.slice(0,-1).forEach((q0,j)=>{
    const l={q0:q0+.025,q1:cols[j+1]-.025,v0:rw[0],v1:rw[1]};lots.push(l);
    b.fillStyle='rgba(255,255,255,.10)';b.beginPath();b.moveTo(X(l.q0,l.v0),Y(l.v0));b.lineTo(X(l.q1,l.v0),Y(l.v0));b.lineTo(X(l.q1,l.v1),Y(l.v1));b.lineTo(X(l.q0,l.v1),Y(l.v1));b.closePath();b.fill();
    const vm=(l.v0+l.v1)/2,qm=(l.q0+l.q1)/2,x=X(qm,vm);
    if(r()<.55&&x>-20&&x<w+20)g.house(x,Y(vm)+S(vm)*u*.05,S(vm)*u*.22,walls[(r()*3)|0],roofs[(r()*4)|0]);
  }));
  const vis=lots.filter(l=>{const x=X((l.q0+l.q1)/2,(l.v0+l.v1)/2);return x>.12*w&&x<.88*w}),acc=g.H(P.acc);
  g.palm(X(-1.9,.34),Y(.34),u*.14,.7);g.palm(X(1.9,.34),Y(.34),u*.14,2.4);
  g.birds(3,.12,.14,u*.018,u*.05);
  g.add((c,t)=>{
    const path=l=>{c.beginPath();c.moveTo(X(l.q0,l.v0),Y(l.v0));c.lineTo(X(l.q1,l.v0),Y(l.v0));c.lineTo(X(l.q1,l.v1),Y(l.v1));c.lineTo(X(l.q0,l.v1),Y(l.v1));c.closePath()};
    c.setLineDash([5,4]);c.lineDashOffset=-t*8;c.strokeStyle=rgba(acc,.8);c.lineWidth=1;lots.forEach(l=>{path(l);c.stroke()});c.setLineDash([]);
    const k=Math.floor(t/2.4)%vis.length,l=vis[k],pu=.5+.5*Math.sin(t*3);
    path(l);c.fillStyle=rgba(acc,.18+.14*pu);c.fill();c.strokeStyle=rgba(acc,1);c.lineWidth=1.6;c.stroke();
    [[l.q0,l.v0],[l.q1,l.v0],[l.q1,l.v1],[l.q0,l.v1]].forEach(q=>{c.fillStyle='#EEF2F4';c.fillRect(X(q[0],q[1])-2.5,Y(q[1])-2.5,5,5)});
    const al=clamp(1-Math.abs(((t/2.4)%1)-.5)*2.6,0,1);
    g.lbl(c,'Lt '+String(k+7).padStart(2,'0'),X((l.q0+l.q1)/2,(l.v0+l.v1)/2)-20,Y(l.v0)-14,C.mint,al);
  });
  g.mist({y:.6,h:.07,a:.2});
  return g.acts;
};

/* Dron: vuelo sobre cultivos con cono de captura y ortomosaico */
SCENES.dron=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,b=g.b,acc=g.H(P.acc);
  g.sky({sun:[.2,.3,.045],hz:.62,clouds:3});
  g.ridge({base:.5,amp:.26,seed:21,sharp:true,hz:.5,freq:2});
  g.ridge({base:.6,amp:.1,seed:24,c:'mid',hz:.3,freq:3,off:2});
  const gy=g.ground({y:.66,amp:.015,seed:8,hz:.2});
  g.treeline({f:gy,x0:0,x1:1,s:u*.03,seed:3,hz:.3});
  g.furrows(h*.7,w*.5,9,g.mh(P.gr0,'#FFFFFF',.1),g.mh(P.gr0,P.gr1,.35));
  const fg=b.createLinearGradient(0,h*.7,0,h*.76),hc=g.H(g.hor);fg.addColorStop(0,'rgba('+hc+',.45)');fg.addColorStop(1,'rgba('+hc+',0)');b.fillStyle=fg;b.fillRect(0,h*.7,w,h*.06);
  const trail=[],top=.76*h,bot=.9*h,fw=u*.2;let lastT=-9;
  const quad=x=>[[x-fw*.32,top],[x+fw*.32,top],[x+fw*.62,bot],[x-fw*.62,bot]];
  g.add((c,t)=>{
    const X=(.5+.3*Math.sin(t*.32))*w,Y0=(.26+.045*Math.sin(t*.8+1))*h,s=u*.034;
    if(t-lastT>.3||t<lastT){trail.push({x:X,t});lastT=t;if(trail.length>26)trail.shift()}
    trail.forEach(q=>{
      const al=clamp(1-(t-q.t)/6,0,1)*.2;if(al<=0)return;
      c.fillStyle=rgba(acc,al);c.beginPath();quad(q.x).forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();
    });
    const Q=quad(X),cn=c.createLinearGradient(0,Y0,0,bot);cn.addColorStop(0,rgba(acc,0));cn.addColorStop(1,rgba(acc,.26));
    c.fillStyle=cn;c.beginPath();c.moveTo(X,Y0+s*.3);c.lineTo(Q[3][0],Q[3][1]);c.lineTo(Q[2][0],Q[2][1]);c.closePath();c.fill();
    c.fillStyle=rgba(acc,.22);c.beginPath();Q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();
    c.strokeStyle=rgba(acc,.7);c.lineWidth=1;c.beginPath();
    for(let k=0;k<=4;k++){const f=k/4;c.moveTo(lerp(Q[0][0],Q[1][0],f),top);c.lineTo(lerp(Q[3][0],Q[2][0],f),bot)}
    for(let k=0;k<=3;k++){const y=lerp(top,bot,k/3),f=(y-top)/(bot-top);c.moveTo(lerp(Q[0][0],Q[3][0],f),y);c.lineTo(lerp(Q[1][0],Q[2][0],f),y)}
    c.stroke();
    g.droneDraw(c,X,Y0,s,t);
    g.lbl(c,'Ortomosaico',clamp(X+fw*.7,6,w-92),(top+bot)/2,C.mint,.9);
  });
  g.birds(2,.1,.1,u*.016,u*.04);
  g.mist({y:.66,h:.08,a:.22});
  return g.acts;
};

/* Curvas de nivel: terreno de crestas apiladas (perfiles) que fluye despacio */
SCENES.curvas=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,n=g.N1(31),rows=Math.max(18,Math.round(h/9)),st=Math.max(4,Math.round(w/110));
  g.sky({sun:[.76,.34,.05],hz:.7,clouds:0});
  const occ=g.mh(P.near,P.ink,.35),la=g.H('#8DB3D6'),pe=g.H('#F2B731');
  g.add((c,t)=>{
    c.lineJoin='round';
    for(let k=0;k<=rows;k++){
      const kk=k/rows,by=h*(.44+.62*Math.pow(kk,1.15)),amp=u*(.05+.2*kk),band=k===rows?h:amp+h*.1;
      const ys=[];
      for(let x=-st,i=0;x<=w+st;x+=st,i++){
        const e=.35+.65*Math.exp(-Math.pow((x/w-.5)/.38,2));
        ys.push(by-amp*fbm(n,x*.0065+k*.2+t*.04,3)*e);
      }
      c.beginPath();ys.forEach((y,i)=>i?c.lineTo(-st+i*st,y):c.moveTo(-st,y));
      for(let i=ys.length-1;i>=0;i--)c.lineTo(-st+i*st,ys[i]+band);
      c.closePath();c.fillStyle=occ;c.fill();
      c.beginPath();ys.forEach((y,i)=>i?c.lineTo(-st+i*st,y):c.moveTo(-st,y));
      c.strokeStyle=rgba(mix(la,pe,kk),.3+.6*kk);c.lineWidth=.7+kk*1.1;c.stroke();
    }
    g.lbl(c,(t%10<5)?'Modelo 3D':'Curvas de nivel',10,h-16,C.lav,.85);
  });
  return g.acts;
};

/* Volúmenes: corte escalonado, volqueta, excavadora y acopio */
SCENES.vol=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,b=g.b,TAU=g.TAU;
  g.sky({sun:[.2,.28,.045],hz:.6,clouds:3});
  g.ridge({base:.48,amp:.2,seed:41,sharp:true,hz:.55,freq:2});
  g.ridge({base:.55,amp:.08,seed:44,c:'mid',hz:.35,freq:3,off:1});
  const PF=[[0,.62],[.26,.62],[.3,.68],[.38,.68],[.42,.74],[.5,.74],[.54,.8],[.74,.8],[.78,.74],[.84,.74],[.88,.68],[1,.68]];
  const pf=x=>{const q=x/w;for(let k=1;k<PF.length;k++){if(q<=PF[k][0]){const a=PF[k-1],e=PF[k];return lerp(a[1],e[1],(q-a[0])/((e[0]-a[0])||1))*h}}return PF[PF.length-1][1]*h};
  const earth=b.createLinearGradient(0,h*.6,0,h);earth.addColorStop(0,'#EAD0AA');earth.addColorStop(1,'#C79C80');
  b.fillStyle=earth;b.beginPath();b.moveTo(0,h);PF.forEach(p=>b.lineTo(p[0]*w,p[1]*h));b.lineTo(w,h);b.closePath();b.fill();
  for(let k=1;k<=4;k++){b.strokeStyle=k%2?'rgba(255,255,255,.18)':'rgba(120,70,60,.14)';b.lineWidth=1;b.beginPath();for(let x=0;x<=w;x+=6){const y=pf(x)+k*h*.04;x?b.lineTo(x,y):b.moveTo(x,y)}b.stroke()}
  b.fillStyle=P.gr0;[[0,.26,.62],[.88,1,.68]].forEach(q=>b.fillRect(q[0]*w,q[2]*h,(q[1]-q[0])*w,Math.max(5,h*.03)));
  b.fillStyle='#E0BE96';b.beginPath();b.moveTo(.84*w,.68*h);b.quadraticCurveTo(.92*w,.5*h,.96*w,.57*h);b.quadraticCurveTo(1.0*w,.6*h,1.04*w,.68*h);b.closePath();b.fill();
  b.strokeStyle='rgba(120,70,60,.18)';b.lineWidth=1;[.06,.11].forEach(d=>{b.beginPath();b.moveTo((.86+d*.4)*w,.68*h);b.quadraticCurveTo(.93*w,(.56+d)*h,(1.02-d*.4)*w,.68*h);b.stroke()});
  const dust=[];let lastD=-9;
  g.add((c,t)=>{
    const ink=g.hz(P.ink,0),pp=(t*.07)%2,pos=pp<1?pp:2-pp,dir=pp<1?1:-1,tx=lerp(.06,.22,pos)*w,ty=.62*h,ts=u*.12;
    if(t-lastD>.12||t<lastD){dust.push({x:tx-dir*ts*.5,t});lastD=t;if(dust.length>14)dust.shift()}
    dust.forEach(q=>{const a=(t-q.t)/1.4;if(a>=1)return;c.fillStyle='rgba(233,205,166,'+(.5*(1-a)).toFixed(2)+')';c.beginPath();c.arc(q.x,ty-4-a*ts*.5,3+a*ts*.35,0,TAU);c.fill()});
    g.truck(c,tx,ty,ts,ink,dir);
    g.excavator(c,.6*w,.8*h,u*.2,t,ink,1);
    const k=(t%10)/10;
    g.lbl(c,'Corte',.43*w,.69*h,C.rose,k<.5?clamp(Math.sin(k*TAU)*1.6+.4,0,1):0);
    g.lbl(c,'Lleno',.8*w,.54*h,C.mint,k>=.5?clamp(Math.sin(k*TAU)*-1.6+.4,0,1):0);
  });
  g.birds(2,.1,.1,u*.016,u*.04);
  return g.acts;
};

/* Catastro: mosaico aéreo de predios, linderos y parcela resaltada */
SCENES.catastro=g=>{
  const w=g.w,h=g.h,a=g.a,b=g.b,TAU=g.TAU,r=g.R(61);
  const bg=a.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#D8EBDD');bg.addColorStop(1,'#CBE0D0');a.fillStyle=bg;a.fillRect(0,0,w,h);
  g.i.sky=null;
  const cw=Math.round(clamp(w/4.6,48,120)),ch=Math.round(clamp(h/3.6,44,100)),nc=Math.ceil(w/cw)+1,nr=Math.ceil(h/ch)+1,V=[],cells=[];
  for(let j=0;j<=nr;j++){V[j]=[];for(let i=0;i<=nc;i++)V[j][i]=[i*cw-cw*.4+(r()-.5)*cw*.38,j*ch-ch*.4+(r()-.5)*ch*.38]}
  const cc=['#BFE3C9','#A9D6B8','#E8DDB2','#D8CBA0','#C4E0D0','#B5CFA6','#E9D3B8','#C9D6DE'];
  for(let j=0;j<nr;j++)for(let i=0;i<nc;i++){
    const q=[V[j][i],V[j][i+1],V[j+1][i+1],V[j+1][i]],path=()=>{b.beginPath();q.forEach((p,k)=>k?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.closePath()};
    path();b.fillStyle=cc[(r()*cc.length)|0];b.fill();
    b.save();path();b.clip();
    const th=[0,.5,1.57,2.1][(r()*4)|0],sp=4+r()*3,cx=(q[0][0]+q[2][0])/2,cy=(q[0][1]+q[2][1])/2,dx=Math.cos(th),dy=Math.sin(th);
    b.strokeStyle='rgba(60,90,70,.14)';b.lineWidth=1;b.beginPath();
    for(let s=-140;s<=140;s+=sp){b.moveTo(cx+dx*-140-dy*s,cy+dy*-140+dx*s);b.lineTo(cx+dx*140-dy*s,cy+dy*140+dx*s)}
    b.stroke();b.restore();
    cells.push({q,cx,cy});
  }
  const sin=(x,k,ph)=>Math.sin(x/w*k+ph);
  b.lineCap='round';b.lineJoin='round';
  b.strokeStyle='#A9C7DC';b.lineWidth=Math.max(9,h*.05);b.beginPath();for(let x=-10;x<=w+10;x+=8){const y=h*(.35+.18*sin(x,5.2,1));x<0?b.moveTo(x,y):b.lineTo(x,y)}b.stroke();
  b.strokeStyle='rgba(255,255,255,.45)';b.lineWidth=2;b.beginPath();for(let x=-10;x<=w+10;x+=8){const y=h*(.35+.18*sin(x,5.2,1));x<0?b.moveTo(x,y):b.lineTo(x,y)}b.stroke();
  b.strokeStyle='#F6EEDF';b.lineWidth=3;b.beginPath();for(let x=-10;x<=w+10;x+=8){const y=h*(.74+.07*sin(x,4,2.4));x<0?b.moveTo(x,y):b.lineTo(x,y)}b.stroke();
  b.strokeStyle='rgba(30,45,60,.34)';b.lineWidth=1;
  for(let j=0;j<=nr;j++){b.beginPath();for(let i=0;i<=nc;i++)i?b.lineTo(V[j][i][0],V[j][i][1]):b.moveTo(V[j][i][0],V[j][i][1]);b.stroke()}
  for(let i=0;i<=nc;i++){b.beginPath();for(let j=0;j<=nr;j++)j?b.lineTo(V[j][i][0],V[j][i][1]):b.moveTo(V[j][i][0],V[j][i][1]);b.stroke()}
  const vis=cells.filter(l=>l.cx>w*.12&&l.cx<w*.88&&l.cy>h*.14&&l.cy<h*.86);
  g.add((c,t)=>{
    const sx=wrap(t*34,w+80)-40,sg=c.createLinearGradient(sx-34,0,sx,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(255,255,255,.28)');
    c.fillStyle=sg;c.fillRect(sx-34,0,34,h);c.fillStyle='rgba(91,175,152,.9)';c.fillRect(sx-1,0,1.5,h);
    const k=Math.floor(t/2.2)%vis.length,l=vis[k],pu=.5+.5*Math.sin(t*3);
    c.beginPath();l.q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
    c.fillStyle='rgba(121,194,170,'+(.28+.14*pu).toFixed(2)+')';c.fill();
    c.setLineDash([6,4]);c.lineDashOffset=-t*10;c.strokeStyle='#4FA58E';c.lineWidth=2;c.stroke();c.setLineDash([]);
    l.q.forEach(p=>{c.fillStyle='#fff';c.fillRect(p[0]-3,p[1]-3,6,6);c.strokeStyle='#4FA58E';c.lineWidth=1.2;c.strokeRect(p[0]-3,p[1]-3,6,6)});
    g.lbl(c,'Lt '+String(k+12).padStart(2,'0'),l.cx-20,l.cy,C.mint,clamp(1-Math.abs(((t/2.2)%1)-.5)*2.6,0,1));
    c.fillStyle='rgba(19,32,42,.75)';c.strokeStyle='rgba(19,32,42,.75)';c.lineWidth=1.4;
    c.beginPath();c.moveTo(w-20,34);c.lineTo(w-20,14);c.stroke();c.beginPath();c.moveTo(w-20,9);c.lineTo(w-25,18);c.lineTo(w-15,18);c.closePath();c.fill();
    c.font='600 10px "JetBrains Mono",monospace';c.textAlign='center';c.textBaseline='alphabetic';c.fillText('N',w-20,46);
  });
  return g.acts;
};

/* Replanteo: estación total, topógrafo, prisma y estacas que aparecen en secuencia */
SCENES.replanteo=g=>{
  const w=g.w,h=g.h,u=g.u,P=g.P,TAU=g.TAU,acc=g.H(P.acc);
  g.sky({sun:[.8,.5,.05],hz:.66,clouds:3,cy:[.08,.3]});
  g.ridge({base:.54,amp:.2,seed:51,sharp:true,hz:.55,freq:2.2});
  g.ridge({base:.6,amp:.06,seed:54,c:'mid',hz:.35,freq:3,off:4});
  const gy=g.ground({y:.64,amp:.012,seed:3,hz:.2});
  g.treeline({f:gy,x0:0,x1:1,s:u*.03,seed:8,hz:.35});
  g.birds(3,.12,.14,u*.018,u*.05);
  g.mist({y:.66,h:.08,a:.22});
  const F=[[.5,.72],[.84,.72],[.92,.88],[.4,.88]],ix=.2*w,iy=.86*h,is=u*.19,ps=u*.1;
  g.add((c,t)=>{
    const ink=g.hz(P.ink,0),tt=t%12,step=2.2,cur=Math.min(3,Math.floor(tt/step)),lp=clamp((tt-cur*step)/.9,0,1);
    const prev=cur?F[cur-1]:[.64,.8],tgt=F[cur],q=ease(lp),px=lerp(prev[0],tgt[0],q)*w,py=lerp(prev[1],tgt[1],q)*h;
    const fade=tt>10.6?clamp((12-tt)/1.4,0,1):1,placed=Math.min(4,Math.floor((tt-.9)/step)+1);
    c.globalAlpha=fade;
    c.setLineDash([6,5]);c.lineDashOffset=-t*10;c.strokeStyle=rgba(acc,.9);c.lineWidth=1.4;c.beginPath();
    for(let k=0;k<placed;k++)k?c.lineTo(F[k][0]*w,F[k][1]*h):c.moveTo(F[k][0]*w,F[k][1]*h);
    if(placed>=4&&tt>8.8)c.closePath();c.stroke();c.setLineDash([]);
    for(let k=0;k<placed;k++){
      const pop=clamp((tt-.9-k*step)/.4,0,1),sx=F[k][0]*w,sy=F[k][1]*h,ss=u*(.03+.05*(F[k][1]-.7))*(.4+.6*ease(pop));
      g.stake(c,sx,sy,ss*2.2,'#E8705F',t,k);g.lbl(c,'P'+(k+1),sx+ss*1.8,sy-ss*2.6,C.mint,pop);
    }
    const tx=ix+is*.14,ty=iy-is*.95-is*.27;
    c.setLineDash([3,5]);c.lineDashOffset=-t*18;c.strokeStyle=rgba(acc,.85);c.lineWidth=1.2;c.beginPath();c.moveTo(tx,ty);c.lineTo(px,py-ps*1.68);c.stroke();c.setLineDash([]);
    const pu=(t*.9)%1;c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(lerp(tx,px,pu),lerp(ty,py-ps*1.68,pu),2,0,TAU);c.fill();
    g.totalStation(c,ix,iy,is,ink);g.person(c,ix-is*.55,iy,is*.62,ink,t);g.prism(c,px,py,ps,ink);
    c.globalAlpha=1;
  });
  g.grass(Math.round(w/10),u*.05);
  return g.acts;
};

/* Noche en el campo: franja del pie de página con luciérnagas */
SCENES.noche=g=>{
  const w=g.w,h=g.h,u=Math.max(g.u,h*1.6);
  g.sky({sun:[.82,.3,.05],hz:.78,clouds:2,cy:[.05,.3]});
  g.ridge({base:.62,amp:.34,seed:61,sharp:true,hz:.5,freq:2.2});
  g.ridge({base:.72,amp:.1,seed:64,c:'mid',hz:.3,freq:3.2,off:2});
  const gy=g.ground({y:.8,amp:.02,seed:5,hz:.2});
  g.treeline({f:gy,x0:0,x1:1,s:u*.03,seed:9,hz:.3});
  g.river({y0:.84,y1:1.02,cx:.36,sway:.1,w0:.03,w1:.3,ph:2});
  [.07,.13,.92].forEach((x,k)=>g.palm(x*w,.98*h,u*(.3-k*.03),k*2));
  g.fireflies(Math.round(w/55),.55,.95);
  g.grass(Math.round(w/12),u*.06);
  return g.acts;
};

/* ---------- Montaje, bucle y API ---------- */
const stillNow=i=>!!i.o.still||!MOTION.on;
function build(i){
  const r=i.cv.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);
  if(w<2||h<2)return;
  const dpr=Math.min(window.devicePixelRatio||1,i.o.dpr||1.5);
  i.w=w;i.h=h;i.dpr=dpr;
  [i.cv,i.A,i.B].forEach(c=>{c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)});
  i.ctx=i.cv.getContext('2d');i.a=i.A.getContext('2d');i.b=i.B.getContext('2d');
  [i.ctx,i.a,i.b].forEach(c=>c.setTransform(dpr,0,0,dpr,0,0));
  const pn=typeof i.o.pal==='function'?i.o.pal():(i.o.pal||'dawn');
  i.P=PAL[pn]||PAL.dawn;i.rnd=R((i.o.seed||1)*31+7);i.sky=null;i.last=0;
  i.acts=(SCENES[i.name]||SCENES.llano)(makeG(i))||[];
  render(i,stillNow(i)?STILL:performance.now()/1000);
}
function render(i,t){
  if(!i.w)return;
  const c=i.ctx;
  c.clearRect(0,0,i.w,i.h);
  c.drawImage(i.A,0,0,i.w,i.h);
  if(i.sky){c.save();i.sky(c,t);c.restore()}
  c.drawImage(i.B,0,0,i.w,i.h);
  for(const a of i.acts){c.save();a(c,t);c.restore()}
}
function mount(cv,name,o){
  const i={cv,name,o:o||{},vis:false,last:0,w:0,h:0,A:document.createElement('canvas'),B:document.createElement('canvas'),acts:[],sky:null};
  list.push(i);
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{i.vis=es[0].isIntersecting},{rootMargin:'160px'}).observe(cv);else i.vis=true;
  if('ResizeObserver' in window){let tm;new ResizeObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{const r=cv.getBoundingClientRect();if(Math.round(r.width)!==i.w||Math.round(r.height)!==i.h)build(i)},120)}).observe(cv)}
  build(i);
  return i;
}
function tick(now){
  if(!MOTION.on)return;
  const t=now/1000;
  for(const i of list){
    if(!i.vis||i.o.still||!i.w)continue;
    if(now-i.last<(i.o.fps?1000/i.o.fps:33))continue;
    i.last=now;render(i,t);
  }
}
return{
  mount,tick,list,SCENES,
  rebuild:all=>list.forEach(i=>{if(all||typeof i.o.pal==='function')build(i)}),
  setScene:(i,name,o)=>{i.name=name;if(o)Object.assign(i.o,o);build(i)}
};
})();
LOOP.add(Scape.tick);
document.addEventListener('gf:theme',()=>Scape.rebuild());
