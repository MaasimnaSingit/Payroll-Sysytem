import React, { useEffect, useState } from 'react';
import { formatPhp, formatHours, todayStr } from '../../utils/format.js';

export default function KpiStrip({ periodFrom, periodTo, onCard }) {
  const [kpi, setKpi] = useState(null);
  useEffect(()=>{ (async()=>{ try{ const r=await fetch(`/api/kpi?from=${periodFrom||todayStr()}&to=${periodTo||todayStr()}`); const j=await r.json(); setKpi(j); }catch{} })(); },[periodFrom,periodTo]);
  const Card=({title,value,sub,onClick})=> (<button className="kpi" style={{textAlign:'left',cursor:'pointer'}} onClick={onClick}><div className="kpi-label">{title}</div><div className="kpi-value">{value}</div>{sub&&<div className="kpi-label" style={{marginTop:4}}>{sub}</div>}</button>);
  if(!kpi) return null;
  return (<div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(4,minmax(0,1fr))',marginBottom:12}}>
    <Card title="Present today" value={kpi.today.present} sub={`Missing out: ${kpi.today.missing_out}`} onClick={()=>onCard?.('today')}/>
    <Card title="On leave" value={kpi.today.leave} onClick={()=>onCard?.('leave')}/>
    <Card title="OT hrs today" value={formatHours(kpi.today.ot_hours)} onClick={()=>onCard?.('ot_today')}/>
    <Card title="Period gross" value={formatPhp(kpi.period.gross_pay)} sub={`${formatHours(kpi.period.reg_hours)} reg • ${formatHours(kpi.period.ot_hours)} ot`} onClick={()=>onCard?.('period')}/>
  </div>);
}


