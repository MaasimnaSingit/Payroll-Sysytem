import React, { useEffect, useState } from 'react';
import { onNotify } from '../../utils/notifyBus.js';

const typeStyle = (t) => ({
  ok:   { border:'1px solid #A7F3D0', background:'#ECFDF5', color:'#065F46' },
  warn: { border:'1px solid #FDE68A', background:'#FFFBEB', color:'#92400E' },
  danger:{border:'1px solid #FECACA', background:'#FEF2F2', color:'#7F1D1D' },
  info: { border:'1px solid #BFDBFE', background:'#EFF6FF', color:'#1E3A8A' },
}[t] || { border:'1px solid #E5E7EB', background:'#fff', color:'#0F172A' });

export default function Toaster(){
  const [items, setItems] = useState([]);
  useEffect(() => {
    const off = onNotify((note) => {
      setItems((prev) => [...prev, note]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== note.id)), 3200);
    });
    return off;
  }, []);
  return (
    <div style={{ position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:3000 }}>
      {items.map(n => (
        <div key={n.id} className="card" style={{ padding:'10px 12px', minWidth:240, ...typeStyle(n.type) }}>
          {n.message}
        </div>
      ))}
    </div>
  );
}


