import type { Locale } from '@/lib/i18n';
import { en } from './en';
import { fr, type Dictionary } from './fr';

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

/** Server-side only: client components receive just the strings they need as props. */
export const getDictionary = (locale: Locale) => DICTIONARIES[locale];
