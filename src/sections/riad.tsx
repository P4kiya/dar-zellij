import { RevealText } from '@/components/motion/reveal-text';
import { Photo } from '@/components/photo';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, type PhotoName } from '@/lib/photos';
import { RiadRooms } from './riad-rooms';

/** The house, room by room: pinned and scrolled sideways on desktop, swiped on phones. */
export function Riad({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <section
      className="riad"
      id="riad"
      data-bg="sand"
      aria-labelledby="riad-title"
    >
      <RiadRooms
        hint={t.riad.hint}
        roomsLabel={t.riad.roomsLabel}
        intro={
          <div className="riad-intro">
            <RevealText variant="eyebrow" className="eyebrow">
              {t.riad.kicker}
            </RevealText>
            <RevealText
              as="h2"
              id="riad-title"
              variant="heading"
              className="section-title"
            >
              <Rich text={t.riad.title} />
            </RevealText>
            <RevealText as="p" className="riad-text">
              <Rich text={t.riad.text} />
            </RevealText>
          </div>
        }
      >
        {t.riad.rooms.map((room, i) => {
          const name = room.photo as PhotoName;
          const { width, height } = photo(name);
          return (
            <figure
              key={room.photo}
              className={`room ${height > width ? 'room--tall' : 'room--wide'}`}
            >
              <Photo
                name={name}
                alt={PHOTO_ALT[name][lang]}
                sizes={
                  height > width
                    ? '(min-width: 1024px) 34vh, 70vw'
                    : '(min-width: 1024px) 100vh, 88vw'
                }
                className="room-photo"
                reveal={false}
                parallax={false}
              />
              <figcaption>
                <span className="room-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="room-name">{room.name}</span>
                <span className="room-text">{room.text}</span>
              </figcaption>
            </figure>
          );
        })}
      </RiadRooms>
    </section>
  );
}
