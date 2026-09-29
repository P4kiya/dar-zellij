import { Phone } from 'lucide-react';
import { Rosette } from '@/components/brand';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { RevealText } from '@/components/motion/reveal-text';
import { Photo } from '@/components/photo';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { CONTACT } from '@/lib/site';
import { CurtainReveal } from './curtain-reveal';

/** The last call before the footer: the curtains opening onto a table, and the owner's "Laissez-vous tenter !". */
export function Closing({ t, lang }: { t: Dictionary; lang: Locale }) {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <CurtainReveal className="closing-media">
        <Photo
          name="curtains"
          alt={PHOTO_ALT.curtains[lang]}
          sizes="(max-width: 767px) 400vw, 120vw"
          className="closing-photo"
          reveal={false}
          parallax={false}
        />
      </CurtainReveal>
      <div className="closing-content container-dz">
        <Rosette className="closing-mark" />
        <RevealText
          as="h2"
          id="closing-title"
          variant="heading"
          className="closing-title"
        >
          <Rich text={t.closing.title} />
        </RevealText>
        <RevealText as="p" className="closing-text">
          {t.closing.text}
        </RevealText>
        <RevealText className="closing-actions" delay={0.35}>
          <MagneticButton href="#book" variant="light">
            {t.closing.book}
          </MagneticButton>
          <MagneticButton
            href={CONTACT.phoneHref}
            variant="ghost"
            icon={<Phone size={14} strokeWidth={1.5} />}
          >
            {t.closing.call}
          </MagneticButton>
        </RevealText>
      </div>
    </section>
  );
}
