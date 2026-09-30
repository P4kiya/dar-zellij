import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MEDIA, matches } from '@/lib/motion';

let lenis: Lenis | null = null;

// Anchor links (nav, booking buttons, back to top) glide over an eased 1.6s.
const GLIDE = { duration: 1.6 };

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. Skipped for reduced motion. */
export function startSmoothScroll() {
  const refresh = () => ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });

  if (matches(MEDIA.reduced)) {
    return () => window.removeEventListener('load', refresh);
  }

  const instance = new Lenis({ lerp: 0.09, anchors: GLIDE, autoRaf: false });
  lenis = instance;
  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    window.removeEventListener('load', refresh);
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

/** Lets the page scroll again (when a dialog or the phone menu closes). */
export const unlockScroll = () => lenis?.start();

/** Holds the page still (while a dialog or the phone menu is open). */
export const lockScroll = () => lenis?.stop();

/** Scrolls the page on by a distance (glides with Lenis; the browser's own scrolling otherwise). */
export function scrollPageBy(px: number) {
  if (lenis) {
    lenis.scrollTo(window.scrollY + px, { duration: 0.9 });
    return;
  }
  window.scrollBy({
    top: px,
    behavior: matches(MEDIA.reduced) ? 'auto' : 'smooth',
  });
}

/** Glides to an element (falls back to the browser when Lenis is off, e.g. reduced motion). */
export function scrollToTarget(target: string | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target, GLIDE);
    return;
  }
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView();
}
