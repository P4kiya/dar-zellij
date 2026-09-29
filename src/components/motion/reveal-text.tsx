'use client';

import {
  useRef,
  type AnchorHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
} from 'react';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap, SplitText } from '@/lib/gsap';
import { dur, EASE, EASE_EXPO, REVEAL_START, STAGGER } from '@/lib/motion';

type Variant = 'heading' | 'eyebrow' | 'text';

type RevealTextProps = HTMLAttributes<HTMLElement> &
  Pick<AnchorHTMLAttributes<HTMLElement>, 'href' | 'target' | 'rel'> & {
    as?: ElementType;
    /** heading: lines slide up from behind a mask. eyebrow: fade + letter-spacing settle. text: fade up 24px. */
    variant?: Variant;
    delay?: number;
  };

// Text paragraphs follow their heading slightly later.
const DEFAULT_DELAY: Record<Variant, number> = {
  heading: 0,
  eyebrow: 0,
  text: 0.18,
};

/**
 * Text that animates in as it scrolls into view. The server renders it as plain, visible text; the
 * setup for anything below the first screen waits until the fonts are in and the browser is idle.
 * (The hero has its own CSS intro, so the first screen never waits for JavaScript.)
 */
export function RevealText({
  as: Tag = 'div',
  variant = 'text',
  delay = DEFAULT_DELAY[variant],
  ...rest
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    ({ reduced, mobile }) => {
      const el = ref.current;
      if (!el) return;

      // Wires a tween to the element's scroll position.
      const start = (vars: gsap.TweenVars): gsap.TweenVars => ({
        ...vars,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
      });

      if (reduced) {
        gsap.from(el, start({ opacity: 0, duration: 0.6, ease: 'none' }));
        return;
      }

      if (variant === 'heading') {
        // Headings get an aria-label with the whole text (lines are hidden from screen readers).
        // SplitText's own label uses textContent, which runs words together across <br>;
        // innerText keeps those breaks. aria-label isn't allowed on paragraphs, so those are read
        // line by line.
        const isHeading = /^H[1-6]$/.test(el.tagName);
        const label = el.innerText.replace(/\s+/g, ' ').trim();
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          aria: isHeading ? 'auto' : 'none',
          onSplit: (self) => {
            el.classList.add('is-split');
            if (isHeading) el.setAttribute('aria-label', label);
            return gsap.from(
              self.lines,
              start({
                yPercent: 110,
                duration: dur(1.3, mobile),
                ease: EASE_EXPO,
                stagger: STAGGER,
                delay,
              }),
            );
          },
        });
        return;
      }

      if (variant === 'eyebrow') {
        gsap.from(
          el,
          start({
            opacity: 0,
            letterSpacing: '0.55em',
            duration: dur(1.4, mobile),
            ease: EASE,
            delay,
            // Keep it on one line while it is wider than its final size.
            onStart: () => {
              el.style.whiteSpace = 'nowrap';
            },
            onComplete: () => {
              el.style.whiteSpace = '';
            },
          }),
        );
        return;
      }

      gsap.from(
        el,
        start({
          opacity: 0,
          y: 24,
          duration: dur(1.1, mobile),
          ease: EASE,
          delay,
        }),
      );
    },
    ref,
    [],
    () => belowFold(ref.current),
  );

  return <Tag ref={ref} {...rest} />;
}
