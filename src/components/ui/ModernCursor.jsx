import { useEffect } from "react";
export default function ModernCursor(){
  useEffect(()=>{
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot=document.createElement("div"); const ring=document.createElement("div");
    dot.className="cursor-dot"; ring.className="cursor-ring";
    document.body.append(dot,ring); document.body.classList.add("cursor-none");
    
    let x=0,y=0, tx=0, ty=0, raf;
    const move=e=>{tx=e.clientX; ty=e.clientY; if(!raf){raf=requestAnimationFrame(loop);}};
    const loop=()=>{x+=(tx-x)*0.2; y+=(ty-y)*0.2; dot.style.transform=`translate(${x-3}px,${y-3}px)`; ring.style.transform=`translate(${x}px,${y}px)`; raf=requestAnimationFrame(loop);};
    const toggle=e=>{const t=e.target;const isInput=/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable;
      if(isInput){dot.classList.add('hidden');ring.classList.add('hidden');document.body.classList.remove("cursor-none");}
      else{dot.classList.remove('hidden');ring.classList.remove('hidden');document.body.classList.add("cursor-none");}};
    window.addEventListener("mousemove",move,{passive:true});document.addEventListener("mouseover",toggle,{passive:true});
    return()=>{window.removeEventListener("mousemove",move);document.removeEventListener("mouseover",toggle);document.body.classList.remove("cursor-none");dot.remove();ring.remove();}
  },[]);
  return null;
}


