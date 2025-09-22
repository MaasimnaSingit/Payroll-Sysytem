const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const ZONE = 'Asia/Manila';
const toPH = (d=new Date()) => utcToZonedTime(d, ZONE);

function parseHM(s){ if(!s || !/^\d{2}:\d{2}$/.test(s)) return null; const [h,m]=s.split(':').map(Number); return h*60+m; }
function fmtHM(mins){ const h=Math.floor(mins/60), m=mins%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }

function roundToStep(hm, step){
  const m=parseHM(hm); if(m==null || !step) return hm;
  const r = Math.round(m/step)*step; return fmtHM(r);
}

function haversineMeters(lat1,lng1,lat2,lng2){
  if([lat1,lng1,lat2,lng2].some(v=>v==null)) return null;
  const toRad = (x)=>x*Math.PI/180;
  const R=6371000, dLat=toRad(lat2-lat1), dLon=toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function lateEarly({ time_in, time_out, workday_start='09:00', workday_end='18:00', grace_minutes=10 }){
  const tIn=parseHM(time_in), tOut=parseHM(time_out), s=parseHM(workday_start), e=parseHM(workday_end);
  let late=0, early=0;
  if(tIn!=null && s!=null){
    const withGrace = s + Number(grace_minutes||0);
    late = Math.max(0, tIn - withGrace);
  }
  if(tOut!=null && e!=null){
    early = Math.max(0, e - tOut);
  }
  return { late_minutes: late, early_out_minutes: early };
}

module.exports = { ZONE, toPH, parseHM, fmtHM, roundToStep, haversineMeters, lateEarly };


