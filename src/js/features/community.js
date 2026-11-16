/* Community comments + monthly survey */
let CM=[],FL='all';const MK='sv-'+new Date().toISOString().slice(0,7),mon=()=>new Date().toLocaleString(LG=='vi'?'vi-VN':'en-US',{month:'long',year:'numeric'});
function com(){$('cflt').innerHTML=['all','comment','experience','suggestion'].map(x=>`<button class="b" aria-pressed="${FL==x}" data-fl="${x}">${t(x=='all'?'all':'ty_'+x[0])}</button>`).join('');const L=CM.filter(c=>FL=='all'||c.ty==FL),av=CM.length?(CM.reduce((a,c)=>a+c.r,0)/CM.length).toFixed(1):'–';$('cavg').innerHTML=`${t('avg')}: <b>${av} ★</b> (${CM.length})`;
$('clist').innerHTML=L.length?L.map(c=>`<div class="sp" style="padding:10px 0;border-bottom:1px solid var(--line)"><span style="color:#f59e0b">${'★'.repeat(c.r)}${'☆'.repeat(5-c.r)}</span> <span class="tag2">${t('ty_'+c.ty[0])}</span> <span class="tag2">${t('mode_'+c.m)}</span> <span class="mut">${new Date(c.ts).toLocaleDateString()}</span><p style="margin:4px 0">${esc(c.tx)}</p>${c.own?`<button class="b alt" style="min-height:34px;padding:4px 10px" data-cdel="${c.id}">${t('del')}</button>`:''}</div>`).join(''):`<p class="mut">${t('nocm')}</p>`}
function svy(){const d=sg(MK,''),m=mon(),o=(a,f)=>a.map(x=>`<option value="${x}">${f(x)}</option>`).join('');
$('svb').hidden=!!d;$('svb').innerHTML=`<b>${t('sv_open').replace('{m}',m)}</b> <button class="b" data-v="com">${t('sv_go')}</button>`;
$('svc').innerHTML=d?`<h3>📋 ${t('sv_t')}</h3><p>${t('sv_done').replace('{m}',m)}</p>`:`<h3>📋 ${t('sv_t')} · ${m}</h3><div class="f"><label><span>${t('sv_q1')}</span><select id="s1">${o([5,4,3,2,1],x=>x+' ★')}</select></label><label><span>${t('sv_q2')}</span><select id="s2">${o(['bike','car','brt','pool'],x=>t('mode_'+x))}</select></label><label><span>${t('sv_q3')}</span><select id="s3">${o([1,2,3,4,5],x=>t('f'+x+'t'))}</select></label><label><span>${t('sv_q4')}</span><select id="s4">${o(['yes','some','no'],x=>t(x))}</select></label></div><label style="margin-top:8px"><span>${t('sv_q5')}</span><textarea id="s5" rows="2" maxlength="300"></textarea></label><div class="row"><button class="b" id="svsend">${t('sv_send')}</button></div>`}
document.addEventListener('click',e=>{let b=e.target.closest('[data-fl]');if(b){FL=b.dataset.fl;com()}b=e.target.closest('[data-cdel]');if(b){deleteCommunityPost(b)}
if(e.target.id=='svsend'){ss(MK,JSON.stringify({r:$('s1').value,m:$('s2').value,f:$('s3').value,q:$('s4').value,s:$('s5').value,ts:Date.now()}));svy();toast(t('done'))}});
async function communityRequest(path='', options={}) {
  const response=await fetch('/api/community/posts'+path,{...options,headers:{'Content-Type':'application/json'}});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||t('community_error'));
  return data;
}
let communityLoading=false;
async function refreshCommunity(){
  if(communityLoading)return;
  communityLoading=true;
  try {CM=await communityRequest();com();$('cstatus').textContent=t('community_live')}
  catch{$('cstatus').textContent=t('community_error')}
  finally{communityLoading=false}
}
async function deleteCommunityPost(button){
  button.disabled=true;
  try{await communityRequest('/'+button.dataset.cdel,{method:'DELETE'});await refreshCommunity()}
  catch{toast(t('community_error'));button.disabled=false}
}
$('cpost').onclick=async()=>{
  const text=$('ctx').value.trim();if(!text){$('ctx').focus();return}
  const departed=$('cdepart').value,duration=$('cduration').value;
  if((departed&&new Date(departed).getTime()>Date.now())||(duration&&(!Number.isInteger(+duration)||+duration<1||+duration>1440))){toast(t('trip_invalid'));return}
  const button=$('cpost');button.disabled=true;
  try{
    await communityRequest('',{method:'POST',body:JSON.stringify({ty:$('ctype').value,r:+$('crate').value,m:$('cmode').value,tx:text,origin:$('corigin').value,destination:$('cdestination').value,departedAt:departed?new Date(departed).toISOString():null,durationMinutes:duration?+duration:null,congestion:$('ccongestion').value,trainingConsent:$('ctraining').checked})});
    $('ctx').value='';await refreshCommunity();toast(t('done'));
  }catch{toast(t('community_error'))}
  finally{button.disabled=false}
};
refreshCommunity();
setInterval(()=>{if(!document.hidden&&CUR==='com')refreshCommunity()},5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCommunity()});
