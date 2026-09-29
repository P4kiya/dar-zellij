import { FileText } from 'lucide-react';
import { Rosette } from '@/components/brand';
import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import {
  CLASSIC_COCKTAIL_PRICE,
  CLASSIC_COCKTAILS,
  DESSERTS,
  MAINS,
  MOCKTAILS,
  SET_MENUS,
  SIGNATURE_COCKTAIL_PRICE,
  SIGNATURE_COCKTAILS,
  SIGNATURES,
  STARTERS,
  type Dish,
  type Drink,
} from '@/content/menu';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, type PhotoName } from '@/lib/photos';
import { MENU_PDFS } from '@/lib/site';
import { MenuTabs } from './menu-tabs';

type Props = { t: Dictionary; lang: Locale };

const Price = ({ value }: { value: number }) => (
  <span className="price">
    {value}
    <span className="sr-only"> MAD</span>
  </span>
);

function DishList({ dishes, lang }: { dishes: Dish[]; lang: Locale }) {
  return (
    <ul className="dish-list">
      {dishes.map((dish) => (
        <li key={dish.name.fr} className="dish">
          <div className="dish-head">
            <span className="dish-name">{dish.name[lang]}</span>{' '}
            <span className="dish-leader" aria-hidden="true" />
            <Price value={dish.price} />
          </div>
          {dish.desc && <p className="dish-desc">{dish.desc[lang]}</p>}
          {dish.note && <p className="dish-note">{dish.note[lang]}</p>}
        </li>
      ))}
    </ul>
  );
}

function SetMenus({ t, lang }: Props) {
  return (
    <div className="set-menus">
      {SET_MENUS.map((menu) => (
        <article key={menu.name.fr} className="set-menu">
          <header className="set-menu__head">
            <h3>{menu.name[lang]}</h3>
            <p className="set-menu__price">
              <Price value={menu.price} />
              <span className="set-menu__per">{t.menu.perPerson}</span>
            </p>
          </header>
          {menu.courses.map((course) => (
            <div key={course.course} className="set-menu__course">
              <h4>{t.menu.courses[course.course]}</h4>
              {course.intro && (
                <p className="set-menu__intro">{course.intro[lang]}</p>
              )}
              <ul
                style={
                  { '--or': JSON.stringify(t.menu.or) } as React.CSSProperties
                }
              >
                {course.options
                  .filter((option) => option[lang])
                  .map((option) => (
                    <li key={option[lang]}>{option[lang]}</li>
                  ))}
              </ul>
              {course.after && (
                <p className="set-menu__after">{course.after[lang]}</p>
              )}
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}

function DrinkGroup({
  title,
  price,
  drinks,
  lang,
}: {
  title: string;
  price?: number;
  drinks: Drink[];
  lang: Locale;
}) {
  return (
    <div className="drink-group">
      <h3 className="drink-group__title">
        {title}
        {price && (
          <>
            {' '}
            <span className="dish-leader" aria-hidden="true" />
            <Price value={price} />
          </>
        )}
      </h3>
      <ul className="dish-list">
        {drinks.map((drink) => (
          <li key={drink.name.fr} className="dish">
            <div className="dish-head">
              <span className="dish-name">{drink.name[lang]}</span>
              {drink.price && (
                <>
                  {' '}
                  <span className="dish-leader" aria-hidden="true" />
                  <Price value={drink.price} />
                </>
              )}
            </div>
            <p className="dish-desc">{drink.desc[lang]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Menu({ t, lang }: Props) {
  const m = t.menu;
  const tab = (
    id: string,
    label: string,
    name: PhotoName,
    panel: React.ReactNode,
  ) => ({
    id,
    label,
    panel,
    photo: photo(name),
    alt: PHOTO_ALT[name][lang],
  });

  const tabs = [
    tab(
      'starters',
      m.tabs.starters,
      'salads',
      <DishList dishes={STARTERS} lang={lang} />,
    ),
    tab(
      'mains',
      m.tabs.mains,
      'tagine-prunes',
      <>
        <DishList dishes={MAINS} lang={lang} />
        <p className="panel-note">{m.tagineNote}</p>
      </>,
    ),
    tab(
      'desserts',
      m.tabs.desserts,
      'alcove-service',
      <DishList dishes={DESSERTS} lang={lang} />,
    ),
    tab('menus', m.tabs.menus, 'alcove-salads', <SetMenus t={t} lang={lang} />),
    tab(
      'drinks',
      m.tabs.drinks,
      'mojito',
      <div className="drinks">
        <DrinkGroup
          title={m.drinks.signature}
          price={SIGNATURE_COCKTAIL_PRICE}
          drinks={SIGNATURE_COCKTAILS}
          lang={lang}
        />
        <DrinkGroup
          title={m.drinks.classics}
          price={CLASSIC_COCKTAIL_PRICE}
          drinks={CLASSIC_COCKTAILS}
          lang={lang}
        />
        <DrinkGroup title={m.drinks.mocktails} drinks={MOCKTAILS} lang={lang} />
        <p className="panel-note">
          {m.drinks.wine}{' '}
          <a href={MENU_PDFS.drinks} target="_blank" rel="noopener">
            {m.downloads.drinks} ({m.downloads.pdf})
          </a>
        </p>
      </div>,
    ),
  ];

  return (
    <section
      className="section menu"
      id="menu"
      data-bg="ivory"
      aria-labelledby="menu-title"
    >
      <div className="container-dz">
        <header className="menu-head">
          <div className="menu-head__title">
            <RevealText variant="eyebrow" className="eyebrow">
              {m.kicker}
            </RevealText>
            <RevealText
              as="h2"
              id="menu-title"
              variant="heading"
              className="section-title"
            >
              <Rich text={m.title} />
            </RevealText>
          </div>
          <div className="menu-head__side">
            <RevealText as="p" className="lede">
              {m.intro}
            </RevealText>
            <RevealText className="menu-downloads" delay={0.3}>
              <a href={MENU_PDFS.food} target="_blank" rel="noopener">
                <FileText size={16} strokeWidth={1.4} aria-hidden="true" />
                <span className="link-text">{m.downloads.food}</span>
                <small>{m.downloads.pdf}</small>
              </a>
              <a href={MENU_PDFS.drinks} target="_blank" rel="noopener">
                <FileText size={16} strokeWidth={1.4} aria-hidden="true" />
                <span className="link-text">{m.downloads.drinks}</span>
                <small>{m.downloads.pdf}</small>
              </a>
            </RevealText>
          </div>
        </header>

        <RevealText className="signatures" delay={0.1}>
          <div className="signatures__intro">
            <Rosette className="signatures__mark" />
            <h3 className="eyebrow">{m.signature.label}</h3>
            <p>{m.signature.text}</p>
          </div>
          <ul className="signatures__list">
            {SIGNATURES.map((dish) => (
              <li key={dish.name.fr} className="signature">
                <div className="signature__head">
                  <h4>{dish.name[lang]}</h4> <Price value={dish.price} />
                </div>
                {dish.forTwo && (
                  <span className="signature__tag">{m.signature.forTwo}</span>
                )}
                {dish.desc && <p>{dish.desc[lang]}</p>}
              </li>
            ))}
          </ul>
        </RevealText>

        <MenuTabs label={m.tabsLabel} tabs={tabs} />

        <p className="menu-currency">{m.currency}</p>
      </div>
    </section>
  );
}
