/* Rush-hour windows, crowd levels, quieter-slot suggestions */
/* =========================================================
   3. CAO ĐIỂM
   ========================================================= */
const SLOT_MIN = 15;
const PEAK_WINDOWS = [ [7*60, 9*60], [11*60+30, 13*60], [16*60+30, 19*60] ];
const isPeak = m => PEAK_WINDOWS.some(([a,b]) => m >= a && m < b);

function baseLoad(m){
  const h = m / 60;
  if (h >= 7  && h < 8.5) return 3;
  if (h >= 8.5 && h < 9.5) return 2;
  if (h >= 11.5 && h < 13) return 2;
  if (h >= 16.5 && h < 18.5) return 3;
  if (h >= 18.5 && h < 19.5) return 2;
  if (h >= 6  && h < 7)  return 1;
  if (h >= 9.5 && h < 11.5) return 1;
  if (h >= 19.5 && h < 21) return 1;
  return 0;
}
const CROWD = ['Vắng','Thoải mái','Đông','Rất đông'];

/* giờ bạn khai báo đi lúc đông -> gợi ý các khung gần kề ít đông hơn */
function peakSuggestions(declaredMin){
  const out = [];
  const start = Math.max(5*60, Math.min(21*60, Math.floor(declaredMin/SLOT_MIN)*SLOT_MIN));
  for (let t = start - 4*SLOT_MIN; t <= start + 4*SLOT_MIN; t += SLOT_MIN){
    if (t < 5*60 || t > 21*60 + 45) continue;
    out.push({ t, peak:isPeak(t), crowd:baseLoad(t) });
  }
  return out.sort((a,b) => (a.peak - b.peak) || (a.crowd - b.crowd) || (Math.abs(a.t-declaredMin) - Math.abs(b.t-declaredMin)));
}
