import React from 'react';

export default function Exceptions({ from, to, employeeId }){
  const [rows,setRows]=React.useState(null);
  React.useEffect(()=>{ (async()=>{
    try{
      const qs = new URLSearchParams({ from, to });
      if(employeeId) qs.set('employeeId', employeeId);
      const r=await fetch('/api/attendance-exceptions?'+qs.toString());
      const j=await r.json(); setRows(j.rows||[]);
    }catch{ setRows([]); }
  })(); }, [from,to,employeeId]);

  if(rows===null) return <div className="lbl">Checking exceptions…</div>;
  if(rows.length===0) return <div className="lbl">No exceptions in this range. ✅</div>;

  return (
    <div>
      <div className="lbl" style={{marginBottom:6}}>Exceptions in range (quick review)</div>
      <div style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Employee</th><th>In</th><th>Out</th><th>Break</th><th>Flags</th><th>Total hrs</th></tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id}>
                <td>{r.work_date}</td>
                <td>{r.employee_code} — {r.name}</td>
                <td>{r.time_in||'—'}</td>
                <td>{r.time_out||'—'}</td>
                <td className="num">{r.break_minutes||0}</td>
                <td>
                  {r.missingOut && <span className="badge warn" style={{marginRight:6}}>Missing out</span>}
                  {r.noInPhoto && <span className="badge warn" style={{marginRight:6}}>No in photo</span>}
                  {r.noOutPhoto && <span className="badge warn" style={{marginRight:6}}>No out photo</span>}
                  {r.long && <span className="badge danger" style={{marginRight:6}}>Over 12h</span>}
                  {r.neg && <span className="badge danger" style={{marginRight:6}}>Negative hrs</span>}
                </td>
                <td className="num">{r.hours!=null ? r.hours.toFixed(2) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


