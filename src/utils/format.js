export const formatPhp = (n)=> new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2}).format(Number(n||0));
export const formatHours = (n)=> Number(n||0).toFixed(2);
export const todayStr = ()=>{
  const d = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Manila'}));
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`;
};


