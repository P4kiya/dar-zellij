'use client';

import { useMinuteClock } from '@/hooks/use-minute-clock';
import { hasBrunch, hasDancer, marrakechTime, openState } from '@/lib/hours';
import { HOURS } from '@/lib/site';

export type StatusStrings = {
  open: string;
  later: string;
  closed: string;
  dancer: string;
  brunch: string;
};

/**
 * Open or closed right now, in Marrakech time: "Open · until midnight", "Opens today at 12pm" or
 * "Closed on Tuesdays", plus tonight's belly dancer (Thursday, Sunday) or Sunday brunch.
 */
export function OpenStatus({
  t,
  className = '',
}: {
  t: StatusStrings;
  className?: string;
}) {
  const now = useMinuteClock();
  if (!now) return <span className={`open-status ${className}`} />;

  const time = marrakechTime(now);
  const state = openState(time);
  let extra: string | null = null;
  if (state !== 'closed' && hasDancer(time.weekday)) extra = t.dancer;
  else if (state === 'later' && hasBrunch(time.weekday) && time.hour >= 8)
    extra = t.brunch;
  // Brunch starts before the kitchen opens: from 11:00 on Sundays, say so first.
  const brunchNow =
    hasBrunch(time.weekday) &&
    time.hour >= HOURS.brunchFrom &&
    time.hour < HOURS.opens;

  return (
    <span className={`open-status is-${state} ${className}`}>
      <span className="open-status__dot" aria-hidden="true" />
      <span>
        {brunchNow ? t.brunch : t[state]}
        {extra && !brunchNow && (
          <span className="open-status__extra"> · {extra}</span>
        )}
      </span>
    </span>
  );
}
