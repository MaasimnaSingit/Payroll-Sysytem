import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette(){
  const nav = useNavigate(); const [open,setOpen]=useState(false); const [q,setQ]=useState(''); const [emps,setEmps]=useState([]);
  useEffect(()=>{ const onKey=e=>{ const metaK=(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'; if(metaK){e.preventDefault(); setOpen(v=>!v); setQ('');} if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey); },[]);
  useEffect(()=>{ if(!open) return; (async()=>{ try{ const r=await fetch('/api/employees'); const j=await r.json(); setEmps(Array.isArray(j)?j:(j.rows||[])); }catch{} })(); },[open]);
  const staticCmds = useMemo(()=>[
    {id:'e',label:'Go to Employees', run:()=>nav('/admin/employees')},
    {id:'a',label:'Go to Attendance',run:()=>nav('/admin/attendance')},
    {id:'p',label:'Go to Payroll',   run:()=>nav('/admin/payroll')},
    {id:'s',label:'Go to Settings',  run:()=>nav('/admin/settings')},
    {id:'add',label:'Add Attendance (focus form)', run:()=>{ setOpen(false); setTimeout(()=>window.dispatchEvent(new CustomEvent('cmd:add-attendance')),0); }},
  ],[nav]);
  const empMatches = useMemo(()=>{ const s=q.trim().toLowerCase(); if(!s) return [];
    return emps.filter(e=>String(e.employee_code||'').toLowerCase().includes(s)||String(e.name||'').toLowerCase().includes(s))
      .slice(0,8).map(e=>({id:`emp:${e.id}`, label:`${e.employee_code||''} ${e.name||''}`.trim(), run:()=>nav('/admin/employees')}));
  },[q,emps,nav]);
  const cmds = q ? [...empMatches, ...staticCmds] : staticCmds;
  if(!open) return null;
  return (
    <div className="cmdpal-veil" onClick={()=>setOpen(false)}>
      <div className="cmdpal" onClick={e=>e.stopPropagation()}>
        <input autoFocus className="cmdpal-input" placeholder="Type a command or search employee…" value={q}
               onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&cmds[0]) cmds[0].run(); }} />
        <div className="cmdpal-list">
          {cmds.length===0 && <div className="cmdpal-empty">No results</div>}
          {cmds.map(c=><button key={c.id} className="cmdpal-item" onClick={c.run}>{c.label}</button>)}
        </div>
        <div className="cmdpal-hint">Ctrl+K • Esc</div>
      </div>
    </div>
  );
}


