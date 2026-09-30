import type { CSSProperties } from 'react';
import { Parallax } from '@/components/motion/parallax';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import { PHOTO_ALT } from '@/content/photos';
import type { Locale } from '@/lib/i18n';
import { photo, placeholderStyle } from '@/lib/photos';

/** Delay of one element in the hero's CSS intro (see .hero-in in globals.css). */
const at = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

/**
 * The first screen: the patio, the restaurant's own lettering and the line from the title page of
 * its menu. Nothing else, so the photograph does the talking; booking is in the header (and in the
 * bar at the bottom on phones), hours are further down.
 *
 * Its intro is pure CSS (it plays from the first paint, after the preloader when there is one), so
 * the most important view never waits for JavaScript.
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
        <h1 id="hero-title" className="hero-title">
          {/* The lettering as an image file rather than the inline symbol, so that the browser
              counts it as the largest contentful paint (an inline SVG is never a candidate; the
              metric fell on a button label). No decoding="sync": on an SVG it held the paint
              back a second. Its reveal is .hero-mark in globals.css. */}
          <span className="hero-mark hero-in" style={at(0.1)}>
            <img
              className="hero-wordmark"
              src="/wordmark.svg"
              width={900}
              height={144}
              alt={t.hero.title}
              fetchPriority="high"
            />
          </span>
        </h1>
        <p className="hero-tagline hero-in" style={at(0.55)}>
          <Rich text={t.hero.tagline} />
        </p>
      </div>

      <span className="hero-cue hero-in" style={at(1)} aria-hidden="true" />
    </section>
  );
}
