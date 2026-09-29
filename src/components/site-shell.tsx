'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, type ReactNode } from 'react';
import { useBackgroundMorph } from '@/hooks/use-background-morph';
import { useMediaQuery, useReducedMotion } from '@/hooks/use-media-query';
import { MEDIA } from '@/lib/motion';
import { startSmoothScroll } from '@/lib/scroll';

// Desktop-only, loaded separately so phones never download it.
const Cursor = dynamic(() => import('@/components/cursor'), { ssr: false });

/** Wraps the page: smooth scrolling, the background that blends between sections, cursor and grain. */
export function SiteShell({
  children,
  cursorLabel,
}: {
  children: ReactNode;
  cursorLabel: string;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  useBackgroundMorph(shellRef);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery(MEDIA.finePointer);
  useEffect(() => startSmoothScroll(), []);

  return (
    <div ref={shellRef} className="site-shell">
      {children}
      {finePointer && !reduced && <Cursor label={cursorLabel} />}
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
