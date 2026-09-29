'use client';

import { useRef, type ReactNode } from 'react';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';

/**
 * The photo opens from the middle outwards as the section scrolls in, like the curtains of the
 * preloader (and of the photo itself), while it settles from a slight zoom.
 */
export function CurtainReveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduced, mobile }) => {
      const el = ref.current;
      if (!el || reduced) return;
      const scrollTrigger = {
        trigger: el.parentElement ?? el,
        start: 'top bottom',
        end: mobile ? 'top 25%' : 'top top',
        scrub: true,
      };
      gsap.fromTo(
        el,
        { clipPath: 'inset(0% 34% 0% 34%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger },
      );
      gsap.fromTo(
        el.querySelector('img'),
        { scale: 1.18 },
        { scale: 1, ease: 'none', scrollTrigger },
      );
    },
    ref,
    [],
    () => belowFold(ref.current),
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
