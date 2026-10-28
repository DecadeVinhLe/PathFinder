/* Time helpers + departures per route */
/* =========================================================
   2. THỜI GIAN
   ========================================================= */
const toMin = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
const fmt = m => { m = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0'); };
const dur = m => m <= 0 ? '0 phút'
  : m < 60 ? m + ' phút'
  : (m % 60 === 0 ? (m/60) + ' giờ' : Math.floor(m/60) + ' giờ ' + (m%60) + ' phút');

ROUTES.forEach(r => {
  r.departures = [];
  for (let t = toMin(r.first); t <= toMin(r.last); t += r.headway) r.departures.push(t);
});
