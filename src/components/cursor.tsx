'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

type CursorState = '' | 'link' | 'view' | 'hidden';

// Form fields keep the native cursor (text caret, select arrow) and hide the custom one.
const NATIVE = 'input, textarea, select, [contenteditable="true"]';
const INTERACTIVE = 'a, button, label, summary, [role="tab"], [role="button"]';

/** Desktop only: a brass dot with a trailing ring that grows over links and says "View" over the gallery. */
export default function Cursor({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const dot = root?.querySelector('.cursor__dot');
    const ring = root?.querySelector('.cursor__ring');
    if (!root || !dot || !ring) return;
    const html = document.documentElement;
    html.classList.add('has-custom-cursor');

    const follow = (el: Element, duration: number) => ({
      x: gsap.quickTo(el, 'x', { duration, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration, ease: 'power3.out' }),
    });
    const dotTo = follow(dot, 0.12);
    const ringTo = follow(ring, 0.5);
    let visible = false;

    const setState = (state: CursorState) => {
      if (root.dataset.state !== state) root.dataset.state = state;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      if (!visible) {
        // Appear where the pointer is rather than sliding in from the corner.
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        root.classList.add('is-visible');
        visible = true;
      }
      dotTo.x(e.clientX);
      dotTo.y(e.clientY);
      ringTo.x(e.clientX);
      ringTo.y(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      if (target.closest(NATIVE)) setState('hidden');
      else if (target.closest('[data-cursor="view"]')) setState('view');
      else if (target.closest(INTERACTIVE)) setState('link');
      else setState('');
    };
    const onLeaveWindow = () => {
      root.classList.remove('is-visible');
      visible = false;
    };
    const onDown = () => root.classList.add('is-pressed');
    const onUp = () => root.classList.remove('is-pressed');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    html.addEventListener('mouseleave', onLeaveWindow);
    window.addEventListener('blur', onLeaveWindow);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      html.removeEventListener('mouseleave', onLeaveWindow);
      window.removeEventListener('blur', onLeaveWindow);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <div className="cursor__ring">
        <span className="cursor__label">{label}</span>
      </div>
      <div className="cursor__dot" />
    </div>
  );
}
