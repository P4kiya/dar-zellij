export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

// The current site is French first (English under /en), so French is the fallback.
export const DEFAULT_LOCALE: Locale = 'fr';

export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** A string in both languages. */
export type Localized = Record<Locale, string>;
