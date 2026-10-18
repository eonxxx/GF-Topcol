/* =========================================================
   GF Topografías · Fondo animado de curvas de nivel
   Un canvas fijo (#topo) dibuja un terreno que cambia solo,
   detrás de todo el contenido. En el inicio las curvas son
   intensas y bajando la página quedan suaves. No hay que
   activarlo: arranca al abrir la página. El interruptor de
   animación del encabezado lo pausa.
   ========================================================= */
const Fondo=(()=>{
  const cv=$('#topo');
  if(!cv)return{pointer(){},valueAt(){return 0},redraw(){}};
  const fuerte=cv.hasAttribute('data-fuerte');   // páginas internas: curvas intensas en toda la página
  const hero=$('#inicio');
  const STEP=.028;   // separación entre curvas: pequeña = muchas curvas
  const PAR=.45;     // las curvas se desplazan a 45 % de la velocidad del scroll
  let ctx,w=0,h=0,cs=16,cols=0,rows=0,g=null,T=0,last=0,lastDraw=0,dirty=true,heroH=1,off=0;
  const m={x:0,y:0,tx:0,ty:0,k:0,on:false};

  /* Ruido 2D suave */
  const hash=(i,j)=>{let x=Math.imul(i,374761393)+Math.imul(j,668265263)|0;x=Math.imul(x^(x>>>13),1274126177);return((x^(x>>>16))>>>0)/4294967296};
  const vn=(x,y)=>{
    const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
  };
  /* Colinas del inicio (en altos de pantalla) */
  const hills=[
    {fx:.74,fy:.42,a:.42,r:.20,ph:0},{fx:.90,fy:.74,a:.30,r:.14,ph:1.7},{fx:.58,fy:.80,a:.22,r:.16,ph:3.1},
    {fx:.30,fy:.26,a:.20,r:.18,ph:4.6},{fx:.10,fy:.72,a:-.18,r:.16,ph:2.2},{fx:.52,fy:.16,a:-.16,r:.14,ph:5.4}
  ];
  /* Altura del terreno en (X,Y), con X e Y medidos en altos de pantalla */
  function field(X,Y,t,asp){
    let v=.1+vn(X*1.15+t*.000016,Y*1.15-t*.000011)*.62
            +vn(X*2.3-t*.00002+7.1,Y*2.3+t*.000014-3.3)*.28
            +vn(X*4.6+11.3,Y*4.6-5.9+t*.00002)*.1;
    const hw=hero?clamp(1.5-Y,0,1):0;
    if(hw>0){
      let hv=.46;
      for(const p of hills){
        const cx=p.fx*asp+.035*Math.sin(t*.00006+p.ph),cy=p.fy+.03*Math.cos(t*.00005+p.ph*1.3),dx=X-cx,dy=Y-cy;
        hv+=p.a*Math.exp(-(dx*dx+dy*dy)/(2*p.r*p.r));
      }
      hv+=.045*Math.sin(X*5+Y*3+t*.00018)+.028*Math.sin(X*9-Y*4-t*.00014);
      v=lerp(v,hv,hw);
    }
    if(m.k>.01){const dx=X-m.x/h,dy=Y-(m.y+off)/h;v+=.34*m.k*Math.exp(-(dx*dx+dy*dy)/(2*.011))}
    return v;
  }

  function resize(){
    const r=cv.getBoundingClientRect(),W=Math.round(r.width),Hh=Math.round(r.height);
    if(W<2||Hh<2)return;
    if(ctx&&W===w&&Hh===h){heroH=hero?hero.offsetHeight:h;return}
    w=W;h=Hh;
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
    ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    cs=clamp(Math.round(Math.min(w,h)/34),12,22);cols=Math.ceil(w/cs);rows=Math.ceil(h/cs);
    g=new Float32Array((cols+1)*(rows+1));
    heroH=hero?hero.offsetHeight:h;dirty=true;draw();
  }

  function draw(){
    if(!ctx)return;
    const sy=window.scrollY||0,asp=w/h,st=cols+1;
    off=MOTION.on?sy*PAR:0;
    let lo=Infinity,hi=-Infinity;
    for(let j=0;j<=rows;j++){
      const Y=(j*cs+off)/h;
      for(let i=0;i<=cols;i++){const v=field(i*cs/h,Y,T,asp);g[j*st+i]=v;if(v<lo)lo=v;if(v>hi)hi=v}
    }
    ctx.clearRect(0,0,w,h);
    const light=root.dataset.theme==='light';
    const f=fuerte?.35:(hero?clamp(sy/(heroH*.85),0,1):1);
    const amin=lerp(.34,light?.16:.13,f),amaj=lerp(.8,light?.32:.27,f);
    const G={g,cols,rows,cs};
    ctx.lineCap='round';ctx.lineJoin='round';
    for(let k=Math.ceil(lo/STEP);k*STEP<=hi;k++){
      const L=k*STEP,major=(k%5===0);
      ctx.strokeStyle=rgba(mix(HERO.a,HERO.b,clamp((L-.15)/.95,0,1)),major?amaj:amin);
      ctx.lineWidth=major?1.6:1;
      ctx.beginPath();traceLevel(ctx,G,L);ctx.stroke();
    }
    if(m.k>.02){
      const gr=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,150);
      gr.addColorStop(0,rgba(HERO.a,.18*m.k));gr.addColorStop(1,rgba(HERO.a,0));
      ctx.fillStyle=gr;ctx.fillRect(m.x-150,m.y-150,300,300);
      ctx.strokeStyle=rgba(HERO.dot,.55*m.k);ctx.lineWidth=1;ctx.beginPath();ctx.arc(m.x,m.y,9,0,6.283);ctx.stroke();
      cross(ctx,m.x,m.y,15,rgba(HERO.dot,.5*m.k));
    }
    dirty=false;
  }

  function tick(now){
    const dt=Math.min(64,now-(last||now));last=now;
    const moving=Math.abs(m.tx-m.x)>.3||Math.abs(m.ty-m.y)>.3||Math.abs((m.on?1:0)-m.k)>.01;
    m.x+=(m.tx-m.x)*.14;m.y+=(m.ty-m.y)*.14;m.k+=((m.on?1:0)-m.k)*.1;
    if(MOTION.on){
      T+=dt;
      if(now-lastDraw<(w<760?42:33))return;   // ~24-30 cuadros por segundo
    }else if(!dirty&&!moving)return;
    lastDraw=now;draw();
  }

  /* El cursor levanta una pequeña colina (solo en el inicio) */
  function pointer(x,y,on){m.tx=x;m.ty=y;if(on&&!m.on){m.x=x;m.y=y}m.on=on;dirty=true}
  function valueAt(x,y){return field(x/h,(y+off)/h,T,w/h)}

  let rt;
  addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(resize,120)});
  addEventListener('scroll',()=>{dirty=true},{passive:true});
  addEventListener('load',()=>{heroH=hero?hero.offsetHeight:h;dirty=true});
  document.addEventListener('gf:theme',()=>{dirty=true;draw()});
  document.addEventListener('gf:motion',()=>{dirty=true;draw()});
  resize();
  LOOP.add(tick);
  return{pointer,valueAt,redraw:draw};
})();
