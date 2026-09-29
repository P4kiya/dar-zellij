'use client';

import { useEffect, useState } from 'react';
import { Rosette } from '@/components/brand';

// When the CSS timeline in globals.css ("Preloader") has finished: the curtains start parting at
// 1.45s and take 1.25s.
const PRELOADER_ENDS_MS = 2750;

/**
 * First page view of the session only (the layout's inline script decides before first paint, and
 * never with reduced motion). The screen is the cover of Dar Zellij's menu: wine red, "Est. 1999",
 * the rosette, "Marrakech". The rosette turns, then the screen parts in the middle like the red
 * curtains of the patio while the hero rises behind it.
 *
 * All of it is CSS, timed from the first paint, so it never waits for (or depends on) JavaScript;
 * this component only takes the finished preloader out of the page.
 */
export function Preloader({ est, city }: { est: string; city: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('is-preloading')) {
      setDone(true);
      return;
    }
    const timer = window.setTimeout(
      () => {
        html.classList.remove('is-preloading');
        setDone(true);
      },
      Math.max(0, PRELOADER_ENDS_MS - performance.now()) + 50,
    );
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader__curtain preloader__curtain--left" />
      <div className="preloader__curtain preloader__curtain--right" />
      <div className="preloader__mark">
        <span className="preloader__line">{est}</span>
        <span className="preloader__rosette-wrap">
          <Rosette className="preloader__rosette" />
        </span>
        <span className="preloader__line">{city}</span>
      </div>
    </div>
  );
}
