import { ArrowUpRight } from 'lucide-react';
import { RevealText } from '@/components/motion/reveal-text';
import { Photo } from '@/components/photo';
import { Rich } from '@/components/rich';
import type { Dictionary } from '@/content';
import type { PhotoName } from '@/lib/photos';

/** The two other Marrakech Riads tables, on marrakech-riads.com. */
export function Sisters({ t }: { t: Dictionary }) {
  const s = t.sisters;
  return (
    <section
      className="section sisters"
      data-bg="sand"
      aria-labelledby="sisters-title"
    >
      <div className="container-dz">
        <header className="section-head section-head--split">
          <div>
            <RevealText variant="eyebrow" className="eyebrow">
              {s.kicker}
            </RevealText>
            <RevealText
              as="h2"
              id="sisters-title"
              variant="heading"
              className="section-title"
            >
              <Rich text={s.title} />
            </RevealText>
          </div>
          <RevealText as="p" className="lede">
            {s.text}
          </RevealText>
        </header>
        <ul className="sister-grid">
          {s.items.map((item, i) => (
            <li key={item.name}>
              <a
                className="sister"
                href={item.url}
                target="_blank"
                rel="noopener"
              >
                <span className="sister-media">
                  <Photo
                    name={item.photo as PhotoName}
                    alt=""
                    sizes="(min-width: 768px) 46vw, 92vw"
                    className="sister-photo"
                    delay={i * 0.12}
                  />
                </span>
                <span className="sister-meta">
                  <span className="sister-city">{item.city}</span>
                  <span className="sister-name">{item.name}</span>
                  <span className="sister-cta">
                    {s.cta}
                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="sr-only"> {t.a11y.newTab}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
