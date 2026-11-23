# Responsive layout: one plan from monitor to phone

Status: **proposal**, written 2026-11-23 for the owner's review; nothing in it is built beyond what section 2 lists as "today". The owner asked: "Get an app developer and designer role. Do online research … Visit the folder of my website … Visit real life popular websites and apps … Check the existing layout of the app in all these different sizes … Review your proposal … come back with a solid well structured, in details proposal." Once approved, its rules move into AI 9 (the layout rules, section 4 "The page's sizes" and section 23 "The vertical layout") and this proposal is archived.

**Contents**

- [1. What I looked at](#1-what-i-looked-at)
- [2. The app today, measured](#2-the-app-today-measured)
- [3. What the platforms and the references say](#3-what-the-platforms-and-the-references-say)
- [4. The proposal](#4-the-proposal)
- [5. Review of my earlier proposal](#5-review-of-my-earlier-proposal)
- [6. Order of work and checks](#6-order-of-work-and-checks)
- [7. Decisions for the owner](#7-decisions-for-the-owner)
- [8. Sources](#8-sources)

## 1. What I looked at

1. **The owner's website** (`C:\Projects\NorthStardustStudioWebsite`): four tiers, each with its own layout and type.

   | Tier | Condition | Layout | Type |
   |---|---|---|---|
   | Desktop | 1200px wide or more, and 1250px tall or more | Six snapped states, tall compositions | Hero 64, major 48, label 24, body 20 |
   | Laptop | 1200px wide or more, under 1250px tall | Six snapped states, other blocks per state | Same as Desktop |
   | Tablet | 768 to 1199px | One scrolling page, two columns | Same as Desktop; header 100 to 76px |
   | Mobile | 767px and under | One scrolling page, a menu button | Hero 32, major 24, label 20, body 18, gutter 20px |

   The lessons:
   - The website decides by **width and height** together: Desktop and Laptop differ only by height.
   - Body text barely moves (20 to 18). The large headings halve (64 to 32).

2. **The app today** at six sizes (section 2): phone 390 x 844, tablet portrait 768 x 1024, tablet landscape 1024 x 768, laptop 1280 x 720, large laptop 1440 x 900, monitor 1920 x 1080.

3. **Platform guidelines:** Apple (size classes, typography), Google's Material 3 (window size classes, type scale), Microsoft Windows (breakpoints in effective pixels) and WCAG 2.2 (reflow, target size). See section 3.

4. **Five popular sites** at 390, 768, 1280 and 1920 wide: GOV.UK, GitHub, Apple UK, BBC News and Airbnb. I measured their h1, h2 and paragraph sizes and whether they swap their navigation for a menu button.

5. **The owner's screenshots of 23 Nov**:
   - Back losing its word.
   - Resources running out of room.
   - Chapters stacking four across, with the tags out of the page.
   - Tags and arrows coming apart in a narrow window.
   - Text sizes on smaller screens.
   - The phone footer.

## 2. The app today, measured

| Size | Layout | Page title | Master tile | Tile title / list | Chapter title | Scrolls |
|---|---|---|---|---|---|---|
| Phone 390 x 844 | stacked, 2 a row | 28 | 160 | 14 / 14 | 24 | yes (356 to 430px) |
| Tablet portrait 768 x 1024 | stacked, 2 a row | 36 | 309 | 18 / 18 | 28 | yes (825 to 876px) |
| Tablet landscape 1024 x 768 | stacked, 4 a row | 36 | 212 | 18 / 14 | 28 | yes (85 to 232px) |
| Laptop 1280 x 720 | side by side | 34 to 36 | 186 | 14 / 14 | 24 | no |
| Large laptop 1440 x 900 | side by side | 36 | 276 | 18 / 18 | 28 | no |
| Monitor 1920 x 1080 | side by side | 36 | 301 | 18 / 18 | 28 | no |

What breaks:

1. **The type does not follow the screen.**
   - A portrait tablet gets the monitor's sizes (36 / 28 / 18) and tiles larger than a laptop's (309 against 186).
   - The type only steps down where a tile happens to be small (data-compact), not by the size of the screen.
2. **The switch to the stacked layout is a width line, 1100px.**
   - A landscape tablet (1024) or a zoomed laptop crosses it.
   - Its chapters then lie in rows of four, and the page scrolls (the owner's screenshot 3).
3. **In the stacked layout the rails and arrows stand in the window's side margins, placed by the older rules.**
   - As the window narrows they come apart from the page (screenshots 4 and 5).
   - On a portrait tablet the left rail overlaps the page's edge.
4. **Text tiles with little room** showed one cut line. This is now fixed: the tile shows its title alone.
5. **Back lost its word next to an empty band.** This is fixed in PR #111.

## 3. What the platforms and the references say

**Breakpoints by window width** (the window's size, not the device's):

| Source | Compact / phone | Medium / tablet | Expanded / laptop | Large / monitor |
|---|---|---|---|---|
| Material 3 window size classes | under 600 | 600 to 839 | 840 to 1199 | 1200 to 1599, 1600 and up (extra large) |
| Windows (effective pixels) | under 640 | 641 to 1007 | 1008 and up | — |
| Apple size classes | compact width (iPhone portrait, narrow iPad split) | regular width (iPad full or wide split) | — | — |
| The owner's website | 767 and under | 768 to 1199 | 1200 and up (Laptop under 1250 tall) | 1200 and up (Desktop 1250 tall and up) |

What all four agree on:
- Decide by the space the **app's window** has, not by the device.
- About 600px separates a phone from a tablet.
- About 840 to 1000px separates one pane from two side by side.
- About 1200px is where the full desktop layout begins.
- Apple and Material both say to show the same information at every size and to change only its arrangement. Two panes side by side in a regular width become one pane with navigation in a compact width.

**Type:**
- **Apple:** iOS and iPadOS text defaults to 17pt with an 11pt minimum.
- **Material 3:**
  - Body large is 16sp, body medium 14sp, labels at least 11sp.
  - Headlines are 32, 28 and 24sp; titles 22, 16 and 14sp.
- **WCAG 2.2:** content must reflow at 320 CSS px (1.4.10) and text must resize to 200% (1.4.4); neither sets a size. A target must be at least 24 x 24 CSS px (2.5.8).

**Fluid type (Utopia and similar):**
- One scale whose steps grow by about 1.2 on a phone and 1.25 on a monitor, written once as `clamp()` sizes that move smoothly with the window.
- No jumps at breakpoints.

**The real sites:**
- **Body text hardly changes with the screen:** GOV.UK 19 at every width, GitHub 18, Airbnb 14.
- **The large headings carry the change:** GOV.UK's h1 goes 40, 50, 55, 64 from phone to monitor; GitHub's 36, 48, 56, 56.
- **Every one swaps its top navigation for a menu button on a phone.** Several keep a bottom bar for the main sections, as Apple's tab bar and Material's navigation bar do.

## 4. The proposal

### 4.1 Four tiers, by the window (width first, height second)

| Tier | Window | What it is for |
|---|---|---|
| **Phone** | under 600px wide | One column, the page scrolls, rails in the footer |
| **Tablet** | 600 to 899px wide, or any portrait window | One chapter a row, the page scrolls, rails in the footer |
| **Laptop** | 900 to 1439px wide, landscape | Two chapters side by side, no scroll, rails inside the page |
| **Monitor** | 1440px wide or more, landscape | As the laptop, at full size |

Why these lines:
- 600 is Material's compact line and close to Windows' 640.
- 900 sits between Material's 840 and Windows' 1008. It is where two chapters of tiles 170px or larger still fit (the page follows its tiles, section 4.3).
- 1440 is where the master tile reaches about 276px or more, the size of the large type.
- The width-only 1100px line goes; landscape against portrait still decides whether chapters stand side by side.

### 4.2 Type: one fluid scale, the headings move and the body holds

| Level | Monitor (1440+) | Laptop (900 to 1439) | Tablet (600 to 899) | Phone (under 600) | Today |
|---|---|---|---|---|---|
| Page title (h1) | 36 | 32 | 28 | 24 | 36 (28 on a phone) |
| Chapter title (h2) | 28 | 24 | 22 | 20 | 28 |
| Section / dialog title (h3) | 24 | 20 | 20 | 18 | 24 |
| Tile title | 18 | 16 | 16 | 14 | 18 (14 in small tiles) |
| Body, tile lists | 18 | 16 | 16 | 16 | 18 / 14 |
| Small (notes, captions) | 14 | 14 | 13 | 13 | 14 |

- **One set of tokens, `clamp()` between the tiers.** `--font-h1`, `--font-h2`, `--font-h3`, `--font-body` and `--font-small` become fluid sizes, so text grows and shrinks gradually with the window and jumps at no line. The ratio between levels eases from about 1.25 on a monitor to about 1.2 on a phone.
- **Floors:**
  - Body never under 16, which is Material's body large and close to Apple's 17pt default.
  - Small never under 13, above both platforms' 11.
  - No tracking widens text under 16px.
- **Tile type follows the tier, not the tile.** The tile titles and lists take the tier's sizes. The data-compact and data-tiny steps of today are removed: they only existed because the type did not follow the screen. A tile still too small for its list shows its title and symbol alone (today's rule, kept).
- **The page title stays one line on Laptop and Monitor.** It steps down to fit (today's rule). On Tablet and Phone the page name stands under the System name, without the dash (today's vertical rule).

### 4.3 Layout per tier

| | Phone | Tablet | Laptop | Monitor |
|---|---|---|---|---|
| Chapters | one a row, full width | one a row, full width | two side by side, hugging their tiles | as Laptop |
| Master tiles | 2 a row, square | 2 a row, square, capped at 260 | 2 x 2, square, one side per window (masterSide) | as Laptop |
| Page width | the window less 16px gutters | the window less 24px gutters, up to 840 | chapters + rails, centred (tilesPageWidth) | as Laptop, up to 1400 |
| Scrolling | the page scrolls | the page scrolls | never on a landscape window (checkLandscapePages) | never |
| Rails and arrows | footer band, the Pages bullets spread evenly, the Sections bullets hidden | as Phone | inside the page, under the title rule, against the chapters; the page symbol on the left rail's line | as Laptop |
| A rail too long | — | — | lies across the footer band (data-across) | as Laptop |
| Footer band | 64px: Back (arrow), the rail row | 64px: Back with its word, the rail row, the band's buttons | 64px: Back, "+ Add Segment" on the chapter's edge, Inventory and Completed under the chapters | as Laptop |
| Header | logo, organisation name, Menu and Workbook as icons | as Phone | names and icons | names and icons |

What changes from today:

1. **Laptop starts at 900, not 1100, for landscape windows.**
   - A landscape tablet (1024 x 768) and a zoomed laptop keep the two chapters side by side, no scroll, tiles about 180px (the owner's screenshot 3).
   - The stacked rows of four tiles go: no tier draws them.
2. **Tablet and Phone share one stacked layout, with their rails in the footer band.**
   - Their rails are never in the side margins (screenshots 4, 5 and 7).
   - A portrait tablet's tiles are capped at 260px so they never outgrow a laptop's.
3. **The Back keeps its word** wherever nothing stands beside it (built).

### 4.4 Resources when room runs short (the owner's screenshot 2)

When a Resources tile cannot list all its categories, it shows **one symbol a category**: a grid of 24 x 24 outline symbols in the tile's ink, each with its name as the tooltip and accessible name, each target at least 24 x 24 (WCAG 2.5.8). The symbols are drawn in the stroke and corner style of the System icons.

| Category | Symbol | Lucide reference |
|---|---|---|
| Workspace | a building | `building-2` |
| Utilities | a plug with a spark | `plug-zap` |
| Workstation | a desk lamp over a desk | `lamp-desk` |
| Equipment | a toolbox | `toolbox` |
| Vehicles | a van | `truck` |
| Digital Infrastructure | a server stack | `server` |
| Materials & Inventory | stacked boxes | `boxes` |
| Documents & Rights | a document with a seal | `file-badge` |
| Human Resources | two people | `users` |

- The same symbols lead each category's row in the Resources dialog, so the grid on the tile matches what opens.
- If a tile cannot fit even the symbols, it shows its title alone (the rule of section 2, item 4).

### 4.5 Turning the phone or the tablet (portrait and landscape)

The owner added on 2026-11-23 (23:14 UTC+2): "the user could rotate his mobile or tablet and the app both ways (portrait and landscape) should work and displayed properly".

**Measured today, Identity System:**

| Device, turned | Window | Layout today | Tile | Header + title | Scrolls |
|---|---|---|---|---|---|
| Phone, landscape | 844 x 390 | stacked, 2 a row | 330 | 80 + 81px: the title and the header take 41% of the height | 1385px |
| Large phone, landscape | 932 x 430 | stacked | 189 | 80 + 81px | 389px |
| Tablet, landscape | 1180 x 820 | side by side | 218 | 80 + 81px | no |
| Tablet, portrait | 820 x 1180 | stacked, 2 a row | 330 | 80 + 81px | 792px |

What breaks:
- **A turned phone is wide enough to look like a tablet** (844 or 932px wide) but has only 390 to 430px of height.
- The 80px header and the page title leave it about 200px. Its tiles grow to 330px, wider than the window is tall, and the page scrolls through 1385px.
- The rails stand in the side margin.

**The rule: the tier also reads the height** (Apple's compact height; Material's compact height class, under 480dp):

| Window | Tier | What changes |
|---|---|---|
| Height under 480 (a phone turned to landscape) | **Phone, landscape** | Header 56px; the page title one line (the System's name and the page's, smaller); tiles four a row, each about a quarter of the width less the gaps, so one chapter's four tiles fit in one screen height; the rails in a 48px footer band; the page scrolls by chapter |
| Landscape, 900px wide or more, and 640px tall or more | **Laptop / Monitor** | As section 4.3: side by side, no scroll |
| Landscape, under 900px wide, or under 640px tall (and 480 or more) | **Tablet** | As section 4.3: stacked, rails in the footer band |
| Portrait | **Tablet or Phone** by width | As section 4.3 |

- 640 is the height two rows of 150px tiles need under the header and title and above the footer band. Under it the no-scroll layout would make tiles too small, so the stacked layout takes over.
- A tablet turned from portrait (820 x 1180, Tablet) to landscape (1180 x 820, Laptop) changes tier. That is intended: the same rule as a desktop window being resized.

**Turning keeps the user's place.**
- The page, the open chapter, an open dialog or floating card, the scroll position of the chapter in view, and the text being typed stay as they were. Every layout measure already runs on `resize` (tiles, rails, arrows, the page width).
- Turning is a resize, plus `orientationchange` where the browser sends it, measured once the turn has settled.
- An open floating card re-centres on its tile.
- The keyboard on a phone in landscape takes about half the height. A field being typed in is scrolled into view above it (`visualViewport`), and the footer band hides while the keyboard is up.

**Safe areas.** In landscape, an iPhone's notch and an Android punch-hole stand at a side. The header, the footer band and the page's gutters add `env(safe-area-inset-left / right / bottom)`, with `viewport-fit=cover` on the page's viewport meta, so no control sits under them.

**Text never resizes on its own when turned.** `-webkit-text-size-adjust: 100%` keeps iOS from enlarging text in landscape; the fluid scale (section 4.2) changes it by the window instead.

### 4.6 Rules that stay

- Square tiles, frames hugging their tiles with 13px all round, 12px gaps and 12px above the footer band.
- Rails and arrows together, in the page or out of it, never split.
- Everything aligned left inside the page.
- WCAG 2.2 AA: 4.5:1 text contrast, 24px targets, reflow at 320px (the Phone tier), and text that can grow to 200% (the fluid sizes are in px clamps, so the browser's zoom still scales them).

## 5. Review of my earlier proposal

My proposal of 22:44 had three parts. On review:

- **Breakpoint at 900.** Kept, now backed by Material's 840 and Windows' 1008 lines. Added: portrait always stacks, and the stacked tiers put their rails in the footer, not in the margins.
- **Type table.** Revised.
  - The body no longer drops on a laptop: every site measured keeps it steady.
  - The tiers now follow section 4.1 (900 and 1440, not 1100 and 1440).
  - It is written as one fluid scale, not as jumps.
  - The small-tile steps (data-compact, data-tiny) go, since the tier now carries the type.
- **Resource symbols.** Kept. Added:
  - the 24px target;
  - the same symbols in the dialog;
  - the title-only fallback.

## 6. Order of work and checks

1. **Tokens and the fluid type scale** (section 4.2).
   - global.css: the five font tokens as `clamp()`; data-compact and data-tiny removed.
   - Check: the layout probe reads each level's size at 390, 768, 1024, 1280, 1440 and 1920, and fails one out of its tier's range or under its floor.
2. **The tiers** (section 4.1).
   - One query set in useVerticalLayout.ts and in the CSS: PHONE under 600, STACKED for portrait or under 900, SIDE BY SIDE for 900 and up in landscape.
   - The breakpoint registry in tokens.ts updated.
   - Check: checkLandscapePages extended to 1024 x 768 and 900 x 700.
3. **Rails in the footer on Tablet and Phone** (section 4.3, item 2).
   - Check: a new probe rule fails a rail in the side margins on a stacked page.
4. **The Resources symbols** (section 4.4).
   - Nine SVGs in `src/assets/resource-icons/`, drawn to the System icons' style.
   - Check: a unit test for the fallback order (list, then symbols, then title alone).
5. **Turning the device** (section 4.5).
   - The height lines in the same query set.
   - The compact header and footer band.
   - The safe areas, the keyboard and the place kept through a turn.
   - Check: the probe at 844 x 390, 932 x 430, 820 x 1180 and 1180 x 820. A test turns the window with a card open and a field being typed in, and checks they stay.
6. **Docs.**
   - AI 9 sections 4 and 23 rewritten from this proposal.
   - The user guide's note on screen sizes.
   - The log.
7. **Browser check** at the six sizes of section 2 and the four of section 4.5, light and dark, every System page and the Capability pages; screenshots to the owner.

Each step is one commit; the whole is one PR.

## 7. Decisions for the owner

1. **The tiers** (section 4.1): Phone under 600, Tablet 600 to 899 or portrait, Laptop 900 to 1439 landscape, Monitor 1440 and up.
2. **The type table** (section 4.2), with the body held at 16 on Phone, Tablet and Laptop and 18 on Monitor.
3. **Tablet and Phone rails in the footer band** (section 4.3).
4. **The nine Resource symbols** (section 4.4): these references, or other shapes for any of them.
5. **Turning the device** (section 4.5): a height line at 480 (Phone, landscape) and at 640 (side by side needs that much); the user's place kept through a turn; the safe areas.

## 8. Sources

- Apple, Human Interface Guidelines: [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Split views](https://developer.apple.com/design/human-interface-guidelines/split-views).
- Android: [Window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes), [Adaptive layout with Material Design](https://developer.android.com/codelabs/adaptive-material-guidance), [Material 3 Typography](https://developer.android.com/reference/kotlin/androidx/compose/material3/Typography).
- Microsoft: [Screen sizes and breakpoints](https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design), [Responsive design](https://learn.microsoft.com/en-us/windows/apps/design/layout/responsive-design).
- W3C: [Understanding 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow), [Understanding 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Fluid type: [Utopia type calculator](https://utopia.fyi/type/), [Smashing Magazine, Meet Utopia](https://smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/), [Piccalilli, type ratios](https://piccalil.li/complete-css/lessons/7).
- Symbols: [Lucide icons](https://lucide.dev/icons/), [toolbox](https://lucide.dev/icons/toolbox).
- Sites measured on 2026-11-23: [GOV.UK](https://www.gov.uk/), [GitHub](https://github.com/), [Apple UK](https://www.apple.com/uk/), [BBC News](https://www.bbc.co.uk/news), [Airbnb](https://www.airbnb.co.uk/).
