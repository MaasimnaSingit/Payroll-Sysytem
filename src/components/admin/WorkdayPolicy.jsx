import React from 'react';

export default function WorkdayPolicy(){
  const [v,setV]=React.useState({ rounding_minutes: 15, grace_minutes: 5, workday_start: '09:00', workday_end: '18:00' });

  React.useEffect(()=>{ (async()=>{
    try{
      const r=await fetch('/api/settings'); const j=await r.json();
      setV({
        rounding_minutes: Number(j.rounding_minutes ?? 15),
        grace_minutes: Number(j.grace_minutes ?? 5),
        workday_start: j.workday_start || '09:00',
        workday_end: j.workday_end || '18:00',
      });
    }catch{}
  })(); },[]);

  async function save(){
    const payload = {
      rounding_minutes: String(v.rounding_minutes||0),
      grace_minutes: String(v.grace_minutes||0),
      workday_start: v.workday_start,
      workday_end: v.workday_end,
    };
    const r = await fetch('/api/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const j = await r.json();
    if(!r.ok) return alert(j.error||'Failed to save policy');
    alert('Workday policy saved');
  }

  return (
    <div className="form-grid cols-3">
      <label><div className="lbl">Rounding (minutes)</div>
        <input type="number" inputMode="numeric" min="0" step="1"
          value={v.rounding_minutes}
          onChange={e=>setV(s=>({...s, rounding_minutes:Number(e.target.value||0)}))}/>
      </label>
      <label><div className="lbl">Grace period (minutes)</div>
        <input type="number" inputMode="numeric" min="0" step="1"
          value={v.grace_minutes}
          onChange={e=>setV(s=>({...s, grace_minutes:Number(e.target.value||0)}))}/>
      </label>
      <label><div className="lbl">Workday start</div>
        <input type="time" value={v.workday_start} onChange={e=>setV(s=>({...s, workday_start:e.target.value}))}/>
      </label>
      <label><div className="lbl">Workday end</div>
        <input type="time" value={v.workday_end} onChange={e=>setV(s=>({...s, workday_end:e.target.value}))}/>
      </label>
      <div className="toolbar" style={{ gridColumn:'1 / -1', justifyContent:'flex-end' }}>
        <button onClick={save}>Save Workday Policy</button>
      </div>
    </div>
  );
}


