// Shared motion settings so every section moves the same way: slow, soft, transform and opacity only.
export const EASE = 'power3.out';
export const EASE_EXPO = 'expo.out';
export const STAGGER = 0.08;

// Where scroll reveals start: when the element's top passes 88% of the viewport height.
export const REVEAL_START = 'top 88%';

export const MEDIA = {
  reduced: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767px)',
  // Pinned sections (the riad's rooms, the tea ritual) need room to breathe.
  desktop: '(min-width: 1024px) and (min-height: 600px)',
  // Desktop-only effects: custom cursor, magnetic buttons.
  finePointer: '(hover: hover) and (pointer: fine) and (min-width: 768px)',
};

export const matches = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches;

/** Durations are a little shorter on phones. */
export const dur = (seconds: number, mobile: boolean) =>
  mobile ? seconds * 0.75 : seconds;

// sessionStorage key: the preloader shows on the first page view of a session only.
export const PRELOADED_KEY = 'darzellij:preloaded';
