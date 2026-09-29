import { ArrowUpRight } from 'lucide-react';
import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import type { Locale } from '@/lib/i18n';
import { CONTACT } from '@/lib/site';
import { BookingForm } from './booking-form';

export function Book({ t, lang }: { t: Dictionary; lang: Locale }) {
  const b = t.book;
  const external = { target: '_blank', rel: 'noopener' } as const;
  return (
    <section
      className="section book"
      id="book"
      data-bg="ivory"
      aria-labelledby="book-title"
    >
      <div className="container-dz book-grid">
        <div className="book-info">
          <RevealText variant="eyebrow" className="eyebrow">
            {b.kicker}
          </RevealText>
          <RevealText
            as="h2"
            id="book-title"
            variant="heading"
            className="section-title"
          >
            <Rich text={b.title} />
          </RevealText>
          <RevealText as="p" className="lede">
            {b.text}
          </RevealText>
          <RevealText delay={0.3}>
            <dl className="book-details">
              <div>
                <dt>{b.details.address}</dt>
                <dd>
                  {CONTACT.street}
                  <br />
                  {CONTACT.city}
                  <a
                    className="book-directions"
                    href={CONTACT.mapsUrl}
                    {...external}
                  >
                    <span className="link-text">{b.details.directions}</span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="sr-only"> {t.a11y.newTab}</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>{b.details.phone}</dt>
                <dd>
                  <a href={CONTACT.phoneHref}>
                    <span className="link-text">{CONTACT.phone}</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>{b.details.email}</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`}>
                    <span className="link-text">{CONTACT.email}</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>{b.details.instagram}</dt>
                <dd>
                  <a href={CONTACT.instagramUrl} {...external}>
                    <span className="link-text">{CONTACT.instagram}</span>
                    <span className="sr-only"> {t.a11y.newTab}</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>{b.details.hours}</dt>
                <dd>
                  {b.hoursLines.map((line) => (
                    <span key={line} className="book-hours-line">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </RevealText>
        </div>
        <RevealText className="book-panel" delay={0.2}>
          <BookingForm t={b.form} lang={lang} />
        </RevealText>
      </div>
    </section>
  );
}
