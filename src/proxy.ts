import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, hasLocale } from '@/lib/i18n';

/**
 * The bare address (/) sends visitors to /fr or /en, whichever comes first in their browser's
 * languages; French otherwise, as on the current site.
 */
export function proxy(request: NextRequest) {
  const preferred = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());
  const lang = preferred.find(hasLocale) ?? DEFAULT_LOCALE;
  return NextResponse.redirect(new URL(`/${lang}`, request.url));
}

export const config = { matcher: '/' };
