'use client';

import { useRef } from 'react';
import { ArrowUp, AtSign, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Rosette, Wordmark } from '@/components/brand';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { OpenStatus, type StatusStrings } from '@/components/open-status';
import { Rich } from '@/components/rich';
import { ZellijDado } from '@/components/zellij-dado';
import { useMinuteClock } from '@/hooks/use-minute-clock';
import { useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { marrakechTime } from '@/lib/hours';
import { dur, EASE, REVEAL_START } from '@/lib/motion';
import { CONTACT } from '@/lib/site';

type FooterProps = {
  t: {
    tagline: string;
    est: string;
    explore: string;
    find: string;
    hours: string;
    hoursLines: string[];
    group: string;
    time: string;
    top: string;
    book: string;
  };
  links: { id: string; label: string }[];
  status: StatusStrings;
  home: string;
  newTab: string;
  groupUrl: string;
};

export function Footer({
  t,
  links,
  status,
  home,
  newTab,
  groupUrl,
}: FooterProps) {
  const ref = useRef<HTMLElement>(null);
  const now = useMinuteClock();

  useMotion(
    ({ reduced, mobile }) => {
      const footer = ref.current;
      if (!footer || reduced) return;
      // How much of the footer the viewport can show at once.
      const visible = () => Math.min(footer.offsetHeight, window.innerHeight);

      // Curtain: the content starts tucked up under the closing section and settles as it lifts
      // away, fully in place when the footer's top reaches the top of the viewport (or the end of
      // the page when the whole footer fits).
      gsap.fromTo(
        footer.querySelector('.footer-inner'),
        { y: () => -0.25 * visible() },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: () => `+=${visible()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.from(footer.querySelectorAll('.footer-col'), {
        opacity: 0,
        y: 24,
        duration: dur(1.1, mobile),
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: {
          trigger: footer.querySelector('.footer-grid'),
          start: REVEAL_START,
          once: true,
        },
      });
    },
    ref,
    [],
    () => true,
  );

  const external = { target: '_blank', rel: 'noopener' } as const;

  return (
    <footer ref={ref} className="footer">
      <div className="footer-inner container-dz">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <a href="#top" className="footer-lockup" aria-label={home}>
              <Rosette className="footer-rosette" />
              <Wordmark className="footer-wordmark" />
            </a>
            <p className="footer-tagline">
              <Rich text={t.tagline} />
            </p>
            <p className="footer-est">{t.est}</p>
            <MagneticButton href="#book" variant="light" size="sm">
              {t.book}
            </MagneticButton>
          </div>

          <nav className="footer-col" aria-labelledby="footer-explore">
            <h2 className="footer-heading" id="footer-explore">
              {t.explore}
            </h2>
            <ul className="footer-links">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`}>
                    <span className="link-text">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-heading">{t.find}</h2>
            <ul className="footer-contact">
              <li>
                <a href={CONTACT.mapsUrl} {...external}>
                  <MapPin size={16} strokeWidth={1.4} aria-hidden="true" />
                  <span className="link-text">
                    {CONTACT.street}, {CONTACT.city}
                  </span>
                  <span className="sr-only"> {newTab}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref}>
                  <Phone size={16} strokeWidth={1.4} aria-hidden="true" />
                  <span className="link-text">{CONTACT.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Mail size={16} strokeWidth={1.4} aria-hidden="true" />
                  <span className="link-text">{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={CONTACT.instagramUrl} {...external}>
                  <AtSign size={16} strokeWidth={1.4} aria-hidden="true" />
                  <span className="link-text">
                    Instagram {CONTACT.instagram}
                  </span>
                  <span className="sr-only"> {newTab}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">{t.hours}</h2>
            <ul className="footer-hours">
              {t.hoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <OpenStatus t={status} className="footer-status" />
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Dar Zellij ·{' '}
            <a href={groupUrl} {...external}>
              <span className="link-text">{t.group}</span>
              <span className="sr-only"> {newTab}</span>
            </a>
          </span>
          <span className="footer-time">
            <Clock size={14} strokeWidth={1.5} aria-hidden="true" />
            {t.time} <time>{now ? marrakechTime(now).time : '--:--'}</time>
          </span>
          <a href="#top" className="footer-back">
            {t.top} <ArrowUp size={13} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
      <ZellijDado />
    </footer>
  );
}
