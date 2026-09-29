'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { dur, EASE, REVEAL_START } from '@/lib/motion';

type RevealImageProps = {
  children: ReactNode;
  /** Classes for the frame, which sets the size. */
  className?: string;
  style?: CSSProperties;
  /** Gentle movement of the photo inside its frame while scrolling. */
  parallax?: boolean;
  delay?: number;
};

/**
 * A photo in a frame: revealed with a clip-path wipe from the bottom while the photo settles from
 * 1.2x to 1x, then drifts slightly inside the frame on scroll. The frame's size comes from CSS,
 * so nothing shifts while the lazy image loads.
 */
export function RevealImage({
  children,
  className = '',
  style,
  parallax = true,
  delay = 0,
}: RevealImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduced, mobile }) => {
      const frame = frameRef.current;
      const img = frame?.querySelector('img');
      if (!frame || !img) return;
      const scrollTrigger = { trigger: frame, start: REVEAL_START, once: true };

      if (reduced) {
        gsap.from(frame, { opacity: 0, duration: 0.6, scrollTrigger });
        return;
      }

      gsap
        .timeline({ scrollTrigger, delay })
        .fromTo(
          frame,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: dur(1.4, mobile),
            ease: 'expo.inOut',
          },
        )
        .fromTo(
          img,
          { scale: 1.2 },
          { scale: 1, duration: dur(1.8, mobile), ease: EASE },
          0,
        );

      if (parallax) {
        const range = mobile ? 4 : 8;
        gsap.fromTo(
          img,
          { yPercent: -range },
          {
            yPercent: range,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }
    },
    frameRef,
    [],
    () => belowFold(frameRef.current),
  );

  return (
    <div
      ref={frameRef}
      className={`reveal-image ${parallax ? 'has-parallax' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
