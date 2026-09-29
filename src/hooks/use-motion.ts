import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

export type MotionContext = {
  reduced: boolean;
  mobile: boolean;
  desktop: boolean;
};

/** Runs `callback` once the web fonts are in and the browser is idle. Returns a cancel function. */
function afterFontsWhenIdle(callback: () => void) {
  let cancelled = false;
  let cancelIdle = () => {};
  document.fonts.ready.then(() => {
    if (cancelled) return;
    // Safari has no requestIdleCallback (the DOM types assume it always exists).
    const hasIdle = typeof (window as Partial<Window>).requestIdleCallback;
    if (hasIdle === 'function') {
      const id = window.requestIdleCallback(callback, { timeout: 1200 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(callback, 60);
      cancelIdle = () => window.clearTimeout(id);
    }
  });
  return () => {
    cancelled = true;
    cancelIdle();
  };
}

/** True when the element starts below the first screen, so its animation can be set up later. */
export const belowFold = (el: Element | null) =>
  !!el && el.getBoundingClientRect().top > window.innerHeight;

/**
 * useGSAP plus gsap.matchMedia: `setup` runs with the current reduced-motion / phone / desktop
 * state and is reverted and re-run automatically when any of them changes, and on unmount.
 *
 * With `defer` returning true (e.g. for anything below the fold), setup waits until the fonts have
 * loaded and the browser is idle, so dozens of text splits and scroll triggers don't hold up the
 * first paint, and headings are split once, with their final font.
 */
export function useMotion(
  setup: (ctx: MotionContext) => void | (() => void),
  scope?: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
  defer?: () => boolean,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduced: MEDIA.reduced,
          motionOk: MEDIA.motionOk,
          mobile: MEDIA.mobile,
          desktop: MEDIA.desktop,
        },
        (context) => {
          const { reduced, mobile, desktop } = context.conditions as Record<
            string,
            boolean
          >;
          if (!defer?.()) return setup({ reduced, mobile, desktop });

          let cleanup: void | (() => void);
          const cancel = afterFontsWhenIdle(() =>
            // Record what the deferred setup creates so it is reverted with everything else.
            context.add(() => {
              cleanup = setup({ reduced, mobile, desktop });
            }),
          );
          return () => {
            cancel();
            cleanup?.();
          };
        },
      );
      return () => mm.revert();
    },
    { scope, dependencies },
  );
}
