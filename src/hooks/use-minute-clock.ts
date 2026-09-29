import { useEffect, useState } from 'react';

/**
 * The current time, updated on the minute. Null on the server and in the first client render, so
 * time-dependent text never causes a hydration mismatch; callers render a neutral fallback.
 */
export function useMinuteClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return now;
}
