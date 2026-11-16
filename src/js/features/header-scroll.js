/* Header: shadow once the page scrolls, tap the scrim to close the sheet, reset on resize to desktop */
(function(){const h=document.getElementById('hd');if(!h)return;
const f=()=>h.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',f,{passive:true});f();
h.addEventListener('click',e=>{if(e.target===h&&typeof setMenu=='function')setMenu(false)});
addEventListener('resize',()=>{if(innerWidth>=1024&&typeof setMenu=='function')setMenu(false)})})();
