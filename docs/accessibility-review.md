## Accessibility Audit: Dar Zellij website proposal (/fr and /en)

**Standard:** WCAG 2.1 AA | **Date:** 29 September 2026

Tested on the production build (`next start`) with: axe-core 4 (WCAG 2.0/2.1 A and AA + best practices) on `/fr` at 1440 px and `/en` at 390 px; Lighthouse 12 accessibility (mobile and desktop, both languages); a keyboard-only pass (70 tab stops, recorded with the focus indicator of each); the accessibility tree (headings, landmarks, names); contrast computed for every colour pairing in the palette; reflow at 320 px and at 200% zoom. Not tested: a real screen reader session (VoiceOver/NVDA), which should be done before launch.

### Summary

**Issues found:** 9 | **Critical:** 0 | **Major:** 4 | **Minor:** 5 — **all fixed.** After fixes: axe 0 violations on both pages, Lighthouse accessibility 100 on mobile and desktop in both languages.

### Findings

#### Perceivable

| #   | Issue                                                                                                                                         | WCAG Criterion               | Severity | Recommendation (status)                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| 1   | Today's column in the week grid was dimmed to 70% on the closed day (Tuesday): the day name reached 3.83:1 and the "Aujourd'hui" badge 4.46:1 | 1.4.3 Contrast               | 🟡 Major | Full-strength text; only the word "Fermé" is softened, at 5.57:1 (fixed)                        |
| 2   | Ritual section, desktop: the clauses not being read were dimmed to 22% opacity (2:1), numbers included                                        | 1.4.3 Contrast               | 🟡 Major | Dim with colour (cream at 40%, 3.8:1 for large text) and keep the numbers in full brass (fixed) |
| 3   | Field hints shown on focus were ink at 45% (2.75:1)                                                                                           | 1.4.3 Contrast               | 🟢 Minor | Ink at 62% (4.54:1) (fixed)                                                                     |
| 4   | Headings with a price read as one word to screen readers ("Cocktails signature180 MAD")                                                       | 1.3.1 Info and relationships | 🟢 Minor | A real space between name and price; "MAD" is in visually hidden text after every price (fixed) |

#### Operable

| #   | Issue                                                                                                                               | WCAG Criterion                                | Severity | Recommendation (status)                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | The two photo strips that scroll sideways on phones (the riad's rooms, the ritual's photos) could not be scrolled from the keyboard | 2.1.1 Keyboard                                | 🟡 Major | `tabindex="0"`, `role="region"` and a name ("Les salles du riad", "Photos du rituel") so they can be focused and scrolled with the arrow keys (fixed) |
| 6   | Focused form fields showed only a 1 px underline change                                                                             | 2.4.7 Focus visible                           | 🟢 Minor | 2 px wine underline, label turns wine, transparent outline kept for Windows high-contrast mode (fixed)                                                |
| 7   | Small standalone links (menu PDFs, Directions, Back to top) were 14–16 px tall                                                      | 2.5.5 Target size (AAA; 2.5.8 in WCAG 2.2 AA) | 🟢 Minor | Padding brings them to ≥ 30 px tall (fixed)                                                                                                           |

#### Understandable

| #   | Issue                                                                                                                                                                                                                                                                                                                                                                                   | WCAG Criterion      | Severity | Recommendation (status) |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------- | ----------------------- |
| —   | None found. Every field has a visible label; errors are described in text next to the field ("Le restaurant est fermé le mardi : choisissez un autre jour."), linked with `aria-describedby`, marked `aria-invalid`, and focus moves to the first invalid field. The page language is set per locale (`lang="fr"` / `"en"`), and the language switch links carry `hreflang` and `lang`. | 3.3.1, 3.3.2, 3.1.1 | —        | —                       |

#### Robust

| #   | Issue                                                                                                                                                                                                                                                                        | WCAG Criterion          | Severity | Recommendation (status)                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- | --------------------------------------------------------------- |
| 8   | The fixed phone bar (Réserver / Appeler) sat outside any landmark                                                                                                                                                                                                            | 1.3.1 / best practice   | 🟡 Major | It is now an `<aside aria-label="Réserver ou appeler">` (fixed) |
| 9   | (Checked, fine) Menu tabs follow the WAI-ARIA tabs pattern (`tablist`/`tab`/`tabpanel`, `aria-selected`, roving tabindex, arrow keys, Home/End); the lightbox is a native modal `<dialog>` with a name, Escape and arrow keys, and focus returns to the photo that opened it | 4.1.2 Name, role, value | —        | —                                                               |

### Color Contrast Check

| Element                         | Foreground    | Background    | Ratio   | Required    | Pass? |
| ------------------------------- | ------------- | ------------- | ------- | ----------- | ----- |
| Body text                       | ink #2B1F1A   | ivory #F6F0E6 | 14.10:1 | 4.5:1       | ✅    |
| Secondary text                  | #6B5A50       | ivory         | 5.78:1  | 4.5:1       | ✅    |
| Secondary text                  | #6B5A50       | sand #ECE1D0  | 5.07:1  | 4.5:1       | ✅    |
| Eyebrows, prices, links         | wine #873F3F  | ivory         | 6.59:1  | 4.5:1       | ✅    |
| Buttons, signature panel, week  | cream #FFFEF7 | wine          | 7.38:1  | 4.5:1       | ✅    |
| Light buttons                   | #4A1D1F       | cream         | 13.97:1 | 4.5:1       | ✅    |
| Eyebrows on dark                | brass #E4C996 | night #1A1311 | 11.43:1 | 4.5:1       | ✅    |
| Footer headings                 | brass #C9A36B | night         | 7.80:1  | 4.5:1       | ✅    |
| Footer links                    | cream 84%     | night         | 12.87:1 | 4.5:1       | ✅    |
| Ritual, quiet clause (32–58 px) | cream 40%     | night         | 3.80:1  | 3:1 (large) | ✅    |
| Week, "Fermé"                   | cream 82%     | wine          | 5.57:1  | 4.5:1       | ✅    |
| Form errors                     | #9B2C26       | cream         | 7.47:1  | 4.5:1       | ✅    |
| Field labels                    | #6B5A50       | cream         | 6.48:1  | 4.5:1       | ✅    |
| Field hints (on focus)          | ink 62%       | cream         | 4.54:1  | 4.5:1       | ✅    |

Text over photos (hero, rooftop, closing) sits on dark gradients built into each section; automated tools can't measure it ("needs review") and it reads clearly in every screenshot, but it is worth a look on the final photos.

### Keyboard Navigation

| Element                                     | Tab Order                                               | Enter/Space                                    | Escape                              | Arrow Keys                          |
| ------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- | ----------------------------------- |
| Skip link "Aller au contenu"                | 1st, appears on focus                                   | Moves focus to `<main>`                        | —                                   | —                                   |
| Header (brand, 5 sections, FR/EN, Réserver) | 2–10                                                    | Follows the link (smooth glide to the section) | —                                   | —                                   |
| Phone menu button                           | In header                                               | Opens the menu, focus moves to the first link  | Closes, focus returns to the button | —                                   |
| Riad / ritual photo strips (phones)         | After the hero                                          | —                                              | —                                   | Scroll the strip                    |
| Menu tabs                                   | One stop for the tab list, then the panel               | Selects a tab                                  | —                                   | ←/→ change tab, Home/End first/last |
| Gallery photos                              | 11 buttons, named "Agrandir – [description]"            | Opens the viewer                               | Closes, focus returns               | ←/→ previous/next photo             |
| Booking form                                | Date, time, guests, name, email, phone, message, submit | Submits; errors announced next to fields       | —                                   | Native date/select behaviour        |
| Floating "Réserver une table"               | Last                                                    | Glides to the form                             | —                                   | —                                   |

### Screen Reader

| Element            | Announced As                                                                                                                                                                                                              | Issue                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Page               | "Dar Zellij · Restaurant marocain dans un riad du XVIIe siècle, Marrakech", `lang="fr"`                                                                                                                                   | —                                                            |
| Hero title         | Heading level 1, "Dar Zellij"                                                                                                                                                                                             | —                                                            |
| Section titles     | Heading level 2 each (the riad, the ritual, the menu, the rooftop, the week, the gallery, booking, other tables, closing); animated headings keep an `aria-label` with the full text so the split lines don't break it up | —                                                            |
| Prices             | "Pastilla au poulet, 210 MAD" (MAD is visually hidden text)                                                                                                                                                               | —                                                            |
| Open/closed status | Plain text, e.g. "Fermé le mardi · réouverture mercredi à 12h"                                                                                                                                                            | Not a live region on purpose (it only changes once a minute) |
| Photos             | Every photo has a description in both languages; decorative copies (gallery thumbnails, whose buttons carry the description; sister-restaurant cards, whose link names the restaurant) use `alt=""`                       | —                                                            |
| External links     | "… (nouvel onglet)" in visually hidden text                                                                                                                                                                               | —                                                            |

### Priority Fixes

All nine findings above are fixed in the code. Remaining before launch:

1. **Screen reader session** (VoiceOver on iPhone, NVDA on Windows) on the final content, especially the menu tabs and the booking form. Automated tests catch roughly a third of issues.
2. **Check text over the final photos** if any photo changes (hero, rooftop, closing).
3. **Keep the reduced-motion path** in future changes: with `prefers-reduced-motion`, there is no preloader, pinning, parallax or smooth scrolling, and content appears without movement.
