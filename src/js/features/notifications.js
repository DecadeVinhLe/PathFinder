/* Notification bell */
/* ---------- notification bell ---------- */
Object.assign(K.en,{bell_t:'Notifications',bell_none:'No notifications yet. Alerts about your trip will appear here.',bell_clear:'Clear all'});
Object.assign(K.vi,{bell_t:'Thông báo',bell_none:'Chưa có thông báo. Cảnh báo về chuyến đi của bạn sẽ hiện ở đây.',bell_clear:'Xóa tất cả'});
let NL=[];try{NL=JSON.parse(sg('nlog','[]'))}catch(e){}
const nsave=()=>ss('nlog',JSON.stringify(NL.slice(0,30)));
function nlogAdd(a){if(NL.some(x=>x.id==a.id))return;NL.unshift({id:a.id,sv:a.sv,title:a.title,body:a.body,ts:Date.now(),r:0});nsave();bellDraw()}
function bellDraw(){const u=NL.filter(x=>!x.r).length,n=$('bellN');n.hidden=!u;n.textContent=u>9?'9+':u;
 $('bellP').innerHTML=`<div class="bh"><b>${t('bell_t')}</b>${NL.length?`<button class="b out" data-nclear>${t('bell_clear')}</button>`:''}</div>`+(NL.length?NL.map(x=>`<div class="bi s${x.sv}"><b>${esc(x.title)}</b><p>${esc(x.body)}</p><small>${new Date(x.ts).toTimeString().slice(0,5)}</small></div>`).join(''):`<p class="mut bn">${t('bell_none')}</p>`)}
$('bellB').onclick=e=>{e.stopPropagation();const p=$('bellP'),o=p.hidden;p.hidden=!o;$('bellB').setAttribute('aria-expanded',o);if(o){NL.forEach(x=>x.r=1);nsave();bellDraw()}};
document.addEventListener('click',e=>{if(e.target.closest('[data-nclear]')){NL=[];nsave();bellDraw()}else if(!e.target.closest('#bellP')&&!e.target.closest('#bellB')){$('bellP').hidden=true;$('bellB').setAttribute('aria-expanded',false)}});
