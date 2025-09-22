// Simple in-memory per-user+route rate limiter (good enough for single-node)
const buckets = new Map(); // key -> { tokens, last }
function key(userId, path){ return `${userId||'anon'}:${path}`; }
function allow(userId, path, ratePerMin=20){
  const now = Date.now();
  const k = key(userId, path);
  const cap = ratePerMin;
  const refillMs = 60_000;
  let b = buckets.get(k);
  if(!b){ b={ tokens: cap, last: now }; buckets.set(k,b); }
  // refill linearly
  const delta = now - b.last; b.last = now;
  b.tokens = Math.min(cap, b.tokens + (delta/refillMs)*cap);
  if(b.tokens < 1) return false;
  b.tokens -= 1; return true;
}
module.exports = { allow };


