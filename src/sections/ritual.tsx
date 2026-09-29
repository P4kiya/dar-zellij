import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, type PhotoName } from '@/lib/photos';
import { RitualScroller } from './ritual-scroller';

/** The owner's own sentence about the evening, one beat per photo. */
export function Ritual({ t, lang }: { t: Dictionary; lang: Locale }) {
  const beats = t.ritual.beats.map((beat) => {
    const name = beat.photo as PhotoName;
    return { text: beat.text, photo: photo(name), alt: PHOTO_ALT[name][lang] };
  });
  return (
    <section className="ritual" id="ritual" aria-labelledby="ritual-title">
      <RitualScroller
        kicker={t.ritual.kicker}
        photosLabel={t.ritual.photosLabel}
        beats={beats}
      />
    </section>
  );
}
