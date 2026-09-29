import { notFound } from 'next/navigation';
import { BookingDock } from '@/components/booking-dock';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { SiteShell } from '@/components/site-shell';
import { getDictionary } from '@/content';
import { hasLocale } from '@/lib/i18n';
import { restaurantJsonLd } from '@/lib/seo';
import { GROUP } from '@/lib/site';
import { Book } from '@/sections/book';
import { Closing } from '@/sections/closing';
import { Gallery } from '@/sections/gallery';
import { Hero } from '@/sections/hero';
import { Intro } from '@/sections/intro';
import { Menu } from '@/sections/menu';
import { Riad } from '@/sections/riad';
import { Ritual } from '@/sections/ritual';
import { Rooftop } from '@/sections/rooftop';
import { Sisters } from '@/sections/sisters';
import { Week } from '@/sections/week';

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const footerLinks = [
    ...t.nav.links,
    { id: 'gallery', label: t.gallery.kicker },
    { id: 'book', label: t.book.kicker },
  ];

  return (
    <SiteShell cursorLabel={t.cursor.view}>
      <Nav
        lang={lang}
        links={t.nav.links}
        book={t.nav.book}
        status={t.status}
        a11y={t.a11y}
        menuLabel={t.nav.menu}
        closeLabel={t.nav.close}
      />
      <main id="main" tabIndex={-1}>
        <Hero t={t} lang={lang} />
        <Intro t={t} />
        <Riad t={t} lang={lang} />
        <Ritual t={t} lang={lang} />
        <Menu t={t} lang={lang} />
        <Rooftop t={t} lang={lang} />
        <Week t={t} />
        <Gallery t={t} lang={lang} />
        <Book t={t} lang={lang} />
        <Sisters t={t} />
        <Closing t={t} lang={lang} />
      </main>
      <Footer
        t={t.footer}
        links={footerLinks}
        status={t.status}
        home={t.a11y.home}
        newTab={t.a11y.newTab}
        groupUrl={GROUP.url[lang]}
      />
      <BookingDock
        label={t.dock.label}
        book={t.dock.book}
        bookShort={t.dock.bookShort}
        call={t.dock.call}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd(t, lang)).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />
    </SiteShell>
  );
}
