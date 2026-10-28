/* Map place suggestions for Journey, Private vehicle and Shared ride */
/* Map place suggestions for Journey, Private vehicle and Shared ride (Public transit unchanged) */
(function(){
const IDS=['tFr','tTo','pfr','pto','sfr','sto'],NEXT={tFr:'tTo',pfr:'pto',sfr:'sto'};
const URL0='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=vn&accept-language=vi&viewbox=106.3,11.2,107.1,10.3&q=';
const T={en:{loc:'Use my current location',me:'My location',rec:'Recent',pop:'Popular places',saved:'Saved places',none:'No places found. Try a landmark, street or district.',wait:'Searching the map…',off:'Map search is unavailable right now. Showing saved places only.',locf:'Could not get your location.',pp:'Popular place',area:'Area'},
vi:{loc:'Dùng vị trí hiện tại của tôi',me:'Vị trí của tôi',rec:'Gần đây',pop:'Địa điểm phổ biến',saved:'Địa điểm có sẵn',none:'Không tìm thấy. Thử tên địa danh, đường hoặc quận.',wait:'Đang tìm trên bản đồ…',off:'Hiện không tìm được trên bản đồ. Chỉ hiển thị địa điểm có sẵn.',locf:'Không lấy được vị trí của bạn.',pp:'Địa điểm phổ biến',area:'Khu vực'}};
const isVi=()=>typeof LG!=='undefined'&&LG==='vi',L=k=>T[isVi()?'vi':'en'][k];
const nz=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const P=document.createElement('div');P.id='acP';P.hidden=true;P.setAttribute('role','listbox');document.body.appendChild(P);
const cur={inp:null,items:[],idx:-1},cache={};let tm=0,ctl=null;
function locals(){const o=[];
 if(typeof PL!=='undefined')for(const k in PL){const p=PL[k][0].split('|');o.push({n:p[isVi()?0:1]||p[0],alt:p.join(' '),ic:'📍',s:L('pp')})}
 if(typeof AR!=='undefined')AR.forEach(a=>o.push({n:a[0],alt:a[0],ic:'🏙️',s:L('area')}));return o}
const RK='pf_recent';
function recents(){try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return[]}}
function remember(it){if(it.act)return;const o={n:it.n,s:it.s,v:it.v,lat:it.lat,lng:it.lng,g:it.g?1:0};try{const a=recents().filter(x=>(x.v||x.n)!==(o.v||o.n));a.unshift(o);localStorage.setItem(RK,JSON.stringify(a.slice(0,5)))}catch(e){}}
function icon(r){const c=r.category||r.class,t=r.type;
 return t==='bus_stop'||t==='bus_station'?'🚌':(c==='railway'||t==='station'||t==='subway_entrance')?'🚇':t==='aerodrome'?'✈️':(t==='hospital'||t==='clinic')?'🏥':(t==='university'||t==='school'||t==='college')?'🎓':(c==='shop'||t==='mall'||t==='marketplace')?'🛍️':t==='cafe'?'☕':(t==='restaurant'||t==='fast_food')?'🍜':(t==='hotel'||t==='hostel')?'🏨':(c==='tourism'||c==='leisure')?'🌳':(c==='place'||c==='boundary')?'🏙️':c==='highway'?'🛣️':'📍'}
function mapItems(a){const seen={};return a.map(r=>{const parts=String(r.display_name||'').split(',').map(x=>x.trim()).filter(Boolean),nm=r.name||parts[0];if(!nm)return null;
 const v=parts.slice(0,3).join(', ');if(seen[v])return null;seen[v]=1;
 return{n:nm,s:parts.filter(x=>x!==nm).slice(0,3).join(', '),v,lat:+r.lat,lng:+r.lon,g:1,ic:icon(r)}}).filter(Boolean)}
function place(){const r=cur.inp.getBoundingClientRect(),below=innerHeight-r.bottom-12;const w=Math.min(Math.max(r.width,360),innerWidth-16);P.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';P.style.width=w+'px';
 if(below<200&&r.top>below){P.style.top='auto';P.style.bottom=(innerHeight-r.top+6)+'px';P.style.maxHeight=Math.min(360,r.top-12)+'px'}
 else{P.style.bottom='auto';P.style.top=(r.bottom+6)+'px';P.style.maxHeight=Math.min(360,below)+'px'}}
function paint(secs,msg,foot){let h='',i=0;cur.items=[];
 secs.forEach(([t,list])=>{if(t)h+=`<div class="ac-h">${esc(t)}</div>`;list.forEach(it=>{cur.items.push(it);h+=`<div class="ac-i" role="option" id="ac${i}" data-i="${i}"><span class="ac-ic">${it.ic}</span><span class="ac-t"><b>${esc(it.n)}</b>${it.s?`<small>${esc(it.s)}</small>`:''}</span></div>`;i++})});
 if(msg)h+=`<div class="ac-m">${esc(msg)}</div>`;if(foot)h+='<div class="ac-f">© OpenStreetMap contributors</div>';
 P.innerHTML=h;cur.idx=-1;P.hidden=false;cur.inp.setAttribute('aria-expanded','true');place()}
function show(inp){cur.inp=inp;const q=inp.value.trim(),n=nz(q);
 if(!q){const r=recents().map(x=>({...x,ic:'🕘'})),pp=locals().filter(x=>x.s===L('pp')).slice(0,6),s=[['',[{act:'loc',ic:'📍',n:L('loc')}]]];
  if(r.length)s.push([L('rec'),r]);s.push([L('pop'),pp]);return paint(s)}
 const s=[],loc=locals().filter(x=>nz(x.alt).includes(n)).slice(0,4);if(loc.length)s.push([L('saved'),loc]);
 let msg='',foot=0;
 if(q.length>=3){const c=cache[q];if(c===undefined)msg=L('wait');else if(c===null)msg=L('off');else{const m=mapItems(c);if(m.length){s.push([isVi()?'Từ bản đồ':'From the map',m]);foot=1}else if(!loc.length)msg=L('none')}}
 else if(!loc.length)msg=L('none');
 paint(s,msg,foot)}
function search(inp,q){clearTimeout(tm);if(q.length<3||cache[q]!==undefined)return;
 tm=setTimeout(async()=>{if(ctl)ctl.abort();const my=ctl=new AbortController(),to=setTimeout(()=>my.abort(),6000);
  try{const r=await fetch(URL0+encodeURIComponent(q),{signal:my.signal});if(!r.ok)throw 0;cache[q]=await r.json()}
  catch(e){if(ctl!==my)return;cache[q]=null}finally{clearTimeout(to)}
  if(document.activeElement===inp&&inp.value.trim()===q)show(inp)},380)}
function close(){P.hidden=true;if(cur.inp)cur.inp.setAttribute('aria-expanded','false')}
function geoloc(inp){close();if(!navigator.geolocation){typeof toast==='function'&&toast(L('locf'));return}
 navigator.geolocation.getCurrentPosition(p=>{const v=L('me');window.__GEOC=window.__GEOC||{};window.__GEOC[v.toLowerCase()]={name:v,lat:p.coords.latitude,lng:p.coords.longitude};inp.value=v;inp.dispatchEvent(new Event('change',{bubbles:true}))},()=>{typeof toast==='function'&&toast(L('locf'))},{enableHighAccuracy:true,timeout:8000})}
function choose(it){const inp=cur.inp;if(it.act==='loc')return geoloc(inp);const v=it.v||it.n;inp.value=v;
 if(it.g){window.__GEOC=window.__GEOC||{};window.__GEOC[v.toLowerCase()]={name:v,lat:+it.lat,lng:+it.lng}}
 remember(it);close();inp.dispatchEvent(new Event('change',{bubbles:true}));
 const nx=NEXT[inp.id]&&document.getElementById(NEXT[inp.id]);if(nx&&!nx.value.trim())nx.focus()}
function mv(d){const n=cur.items.length;if(!n)return;cur.idx=cur.idx<0?(d>0?0:n-1):(cur.idx+d+n)%n;
 P.querySelectorAll('.ac-i').forEach((e,i)=>e.classList.toggle('on',i===cur.idx));const e=document.getElementById('ac'+cur.idx);if(e)e.scrollIntoView({block:'nearest'});cur.inp.setAttribute('aria-activedescendant','ac'+cur.idx)}
IDS.forEach(id=>{const inp=document.getElementById(id);if(!inp)return;
 inp.removeAttribute('list');inp.setAttribute('autocomplete','off');inp.setAttribute('role','combobox');inp.setAttribute('aria-autocomplete','list');inp.setAttribute('aria-controls','acP');inp.setAttribute('aria-expanded','false');
 inp.addEventListener('input',()=>{show(inp);search(inp,inp.value.trim())});
 inp.addEventListener('focus',()=>{show(inp);search(inp,inp.value.trim())});
 inp.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==inp)close()},150));
 inp.addEventListener('keydown',e=>{if(P.hidden||cur.inp!==inp)return;
  if(e.key==='ArrowDown'){e.preventDefault();mv(1)}else if(e.key==='ArrowUp'){e.preventDefault();mv(-1)}
  else if(e.key==='Enter'&&cur.idx>=0){e.preventDefault();e.stopPropagation();choose(cur.items[cur.idx])}
  else if(e.key==='Escape')close()})});
P.addEventListener('mousedown',e=>e.preventDefault());
P.addEventListener('click',e=>{const el=e.target.closest('.ac-i');if(el)choose(cur.items[+el.dataset.i])});
addEventListener('resize',()=>{if(!P.hidden)place()});addEventListener('scroll',()=>{if(!P.hidden)place()},true);
})();
