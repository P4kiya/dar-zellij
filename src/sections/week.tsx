import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { hasBrunch, hasDancer } from '@/lib/hours';
import { HOURS } from '@/lib/site';
import { WeekGrid, type Day } from './week-grid';

// The week starts on Monday (Date#getDay numbers).
const WEEK = [1, 2, 3, 4, 5, 6, 0];

/** Monday to Sunday at a glance: Tuesday closed, the belly dancer on Thursdays and Sundays, Sunday brunch. */
export function Week({ t }: { t: Dictionary }) {
  const w = t.week;
  const days: Day[] = WEEK.map((weekday) => {
    const closed = weekday === HOURS.closedWeekday;
    const events: Day['events'] = [];
    if (!closed && hasBrunch(weekday))
      events.push({ kind: 'brunch', label: w.brunch });
    if (!closed && hasDancer(weekday))
      events.push({ kind: 'dancer', label: w.dancer });
    return {
      weekday,
      name: w.days[weekday],
      hours: closed ? w.closed : w.hours,
      closed,
      events,
    };
  });

  return (
    <section className="section week" id="week" aria-labelledby="week-title">
      <div className="container-dz">
        <header className="section-head">
          <RevealText variant="eyebrow" className="eyebrow">
            {w.kicker}
          </RevealText>
          <RevealText
            as="h2"
            id="week-title"
            variant="heading"
            className="section-title"
          >
            <Rich text={w.title} />
          </RevealText>
          <RevealText as="p" className="lede">
            {w.text}
          </RevealText>
        </header>
        <WeekGrid days={days} todayLabel={w.today} status={t.status} />
      </div>
    </section>
  );
}
