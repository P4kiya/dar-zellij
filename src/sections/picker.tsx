'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useFieldPopover } from '@/hooks/use-field-popover';

export type PickerOption = { value: string; label: string; hint?: string };

type PickerProps = {
  id: string;
  label: string;
  value: string;
  options: PickerOption[];
  /** Shown while nothing is chosen. */
  placeholder?: string;
  closeLabel: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
};

// Page Up/Down move the highlight by this many options.
const PAGE = 5;

/**
 * A select drawn like the page (the browser's own list comes in the system font, with its blue
 * highlight and grey scrollbar): a button showing the choice, and the list in a popover under the
 * field, or a sheet at the foot of the screen on phones. WAI-ARIA listbox: the focus goes to the
 * list, the arrow keys, Home/End, Page Up/Down and typing move the highlight, Enter picks, Escape
 * closes and gives the focus back to the field.
 */
export function Picker({
  id,
  label,
  value,
  options,
  placeholder = '',
  closeLabel,
  invalid,
  describedBy,
  onChange,
}: PickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { open, mounted, openPopover, close, dialogProps } = useFieldPopover(
    triggerRef,
    dialogRef,
  );
  // The highlighted option (aria-activedescendant); the focus stays on the list itself.
  const [active, setActive] = useState(-1);
  const justOpened = useRef(false);
  const typed = useRef({ text: '', at: 0 });

  const current = options.find((option) => option.value === value);

  const openList = () => {
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    justOpened.current = true;
    openPopover();
  };

  const select = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    close(true);
  };

  // The list takes the focus when it opens, with the choice in the middle; afterwards the
  // highlighted option is kept in view.
  useEffect(() => {
    const list = listRef.current;
    if (!open || !list) return;
    const item = list.children[active] as HTMLElement | undefined;
    if (justOpened.current) {
      justOpened.current = false;
      list.focus({ preventScroll: true });
      if (item)
        list.scrollTop =
          item.offsetTop - (list.clientHeight - item.offsetHeight) / 2;
      return;
    }
    if (!item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (
      item.offsetTop + item.offsetHeight >
      list.scrollTop + list.clientHeight
    )
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
  }, [open, active]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (!open) openList();
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(active + 1, last);
        break;
      case 'ArrowUp':
        next = Math.max(active - 1, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      case 'PageDown':
        next = Math.min(active + PAGE, last);
        break;
      case 'PageUp':
        next = Math.max(active - PAGE, 0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(active);
        return;
      default: {
        // Typing moves to the next option that starts with the letters typed.
        if (
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        )
          return;
        const now = Date.now();
        const text =
          (now - typed.current.at < 700 ? typed.current.text : '') +
          event.key.toLowerCase();
        typed.current = { text, at: now };
        const from = text.length === 1 ? active + 1 : active;
        for (let i = 0; i < options.length; i++) {
          const index = (from + i) % options.length;
          if (options[index].label.toLowerCase().startsWith(text)) {
            next = index;
            break;
          }
        }
        if (next === undefined) return;
      }
    }
    event.preventDefault();
    setActive(next);
  };

  const text = current
    ? current.hint
      ? `${current.label} · ${current.hint}`
      : current.label
    : placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="field-trigger field-trigger--list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? close(true) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="field-trigger__text">{text}</span>
        <ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <dialog
        {...dialogProps}
        id={`${id}-pop`}
        className="pop pop--list"
        aria-label={label}
      >
        {mounted && (
          <>
            <div className="pop-head">
              <p className="pop-title">{label}</p>
              <button
                type="button"
                className="pop-close"
                aria-label={closeLabel}
                onClick={() => close(true)}
              >
                <X size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <ul
              ref={listRef}
              id={`${id}-list`}
              className="pick-list"
              role="listbox"
              tabIndex={0}
              aria-labelledby={`${id}-label`}
              aria-activedescendant={
                active >= 0 ? `${id}-option-${active}` : undefined
              }
              onKeyDown={onListKeyDown}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  className={
                    index === active ? 'pick-option is-active' : 'pick-option'
                  }
                  aria-selected={option.value === value}
                  data-cursor="link"
                  onPointerMove={() => index !== active && setActive(index)}
                  onClick={() => select(index)}
                >
                  {option.label}
                  {option.hint && (
                    <span className="pick-option__hint">{option.hint}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </dialog>
    </>
  );
}
