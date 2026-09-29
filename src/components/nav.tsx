'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Phone } from 'lucide-react';
import { Rosette, Wordmark } from '@/components/brand';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { OpenStatus, type StatusStrings } from '@/components/open-status';
import { useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { LOCALES, type Locale } from '@/lib/i18n';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { CONTACT } from '@/lib/site';

type NavProps = {
  lang: Locale;
  links: { id: string; label: string }[];
  book: string;
  status: StatusStrings;
  a11y: {
    home: string;
    primaryNav: string;
    language: string;
    openMenu: string;
    closeMenu: string;
  };
  menuLabel: string;
  closeLabel: string;
};

// Past this point the bar slims down and gets its background.
const SCROLLED_AT = 80;
// Ignore scroll jitter smaller than this before hiding or revealing the bar.
const DIRECTION_THRESHOLD = 6;

export function Nav({
  lang,
  links,
  book,
  status,
  a11y,
  menuLabel,
  closeLabel,
}: NavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AT);
      if (y <= SCROLLED_AT) {
        setHidden(false);
        lastY = y;
      } else if (Math.abs(y - lastY) > DIRECTION_THRESHOLD) {
        // Hide while scrolling down, come back as soon as the visitor scrolls up.
        setHidden(y > lastY);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The rosette turns slowly with the page, a full turn from top to bottom.
  useMotion(
    ({ reduced }) => {
      if (reduced) return;
      gsap.to('.nav-brand .rosette-mark', {
        rotation: 360,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.8 },
      });
    },
    headerRef,
    [],
    () => true,
  );

  // Phone menu: hold the page, move focus in, close on Escape, give focus back on close.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    document.documentElement.classList.add('has-menu-open');
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const toggle = toggleRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('has-menu-open');
      unlockScroll();
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  // Switch language but stay on the same section.
  const switchTo = (event: MouseEvent<HTMLAnchorElement>, locale: Locale) => {
    event.preventDefault();
    window.location.href = `/${locale}${window.location.hash}`;
  };

  const classes = [
    'nav-shell',
    scrolled && 'is-scrolled',
    hidden && !open && 'is-hidden',
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  const languageSwitch = (
    <div className="lang-switch" role="group" aria-label={a11y.language}>
      {LOCALES.map((locale) => (
        <a
          key={locale}
          href={`/${locale}`}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === lang ? 'true' : undefined}
          onClick={(e) => switchTo(e, locale)}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </div>
  );

  return (
    <header ref={headerRef} className={classes}>
      <nav className="nav-inner" aria-label={a11y.primaryNav}>
        <a
          className="nav-brand"
          href="#top"
          onClick={closeMenu}
          aria-label={a11y.home}
        >
          <Rosette className="rosette-mark" />
          <Wordmark className="wordmark-mark" />
        </a>
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {languageSwitch}
          <MagneticButton
            href="#book"
            size="sm"
            variant="light"
            className="nav-book"
          >
            {book}
          </MagneticButton>
          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? a11y.closeMenu : a11y.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle__label" aria-hidden="true">
              {open ? closeLabel : menuLabel}
            </span>
            <span className="menu-toggle__lines" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div
        ref={panelRef}
        id="mobile-menu"
        className="mobile-menu"
        hidden={!open}
      >
        <ol className="mobile-menu__links">
          {links.map((link, i) => (
            <li key={link.id} style={{ '--i': i } as React.CSSProperties}>
              <a href={`#${link.id}`} onClick={closeMenu}>
                <span className="mobile-menu__index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {link.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="mobile-menu__foot">
          <OpenStatus t={status} />
          <a className="mobile-menu__phone" href={CONTACT.phoneHref}>
            <Phone size={15} strokeWidth={1.5} aria-hidden="true" />{' '}
            {CONTACT.phone}
          </a>
          <div className="mobile-menu__row">
            {languageSwitch}
            <MagneticButton
              href="#book"
              size="sm"
              variant="light"
              onClick={closeMenu}
            >
              {book}
            </MagneticButton>
          </div>
        </div>
      </div>
    </header>
  );
}
