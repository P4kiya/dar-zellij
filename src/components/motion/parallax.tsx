'use client';

import { useRef, type ReactNode } from 'react';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';

type ParallaxProps = {
  children?: ReactNode;
  className?: string;
  /** yPercent at the start and end of the scroll range (halved on phones). */
  from?: number;
  to?: number;
  start?: string;
  end?: string;
};

/** Moves its content slower or faster than the page while it scrolls through the viewport. */
export function Parallax({
  children,
  className,
  from = -8,
  to = 8,
  start = 'top bottom',
  end = 'bottom top',
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduced, mobile }) => {
      const el = ref.current;
      if (!el || reduced) return;
      const k = mobile ? 0.5 : 1;
      gsap.fromTo(
        el,
        { yPercent: from * k },
        {
          yPercent: to * k,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start,
            end,
            scrub: true,
          },
        },
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
