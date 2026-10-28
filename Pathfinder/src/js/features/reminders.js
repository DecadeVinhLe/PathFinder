/* Reminders and trip food stop */
let REM=JSON.parse(sg('rem','[]'));
function cats(){return;CAT='rem';$('cats').innerHTML='';const B=$('catB'),dst=ADD.d||'Ho Chi Minh City';
if(CAT=='rem'){$('fmap').hidden=true;B.innerHTML=`<div class="f"><label><span>${t('rem_ph')}</span><input id="rtx"></label><label><span>${t('tm')}</span><input type="time" id="rtm"></label><button class="b" id="radd">${t('add')}</button></div>`+(REM.length?REM.map((r,i)=>`<div class="row">⏰ <b>${r.tm}</b> ${esc(r.tx)} <button class="b alt" data-rdel="${i}">×</button></div>`).join(''):`<p class="mut">${t('norem')}</p>`)}
else B.innerHTML=`<div class="row">${FOOD[CAT].map(x=>`<button class="b alt" data-food="${x}">${x}</button>`).join('')}</div><p class="mut">${esc(dst)} · ${t('near')}</p>${CAT=='din'?stayUI():''}`}
document.addEventListener('click',e=>{let b=e.target.closest('[data-cat]');if(b){CAT=b.dataset.cat;cats()}b=e.target.closest('[data-food]');if(b){const f=$('fmap');f.hidden=false;f.src=mapUrl(b.dataset.food+' near '+(ADD.d||'Ho Chi Minh City'))}
if(e.target.id=='radd'&&$('rtx').value&&$('rtm').value){REM.push({tx:$('rtx').value,tm:$('rtm').value,fired:0});ss('rem',JSON.stringify(REM));cats()}b=e.target.closest('[data-rdel]');if(b){REM.splice(+b.dataset.rdel,1);ss('rem',JSON.stringify(REM));cats()}});
setInterval(()=>{const d=new Date(),n=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);REM.forEach(r=>{if(r.tm==n&&r.fired!=n){r.fired=n;toast('⏰ '+r.tx);try{new Notification(r.tx)}catch(e){}}})},15000);
