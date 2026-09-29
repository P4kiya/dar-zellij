'use client';

import { useRef, type ReactNode } from 'react';
import { belowFold, useMotion } from '@/hooks/use-motion';
import { gsap } from '@/lib/gsap';
import { dur, EASE, REVEAL_START } from '@/lib/motion';

type RiadRoomsProps = {
  intro: ReactNode;
  children: ReactNode;
  hint: string;
  roomsLabel: string;
};

/**
 * Desktop (and motion allowed): the section pins and the rooms travel sideways as you scroll down,
 * each photo drifting inside its frame and wiping in as it enters. Elsewhere the rooms are a
 * strip you swipe (scroll-snap), revealed as it scrolls into view.
 */
export function RiadRooms({
  intro,
  children,
  hint,
  roomsLabel,
}: RiadRoomsProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useMotion(
    ({ reduced, desktop, mobile }) => {
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track || reduced) return;
      const rooms = gsap.utils.toArray<HTMLElement>('.room', track);

      if (!desktop) {
        gsap.from(rooms, {
          opacity: 0,
          x: 40,
          duration: dur(1.1, mobile),
          ease: EASE,
          stagger: 0.1,
          scrollTrigger: { trigger: track, start: REVEAL_START, once: true },
        });
        return;
      }

      pin.classList.add('is-pinned');
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const travel = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      gsap.to(pin.querySelector('.riad-progress span'), {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      rooms.forEach((room) => {
        const frame = room.querySelector('.room-photo');
        const img = room.querySelector('img');
        if (!frame || !img) return;
        // Wipe in as the room comes in from the right (rooms already on screen when the section
        // arrives wipe in as it scrolls into place)…
        const onScreenAtStart =
          room.getBoundingClientRect().left < window.innerWidth * 0.92;
        gsap
          .timeline({
            scrollTrigger: onScreenAtStart
              ? { trigger: pin, start: 'top 55%', once: true }
              : {
                  trigger: room,
                  containerAnimation: travel,
                  start: 'left 92%',
                  once: true,
                },
          })
          .fromTo(
            frame,
            { clipPath: 'inset(0% 0% 0% 100%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.3,
              ease: 'expo.inOut',
            },
          )
          .fromTo(
            img,
            { scale: 1.18 },
            { scale: 1, duration: 1.7, ease: EASE },
            0,
          )
          .from(
            room.querySelector('figcaption'),
            { opacity: 0, y: 20, duration: 1, ease: EASE },
            0.35,
          );
        // …and drift inside the frame while it crosses the screen.
        gsap.fromTo(
          img,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: room,
              containerAnimation: travel,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          },
        );
      });

      return () => pin.classList.remove('is-pinned');
    },
    pinRef,
    [],
    () => belowFold(pinRef.current),
  );

  return (
    <div ref={pinRef} className="riad-pin">
      <div ref={trackRef} className="riad-track">
        {intro}
        {/* On phones this strip scrolls sideways, so keyboard users get a tab stop to scroll it. */}
        <div
          className="riad-rooms"
          role="region"
          aria-label={roomsLabel}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
      <div className="riad-foot container-dz" aria-hidden="true">
        <span className="riad-hint">{hint}</span>
        <span className="riad-progress">
          <span />
        </span>
      </div>
    </div>
  );
}
