/* =========================================================
   GF Topografías Colombia · Landing
   Paisajes del sitio principal (paisajes.js) en el inicio y en
   cada paso del proceso; barra que se esconde al bajar; menú del
   celular. El tema, los datos de contacto y las curvas de fondo
   vienen de config.js, nucleo.js y fondo.js.
   ========================================================= */
(()=>{
  const light=()=>root.dataset.theme==='light';

  /* Paisajes: el llano en el inicio y una escena por paso (se dibujan al acercarse a la pantalla) */
  if(typeof Scape!=='undefined'){
    const hero=$('#lpScape');
    if(hero)Scape.mount(hero,'llano',{seed:11,hz:(w,h)=>w<760?.5:.6,amp:.85,palmS:.62,sunX:.74,clouds:5,birds:4,riverX:.44,
      palmX:[.84,.9,.78,.96],cows:[[.64,.93,1],[.7,.95,-1]],pal:()=>light()?'day':'dusk',dpr:1,fps:24});
    const campo=$('#scCampo');
    if(campo)Scape.mount(campo,'replanteo',{seed:17,pal:()=>light()?'day':'dawn',dpr:1.25,fps:24});
    const plano=$('#scPlano');
    if(plano)Scape.mount(plano,'catastro',{seed:15,pal:()=>light()?'day':'dawn',dpr:1.25,fps:24});
  }

  /* Barra: se esconde al bajar y vuelve al subir (nunca con el menú abierto ni con el foco adentro) */
  const bar=$('.bar');
  if(bar){
    let last=scrollY,pend=false;
    const ver=()=>{
      pend=false;const y=scrollY,abajo=y>last+4,arriba=y<last-4;
      const ocupada=root.classList.contains('menu-open')||bar.contains(document.activeElement);
      if(abajo&&y>bar.offsetTop+bar.offsetHeight*2&&!ocupada)root.classList.add('bar-oculta');
      else if(arriba||y<=bar.offsetHeight)root.classList.remove('bar-oculta');
      last=y;
    };
    addEventListener('scroll',()=>{if(!pend){pend=true;requestAnimationFrame(ver)}},{passive:true});
    bar.addEventListener('focusin',()=>root.classList.remove('bar-oculta'));
  }

  /* Menú en el celular */
  const btn=$('.bar .menu'),links=$('#navLinks');
  if(btn&&links){
    const set=o=>{btn.setAttribute('aria-expanded',String(o));btn.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');links.classList.toggle('open',o);root.classList.toggle('menu-open',o)};
    btn.addEventListener('click',e=>{e.stopPropagation();set(btn.getAttribute('aria-expanded')!=='true')});
    links.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
    document.addEventListener('click',e=>{if(!e.target.closest('.bar'))set(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){set(false);btn.focus()}});
  }
})();
