/* Ad dock: the fixed #adDock slot is filled by ads() like every other .adslot.
   Closing it hides it for the rest of this browser session; a new session shows it again. */
(function(){
  const d=document.getElementById('adDock');if(!d)return;
  try{if(sessionStorage.getItem('pf_adx')){d.dataset.x=1;d.innerHTML=''}}catch(e){}
  d.addEventListener('click',e=>{if(e.target.closest('.promo-close')){try{sessionStorage.setItem('pf_adx','1')}catch(x){}}});
})();
