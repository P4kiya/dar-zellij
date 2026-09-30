'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Rosette } from '@/components/brand';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { fill } from '@/components/rich';
import { useMotion } from '@/hooks/use-motion';
import type { Dictionary } from '@/content';
import { gsap } from '@/lib/gsap';
import { marrakechDateISO } from '@/lib/hours';
import type { Locale } from '@/lib/i18n';
import { EASE, matches, MEDIA } from '@/lib/motion';
import { HOURS } from '@/lib/site';
import { DatePicker } from './date-picker';

type Strings = Dictionary['book']['form'];
type Values = {
  date: string;
  time: string;
  guests: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};
type Field = keyof Values;

const EMPTY: Values = {
  date: '',
  time: '',
  guests: '2',
  name: '',
  email: '',
  phone: '',
  message: '',
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GUESTS = Array.from({ length: 12 }, (_, i) => String(i + 1));

/** Weekday (0 = Sunday) of a YYYY-MM-DD date, independent of the visitor's time zone. */
const weekdayOf = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();

/** Seatings every half hour from noon to 23:00; Sundays also 11:00 and 11:30 for brunch. */
function timeSlots(date: string) {
  const slots: { value: string; brunch?: boolean }[] = [];
  if (date && weekdayOf(date) === HOURS.brunchWeekday) {
    slots.push(
      { value: '11:00', brunch: true },
      { value: '11:30', brunch: true },
    );
  }
  for (let h = HOURS.opens; h <= 23; h++) {
    slots.push({ value: `${h}:00` });
    if (h < 23) slots.push({ value: `${h}:30` });
  }
  return slots;
}

const formatTime = (value: string, lang: Locale) => {
  const [h, m] = value.split(':').map(Number);
  if (lang === 'fr') return `${h}h${m ? String(m).padStart(2, '0') : ''}`;
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
};

const formatDate = (iso: string, lang: Locale) =>
  new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T12:00:00Z`));

/**
 * Table request. Frontend only for now: it checks the request (the restaurant is closed on
 * Tuesdays; no dates in the past) and shows a confirmation, but sends nothing yet (README,
 * "Before launch": connect it to email or a booking service).
 */
export function BookingForm({ t, lang }: { t: Strings; lang: Locale }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState<Values | null>(null);
  const [today, setToday] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Today in Marrakech, set in the browser (the server's date could differ).
  useEffect(() => setToday(marrakechDateISO()), []);

  const slots = useMemo(() => timeSlots(values.date), [values.date]);

  const checkDate = (date: string) => {
    if (!date) return t.required;
    if (today && date < today) return t.pastDate;
    if (weekdayOf(date) === HOURS.closedWeekday) return t.closedDay;
    return undefined;
  };

  const validate = (v: Values) => {
    const next: Partial<Record<Field, string>> = {};
    const dateError = checkDate(v.date);
    if (dateError) next.date = dateError;
    if (!v.time) next.time = t.required;
    if (!v.name.trim()) next.name = t.required;
    if (!EMAIL.test(v.email.trim()))
      next.email = v.email ? t.invalidEmail : t.required;
    return next;
  };

  const setField = (field: Field, value: string) => {
    setValues((current) => {
      const next = { ...current, [field]: value };
      // A brunch seating only exists on Sundays.
      if (
        field === 'date' &&
        !timeSlots(value).some((slot) => slot.value === current.time)
      )
        next.time = '';
      return next;
    });
    // Say straight away when the chosen day is a Tuesday; clear other errors as they are fixed.
    if (field === 'date')
      setErrors((current) => ({
        ...current,
        date: value ? checkDate(value) : undefined,
      }));
    else if (errors[field])
      setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setField(event.target.name as Field, event.target.value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#bk-${first}`)?.focus();
      return;
    }
    // TODO before launch: send `values` to the restaurant (see README).
    const panel = panelRef.current;
    if (!panel || matches(MEDIA.reduced)) {
      setSent(values);
      return;
    }
    // Keep the panel's height while the form fades out and the thank-you fades in.
    panel.style.minHeight = `${panel.offsetHeight}px`;
    gsap.to(event.currentTarget, {
      opacity: 0,
      y: -16,
      duration: 0.6,
      ease: EASE,
      onComplete: () => setSent(values),
    });
  };

  const reset = () => {
    if (panelRef.current) panelRef.current.style.minHeight = '';
    setValues(EMPTY);
    setErrors({});
    setSent(null);
  };

  const describe = (field: Field, hint?: boolean) =>
    [errors[field] && `bk-${field}-error`, hint && `bk-${field}-hint`]
      .filter(Boolean)
      .join(' ') || undefined;

  const error = (field: Field) =>
    errors[field] ? (
      <p className="field-error" id={`bk-${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <div ref={panelRef} className={`booking-panel ${sent ? 'is-sent' : ''}`}>
      {sent ? (
        <Success t={t} lang={lang} values={sent} onAgain={reset} />
      ) : (
        <form
          ref={formRef}
          className="booking-form"
          onSubmit={onSubmit}
          noValidate
        >
          {/* Inputs come before their labels so CSS can float the label on focus or input.
              placeholder=" " lets :placeholder-shown tell an empty field from a filled one. */}
          <div className="form-row form-row--3">
            <div
              className={`field field--fixed ${errors.date ? 'has-error' : ''}`}
            >
              <DatePicker
                id="bk-date"
                label={t.date}
                value={values.date}
                min={today}
                closedWeekday={HOURS.closedWeekday}
                lang={lang}
                t={t}
                invalid={!!errors.date}
                describedBy={describe('date')}
                onChange={(value) => setField('date', value)}
              />
              {error('date')}
            </div>
            <div
              className={`field field--fixed ${errors.time ? 'has-error' : ''}`}
            >
              <select
                id="bk-time"
                name="time"
                value={values.time}
                onChange={onChange}
                required
                aria-invalid={!!errors.time}
                aria-describedby={describe('time')}
              >
                <option value="" disabled>
                  {t.choose}
                </option>
                {slots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {formatTime(slot.value, lang)}
                    {slot.brunch ? ` · ${t.brunch}` : ''}
                  </option>
                ))}
              </select>
              <label htmlFor="bk-time">{t.time}</label>
              {error('time')}
            </div>
            <div className="field field--fixed">
              <select
                id="bk-guests"
                name="guests"
                value={values.guests}
                onChange={onChange}
              >
                {GUESTS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value="13+">{t.guestsMore}</option>
              </select>
              <label htmlFor="bk-guests">{t.guests}</label>
            </div>
          </div>
          <div className="form-row">
            <div className={`field ${errors.name ? 'has-error' : ''}`}>
              <input
                id="bk-name"
                name="name"
                autoComplete="name"
                placeholder=" "
                value={values.name}
                onChange={onChange}
                required
                aria-invalid={!!errors.name}
                aria-describedby={describe('name')}
              />
              <label htmlFor="bk-name">{t.name}</label>
              {error('name')}
            </div>
            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <input
                id="bk-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder=" "
                value={values.email}
                onChange={onChange}
                required
                aria-invalid={!!errors.email}
                aria-describedby={describe('email')}
              />
              <label htmlFor="bk-email">{t.email}</label>
              {error('email')}
            </div>
          </div>
          <div className="field">
            <input
              id="bk-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder=" "
              value={values.phone}
              onChange={onChange}
            />
            <label htmlFor="bk-phone">
              {t.phone} <span className="field-optional">({t.optional})</span>
            </label>
          </div>
          <div className="field">
            <textarea
              id="bk-message"
              name="message"
              placeholder={t.messageHint}
              value={values.message}
              onChange={onChange}
              rows={3}
            />
            <label htmlFor="bk-message">
              {t.message} <span className="field-optional">({t.optional})</span>
            </label>
          </div>
          <MagneticButton type="submit">{t.submit}</MagneticButton>
        </form>
      )}
    </div>
  );
}

/** The thank-you, with the rosette turning in beside it. */
function Success({
  t,
  lang,
  values,
  onAgain,
}: {
  t: Strings;
  lang: Locale;
  values: Values;
  onAgain: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(({ reduced }) => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      gsap.from(el, { opacity: 0, duration: 0.6 });
      return;
    }
    gsap
      .timeline()
      .from(el.querySelector('.booking-success__mark'), {
        rotation: -90,
        scale: 0.6,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
      })
      .from(
        el.querySelectorAll(
          '.booking-success__text, .booking-success__summary, .booking-success__again',
        ),
        {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: EASE,
          stagger: 0.12,
        },
        0.3,
      );
  }, ref);

  const guests =
    values.guests === '13+'
      ? t.guestsMore
      : `${values.guests} ${values.guests === '1' ? t.guest : t.guestsPlural}`;

  return (
    <div ref={ref} className="booking-success" role="status">
      <Rosette className="booking-success__mark" />
      <p className="booking-success__text">
        {fill(t.success, {
          name: values.name.trim().split(/\s+/)[0],
          email: values.email.trim(),
        })}
      </p>
      <p className="booking-success__summary">
        {fill(t.summary, {
          guests,
          date: formatDate(values.date, lang),
          time: formatTime(values.time, lang),
        })}
      </p>
      <button
        type="button"
        className="text-button booking-success__again"
        onClick={onAgain}
      >
        {t.again}
      </button>
    </div>
  );
}
