import 'server-only';
import { markHtml } from '@/components/brand';
import { esc, richHtml } from '@/components/rich';
import type { Dictionary } from '@/content';
import {
  APERITIFS,
  BEERS,
  CHAMPAGNES,
  CLASSIC_COCKTAIL_PRICE,
  CLASSIC_COCKTAILS,
  COFFEES,
  DESSERTS,
  DIGESTIFS,
  JUICES,
  MAINS,
  MOCKTAILS,
  SET_MENUS,
  SIGNATURE_COCKTAIL_PRICE,
  SIGNATURE_COCKTAILS,
  SIGNATURES,
  SOFTS,
  SPIRITS,
  STARTERS,
  TEAS,
  WINES,
  type Dish,
  type Drink,
  type ListGroup,
  type SetMenu,
} from '@/content/menu';
import type { Locale } from '@/lib/i18n';
import { CONTACT } from '@/lib/site';
import type { BookPageMeta } from './menu-book';

// The pages of the menu book, laid out from the September 2024 menus. They are written as HTML
// strings on purpose: 28 pages of dishes are a lot of elements, and as strings React neither
// sends them twice nor walks them when the page becomes interactive (which was costing a slow
// phone a third of a second). Nothing in them ever changes; menu-book.tsx only turns them.

export type BookPage = BookPageMeta & {
  tone: 'wine' | 'paper';
  html: string;
};

const price = (value: number) =>
  `<span class="price">${value}<span class="sr-only"> MAD</span></span>`;
const leader = '<span class="bk-leader" aria-hidden="true"></span>';

/** A paper page as the menu prints them: "Est. 1999", the flower, "Marrakech", a rule at the foot. */
const sheet = (est: string, city: string, body: string) =>
  `<div class="bk-sheet">` +
  `<div class="bk-head" aria-hidden="true"><span>${esc(est)}</span>${markHtml('flower', 'bk-head__flower')}<span>${esc(city)}</span></div>` +
  `<div class="bk-body">${body}</div>` +
  `<div class="bk-foot" aria-hidden="true">${markHtml('band', 'bk-foot__band')}</div>` +
  `</div>`;

const title = (
  text: string,
  options: { continued?: string; price?: number } = {},
) =>
  `<header class="bk-title"><h3>${esc(text)}${options.continued ? ` <small>(${esc(options.continued)})</small>` : ''}</h3>` +
  (options.price
    ? `<p class="bk-title__price">${price(options.price)}</p>`
    : '') +
  `</header>`;

const dishes = (
  list: (Dish & { forTwo?: boolean })[],
  lang: Locale,
  forTwo?: string,
) =>
  `<ul class="bk-dishes">` +
  list
    .map(
      (dish) =>
        `<li class="bk-dish">` +
        `<div class="bk-dish__head"><span class="bk-dish__name">${esc(dish.name[lang])}</span> ${leader}${price(dish.price)}</div>` +
        (dish.forTwo && forTwo
          ? `<p class="bk-dish__note">${esc(forTwo)}</p>`
          : '') +
        (dish.desc
          ? `<p class="bk-dish__desc">${esc(dish.desc[lang])}</p>`
          : '') +
        (dish.note
          ? `<p class="bk-dish__note">${esc(dish.note[lang])}</p>`
          : '') +
        `</li>`,
    )
    .join('') +
  `</ul>`;

const cocktails = (list: Drink[], lang: Locale) =>
  `<ul class="bk-dishes">` +
  list
    .map(
      (drink) =>
        `<li class="bk-dish">` +
        `<div class="bk-dish__head"><span class="bk-dish__name">${esc(drink.name[lang])}</span>${drink.price ? ` ${leader}${price(drink.price)}` : ''}</div>` +
        `<p class="bk-dish__desc">${esc(drink.desc[lang])}</p>` +
        `</li>`,
    )
    .join('') +
  `</ul>`;

/** One of the three set menus, centred like on the printed menu, "or" between the choices. */
const setMenu = (menu: SetMenu, t: Dictionary, lang: Locale) =>
  `<div class="bk-set">` +
  `<header class="bk-title"><h3>${esc(menu.name[lang])}</h3><p class="bk-title__price">${price(menu.price)} <span>${esc(t.menu.perPerson)}</span></p></header>` +
  menu.courses
    .map(
      (course) =>
        `<div class="bk-set__course">` +
        `<h4 class="bk-subtitle">${esc(t.menu.courses[course.course])}</h4>` +
        (course.intro
          ? `<p class="bk-set__aside">${esc(course.intro[lang])}</p>`
          : '') +
        `<ul style="--or:${esc(JSON.stringify(t.menu.or))}">` +
        course.options
          .filter((option) => option[lang])
          .map((option) => `<li>${esc(option[lang])}</li>`)
          .join('') +
        `</ul>` +
        (course.after
          ? `<p class="bk-set__aside">${esc(course.after[lang])}</p>`
          : '') +
        `</div>`,
    )
    .join('') +
  `</div>`;

/** A list of the drinks menu: a name and a price per line, or brands one after the other. */
const group = (item: ListGroup, lang: Locale) => {
  const heading =
    `<h4 class="bk-subtitle"><span>${esc(item.title[lang])}</span>${item.price ? ` ${price(item.price)}` : ''}</h4>` +
    (item.note
      ? `<p class="bk-group__note">(${esc(item.note[lang])})</p>`
      : '');
  let list: string;
  if (item.inline) {
    // With a price each, the brands sit in two columns; without (one price for all), commas.
    const last = item.lines.length - 1;
    list =
      `<ul class="${item.price ? 'bk-inline' : 'bk-inline bk-inline--each'}">` +
      item.lines
        .map(
          (line, i) =>
            `<li><span>${esc(line.name[lang])}</span>${line.price ? ` ${price(line.price)}` : i < last ? ', ' : ''}</li>`,
        )
        .join('') +
      `</ul>`;
  } else {
    list =
      `<ul class="bk-lines">` +
      item.lines
        .map((line) => {
          const sizes = line.sizes
            ? `<small>${line.sizes.map((size, i) => `${i > 0 ? ' · ' : ''}<span>${esc(size.label[lang])} ${price(size.price)}</span>`).join('')}</small>`
            : '';
          const detail = line.detail
            ? `<small>${esc(line.detail[lang])}</small>`
            : '';
          return (
            `<li class="bk-line"><span class="bk-line__name">${esc(line.name[lang])}${detail}${sizes}</span>` +
            (line.price ? ` ${leader}${price(line.price)}` : '') +
            `</li>`
          );
        })
        .join('') +
      `</ul>`;
  }
  return `<section class="bk-group">${heading}${list}</section>`;
};

/** Every page of the book, in order. The count must stay even: the last leaf is the back cover. */
export function menuPages(t: Dictionary, lang: Locale): BookPage[] {
  const m = t.menu;
  const { est, city } = t.preloader;
  const continued = (text: string) => `${text} (${m.continued})`;

  const paper = (
    id: string,
    label: string,
    chapter: string | undefined,
    body: string,
  ): BookPage => ({
    id,
    label,
    chapter,
    tone: 'paper',
    html: sheet(est, city, body),
  });

  // A page of lists is named after its first list ("Whiskey" for whiskey, rum, tequila and beers).
  const lists = (
    id: string,
    chapter: string,
    groups: ListGroup[],
    heading?: string,
  ) =>
    paper(
      id,
      heading ?? groups[0].title[lang],
      chapter,
      (heading ? title(heading) : '') +
        groups.map((item) => group(item, lang)).join(''),
    );

  const [red, rose, gris, white, sparkling] = WINES;
  const [vodka, gin, ...otherSpirits] = SPIRITS;

  return [
    {
      id: 'cover',
      label: m.book.cover,
      tone: 'wine',
      html:
        `<div class="bk-cover"><span class="bk-cover__line">${esc(est)}</span>` +
        markHtml('rosette', 'bk-cover__rosette') +
        `<span class="bk-cover__line">${esc(city)}</span></div>`,
    },
    { id: 'endpaper-front', label: '', tone: 'wine', endpaper: true, html: '' },
    {
      id: 'title',
      label: t.hero.title,
      tone: 'paper',
      html:
        `<div class="bk-titlepage"><span class="bk-titlepage__line">${esc(est)}</span>` +
        markHtml('wordmark', 'bk-titlepage__mark', t.hero.title) +
        `<span class="bk-titlepage__line">${richHtml(t.hero.tagline)}</span>` +
        `<p class="bk-titlepage__note">${esc(m.currency)}</p></div>`,
    },

    paper(
      'starters',
      m.chapters.starters,
      'starters',
      title(m.chapters.starters) + dishes(STARTERS.slice(0, 3), lang),
    ),
    paper(
      'starters-2',
      continued(m.chapters.starters),
      'starters',
      title(m.chapters.starters, { continued: m.continued }) +
        dishes(STARTERS.slice(3), lang),
    ),
    paper(
      'mains',
      m.chapters.mains,
      'mains',
      title(m.chapters.mains) + dishes(MAINS.slice(0, 6), lang),
    ),
    paper(
      'mains-2',
      continued(m.chapters.mains),
      'mains',
      title(m.chapters.mains, { continued: m.continued }) +
        dishes(MAINS.slice(6), lang) +
        `<p class="bk-note">${esc(m.tagineNote)}</p>`,
    ),
    paper(
      'signatures',
      m.signature.label,
      'mains',
      title(m.signature.label) +
        `<p class="bk-lede">${esc(m.signature.text)}</p>` +
        dishes(SIGNATURES, lang, m.signature.forTwo),
    ),
    paper(
      'desserts',
      m.chapters.desserts,
      'desserts',
      title(m.chapters.desserts) + dishes(DESSERTS, lang),
    ),

    ...SET_MENUS.map((menu, i) =>
      paper(`menu-${i + 1}`, menu.name[lang], 'menus', setMenu(menu, t, lang)),
    ),

    {
      id: 'drinks',
      label: m.drinks.title,
      chapter: 'cocktails',
      tone: 'paper',
      html: `<div class="bk-titlepage">${markHtml('flower', 'bk-titlepage__flower')}<h3 class="bk-titlepage__title">${esc(m.drinks.title)}</h3></div>`,
    },
    paper(
      'cocktails',
      m.drinks.signature,
      'cocktails',
      title(m.drinks.signature, { price: SIGNATURE_COCKTAIL_PRICE }) +
        cocktails(SIGNATURE_COCKTAILS.slice(0, 5), lang),
    ),
    paper(
      'cocktails-2',
      continued(m.drinks.signature),
      'cocktails',
      title(m.drinks.signature, {
        continued: m.continued,
        price: SIGNATURE_COCKTAIL_PRICE,
      }) + cocktails(SIGNATURE_COCKTAILS.slice(5), lang),
    ),
    paper(
      'classics',
      m.drinks.classics,
      'cocktails',
      title(m.drinks.classics, { price: CLASSIC_COCKTAIL_PRICE }) +
        cocktails(CLASSIC_COCKTAILS.slice(0, 5), lang),
    ),
    paper(
      'classics-2',
      continued(m.drinks.classics),
      'cocktails',
      title(m.drinks.classics, {
        continued: m.continued,
        price: CLASSIC_COCKTAIL_PRICE,
      }) + cocktails(CLASSIC_COCKTAILS.slice(5), lang),
    ),
    paper(
      'mocktails',
      m.drinks.mocktails,
      'cocktails',
      title(m.drinks.mocktails) + cocktails(MOCKTAILS, lang),
    ),

    lists('wines', 'wines', [red], m.drinks.wines),
    lists('wines-2', 'wines', [rose, gris]),
    lists('wines-3', 'wines', [white]),
    lists('champagne', 'wines', [sparkling, CHAMPAGNES, DIGESTIFS]),

    lists('aperitifs', 'drinks', [APERITIFS, vodka, gin]),
    lists('spirits', 'drinks', [...otherSpirits, BEERS]),
    lists('softs', 'drinks', [SOFTS, JUICES]),
    lists('hot', 'drinks', [COFFEES, TEAS], m.drinks.hot),

    { id: 'endpaper-back', label: '', tone: 'wine', endpaper: true, html: '' },
    {
      id: 'back',
      label: m.book.backCover,
      tone: 'wine',
      html:
        `<div class="bk-back">` +
        ['tl', 'tr', 'bl', 'br']
          .map((corner) =>
            markHtml('sprig', `bk-back__sprig bk-back__sprig--${corner}`),
          )
          .join('') +
        `<address class="bk-back__address">` +
        `<span>${esc(CONTACT.street.replace(/,/g, ''))} ${esc(CONTACT.city)}</span>` +
        `<a href="${CONTACT.phoneHref}">${esc(CONTACT.phone)}</a>` +
        `<a href="${CONTACT.instagramUrl}" target="_blank" rel="noopener">${esc(CONTACT.instagram)}<span class="sr-only"> ${esc(t.a11y.newTab)}</span></a>` +
        `<a href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a>` +
        `</address>` +
        `<a class="bk-back__book" href="#book">${esc(t.dock.book)}</a>` +
        `</div>`,
    },
  ];
}

/** The pages as the book's markup: the cover and the page under it start visible, the script decides the rest. */
export const pagesHtml = (pages: BookPage[]) =>
  pages
    .map(
      (page, i) =>
        `<article class="bk-page${i === 0 || i === 2 ? ' is-live' : ''}${page.endpaper ? ' bk-page--endpaper' : ''}" data-tone="${page.tone}" style="--i:${i}">${page.html}<span class="bk-shade" aria-hidden="true"></span></article>`,
    )
    .join('');
