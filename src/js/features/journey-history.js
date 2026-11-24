/* Recent journeys.
   Always kept in this browser (localStorage). If the visitor opts in, they are also mirrored to the
   server-side NoSQL document store (/api/store, see netlify/server/doc-store.mjs).
   journey.js keeps its state private and announces every plan or choice with a "pf:journey" event;
   this file only listens to that event, so the two can never get in each other's way. */
(function(){
 const KEY='pf_recent',SYNC='pf_sync',MAX=8;
 const api=(m,p,b)=>fetch('/api/store/'+p,{method:m,credentials:'same-origin',headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined}).then(r=>r.ok?r.json():Promise.reject(r.status));
 const load=()=>{try{const a=JSON.parse(sg(KEY,'[]'));return Array.isArray(a)?a:[]}catch(e){return[]}};
 const kOf=j=>(j.from+'|'+j.to).toLowerCase();
 const merge=(a,b)=>{const m=new Map();[...a,...b].sort((x,y)=>(x.ts||0)-(y.ts||0)).forEach(j=>m.set(kOf(j),j));return[...m.values()].sort((x,y)=>(y.ts||0)-(x.ts||0)).slice(0,MAX)};
 const synced=()=>sg(SYNC,'0')==='1';
 let list=load();
 const keep=()=>ss(KEY,JSON.stringify(list));
 const ok=j=>j&&typeof j.from==='string'&&typeof j.to==='string'&&j.from&&j.to;

 window.jhDraw=function(){
  const box=$('tRecent');if(!box)return;
  list=list.filter(ok);box.hidden=!list.length&&!synced();
  $('tRecentL').innerHTML=list.map((j,i)=>`<button type="button" class="b out" data-jh="${i}" title="${esc(j.from)} → ${esc(j.to)}">${esc(j.from)} → ${esc(j.to)}</button>`).join('');
  $('tSync').checked=synced();
 };

 document.addEventListener('pf:journey',e=>{
  const d=e.detail||{};if(!ok(d))return;
  const entry={from:String(d.from).slice(0,150),to:String(d.to).slice(0,150),time:/^\d\d:\d\d$/.test(d.time)?d.time:'',arr:!!d.arr,pick:/^(bike|car|pub|mix|j:[\w:.-]{1,40})$/.test(d.pick||'')?d.pick:'',ts:Date.now()};
  list=merge([entry],list);keep();jhDraw();
  if(synced())api('POST','journeys',{from:entry.from,to:entry.to,time:entry.time,arr:entry.arr,...(entry.pick?{pick:entry.pick}:{})}).catch(()=>{});
 });

 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-jh]');if(!b)return;
  const j=list[+b.dataset.jh];if(!j)return;
  $('tFr').value=j.from;$('tTo').value=j.to;$('tAr').value=j.arr&&j.time?j.time:'';
  $('tripF').requestSubmit();
 });

 $('tClear').onclick=()=>{list=[];keep();jhDraw();if(synced())api('DELETE','me').catch(()=>{})};

 $('tSync').onchange=async()=>{
  if(!$('tSync').checked){ss(SYNC,'0');jhDraw();return}
  try{
   for(const j of [...list].reverse())await api('POST','journeys',{from:j.from,to:j.to,time:j.time||'',arr:!!j.arr,...(j.pick?{pick:j.pick}:{})});
   const d=await api('GET','me');ss(SYNC,'1');list=merge(list,(d.journeys||[]).filter(ok));keep();jhDraw();
  }catch(err){ss(SYNC,'0');$('tSync').checked=false;toast(t('hist_unavail'))}
 };

 if(synced())api('GET','me').then(d=>{list=merge(list,(d.journeys||[]).filter(ok));keep();jhDraw()}).catch(()=>{});
 jhDraw();
})();
