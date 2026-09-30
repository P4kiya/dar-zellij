'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { fill } from '@/components/rich';
import {
  useHydrated,
  useMediaQuery,
  useReducedMotion,
} from '@/hooks/use-media-query';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { EASE_EXPO, matches, MEDIA } from '@/lib/motion';

/** What the script needs to know about a page; the page itself is rendered by the server. */
export type BookPageMeta = {
  id: string;
  /** Read out, and shown under the book, while the page is in view. Empty for the endpapers. */
  label: string;
  chapter?: string;
  /** The inside of a cover: part of the book as an object, left out when pages show one at a time. */
  endpaper?: boolean;
};

export type BookChapter = { id: string; label: string; page: number };

type BookStrings = {
  label: string;
  chaptersLabel: string;
  open: string;
  close: string;
  prev: string;
  next: string;
  hint: string;
  status: string;
};

/** From this width the book lies open on two pages; below it, one page at a time (as in the CSS). */
const SPREAD = '(min-width: 860px)';

// Seconds for one page; and for each page, and between pages, when several turn in a row.
const TURN = 1.05;
const RIFFLE = 0.62;
const RIFFLE_GAP = 0.085;
const TURN_EASE = 'power2.inOut';

// How the whole book sits: closed on its front (leaning, so its thickness shows, and a little
// farther away), open (flat, for reading), closed on its back. `shift` is in % of the open
// book's width: a closed book is only one page wide, so it moves over to stay in the middle.
type Pose = { shift: number; rx: number; ry: number; rz: number; zoom: number };
type Side = 'front' | 'open' | 'back';
const OPEN: Pose = { shift: 0, rx: 0, ry: 0, rz: 0, zoom: 1 };
const POSES: Record<'spread' | 'single', Record<Side, Pose>> = {
  spread: {
    front: { shift: -25, rx: 15, ry: -19, rz: 1.5, zoom: 0.94 },
    open: OPEN,
    back: { shift: 25, rx: 15, ry: 19, rz: -1.5, zoom: 0.94 },
  },
  single: {
    front: { shift: 0, rx: 9, ry: -13, rz: 1, zoom: 0.88 },
    open: OPEN,
    back: OPEN,
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const sinDeg = (degrees: number) => Math.sin((degrees * Math.PI) / 180);
const acosDeg = (ratio: number) =>
  (Math.acos(clamp(ratio, -1, 1)) * 180) / Math.PI;

/**
 * The menu as a book. The pages are rendered by the server (sections/menu.tsx) as plain HTML next
 * to this component, which is deliberately not their React parent: 28 pages of dishes would be
 * ~100 KB more to send and to hydrate for nothing that ever changes. This component renders the
 * chapters and the controls, and turns the pages by hand.
 *
 * A leaf is a front and a back page (or a single page on phones) that turns about the spine, from
 * 0° (lying on the right) to 180° (on the left). `pos` is the number of leaves turned. Pages turn
 * on a click, a drag, the arrows under the book, the arrow keys or a chapter; only the pages near
 * the open ones are kept in the render tree.
 */
export function MenuBook({
  pages,
  chapters,
  t,
}: {
  pages: BookPageMeta[];
  chapters: BookChapter[];
  t: BookStrings;
}) {
  const spread = useMediaQuery(SPREAD);
  const reduced = useReducedMotion();
  // Pages out of view are hidden from assistive technology, but only once the book works (without
  // JavaScript every page is laid out and readable).
  const ready = useHydrated();

  const navRef = useRef<HTMLElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  // Set when a control under the book had the focus as the book opened or closed (see below).
  const refocus = useRef(false);

  // Leaves as lists of page numbers: [front, back] when open on two pages, [page] on phones.
  const leaves = useMemo(() => {
    if (!spread)
      return pages.flatMap((page, i) => (page.endpaper ? [] : [[i]]));
    const pairs: number[][] = [];
    for (let i = 0; i < pages.length; i += 2) pairs.push([i, i + 1]);
    return pairs;
  }, [pages, spread]);
  // On two pages the last leaf is the back cover and turns too (the book closes on its back).
  const maxPos = spread ? leaves.length : leaves.length - 1;

  const [pos, setPos] = useState(0);
  // Leaves being turned: both their faces stay in the render tree until the turn has finished.
  const [turning, setTurning] = useState<number[]>([]);

  // The same state for the animation code, which runs outside React's render, and the server-
  // rendered elements it drives (found once, on mount).
  const live = useRef({
    pos: 0,
    maxPos,
    spread,
    reduced,
    leaves,
    angles: [] as { a: number }[],
    painted: [] as string[],
    halves: '',
    tweens: 0,
    dragging: false,
    // The page a change of layout (two pages ↔ one) should come back to.
    anchor: 0,
    book: null as HTMLElement | null,
    stage: null as HTMLElement | null,
    body: null as HTMLElement | null,
    leavesEl: null as HTMLElement | null,
    pageEls: [] as { page: HTMLElement; shade: HTMLElement }[],
  });

  const dom = useCallback(() => {
    const state = live.current;
    if (!state.book && navRef.current) {
      const book = navRef.current.parentElement as HTMLElement;
      state.book = book;
      state.stage = book.querySelector('.menu-book__stage');
      state.body = book.querySelector('.menu-book__body');
      state.leavesEl = book.querySelector('.menu-book__leaves');
      state.pageEls = Array.from(
        book.querySelectorAll<HTMLElement>('.bk-page'),
        (page) => ({ page, shade: page.lastElementChild as HTMLElement }),
      );
    }
    return state;
  }, []);

  /** Writes each page's angle, and the shade a turning page takes and casts on its neighbours. */
  const paint = useCallback(() => {
    const state = dom();
    const lift = (k: number) =>
      state.angles[k] ? sinDeg(state.angles[k].a) : 0;
    const write = (index: number, angle: number, shade: number) => {
      const el = state.pageEls[index];
      const value = `${angle.toFixed(2)}|${shade.toFixed(3)}`;
      if (state.painted[index] === value || !el) return;
      state.painted[index] = value;
      el.page.style.setProperty('--a', angle.toFixed(2));
      el.shade.style.opacity = shade.toFixed(3);
    };
    // How much lies on each half (1 = a leaf flat on it), for the shadows under the book.
    let onLeft = 0;
    let onRight = 0;
    state.leaves.forEach(([front, back], k) => {
      const angle = state.angles[k]?.a ?? 0;
      // A front page is shaded by the leaf above it on the right; a back page by the one above it
      // on the left (a little less than the turning leaf itself).
      write(front, angle, Math.max(lift(k), 0.8 * lift(k - 1)));
      if (back !== undefined)
        write(back, angle, Math.max(lift(k), 0.8 * lift(k + 1)));
      onLeft = Math.max(onLeft, clamp((angle - 150) / 30, 0, 1));
      onRight = Math.max(onRight, clamp((30 - angle) / 30, 0, 1));
    });
    const halves = `${onLeft.toFixed(2)}|${onRight.toFixed(2)}`;
    if (state.halves !== halves && state.body) {
      state.halves = halves;
      state.body.style.setProperty('--on-left', onLeft.toFixed(2));
      state.body.style.setProperty('--on-right', onRight.toFixed(2));
    }
  }, [dom]);

  const sideOf = useCallback((position: number): Side => {
    const state = live.current;
    if (position === 0) return 'front';
    return state.spread && position === state.maxPos ? 'back' : 'open';
  }, []);

  /** Leans the book for the state it is in (closed, open, closed on its back). */
  const pose = useCallback(
    (position: number, animate = true) => {
      const state = dom();
      if (!state.body) return;
      const side = sideOf(position);
      const target = POSES[state.spread ? 'spread' : 'single'][side];
      gsap.to(state.body, {
        '--shift': target.shift,
        '--rx': target.rx,
        '--ry': target.ry,
        '--rz': target.rz,
        '--zoom': target.zoom,
        // An open book lies still: whatever lean the pointer gave it goes too.
        ...(side === 'open' ? { '--tx': 0, '--ty': 0 } : {}),
        duration: animate && !state.reduced ? TURN : 0,
        ease: TURN_EASE,
        overwrite: 'auto',
      });
    },
    [dom, sideOf],
  );

  const remember = useCallback((position: number) => {
    const state = live.current;
    state.pos = position;
    const leaf = state.leaves[Math.min(position, state.leaves.length - 1)];
    state.anchor =
      position >= state.leaves.length ? leaf[leaf.length - 1] : leaf[0];
    setPos(position);
  }, []);

  const settle = useCallback(() => {
    const state = live.current;
    if (state.tweens === 0 && !state.dragging) setTurning([]);
  }, []);

  /** Turns one leaf to an angle. Every tween ends in exactly one of onComplete / onInterrupt. */
  const turn = useCallback(
    (
      k: number,
      to: number,
      duration: number,
      delay = 0,
      ease = TURN_EASE,
      then?: () => void,
    ) => {
      const state = live.current;
      const end = () => {
        state.tweens -= 1;
        settle();
      };
      state.tweens += 1;
      gsap.to(state.angles[k], {
        a: to,
        duration: state.reduced ? 0 : duration,
        delay: state.reduced ? 0 : delay,
        ease,
        overwrite: true,
        onUpdate: paint,
        onComplete: () => {
          paint();
          then?.();
          end();
        },
        onInterrupt: end,
      });
    },
    [paint, settle],
  );

  /** Goes to a position, turning every leaf on the way. */
  const go = useCallback(
    (target: number) => {
      const state = live.current;
      const to = clamp(target, 0, state.maxPos);
      const from = state.pos;
      if (to === from) return;
      refocus.current = !!footRef.current?.contains(document.activeElement);
      const forward = to > from;
      const count = Math.abs(to - from);

      if (!state.spread && count > 1) {
        // One page at a time: the pages in between are under the one that turns, so only that one
        // moves and the others change side unseen.
        const mover = forward ? from : to;
        const between = Array.from(
          { length: count - 1 },
          (_, i) => Math.min(from, to) + 1 + i,
        );
        const hide = () => {
          for (const k of between) {
            gsap.killTweensOf(state.angles[k]);
            state.angles[k].a = forward ? 180 : 0;
          }
          paint();
        };
        setTurning([from, to]);
        if (forward) {
          hide();
          turn(mover, 180, TURN);
        } else turn(mover, 0, TURN, 0, TURN_EASE, hide);
      } else {
        const moved = Array.from({ length: count }, (_, i) =>
          forward ? from + i : from - 1 - i,
        );
        // The pages open before the turn stay in place until they are covered.
        setTurning((current) => [...current, ...moved, from - 1, from]);
        moved.forEach((k, i) =>
          turn(
            k,
            forward ? 180 : 0,
            count > 1 ? RIFFLE : TURN,
            count > 1 ? i * RIFFLE_GAP : 0,
          ),
        );
      }
      remember(to);
      pose(to);
    },
    [paint, pose, remember, turn],
  );

  // Two pages ↔ one (on mount, and when the window crosses the breakpoint): lay the leaves out
  // again at the page that was open.
  useLayoutEffect(() => {
    const state = dom();
    for (const angle of state.angles) gsap.killTweensOf(angle);
    Object.assign(state, { spread, leaves, maxPos, tweens: 0 });

    let anchor = state.anchor;
    while (anchor > 0 && !leaves.some((leaf) => leaf.includes(anchor)))
      anchor -= 1;
    const k = leaves.findIndex((leaf) => leaf.includes(anchor));
    const position = leaves[k][0] === anchor ? k : k + 1;

    state.angles = leaves.map((_, i) => ({ a: i < position ? 180 : 0 }));
    state.painted = [];
    state.halves = '';
    paint();
    remember(Math.min(position, maxPos));
    setTurning([]);
    pose(state.pos, false);
  }, [dom, leaves, maxPos, spread, paint, pose, remember]);

  useEffect(() => {
    live.current.reduced = reduced;
  }, [reduced]);

  // What is showing, for the read-out, the chapters and screen readers.
  const side: Side =
    pos === 0 ? 'front' : spread && pos === maxPos ? 'back' : 'open';
  const shown = spread
    ? [2 * pos - 1, 2 * pos].filter((i) => i >= 0 && i < pages.length)
    : [leaves[Math.min(pos, leaves.length - 1)][0]];
  // "Entrées" and "Entrées (suite)" side by side read as "Entrées".
  const names = [
    ...new Set(shown.map((i) => pages[i].label).filter(Boolean)),
  ].filter(
    (name, _, all) =>
      !all.some((other) => other !== name && name.startsWith(other)),
  );
  // Open and still: the pages can lie flat (see "is-resting" in the CSS).
  const resting = side === 'open' && turning.length === 0;
  const chapter = [...shown]
    .reverse()
    .map((i) => pages[i].chapter)
    .find(Boolean);
  const chapterPosition = (page: number) =>
    spread ? Math.ceil(page / 2) : leaves.findIndex((leaf) => leaf[0] === page);

  // The server-rendered book follows the state: which pages are in the render tree (the open
  // ones, their neighbours and the covers), which are hidden from assistive technology, how the
  // book sits, and how many sheets show at each fore edge.
  useLayoutEffect(() => {
    const state = dom();
    if (!state.book || !state.body) return;
    const isLive = (index: number) => {
      const k = leaves.findIndex((leaf) => leaf.includes(index));
      if (k < 0) return false;
      if (turning.includes(k)) return true;
      if (!spread) return k >= pos - 1 && k <= pos + 1;
      const isBack = leaves[k][1] === index;
      // The covers' boards frame the pages lying on them.
      if (isBack ? k === 0 && pos > 0 : k === leaves.length - 1 && pos <= k)
        return true;
      return isBack ? k < pos && k >= pos - 2 : k >= pos && k <= pos + 1;
    };
    state.pageEls.forEach(({ page }, i) => {
      const k = leaves.findIndex((leaf) => leaf.includes(i));
      const hidden = ready && !shown.includes(i);
      page.classList.toggle('is-live', isLive(i));
      page.classList.toggle('is-turning', turning.includes(k));
      page.inert = hidden;
      if (hidden) page.setAttribute('aria-hidden', 'true');
      else page.removeAttribute('aria-hidden');
    });
    state.book.dataset.side = side;
    state.book.classList.toggle('is-resting', resting);
    state.body.style.setProperty('--n', String(pages.length));
    state.body.style.setProperty(
      '--left',
      String(spread ? clamp(pos - 1, 0, 5) : 0),
    );
    state.body.style.setProperty(
      '--right',
      String(
        clamp((spread ? leaves.length - 1 : leaves.length) - 1 - pos, 0, 5),
      ),
    );
  });

  // The book rises into view; then its cover lifts a little, once, to show that it opens.
  useMotion(
    ({ reduced: still }) => {
      const state = dom();
      const stage = state.stage;
      if (!stage || still) return;
      const hint = () => {
        if (state.pos !== 0 || state.tweens > 0 || state.dragging) return;
        gsap.to(state.angles[0], {
          a: 17,
          duration: 0.75,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onUpdate: paint,
        });
      };
      gsap.from(stage, {
        opacity: 0,
        y: 70,
        duration: 1.4,
        ease: EASE_EXPO,
        scrollTrigger: {
          trigger: stage,
          start: 'top 82%',
          once: true,
          onEnter: () => gsap.delayedCall(1.1, hint),
        },
      });
    },
    undefined,
    [],
    () => belowFold(dom().stage),
  );

  // Desktop: the closed book leans a little toward the pointer. (Open, it lies still: see
  // "is-resting" in the CSS.)
  useMotion(
    ({ reduced: still }) => {
      const { stage, body } = dom();
      if (!stage || !body || still || !matches(MEDIA.finePointer)) return;
      const lean = (tx: number, ty: number, duration: number) =>
        gsap.to(body, {
          '--tx': tx,
          '--ty': ty,
          duration,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || live.current.dragging) return;
        if (sideOf(live.current.pos) === 'open') return;
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        lean(-y * 9, x * 12, 0.9);
      };
      const onLeave = () => lean(0, 0, 1.3);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
      return () => {
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
      };
    },
    undefined,
    [],
    () => true,
  );

  // Arrow keys anywhere in the book turn the pages; Home and End close it on either side.
  useEffect(() => {
    const { book } = dom();
    if (!book) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const state = live.current;
      const moves: Record<string, number> = {
        ArrowRight: state.pos + 1,
        ArrowLeft: state.pos - 1,
        Home: 0,
        End: state.maxPos,
      };
      if (!(event.key in moves)) return;
      event.preventDefault();
      go(moves[event.key]);
    };
    book.addEventListener('keydown', onKey);
    return () => book.removeEventListener('keydown', onKey);
  }, [dom, go]);

  // Click a page to turn it, or take it and drag it across.
  useEffect(() => {
    const state = dom();
    const el = state.leavesEl;
    if (!el) return;
    type Drag = {
      id: number;
      x0: number;
      y0: number;
      t0: number;
      /** -1 until the pointer has moved far enough sideways to be a drag. */
      leaf: number;
      forward: boolean;
      /** Where the spine is on screen, and how far from it the page was taken. */
      spine: number;
      reach: number;
      width: number;
      lastX: number;
      lastT: number;
      speed: number;
    };
    let drag: Drag | null = null;

    const follow = (angle: number) => {
      if (!drag) return;
      state.tweens += 1;
      gsap.to(state.angles[drag.leaf], {
        a: angle,
        duration: state.reduced ? 0 : 0.18,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: paint,
        onComplete: () => {
          state.tweens -= 1;
        },
        onInterrupt: () => {
          state.tweens -= 1;
        },
      });
    };

    const onDown = (event: PointerEvent) => {
      if (drag || event.button !== 0) return;
      if ((event.target as Element).closest('a, button')) return;
      const rect = el.getBoundingClientRect();
      const width = state.spread ? rect.width / 2 : rect.width;
      const spine = state.spread ? rect.left + width : rect.left;
      drag = {
        id: event.pointerId,
        x0: event.clientX,
        y0: event.clientY,
        t0: event.timeStamp,
        leaf: -1,
        forward: true,
        spine,
        reach: Math.max(Math.abs(event.clientX - spine), width * 0.35),
        width,
        lastX: event.clientX,
        lastT: event.timeStamp,
        speed: 0,
      };
    };

    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0;
      const dy = event.clientY - drag.y0;

      if (drag.leaf < 0) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        // On two pages, a right page turns forward and a left page turns back; on one page, the
        // direction of the drag decides.
        const forward = state.spread ? drag.x0 >= drag.spine : dx < 0;
        const inward = forward ? dx < 0 : dx > 0;
        const possible = forward ? state.pos < state.maxPos : state.pos > 0;
        if (!inward || !possible) {
          drag = null;
          return;
        }
        const leaf = forward ? state.pos : state.pos - 1;
        drag.forward = forward;
        drag.leaf = leaf;
        state.dragging = true;
        el.setPointerCapture(event.pointerId);
        el.classList.add('is-dragging');
        setTurning((current) => [...current, leaf]);
      }

      const dt = event.timeStamp - drag.lastT;
      if (dt > 0) {
        drag.speed =
          0.7 * ((event.clientX - drag.lastX) / dt) + 0.3 * drag.speed;
        drag.lastX = event.clientX;
        drag.lastT = event.timeStamp;
      }

      // The point that was taken stays under the pointer: it is `reach` from the spine, so at an
      // angle a it shows at reach × cos(a). A page coming back on a phone has no edge to hold, so
      // it follows the distance dragged.
      if (state.spread || drag.forward)
        follow(acosDeg((event.clientX - drag.spine) / drag.reach));
      else follow(180 * (1 - clamp(dx / (drag.width * 0.7), 0, 1)));
    };

    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const ended = drag;
      drag = null;

      if (ended.leaf < 0) {
        // No drag: a click (or tap) turns the page it lands on.
        if (event.type !== 'pointerup' || event.timeStamp - ended.t0 > 700)
          return;
        const back = state.spread
          ? ended.x0 < ended.spine
          : ended.x0 - ended.spine < ended.width * 0.26;
        go(state.pos + (back ? -1 : 1));
        return;
      }

      state.dragging = false;
      el.classList.remove('is-dragging');
      if (el.hasPointerCapture(event.pointerId))
        el.releasePointerCapture(event.pointerId);

      const angle = state.angles[ended.leaf].a;
      const flick = Math.abs(ended.speed) > 0.4;
      // On one page the pointer cannot cross the spine (it is the edge of the screen), so a page
      // counts as turned from a third of the way.
      const threshold = state.spread ? 90 : ended.forward ? 50 : 130;
      const over =
        event.type === 'pointerup' &&
        (flick ? ended.speed < 0 : angle > threshold);
      const to = over ? 180 : 0;
      const position = over ? ended.leaf + 1 : ended.leaf;
      turn(
        ended.leaf,
        to,
        Math.max(0.3, (TURN * Math.abs(to - angle)) / 180),
        0,
        'power2.out',
      );
      if (position !== state.pos) remember(position);
      pose(position);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [dom, go, paint, pose, remember, turn]);

  // Opening and closing swap the controls under the book ("Open the menu" ↔ the arrows). If one
  // of them had the keyboard focus, hand it to its replacement instead of losing it.
  useEffect(() => {
    const foot = footRef.current;
    if (!refocus.current || !foot) return;
    refocus.current = false;
    if (foot.contains(document.activeElement)) return;
    foot
      .querySelector<HTMLElement>('.btn, .menu-book__arrow:last-of-type')
      ?.focus({ preventScroll: true });
  }, [side]);

  // Keep the current chapter in sight when the list scrolls sideways (phones).
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({
      left: current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [chapter]);

  return (
    <>
      <nav
        ref={navRef}
        className="menu-book__chapters"
        aria-label={t.chaptersLabel}
      >
        <ul>
          {chapters.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={item.id === chapter ? 'true' : undefined}
                onClick={() => go(chapterPosition(item.page))}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div ref={footRef} className="menu-book__foot">
        <div className="menu-book__controls">
          {side !== 'front' && (
            <button
              type="button"
              className="menu-book__arrow"
              aria-label={t.prev}
              onClick={() => go(pos - 1)}
            >
              <ArrowLeft size={18} strokeWidth={1.4} aria-hidden="true" />
            </button>
          )}
          {/* Always in the page, so that screen readers hear it change. */}
          <p
            className={side === 'front' ? 'sr-only' : 'menu-book__status'}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">
              {fill(t.status, {
                pages: names.join(', '),
                n: pos + 1,
                total: maxPos + 1,
              })}
            </span>
            {side !== 'front' && (
              <span aria-hidden="true">
                {/* A no-break space before the dot: if the names wrap, the line breaks after it. */}
                <span className="menu-book__names">{names.join(' · ')}</span>
                <span className="menu-book__count">
                  {pos + 1} / {maxPos + 1}
                </span>
              </span>
            )}
          </p>
          {side === 'front' ? (
            <MagneticButton onClick={() => go(1)}>{t.open}</MagneticButton>
          ) : (
            // Not `disabled` on the last page: a disabled button drops the keyboard focus.
            <button
              type="button"
              className="menu-book__arrow"
              aria-label={t.next}
              aria-disabled={pos >= maxPos || undefined}
              onClick={() => go(pos + 1)}
            >
              <ArrowRight size={18} strokeWidth={1.4} aria-hidden="true" />
            </button>
          )}
        </div>
        {side !== 'front' && (
          <p className="menu-book__hint">
            {/* How to turn the pages, until a page has been turned. */}
            {pos === 1 && <span>{t.hint}</span>}
            <button type="button" onClick={() => go(0)}>
              {t.close}
            </button>
          </p>
        )}
      </div>
    </>
  );
}
