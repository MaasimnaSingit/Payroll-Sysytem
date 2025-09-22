import { useEffect, useState } from 'react';

export default function useAuthMe() {
  const [me, setMe] = useState({ loading: true, user: null });
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        const j = await r.json();
        if (ok) setMe({ loading: false, user: j.user || null });
      } catch {
        if (ok) setMe({ loading: false, user: null });
      }
    })();
    return () => { ok = false; };
  }, []);
  return me;
}


