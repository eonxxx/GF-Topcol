/* =========================================================
   GF Topografías Colombia · Landing
   Fondo: el paisaje del sitio principal (paisajes.js), desenfocado
   con CSS. El tema, los datos de contacto y las curvas de nivel
   vienen de config.js, nucleo.js y fondo.js.
   ========================================================= */
(()=>{
  const light=()=>root.dataset.theme==='light';

  /* Paisaje del fondo: atardecer en modo oscuro, día en modo claro */
  const cv=$('#lpScape');
  if(cv&&typeof Scape!=='undefined'){
    Scape.mount(cv,'llano',{seed:11,hz:(w,h)=>w<760?.6:.64,amp:.85,palmS:.62,sunX:.74,clouds:5,birds:4,riverX:.44,
      palmX:[.84,.9,.78,.1,.04],cows:[[.28,.92,1],[.34,.95,-1],[.66,.93,1]],pal:()=>light()?'day':'dusk',dpr:.6,fps:20});
  }

  /* Menú en el celular */
  const btn=$('.nav .menu'),links=$('#navLinks');
  if(btn&&links){
    const set=o=>{btn.setAttribute('aria-expanded',String(o));btn.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');links.classList.toggle('open',o);root.classList.toggle('menu-open',o)};
    btn.addEventListener('click',e=>{e.stopPropagation();set(btn.getAttribute('aria-expanded')!=='true')});
    links.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
    document.addEventListener('click',e=>{if(!e.target.closest('.nav'))set(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){set(false);btn.focus()}});
  }

})();
