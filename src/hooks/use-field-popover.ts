'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { matches, MEDIA } from '@/lib/motion';
import { lockScroll, scrollPageBy, unlockScroll } from '@/lib/scroll';

/**
 * A form field's popover, a <dialog>: under the field on desktop (non-modal), a sheet at the foot
 * of the screen on phones (modal, in the top layer, so no transformed ancestor can hold it; the
 * same `MEDIA.mobile` query as the CSS phone block). Handles opening, closing (Escape, a click
 * elsewhere, tabbing out, a tap on the sheet's backdrop), holding the page still under the sheet
 * and giving the focus back to the field. `mounted` is true once the popover has been opened: its
 * content is only rendered then, so nothing that depends on the browser's date or size is rendered
 * on the server. Spread `dialogProps` on the <dialog>.
 */
export function useFieldPopover(
  triggerRef: RefObject<HTMLElement | null>,
  dialogRef: RefObject<HTMLDialogElement | null>,
) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(false); // opened as a sheet?
  const lockedRef = useRef(false); // page scrolling held by the sheet?
  const refocusRef = useRef(true); // give the focus back to the field when closing?

  const openPopover = useCallback(() => {
    modalRef.current = matches(MEDIA.mobile);
    setMounted(true);
    setOpen(true);
  }, []);

  const close = useCallback(
    (refocus: boolean) => {
      refocusRef.current = refocus;
      dialogRef.current?.close();
    },
    [dialogRef],
  );

  // Shows the dialog once its content is rendered; the popover also closes on a click anywhere
  // else (the sheet has its backdrop for that).
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
  }, [open, close, dialogRef, triggerRef]);

  // Let the page scroll again if the field goes away (the form is sent) while the sheet is open.
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

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    close(true);
  };

  // Tabbing out of the popover closes it and lets the focus carry on to the next field.
  const onBlur = (event: FocusEvent<HTMLDialogElement>) => {
    const dialog = event.currentTarget;
    const to = event.relatedTarget as Node | null;
    if (modalRef.current || !dialog.open || !to || dialog.contains(to)) return;
    close(false);
  };

  // A tap on the sheet's backdrop closes it.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (modalRef.current && event.target === event.currentTarget) close(true);
  };

  return {
    open,
    mounted,
    openPopover,
    close,
    dialogProps: { ref: dialogRef, onClose, onKeyDown, onBlur, onClick },
  };
}
