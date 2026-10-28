/* Scroll reveal for home sections */
/* ---------- scroll reveal ---------- */
(function(){const els=[...document.querySelectorAll('.live .card,#feats .card,#svb,#v-home .sec-h,#v-home .lead,.cta,.band.ad .adslot')];if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
els.forEach((e,i)=>{e.classList.add('rv');e.style.setProperty('--d',(i%3)*.08+'s');io.observe(e)});setTimeout(()=>els.forEach(e=>e.classList.add('in')),4000)})();
