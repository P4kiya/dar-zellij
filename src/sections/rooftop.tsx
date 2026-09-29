import { Parallax } from '@/components/motion/parallax';
import { RevealText } from '@/components/motion/reveal-text';
import { Photo } from '@/components/photo';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { SIGNATURE_COCKTAIL_PRICE, SIGNATURE_COCKTAILS } from '@/content/menu';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';

/** Full-bleed: the rooftop over the medina, with four of the signature cocktails. */
export function Rooftop({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <section className="rooftop" id="rooftop" aria-labelledby="rooftop-title">
      <Parallax className="rooftop-media" from={-9} to={9}>
        <Photo
          name="rooftop-view"
          alt={PHOTO_ALT['rooftop-view'][lang]}
          sizes="(max-width: 767px) 350vw, 140vw"
          className="rooftop-photo"
          reveal={false}
          parallax={false}
        />
      </Parallax>
      <div className="container-dz rooftop-content">
        <div className="rooftop-copy">
          <RevealText variant="eyebrow" className="eyebrow">
            {t.rooftop.kicker}
          </RevealText>
          <RevealText
            as="h2"
            id="rooftop-title"
            variant="heading"
            className="section-title"
          >
            <Rich text={t.rooftop.title} />
          </RevealText>
          <RevealText as="p" className="lede">
            {t.rooftop.text}
          </RevealText>
        </div>
        <div className="rooftop-side">
          <Photo
            name="rooftop-waiter"
            alt={PHOTO_ALT['rooftop-waiter'][lang]}
            sizes="520px"
            position="24% 50%"
            className="rooftop-inset"
            delay={0.2}
          />
          <RevealText className="rooftop-card" delay={0.3}>
            <p className="rooftop-card__title">
              <span className="eyebrow">{t.rooftop.cocktails}</span>
              <span className="price">
                {SIGNATURE_COCKTAIL_PRICE}
                <span className="price__unit"> MAD</span>
              </span>
            </p>
            <ul>
              {SIGNATURE_COCKTAILS.slice(0, 4).map((drink) => (
                <li key={drink.name.fr}>
                  <span className="rooftop-drink">{drink.name[lang]}</span>
                  <span className="rooftop-desc">{drink.desc[lang]}</span>
                </li>
              ))}
            </ul>
          </RevealText>
        </div>
      </div>
    </section>
  );
}
