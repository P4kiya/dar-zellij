import { Fragment, type CSSProperties } from 'react';
import { Clock } from 'lucide-react';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { Parallax } from '@/components/motion/parallax';
import { OpenStatus } from '@/components/open-status';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, placeholderStyle } from '@/lib/photos';

/** Delay of one element in the hero's CSS intro (see .hero-in in globals.css). */
const at = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

/** "Dar *Zellij*" → the words, each flagged if it is set in italics. */
const words = (title: string) =>
  title.split(' ').map((word) => ({
    text: word.replace(/\*/g, ''),
    em: word.startsWith('*'),
  }));

/**
 * The first screen. Its intro is pure CSS (it plays from the first paint, after the preloader
 * when there is one), so the most important view never waits for JavaScript.
 */
export function Hero({ t, lang }: { t: Dictionary; lang: Locale }) {
  const wide = photo('courtyard');
  const tall = photo('courtyard-portrait');

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      {/* The parallax layer moves; the picture keeps its own slow CSS zoom. */}
      <Parallax
        className="hero-parallax"
        from={0}
        to={12}
        start="top top"
        end="bottom top"
      >
        <picture className="hero-media" style={placeholderStyle(wide)}>
          <source
            media="(max-width: 720px)"
            srcSet={tall.srcSet}
            sizes="150vw"
          />
          <img
            src={wide.src}
            srcSet={wide.srcSet}
            sizes="110vw"
            width={wide.width}
            height={wide.height}
            alt={PHOTO_ALT.courtyard[lang]}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </Parallax>

      <div className="hero-content container-dz">
        <p className="eyebrow hero-eyebrow hero-in" style={at(0)}>
          {t.hero.eyebrow}
        </p>
        <h1 id="hero-title" className="hero-title">
          {/* The space goes between the word boxes: inside one, at the end of its line, it would
              collapse. */}
          {words(t.hero.title).map((word, i) => (
            <Fragment key={word.text}>
              {i > 0 && ' '}
              <span className="hero-word">
                <span style={at(0.08 + i * 0.1)}>
                  {word.em ? <em>{word.text}</em> : word.text}
                </span>
              </span>
            </Fragment>
          ))}
        </h1>
        <div className="hero-foot">
          <p className="hero-note hero-in" style={at(0.55)}>
            <Rich text={t.hero.note} />
          </p>
          <div className="hero-actions hero-in" style={at(0.7)}>
            <MagneticButton href="#book" variant="light">
              {t.hero.book}
            </MagneticButton>
            <MagneticButton href="#menu" variant="ghost" icon={false}>
              {t.hero.menu}
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className="hero-bar container-dz">
        <span className="hero-hours hero-in" style={at(0.9)}>
          <Clock size={14} strokeWidth={1.5} aria-hidden="true" />
          {t.hero.hours}
        </span>
        <span className="hero-status hero-in" style={at(1)}>
          <OpenStatus t={t.status} />
        </span>
        <span
          className="scroll-cue hero-in"
          style={at(1.05)}
          aria-hidden="true"
        >
          <span className="scroll-cue__line" />
          {t.hero.scroll}
        </span>
      </div>
    </section>
  );
}
