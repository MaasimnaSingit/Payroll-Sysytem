// Compute current payout window in Asia/Manila: 1–15 or 16–EOM
export function currentCutoffRange(base = new Date()) {
  const now = new Date(base);
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  const pad = (n)=> String(n).padStart(2,'0');
  const iso = (dt)=> `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
  if (d <= 15) {
    const s = new Date(y, m, 1);
    const e = new Date(y, m, 15);
    return { from: iso(s), to: iso(e), label:`${iso(s)} → ${iso(e)}` };
  } else {
    const s = new Date(y, m, 16);
    const e = new Date(y, m+1, 0);
    return { from: iso(s), to: iso(e), label:`${iso(s)} → ${iso(e)}` };
  }
}


