'use client';

import { useRef, type MouseEventHandler, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { matches, MEDIA } from '@/lib/motion';

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  /** primary: wine. light: cream, for photos and dark sections. ghost: hairline outline. */
  variant?: 'primary' | 'light' | 'ghost';
  size?: 'md' | 'sm';
  /** Defaults to an arrow; pass false for none. */
  icon?: ReactNode | false;
  type?: 'button' | 'submit';
  className?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

/**
 * The site's one button style. Hover: the fill sweeps in from the left and the arrow slides right
 * (CSS); on desktop the button also leans toward the cursor.
 */
export function MagneticButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  type = 'button',
  className = '',
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    ({ reduced }) => {
      const el = ref.current;
      if (!el || reduced || !matches(MEDIA.finePointer)) return;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    ref,
    [],
    () => true,
  );

  const classes = `btn btn--${variant} btn--${size} ${className}`;
  const content = (
    <>
      <span className="btn__label">{children}</span>
      {icon !== false && (
        <span className="btn__icon" aria-hidden="true">
          {icon ?? <ArrowRight size={14} strokeWidth={1.5} />}
        </span>
      )}
    </>
  );

  if (href) {
    const { disabled: _disabled, ...linkProps } = rest;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...linkProps}
      >
        {content}
      </a>
    );
  }
  const {
    download: _download,
    target: _target,
    rel: _rel,
    ...buttonProps
  } = rest;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
