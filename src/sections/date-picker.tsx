'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, X } from 'lucide-react';
import type { Dictionary } from '@/content';
import type { Locale } from '@/lib/i18n';
import { matches, MEDIA } from '@/lib/motion';
import { lockScroll, scrollPageBy, unlockScroll } from '@/lib/scroll';

type Strings = Pick<
  Dictionary['book']['form'],
  | 'pickDate'
  | 'prevMonth'
  | 'nextMonth'
  | 'today'
  | 'closedLegend'
  | 'closedShort'
  | 'closeCalendar'
>;

type DatePickerProps = {
  id: string;
  label: string;
  /** YYYY-MM-DD, or '' for none. */
  value: string;
  /** Today in Marrakech (YYYY-MM-DD); earlier days can't be chosen. */
  min: string;
  /** Date#getDay number of the weekly closing day. */
  closedWeekday: number;
  lang: Locale;
  t: Strings;
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
};

// The week starts on Monday, as in the week section (Date#getDay numbers).
const WEEK = [1, 2, 3, 4, 5, 6, 0];

const LOCALE: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };

// Days are YYYY-MM-DD strings (they sort as text), handled at noon UTC so that no time zone can
// shift them.
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const toDate = (day: string) => new Date(`${day}T12:00:00Z`);
const fromDate = (date: Date) =>
  iso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
const weekdayOf = (day: string) => toDate(day).getUTCDay();

const addDays = (day: string, n: number) => {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + n);
  return fromDate(date);
};

/** The same day of the month n months away (or the last day, for a shorter month). */
const addMonths = (day: string, n: number) => {
  const date = toDate(day);
  const first = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1),
  );
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return iso(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    Math.min(date.getUTCDate(), last),
  );
};

const localToday = () => {
  const now = new Date();
  return iso(now.getFullYear(), now.getMonth(), now.getDate());
};

const capitalize = (text: string) =>
  text.charAt(0).toLocaleUpperCase() + text.slice(1);

/** A month (YYYY-MM) as rows of seven days, null for the blanks before the 1st and after the last day. */
function monthRows(month: string) {
  const [y, m] = month.split('-').map(Number);
  const cells: (string | null)[] = [];
  const blanks = WEEK.indexOf(new Date(Date.UTC(y, m - 1, 1)).getUTCDay());
  for (let i = 0; i < blanks; i++) cells.push(null);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  for (let d = 1; d <= count; d++) cells.push(iso(y, m - 1, d));
  while (cells.length % 7) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/**
 * The date field of the booking form: a button showing the chosen day, and a calendar drawn like
 * the rest of the page (the browser's own picker is blue, in the system font and in the visitor's
 * date order). It follows the WAI-ARIA date picker dialog pattern: the arrow keys move by day and
 * by week, Home/End to the ends of the week, Page Up/Down by month (a year with Shift), Enter picks,
 * Escape closes. A popover under the field on desktop; on phones a sheet at the foot of the screen
 * (a modal dialog). Past days and the closing day can't be picked.
 */
export function DatePicker({
  id,
  label,
  value,
  min,
  closedWeekday,
  lang,
  t,
  invalid,
  describedBy,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // The calendar is only built once it is first opened: its "today" is only known in the browser.
  const [mounted, setMounted] = useState(false);
  // The day holding the keyboard focus (the one cell with tabindex 0); its month is the one shown.
  const [focused, setFocused] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const modalRef = useRef(false); // opened as a sheet (phones)?
  const lockedRef = useRef(false); // page scrolling held by the sheet?
  const refocusRef = useRef(true); // give the focus back to the field when closing?
  const pendingFocus = useRef(false); // move the focus to `focused` after this render (keyboard moves)

  const locale = LOCALE[lang];
  const today = min || localToday();
  const view = focused.slice(0, 7);

  const names = useMemo(() => {
    const short = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: 'UTC',
    });
    const long = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      timeZone: 'UTC',
    });
    // 1 January 2024 was a Monday.
    return WEEK.map((_, i) => {
      const date = toDate(addDays('2024-01-01', i));
      return {
        short: short.format(date).replace(/\.$/, ''),
        long: long.format(date),
      };
    });
  }, [locale]);

  const rows = useMemo(() => (view ? monthRows(view) : []), [view]);

  const monthLabel = view
    ? capitalize(
        new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(toDate(`${view}-01`)),
      )
    : '';

  const shown = value
    ? capitalize(
        new Intl.DateTimeFormat(locale, {
          // Short weekday ("Mer. 30 septembre"): the field is narrow next to the time and guests.
          weekday: 'short',
          day: 'numeric',
          month: 'long',
          // The year only when it is not this one.
          ...(value.slice(0, 4) === today.slice(0, 4)
            ? {}
            : { year: 'numeric' as const }),
          timeZone: 'UTC',
        }).format(toDate(value)),
      )
    : '';

  const canPrev = view > today.slice(0, 7);
  const enabled = (day: string) =>
    day >= today && weekdayOf(day) !== closedWeekday;

  const openCalendar = () => {
    modalRef.current = matches(MEDIA.mobile);
    setFocused(value || today);
    setMounted(true);
    pendingFocus.current = true;
    setOpen(true);
  };

  const close = useCallback((refocus: boolean) => {
    refocusRef.current = refocus;
    dialogRef.current?.close();
  }, []);

  // Shows the dialog once its content is rendered; the popover also closes on a click anywhere else
  // (the sheet has its backdrop for that).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) {
      if (modalRef.current) {
        dialog.showModal();
        lockScroll();
        lockedRef.current = true;
      } else {
        dialog.show();
        // Bring the whole popover into view when the field sits low on the screen.
        const below =
          dialog.getBoundingClientRect().bottom + 24 - window.innerHeight;
        if (below > 0) scrollPageBy(below);
      }
    }
    if (modalRef.current) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!dialog.contains(target) && !triggerRef.current?.contains(target))
        close(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, close]);

  // Keyboard moves land on their day once it is rendered (it may be in another month).
  useEffect(() => {
    if (!open || !pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>('[tabindex="0"]')
      ?.focus({ preventScroll: true });
  });

  // Let the page scroll again if the form goes away (it is sent) while the sheet is open.
  useEffect(
    () => () => {
      if (lockedRef.current) unlockScroll();
    },
    [],
  );

  const onClose = () => {
    setOpen(false);
    if (lockedRef.current) {
      unlockScroll();
      lockedRef.current = false;
    }
    if (refocusRef.current) triggerRef.current?.focus({ preventScroll: true });
    refocusRef.current = true;
  };

  const select = (day: string) => {
    onChange(day);
    close(true);
  };

  /** Moves the keyboard focus (never before today). */
  const move = (day: string) => {
    pendingFocus.current = true;
    setFocused(day < today ? today : day);
  };

  /** The month arrows keep the focus; the focused day moves to the same day of the new month. */
  const step = (months: number) => {
    const day = addMonths(focused, months);
    setFocused(day < today ? today : day);
  };

  const goToday = () => {
    if (enabled(today)) select(today);
    else move(today);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (enabled(focused)) select(focused);
      return;
    }
    const weekIndex = WEEK.indexOf(weekdayOf(focused));
    const moves: Record<string, () => string> = {
      ArrowRight: () => addDays(focused, 1),
      ArrowLeft: () => addDays(focused, -1),
      ArrowDown: () => addDays(focused, 7),
      ArrowUp: () => addDays(focused, -7),
      Home: () => addDays(focused, -weekIndex),
      End: () => addDays(focused, 6 - weekIndex),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
    };
    const to = moves[event.key];
    if (!to) return;
    event.preventDefault();
    move(to());
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close(true);
  };

  // Tabbing out of the popover closes it and lets the focus carry on to the next field.
  const onDialogBlur = (event: FocusEvent<HTMLDialogElement>) => {
    const dialog = event.currentTarget;
    const to = event.relatedTarget as Node | null;
    if (modalRef.current || !dialog.open || !to || dialog.contains(to)) return;
    close(false);
  };

  // A tap on the sheet's backdrop closes it.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (modalRef.current && event.target === event.currentTarget) close(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-cal`}
        aria-labelledby={`${id}-label ${id}`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? close(true) : openCalendar())}
      >
        <span className="date-trigger__text">{shown || t.pickDate}</span>
        <CalendarDays size={15} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <dialog
        ref={dialogRef}
        id={`${id}-cal`}
        className="cal"
        aria-label={t.pickDate}
        onClose={onClose}
        onKeyDown={onDialogKeyDown}
        onBlur={onDialogBlur}
        onClick={onDialogClick}
      >
        {mounted && (
          <>
            <div className="cal-head">
              <p className="cal-month" id={`${id}-month`} aria-live="polite">
                {monthLabel}
              </p>
              <div className="cal-nav">
                <button
                  type="button"
                  className="cal-arrow"
                  aria-label={t.prevMonth}
                  aria-disabled={!canPrev || undefined}
                  onClick={() => canPrev && step(-1)}
                >
                  <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="cal-arrow"
                  aria-label={t.nextMonth}
                  onClick={() => step(1)}
                >
                  <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                className="cal-close"
                aria-label={t.closeCalendar}
                onClick={() => close(true)}
              >
                <X size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <table
              ref={gridRef}
              className="cal-grid"
              role="grid"
              aria-labelledby={`${id}-month`}
              onKeyDown={onGridKeyDown}
            >
              <thead>
                <tr>
                  {names.map((name) => (
                    <th key={name.long} scope="col" abbr={name.long}>
                      {name.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((day, c) => {
                      if (!day)
                        return (
                          <td key={c} className="cal-cell cal-cell--blank" />
                        );
                      const ok = enabled(day);
                      const closed = weekdayOf(day) === closedWeekday;
                      return (
                        <td
                          key={day}
                          className={closed ? 'cal-cell is-closed' : 'cal-cell'}
                          data-date={day}
                          tabIndex={day === focused ? 0 : -1}
                          aria-selected={day === value || undefined}
                          aria-disabled={!ok || undefined}
                          aria-current={day === today ? 'date' : undefined}
                          data-cursor={ok ? 'link' : undefined}
                          onFocus={() => setFocused(day)}
                          onClick={() => ok && select(day)}
                        >
                          {Number(day.slice(8))}
                          {closed && day >= today && (
                            <span className="sr-only">, {t.closedShort}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cal-foot">
              <p className="cal-legend">{t.closedLegend}</p>
              <button
                type="button"
                className="text-button cal-today"
                onClick={goToday}
              >
                {t.today}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
