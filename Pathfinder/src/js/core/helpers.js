/* Shared helpers, state, translator t(), geo maths */
const $=i=>document.getElementById(i),Q=s=>[...document.querySelectorAll(s)],E=encodeURIComponent,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sg=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}},ss=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let LG=sg('lg',/^vi/.test(navigator.language)?'vi':'en'),TH=sg('th','dark'),WX=null,CAT='din',CUR='home',ADD={};
const t=k=>K[LG][k]||K.en[k]||k,toast=m=>{const e=$('toast');e.textContent=m;e.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display='none',2800)};
const FOOD={din:['Phở','Cơm tấm','Bún bò','Hủ tiếu'],take:['Cơm hộp','Gỏi cuốn','Bún trộn','Cơm gà'],drk:['Cà phê','Trà sữa','Nước ép','Trà đào']};
function mapUrl(q,o,d,fl,z){const l='&hl='+LG;return o&&d?'https://www.google.com/maps?output=embed&saddr='+E(o)+'&daddr='+E(d)+(fl?'&dirflg='+fl:'')+l:'https://www.google.com/maps?output=embed&q='+E(q||'Ho Chi Minh City')+(z?'&z='+z:'')+l}
function setSrc(el,u){if(el.getAttribute('src')!==u)el.src=u}
const hav=(a,b,c,d)=>{const r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,s=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(s))};
const near=(la,ln)=>{let b=null;for(const k in STOPS){const d=hav(la,ln,STOPS[k].lat,STOPS[k].lng);if(!b||d<b.d)b={d,k}}return b};
const lv=h=>h>=16.5&&h<19?3:h>=7&&h<9?2:h>=11.5&&h<13?2:h>=22||h<5?0:1,PM=h=>[22.5,31.9,35.3,40.5][lv(h)],IDX=[22,46,64,87];
const hour=()=>{const v=($('tm').value||'07:30').split(':');return +v[0]+v[1]/60};
