/* Journey planner + window.Pathfinder bridge (provider registry, multimodal engine, UI).
   Kept as one IIFE because the engine and the UI share private state. */
/* =========================================================
   Pathfinder bridge: provider registry + multimodal journey engine
   Contract: window.Pathfinder  (schema "pathfinder.journey/1")
   Providers are synchronous so the engine stays predictable; an app that
   needs async data fetches first, then calls Pathfinder.register(...).
   ========================================================= */
(()=>{
const SCHEMA='pathfinder.journey/1',RAIN=['rain','heavy','storm'],R1=x=>Math.round(x*10)/10,pad=n=>('0'+n).slice(-2);
const EV={},PROV={},PN={};let NETS=[],NODES={},LINES=[],XF={},NL={};
const emit=(e,d)=>{(EV[e]||[]).forEach(f=>{try{f(d)}catch(x){console.error(x)}});try{dispatchEvent(new CustomEvent('pathfinder:'+e,{detail:d}))}catch(x){}};
const nm=o=>o?(typeof o.name=='object'?(o.name[LG]||o.name.en||o.name.vi):o.name):'';
const vn=v=>/^(bike|motor)/.test(v||'')?'bike':v=='car'?'car':'none';

/* ---------- default (sample) providers ---------- */
const DEF={
 geocode:{resolve(s){const gc=(window.__GEOC||{})[String(typeof s=='string'?s:'').trim().toLowerCase()];if(gc)return{name:gc.name,lat:gc.lat,lng:gc.lng};if(s&&typeof s=='object'&&isFinite(s.lat)&&isFinite(s.lng))return{name:s.name||s.lat+','+s.lng,lat:+s.lat,lng:+s.lng};
  const m=/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(String(s||''));if(m)return{name:m[1]+','+m[2],lat:+m[1],lng:+m[2]};
  const q=nrm(String(s||'')),p=findPl(String(s||''))||(q.length>=3?PLX().find(x=>x.all.some(n=>nrm(n).includes(q))):null);return p?{name:p.n,lat:p.lat,lng:p.lng}:null}},
 weather:{at({minute}){const w=wxW(minute/60);return{kind:w.k,tempC:w.tp==='–'?null:w.tp,rainPct:w.p,icon:w.ic}}},
 traffic:{speedKmh({mode,minute,rain}){const q=PM(minute/60)*(rain?1.15:1),b=600/q;return /bike/.test(mode)?b*1.05:b},level:m=>lv(m/60)},
 parking:{info(node,veh,minute){if(!node)return{ok:true,fee:veh=='car'?30000:5000,minutes:veh=='car'?7:3,source:'sample'};
  const p=node.park&&node.park[veh];return p?{ok:true,fee:p.fee,minutes:veh=='car'?6:3,source:'sample',fullRisk:veh=='car'&&minute>=420&&minute<570}:{ok:false}}},
 ridehail:{quote({km,minute,kind}){const l=lv(minute/60),rn=RAIN.includes(DEF.weather.at({minute}).kind),sur=l>=3?1.25:l==2?1.1:1,b=kind=='bike';
  return{waitMin:Math.round((b?3:5)+(l>=3?4:l==2?2:0)+(rn?3:0)),costVnd:Math.round(Math.max(b?12000:20000,km*(b?4500:6600)*sur)/1000)*1000,provider:'estimate'}}}
};
['geocode','weather','traffic','parking','ridehail'].forEach(k=>PN[k]='built-in sample');
const prov=k=>Object.assign({},DEF[k],PROV[k]);
const W=(min,lat,lng)=>prov('weather').at({lat,lng,minute:Math.round(min)});
const wspd=w=>RAIN.includes(w.kind)?4.2:w.kind=='heat'?4.4:4.8;
const walkMin=(km,min)=>km/wspd(W(min))*60;
const spd=(mode,min,km)=>prov('traffic').speedKmh({mode,minute:min,km,rain:RAIN.includes(W(min).kind)});
const mvMin=(mode,km,min)=>Math.max(1,km/spd(mode,min,km)*60);

/* ---------- networks (BRT + metro; other apps can add theirs) ---------- */
function netBRT(){const nodes={},lines=[];for(const k in STOPS){const s=STOPS[k];nodes['b:'+k]={name:s.name,lat:s.lat,lng:s.lng,mode:'brt'}}
 ROUTES.forEach(r=>{const n=r.stops.length,tot=r.stops[n-1][1],base={mode:'brt',name:r.id,color:r.color,first:r.first,last:r.last,headway:r.headway,departures:r.departures,fare:()=>7000,buffer:2};
  lines.push({...base,id:r.id,dir:'out',stops:r.stops.map(s=>['b:'+s[0],s[1]]),delay:(i,j,d)=>jamDelayFn(r,i,j,d)});
  lines.push({...base,id:r.id,dir:'back',stops:r.stops.map((s,k)=>['b:'+r.stops[n-1-k][0],tot-r.stops[n-1-k][1]]),delay:(i,j,d)=>jamDelayFn(r,n-1-j,n-1-i,d)})});
 return{id:'brt',nodes,lines}}
function netMetro(){const S=[['bt','Bến Thành','Ben Thanh',10.7725,106.6980,0],['nh','Nhà hát TP','Opera House',10.7769,106.7033,2],['bs','Ba Son','Ba Son',10.7867,106.7066,4],['vt','Văn Thánh','Van Thanh',10.7955,106.7150,7],['tc','Tân Cảng','Tan Cang',10.7990,106.7235,9],['ta','Thảo Điền','Thao Dien',10.8020,106.7340,11],['ap','An Phú','An Phu',10.7985,106.7467,14],['rc','Rạch Chiếc','Rach Chiec',10.8040,106.7570,16],['pl','Phước Long','Phuoc Long',10.8115,106.7650,18],['bth','Bình Thái','Binh Thai',10.8210,106.7715,20],['td','Thủ Đức','Thu Duc',10.8340,106.7760,22],['cnc','Khu Công nghệ cao','Hi-Tech Park',10.8553,106.7855,25],['vnu','Đại học Quốc gia','National University',10.8600,106.7975,28],['mst','Suối Tiên','Suoi Tien',10.8645,106.8061,31]];
 const PK={mst:{bike:{fee:5000},car:{fee:30000}},cnc:{bike:{fee:5000},car:{fee:30000}},vnu:{bike:{fee:5000}},td:{bike:{fee:5000}},bth:{bike:{fee:5000}},pl:{bike:{fee:5000}},rc:{bike:{fee:5000}},ap:{bike:{fee:5000}}},nodes={},tot=31;
 S.forEach(s=>nodes['m:'+s[0]]={name:{vi:s[1],en:s[2]},lat:s[3],lng:s[4],mode:'metro',park:PK[s[0]]});
 const base={mode:'metro',id:'M1',name:{vi:'Metro số 1',en:'Metro Line 1'},color:'#d62839',first:'05:00',last:'21:30',headway:m=>isPeak(m)?8:12,fare:(i,j)=>Math.min(20000,6000+Math.max(0,j-i-1)*1100),buffer:3};
 return{id:'metro',nodes,lines:[{...base,dir:'out',stops:S.map(s=>['m:'+s[0],s[5]])},{...base,dir:'back',stops:S.slice().reverse().map(s=>['m:'+s[0],tot-s[5]])}]}}
function rebuild(){NODES={};LINES=[];NETS.forEach(n=>{Object.assign(NODES,n.nodes);n.lines.forEach(l=>{l.cum=[0];for(let k=1;k<l.stops.length;k++){const a=NODES[l.stops[k-1][0]],b=NODES[l.stops[k][0]];l.cum[k]=l.cum[k-1]+hav(a.lat,a.lng,b.lat,b.lng)*1.1}LINES.push(l)})});
 NL={};LINES.forEach(l=>l.stops.forEach((s,i)=>{(NL[s[0]]=NL[s[0]]||[]).push({l,i})}));XF={};const ids=Object.keys(NODES);
 for(const a of ids)for(const b of ids){if(a>=b)continue;const A=NODES[a],B=NODES[b];if(A.mode===B.mode)continue;const d=hav(A.lat,A.lng,B.lat,B.lng);if(d<=.6){(XF[a]=XF[a]||[]).push({to:b,km:d*1.25});(XF[b]=XF[b]||[]).push({to:a,km:d*1.25})}}}
function nextDep(L,i,ready){const off=L.stops[i][1];if(L.departures){for(const d of L.departures)if(d+off>=ready)return d;return null}
 const hw=typeof L.headway=='function'?L.headway(ready):L.headway,f=toMin(L.first),l=toMin(L.last);let k=Math.ceil((ready-off-f)/hw);if(k<0)k=0;const d=f+k*hw;return d<=l?d:null}

/* ---------- earliest-arrival search ---------- */
function search(src,allow){const best={};src.forEach(s=>{if(!best[s.node]||s.t<best[s.node].t)best[s.node]=s});const done={};
 for(;;){let u=null;for(const k in best)if(!done[k]&&(u===null||best[k].t<best[u].t))u=k;if(u===null)break;done[u]=1;const cur=best[u];
  (XF[u]||[]).forEach(x=>{if(!allow(NODES[x.to].mode)||!allow(NODES[u].mode))return;const mn=walkMin(x.km,cur.t),nt=cur.t+mn;if(!best[x.to]||nt<best[x.to].t-1e-9)best[x.to]={node:x.to,t:nt,pred:{type:'xfer',from:u,to:x.to,km:x.km,t0:cur.t,t1:nt,prev:cur}}});
  (NL[u]||[]).forEach(({l,i})=>{if(!allow(l.mode))return;if(cur.pred.type=='ride'&&cur.pred.l===l)return;const ready=cur.t+(l.buffer||2),d=nextDep(l,i,ready);if(d===null)return;const bt=d+l.stops[i][1];
   for(let j=i+1;j<l.stops.length;j++){const at=d+l.stops[j][1]+(l.delay?l.delay(i,j,d):0),v=l.stops[j][0];if(!best[v]||at<best[v].t-1e-9)best[v]={node:v,t:at,pred:{type:'ride',l,i,j,from:u,to:v,tw:cur.t,boardAt:bt,dep:d,t1:at,prev:cur}}}})}
 return best}

/* ---------- normalise a request ---------- */
function norm(q){q=q||{};const g=prov('geocode'),O=g.resolve(q.from),D=g.resolve(q.to);if(!O||!D)return{error:'place'};
 const tm=v=>v==null||v===''?null:typeof v=='number'?v:toMin(String(v));const pf=Object.assign({start:'auto',egress:'auto',alley:false},q.prefs||{});
 return{O,D,veh:vn(q.vehicle),depart:tm(q.depart)??nowM(),arriveBy:tm(q.arriveBy),pf}}

/* ---------- journey assembly ---------- */
const P_=(id)=>{const N=NODES[id];return{id,name:nm(N),lat:N.lat,lng:N.lng}};
const lineInfo=l=>({id:l.id,dir:l.dir,mode:l.mode,name:nm(l),color:l.color,to:nm(NODES[l.stops[l.stops.length-1][0]])});
function assemble(R,label,E,accMode){const ch=[];for(let c=label;c;c=c.pred.prev)ch.unshift(c.pred);const legs=[],A=ch[0],O=R.O,D=R.D,veh=R.veh;
 const leg=(o)=>{legs.push(o);return o};
 // access
 if(A.mode=='walk')leg({mode:'walk',kind:'access',from:O,to:P_(A.node),s:A.t0,e:A.t1,km:A.km});
 else if(A.mode=='own'){leg({mode:'own',veh,kind:'access',from:O,to:P_(A.node),s:A.t0,e:A.t1,km:A.km,costVnd:Math.round(A.km*(veh=='car'?3500:1200)/100)*100});
  leg({mode:'park',veh,kind:'park',at:P_(A.node),s:A.t1,e:A.tp,km:0,costVnd:A.park.fee,park:{source:A.park.source,fullRisk:!!A.park.fullRisk}})}
 else{if(A.tw>A.t0)leg({mode:'wait',kind:'pickup',at:O,s:A.t0,e:A.tw,km:0});leg({mode:A.mode,kind:'access',from:O,to:P_(A.node),s:A.tw,e:A.t1,km:A.km,costVnd:A.q.costVnd,provider:A.q.provider})}
 // transit
 ch.slice(1).forEach(p=>{if(p.type=='xfer')leg({mode:'walk',kind:'xfer',from:P_(p.from),to:P_(p.to),s:p.t0,e:p.t1,km:p.km});
  else{if(p.boardAt>p.tw+.01)leg({mode:'wait',kind:p.l.mode=='metro'?'platform':'stop',at:P_(p.from),s:p.tw,e:p.boardAt,km:0,line:lineInfo(p.l),departAt:p.boardAt});
   leg({mode:p.l.mode,kind:'ride',from:P_(p.from),to:P_(p.to),s:p.boardAt,e:p.t1,km:p.l.cum[p.j]-p.l.cum[p.i],stops:p.j-p.i,line:lineInfo(p.l),costVnd:p.l.fare(p.i,p.j),delayMin:p.l.delay?p.l.delay(p.i,p.j,p.dep):0})}});
 // egress
 const last=ch[ch.length-1],from=last.type=='access'?P_(last.node):P_(last.to);
 if(E.mode=='walk')leg({mode:'walk',kind:'egress',from,to:D,s:E.t0,e:E.t1,km:E.km});
 else{if(E.tw>E.t0)leg({mode:'wait',kind:'pickup',at:from,s:E.t0,e:E.tw,km:0});leg({mode:E.mode,kind:'egress',from,to:D,s:E.tw,e:E.t1,km:E.km,costVnd:E.q.costVnd,provider:E.q.provider,alley:!!E.alleyWalk});
  if(E.alleyWalk)leg({mode:'walk',kind:'alley',from:{name:D.name,lat:D.lat,lng:D.lng},to:D,s:E.t1,e:E.t1+E.alleyWalk,km:.25})}
 return legs}
function finish(R,legs,meta){const dep=legs[0].s,arr=legs[legs.length-1].e;let cost=0,km=0,rain=0,heat=0;const warn=[];
 legs.forEach(l=>{l.minutes=Math.round(l.e-l.s);l.start=fmt(l.s);l.end=fmt(l.e);l.speedKmh=l.km>0&&l.e>l.s?R1(l.km/((l.e-l.s)/60)):null;l.km=R1(l.km);const mid=(l.s+l.e)/2,p=l.from||l.at||{};l.weather=W(mid,p.lat,p.lng);
  if(['own','car','bikehail','hail','own'].includes(l.mode)||l.mode=='own')l.traffic=prov('traffic').level?prov('traffic').level(mid):null;
  cost+=l.costVnd||0;km+=l.km;const out=l.mode=='walk'||l.mode=='bikehail'||(l.mode=='own'&&R.veh=='bike')||(l.mode=='wait'&&l.kind!='platform');
  if(out&&RAIN.includes(l.weather.kind))rain+=l.minutes;if(l.mode=='walk'&&l.weather.kind=='heat'&&l.minutes>=8)heat+=l.minutes});
 const rides=legs.filter(l=>l.kind=='ride'),sev=rain==0?0:rain<6?1:rain<20?2:3;
 if(rain)warn.push({code:'rain',n:rain});if(heat)warn.push({code:'heat',n:heat,tp:legs.find(l=>l.weather.kind=='heat').weather.tempC});
 if(legs.some(l=>l.mode=='park'))warn.push({code:'parksample'});if(legs.some(l=>l.park&&l.park.fullRisk))warn.push({code:'parkfull'});
 const lastR=rides[rides.length-1],eg=legs.find(l=>l.kind=='egress'),dist=lastR&&eg?hav(lastR.to.lat,lastR.to.lng,R.D.lat,R.D.lng)*1000:0;
 if(lastR&&eg&&eg.mode!='walk'&&dist>800)warn.push({code:'nobus',m:Math.round(dist/100)*100,x:eg.mode,l:lastR.mode});
 if(legs.some(l=>l.alley))warn.push({code:'alleycar'});if(rides.some(l=>l.delayMin>0)||isPeak(dep))warn.push({code:'peak'});
 return{departMin:dep,arriveMin:arr,depart:fmt(dep),arrive:fmt(arr),durationMin:Math.round(arr-dep),distanceKm:R1(km),costVnd:Math.round(cost/100)*100,transfers:Math.max(0,rides.length-1),
  avgSpeedKmh:arr>dep?R1(km/((arr-dep)/60)):null,weatherRisk:sev,outdoorRainMin:rain,warnings:warn,modes:[...new Set(legs.map(l=>l.mode).filter(m=>m!='wait'&&m!='park'))],legs,...meta}}

/* ---------- planning at a fixed start time ---------- */
function planAt(R,T0){const O=R.O,D=R.D,veh=R.veh,pf=R.pf,out=[],dk=hav(O.lat,O.lng,D.lat,D.lng),dr=dk*1.3;
 const hq=(kind,km,t)=>prov('ridehail').quote({km,minute:t,kind,from:O,to:D}),sig=[];
 const mk=(legs,m)=>out.push(finish(R,legs,m));
 // direct baselines
 if(veh!='none'&&pf.start!='walk'&&pf.start!='hail'){const P=prov('parking').info(null,veh,T0),mn=mvMin('own_'+veh,dr,T0);
  mk([{mode:'own',veh,kind:'direct',from:O,to:D,s:T0,e:T0+mn,km:dr,costVnd:Math.round(dr*(veh=='car'?3500:1200)/100)*100},{mode:'park',veh,kind:'park',at:D,s:T0+mn,e:T0+mn+P.minutes,km:0,costVnd:P.fee,park:{source:P.source}}],{sig:'drive',role:'direct'})}
 if(pf.start!='walk'&&pf.start!='own'){['hail','bikehail'].forEach(m=>{if(m=='hail'&&pf.alley)return;const kind=m=='hail'?'car':'bike',q=hq(kind,dr,T0),mn=mvMin(m,dr,T0+q.waitMin),legs=[];
  legs.push({mode:'wait',kind:'pickup',at:O,s:T0,e:T0+q.waitMin,km:0});legs.push({mode:m,kind:'direct',from:O,to:D,s:T0+q.waitMin,e:T0+q.waitMin+mn,km:dr,costVnd:q.costVnd,provider:q.provider});mk(legs,{sig:m,role:'direct'})})}
 if(dr<=2.6&&pf.start!='own'&&pf.start!='hail'){const mn=walkMin(dr,T0);mk([{mode:'walk',kind:'direct',from:O,to:D,s:T0,e:T0+mn,km:dr}],{sig:'walk',role:'walk'})}
 // transit combos
 const accModes=pf.start=='walk'?['walk']:pf.start=='hail'?['hail','bikehail']:['walk','hail','bikehail'];
 const egModes=pf.egress=='auto'?['walk','bikehail','hail']:[pf.egress];const masks=[['brt'],['metro'],['brt','metro']];
 const src=(am)=>{const s=[];for(const id in NODES){const N=NODES[id],d=hav(O.lat,O.lng,N.lat,N.lng),km=d*1.3;let a=null;
   if(am=='walk'){const k=d*1.25;if(k>1.6)continue;const mn=walkMin(k,T0);a={mode:am,km:k,t0:T0,t1:T0+mn,tp:T0+mn}}
   else if(am=='own'){if(veh=='none'||km<1.5||km>Math.max(4,dr*.85))continue;const pk=prov('parking').info(N,veh,T0);if(!pk||!pk.ok)continue;const mn=mvMin('own_'+veh,km,T0);a={mode:am,veh,km,t0:T0,t1:T0+mn,tp:T0+mn+pk.minutes,park:pk}}
   else{if(d<.8||km>Math.max(3,dr*.5))continue;const kd=am=='hail'?'car':'bike',q=hq(kd,km,T0),mn=mvMin(am,km,T0+q.waitMin);a={mode:am,km,t0:T0,tw:T0+q.waitMin,t1:T0+q.waitMin+mn,tp:T0+q.waitMin+mn,q}}
   s.push({node:id,t:a.tp,pred:{type:'access',node:id,...a,prev:null}})}return s};
 const eg=(em,id,t)=>{const N=NODES[id],d=hav(N.lat,N.lng,D.lat,D.lng);
  if(em=='walk'){const k=d*1.25;if(k>2.2)return null;const mn=walkMin(k,t);return{mode:em,km:k,t0:t,t1:t+mn,end:t+mn}}
  const km=d*1.3;if(d<.5||km>Math.max(4,dr*.75))return null;if(em=='hail'&&pf.alley&&km<.4)return null;const q=hq(em=='hail'?'car':'bike',km,t),mn=mvMin(em,km,t+q.waitMin),aw=em=='hail'&&pf.alley?4:0;
  return{mode:em,km,t0:t,tw:t+q.waitMin,t1:t+q.waitMin+mn,q,alleyWalk:aw,end:t+q.waitMin+mn+aw}};
 accModes.forEach(am=>{const s=src(am);if(!s.length)return;masks.forEach(mask=>{const best=search(s,m=>mask.includes(m));
  egModes.forEach(em=>{let pick=null;for(const id in best){const lb=best[id];if(lb.pred.type=='access')continue;const E=eg(em,id,lb.t);if(!E)continue;
    let rides=0,tr=0;for(let c=lb;c;c=c.pred.prev)if(c.pred.type=='ride'){rides++;tr+=c.pred.t1-c.pred.boardAt}
    if(!rides||tr<5)continue;if(!pick||E.end<pick.E.end-1e-9)pick={lb,E}}
   if(pick){const legs=assemble(R,pick.lb,pick.E,am),rd=legs.filter(l=>l.kind=='ride');out.push(finish(R,legs,{sig:am+'|'+rd.map(l=>l.line.id+l.line.dir+':'+l.from.id+'>'+l.to.id).join(',')+'|'+em,role:'transit',access:am,egress:em}))}})})});
 return out}

function planBy(R){const seen={},res=[];for(let T=R.arriveBy-15;T>=R.arriveBy-240&&T>=0;T-=6){planAt(R,T).forEach(j=>{if(j.arriveMin<=R.arriveBy&&!seen[j.sig]){seen[j.sig]=1;res.push(j)}})}return res}

/* ---------- ranking ---------- */
function rank(list,R){if(!list.length)return[];const AB=R.arriveBy!=null,by=(f,arr)=>arr.reduce((a,b)=>f(b)<f(a)?b:a,arr[0]),sc=j=>AB?-j.departMin*1000+j.costVnd/1000:j.arriveMin*1000+j.costVnd/1000;
 const fast=by(sc,list),pr=list.filter(j=>j.access=='own'&&j.role=='transit'),tr=list.filter(j=>j.role=='transit'&&j.access=='walk'),dr=list.filter(j=>j.role!='transit');
 const picks=[];const add=(j,tag)=>{if(!j)return;let e=picks.find(p=>p.sig===j.sig);if(!e){e=j;e.tags=[];picks.push(e)}if(!e.tags.includes(tag))e.tags.push(tag)};
 add(fast,'fast');if(pr.length)add(by(sc,pr),'parkride');if(tr.length)add(by(sc,tr),'public');
 const dry=by(j=>j.outdoorRainMin*5000+(AB?-j.departMin:j.arriveMin)*10+j.costVnd/1000,list);if(dry.outdoorRainMin<fast.outdoorRainMin)add(dry,'dry');
 const ch=by(j=>j.costVnd*100+j.arriveMin,list.filter(j=>AB?j.departMin>=fast.departMin-45:j.arriveMin<=fast.arriveMin+45));add(ch,'cheap');if(dr.length){add(by(sc,dr),'door');const dv=dr.find(j=>j.sig=='drive');if(dv)add(dv,'door')}
 const order=['fast','parkride','public','dry','cheap','door'];picks.sort((a,b)=>Math.min(...a.tags.map(x=>order.indexOf(x)))-Math.min(...b.tags.map(x=>order.indexOf(x))));
 picks.forEach((j,i)=>{j.id='j'+(i+1)});return picks.slice(0,6)}
function cov(R){const f=(pt,mode)=>{let b=null;for(const id in NODES){const N=NODES[id];if(N.mode!=mode)continue;const d=hav(pt.lat,pt.lng,N.lat,N.lng);if(!b||d<b.d)b={d,id}}return b?{id:b.id,name:nm(NODES[b.id]),km:R1(b.d*1.25)}:null};
 return{origin:{brt:f(R.O,'brt'),metro:f(R.O,'metro')},destination:{brt:f(R.D,'brt'),metro:f(R.D,'metro')}}}
function plan(req){const R=norm(req);if(R.error)return{schema:SCHEMA,ok:false,error:R.error,request:req};
 const list=R.arriveBy!=null?planBy(R):planAt(R,R.depart),journeys=rank(list,R);
 const res={schema:SCHEMA,ok:journeys.length>0,generatedAt:new Date().toISOString(),request:{from:R.O,to:R.D,depart:R.arriveBy!=null?null:fmt(R.depart),arriveBy:R.arriveBy!=null?fmt(R.arriveBy):null,vehicle:R.veh,prefs:R.pf},coverage:cov(R),
  sources:{weather:PN.weather,traffic:PN.traffic,parking:PN.parking,ridehail:PN.ridehail,networks:NETS.map(n=>n.id)},journeys,dataQuality:'sample'};
 emit('plan',res);return res}

/* ---------- public API ---------- */
const P=window.Pathfinder={version:'1.0.0',schema:SCHEMA,
 register(kind,impl,name){if(!DEF[kind])throw new Error('Unknown provider kind: '+kind+' (use '+Object.keys(DEF).join(', ')+')');PROV[kind]=Object.assign({},PROV[kind]||{},impl);PN[kind]=name||impl.name||'custom';emit('provider',{kind,name:PN[kind]});return P},
 addNetwork(n){if(!n||!n.id||!n.nodes||!n.lines)throw new Error('network needs id, nodes, lines');NETS=NETS.filter(x=>x.id!==n.id).concat([n]);rebuild();emit('network',{id:n.id});return P},
 plan:req=>Promise.resolve(plan(req)),planSync:plan,
 on(e,f){(EV[e]=EV[e]||[]).push(f);return P},off(e,f){EV[e]=(EV[e]||[]).filter(x=>x!==f);return P},
 capabilities:()=>({version:P.version,schema:SCHEMA,providers:Object.assign({},PN),networks:NETS.map(n=>({id:n.id,lines:n.lines.length,nodes:Object.keys(n.nodes).length})),messages:['pathfinder:plan','pathfinder:capabilities'],events:['plan','provider','network']}),
 exportICS:j=>ics(j),exportLink:(req)=>link(req)};
NETS=[netBRT(),netMetro()];rebuild();

/* ---------- window.postMessage bridge (read-only) ---------- */
addEventListener('message',ev=>{const m=ev.data;if(!m||typeof m!='object'||!/^pathfinder:/.test(m.type||''))return;
 const rp=x=>{try{ev.source&&ev.source.postMessage(x,ev.origin&&ev.origin!='null'?ev.origin:'*')}catch(e){}};
 if(m.type=='pathfinder:plan')rp({type:'pathfinder:result',id:m.id,result:plan(m.request||{})});else if(m.type=='pathfinder:capabilities')rp({type:'pathfinder:capabilities',id:m.id,capabilities:P.capabilities()})});

/* ---------- exports ---------- */
function legTitle(l){const v=l.veh=='car'?t('v_car'):t('v_bike');
 switch(l.mode){case'walk':return l.kind=='xfer'?t('lg_xfer'):l.kind=='alley'?t('lg_alley'):t('lg_walk');
  case'own':return t(l.veh=='car'?'lg_own_car':'lg_own_bike');case'park':return tf('lg_park',{v,n:l.minutes});
  case'wait':return l.kind=='pickup'?t('lg_pickup'):tf('lg_wait_t',{l:l.line.mode=='brt'?(LG=='vi'?'Tuyến ':'Line ')+l.line.id:l.line.name,s:l.at.name,t:fmt(l.departAt)});
  case'hail':return t('lg_hail');case'bikehail':return t('lg_bikehail');
  case'brt':return (LG=='vi'?'Tuyến ':'Line ')+l.line.id+' → '+l.line.to;case'metro':return l.line.name+' → '+l.line.to}return l.mode}
const place=l=>l.mode=='wait'||l.mode=='park'?l.at.name:l.from.name+' → '+l.to.name;
function toJSON(j,res){const c=JSON.parse(JSON.stringify(j));c.legs.forEach((l,i)=>{l.label=legTitle(j.legs[i])});return{schema:SCHEMA,generatedAt:res.generatedAt,request:res.request,coverage:res.coverage,sources:res.sources,dataQuality:'sample',journey:c}}
function ics(j){const d=new Date(),esc=s=>String(s||'').replace(/\\/g,'\\\\').replace(/[,;]/g,m=>'\\'+m).replace(/\n/g,'\\n'),ts=m=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,Math.round(m));return x.getFullYear()+pad(x.getMonth()+1)+pad(x.getDate())+'T'+pad(x.getHours())+pad(x.getMinutes())+'00'},
 L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Pathfinder//Journey//EN','CALSCALE:GREGORIAN'];let n=0;
 j.legs.filter(l=>l.mode!='wait').forEach(l=>{L.push('BEGIN:VEVENT','UID:pf-'+Date.now()+'-'+(n++)+'@pathfinder','DTSTAMP:'+ts(nowM()),'DTSTART:'+ts(l.s),'DTEND:'+ts(l.e),'SUMMARY:'+esc(legTitle(l)),'LOCATION:'+esc(place(l)),
  'DESCRIPTION:'+esc(l.minutes+' min'+(l.km?' · '+l.km+' km':'')+(l.speedKmh?' · '+l.speedKmh+' km/h':'')+(l.weather?' · '+l.weather.icon+' '+(l.weather.tempC??'')+'°C '+l.weather.rainPct+'%':'')));
  if(n==1)L.push('BEGIN:VALARM','TRIGGER:-PT10M','ACTION:DISPLAY','DESCRIPTION:Leave soon','END:VALARM');L.push('END:VEVENT')});L.push('END:VCALENDAR');return L.join('\r\n')}
function link(q){const u=new URLSearchParams();u.set('from',q.fromText);u.set('to',q.toText);if(q.arr)u.set('arrive',q.time);else{u.set('at',q.time);if(q.by)u.set('arrive',q.by)}u.set('vehicle',q.vehicle);u.set('start',q.start);if(q.egress&&q.egress!='auto')u.set('egress',q.egress);if(q.alley)u.set('alley','1');
 return location.href.split('#')[0].split('?')[0]+'?'+u+'#trip'}

/* ---------- UI ---------- */
const TR={res:null,sel:0,q:null};
const IC={walk:'🚶',own:'🛵',park:'🅿️',wait:'⏳',hail:'🚕',bikehail:'🏍️',brt:'🚌',metro:'🚇'},COL={walk:'#7a8696',own:'#0B63CE',park:'#7c3aed',wait:'#b8c0cc',hail:'#00a651',bikehail:'#00a651',brt:'#c2410c',metro:'#d62839'};
const col=l=>l.line&&l.line.color&&l.mode!='wait'?l.line.color:COL[l.mode]||'#888',ic=l=>l.mode=='own'&&l.veh=='car'?'🚗':IC[l.mode]||'•';
const vnd=n=>n?Math.round(n/1000)+'k':'0';
const bm=h=>{const p=String(h).split(':');return +p[0]*60+ +p[1]},lateBy=j=>bm(TR.q.by)>=0?j.arriveMin-bm(TR.q.by):0;
const ob=j=>{if(!TR.q||!TR.q.by)return'';const d=lateBy(j);return d<=0?' · ✓ '+t('ontime'):' · ⚠ +'+d+' '+t('min')};
const ot=j=>{if(!TR.q||!TR.q.by)return'';const d=lateBy(j);return`<div>${t('tr_ar_chk')}<b style="color:${d<=0?'#4ade80':'#f87171'}">${d<=0?'✓ '+t('ontime'):'⚠ +'+d+' '+t('min')}</b></div>`};
const wxs=w=>w?w.icon+' '+(w.tempC!=null?w.tempC+'°':'')+' · '+w.rainPct+'%':'';
const egV=()=>{const v=$('tEg').value;return v=='none'?'walk':v};const mirrorVeh=()=>{$('tVeh').value=/^(bike|car)$/.test($('tSt').value)?$('tSt').value:'none'};
const suggHTML=()=>{const q=TR.q||{},out=[],ok=(st,eg)=>{try{return plan(toReq(Object.assign({},q,{start:st,egress:eg}))).ok}catch(e){return false}},add=(st,eg,lb)=>{if(!out.some(o=>o[0]==st+':'+eg)&&ok(st,eg))out.push([st+':'+eg,lb])};
 if(q.egress=='walk'){add(q.start,'bikehail',t('tr_finish')+': '+t('lm_bikehail'));add(q.start,'hail',t('tr_finish')+': '+t('lm_hail'))}
 if(q.start=='walk'){add('hail',q.egress,t('tr_start')+': '+t('tr_s_hail'))}
 if(q.start=='walk'&&q.egress=='walk'){add('hail','bikehail',t('tr_start')+': '+t('tr_s_hail')+' + '+t('tr_finish')+': '+t('lm_bikehail'))}
 add('auto','auto',t('tr_s_auto'));
 return out.length?`<p class="mut">${t('tr_try')}</p><div class="sugg">${out.map(x=>`<button type="button" class="b out" data-sugg="${x[0]}">${x[1]}</button>`).join('')}</div>`:''};
const ck=()=>{const am=$('tWh').value==='arr',st=$('tTm').value,ar=$('tAr').value;return{fromText:$('tFr').value.trim(),toText:$('tTo').value.trim(),arr:am,time:am?ar:(st||fmt(nowM())),by:!am&&ar?ar:'',vehicle:/^(bike|car)$/.test($('tSt').value)?$('tSt').value:'none',start:({none:'walk',hail:'hail',auto:'auto',bike:'auto',car:'auto'})[$('tSt').value]||'walk',egress:egV(),alley:$('tAl').checked}};
const toReq=q=>({from:q.fromText,to:q.toText,[q.arr?'arriveBy':'depart']:q.time,vehicle:q.vehicle,prefs:{start:q.start,egress:q.egress||'auto',alley:q.alley}});
function nearAR(p){let b=0,d=1e9;AR.forEach((a,i)=>{const x=hav(p.lat,p.lng,a[1],a[2]);if(x<d){d=x;b=i}});return b}
function feedPlanner(res){if(!res||!res.request)return;const r=res.request;$('tCmp').hidden=false;$('pF').value=nearAR(r.from);$('pT').value=nearAR(r.to);$('tm').value=r.depart||r.arriveBy||$('tm').value;compare()}
function run(keep){const q=ck();TR.q=q;if(!q.fromText||!q.toText){$('tOut').innerHTML=`<div class="card"><p class="mut">${t('tr_need')}</p></div>`;return}if(q.arr&&!q.time){$('tOut').innerHTML=`<div class="card"><p class="mut">${t('tr_need_arr')}</p></div>`;return}
 const res=plan(toReq(q));TR.res=res;if(res.ok&&res.request&&hav(res.request.from.lat,res.request.from.lng,res.request.to.lat,res.request.to.lng)<.25){TR.res=null;$('tOut').innerHTML=`<div class="card"><h3>${t('tr_same')}</h3></div>`;return}try{feedPlanner(res)}catch(e){console.warn('Pathfinder: compare panel skipped',e)}if(!res.ok){const bad=[q.fromText,q.toText].filter(x=>!findPl(x)).map(x=>'“'+esc(x)+'”').join(', ');$('tOut').innerHTML=res.error?`<div class="card"><h3>${t('tr_nofind')} ${bad}</h3><p class="mut">${t('tr_need')}</p></div>`:`<div class="card"><h3>${t('tr_none')}</h3>${suggHTML()}</div>`;return}
 let s=0;{let i=keep?res.journeys.findIndex(j=>j.sig==keep):-1;if(i<0){const v=q.vehicle,pf=v!='none'?j=>j.sig=='drive':j=>j.role=='transit';i=res.journeys.findIndex(pf);if(i<0)i=res.journeys.findIndex(j=>j.role=='transit')}if(i>=0)s=i}TR.sel=s;draw()}
const tags=j=>(j.tags||[]).map(x=>`<span class="tg">${t('tg_'+x)}</span>`).join('');
const isPv=j=>j.legs.some(l=>l.mode=='own');TR.f='all';
function covHTML(c){const one=(o,lab)=>{const f=(x,ic)=>x?`<span class="jy-cv${x.km<=.8?' ok':''}">${ic} ${esc(x.name)} · ${x.km} km</span>`:'';return`<div><b>${lab}</b><div class="jy-cvs">${f(o.brt,'🚌')}${f(o.metro,'🚇')}</div></div>`};
 return`<div class="card"><h3>${t('cv_t')}</h3><p class="mut">${t('cv_p')}</p><div class="jy-cov">${one(c.origin,t('from'))}${one(c.destination,t('to'))}</div></div>`}
function cardHTML(j,i){const rn=j.outdoorRainMin?`<div>${t('tr_wx')}<b>🌧️ ${j.outdoorRainMin}′</b></div>`:'';
 return`<div class="alt-i${i==TR.sel?' on':''}"><div class="tgs"><span class="tg">${isPv(j)?'🛵 '+t('jf_priv'):'🚌 '+t('jf_pub')}</span>${tags(j)}</div><div class="jy-mini">${j.legs.filter(l=>l.mode!='wait').map(l=>`<span title="${esc(legTitle(l))}">${ic(l)}</span>`).join('<i>›</i>')}</div>
 <div class="pa-s"><div>${t('tr_dur')}<b>${j.durationMin} ${t('min')}</b></div><div>${t('tr_depart')}<b>${j.depart}</b></div><div>${t('arr')}<b>${j.arrive}</b></div>${ot(j)}<div>${t('cost')}<b>≈ ${vnd(j.costVnd)}</b></div>${rn}</div>
 <div class="sp2"><button class="b${i==TR.sel?'':' out'}" data-jsel="${i}">${t('tr_view')}</button><button class="b alt" data-juse data-ji="${i}">${t('choose')}</button></div></div>`}
const stat=(a,b)=>`<div>${a}<b>${b}</b></div>`;
function barHTML(j){const tot=Math.max(1,j.arriveMin-j.departMin);return`<div class="jy-bar" role="img" aria-label="${t('tl_t')}">${j.legs.map(l=>`<span style="flex:${Math.max(.6,(l.e-l.s)/tot*100)} 1 0;background:${col(l)}${l.mode=='wait'?';opacity:.45':''}" title="${esc(legTitle(l))} · ${l.minutes} ${t('min')}">${l.minutes>=6?ic(l):''}</span>`).join('')}</div>`}
function tlHTML(j){return`<ol class="jy-tl">${j.legs.map(l=>{const apps=l.mode=='hail'||l.mode=='bikehail'?`<div class="jy-apps"><a class="jy-ch xsm" href="https://www.greensm.com" target="_blank" rel="noopener">Xanh SM</a><a class="jy-ch be" href="https://be.com.vn" target="_blank" rel="noopener">Be</a><a class="jy-ch grab" href="https://www.grab.com/vn/" target="_blank" rel="noopener">Grab</a></div>`:'';
  const meta=[l.km?l.km+' km':'',l.speedKmh?l.speedKmh+' km/h':'',l.costVnd?'≈ '+vnd(l.costVnd):'',l.stops?tf('lg_stops',{n:l.stops}):'',l.weather?wxs(l.weather):'',l.traffic!=null&&l.traffic>0?t('lv'+l.traffic):''].filter(Boolean).join(' · ');
  const nt=l.delayMin>0?`<div class="mut">${tf('lg_delay',{n:l.delayMin})}</div>`:'';
  return`<li class="jy-i${l.mode=='wait'?' w':''}" style="--c:${col(l)}"><div class="jy-t"><b>${l.start}</b><small>${l.end}</small></div><div class="jy-d"><div class="jy-h"><span class="jy-ic">${ic(l)}</span><b>${esc(legTitle(l))}</b><span class="tg">${l.minutes} ${t('min')}</span></div><div class="mut">${esc(place(l))}</div><div class="jy-m">${meta}</div>${nt}${apps}</div></li>`}).join('')}</ol>`}
function lastMile(j){const r=j.legs.filter(l=>l.kind=='ride');if(!r.length)return'';const lr=r[r.length-1],node=lr.to,arr=lr.e,R=norm({from:TR.q.fromText,to:TR.q.toText,depart:arr,vehicle:'none',prefs:{alley:TR.q.alley}}),d=hav(node.lat,node.lng,R.D.lat,R.D.lng);
 const opts=[];const wk=walkMin(d*1.25,arr);opts.push({m:'walk',min:Math.round(wk),cost:0,km:R1(d*1.25),w:W(arr+wk/2,node.lat,node.lng)});
 ['bikehail','hail'].forEach(m=>{if(d<.3)return;const km=d*1.3,q=prov('ridehail').quote({km,minute:arr,kind:m=='hail'?'car':'bike'}),mn=q.waitMin+mvMin(m,km,arr+q.waitMin)+(m=='hail'&&TR.q.alley?4:0);opts.push({m,min:Math.round(mn),cost:q.costVnd,km:R1(km),w:W(arr+mn/2,node.lat,node.lng)})});
 const shown=opts.filter(o=>o.m!='walk'||o.min<=45).length?opts.filter(o=>o.m!='walk'||o.min<=45):opts;opts.length=0;shown.forEach(o=>opts.push(o));const ok=opts.filter(o=>o.m!='walk'||o.min<=18),best=(ok.length?ok:opts).reduce((a,b)=>b.min<a.min?b:a),cur=j.legs.find(l=>l.kind=='egress');
 return`<div class="card"><h3>🧭 ${tf('lm_t',{s:esc(node.name)})}</h3><p class="mut">${t('lm_p')}</p><div class="altg">${opts.map(o=>`<div class="alt-i${cur&&cur.mode==o.m?' on':''}"><div class="tgs"><b>${ic({mode:o.m})} ${t('lm_'+o.m)}</b>${o===best?`<span class="tg">${t('lm_best')}</span>`:''}</div><div class="pa-s"><div>${t('tm')}<b>${o.min} ${t('min')}</b></div><div>${t('cost')}<b>${o.cost?'≈ '+vnd(o.cost):'0'}</b></div><div>${t('tr_wx')}<b>${wxs(o.w)}</b></div></div><div class="mut">${o.km} km${o.m=='hail'&&TR.q.alley?' · '+t('wn_alleycar'):''}</div><div class="sp2"><button class="b${cur&&cur.mode==o.m?'':' out'}" data-jeg="${o.m}">${t('lm_use')}</button></div></div>`).join('')}</div></div>`}
function warnHTML(j){return j.warnings.length?`<div class="note"><ul class="jy-w">${j.warnings.map(w=>`<li>${w.code=='nobus'?tf('wn_nobus',{m:w.m,x:t('lm_'+w.x),l:t('lg_'+w.l+'_n')}):tf('wn_'+w.code,w)}</li>`).join('')}<li>${t('wn_sample')}</li></ul></div>`:`<div class="note">${t('wn_sample')}</div>`}
function summaryHTML(j){return`<div class="card"><div class="tgs">${tags(j)}</div><h3 style="margin-top:8px">${j.depart} → ${j.arrive} · ${j.durationMin} ${t('min')}</h3><div class="pa-s">${stat(t('tr_dist'),j.distanceKm+' km')}${stat(t('tr_speed'),(j.avgSpeedKmh||0)+' km/h')}${stat(t('cost'),'≈ '+vnd(j.costVnd))}${stat(t('tr_xfer'),j.transfers)}${stat(t('tr_wx'),j.outdoorRainMin?'🌧️ '+j.outdoorRainMin+'′':'✓')}</div>${barHTML(j)}${warnHTML(j)}<h3 style="margin-top:18px">${t('tl_t')}</h3>${tlHTML(j)}</div>`}
function mapHTML(j){const q=TR.res.request,o=q.from.lat+','+q.from.lng,d=q.to.lat+','+q.to.lng,u=mapUrl('',o,d,'r'),g='https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',origin:o,destination:d,travelmode:'transit'});
 return`<div class="card"><h3>${t('tr_map')}</h3><iframe id="tMap" title="map" src="${u}"></iframe><div class="row"><a class="b out" href="${g}" target="_blank" rel="noopener">${t('in_gm')}</a></div></div>`}
function intHTML(j){const js=JSON.stringify(toJSON(j,TR.res),null,1),pv=Object.entries(PN).map(([k,v])=>k+': '+v).join(' · ');
 return`<div class="card"><h3>🔌 ${t('in_t')}</h3><p class="mut">${t('in_p')}</p><div class="row"><button class="b" data-jx="copy">${t('in_copy')}</button><button class="b out" data-jx="json">${t('in_dl')}</button><button class="b out" data-jx="ics">${t('in_ics')}</button><button class="b out" data-jx="link">${t('in_link')}</button><button class="b alt" data-jx="watch">${t('in_watch')}</button></div>
 <p class="mut">${tf('in_prov',{p:esc(pv)})}</p><details><summary>${t('in_json')}</summary><pre class="jy-pre">${esc(js)}</pre></details>
 <details><summary>${t('in_docs')}</summary><pre class="jy-pre">${esc(DOC)}</pre></details></div>`}
const DOC=`// 1. Ask Pathfinder for a plan (from any script on the page)
const r = await Pathfinder.plan({
  from:'Vinhomes Grand Park', to:'Quận 3',   // name, "lat,lng" or {lat,lng,name}
  depart:'07:30',                            // or arriveBy:'09:00'
  vehicle:'bike',                            // 'bike' | 'car' | 'none'
  prefs:{ start:'auto',                      // 'auto'|'walk'|'hail'
          egress:'auto',                     // 'auto'|'walk'|'bikehail'|'hail'
          alley:false }                      // destination in a narrow alley
});  // -> { schema:'pathfinder.journey/1', journeys:[{ legs:[...], ... }] }

// 2. Plug in your own data (providers are synchronous)
Pathfinder.register('weather', { at:({lat,lng,minute}) =>
  ({ kind:'rain', tempC:29, rainPct:80, icon:'🌧️' }) }, 'MyWeatherApp');
Pathfinder.register('ridehail', { quote:({km,minute,kind}) =>
  ({ waitMin:4, costVnd:km*6000, provider:'MyRides' }) });
Pathfinder.register('parking', { info:(node,veh,minute) =>
  ({ ok:true, fee:5000, minutes:3, source:'live' }) });
Pathfinder.addNetwork({ id:'tram', nodes:{ 'x:a':{name:'A',lat:10.8,lng:106.7,mode:'tram'} },
  lines:[{ id:'T1', mode:'tram', name:'T1', color:'#0a0', first:'06:00', last:'21:00',
           headway:10, stops:[['x:a',0],['x:b',12]], fare:()=>8000 }] });

// 3. Embed in another app (iframe) and talk by postMessage
frame.contentWindow.postMessage({ type:'pathfinder:plan', id:1, request:{...} }, '*');
addEventListener('message', e => e.data.type==='pathfinder:result' && use(e.data.result));

// 4. Listen for results from outside code
Pathfinder.on('plan', res => console.log(res));`;
function pvpCalc(q){const rq=v=>norm({from:q.fromText,to:q.toText,[q.arr?'arriveBy':'depart']:q.time,vehicle:v,prefs:{start:'auto',egress:'auto',alley:q.alley}});
 const pick=(R,f)=>{if(R.error)return null;const l=(R.arriveBy!=null?planBy(R):planAt(R,R.depart)).filter(f);return l.length?l.reduce((a,b)=>(((R.arriveBy!=null?-b.departMin:b.arriveMin)*1000+b.costVnd/1000)<((R.arriveBy!=null?-a.departMin:a.arriveMin)*1000+a.costVnd/1000))?b:a):null};
 const ML=['own','hail','bikehail'],PURE=j=>j.role=='transit'&&!j.legs.some(l=>ML.includes(l.mode)),MIXD=j=>j.role=='transit'&&j.legs.some(l=>ML.includes(l.mode)),MIXJ=[pick(rq('none'),MIXD),pick(rq('bike'),MIXD),pick(rq('car'),MIXD)].filter(Boolean).reduce((a,b)=>!a||b.arriveMin<a.arriveMin?b:a,null);return[{k:'bike',w:'priv',j:pick(rq('bike'),j=>j.sig=='drive')},{k:'car',w:'priv',j:pick(rq('car'),j=>j.sig=='drive')},{k:'pub',w:'pub',j:pick(rq('none'),PURE)},{k:'mix',w:'pub',j:MIXJ}]}
function pvpHTML(){let C;try{C=pvpCalc(TR.q)}catch(e){return''}const ok=C.filter(c=>c.j);if(!ok.length)return'';const lab=c=>c.k=='mix'?'🔀 '+t('pv_mix'):c.k=='pub'?'🚌 '+t('jf_pub'):c.k=='car'?'🚗 '+t('tr_v_car'):'🛵 '+t('tr_v_bike'),min=f=>(ok.some(c=>c.k!='mix')?ok.filter(c=>c.k!='mix'):ok).reduce((a,b)=>f(b.j)<f(a.j)?b:a),fa=min(j=>j.durationMin),ch=min(j=>j.costVnd),dr=min(j=>j.outdoorRainMin);
 return`<div class="card" id="pvp"><h3>🆚 ${t('pv_t')}</h3><p class="mut">${t('pv_p')}</p><div class="v">⭐ ${t('pv_ans')}: <b>${lab(fa)}</b> · ${t('tr_depart')} <b>${fa.j.depart}</b> → ${t('arr')} <b>${fa.j.arrive}</b>${ob(fa.j)} · ${fa.j.durationMin} ${t('min')} · ≈ ${vnd(fa.j.costVnd)}${(m=>m&&m.j&&m.j.durationMin<fa.j.durationMin?' · 🔀 '+t('pv_mixfast').replace('{n}',fa.j.durationMin-m.j.durationMin):'')(C.find(c=>c.k=='mix'))}</div><div class="altg">${C.map(c=>{if(!c.j)return`<div class="alt-i"><div class="tgs"><b>${lab(c)}</b></div><p class="mut">${t(c.k=='pub'?'pv_nopub':c.k=='mix'?'pv_nomix':'pv_none')}</p></div>`;const j=c.j,bd=[c.k=='mix'?t('pv_ex'):'',c===fa?t('pv_fast'):'',c===ch?t('pv_cheap'):'',c===dr&&ok.some(x=>x.j.outdoorRainMin!=j.outdoorRainMin)?t('pv_dry'):''].filter(Boolean);
 return`<div class="alt-i${c===fa?' on':''}"><div class="tgs"><b>${lab(c)}</b>${bd.map(x=>`<span class="tg">${x}</span>`).join('')}</div><div class="pa-s"><div>${t('tr_dur')}<b>${j.durationMin} ${t('min')}</b></div><div>${t('tr_depart')}<b>${j.depart}</b></div><div>${t('arr')}<b>${j.arrive}</b></div>${ot(j)}<div>${t('cost')}<b>≈ ${vnd(j.costVnd)}</b></div><div>${t('tr_wx')}<b>${j.outdoorRainMin?'🌧️ '+j.outdoorRainMin+'′':'✓'}</b></div></div><div class="sp2"><button class="b${c===fa?'':' out'}" ${c.k=='mix'?'data-jmix="1"':'data-juse="'+c.w+'" data-veh="'+c.k+'" data-jdep="'+j.depart+'" data-jarr="'+j.arrive+'"'}>${t('choose')}</button></div></div>`}).join('')}</div><div class="v">${t('pv_fast')}: ${lab(fa)} · ${t('pv_cheap')}: ${lab(ch)}${ok.some(x=>x.j.outdoorRainMin)?' · '+t('pv_dry')+': '+lab(dr):''}</div></div>`}
function etaHTML(J){const q=TR.q||{},ch=J.legs.filter(l=>l.mode!='wait').map(l=>`<span>${ic(l)} ${esc(legTitle(l))}</span>`).join('<i>›</i>');return`<div class="eta"><span>${t('eta')}</span><b>${J.arrive}</b><small>${t('tr_depart')} <b>${J.depart}</b> → ${t('arr')} <b>${J.arrive}</b>${ob(J)} · ${J.durationMin} ${t('min')} · ≈ ${vnd(J.costVnd)}</small><div class="eta-r"><span>📍 ${esc(q.fromText||'')}</span><i>›</i>${ch}<i>›</i><span>🏁 ${esc(q.toText||'')}</span></div>${[q.fromText,q.toText].some(x=>{const p=findPl(x);return p&&p.approx})?`<p class="eta-n">📍 ${t('approx')}</p>`:''}</div>`}
function draw(){const res=TR.res;let vis=res.journeys.map((j,i)=>[j,i]).filter(([j])=>TR.f=='priv'?isPv(j):TR.f=='pub'?!isPv(j):true);const none=!vis.length;if(none)vis=res.journeys.map((j,i)=>[j,i]);if(!vis.some(x=>x[1]==TR.sel))TR.sel=vis[0][1];const J=res.journeys[TR.sel];
 $('tOut').innerHTML=pvpHTML()+etaHTML(J)+jySafe(()=>covHTML(res.coverage))+`<div class="card"><h3>${t('tr_alts')}</h3><div class="tabs">${[['all','jf_all'],['priv','jf_priv'],['pub','jf_pub']].map(f=>`<button class="b" aria-pressed="${TR.f==f[0]}" data-jf="${f[0]}">${t(f[1])}</button>`).join('')}</div>${none?`<p class="mut">${t('pv_none')}</p>`:''}<div class="altg">${vis.map(x=>cardHTML(x[0],x[1])).join('')}</div></div>`+summaryHTML(J)+jySafe(()=>lastMile(J))+jySafe(()=>mapHTML(J))}
const dl=(name,mime,txt)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:mime}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
const copy=async s=>{try{await navigator.clipboard.writeText(s)}catch(e){const x=document.createElement('textarea');x.value=s;document.body.appendChild(x);x.select();try{document.execCommand('copy')}catch(e2){}x.remove()}toast(t('in_copied'))};
document.addEventListener('click',e=>{let b=e.target.closest('[data-jsel]');if(b&&TR.res){TR.sel=+b.dataset.jsel;draw();$('tOut').children[4].scrollIntoView({behavior:'smooth',block:'start'});return}
 b=e.target.closest('[data-jeg]');if(b&&TR.res){$('tEg').value=b.dataset.jeg=='walk'?'none':b.dataset.jeg;const k=TR.res.journeys[TR.sel].sig.split('|').slice(0,2).join('|');run();const i=TR.res.journeys.findIndex(j=>j.sig.startsWith(k+'|'));if(i>=0){TR.sel=i;draw()}return}
 b=e.target.closest('[data-jx]');if(b&&TR.res){const J=TR.res.journeys[TR.sel],a=b.dataset.jx;if(a=='copy')copy(JSON.stringify(toJSON(J,TR.res),null,1));else if(a=='json')dl('pathfinder-journey.json','application/json',JSON.stringify(toJSON(J,TR.res),null,1));else if(a=='ics')dl('pathfinder-journey.ics','text/calendar',ics(J));else if(a=='link')copy(link(TR.q));
  else if(a=='watch'){setPlan(TR.res.request.from.name,TR.res.request.to.name,J.departMin,J.modes.includes('metro')||J.modes.includes('brt')?'brt':'car');toast(t('in_watching'))}return}
 b=e.target.closest('[data-tex]');if(b){const X=EXS[+b.dataset.tex-1];$('tFr').value=X.f;$('tTo').value=X.t;$('tAr').value='';setWh('dep',X.at);$('tSt').value=(X.v=='bike'||X.v=='car')?X.v:(X.s=='walk'?'none':X.s);$('tEg').value='auto';mirrorVeh();$('tAl').checked=!!X.a;run()}});
const EXS=[{f:'Vinhomes Grand Park',t:'Quận 3',at:'07:30',v:'bike',s:'auto',a:0},{f:'Thảo Điền',t:'Quận 8',at:'17:15',v:'none',s:'auto',a:1},{f:'Sân bay Tân Sơn Nhất',t:'Khu Công nghệ cao',at:'08:00',v:'none',s:'auto',a:0}];

/* ---------- specific places (OpenStreetMap Nominatim) ---------- */
window.__GEOC=window.__GEOC||{};
const NOM='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&accept-language='+'vi'+'&viewbox=106.3,11.2,107.1,10.3&q=';
const shortName=r=>String(r.display_name||r.name||'').split(',').slice(0,3).join(',').trim();
async function lookup(text,many){const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),5000);let r;try{r=await fetch(NOM+encodeURIComponent(text),{signal:ac.signal})}finally{clearTimeout(tm)}if(!r.ok)throw new Error('geo');const a=await r.json();return many?a:a[0]}
async function ensureGeo(text){const k=String(text||'').trim().toLowerCase();const f0=findPl(text);if(!k||window.__GEOC[k]||(f0&&!f0.approx))return;try{const r=await lookup(text,false);if(r)window.__GEOC[k]={name:String(text).trim(),lat:+r.lat,lng:+r.lon}}catch(e){}}
let gTm=0;function suggest(inp){clearTimeout(gTm);const v=inp.value.trim();const f1=findPl(v);if(v.length<4||(f1&&!f1.approx))return;gTm=setTimeout(async()=>{try{const a=await lookup(v,true);const dl=$('dl');dl.querySelectorAll('[data-g]').forEach(o=>o.remove());a.forEach(r=>{const n=shortName(r);if(!n)return;window.__GEOC[n.toLowerCase()]={name:n,lat:+r.lat,lng:+r.lon};const o=document.createElement('option');o.value=n;o.dataset.g=1;dl.appendChild(o)})}catch(e){}},550)}
/* old datalist suggester replaced by the map suggestion panel (acP) */
$('tLoc').onclick=()=>{if(!navigator.geolocation){toast(t('tr_noloc'));return}navigator.geolocation.getCurrentPosition(p=>{window.__GEOC['my location']={name:'My location',lat:p.coords.latitude,lng:p.coords.longitude};$('tFr').value='My location'},()=>toast(t('tr_noloc')),{timeout:8000})};
const jScroll=()=>{const o=$('tOut');window.scrollTo({top:Math.max(0,o.getBoundingClientRect().top+scrollY-84),behavior:'smooth'})};
const planNow=async e=>{if(e&&e.preventDefault)e.preventDefault();applyWhen();['tFr','tTo'].forEach(i=>{if(!$(i).value.trim()&&$(i).placeholder)$(i).value=$(i).placeholder});const em=!$('tFr').value.trim()?$('tFr'):!$('tTo').value.trim()?$('tTo'):null;if(em){$('tOut').innerHTML=`<div class="card"><p>${t('tr_need')}</p></div>`;toast(t('tr_need'));em.focus();return}if($('tFr').value.trim().toLowerCase()==$('tTo').value.trim().toLowerCase()){$('tOut').innerHTML=`<div class="card"><h3>${t('tr_same')}</h3></div>`;toast(t('tr_same'));$('tTo').focus();return}if($('tWh').value==='arr'&&!$('tAr').value){const m=t('tr_need_arr');$('tOut').innerHTML=`<div class="card"><p>${m}</p></div>`;toast(m);$('tAr').focus();return}if(TR.busy)return;TR.busy=1;const bt=$('tGo'),bl=bt.textContent;bt.disabled=true;bt.textContent='…';$('tOut').innerHTML=`<div class="card"><p>⏳ ${t('tr_wait')}</p></div>`;jScroll();try{await Promise.race([Promise.all([ensureGeo($('tFr').value),ensureGeo($('tTo').value)]),new Promise(r=>setTimeout(r,3500))]);run()}catch(err){$('tOut').innerHTML=`<div class="card"><h3>${t('tr_none')}</h3><p class="mut">${esc(String(err&&err.message||err))}</p></div>`}finally{TR.busy=0;bt.disabled=false;bt.textContent=bl}setTimeout(jScroll,80);setTimeout(jScroll,700)};$('tripF').onsubmit=planNow;$('tGo').addEventListener('click',planNow);
['tSt','tEg','tAl'].forEach(i=>$(i).onchange=()=>{mirrorVeh();if(TR.res)run()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-sugg]');if(!b)return;const k=b.dataset.sugg.split(':');$('tSt').value=({walk:'none',hail:'hail',auto:'auto'})[k[0]]||'none';$('tEg').value=({walk:'none',bikehail:'bikehail',hail:'hail',auto:'auto'})[k[1]]||'none';mirrorVeh();run()});
$('tTm').value=fmt(nowM());

/* ---------- strings: moved to src/js/i18n/journey-strings.js ---------- */

/* ---------- hook into the shell ---------- */
const _lang=lang;lang=function(){_lang();if(TR.res)draw()};
KB.push([/journey|metro|park|last mile|hành trình|tàu điện|gửi xe|đỗ xe|đoạn cuối/i,'trip','Journey: plan door to door with bus, metro, parking and the last mile, with clock times, speeds and weather.','Hành trình: lên kế hoạch từ cửa tới cửa với xe buýt, metro, gửi xe và đoạn cuối, có giờ giấc, tốc độ và thời tiết.']);

document.addEventListener('click',e=>{let b=e.target.closest('[data-jf]');if(b&&TR.res){TR.f=b.dataset.jf;if(TR.f=='pub'){if(/^(bike|car)$/.test($('tSt').value))$('tSt').value='none'}else if(TR.f=='priv'&&!/^(bike|car)$/.test($('tSt').value))$('tSt').value='bike';mirrorVeh();run();return}
 b=e.target.closest('[data-juse]');if(!b||!TR.q)return;let w=b.dataset.juse,veh=b.dataset.veh,info=null;if(b.dataset.ji!=null&&TR.res){const J=TR.res.journeys[+b.dataset.ji],o=J.legs.find(l=>l.mode=='own'),hl=J.legs.some(l=>l.mode=='hail'||l.mode=='bikehail'),pt=J.legs.some(l=>l.mode=='brt'||l.mode=='metro');w=o?'priv':hl&&!pt?'pool':'pub';veh=o?o.veh:'bike';info={dep:J.depart,arr:J.arrive}}else if(b.dataset.jdep)info={dep:b.dataset.jdep,arr:b.dataset.jarr||''};jyCarry(w,veh,info)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-jmix]');if(!b||!TR.res)return;const f=j=>j.role=='transit'&&j.legs.some(l=>['own','hail','bikehail'].includes(l.mode));let i=TR.res.journeys.findIndex(f);if(i>=0){TR.f='all';TR.sel=i;draw();const o=$('tOut').children[4];if(o)o.scrollIntoView({behavior:'smooth',block:'start'})}});
Object.assign(K.en,{tr_loc:'📍 Use my location',tr_noloc:'Could not get your location.',eta:'Estimated arrival',pv_nopub:'Public transit is not running at this time for this trip. Try an earlier time.',al_cmp:'Compare options',jf_all:'All',jf_priv:'Private vehicle',jf_pub:'Public transport',pv_t:'Private vs public',pv_p:'Your motorbike, your car and public transport for this trip, side by side.',pv_none:'No option for this trip.',pv_fast:'Fastest',pv_cheap:'Cheapest',pv_dry:'Driest'});
Object.assign(K.en,{tr_start_t:'Start at',tr_arr_t:'Arrive time (optional)',tr_tm_hint:'Fill both: we plan from your start time and check you arrive on time. Clear Start time and fill Arrive time to plan backwards.',ontime:'On time',tr_ar_chk:'Arrive check',tr_s_bike:'Motorbike',tr_s_car:'Car',ds_theme:'Light / dark mode',pv_mix:'Mixed (example)',pv_ex:'Example, optional',pv_ans:'Our answer',pv_mixfast:'a mix could save {n} min if you want it',pv_nomix:'No mixed example for this trip.',pv_nopub:'No public-transport-only route: a stop is too far to walk or service is not running. See the mixed example.',pv_p:'Private only, public only, and a mixed example. You are never forced to combine them.',tr_same:'From and To are the same place. Pick a different destination.',tr_wait:'Planning your journey…'});
Object.assign(K.vi,{tr_loc:'📍 Dùng vị trí của tôi',tr_noloc:'Không lấy được vị trí của bạn.',eta:'Dự kiến đến nơi',pv_nopub:'Lúc này phương tiện công cộng không chạy cho chuyến này. Hãy thử giờ sớm hơn.',al_cmp:'So sánh phương án',jf_all:'Tất cả',jf_priv:'Xe riêng',jf_pub:'Công cộng',pv_t:'Xe riêng và công cộng',pv_p:'Xe máy, ô tô của bạn và phương tiện công cộng cho chuyến này, đặt cạnh nhau.',pv_none:'Không có phương án cho chuyến này.',pv_fast:'Nhanh nhất',pv_cheap:'Rẻ nhất',pv_dry:'Ít mưa nhất'});
Object.assign(K.vi,{tr_start_t:'Giờ xuất phát',tr_arr_t:'Giờ đến (tuỳ chọn)',tr_tm_hint:'Điền cả hai: lên kế hoạch từ giờ xuất phát và kiểm tra có đến đúng giờ không. Xoá giờ xuất phát và chỉ điền giờ đến để tính ngược.',ontime:'Đúng giờ',tr_ar_chk:'Kiểm tra giờ đến',tr_s_bike:'Xe máy',tr_s_car:'Ô tô',ds_theme:'Chế độ sáng / tối',pv_mix:'Kết hợp (ví dụ)',pv_ex:'Ví dụ, không bắt buộc',pv_ans:'Câu trả lời',pv_mixfast:'nếu muốn, kết hợp có thể nhanh hơn {n} phút',pv_nomix:'Không có ví dụ kết hợp cho chuyến này.',pv_nopub:'Không có tuyến chỉ đi công cộng: trạm quá xa để đi bộ hoặc xe chưa chạy. Xem ví dụ kết hợp.',pv_p:'Chỉ xe riêng, chỉ công cộng và một ví dụ kết hợp. Bạn không bị ép phải kết hợp.',tr_same:'Điểm đi và điểm đến trùng nhau. Hãy chọn điểm đến khác.',tr_wait:'Đang lên hành trình…'});

/* ---------- Journey: Start/Arrive switch, hand-off to other pages (self-contained) ---------- */
Object.assign(K.en,{tr_mode_dep:'Start at',tr_mode_arr:'Arrive by',tr_arr_opt:'Must arrive by (optional)',tr_arr_req:'Arrive by',
 tr_hint_dep:'Pick the time you leave. We show when you will arrive.',
 tr_hint_arr:'We plan backwards: tell us when you must arrive and we find when to leave.',
 tr_need_arr:'Enter the time you need to arrive.'});
Object.assign(K.vi,{tr_mode_dep:'Xuất phát lúc',tr_mode_arr:'Đến nơi lúc',tr_arr_opt:'Phải đến trước (tuỳ chọn)',tr_arr_req:'Giờ đến nơi',
 tr_hint_dep:'Chọn giờ bạn xuất phát. Chúng tôi cho biết giờ bạn đến nơi.',
 tr_hint_arr:'Hệ thống tính ngược: cho biết giờ bạn phải đến, chúng tôi tìm giờ nên đi.',
 tr_need_arr:'Hãy nhập giờ bạn cần đến nơi.'});
function jySafe(fn){try{return fn()||''}catch(e){console.warn('Pathfinder: section skipped',e);return''}}
const userSet=()=>$('tTm').dataset.touched==='1';
function applyWhen(){const ar=$('tAr').value,m=(ar&&!userSet())?'arr':'dep';$('tWh').value=m;
 if(m==='arr')$('tTm').value='';else if(!userSet())$('tTm').value=fmt(nowM());
 $('tStL').classList.toggle('off',m==='arr');$('tArW').classList.toggle('off',m==='dep'&&!ar)}
function setWh(m,time){if(m==='arr'){delete $('tTm').dataset.touched;$('tAr').value=time||$('tAr').value||fmt(Math.ceil((nowM()+60)/30)*30)}
 else if(time){$('tTm').value=time;$('tTm').dataset.touched='1'}else delete $('tTm').dataset.touched;applyWhen()}
$('tTm').addEventListener('input',()=>{if($('tTm').value)$('tTm').dataset.touched='1';applyWhen()});
$('tTm').addEventListener('change',()=>{if(!$('tTm').value)delete $('tTm').dataset.touched;applyWhen();if(TR.res)run()});
$('tAr').addEventListener('input',applyWhen);$('tAr').addEventListener('change',()=>{applyWhen();if(TR.res)run()});
setInterval(()=>{if(!userSet()&&$('tWh').value==='dep'){const v=fmt(nowM());if($('tTm').value!==v)$('tTm').value=v}},15000);
/* nearest bus/BRT stops that a real line connects, so the public page never opens empty */
function jyStops(from,to){const ks=Object.keys(STOPS),dist=(pt,k)=>hav(pt.lat,pt.lng,STOPS[k].lat,STOPS[k].lng),
 conn=(o,d)=>ROUTES.some(r=>{const i=r.stops.findIndex(x=>x[0]===o),j=r.stops.findIndex(x=>x[0]===d);return i>=0&&j>i});
 let best=null,alt=null;
 ks.forEach(a=>ks.forEach(b=>{if(a===b)return;const sc=dist(from,a)+dist(to,b);
  if(conn(a,b)){if(!best||sc<best.sc)best={o:a,d:b,sc}}else if(!alt||sc<alt.sc)alt={o:a,d:b,sc}}));
 return best||alt}
/* carry the journey inputs into the page the traveller chose: nothing is left blank */
function jyCarry(w,veh,info){const q=TR.q;if(!q||!q.fromText||!q.toText)return false;
 const rq=TR.res&&TR.res.request,J0=TR.res&&TR.res.journeys&&TR.res.journeys[TR.sel];
 if(!info&&J0)info={dep:J0.depart,arr:J0.arrive};
 const dep=(info&&info.dep)||(!q.arr&&q.time)||fmt(nowM()),by=q.by||(q.arr?q.time:'')||(info&&info.arr)||'';
 if(w==='priv'){$('pfr').value=q.fromText;$('pto').value=q.toText;$('pveh').value=veh==='car'?'car':'bike';$('pmm').value='d';$('ptm').value=dep;
  show('priv');$('pf').requestSubmit();return true}
 if(w==='pool'){const nm=(txt,pt)=>/^my location$/i.test(txt)&&pt?pt.lat+','+pt.lng:txt;
  $('sfr').value=nm(q.fromText,rq&&rq.from);$('sto').value=nm(q.toText,rq&&rq.to);show('pool');$('sf').requestSubmit();return true}
 const st=rq?jyStops(rq.from,rq.to):null;if(st){$('o').value=st.o;$('d').value=st.d}
 $('av').value=dep;let de=by;if(!de||toMin(de)<toMin(dep))de=fmt(toMin(dep)+45);$('de').value=de;
 try{PUB.sel=null}catch(e){}show('pub');pub();return true}
window.PFJ={carry:jyCarry,ready:()=>!!(TR.q&&TR.q.fromText&&TR.q.toText),get q(){return TR.q},get res(){return TR.res}};


/* ---------- popular destinations ---------- */
const PCAT={work:['shtp','pmh','kcx','qtsc','sala','vgp','td','tdc'],uni:['vnu','bk','khxh','ueh','sgu','tdt','hcmute','nl','fpt','ump'],hosp:['cr','nd1','tn'],park:['tao','ds','st','p239','tcv'],mall:['l81','aeontp','aeonbt','giga','cres','vanh','cbt','cbtay','ctd'],sight:['ndb','dic','nh','bitex'],stn:['bt','mst','tsn','gsg','bxmd','bxmdc','bxmt']};
let PC='work',LASTIN='tTo';['tFr','tTo'].forEach(i=>$(i).addEventListener('focus',()=>LASTIN=i));
function popDraw(){$('tPopC').innerHTML=Object.keys(PCAT).map(c=>`<button type="button" class="b" aria-pressed="${PC==c}" data-pc="${c}">${t('pc_'+c)}</button>`).join('');$('tPopL').innerHTML=PCAT[PC].map(k=>`<button type="button" class="b alt" data-pp="${k}">${pn(k)}</button>`).join('')}
document.addEventListener('click',e=>{let b=e.target.closest('[data-pc]');if(b){PC=b.dataset.pc;popDraw();return}b=e.target.closest('[data-pp]');if(b){const i=$(LASTIN);i.value=pn(b.dataset.pp);i.dispatchEvent(new Event('change'))}});
window.popDraw=popDraw;popDraw();
Object.assign(K.en,{tr_start_t:'Start at',tr_arr_req:'Arrive by',tr_hint_one:'Fill one time: when you leave, or when you must arrive. We work out the other for you.',tr_pop:'Popular destinations',pc_work:'Work areas',pc_uni:'Universities',pc_hosp:'Hospitals',pc_park:'Parks',pc_mall:'Malls and markets',pc_sight:'Landmarks',pc_stn:'Stations',tr_nofind:'We could not find:',approx:'Position is approximate (area centre) because the exact address could not be looked up. Go online for exact addresses.'});
Object.assign(K.vi,{tr_start_t:'Xuất phát lúc',tr_arr_req:'Đến nơi lúc',tr_hint_one:'Điền một giờ: giờ bạn đi hoặc giờ bạn phải đến. Chúng tôi tính giờ còn lại.',tr_pop:'Điểm đến phổ biến',pc_work:'Khu làm việc',pc_uni:'Đại học',pc_hosp:'Bệnh viện',pc_park:'Công viên',pc_mall:'TTTM và chợ',pc_sight:'Địa danh',pc_stn:'Ga, bến xe',tr_nofind:'Không tìm thấy:',approx:'Vị trí là ước lượng (trung tâm khu vực) vì chưa tra được địa chỉ chính xác. Hãy kết nối mạng để tra địa chỉ chính xác.'});
const _show=show;show=function(v){if(v=='plan')v='trip';_show(v);if(v=='trip')compare()};
Object.assign(K.en,{tr_when:'When',tr_mode_dep:'Leave at',tr_mode_arr:'Arrive by',tr_hint_one:'Choose Leave at or Arrive by, then one time. We work out the other for you.',tr_start:'Start by',tr_finish:'Finish by',tr_nv:'None (on foot)',tr_s_auto:'Let Pathfinder choose',tr_s_mybike:'My motorbike',tr_s_mycar:'My car',tr_try:'Nothing reaches with these choices. Tap one to try it:'});
Object.assign(K.vi,{tr_when:'Thời gian',tr_mode_dep:'Đi lúc',tr_mode_arr:'Đến nơi lúc',tr_hint_one:'Chọn Đi lúc hoặc Đến nơi lúc, rồi nhập một giờ. Chúng tôi tính giờ còn lại.',tr_start:'Bắt đầu bằng',tr_finish:'Kết thúc bằng',tr_nv:'Không (đi bộ)',tr_s_auto:'Để Pathfinder chọn',tr_s_mybike:'Xe máy của tôi',tr_s_mycar:'Ô tô của tôi',tr_try:'Không có lộ trình với lựa chọn này. Bấm để thử:'});
setWh($('tWh').value);lang();if(CUR=='plan')show('trip');
{const q=new URLSearchParams(location.search);if(q.get('from')&&q.get('to')){$('tFr').value=q.get('from');$('tTo').value=q.get('to');if(q.get('arrive')){$('tAr').value=q.get('arrive');if(!q.get('at'))$('tTm').value=''}if(q.get('at'))$('tTm').value=q.get('at');{const am=q.get('arrive')&&!q.get('at');setWh(am?'arr':'dep',am?q.get('arrive'):(q.get('at')||null))}
 {const vv=q.get('vehicle'),ss=q.get('start');$('tSt').value=(vv=='bike'||vv=='car')?vv:({walk:'none',hail:'hail',auto:'auto'})[ss]||'none';const ee=q.get('egress');$('tEg').value=({walk:'none',bikehail:'bikehail',hail:'hail',auto:'auto'})[ee]||'none';mirrorVeh()}$('tAl').checked=q.get('alley')=='1';show('trip');run()}}
})();
