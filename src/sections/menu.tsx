import { Fragment } from 'react';
import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import type { Locale } from '@/lib/i18n';
import { MenuBook, type BookChapter } from './menu-book';
import { menuPages, pagesHtml } from './menu-pages';

type Props = { t: Dictionary; lang: Locale };

/**
 * La carte: the restaurant's menu as the object it is, a wine-red book with the rosette on its
 * cover, that opens and whose pages turn. The pages are laid out in menu-pages.ts (as HTML, so
 * that they cost nothing to hydrate) and rendered here, on the server, next to the client
 * component that turns them (menu-book.tsx): the chapters above the book, the controls under it.
 */
export function Menu({ t, lang }: Props) {
  const m = t.menu;
  const pages = menuPages(t, lang);

  const chapters: BookChapter[] = (
    [
      ['starters', 'starters'],
      ['mains', 'mains'],
      ['desserts', 'desserts'],
      ['menus', 'menu-1'],
      ['cocktails', 'cocktails'],
      ['wines', 'wines'],
      ['drinks', 'aperitifs'],
    ] as const
  ).map(([id, pageId]) => ({
    id,
    label: m.chapters[id],
    page: pages.findIndex((page) => page.id === pageId),
  }));

  return (
    <section
      className="section menu"
      id="menu"
      data-bg="ivory"
      aria-labelledby="menu-title"
    >
      <div className="container-dz">
        <header className="menu-head">
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
        </header>
      </div>

      <div
        className="menu-book"
        role="group"
        aria-label={m.book.label}
        data-side="front"
      >
        <MenuBook
          pages={pages.map(({ id, label, chapter, endpaper }) => ({
            id,
            label,
            chapter,
            endpaper,
          }))}
          chapters={chapters}
          t={m.book}
        />
        <div className="menu-book__stage">
          <div className="menu-book__body">
            {/* Under and around the pages: the shadow on the table and the book's thickness. */}
            {(['right', 'left'] as const).map((half) => (
              <Fragment key={half}>
                <span
                  className={`menu-book__ground menu-book__ground--${half}`}
                  aria-hidden="true"
                />
                <span
                  className={`menu-book__edge menu-book__edge--fore menu-book__edge--fore-${half}`}
                  aria-hidden="true"
                />
                <span
                  className={`menu-book__edge menu-book__edge--foot menu-book__edge--foot-${half}`}
                  aria-hidden="true"
                />
              </Fragment>
            ))}
            <div
              className="menu-book__leaves"
              data-cursor="link"
              dangerouslySetInnerHTML={{ __html: pagesHtml(pages) }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
