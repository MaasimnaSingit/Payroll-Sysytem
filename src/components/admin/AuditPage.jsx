import React, { useEffect, useState } from 'react';

export default function AuditPage(){
  const [rows,setRows]=useState([]), [q,setQ]=useState(''), [type,setType]=useState(''), [action,setAction]=useState('');
  async function load(){ const p=new URLSearchParams(); if(q) p.set('q',q); if(type) p.set('type',type); if(action) p.set('action',action);
    const r=await fetch('/api/audit?'+p.toString()); const j=await r.json(); if(!r.ok) return alert(j.error||'Failed'); setRows(j.rows||[]); }
  useEffect(()=>{ load(); },[]);
  return (
    <div>
      <h2 style={{fontSize:22,marginBottom:8}}>Audit Log</h2>
      <div className="panel" style={{marginBottom:12}}>
        <div className="toolbar">
          <label className="min-180"><div className="lbl">Type</div>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="">All</option>
              <option>auth</option><option>requests</option><option>attendance</option><option>export</option><option>backup</option><option>recalc</option><option>portal</option>
            </select>
          </label>
          <label className="min-180"><div className="lbl">Action</div>
            <input value={action} onChange={e=>setAction(e.target.value)} placeholder="e.g. login, approve, time_in" />
          </label>
          <label className="min-220"><div className="lbl">Search</div>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="user, message, entity…" />
          </label>
          <div className="spacer" />
          <button onClick={load}>Filter</button>
        </div>
      </div>
      <div className="panel">
        <div style={{overflowX:'auto'}}>
          <table className="table">
            <thead><tr><th>Time</th><th>User</th><th>Role</th><th>Type</th><th>Action</th><th>Entity</th><th>ID</th><th>Message</th></tr></thead>
            <tbody>
              {rows.length===0 && <tr><td colSpan="8" style={{padding:16,textAlign:'center'}}>No events.</td></tr>}
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.created_at?.replace('T',' ').slice(0,19) || r.created_at}</td>
                  <td>{r.username || r.actor_user_id || '—'}</td>
                  <td>{r.actor_role || '—'}</td>
                  <td>{r.type}</td>
                  <td>{r.action}</td>
                  <td>{r.entity||'—'}</td>
                  <td>{r.entity_id||'—'}</td>
                  <td style={{maxWidth:420,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.message||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


