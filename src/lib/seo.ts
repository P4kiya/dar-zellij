import type { Dictionary } from '@/content';
import type { Locale } from '@/lib/i18n';
import { CONTACT } from '@/lib/site';

/** The deployed address (set NEXT_PUBLIC_SITE_URL for the real domain; Vercel provides its own). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/** schema.org Restaurant data, so search engines can show hours, address and booking. */
export function restaurantJsonLd(t: Dictionary, lang: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Dar Zellij',
    description: t.meta.description,
    url: `${SITE_URL}/${lang}`,
    image: `${SITE_URL}/og.jpg`,
    servesCuisine: 'Moroccan',
    priceRange: '$$$',
    acceptsReservations: true,
    telephone: '+212524382627',
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.city,
      addressCountry: 'MA',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '12:00',
        closes: '23:59',
      },
    ],
    hasMenu: `${SITE_URL}/${lang}#menu`,
    award: 'La Liste 2016',
    sameAs: [CONTACT.instagramUrl],
  };
}
