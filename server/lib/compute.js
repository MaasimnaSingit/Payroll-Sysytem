function mins(hhmm){
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const [h,m] = hhmm.split(':').map(Number);
  return h*60 + m;
}
function computeTotals(time_in, time_out, break_minutes){
  const tin = mins(time_in), tout = mins(time_out), br = Number(break_minutes||0);
  if (tin==null || tout==null || tout<=tin) return { hours_worked:0, regular_hours:0, overtime_hours:0 };
  const worked = Math.max(0,(tout-tin)-br)/60;
  const regular = Math.min(8, worked);
  const ot = Math.max(0, worked - 8);
  return {
    hours_worked: +worked.toFixed(2),
    regular_hours: +regular.toFixed(2),
    overtime_hours:+ot.toFixed(2),
  };
}
module.exports = { computeTotals };

// Optional cross-midnight aware variant (adds 24h if out < in)
module.exports.computeTotalsCross = function(time_in, time_out, break_minutes, allowCross=false){
  if(!allowCross) return module.exports.computeTotals(time_in, time_out, break_minutes);
  const toMin = (s)=>{ if(!s || !/^\d{2}:\d{2}$/.test(s)) return null; const [h,m]=s.split(':').map(Number); return h*60+m; };
  const mi = toMin(time_in), mo = toMin(time_out), br = Number(break_minutes||0);
  if(mi==null || mo==null) return module.exports.computeTotals(time_in, time_out, break_minutes);
  let diff = mo - mi; if (diff < 0) diff += 24*60; // cross midnight
  const hours = Math.max(0, (diff - br)/60);
  const reg = Math.min(8, hours);
  const ot  = Math.max(0, hours - 8);
  return { hours_worked: +hours.toFixed(2), regular_hours: +reg.toFixed(2), overtime_hours: +ot.toFixed(2) };
};


