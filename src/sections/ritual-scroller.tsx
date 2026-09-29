'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { PhotoImg } from '@/components/photo-img';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { dur, EASE, REVEAL_START } from '@/lib/motion';
import { placeholderStyle, type PhotoData } from '@/lib/photo-data';

type Beat = { text: string; photo: PhotoData; alt: string };

/**
 * Desktop: the section is as tall as its beats and its content sticks to the screen; scrolling
 * moves through the sentence, lighting one clause at a time while its photo wipes up over the last.
 * Phones and reduced motion: the sentence reads in full under a strip of the three photos.
 */
export function RitualScroller({
  kicker,
  photosLabel,
  beats,
}: {
  kicker: string;
  photosLabel: string;
  beats: Beat[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useMotion(
    ({ reduced, desktop, mobile }) => {
      const root = ref.current;
      if (!root) return;

      if (reduced || !desktop) {
        if (reduced) return;
        gsap.fromTo(
          root.querySelectorAll('.ritual-beat, .ritual-photo'),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: dur(1.1, mobile),
            ease: EASE,
            stagger: 0.12,
            scrollTrigger: { trigger: root, start: REVEAL_START, once: true },
          },
        );
        return;
      }

      root.classList.add('is-scrubbed');
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) =>
          setActive(
            Math.min(
              beats.length - 1,
              Math.floor(self.progress * beats.length),
            ),
          ),
      });
      gsap.to(root.querySelector('.ritual-progress span'), {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
      return () => {
        root.classList.remove('is-scrubbed');
        setActive(0);
      };
    },
    ref,
    [],
    () => belowFold(ref.current),
  );

  const state = (i: number) =>
    i === active ? 'is-active' : i < active ? 'is-past' : '';

  return (
    <div
      ref={ref}
      className="ritual-scroller"
      style={{ '--beats': beats.length } as CSSProperties}
    >
      <div className="ritual-sticky">
        <div className="container-dz ritual-grid">
          <div className="ritual-text">
            <h2 id="ritual-title" className="eyebrow">
              {kicker}
            </h2>
            <div className="ritual-lines">
              <span className="ritual-progress" aria-hidden="true">
                <span />
              </span>
              <p className="ritual-sentence">
                {beats.map((beat, i) => (
                  <span key={beat.text} className={`ritual-beat ${state(i)}`}>
                    <span className="ritual-index" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {beat.text}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>
          {/* A sideways strip on phones: a tab stop so it can be scrolled from the keyboard. */}
          <div
            className="ritual-photos"
            role="region"
            aria-label={photosLabel}
            tabIndex={0}
          >
            {beats.map((beat, i) => (
              <figure
                key={beat.photo.src}
                className={`ritual-photo ${state(i)}`}
                style={placeholderStyle(beat.photo)}
              >
                <PhotoImg
                  data={beat.photo}
                  alt={beat.alt}
                  sizes="(min-width: 1024px) 30vw, 72vw"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
