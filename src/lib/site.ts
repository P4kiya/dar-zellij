// Facts about the restaurant, from the current marrakech-riads.com page and the 2024 menu.
// Confirm with the owner before launch (README, "Before launch").

export const CONTACT = {
  phone: '+212 (0)5 24 38 26 27',
  phoneHref: 'tel:+212524382627',
  email: 'reservation@darzellij.com',
  instagram: '@darzellij',
  instagramUrl: 'https://www.instagram.com/darzellij/',
  street: '1, Kaasour, Sidi Benslimane',
  city: 'Marrakech',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Dar%20Zellij%2C%20Kaasour%2C%20Sidi%20Benslimane%2C%20Marrakech',
};

export const GROUP = {
  name: 'Marrakech Riads',
  url: {
    fr: 'https://marrakech-riads.com/',
    en: 'https://marrakech-riads.com/en/',
  },
};

/** Weekdays as in Date#getDay: 0 = Sunday. */
export const HOURS = {
  opens: 12,
  closes: 24,
  closedWeekday: 2,
  brunchWeekday: 0,
  brunchFrom: 11,
  dancerWeekdays: [4, 0],
};

export const TIME_ZONE = 'Africa/Casablanca';
