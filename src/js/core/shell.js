/* App shell: view router, language, theme, form wiring */
/* shell */
function show(v){CUR=v;Q('section').forEach(s=>s.hidden=s.id!='v-'+v);Q('#nav [data-v]').forEach(b=>b.toggleAttribute('aria-current',b.dataset.v==v));$('trB').toggleAttribute('aria-current',['priv','pub','pool'].includes(v));$('dd').classList.remove('open');if(v=='priv'&&!$('pmap').src)$('pmap').src=mapUrl(PL.tdc[1]+','+PL.tdc[2]+'('+pn('tdc')+')','','','',12);if(v=='pool'&&!$('smap').src)$('smap').src=mapUrl('');if(v=='plan')compare();if(v=='pub')pub();chart();location.hash=v;scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b){e.preventDefault();show(b.dataset.v)}else if(!e.target.closest('.ddw'))$('dd').classList.remove('open')});
$('trB').onclick=()=>$('dd').classList.toggle('open');$('mnuB').onclick=()=>{const o=$('nav').classList.toggle('open');$('mnuB').setAttribute('aria-expanded',o)};document.addEventListener('click',e=>{if(e.target.closest('#nav [data-v]'))$('nav').classList.remove('open')});$('yr').textContent=new Date().getFullYear();{const lg=document.querySelector('.brand img').src;$('fav').href=lg;document.querySelectorAll('.fb img').forEach(i=>i.src=lg)};
function lang(){document.documentElement.lang=LG;Q('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));$('lgB').textContent=LG=='vi'?'EN':'VI';$('feats').innerHTML=[1,2,3,4,5,6].map(i=>`<div class="card"><div class="em">${['⚖️','📈','⛅','🆚','🎫','🧭'][i-1]}</div><h3>${t('f'+i+'t')}</h3><p class="mut">${t('f'+i+'d')}</p><button class="b" data-v="${['plan','pub','home','plan','vou','trip'][i-1]}">${t('open')}</button></div>`).join('');drawWx();ads();vouchers();compare();pub();com();svy();fillDL();if(PV.last)privAlt();if(typeof popDraw=='function')popDraw();watchDraw();alertsDraw();bellDraw();if(CUR=='home')$('wxc').hidden=false}
$('lgB').onclick=()=>{LG=LG=='vi'?'en':'vi';ss('lg',LG);lang()};
const thm=()=>{document.documentElement.dataset.theme=TH;$('thB').textContent=TH=='dark'?'☀️':'🌙';$('thB').title=TH=='dark'?'Light mode':'Dark mode'};$('thB').onclick=()=>{TH=TH=='dark'?'light':'dark';ss('th',TH);thm()};
const opt=(id,a)=>$(id).innerHTML=a;
const ST=[...new Set(ROUTES.flatMap(r=>r.stops.map(s=>s[0])))].sort((a,b)=>STOPS[a].name.localeCompare(STOPS[b].name,'vi')).map(k=>`<option value="${k}">${STOPS[k].name}</option>`).join('');
opt('o',ST);opt('d',ST);$('o').value='hub';$('d').value='village';
Q('select.ar').forEach(s=>s.innerHTML='<option value="">—</option>'+AR.map((a,i)=>`<option value="${i}">${a[0]}</option>`).join(''));
const n0=new Date();$('tm').value=('0'+n0.getHours()).slice(-2)+':'+('0'+n0.getMinutes()).slice(-2);$('ptm').value=$('tm').value;
$('cmp').onclick=compare;$('tm').onchange=compare;$('go').onclick=()=>{PUB.sel=null;pub()};['o','d','av','de','pk'].forEach(i=>$(i).onchange=()=>{PUB.sel=null;pub()});
$('pf').onsubmit=e=>{e.preventDefault();privGo()};
$('sf').onsubmit=e=>{e.preventDefault();$('smap').src=mapUrl('',$('sfr').value||'Ho Chi Minh City',$('sto').value||'Tan Son Nhat Airport')};
