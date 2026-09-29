## Design Critique: Restaurant Dar Zellij page (marrakech-riads.com)

Reviewed 29 September 2026 from the live page, in Edge at 1440 px (desktop) and 390 px (phone), with measurements taken in the browser.

### Overall Impression

The house sells itself: the photography of the patio, the painted ceilings, the tea poured from high above the glass is genuinely beautiful. The page just doesn't let it. A 240 px banner, one justified paragraph and four pale gold buttons make one of Marrakech's most remarkable riads look like any listing on a group site. The biggest opportunity is to give Dar Zellij its own page, in its own identity (the wine red, cream and zellij rosette already used on its 2024 menu), with the menu, the atmosphere and booking on the page itself.

### Usability

| Finding                                                                                                                               | Severity    | Recommendation                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No way to book above the fold; "Réserver votre table" appears only after the text block, and the form itself is hidden in a modal     | 🔴 Critical | A clear "Réserver une table" action in the first screen, a sticky booking button on scroll, and the reservation form on the page                                  |
| The menu only exists as PDFs (food, drinks, New Year's Eve). On a phone, that means downloading a 0.8 MB, 15-page file to see a price | 🔴 Critical | Put the menu on the page: signature dishes, à la carte, the three set menus (390 / 490 / 760 MAD) and cocktails, and keep the PDFs as downloads                   |
| The "Nos Restaurants" block rendered as a ~500 px empty grey area in our screenshots at both widths (the slider never appears)        | 🔴 Critical | Replace the slider with two static cards (Dar Cherifa, Dar Bensouda) that can't fail to load                                                                      |
| Opening hours, brunch and the belly-dancer evenings are buried in a grey box as centred lines                                         | 🟡 Moderate | A weekly view (Mon–Sun) that shows at a glance which day is closed (Tuesday), which evenings have the dancer (Thu, Sun) and Sunday brunch, with today highlighted |
| Location has an address, a fax number and no map or directions link                                                                   | 🟡 Moderate | Add an "Itinéraire" (directions) link and a tappable phone number; drop the fax                                                                                   |
| On phones, the Tripadvisor badge floats over the content and the sticky bar mixes "Réserver" with "Secret offer"                      | 🟡 Moderate | One clear mobile bar: Call + Book                                                                                                                                 |
| The gallery shows three photos squeezed into each slide (the 2023 shoot was uploaded as triptychs), with a thumbnail strip            | 🟢 Minor    | Split the triptychs back into single photos and use them large                                                                                                    |

### Visual Hierarchy

- **What draws the eye first**: the Marrakech Riads group logo and navigation, then a thin banner. The name "Restaurant Dar Zellij" is 30 px with a hard black text-shadow. It should be the restaurant, large, over its best photo.
- **Reading flow**: banner → slider → one long paragraph → gold buttons → empty block → address. There is no story: the 17th-century riad, the painted ceilings and the La Liste 2016 recognition are all inside the same 14 px justified paragraph.
- **Emphasis**: the loudest elements are four identical gold buttons (menu, drinks, New Year's Eve, book), so nothing is primary. The owner's best line ("Les théières se lèvent bien haut…") is set as body text and easy to miss.

### Consistency

| Element    | Issue                                                                                                                     | Recommendation                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Colour     | The page uses the group's gold and beige; Dar Zellij's own menu uses wine #873F3F and cream #FFFEF7 with a zellij rosette | Use the restaurant's own identity so the website, the menu and the table feel like one house |
| Typography | Body 14 px justified (uneven word spacing), headings in a different serif, labels in a third style                        | One serif for headings, one sans for text, left-aligned body at 16–17 px                     |
| Copy       | "Revéllion 2026" (FR) vs "New Year's Eve 2025" (EN); "© 2022" in FR and "© 2020" in EN; "près de 20 ans" is now dated     | Proofread and keep both languages in step                                                    |
| Facts      | The page says à la carte "from 55 MAD", the 2024 menu's dishes start at 110 MAD                                           | Confirm current prices                                                                       |

### Accessibility

- **Color contrast**: the four gold buttons are white on #DAC083, a **1.77:1** contrast ratio. WCAG AA requires 4.5:1 for text of this size: **fail**. Body text is black on white (21:1), pass.
- **Touch targets**: the main buttons are 47 px tall, fine; the language switcher and footer links are small.
- **Text readability**: 14 px justified body text with 30 px line height; justified text creates uneven gaps, harder to read for people with dyslexia.
- **Alternative text**: 33 of the 52 images have no alt text.
- **Performance**: 174 requests and about **7.1 MB** transferred for one page (desktop load, cold cache); slow on mobile data.

### What Works Well

- The photography: the 2023 shoot (tea service, tagines, the painted ceiling) and the patio at night are premium-grade material.
- The owner's copy has real voice: "une parenthèse hors du temps", "Laissez-vous tenter !", "be prepared to taste Morocco on a plate!".
- The essentials are all there: hours, days, events, contacts, four languages.

### Priority Recommendations

1. **Give Dar Zellij its own page in its own identity**: full-screen hero over the patio at night, wine and cream, the rosette, and "Réserver une table" in the first screen.
2. **Put the menu and booking on the page**: signature dishes, à la carte, set menus and cocktails as real text (readable, translatable, indexable), plus a short reservation form that knows the restaurant is closed on Tuesdays.
3. **Tell the story in order**: the riad and its painted ceilings → the ritual (tea, music, dishes) → the menu → the rooftop → the week → booking → the sister restaurants. Fix the broken block, the contrast and the alt texts on the way.
