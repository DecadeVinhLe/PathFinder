/* Public transit engine: delays, candidates, best pick */
/* =========================================================
   4. ENGINE
   ========================================================= */
function jamDelayFn(route, fromIdx, toIdx, dep){
  if (!route.jamSegments || !route.jamSegments.length) return 0;
  let add = 0;
  for (const s of route.jamSegments){
    if (s.at < fromIdx + 1 || s.at > toIdx) continue;
    const segStart = dep + route.stops[s.at - 1][1];
    if (isPeak(segStart)) add += s.add;
    else if (baseLoad(segStart) >= 2) add += Math.round(s.add / 2);
  }
  return add;
}
function jamsFor(route, fromIdx, toIdx, dep){
  const out = [];
  if (!route.jamSegments) return out;
  for (const s of route.jamSegments){
    if (s.at < fromIdx + 1 || s.at > toIdx) continue;
    const segStart = dep + route.stops[s.at - 1][1];
    const active = isPeak(segStart) || baseLoad(segStart) >= 2;
    out.push({ ...s, segStart, active, add: active ? (isPeak(segStart) ? s.add : Math.round(s.add/2)) : 0 });
  }
  return out;
}
const SEV_TEXT = { heavy:'Kẹt nặng', medium:'Ùn ứ', light:'Hơi chậm' };

function computeCandidates(fromId, destId, availMin, desiredMin, jamFn){
  const out = [];
  for (const r of ROUTES){
    const fromIdx = r.stops.findIndex(s => s[0] === fromId);
    const toIdx = r.stops.findIndex(s => s[0] === destId);
    if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) continue;
    const baseTravel = r.stops[toIdx][1] - r.stops[fromIdx][1];
    for (const dep of r.departures){
      const jam = jamFn(r, fromIdx, toIdx, dep);
      const travel = baseTravel + jam;
      const boardAt = dep + r.stops[fromIdx][1];
      const arrival = boardAt + travel;
      const wait = boardAt - availMin;
      const slack = desiredMin - arrival;
      out.push({
        route:r, fromIdx, toIdx, dep, boardAt, travel, baseTravel, jam, arrival, wait, slack,
        feasible: wait >= 0 && slack >= 0,
        total: wait + travel,
        crowd: baseLoad(boardAt),
        peak: isPeak(boardAt),
        slotStart: Math.floor(boardAt / SLOT_MIN) * SLOT_MIN,
        score: wait * 1000 + travel
      });
    }
  }
  return out;
}

function pickPerRoute(cands){
  const map = new Map();
  for (const c of cands){
    if (!map.has(c.route.id)) map.set(c.route.id, []);
    map.get(c.route.id).push(c);
  }
  const groups = [];
  for (const [, list] of map){
    const feas = list.filter(c => c.feasible).sort((a,b) => a.score - b.score);
    groups.push({ route:list[0].route, best:feas[0] || null, feasibles:feas, infeasibles:list.filter(c => !c.feasible), all:list });
  }
  return groups;
}

function chooseBest(groups, prefSlot, avoidPeak){
  const pool = groups.filter(g => g.best).map(g => g.best);
  if (!pool.length) return null;
  pool.sort((a, b) => {
    const ap = prefSlot != null && a.slotStart === prefSlot;
    const bp = prefSlot != null && b.slotStart === prefSlot;
    if (ap !== bp) return ap ? -1 : 1;
    if (avoidPeak && a.peak !== b.peak) return a.peak ? 1 : -1;
    if (avoidPeak && a.crowd !== b.crowd) return a.crowd - b.crowd;
    return a.score - b.score;
  });
  return pool[0];
}

function fitInfo(c){
  if (!c.feasible){
    if (c.wait < 0) return { cls:'fit-off', label:'Đã trễ chuyến' };
    return { cls:'fit-bad', label:(c.slack === 0 ? 'Tới đúng phút chót' : 'Trễ ' + (-c.slack) + ' phút') };
  }
  if (c.wait === 0)  return { cls:'fit-perfect', label:'Lên xe ngay' };
  if (c.slack <= 2)  return { cls:'fit-perfect', label:'Vừa khít' };
  if (c.wait <= 5)   return { cls:'fit-ok',      label:'Chờ rất ngắn' };
  if (c.slack <= 10) return { cls:'fit-ok',      label:'Chờ ít' };
  if (c.slack <= 25) return { cls:'fit-early',   label:'Tới sớm ' + c.slack + ' phút' };
  return { cls:'fit-early', label:'Tới rất sớm' };
}

function reasonFor(c, groups, prefSlot, avoidPeak, declaredPeak){
  const bits = [];
  const feas = groups.filter(g => g.best).map(g => g.best);
  const minWait = Math.min(...feas.map(x => x.wait));
  if (c.wait === minWait) bits.push('chờ ngắn nhất');
  if (prefSlot != null) bits.push('nằm trong khung bạn muốn đi (' + fmt(prefSlot) + '–' + fmt(prefSlot+SLOT_MIN) + ')');
  else if (declaredPeak && avoidPeak && !c.peak) bits.push('đã né khung cao điểm ' + fmt(declaredPeak) + ' mà bạn khai');
  if (avoidPeak && !c.peak) bits.push('không rơi vào cao điểm nên ít chen chúc');
  const minTotal = Math.min(...feas.map(x => x.total));
  if (c.total === minTotal) bits.push('tổng hành trình ngắn nhất');
  if (!bits.length) bits.push('cân bằng tốt nhất giữa chờ và thời gian đi');
  return 'Chọn vì: ' + bits.join(' · ') + '.';
}
