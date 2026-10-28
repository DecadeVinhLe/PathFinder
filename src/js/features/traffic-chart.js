/* Hourly traffic chart (SVG) */
function mono(P){const n=P.length,d=[],m=[];for(let i=0;i<n-1;i++)d[i]=(P[i+1][1]-P[i][1])/(P[i+1][0]-P[i][0]);m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
for(let i=0;i<n-1;i++){if(d[i]==0){m[i]=m[i+1]=0}else{const a=m[i]/d[i],b=m[i+1]/d[i],q=a*a+b*b;if(q>9){const k=3/Math.sqrt(q);m[i]=k*a*d[i];m[i+1]=k*b*d[i]}}}
let p='M'+P[0][0].toFixed(1)+' '+P[0][1].toFixed(1);for(let i=0;i<n-1;i++){const w=(P[i+1][0]-P[i][0])/3;p+='C'+(P[i][0]+w).toFixed(1)+' '+(P[i][1]+m[i]*w).toFixed(1)+' '+(P[i+1][0]-w).toFixed(1)+' '+(P[i+1][1]-m[i+1]*w).toFixed(1)+' '+P[i+1][0].toFixed(1)+' '+P[i+1][1].toFixed(1)}return p}
function chart(){const h=hour(),hr=[];for(let i=5;i<=23;i++)hr.push(i);const raw=hr.map(i=>IDX[lv(i+.5)]),sm=raw.map((v,i)=>(v*2+raw[Math.max(0,i-1)]+raw[Math.min(raw.length-1,i+1)])/4);
Q('#ch0,#ch1,#ch2,#ch3').forEach(el=>{el.innerHTML=`<h3>${t('chart')}</h3><div class="lc"></div><div class="lg"><span><b class="k1"></b>${t('ch_ln')}</span><span><b class="k2"></b>${t('ch_sp')}</span>${[0,1,2,3].map(l=>`<span class="L${l}"><i></i>${t('lv'+l)}</span>`).join('')}</div><p class="mut">${t('chart_n')}: <b>${t('lv'+lv(h))}</b> (~${IDX[lv(h)]}%)</p><p class="mut">${t('tt_note')}</p>`;
const c=el.querySelector('.lc'),W=Math.max(280,c.clientWidth||640),H=W<480?230:280,L=38,R=12,T=26,B=28,iw=W-L-R,ih=H-T-B,X=i=>L+(i-5)/18*iw,Y=v=>T+ih-(v/100)*ih;
const P=sm.map((v,k)=>[X(hr[k]),Y(v)]),line=raw.map((v,k)=>(k?'L':'M')+X(hr[k]).toFixed(1)+' '+Y(v).toFixed(1)).join(''),sp=mono(P);
let g='';[0,25,50,75,100].forEach(v=>g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L-8}" y="${Y(v)+4}" text-anchor="end">${v}%</text>`);
hr.forEach(i=>{if(i%3==2)g+=`<text class="ax" x="${X(i)}" y="${H-8}" text-anchor="middle">${i}:00</text>`});
const cur=Math.floor(h),ok=cur>=5&&cur<=23;let mk='',tp='';
hr.forEach((i,k)=>{const l=lv(i+.5),sel=ok&&i==cur;mk+=`<circle class="pt L${l}" cx="${X(i)}" cy="${Y(raw[k])}" r="${sel?7:4.5}" style="fill:var(--lc)"><title>${i}:00 · ${t('lv'+l)} · ${raw[k]}%</title></circle>`});
if(ok){const k=cur-5,x=X(cur),y=Y(raw[k]),lab=cur+':00 · '+raw[k]+'%',tw=lab.length*7.4+16,tx=Math.min(Math.max(x-tw/2,2),W-tw-2);tp=`<line class="cur" x1="${x}" x2="${x}" y1="${T-4}" y2="${T+ih}"/><rect class="tip" x="${tx}" y="0" width="${tw}" height="22" rx="11"/><text class="tipt" x="${tx+tw/2}" y="15" text-anchor="middle">${lab}</text>`}
c.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('chart')}"><defs><linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ac)" stop-opacity=".28"/><stop offset="1" style="stop-color:var(--ac)" stop-opacity="0"/></linearGradient></defs>${g}<path class="ar" d="${sp}L${X(23)} ${Y(0)}L${X(5)} ${Y(0)}Z"/>${tp}<path class="ln" d="${line}"/><path class="sp" d="${sp}"/>${mk}</svg>`})}
let _cr;addEventListener('resize',()=>{clearTimeout(_cr);_cr=setTimeout(chart,150)});
