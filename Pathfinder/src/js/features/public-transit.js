/* Public transit page: best trip + alternate buses */
/* public transit (native engine) */
function pubMap(f,d){const el=$('pubmap');if(f&&d&&f!==d)setSrc(el,mapUrl('',STOPS[f].lat+','+STOPS[f].lng,STOPS[d].lat+','+STOPS[d].lng,'r'));else if(f)setSrc(el,mapUrl(STOPS[f].lat+','+STOPS[f].lng+'('+STOPS[f].name+')','','','',14))}
/* ---------- public transit: best trip + alternate buses ---------- */
const tf=(k,o)=>t(k).replace(/\{(\w+)\}/g,(m,x)=>o[x]);
const nowM=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const PUB={sel:null,tol:30};
function fitI(c){
 if(!c.feasible){if(c.wait<0)return{cls:'fit-off',label:t('x_ft_missed')};return{cls:'fit-bad',label:tf('x_ft_late',{n:-c.slack})}}
 if(c.wait===0)return{cls:'fit-perfect',label:t('x_ft_now')};
 if(c.slack<=2)return{cls:'fit-perfect',label:t('x_ft_tight')};
 if(c.wait<=5)return{cls:'fit-ok',label:t('x_ft_short')};
 return{cls:'fit-early',label:tf('x_ft_early',{n:c.slack})}}
function whyT(c,G,avoid){const F=G.filter(g=>g.best).map(g=>g.best),b=[];
 if(c.wait===Math.min(...F.map(x=>x.wait)))b.push(t('x_rs_wait'));
 if(avoid&&!c.peak)b.push(t('x_rs_quiet'));
 if(c.total===Math.min(...F.map(x=>x.total)))b.push(t('x_rs_total'));
 if(!b.length)b.push(t('x_rs_bal'));
 return t('x_why')+' '+b.join(' · ')+'.'}
const gLink=c=>{const a=STOPS[c.route.stops[c.fromIdx][0]],z=STOPS[c.route.stops[c.toIdx][0]];return'https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',origin:a.lat+','+a.lng,destination:z.lat+','+z.lng,travelmode:'transit'})};
const walkL=c=>{const s=STOPS[c.route.stops[c.fromIdx][0]];return'https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',destination:s.lat+','+s.lng,travelmode:'walking'})};
function pub(){
 const f=$('o').value,d=$('d').value,B=$('pres');pubMap(f,d);
 if(!f||!d||f===d){B.innerHTML=`<div class="card">${t('same')}</div>`;return}
 const av=toMin($('av').value||'07:00'),de=toMin($('de').value||'07:35'),avoid=$('pk').checked;
 if(de<av){B.innerHTML=`<div class="card">${t('x_order')}</div>`;return}
 const c=computeCandidates(f,d,av,de,jamDelayFn);
 if(!c.length){B.innerHTML=`<div class="card">${t('x_noroute')}</div>`;return}
 const G=pickPerRoute(c),rec=chooseBest(G,null,avoid),S=STOPS[f],D=STOPS[d];
 if(!rec){const l=c.filter(x=>x.wait>=0).sort((a,b)=>b.slack-a.slack)[0];
  B.innerHTML=`<div class="card"><h3>${t('nobus')}</h3>${l?`<p>${tf('x_closest',{r:l.route.id,b:fmt(l.boardAt),a:fmt(l.arrival),n:-l.slack})}</p>`:''}<p class="mut">${t('x_tryearly')}</p></div>`;return}
 let cur=rec;if(PUB.sel){const m=c.find(x=>x.wait>=0&&x.route.id+'|'+x.dep===PUB.sel);if(m)cur=m;else PUB.sel=null}
 const isRec=cur===rec,fl=fitI(cur),best=G.filter(g=>g.best).map(g=>g.best),wp=Math.round(cur.wait/Math.max(cur.total,1)*100);
 /* alternate buses: nearest trip of every other route inside the allowed window */
 const alts=G.filter(g=>g.route.id!==cur.route.id).map(g=>g.all.filter(x=>x.wait>=0&&Math.abs(x.slack)<=PUB.tol).sort((a,b)=>Math.abs(a.slack)-Math.abs(b.slack)||a.score-b.score)[0]).filter(Boolean).sort((a,b)=>Math.abs(a.slack)-Math.abs(b.slack)||a.score-b.score);
 const pool=[cur,...alts],mTr=Math.min(...pool.map(x=>x.travel)),mCr=Math.min(...pool.map(x=>x.crowd)),mSl=Math.min(...pool.map(x=>Math.abs(x.slack))),mWt=Math.min(...pool.map(x=>x.wait));
 const tags=x=>{const a=[];if(x.jam===0&&pool.some(y=>y.jam>0))a.push('x_tg_nojam');if(x.travel===mTr&&pool.length>1)a.push('x_tg_fast');if(x.wait===mWt&&pool.length>1)a.push('x_tg_wait');if(x.crowd===mCr&&pool.some(y=>y.crowd>mCr))a.push('x_tg_quiet');if(Math.abs(x.slack)===mSl&&pool.length>1)a.push('x_tg_close');return a.slice(0,3).map(k=>`<span class="tg">${t(k)}</span>`).join('')};
 const altCard=x=>{const fi=fitI(x),dl=x.arrival-cur.arrival;return`<div class="alt-i"><div class="alt-h"><span class="rb" style="background:${x.route.color}">${x.route.id}</span><div style="flex:1;min-width:120px"><b>${t('x_route')} ${x.route.id}</b><div class="mut">${fmt(x.boardAt)} → ${fmt(x.arrival)} · ${x.travel} ${t('min')}</div></div><span class="fit ${fi.cls}">${fi.label}</span></div><div class="tgs">${tags(x)}</div><div class="mut">${t('wait')} ${x.wait} ${t('min')} · ${t('crowd')}: ${t('lv'+x.crowd)}${x.jam?' · ⚠ +'+x.jam:''}<br>${dl===0?t('x_same_arr'):dl<0?tf('x_earlier',{n:-dl}):tf('x_later',{n:dl})}</div><button class="b out" data-ptrip="${x.route.id}|${x.dep}">${t('choose')}</button></div>`};
 /* urgent: bus reaches the stop within 5 real minutes */
 const left=cur.boardAt-nowM(),urg=left>=0&&left<=5?`<div class="urg"><span style="font-size:1.8rem">🚶</span><div style="flex:1 1 220px"><b>${left===0?t('x_ug_now'):tf('x_ug_t',{n:left})}</b><br>${tf('x_ug_p',{r:cur.route.id,s:S.name,t:fmt(cur.boardAt)})}</div><a class="b" href="${walkL(cur)}" target="_blank" rel="noopener">${t('x_ug_cta')}</a></div>`:'';
 /* best card */
 const stl=cur.route.stops.slice(cur.fromIdx,cur.toIdx+1).map((s,i)=>{const ai=cur.fromIdx+i,j=i>0&&cur.route.jamSegments.some(z=>z.at===ai);return`<li><span>${esc(STOPS[s[0]].name)}${j?' ⚠':''}</span><time>${fmt(cur.dep+s[1])}</time></li>`}).join('');
 const sr=G.find(g=>g.route.id===cur.route.id),nx=sr&&sr.feasibles.find(x=>x.dep>cur.dep);
 const bestC=`<div class="card"><div class="alt-h"><span class="rb" style="background:${cur.route.color}">${cur.route.id}</span><div style="flex:1;min-width:180px"><h3 style="margin:0">${S.name} → ${D.name}</h3><div class="mut">${t('x_route')} ${cur.route.id} · ${cur.toIdx-cur.fromIdx} ${t('x_stops')} · ${tf('x_every',{n:cur.route.headway})}</div></div><span class="fit ${fl.cls}">${fl.label}</span></div>
 <div class="chips">${isRec?`<span class="tg">⭐ ${t('x_reco')}</span>`:`<span class="tg">${t('x_chosen')}</span><button class="b out" style="min-height:36px;padding:4px 14px;font-size:.85rem" data-ptrip="">${t('x_back')}</button>`}</div>
 <div class="stats"><div class="stat hl"><span>${t('wait')}</span><strong>${cur.wait}<small>${t('min')}</small></strong></div><div class="stat"><span>${t('board')}</span><strong>${fmt(cur.boardAt)}</strong></div><div class="stat"><span>${t('ride')}</span><strong>${cur.travel}<small>${t('min')}${cur.jam?' (+'+cur.jam+')':''}</small></strong></div><div class="stat"><span>${t('arr')}</span><strong>${fmt(cur.arrival)}</strong></div></div>
 <div class="tl">${cur.wait>0?`<div class="tl-w" style="width:${wp}%">${t('wait')} ${cur.wait}</div>`:''}<div class="tl-r" style="width:${100-wp}%;background:${cur.route.color}">${t('ride')} ${cur.travel}</div></div>
 <div class="note">💡 ${whyT(cur,G,avoid)} ${t('x_total')}: <b>${cur.total} ${t('min')}</b> · ${t('crowd')}: <b>${t('lv'+cur.crowd)}</b></div>
 <div class="chips">${cur.peak?`<span class="chip">🔶 ${t('lv3')}</span>`:''}${nx?`<span class="chip">→ ${fmt(nx.boardAt)} · ${fmt(nx.arrival)}</span>`:''}<a class="b out" style="margin-left:auto;min-height:40px;padding:6px 16px" target="_blank" rel="noopener" href="${gLink(cur)}">${t('x_gmaps')}</a></div>
 <ul class="stl" style="--c:${cur.route.color}">${stl}</ul></div>`;
 /* jam alert with a jam-free alternate */
 const js=jamsFor(cur.route,cur.fromIdx,cur.toIdx,cur.dep).filter(j=>j.active),clean=cur.jam>0?best.filter(x=>x.jam===0&&x.route.id!==cur.route.id).sort((a,b)=>a.score-b.score)[0]:null;
 const jamC=cur.jam>0?`<div class="jam"><h3>⚠ ${tf('x_jm_t',{r:cur.route.id})}</h3><p style="margin:0 0 6px">${tf('x_jm_p',{n:cur.jam,a:fmt(cur.arrival)})}</p>${js.map(j=>`<div class="jam-seg"><span class="sev ${j.sev}">${t('x_sev_'+j.sev)}</span><span>${esc(j.note)} · ${fmt(j.segStart)}</span><b style="margin-left:auto">+${j.add} ${t('min')}</b></div>`).join('')}<p style="margin:12px 0 0"><b>${t('x_jm_alt_h')}</b> ${clean?tf('x_jm_alt',{r:clean.route.id,t:fmt(clean.boardAt),a:fmt(clean.arrival)}):t('x_jm_none')}</p>${clean?`<button class="b" style="margin-top:10px" data-ptrip="${clean.route.id}|${clean.dep}">${tf('x_jm_use',{r:clean.route.id})}</button>`:''}</div>`:`<div class="card ok-card"><b>✅ ${t('x_jm_clear')}</b></div>`;
 /* alternates card */
 const altC=`<div class="card"><h3>🔀 ${t('x_alt_h')}</h3><p class="mut">${tf('x_alt_p',{n:PUB.tol,t:fmt(de)})}</p><div class="tabs">${[15,30].map(n=>`<button class="b" aria-pressed="${PUB.tol==n}" data-ptol="${n}">±${n} ${t('min')}</button>`).join('')}</div>${alts.length?`<div class="altg">${alts.map(altCard).join('')}</div>`:`<p class="mut">${tf('x_alt_none',{n:PUB.tol})}</p>`}</div>`;
 /* timetable */
 const Ld=cur.route.departures,ix=Ld.indexOf(cur.dep),tt=Ld.slice(Math.max(0,ix-2),ix+4).map(dep=>{const jm=jamDelayFn(cur.route,cur.fromIdx,cur.toIdx,dep),bd=dep+cur.route.stops[cur.fromIdx][1],ar=bd+cur.baseTravel+jm,w=bd-av,sl=de-ar,st=dep===cur.dep?`<span class="tg">${t('x_chosen')}</span>`:w<0?`<span class="mut">${t('x_gone')}</span>`:sl<0?`<span class="mut">${t('x_late')}</span>`:'';return`<tr${dep===cur.dep?' class="sel"':''}><td>${fmt(bd)}</td><td>${fmt(ar)}</td><td>${w<0?'–':w+' '+t('min')}</td><td>${jm?'+'+jm:'–'}</td><td>${t('lv'+baseLoad(bd))}</td><td>${st}</td></tr>`}).join('');
 const ttC=`<div class="card"><h3>${tf('x_tt_h',{r:cur.route.id})}</h3><div class="sc"><table><tr><th>${t('board')}</th><th>${t('arr')}</th><th>${t('wait')}</th><th>${t('x_jam')}</th><th>${t('crowd')}</th><th></th></tr>${tt}</table></div></div>`;
 /* all suitable trips */
 const feas=c.filter(x=>x.feasible).sort((a,b)=>a.score-b.score||a.boardAt-b.boardAt).slice(0,12);
 const allC=`<div class="card"><h3>${t('x_all_h')}</h3><p class="mut">${tf('x_all_p',{n:feas.length})}</p><div class="sc"><table><tr><th>#</th><th>${t('board')}</th><th>${t('wait')}</th><th>${t('ride')}</th><th>${t('arr')}</th><th>${t('crowd')}</th><th></th></tr>${feas.map(x=>`<tr${x===cur?' class="sel"':''}><td><b style="color:${x.route.color}">●</b> ${x.route.id}</td><td>${fmt(x.boardAt)}</td><td>${x.wait} ${t('min')}</td><td>${x.travel}${x.jam?' (+'+x.jam+')':''}</td><td>${fmt(x.arrival)}</td><td>${t('lv'+x.crowd)}</td><td>${x===cur?'':`<button class="b out" style="min-height:38px;padding:4px 12px" data-ptrip="${x.route.id}|${x.dep}">${t('choose')}</button>`}</td></tr>`).join('')}</table></div></div>`;
 B.innerHTML=urg+bestC+jamC+altC+ttC+allC}
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-ptrip]');if(b){PUB.sel=b.dataset.ptrip||null;pub();$('pres').scrollIntoView({behavior:'smooth',block:'start'});return}
 b=e.target.closest('[data-ptol]');if(b){PUB.tol=+b.dataset.ptol;pub();return}
 b=e.target.closest('[data-q]');if(b){const[k,v]=b.dataset.q.split(':');if(k=='av')$('av').value=fmt(nowM()+(+v));else $('de').value=fmt(toMin($('de').value||'07:35')+(+v));if(toMin($('de').value)<toMin($('av').value))$('de').value=fmt(toMin($('av').value)+35);PUB.sel=null;pub()}});
