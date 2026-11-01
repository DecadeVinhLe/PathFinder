/* Home hero: a board comparing the ways to travel on a sample trip (sample numbers) */
/* ---------- hero: comparison board ---------- */
(function(){
const box=document.getElementById('heroBoard');if(!box)return;
/* comparison board: minutes for a sample 14 km trip, scaled by the current rush-hour level and by rain */
const MODES=[['metro',33,20,0],['bike',36,12,1],['bus',58,7,1],['car',41,55,1],['ride',42,95,1]];
function board(){const n=new Date(),h=n.getHours()+n.getMinutes()/60,L=lv(h),f=[.9,1,1.3,1.6][L],rain=WX&&WX.rain;
 const R=MODES.map(([k,m,c,road])=>{let min=Math.round(road?m*f:m),note=road&&L>=2?t('hb_jam').replace('{n}',min-m):t('hb_clear');if(k=='bike'&&rain){min+=8;note=t('hb_rain')}return{k,min,c,note}}).sort((a,b)=>a.min-b.min);
 const cheap=R.reduce((x,y)=>y.c<x.c?y:x);
 box.innerHTML=`<div class="bd-h"><b>${t('hb_head')}</b><span>${t('hb_now')} · ${('0'+n.getHours()).slice(-2)}:${('0'+n.getMinutes()).slice(-2)}</span></div><div class="bd-r bd-th"><span></span><span>${t('hb_mode')}</span><span>${t('hb_min')}</span><span>${t('hb_cost')}</span></div>`+R.map((r,i)=>`<div class="bd-r"><span class="bd-i">${('0'+(i+1)).slice(-2)}</span><span class="bd-m">${t('hb_m_'+r.k)}<small>${r.note}</small></span><span class="bd-t"><b>${r.min}</b></span><span class="bd-c">${r.c}k${i==0?`<em>${t('hb_fast')}</em>`:r===cheap?`<em class="c">${t('hb_cheap')}</em>`:''}</span></div>`).join('')+`<p class="bd-n">${t('hb_note')}</p>`}
board();setTimeout(board,3000);setInterval(board,60000);
const _l=lang;lang=function(){_l.apply(this,arguments);board()};
})();
