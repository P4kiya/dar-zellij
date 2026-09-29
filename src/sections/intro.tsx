import { Rosette } from '@/components/brand';
import { RevealText } from '@/components/motion/reveal-text';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';

export function Intro({ t }: { t: Dictionary }) {
  return (
    <section
      className="section intro"
      data-bg="ivory"
      aria-label={t.intro.kicker}
    >
      <div className="container-dz intro-grid">
        <RevealText variant="eyebrow" className="eyebrow intro-kicker">
          <Rosette className="eyebrow-mark" />
          {t.intro.kicker}
        </RevealText>
        <RevealText as="p" variant="heading" className="intro-statement">
          <Rich text={t.intro.statement} />
        </RevealText>
        <div className="intro-side">
          <RevealText as="p" className="intro-aside">
            {t.intro.aside}
          </RevealText>
          <dl className="intro-facts">
            {t.intro.facts.map((fact, i) => (
              <RevealText
                key={fact.label}
                className="fact"
                delay={0.25 + i * 0.12}
              >
                <dt>
                  <span className="fact-value">
                    <Rich text={fact.value} />
                  </span>
                  <span className="fact-label">{fact.label}</span>
                </dt>
                <dd>{fact.text}</dd>
              </RevealText>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
