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
function metroOpt(f,d,av,de){const P=window.Pathfinder,a=STOPS[f],z=STOPS[d];if(!P||!a||!z||f===d)return null;try{return P.metroOption({name:a.name,lat:a.lat,lng:a.lng},{name:z.name,lat:z.lat,lng:z.lng},av,de)}catch(e){return null}}
const ptLate=n=>n>0?`<span class="pt-bad">${tf('x_ft_late',{n})}</span>`:`<span class="pt-ok">${t('ontime')}</span>`;
const metroRow=o=>`<tr class="pt-metro"><td><span class="pt-rb" style="--c:#d62839">M1</span> ${t('pt_metro')}</td><td>${fmt(o.dep)} – ${fmt(o.arr)}</td><td>${o.minutes} ${t('min')}</td><td>${esc(o.board)} – ${esc(o.alight)}, ≈ ${Math.round(o.costVnd/1000)}k<br>${ptLate(o.late)}</td><td><a class="pt-link" href="https://hcmc-metro.com/trip.php" target="_blank" rel="noopener">${t('pt_site')}</a></td></tr>`;
const ledger=rows=>`<div class="sc"><table class="pt-ledger"><thead><tr><th>${t('x_route')}</th><th>${t('board')} – ${t('arr')}</th><th>${t('ride')}</th><th></th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
const metroOnly=(f,d,av,de)=>{const o=metroOpt(f,d,av,de);return o?`<section class="pt-sec"><h3 class="pt-st">${t('pt_other')}</h3>${ledger(metroRow(o))}</section>`:''};
function pub(){
 const f=$('o').value,d=$('d').value,B=$('pres');pubMap(f,d);
 if(!f||!d||f===d){B.innerHTML=`<div class="card">${t('same')}</div>`;return}
 const av=toMin($('av').value||'07:00'),de=toMin($('de').value||'07:35'),avoid=$('pk').checked;
 if(de<av){B.innerHTML=`<div class="card">${t('x_order')}</div>`;return}
 const c=computeCandidates(f,d,av,de,jamDelayFn);
 if(!c.length){B.innerHTML=`<p class="pt-msg">${t('x_noroute')}</p>`+metroOnly(f,d,av,de);return}
 const G=pickPerRoute(c),rec=chooseBest(G,null,avoid),S=STOPS[f],D=STOPS[d];
 if(!rec){const l=c.filter(x=>x.wait>=0).sort((a,b)=>b.slack-a.slack)[0];
  B.innerHTML=`<section class="pt-sec"><h3 class="pt-st">${t('nobus')}</h3>${l?`<p>${tf('x_closest',{r:l.route.id,b:fmt(l.boardAt),a:fmt(l.arrival),n:Math.round(-l.slack)})}</p>`:''}<p class="mut">${t('x_tryearly')}</p></section>`+metroOnly(f,d,av,de);return}
 let cur=rec;if(PUB.sel){const m=c.find(x=>x.wait>=0&&x.route.id+'|'+x.dep===PUB.sel);if(m)cur=m;else PUB.sel=null}
 const isRec=cur===rec,fl=fitI(cur),best=G.filter(g=>g.best).map(g=>g.best),wp=Math.round(cur.wait/Math.max(cur.total,1)*100);
/* alternate buses: nearest trip of every other route inside the allowed window */
 const alts=G.filter(g=>g.route.id!==cur.route.id).map(g=>g.all.filter(x=>x.wait>=0&&Math.abs(x.slack)<=PUB.tol).sort((a,b)=>Math.abs(a.slack)-Math.abs(b.slack)||a.score-b.score)[0]).filter(Boolean).sort((a,b)=>Math.abs(a.slack)-Math.abs(b.slack)||a.score-b.score);
 const pool=[cur,...alts],mTr=Math.min(...pool.map(x=>x.travel)),mCr=Math.min(...pool.map(x=>x.crowd)),mSl=Math.min(...pool.map(x=>Math.abs(x.slack))),mWt=Math.min(...pool.map(x=>x.wait));
 const tags=x=>{const a=[];if(x.jam===0&&pool.some(y=>y.jam>0))a.push('x_tg_nojam');if(x.travel===mTr&&pool.length>1)a.push('x_tg_fast');if(x.wait===mWt&&pool.length>1)a.push('x_tg_wait');if(x.crowd===mCr&&pool.some(y=>y.crowd>mCr))a.push('x_tg_quiet');if(Math.abs(x.slack)===mSl&&pool.length>1)a.push('x_tg_close');return a.slice(0,3).map(k=>t(k)).join(', ')};
 const rb=(r,big)=>`<span class="pt-rb${big?' big':''}" style="--c:${r.color}">${r.id}</span>`;
 const altRow=x=>{const fi=fitI(x),dl=x.arrival-cur.arrival;return`<tr><td>${rb(x.route)}</td><td>${fmt(x.boardAt)} – ${fmt(x.arrival)}</td><td>${x.travel} ${t('min')}${x.jam?' (+'+x.jam+')':''}</td><td>${tags(x)?tags(x)+'<br>':''}${t('wait')} ${x.wait} ${t('min')}, ${t('crowd').toLowerCase()}: ${t('lv'+x.crowd).toLowerCase()}<br><span class="fit ${fi.cls}">${fi.label}</span>, ${dl===0?t('x_same_arr'):dl<0?tf('x_earlier',{n:-dl}):tf('x_later',{n:dl})}</td><td><button class="pt-link" data-ptrip="${x.route.id}|${x.dep}">${t('choose')}</button></td></tr>`};
 /* urgent: bus reaches the stop within 5 real minutes */
 const left=cur.boardAt-nowM(),urg=left>=0&&left<=5?`<div class="pt-urg"><div><b>${left===0?t('x_ug_now'):tf('x_ug_t',{n:left})}</b><br>${tf('x_ug_p',{r:cur.route.id,s:S.name,t:fmt(cur.boardAt)})}</div><a class="pt-btn" href="${walkL(cur)}" target="_blank" rel="noopener">${t('x_ug_cta')}</a></div>`:'';
 /* stop line with jam notes inline */
 const js=jamsFor(cur.route,cur.fromIdx,cur.toIdx,cur.dep).filter(j=>j.active);
 const stl=cur.route.stops.slice(cur.fromIdx,cur.toIdx+1).map((s,i)=>{const ai=cur.fromIdx+i,sg=js.find(j=>j.at===ai+1);return`<li${sg?' class="slow"':''}><span class="nm">${esc(STOPS[s[0]].name)}</span><time>${fmt(cur.dep+s[1])}</time>${sg?`<small class="pt-jn">${esc(sg.note)}, +${sg.add} ${t('min')}</small>`:''}</li>`}).join('');
 const sr=G.find(g=>g.route.id===cur.route.id),nx=sr&&sr.feasibles.find(x=>x.dep>cur.dep);
 const clean=cur.jam>0?best.filter(x=>x.jam===0&&x.route.id!==cur.route.id).sort((a,b)=>a.score-b.score)[0]:null;
 const jamL=cur.jam>0?`<p class="pt-jp">${tf('x_jm_p',{n:cur.jam,a:fmt(cur.arrival)})} <b>${t('x_jm_alt_h')}</b> ${clean?tf('x_jm_alt',{r:clean.route.id,t:fmt(clean.boardAt),a:fmt(clean.arrival)})+` <button class="pt-link" data-ptrip="${clean.route.id}|${clean.dep}">${tf('x_jm_use',{r:clean.route.id})}</button>`:t('x_jm_none')}</p>`:`<p class="pt-jp">${t('x_jm_clear')}</p>`;
 const bestC=`<section class="pt-trip">
 <div class="pt-lead">${rb(cur.route,1)}<div><h3 class="pt-h">${tf('pt_head',{r:cur.route.id,s:S.name,t:fmt(cur.boardAt),d:D.name,u:fmt(cur.arrival)})}</h3><p class="pt-sub">${cur.toIdx-cur.fromIdx} ${t('x_stops')}, ${tf('x_every',{n:cur.route.headway})}. <span class="fit ${fl.cls}">${fl.label}</span> ${isRec?'':`<button class="pt-link" data-ptrip="">${t('x_back')}</button>`}</p></div></div>
 <div class="pt-grid"><div><ol class="pt-line" style="--c:${cur.route.color}">${stl}</ol>${jamL}</div>
 <div><dl class="pt-facts"><div><dt>${t('wait')}</dt><dd>${cur.wait}<small>${t('min')}</small></dd></div><div><dt>${t('board')}</dt><dd>${fmt(cur.boardAt)}</dd></div><div><dt>${t('ride')}</dt><dd>${cur.travel}<small>${t('min')}${cur.jam?' (+'+cur.jam+')':''}</small></dd></div><div><dt>${t('arr')}</dt><dd>${fmt(cur.arrival)}</dd></div><div><dt>${t('crowd')}</dt><dd>${t('lv'+cur.crowd)}</dd></div></dl>
 <div class="pt-bar" role="img" aria-label="${t('wait')} ${cur.wait}, ${t('ride')} ${cur.travel}">${cur.wait>0?`<i style="width:${wp}%"></i>`:''}<b style="width:${100-wp}%;background:${cur.route.color}"></b></div>
 <p class="pt-why">${whyT(cur,G,avoid)} ${t('x_total')}: <b>${cur.total} ${t('min')}</b>.${nx?` ${t('pt_next')} ${fmt(nx.boardAt)}, ${fmt(nx.arrival)}.`:''}</p>
 <a class="pt-link" target="_blank" rel="noopener" href="${gLink(cur)}">${t('pt_gmaps')}</a></div></div></section>`;
 /* other ways: alternate buses plus Metroline from the same calculation */
 const mo=metroOpt(f,d,av,de),rows=alts.map(altRow).join('')+(mo?metroRow(mo):'');
 const altC=`<section class="pt-sec"><div class="pt-sech"><h3 class="pt-st">${t('pt_other')}</h3><div class="pt-tol" role="group">${[15,30].map(n=>`<button type="button" aria-pressed="${PUB.tol==n}" data-ptol="${n}">±${n} ${t('min')}</button>`).join('')}</div></div><p class="mut">${tf('x_alt_p',{n:PUB.tol,t:fmt(de)})}</p>${rows?ledger(rows):`<p class="mut">${tf('x_alt_none',{n:PUB.tol})}</p>`}</section>`;
 /* timetable */
 const Ld=cur.route.departures,ix=Ld.indexOf(cur.dep),tt=Ld.slice(Math.max(0,ix-2),ix+4).map(dep=>{const jm=jamDelayFn(cur.route,cur.fromIdx,cur.toIdx,dep),bd=dep+cur.route.stops[cur.fromIdx][1],ar=bd+cur.baseTravel+jm,w=bd-av,sl=de-ar,st=dep===cur.dep?`<b>${t('x_chosen')}</b>`:w<0?`<span class="mut">${t('x_gone')}</span>`:sl<0?`<span class="mut">${t('x_late')}</span>`:'';return`<tr${dep===cur.dep?' class="sel"':''}><td>${fmt(bd)}</td><td>${fmt(ar)}</td><td>${w<0?'–':w+' '+t('min')}</td><td>${jm?'+'+jm:'–'}</td><td>${t('lv'+baseLoad(bd))}</td><td>${st}</td></tr>`}).join('');
 const ttC=`<section class="pt-sec"><h3 class="pt-st">${tf('x_tt_h',{r:cur.route.id})}</h3><div class="sc"><table><thead><tr><th>${t('board')}</th><th>${t('arr')}</th><th>${t('wait')}</th><th>${t('x_jam')}</th><th>${t('crowd')}</th><th></th></tr></thead><tbody>${tt}</tbody></table></div></section>`;
 /* all suitable trips, folded away until asked for */
 const feas=c.filter(x=>x.feasible).sort((a,b)=>a.score-b.score||a.boardAt-b.boardAt).slice(0,12);
 const allC=`<details class="pt-sec pt-more"><summary>${t('x_all_h')} (${feas.length})</summary><div class="sc"><table><thead><tr><th>${t('x_route')}</th><th>${t('board')}</th><th>${t('wait')}</th><th>${t('ride')}</th><th>${t('arr')}</th><th>${t('crowd')}</th><th></th></tr></thead><tbody>${feas.map(x=>`<tr${x===cur?' class="sel"':''}><td>${rb(x.route)}</td><td>${fmt(x.boardAt)}</td><td>${x.wait} ${t('min')}</td><td>${x.travel}${x.jam?' (+'+x.jam+')':''}</td><td>${fmt(x.arrival)}</td><td>${t('lv'+x.crowd)}</td><td>${x===cur?'':`<button class="pt-link" data-ptrip="${x.route.id}|${x.dep}">${t('choose')}</button>`}</td></tr>`).join('')}</tbody></table></div></details>`;
 B.innerHTML=urg+bestC+altC+ttC+allC}
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-ptrip]');if(b){PUB.sel=b.dataset.ptrip||null;pub();$('pres').scrollIntoView({behavior:'smooth',block:'start'});return}
 b=e.target.closest('[data-ptol]');if(b){PUB.tol=+b.dataset.ptol;pub();return}
 b=e.target.closest('[data-q]');if(b){const[k,v]=b.dataset.q.split(':');if(k=='av')$('av').value=fmt(nowM()+(+v));else $('de').value=fmt(toMin($('de').value||'07:35')+(+v));if(toMin($('de').value)<toMin($('av').value))$('de').value=fmt(toMin($('av').value)+35);PUB.sel=null;pub()}});
