import React from 'react';
export default function ImageModal({ open, src, title, onClose }){
  if(!open) return null;
  return (
    <div className="cmdpal-veil" onClick={onClose}>
      <div className="panel" style={{ width:'min(920px,96vw)' }} onClick={e=>e.stopPropagation()}>
        <div className="toolbar"><div className="lbl">{title||'Photo proof'}</div><div className="spacer"/><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={src} style={{ width:'100%', borderRadius:12 }} />
        <div className="toolbar" style={{ justifyContent:'flex-end', marginTop:8 }}>
          <a className="btn btn-ghost" href={src} target="_blank" rel="noreferrer">Open original</a>
          <a className="btn btn-primary" href={src} download>Download</a>
        </div>
      </div>
    </div>
  );
}


