import { HOURS, TIME_ZONE } from '@/lib/site';

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type MarrakechTime = { weekday: number; hour: number; time: string };

/** Day and time in Marrakech, whatever the visitor's own time zone. */
export function marrakechTime(date = new Date()): MarrakechTime {
  const parts: Record<string, string> = {};
  for (const { type, value } of clock.formatToParts(date)) parts[type] = value;
  return {
    weekday: WEEKDAY[parts.weekday] ?? date.getDay(),
    hour: Number(parts.hour),
    time: `${parts.hour}:${parts.minute}`,
  };
}

export type OpenState = 'open' | 'later' | 'closed';

/** Open from noon to midnight, every day but Tuesday. */
export function openState({ weekday, hour }: MarrakechTime): OpenState {
  if (weekday === HOURS.closedWeekday) return 'closed';
  return hour < HOURS.opens ? 'later' : 'open';
}

export const hasDancer = (weekday: number) =>
  HOURS.dancerWeekdays.includes(weekday);

export const hasBrunch = (weekday: number) => weekday === HOURS.brunchWeekday;

/** Today's date in Marrakech as YYYY-MM-DD (for the booking form's minimum date). */
export function marrakechDateISO(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
