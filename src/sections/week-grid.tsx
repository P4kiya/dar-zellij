'use client';

import { useRef } from 'react';
import { Coffee, Music } from 'lucide-react';
import { OpenStatus, type StatusStrings } from '@/components/open-status';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { useMinuteClock } from '@/hooks/use-minute-clock';
import { gsap } from '@/lib/gsap';
import { marrakechTime } from '@/lib/hours';
import { dur, EASE, REVEAL_START } from '@/lib/motion';

export type Day = {
  weekday: number;
  name: string;
  hours: string;
  closed: boolean;
  events: { kind: 'brunch' | 'dancer'; label: string }[];
};

const ICONS = { brunch: Coffee, dancer: Music };

/** The seven days; today (in Marrakech) is picked out once the page runs in the browser. */
export function WeekGrid({
  days,
  todayLabel,
  status,
}: {
  days: Day[];
  todayLabel: string;
  status: StatusStrings;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const now = useMinuteClock();
  const today = now ? marrakechTime(now).weekday : -1;

  useMotion(
    ({ reduced, mobile }) => {
      const list = ref.current;
      if (!list || reduced) return;
      gsap.from(list.children, {
        opacity: 0,
        y: 32,
        duration: dur(1, mobile),
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: list, start: REVEAL_START, once: true },
      });
    },
    ref,
    [],
    () => belowFold(ref.current),
  );

  return (
    <ol ref={ref} className="week-grid">
      {days.map((day) => {
        const isToday = day.weekday === today;
        return (
          <li
            key={day.weekday}
            className={['day', day.closed && 'is-closed', isToday && 'is-today']
              .filter(Boolean)
              .join(' ')}
            aria-current={isToday ? 'date' : undefined}
          >
            <span className="day-name">
              {day.name}
              {isToday && <span className="day-today">{todayLabel}</span>}
            </span>
            <span className="day-hours">{day.hours}</span>
            {day.events.length > 0 && (
              <ul className="day-events">
                {day.events.map((event) => {
                  const Icon = ICONS[event.kind];
                  return (
                    <li key={event.kind}>
                      <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
                      {event.label}
                    </li>
                  );
                })}
              </ul>
            )}
            {isToday && <OpenStatus t={status} className="day-status" />}
          </li>
        );
      })}
    </ol>
  );
}
