'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, X } from 'lucide-react';
import type { Dictionary } from '@/content';
import { useFieldPopover } from '@/hooks/use-field-popover';
import type { Locale } from '@/lib/i18n';

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
  // The day holding the keyboard focus (the one cell with tabindex 0); its month is the one shown.
  const [focused, setFocused] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const { open, mounted, openPopover, close, dialogProps } = useFieldPopover(
    triggerRef,
    dialogRef,
  );
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
    setFocused(value || today);
    pendingFocus.current = true;
    openPopover();
  };

  // Keyboard moves land on their day once it is rendered (it may be in another month).
  useEffect(() => {
    if (!open || !pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>('[tabindex="0"]')
      ?.focus({ preventScroll: true });
  });

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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="field-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-cal`}
        aria-labelledby={`${id}-label ${id}`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? close(true) : openCalendar())}
      >
        <span className="field-trigger__text">{shown || t.pickDate}</span>
        <CalendarDays size={15} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <dialog
        {...dialogProps}
        id={`${id}-cal`}
        className="pop pop--cal"
        aria-label={t.pickDate}
      >
        {mounted && (
          <>
            <div className="pop-head">
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
                className="pop-close"
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
