import React from 'react';

export default function MarkPaid({ start, end }){
  const [status,setStatus]=React.useState(null);
  const disabled = !start || !end;

  async function refresh(){
    if(disabled) return setStatus(null);
    const r=await fetch(`/api/payroll-runs/status?from=${start}&to=${end}`);
    const j=await r.json(); setStatus(j);
  }
  React.useEffect(()=>{ refresh(); }, [start,end]);

  async function mark(){
    if(disabled) return alert('Set start and end');
    if(status?.paid) return alert('Already marked as Paid');
    if(!confirm(`Mark this period as PAID?\n${start} → ${end}`)) return;
    const r=await fetch('/api/payroll-runs/mark',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:start,to:end})});
    const j=await r.json();
    if(!r.ok) return alert(j.error||'Failed');
    alert('Period marked as Paid'); refresh();
  }

  return (
    <>
      {status?.paid
        ? <span className="badge ok">Paid</span>
        : <button onClick={mark} disabled={disabled}>Mark as Paid</button>}
    </>
  );
}


