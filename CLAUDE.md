# Dar Zellij — notes for Claude

One-page website **proposal** for Restaurant Dar Zellij (Marrakech Riads, 17th-century riad in the Marrakech medina), to show the owner as a new version of https://marrakech-riads.com/restaurant-dar-zellij/. Made in the spirit of the user's Farasha Farmhouse proposal (`C:\Users\pakiy\Documents\prj\Farasha`, same motion vocabulary). Static site, no backend: the booking form is frontend only. The live page still exists, so this demo is **noindex** (see README "Before launch").

## Stack and commands

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript strict + Tailwind 4 (`@tailwindcss/postcss`, reset only; styling is hand-written in `src/styles/globals.css`). **Read `node_modules/next/dist/docs/` before using a Next API**: `proxy.ts` replaced middleware, `params` are Promises, `PageProps`/`LayoutProps` are global types (`npx next typegen`).
- Motion: GSAP 3.15 (ScrollTrigger, SplitText) via `@gsap/react`, Lenis 1.3. Fonts via `next/font/google`: Cormorant (headings, prices), Tenor Sans (small caps), Jost (text).
- npm. `npm run dev` / `build` / `start` / `typecheck` / `format` / `photos:import` / `images` / `icons`.
- `.claude/launch.json` (git-ignored): `preview` = production server on port 3100 (`npm run build` first), `dev` on 3000.
- Git: `main` on github.com/P4kiya/dar-zellij (private). Commit and push only when the user asks. `npm run format:check` passes; `tsconfig.json` is in `.prettierignore` because Next rewrites it on every build.

## Layout

- Routes: `src/app/[lang]/layout.tsx` (root layout: fonts, metadata, head script, preloader, brand SVG symbols) and `page.tsx`; `dynamicParams = false`, `/fr` and `/en` prerendered. `src/proxy.ts` redirects `/` by Accept-Language (French default). `src/app/global-not-found.tsx` (+ `experimental.globalNotFound`) handles other URLs.
- Copy: `src/content/fr.ts` (source of the `Dictionary` type) and `en.ts`; light markup `*italic*`, `^sup^` rendered by `components/rich.tsx`. Menu and prices: `src/content/menu.ts` (from the owner's Sept 2024 PDFs; per-language wording kept where the PDFs differ; an empty string means "not in this language"). Alt text: `src/content/photos.ts`. Facts, hours, contacts: `src/lib/site.ts`.
- Sections in `src/sections/` are **server components**; interactive parts are client components next to them (`riad-rooms`, `ritual-scroller`, `menu-tabs`, `week-grid`, `gallery-grid`, `booking-form`, `curtain-reveal`). Client components receive only the strings they need as props.
- Photos: `src/lib/photos.ts` is `server-only` (it imports the generated `photos.json` manifest). Client components get `PhotoData` from the server and render `components/photo-img.tsx`; client-safe types/helpers are in `lib/photo-data.ts`. Server `Photo` (`components/photo.tsx`) = frame + placeholder + RevealImage.
- Brand marks: `components/brand.tsx` holds the rosette and DAR ZELLIJ lettering traced from the menu PDF (potrace), rendered once as `<symbol>`s and used with `<use>`. `scripts/build-icons.mjs` reads the rosette path from that file.

## Photos

- `scripts/import-photos.mjs` downloads originals from marrakech-riads.com into `.cache/originals` (git-ignored) and writes masters to `public/images`: the 2023 triptychs are split at their seams (listed in the script); 2018 HDR photos get `grade: 'calm'`; hero masters use lower quality (80/76). `scripts/build-images.mjs` makes 400/800/1200/1600 copies, `src/lib/photos.json` (size, average colour, 16px blur) and `public/og.jpg`.
- `sizes` must reflect the _drawn_ width: with `object-fit: cover` in tall frames a landscape photo is drawn much wider than the screen (rooftop `350vw` on phones, closing `400vw`, hero portrait `150vw`). Getting this wrong made phones load the 400 px copy (blurry).
- Photos are cached a year as immutable (next.config headers): a replaced photo needs a new name once deployed.

## Motion system (gotchas)

- `useMotion(setup, scope, deps, defer?)` = useGSAP + gsap.matchMedia with `{ reduced, mobile, desktop }` (`desktop` = ≥1024px wide and ≥600px tall, for pinning). `defer` (e.g. `belowFold`) waits for fonts + idle.
- **The hero and the preloader are pure CSS** (keyframes in globals.css, delays via `--d` and `--intro`): the head script adds `has-preloader is-preloading` on the first view of a session and sets the sessionStorage flag; `preloader.tsx` only removes the finished preloader (at 2.75s). This was done for LCP: Chrome excludes full-viewport hero images from LCP, so LCP is the hero text, and it must not wait for hydration. Don't move the hero back to JS reveals.
- Never put a CSS `transition` on a property GSAP animates on the same element (the ritual beats ended at opacity 0 on phones because of this). Ritual beats are dimmed with `color` in the scroll-driven mode.
- Background morph (`use-background-morph.ts`) only blends the **light** sections (`data-bg` ivory/sand). Dark sections (ritual, week, gallery) and photo sections keep solid backgrounds; blending light into dark left outgoing text on the wrong colour.
- SplitText headings get `.is-split` (flex column so line masks don't collapse); don't reintroduce a universal `:has()` selector (expensive style recalcs).
- `.photo-frame` base rules are wrapped in `:where()` so section classes can position frames (otherwise `position: relative` overrode `.rooftop-photo { position: absolute }` and the photo vanished).
- Tailwind 4 ships a `container` utility: the layout class is `container-dz`.
- The phone menu is `position: fixed` inside the header: the header must not have `transform` or `backdrop-filter` while open (`.nav-shell.is-open` removes the blur).

## Verification approach

- The app's Browser pane is often hidden (scroll animations don't fire there). Use headless Edge from the session scratchpad: `puppeteer-core` + `sharp` (+ `axe-core`, `lighthouse`) installed there, `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`, production server on 3100, scroll in steps before screenshots, set `sessionStorage['darzellij:preloaded']='1'` via `evaluateOnNewDocument` to skip the preloader.
- Last results (29 Sep 2026, local `next start`, HTTP/1.1): Lighthouse FR mobile 69 / desktop 94, accessibility 100, best practices 100, SEO 69 only because of noindex; axe-core 0 violations (FR desktop, EN phone). Real Edge with 4× CPU throttle: LCP ≈ 0.8s (return visit), ≈ 2.0s (with preloader); Lighthouse's simulated mobile LCP stays ~6.7s (it counts all JS before first paint). The live page scored mobile 23 / desktop 52 / accessibility 84 with the same setup.
- Windows Defender sometimes makes one `next build` take ~12 min; it's normally ~20s.

## Open points for the owner

See README "Before launch": prices ("from 55 MAD" on the current page vs 110 MAD on the menu), Est. 1999, La Liste 2016, @darzellij, booking form connection, noindex removal, DE/ES pages, next New Year's Eve menu, higher-resolution photo originals.
