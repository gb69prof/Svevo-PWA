
(function(){
  const menuBtn = document.querySelector('[data-menu-open]');
  const menu = document.querySelector('.menu-panel');
  const closeBtn = document.querySelector('[data-menu-close]');
  function setMenu(open){
    if(!menu) return;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  }
  menuBtn && menuBtn.addEventListener('click', ()=>setMenu(true));
  closeBtn && closeBtn.addEventListener('click', ()=>setMenu(false));
  menu && menu.addEventListener('click', (e)=>{ if(e.target===menu) setMenu(false); });

  document.querySelectorAll('[data-toggle-full]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.getAttribute('data-toggle-full'));
      if(!target) return;
      const open = target.classList.toggle('open');
      btn.textContent = open ? 'Chiudi lezione completa' : 'Lezione completa';
      if(open) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
})();
