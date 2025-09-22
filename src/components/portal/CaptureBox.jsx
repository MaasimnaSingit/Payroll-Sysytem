import React, { useEffect, useRef, useState } from 'react';
export default function CaptureBox({ onCapture }){
  const v=useRef(null), c=useRef(null); const [stream,setStream]=useState(null); const [shot,setShot]=useState(null);
  useEffect(()=>{ (async()=>{ try{ const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false}); setStream(s); if(v.current){ v.current.srcObject=s; await v.current.play(); } }catch{ alert('Camera access denied.'); }})(); return ()=>{ stream?.getTracks()?.forEach(t=>t.stop()); }; },[]);
  const capture=async()=>{ const w=480, h=Math.round(w*((v.current?.videoHeight||3)/(v.current?.videoWidth||4))); c.current.width=w; c.current.height=h; c.current.getContext('2d').drawImage(v.current,0,0,w,h);
    const blob=await new Promise(res=>c.current.toBlob(b=>res(b),'image/jpeg',0.9)); setShot(blob); onCapture?.(blob); };
  const retake=()=>{ setShot(null); onCapture?.(null); };
  return (<div className="panel" style={{marginTop:10}}>
    <div className="lbl" style={{marginBottom:6}}>{shot?'Captured photo':'Live camera'}</div>
    {!shot ? <video ref={v} style={{width:'100%',borderRadius:12}} playsInline muted/> : <img src={URL.createObjectURL(shot)} alt="capture" style={{width:'100%',borderRadius:12}}/>}
    <canvas ref={c} style={{display:'none'}}/>
    <div className="toolbar" style={{marginTop:8,justifyContent:'flex-end'}}>{!shot ? <button className="btn btn-primary" type="button" onClick={capture}>Capture</button> : <button className="btn btn-ghost" type="button" onClick={retake}>Retake</button>}</div>
  </div>);
}


