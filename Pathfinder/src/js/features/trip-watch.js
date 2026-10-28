/* Trip watch + weather/traffic alerts */
/* ---------- trip watch + alerts ---------- */
const SV={clear:0,fog:2,heat:2,rain:2,heavy:3,storm:3},WI={storm:'⛈️',heavy:'🌧️',rain:'🌦️',heat:'🥵',fog:'🌫️',clear:'☀️'};
let PLAN=null,SIM=null,STAY=0,ALD=new Set(),SEEN=new Set();try{PLAN=JSON.parse(sg('plan','null'))}catch(e){}
const wl=k=>WI[k]+' '+t('wk_'+k).toLowerCase();
function setPlan(f,d,dm,mode){const nh=nowM()/60;PLAN={f,d,dm,mode,at:Date.now(),sv0:SV[wxW(nh).k],lv0:lv(nh)};SIM=null;STAY=0;ss('plan',JSON.stringify(PLAN));try{Notification.requestPermission()}catch(e){}watchDraw();alertsDraw()}
function alertsEval(){const A=[];if(!PLAN)return A;const n=nowM(),left=PLAN.dm-n,nh=n/60,dh=PLAN.dm/60;if(left<-15)return A;
 const ck=SIM||wxW(nh).k,dk=SIM||wxW(dh).k,T=fmt(PLAN.dm),id=x=>PLAN.at+':'+x,L=lv(nh);
 if(SV[ck]>PLAN.sv0)A.push({id:id('chg'+ck),sv:SV[ck]>=3?3:2,title:t('al_chg_t'),body:tf('al_chg_b',{w:wl(ck),f:PLAN.f,d:PLAN.d,t:T})+' '+t('wp_'+ck)+' '+t('wb_'+ck),fx:1});
 else if(left>0&&SV[dk]>SV[ck])A.push({id:id('fc'+dk+PLAN.dm),sv:SV[dk]>=3?3:2,title:t('al_fc_t'),body:tf('al_fc_b',{w:wl(dk),t:T,d:PLAN.d})+' '+t('wp_'+dk),fx:1});
 if(L>PLAN.lv0&&left>-15)A.push({id:id('trf'+L),sv:2,title:t('al_trf_t'),body:tf('al_trf_b',{l:t('lv'+L),t:T}),fx:1});
 if(left>0&&left<=15)A.push({id:id('dep'+PLAN.dm),sv:1,title:t('al_dep_t'),body:tf('al_dep_b',{n:left,d:PLAN.d,w:wl(ck)})});
 return A.filter(a=>!ALD.has(a.id)).sort((a,b)=>b.sv-a.sv)}
function alertsDraw(){const A=alertsEval(),el=$('alerts');A.forEach(a=>{if(SEEN.has(a.id))return;SEEN.add(a.id);nlogAdd(a);toast('⚠ '+a.title);try{if(Notification.permission=='granted')new Notification(a.title,{body:a.body})}catch(e){}});
 const sig=LG+JSON.stringify(A.map(a=>a.id))+A.length;if(el.dataset.s===sig)return;el.dataset.s=sig;
 el.innerHTML=A.length?`<div class="w">${A.slice(0,2).map(a=>`<div class="al s${a.sv}" role="alert"><div><b>${esc(a.title)}</b><p>${esc(a.body)}</p></div><div class="row">${a.fx?`<button class="b" data-v="trip">${t('al_cmp')}</button>`:''}<button class="lnk" data-ald="${esc(a.id)}">${t('al_x')}</button></div></div>`).join('')}</div>`:''}
function watchDraw(){const w=$('watch');if(!w)return;w.innerHTML=`<h3>${t('wt_t')}</h3>`+(PLAN?`<p class="mut">${tf('wt_on',{f:esc(PLAN.f),d:esc(PLAN.d),t:fmt(PLAN.dm)})}</p><div class="row"><button class="b out" data-wstop>${t('wt_stop')}</button><button class="lnk" data-wtest>${t('wt_test')}</button></div>`:`<p class="mut">${t('wt_none')}</p>`)}
function stayUI(){const dm=PLAN?PLAN.dm:nowM(),ev=dm+STAY,k=SIM||wxW(ev/60).k;return`<h3 style="margin-top:18px">${t('st_t')}</h3><div class="row">${[30,45,60,90].map(n=>`<button class="b${STAY==n?'':' out'}" data-st="${n}">${tf('st_m',{n})}</button>`).join('')}</div>`+(STAY?`<div class="v">${tf('st_leave',{t:fmt(ev),w:wl(k)})}</div>`:'')}
document.addEventListener('click',e=>{let b;
 if(b=e.target.closest('[data-ald]')){ALD.add(b.dataset.ald);alertsDraw()}
 if(e.target.closest('[data-wstop]')){PLAN=null;SIM=null;ss('plan','null');watchDraw();alertsDraw()}
 if(e.target.closest('[data-wtest]')){SIM='heavy';alertsDraw();toast(t('al_chg_t'))}
 if(e.target.closest('[data-stay30]')&&PLAN){PLAN.dm+=30;ss('plan',JSON.stringify(PLAN));CAT='din';STAY=30;watchDraw();alertsDraw();show('plan');cats()}
 if(b=e.target.closest('[data-st]')){STAY=+b.dataset.st;cats()}});
$('cmp').addEventListener('click',()=>{const f=$('pF').value,d=$('pT').value;if(f===''||d===''||f===d)return;setPlan(AR[+f][0],AR[+d][0],toMin($('tm').value||fmt(nowM())))});
$('pf').addEventListener('submit',()=>{const L=PV.last;if(L&&L.f&&L.d)setPlan(L.f,L.d,L.st)});
$('go').addEventListener('click',()=>{const o=$('o').value,d=$('d').value;if(o&&d&&o!==d)setPlan(STOPS[o].name,STOPS[d].name,toMin($('av').value))});
setInterval(alertsDraw,30000);
