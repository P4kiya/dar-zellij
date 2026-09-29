'use client';

import { useEffect, useRef } from 'react';

// The classic zellij star and cross: an eight-pointed star in each tile, its tips meeting the
// neighbours' at the middle of each edge, so the spaces between four stars form crosses. A small
// star, turned a sixteenth, sits in the heart of each one. Drawn in fine lines like the brand.
const TILE = 72;
const C = TILE / 2;
const R = TILE / 2;
// Inner radius of the {8/2} star: where the two squares that make it cross.
const INNER_RATIO = Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);

const star = (radius: number, turn = 0) =>
  'M' +
  Array.from({ length: 16 }, (_, k) => {
    const angle = turn + (k * Math.PI) / 8;
    const r = k % 2 ? radius * INNER_RATIO : radius;
    return `${(C + r * Math.cos(angle)).toFixed(2)} ${(C + r * Math.sin(angle)).toFixed(2)}`;
  }).join('L') +
  'Z';

const STAR = star(R);
const HEART = star(R * 0.44, Math.PI / 8);

function Pattern({ id, lit }: { id: string; lit?: boolean }) {
  return (
    <svg
      className={lit ? 'dado__lit' : 'dado__base'}
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={id}
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
          x="50%"
        >
          {/* Lit, the tiles show their glaze: teal crosses, wine stars, a brass heart. */}
          {lit && <rect width={TILE} height={TILE} className="dado__cross" />}
          <path
            d={STAR}
            className={lit ? 'dado__line dado__star' : 'dado__line'}
          />
          <path
            d={HEART}
            className={
              lit ? 'dado__line dado__heart' : 'dado__line dado__line--inner'
            }
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * The foot of the page: a band of zellij, like the tiled dado along the lower walls of a riad.
 * Where the pointer passes over the footer, the tiles catch the light like candlelight on glazed
 * tile; without a pointer (phones, or before it moves) the light drifts slowly along the band.
 */
export function ZellijDado() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Follow the pointer anywhere over the footer, so the light reaches the band from above.
    const area = el.closest('footer') ?? el;
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${last.clientX - r.left}px`);
      el.style.setProperty('--y', `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      el.classList.add('is-tracking');
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => el.classList.remove('is-tracking');
    area.addEventListener('pointermove', onMove as EventListener);
    area.addEventListener('pointerleave', onLeave);
    return () => {
      area.removeEventListener('pointermove', onMove as EventListener);
      area.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="dado" aria-hidden="true">
      <Pattern id="zellij-base" />
      <Pattern id="zellij-lit" lit />
    </div>
  );
}
