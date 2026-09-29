# Dar Zellij

A one-page website **proposal** for [Restaurant Dar Zellij](https://marrakech-riads.com/restaurant-dar-zellij/), the 17th-century riad restaurant of Marrakech Riads in the Marrakech medina. French at `/fr`, English at `/en`.

It is a static site with no backend. The booking form only runs in the browser: it checks the request and shows a confirmation, and sends nothing yet.

**Demo mode:** search engines are blocked (see [Before launch](#before-launch)) so this proposal doesn't compete with the live page.

## What's on the page

In order: the patio at night (hero, with the restaurant's live open/closed status in Marrakech time) · the owner's statement and the La Liste 2016 recognition · **the riad**, room by room (pinned and scrolled sideways on desktop) · **the ritual**, the owner's own sentence about the tea, the musicians and the dishes, one beat per photo · **the menu**: signature dishes, à la carte, the three set menus and the cocktails, with prices, plus the PDFs · **the rooftop** · **the week** (Tuesday closed, belly dancer on Thursdays and Sundays, Sunday brunch, today highlighted) · gallery with a full-screen viewer · **booking** form and practical details · the two sister restaurants · closing call to action · footer ending in a zellij dado that catches the light like candlelight.

Everything uses the restaurant's own material: its photos, its menu (September 2024 PDFs), its wording from the current page, and its identity from the menu cover (wine #873F3F, cream #FFFEF7, the 16-petal zellij rosette and the DAR ZELLIJ lettering, traced to SVG).

Overview boards: [docs/overview-desktop.jpg](docs/overview-desktop.jpg), [docs/overview-mobile.jpg](docs/overview-mobile.jpg). A design critique of the current page is in [docs/design-critique.md](docs/design-critique.md), and the accessibility audit in [docs/accessibility-review.md](docs/accessibility-review.md).

### Current page vs this proposal

Lighthouse 12, same settings for both (29 September 2026; the proposal served locally over HTTP/1.1, so a Vercel deployment should do a little better):

|                | Current page (mobile / desktop) | Proposal (mobile / desktop)                                     |
| -------------- | ------------------------------- | --------------------------------------------------------------- |
| Performance    | 23 / 52                         | 69 / 94                                                         |
| Accessibility  | 84 / 84                         | 100 / 100                                                       |
| Best practices | 68 / 74                         | 100 / 100                                                       |
| SEO            | 85 / 85                         | 100 once noindex is removed (69 while the demo blocks indexing) |
| Layout shift   | 0.20 / 0.11                     | 0.009 / 0.001                                                   |

axe-core: 0 accessibility violations in French and English. In a real browser with a 4× slower CPU, the largest paint comes at about 0.8 s (2 s on a first visit, with the preloader); Lighthouse's simulated mobile LCP is more pessimistic (it counts all JavaScript before the first paint).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack, static generation of `/fr` and `/en`) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) for the reset; the styling is hand-written in `src/styles/globals.css`
- [GSAP](https://gsap.com) (ScrollTrigger, SplitText) via `@gsap/react`, and [Lenis](https://lenis.darkroom.engineering) smooth scrolling
- [lucide-react](https://lucide.dev) icons
- Fonts via `next/font` (self-hosted at build time): Cormorant (headings, prices), Tenor Sans (small capitals, close to the menu's lettering), Jost (text)
- [sharp](https://sharp.pixelplumbing.com) for the photo scripts

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (it redirects to `/fr` or `/en` from the browser's language).

| Script                  | What it does                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm run dev`           | Start the dev server                                                    |
| `npm run build`         | Production build (type-checks too)                                      |
| `npm run start`         | Serve the production build                                              |
| `npm run typecheck`     | Type-check only                                                         |
| `npm run format`        | Format everything with Prettier                                         |
| `npm run photos:import` | Re-import the photos from marrakech-riads.com (see [Photos](#photos))   |
| `npm run images`        | Smaller copies of the photos, `src/lib/photos.json` and `public/og.jpg` |
| `npm run icons`         | Favicon, Apple touch icon and `robots.txt` from the rosette             |

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import it. Keep the defaults (framework preset **Next.js**).
3. Deploy. No environment variables are needed; `NEXT_PUBLIC_SITE_URL` can be set to the final domain for canonical and share links.

## Project structure

```
public/
  images/        photos (WebP masters + 400/800/1200/1600 px copies)
  menus/         the owner's PDFs (food menu, drinks menu)
  og.jpg, icon.svg, favicon.ico, apple-touch-icon.png, robots.txt
scripts/         import-photos.mjs, build-images.mjs, build-icons.mjs
src/
  app/[lang]/    layout (fonts, metadata, preloader script) and the page
  app/global-not-found.tsx   404 for any other address
  proxy.ts       / → /fr or /en from Accept-Language
  content/       fr.ts, en.ts (all copy), menu.ts (dishes and prices), photos.ts (alt text)
  sections/      one file per page section (+ its interactive part: riad-rooms, ritual-scroller,
                 menu-tabs, week-grid, gallery-grid, booking-form, curtain-reveal)
  components/    nav, footer, zellij dado, preloader, booking dock, cursor, open status, brand marks,
                 photo helpers; motion/ (RevealText, RevealImage, Parallax, MagneticButton)
  hooks/         useMotion (GSAP + media queries), useBackgroundMorph, useMediaQuery, useMinuteClock
  lib/           site facts and hours, i18n, GSAP/Lenis setup, photo manifest, SEO (JSON-LD)
  styles/        globals.css
```

## Photos

All photos come from marrakech-riads.com: the current Dar Zellij page and its media library (larger originals than the page shows, e.g. the 1920 px patio), plus the Dar Cherifa and Dar Bensouda photos for the sister restaurants. `npm run photos:import` downloads them into `.cache/` (not committed) and writes the masters:

- The 2023 shoot was uploaded as **triptychs** (three portrait photos side by side in one 1642×960 image). The script splits them back into single photos at the seams (18 portraits: the tea ceremony, tagines, couscous, the painted ceiling, the alcoves…).
- The 2018 photos are heavily HDR-processed; they get a gentle grade (less saturation, a little contrast) so they sit with the newer ones.

After adding or replacing a photo, run `npm run images`, and **give a replaced photo a new name**: photos are cached for a year as `immutable`. Every photo has alt text in both languages in `src/content/photos.ts`.

Higher-resolution originals from the photographer would make the full-screen photos (hero, rooftop, closing) sharper on large screens; the best available today are 1920 px (patio) and 1642 px (2023 shoot).

## Motion

- Everything moves the same way: slow and soft (`power3.out` / `expo`), animating transform, opacity and clip-path. Shared settings live in `src/lib/motion.ts`.
- First visit of a session: the screen is the cover of the menu (wine red, "Est. 1999", the rosette, "Marrakech"); the rosette turns a sixteenth and the screen parts like the patio's red curtains.
- Headings slide up line by line, photos wipe in and drift inside their frames, the light sections' background blends as you scroll, the nav rosette turns with the page.
- Desktop: the riad section pins and scrolls sideways; the ritual lights the owner's sentence clause by clause; custom cursor; magnetic buttons.
- The footer ends in a zellij dado (the eight-pointed star and cross); where the pointer passes, the tiles show their glaze like candlelight. On phones the light drifts on its own.
- With **prefers-reduced-motion**: no preloader, smooth scrolling, pinning, parallax, cursor or drifting light; content simply fades in.

## Before launch

- [ ] **Remove noindex.** It lives in three places:
  - `next.config.ts`: set `DEMO_NOINDEX` to `false`.
  - `src/app/[lang]/layout.tsx`: delete the `robots: { index: false, follow: false }` line.
  - `public/robots.txt`: replace the contents with `User-agent: *` and `Allow: /` (or edit `scripts/build-icons.mjs`).
- [ ] **Set the real domain**: `NEXT_PUBLIC_SITE_URL` (canonical, hreflang, Open Graph and JSON-LD URLs).
- [ ] **Connect the booking form.** `onSubmit` in `src/sections/booking-form.tsx` only shows the confirmation. Options: a route handler that emails reservation@darzellij.com (e.g. Resend), Formspree, or the group's booking system.
- [ ] **Confirm facts and prices with the owner** (in `src/lib/site.ts`, `src/content/menu.ts` and the dictionaries):
  - prices from the September 2024 menu (the current page says à la carte "from 55 MAD", while the menu's dishes start at 110 MAD);
  - hours (every day except Tuesday, 12:00 to midnight), Sunday brunch from 11:00 on request, belly dancer on Thursdays and Sundays;
  - "Est. 1999" (from the menu cover), La Liste 2016, the Instagram handle @darzellij (from the menu), the address and phone;
  - the fax number was left out on purpose, and the current page's "près de 20 ans" (now dated) became "De toutes les maisons que Marrakech Riads a restaurées…".
- [ ] **New Year's Eve**: the 2026 menu (2,200 MAD) has passed; add the next one as a notice or a menu tab when it is ready.
- [ ] **German and Spanish**: the current site also has DE and ES pages; add `de.ts` / `es.ts` dictionaries and the menu translations if wanted (`LOCALES` in `src/lib/i18n.ts`).
