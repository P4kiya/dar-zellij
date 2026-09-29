'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowDownRight, Phone } from 'lucide-react';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { CONTACT } from '@/lib/site';

const isOnScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
};

type BookingDockProps = {
  label: string;
  book: string;
  bookShort: string;
  call: string;
};

/**
 * Desktop: a floating "Book a table" button. Phones: a slim bar with "Book" and "Call".
 * They step aside while the booking form or the footer is on screen, and the desktop button waits
 * until the hero has scrolled away (up there the header's Book button is at hand).
 */
export function BookingDock({
  label,
  book,
  bookShort,
  call,
}: BookingDockProps) {
  const [overHero, setOverHero] = useState(true);
  const [overForm, setOverForm] = useState(false);
  const [overFooter, setOverFooter] = useState(false);

  // Decide before the first paint, so the button never flashes in over the hero.
  useLayoutEffect(() => {
    const hero = document.querySelector('.hero');
    if (hero) setOverHero(isOnScreen(hero));
  }, []);

  useEffect(() => {
    const watched: [string, (visible: boolean) => void][] = [
      ['.hero', setOverHero],
      ['#book', setOverForm],
      ['.footer', setOverFooter],
    ];
    const observers = watched.flatMap(([selector, setVisible]) => {
      const el = document.querySelector(selector);
      if (!el) return [];
      const observer = new IntersectionObserver(([entry]) =>
        setVisible(entry.isIntersecting),
      );
      observer.observe(el);
      return [observer];
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const classes = [
    'booking-dock',
    (overForm || overFooter) && 'is-hidden',
    overHero && 'is-float-hidden',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={classes} aria-label={label}>
      <div className="booking-dock__float">
        <MagneticButton
          href="#book"
          size="sm"
          icon={<ArrowDownRight size={14} strokeWidth={1.5} />}
        >
          {book}
        </MagneticButton>
      </div>
      <div className="booking-dock__bar">
        <MagneticButton href="#book" size="sm" variant="light">
          {bookShort}
        </MagneticButton>
        <MagneticButton
          href={CONTACT.phoneHref}
          variant="ghost"
          size="sm"
          icon={<Phone size={13} strokeWidth={1.5} />}
          aria-label={`${call} ${CONTACT.phone}`}
        >
          {call}
        </MagneticButton>
      </div>
    </aside>
  );
}
