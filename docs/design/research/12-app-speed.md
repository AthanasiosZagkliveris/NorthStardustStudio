# 12. How fast the app answers, and how to make it faster

Status: **research**, written 2026-11-28, updated 2026-11-28. The speed targets apps are held to, the tools most used to check them, the ways recommended to make a web app faster, and what was done in Tiles with the measures before and after. Asked by the owner on 2026-11-28 (14:29 UTC+2): "Do online research regarding the most common, and the best speed, check apps how they fast they work ... the best ways to make it faster ... Document them, and do any change, optimisation to improve the speed (stylesheets included)."

Related: the log, 2026-11-28 (the speed round and the stylesheet speed-up); AI 3, "How fast it answers" (`npm run check:speed`); AI 6, "Measure on change, not on render".

## 1. How fast an app should answer

| Target | What it means | Good | Poor | Source |
|---|---|---|---|---|
| **Interaction to Next Paint (INP)** | from a tap, click or key to the next frame drawn; the one that matters most for Tiles, an app of forms and tiles | 200 ms or less | over 500 ms | [1] |
| **Largest Contentful Paint (LCP)** | when the largest part of the first screen is drawn | 2.5 s or less | over 4 s | [1] |
| **Cumulative Layout Shift (CLS)** | how much the page jumps while it loads | 0.1 or less | over 0.25 | [1] |
| **RAIL, response** | answer an input within 100 ms; keep each handler within 50 ms, as other work may wait ahead of it | 100 ms | | [2] |
| **RAIL, animation** | a frame every 16 ms (60 a second), of which about 10 ms is the app's | 10 ms a frame | | [2] |

The Core Web Vitals are judged at the 75th percentile of visits, on phones and computers alike, and are now Google's recommended targets; RAIL is the older model they grew from [1][2]. How the web does: in 2024, 74% of sites had a good INP on phones and 97% on computers, and 43% passed all three on phones [3]. Phones are where an app is slow.

**Where Tiles stands (measured, `npm run check:speed`, a Pixel 7's screen with its processor slowed four times):** before 2026-11-28 a key took 232 to 1,608 ms to show (the middle of 30 keys), in the "poor" band on two of three pages; after the speed round 40 to 72 ms, well inside "good". Opening a tile's dialog is 104 to 840 ms (Foundation & Engagement is the heaviest page).

## 2. The tools most used to check speed

| Tool | Kind | What it gives | Cost |
|---|---|---|---|
| **PageSpeed Insights** | lab and field | a Lighthouse run plus the real visitors' figures from the Chrome UX Report (CrUX); the usual first stop | free [4] |
| **Lighthouse** (in Chrome's DevTools) | lab | a score and its audits: speed, accessibility, best practice; one page load | free [4][5] |
| **Chrome DevTools, Performance panel** | lab | a recording of every task: scripts, style, layout, paint; the "Forced reflow" insight and **Selector stats** (the cost of each CSS selector) | free [6][7] |
| **WebPageTest** | lab | real devices and networks round the world, a frame-by-frame film and request waterfall; deeper, harder to read | free and paid [5][8] |
| **GTmetrix** | lab | Lighthouse-based tests from many places, a clear report | free and paid [8] |
| **DebugBear, SpeedCurve, Calibre** | lab and real users (RUM) | scheduled tests and the figures of real visitors over time, alerts when a change makes it slower | paid [8] |

Lab tools load one page under set conditions, so they find causes; real-user tools say what visitors live with. Most guides advise both [4][8]. Tiles' own `npm run check:speed` is a lab test built for what Lighthouse does not do: it taps a tile and types into a card, the interactions INP measures, on a slowed phone.

## 3. The ways recommended to make a web app faster

1. **Never read the layout between writes** (layout thrashing). Reading a size after a style change forces the browser to lay the page out at once; doing it in a loop does it again and again. Read first, then write; DevTools' "Forced reflow" insight finds it [6].
2. **Do the work once, not at every render.** A React component's effects that measure the page should run when what they measure changes, not at every render; a slow part of the screen can wait behind the typing (`useDeferredValue`) and skip renders whose input has not changed (`memo`) [9].
3. **Cheaper style calculation.** The worst case is the number of elements times the number of selectors: fewer, simpler selectors and a smaller page cost less. Chrome's Selector stats show which selectors cost [6][7]. Chrome files each rule by the class, id, attribute or tag of the part of its selector that names the element styled; a rule whose last part is a bare `:is(...)`, `:has(...)`, `:not(...)` or `*` is filed nowhere and tried on every element [10].
4. **Skip what is off screen.** `content-visibility: auto` lets the browser skip the style, layout and paint of sections out of view (a demo went from 232 to 30 ms); it needs `contain-intrinsic-size` for their place, and never on the first screen [11].
5. **Load less.** Split the code so a page loads what it uses, compress, cache (Tiles does: Vite splits each page and the classification lists, the service worker keeps them).

## 4. What was done in Tiles

| Change | Why | Measured |
|---|---|---|
| Tiles, rails, the page header and grids measure when what they measure changes, not at every render (PR #148) | way 2: a page renders at every key, and each measure forced a layout (way 1) | a key 1,608 / 840 / 232 ms → 72 / 40 / 56 ms; a dialog opens in 7 to 10 renders, from 82 to 85 |
| One "measure again" signal a frame; the carousel's settle loop draws only when the layer moves (PR #148) | way 1 | in the 85 → 7 above |
| **Stylesheets: a rule whose element is named by a bare `:is(.a, .b)` is written out as the list it stands for** (`tools/scripts/vite/expand-subject-is.mjs`, a build step beside the hover one; the stylesheets keep their words) | way 3: such rules were tried on every element at every restyle; written out, Chrome files them by their class. Only where it is the same rule exactly: every part of the same weight (specificity), no pseudo-element; parts with a `:has()` or a combinator stay together | selector match attempts 7.67 → 5.13 million (-33%) and selector time -34% in the test flow; style work -9 to -10%, all work -7% |
| The layer's Back on a phone marks its layer (`data-top-back`) in place of `:has(> .layer-top-back)` | way 3: the second costliest selector, tried on every element | gone from the costly list |
| Dead lists removed (PR #148) | way 5 | two stylesheets, three components |

**Considered and left:** `content-visibility: auto` (way 4) is not used: the tiles measure themselves and each other on screen and off, and a skipped section would answer those measures with no size; the page's look would then depend on scrolling. The selectors still filed nowhere (`.fold-card-head ~ :not(.fold-card-head)`, a `:has(> .fold-card-head)` branch, `:nth-child(1 of ...)`) would need their markup to carry a class first; each costs under 10% of the selector time left. The 262 `!important` have no speed cost.

**How the look was proved unchanged:** the screen snapshot (AI 3) of every Foundation page, dialog and first floating cards in three reading modes, before and after, on a computer (1440 x 1000) and on a phone (412 x 915). See the log, 2026-11-28, for the result of each round.

## 5. Sources

1. web.dev, [How the Core Web Vitals metrics thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds)
2. web.dev, [Measure performance with the RAIL model](https://web.dev/articles/rail); MDN, [RAIL](https://developer.mozilla.org/en-US/docs/Glossary/RAIL)
3. HTTP Archive, [Web Almanac 2024, Performance](https://almanac.httparchive.org/en/2024/performance)
4. web.dev, [How to think about speed tools](https://web.dev/articles/speed-tools)
5. web.dev, [Use tools to measure performance](https://web.dev/articles/performance-audit-tools)
6. web.dev, [Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing); web.dev, [Reduce the scope and complexity of style calculations](https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations)
7. Chrome for Developers, [Analyze CSS selector performance during Recalculate Style events](https://developer.chrome.com/docs/devtools/performance/selector-stats); [CSS selector costs](https://developer.chrome.com/docs/performance/insights/slow-css-selector)
8. DebugBear (vendor), [GTmetrix vs PageSpeed Insights vs WebPageTest](https://debugbear.com/software/gtmetrix-vs-pagespeed-insights-vs-webpagetest); TechRadar, [Best website speed test tools](https://www.techradar.com/best/website-speed-test-tools)
9. React, [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
10. Chromium, the style engine's notes on how rules are filed by the last compound of their selector ([RuleFeature.cpp review](https://codereview.chromium.org/1317533002/diff/420001/Source/core/css/RuleFeature.cpp)); measured in Tiles with Chrome's selector statistics, 2026-11-28
11. web.dev, [content-visibility: the new CSS property that boosts your rendering performance](https://web.dev/articles/content-visibility); Chrome for Developers, [Defer rendering heavy content](https://developer.chrome.com/docs/modern-web-guidance/guides/performance/defer-rendering-heavy-content)

**How the sources were weighed:** the targets and the ways come from the browser makers' own guidance (web.dev, Chrome for Developers, React); the share of sites from the HTTP Archive's yearly measure of millions of sites; the tools from their makers and two comparisons, one by a vendor (DebugBear), read for what each tool does, not for which is best. How Chrome files rules comes from older Chromium notes, checked against the app's own selector statistics.
