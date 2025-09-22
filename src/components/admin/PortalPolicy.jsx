import React from 'react';

export default function PortalPolicy(){
  const [v,setV]=React.useState({
    require_photo_in:true, require_photo_out:true, require_geo:false,
    punch_cooldown_seconds:60, allow_cross_midnight:false, max_shift_hours_soft:16,
  });
  React.useEffect(()=>{ (async()=>{
    try{ const r=await fetch('/api/settings'); const j=await r.json();
      setV({
        require_photo_in: (j.require_photo_in||'1')==='1',
        require_photo_out:(j.require_photo_out||'1')==='1',
        require_geo:      (j.require_geo||'0')==='1',
        punch_cooldown_seconds: Number(j.punch_cooldown_seconds||60),
        allow_cross_midnight: (j.allow_cross_midnight||'0')==='1',
        max_shift_hours_soft: Number(j.max_shift_hours_soft||16),
      });
    }catch{}
  })(); },[]);
  async function save(){
    const payload={
      require_photo_in: v.require_photo_in?'1':'0',
      require_photo_out: v.require_photo_out?'1':'0',
      require_geo: v.require_geo?'1':'0',
      punch_cooldown_seconds: String(v.punch_cooldown_seconds||0),
      allow_cross_midnight: v.allow_cross_midnight?'1':'0',
      max_shift_hours_soft: String(v.max_shift_hours_soft||16),
    };
    const r=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const j=await r.json(); if(!r.ok) return alert(j.error||'Failed'); alert('Portal policy saved');
  }
  return (
    <div className="form-grid cols-3">
      <label><div className="lbl">Require photo — Time In</div>
        <select value={v.require_photo_in?'1':'0'} onChange={e=>setV(s=>({...s,require_photo_in:e.target.value==='1'}))}>
          <option value="1">Yes</option><option value="0">No</option>
        </select>
      </label>
      <label><div className="lbl">Require photo — Time Out</div>
        <select value={v.require_photo_out?'1':'0'} onChange={e=>setV(s=>({...s,require_photo_out:e.target.value==='1'}))}>
          <option value="1">Yes</option><option value="0">No</option>
        </select>
      </label>
      <label><div className="lbl">Require location</div>
        <select value={v.require_geo?'1':'0'} onChange={e=>setV(s=>({...s,require_geo:e.target.value==='1'}))}>
          <option value="1">Yes</option><option value="0">No</option>
        </select>
      </label>
      <label><div className="lbl">Punch cooldown (seconds)</div>
        <input type="number" inputMode="numeric" value={v.punch_cooldown_seconds} onChange={e=>setV(s=>({...s,punch_cooldown_seconds:Number(e.target.value||0)}))}/>
      </label>
      <label><div className="lbl">Allow cross-midnight (OT shifts)</div>
        <select value={v.allow_cross_midnight?'1':'0'} onChange={e=>setV(s=>({...s,allow_cross_midnight:e.target.value==='1'}))}>
          <option value="0">No (default)</option><option value="1">Yes</option>
        </select>
      </label>
      <label><div className="lbl">Soft max shift hours</div>
        <input type="number" inputMode="numeric" value={v.max_shift_hours_soft} onChange={e=>setV(s=>({...s,max_shift_hours_soft:Number(e.target.value||16)}))}/>
      </label>
      <div className="toolbar" style={{ gridColumn:'1/-1', justifyContent:'flex-end' }}>
        <button className="btn btn-primary" onClick={save}>Save Portal Policy</button>
      </div>
    </div>
  );
}


