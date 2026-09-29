import type { RefObject } from 'react';
import { useMotion } from '@/hooks/use-motion';
import { gsap, ScrollTrigger } from '@/lib/gsap';

type Stop = { start: number; end: number; from: string; to: string };

/**
 * The page background blends between the light sections' colours as you scroll (ivory → sand for
 * the riad → ivory for the menu and the booking → sand for the other tables). Sections mark their
 * colour with data-bg="<token>"; they keep that colour in CSS, and while this runs the shell gets
 * .bg-morph, which makes them transparent so the shell's colour shows through.
 *
 * Dark sections (the ritual, the week, the gallery) and full-bleed photos keep their own solid
 * background: blending light into dark would leave the outgoing section's text on the wrong colour.
 *
 * One ScrollTrigger drives the colour from stops measured on refresh: each section blends in from
 * the previous colour while its top travels from 70% to 30% of the viewport.
 */
export function useBackgroundMorph(shellRef: RefObject<HTMLElement | null>) {
  useMotion(
    ({ reduced }) => {
      const shell = shellRef.current;
      if (!shell || reduced) return;
      const sections = gsap.utils.toArray<HTMLElement>('[data-bg]', shell);
      if (!sections.length) return;
      const root = getComputedStyle(document.documentElement);
      const colours = sections.map((section) =>
        root.getPropertyValue(`--${section.dataset.bg}`).trim(),
      );

      let stops: Stop[] = [];
      const measure = () => {
        const vh = window.innerHeight;
        stops = sections.map((section, i) => {
          const top = section.getBoundingClientRect().top + window.scrollY;
          return {
            start: top - vh * 0.7,
            end: top - vh * 0.3,
            from: colours[Math.max(i - 1, 0)],
            to: colours[i],
          };
        });
      };
      const paint = (scroll: number) => {
        let colour = colours[0];
        for (const stop of stops) {
          if (scroll < stop.start) break;
          if (scroll >= stop.end) {
            colour = stop.to;
            continue;
          }
          const progress = (scroll - stop.start) / (stop.end - stop.start);
          colour = gsap.utils.interpolate(stop.from, stop.to, progress);
          break;
        }
        shell.style.backgroundColor = colour;
      };

      shell.classList.add('bg-morph');
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onRefresh: (self) => {
          measure();
          paint(self.scroll());
        },
        onUpdate: (self) => paint(self.scroll()),
      });

      return () => {
        shell.classList.remove('bg-morph');
        shell.style.backgroundColor = '';
      };
    },
    shellRef,
    [],
    () => true,
  );
}
