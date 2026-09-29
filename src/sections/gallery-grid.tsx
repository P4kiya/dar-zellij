'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { PhotoImg } from '@/components/photo-img';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { dur, EASE, matches, MEDIA } from '@/lib/motion';
import { placeholderStyle, type PhotoData } from '@/lib/photo-data';
import { lockScroll, unlockScroll } from '@/lib/scroll';

type Item = { photo: PhotoData; alt: string };
type Labels = {
  open: string;
  close: string;
  prev: string;
  next: string;
  dialog: string;
};

/** An editorial grid of photos; each opens in a full-screen viewer (a native <dialog>). */
export function GalleryGrid({
  items,
  labels,
}: {
  items: Item[];
  labels: Labels;
}) {
  const gridRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  useMotion(
    ({ reduced, mobile }) => {
      const grid = gridRef.current;
      if (!grid || reduced) return;
      gsap.utils
        .toArray<HTMLElement>('.gallery-item', grid)
        .forEach((item, i) => {
          gsap.from(item, {
            opacity: 0,
            y: 48,
            duration: dur(1.2, mobile),
            ease: EASE,
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: item, start: 'top 92%', once: true },
          });
        });
    },
    gridRef,
    [],
    () => belowFold(gridRef.current),
  );

  return (
    <>
      <ul ref={gridRef} className="gallery-grid">
        {items.map((item, i) => (
          <li
            key={item.photo.src}
            className={`gallery-item ${item.photo.width > item.photo.height ? 'gallery-item--wide' : ''}`}
          >
            <button
              type="button"
              className="gallery-button"
              data-cursor="view"
              style={placeholderStyle(item.photo)}
              aria-label={`${labels.open} – ${item.alt}`}
              aria-haspopup="dialog"
              onClick={() => setIndex(i)}
            >
              <PhotoImg
                data={item.photo}
                alt=""
                sizes={
                  item.photo.width > item.photo.height
                    ? '(min-width: 1024px) 46vw, 92vw'
                    : '(min-width: 1024px) 23vw, 46vw'
                }
              />
            </button>
          </li>
        ))}
      </ul>
      {index !== null && (
        <Lightbox
          items={items}
          index={index}
          labels={labels}
          onIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  labels,
  onIndex,
  onClose,
}: {
  items: Item[];
  index: number;
  labels: Labels;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const item = items[index];

  const go = useCallback(
    (step: number) => onIndex((index + step + items.length) % items.length),
    [index, items.length, onIndex],
  );

  // Open as a modal (focus moves in, Escape closes, the rest of the page is inert).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;
    dialog.showModal();
    lockScroll();
    return () => {
      unlockScroll();
      opener?.focus({ preventScroll: true });
    };
  }, []);

  // Each photo fades in when it changes.
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || matches(MEDIA.reduced)) return;
    const tween = gsap.fromTo(
      figure,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.6, ease: EASE },
    );
    return () => {
      tween.kill();
    };
  }, [index]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };
  const onPointerDown = (event: PointerEvent) => {
    swipe.current = { x: event.clientX, id: event.pointerId };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={labels.dialog}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        // A click on the backdrop (the dialog itself, not its content) closes it.
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div
        className="lightbox__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <figure ref={figureRef} className="lightbox__figure">
          <img
            key={item.photo.src}
            src={item.photo.src}
            srcSet={item.photo.srcSet}
            sizes="92vw"
            width={item.photo.width}
            height={item.photo.height}
            alt={item.alt}
            style={placeholderStyle(item.photo)}
          />
          <figcaption>
            <span className="lightbox__count">
              {String(index + 1).padStart(2, '0')} /{' '}
              {String(items.length).padStart(2, '0')}
            </span>
            {item.alt}
          </figcaption>
        </figure>
      </div>
      <button
        type="button"
        className="lightbox__close"
        onClick={() => dialogRef.current?.close()}
      >
        <span>{labels.close}</span>
        <X size={18} strokeWidth={1.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={() => go(-1)}
        aria-label={labels.prev}
      >
        <ArrowLeft size={20} strokeWidth={1.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={() => go(1)}
        aria-label={labels.next}
      >
        <ArrowRight size={20} strokeWidth={1.4} aria-hidden="true" />
      </button>
    </dialog>
  );
}
