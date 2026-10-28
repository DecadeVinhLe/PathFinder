/* Private vehicle: food stop on the trip */
/* ---------- private: food on the trip ---------- */
let PFC='din';const STOPMIN={din:45,take:8,drk:10};
let PFM=false;
function privFood(){}
document.addEventListener('click',e=>{let b=e.target.closest('[data-pfc]');if(b){PFC=b.dataset.pfc;privFood()}
 if(b=e.target.closest('[data-pfm]')){PFM=!PFM;privFood()}
 b=e.target.closest('[data-pfood]');if(b){const L=PV.last,f=$('pfmap');let q=b.dataset.pfood+' near '+(L&&L.d?L.d:pn('tdc'));if(PFM&&L&&L.A&&L.B)q=b.dataset.pfood+' near '+((L.A.lat+L.B.lat)/2)+','+((L.A.lng+L.B.lng)/2);f.hidden=false;setSrc(f,mapUrl(q))}});
