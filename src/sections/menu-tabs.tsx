'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { PhotoImg } from '@/components/photo-img';
import { gsap } from '@/lib/gsap';
import { EASE, matches, MEDIA } from '@/lib/motion';
import { placeholderStyle, type PhotoData } from '@/lib/photo-data';

type Tab = {
  id: string;
  label: string;
  panel: ReactNode;
  photo: PhotoData;
  alt: string;
};

/**
 * The menu's sections as tabs (WAI-ARIA tabs pattern: arrow keys, Home and End move between them).
 * Every panel is in the page for search engines and printing; inactive ones are hidden. The photo
 * beside the list changes with the tab, and the new panel's lines rise in one after another.
 */
export function MenuTabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Slide the underline under the active tab (and keep it there when the layout changes).
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const place = () => {
      const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[active];
      if (!tab) return;
      indicator.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth})`;
      // Keep the active tab visible when the bar scrolls sideways on phones.
      const bar = list.parentElement;
      if (bar && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({
          left: tab.offsetLeft - 16,
          behavior: firstRender.current ? 'auto' : 'smooth',
        });
      }
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  // The new panel's lines rise in (not on first render: the section reveals itself on scroll).
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const panel = panelsRef.current?.querySelector<HTMLElement>(
      `#panel-${tabs[active].id}`,
    );
    if (!panel || matches(MEDIA.reduced)) return;
    const items = panel.querySelectorAll(
      '.dish, .set-menu, .drink-group__title, .panel-note',
    );
    const tween = gsap.from(items, {
      opacity: 0,
      y: 14,
      duration: 0.7,
      ease: EASE,
      stagger: 0.035,
    });
    return () => {
      tween.progress(1).kill();
    };
  }, [active, tabs]);

  const select = (index: number, focus = false) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    if (focus)
      listRef.current
        ?.querySelectorAll<HTMLElement>('[role="tab"]')
        [next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key], true);
  };

  return (
    <div className="menu-tabs">
      <div className="menu-tabs__bar">
        <div
          ref={listRef}
          role="tablist"
          aria-label={label}
          className="tablist"
          onKeyDown={onKeyDown}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
            >
              <span className="tab-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {tab.label}
            </button>
          ))}
          <span
            ref={indicatorRef}
            className="tablist__indicator"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="menu-tabs__body">
        <div className="menu-tabs__photos">
          {tabs.map((tab, i) => (
            <figure
              key={tab.id}
              className={`menu-tabs__photo ${i === active ? 'is-active' : ''}`}
              style={placeholderStyle(tab.photo)}
              aria-hidden={i !== active}
            >
              <PhotoImg
                data={tab.photo}
                alt={tab.alt}
                sizes="(min-width: 1024px) 26vw, 1px"
              />
            </figure>
          ))}
        </div>
        <div ref={panelsRef} className="menu-tabs__panels">
          {tabs.map((tab, i) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              tabIndex={0}
              hidden={i !== active}
              className="menu-panel"
            >
              {tab.panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
