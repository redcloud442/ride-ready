import { useEffect, useState } from 'react';

// Current time, re-rendering every `intervalMs` while `active` (live timers).
export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
