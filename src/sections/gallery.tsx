import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, type PhotoName } from '@/lib/photos';
import { GalleryGrid } from './gallery-grid';

// Landscapes span two columns, portraits one: in this order each row of four columns is full.
const PHOTOS: PhotoName[] = [
  'curtains',
  'wine-petals',
  'terrace-cactus',
  'rose-wine',
  'rooftop-tent',
  'couscous-tfaya',
  'waiter-tray',
  'waiter-plating',
  'carved-door',
  'rooftop-dusk',
  'patio-red',
];

export function Gallery({ t, lang }: { t: Dictionary; lang: Locale }) {
  const g = t.gallery;
  const items = PHOTOS.map((name) => ({
    photo: photo(name),
    alt: PHOTO_ALT[name][lang],
  }));
  return (
    <section
      className="section gallery"
      id="gallery"
      aria-labelledby="gallery-title"
    >
      <div className="container-dz">
        <header className="section-head section-head--split">
          <div>
            <RevealText variant="eyebrow" className="eyebrow">
              {g.kicker}
            </RevealText>
            <RevealText
              as="h2"
              id="gallery-title"
              variant="heading"
              className="section-title"
            >
              <Rich text={g.title} />
            </RevealText>
          </div>
          <RevealText as="p" className="lede">
            {g.text}
          </RevealText>
        </header>
        <GalleryGrid
          items={items}
          labels={{
            open: g.open,
            close: g.close,
            prev: g.prev,
            next: g.next,
            dialog: g.dialog,
          }}
        />
      </div>
    </section>
  );
}
