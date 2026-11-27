# 11. The symbols of the Capabilities, the Systems and the Resources

Status: **current design**, written 2026-11-26, updated 2026-11-27 (the sizes by room and the hover tile, 1 and 11.1; the file names, 9). The 39 symbols of the app (6 Capabilities, 24 Systems, 9 Resource categories): how they are drawn, their sizes, lines, corners, tints, gaps and colours, the drawing each one uses at each size, and the files the app reads. Sections 1 to 10 hold for all 39; section 11 adds what is particular to the Resources. The names follow the owner's renaming of 2026-11-26 (Value Delivery, Information, Organisation, Communication, Performance; Product, Data, Analytics), and so do the eight file names (2026-11-27; the download set of 10.2 keeps the old names until it is written out again).

Related: Interface 1 (shared components), layout-rules (`ai/09-layout-rules.md`, sections 8 and 9: the symbol under a tile's title), Records 1 (the log).

> **Approved (owner, 2026-11-26 02:35 UTC+2):** "Great, all these icons are approved." The drawings below are the approved set; a change to one goes through the owner first.
>
> **The Resources approved (owner, 2026-11-26):** all nine, the last "Use the Open package as icon for the Materials & Inventory" (21:00 UTC+2); "These icons will be used for both Infrastructure and Offering's Capability Resources. Their hue would change according to their card colour" (21:30 UTC+2).

## 1. What the symbols are

Every Capability and every System has one symbol. A symbol stands for the area it names: a person in a frame for Identity, a compass for Strategy, a pair of people for People. The six Capability symbols open the six groups; the 24 System symbols sit under their Capability and take its colour.

The app shows a symbol in four places:

| Place | Size | Class |
|---|---|---|
| A Capability's or a System's tile, under its title | 44px (`--add-button-height`); 32px on a phone | `section-tile-title-mark` |
| A Capability's page and the System list on it | 44px, then 66, 84 or 120px as the room under its list allows; 32px on a phone | `section-tile-title-symbol` |
| The header of a System's page, before its title | 36px | `interview-header-icon` |
| A Capability's description window | 48px | `capability-description-icon` |

A symbol stands beside words that already name it, so it is decorative for a screen reader: hidden on a tile (`aria-hidden`, section 8.1), `alt=""` in a header (WCAG 2.2, 1.1.1).

Under the pointer a tile's symbol grows 10% and stands on a tile of its own, 2px larger all round, in the card's ink, the symbol inverted on it; its tooltip stands 6px above that tile, on its left edge. The layout rules own the hover tile (`ai/09-layout-rules.md`, section 4, "Larger symbols where a tile has the room"), Interface 8 the tip.

## 2. The grid

- **A 24-unit square.** Every symbol is drawn on a 24 by 24 grid (`viewBox="0 0 24 24"`), the grid of Lucide, Tabler and Material Symbols.
- **One live area for all.** Every symbol fills the same 18 by 18 square (units 3 to 21), so 30 different shapes read as one family of the same size. No long shapes: a wide object (a newspaper, a window) is drawn to the square.
- **Clear, precise shapes.** Each symbol shows its idea and nothing more: no decoration, no extra marks.

## 3. Sizes: one symbol, three levels of detail

A symbol is not one drawing scaled: at a small size a detail turns into noise, at a large size a bare shape looks empty (Apple SF Symbols' small, medium and large scales; IBM Design Language's 16, 20, 24 and 32px sets). Each symbol therefore has three drawings, and a few have a special drawing for one size where the owner asked for one.

| Level | Sizes | What it shows |
|---|---|---|
| Small (S) | under 32px | The idea alone, often solid: the needle without the compass, the star without the person, the $ without the circle |
| Medium (M) | 32 to 56px | The whole object, few details |
| Large (L) | 57px and up | The whole object with its details: text lines, a base line, a second tick, rays |

The sizes are drawn and checked on a ladder of seven: **20, 24, 36, 48, 66, 84 and 120px**. Every symbol has one file per ladder size (section 10). A size between two steps uses the nearest step's drawing, scaled:

| Shown at | Drawing used |
|---|---|
| under 22px | 20px |
| 22 to 29px | 24px |
| 30 to 41px | 36px |
| 42 to 56px | 48px |
| 57 to 74px | 66px |
| 75 to 101px | 84px |
| 102px and up | 120px |

So the app's 32px uses the 36px drawing (its line comes to exactly 2px), 36px uses its own, and 44px uses the 48px drawing.

## 4. The line

The line grows slowly with the size, never under 2px (IBM: 2px at 32px; Lucide: 2px at 24px; Material Symbols get lighter as they grow):

**line = max(2, 1.5 + size / 48) px**

| Size | 20 | 24 | 36 | 48 | 66 | 84 | 120 |
|---|---|---|---|---|---|---|---|
| Line (px) | 2 | 2 | 2.25 | 2.5 | 2.9 | 3.25 | 4 |
| Line (grid units) | 2.4 | 2 | 1.5 | 1.25 | 1.05 | 0.93 | 0.8 |

- **Writing lines** (the lines that stand for text, tasks, labels; the marks inside a main shape, such as the tick in a medal or the heart in a bubble) are **0.6 of the line**. A mark that stands alone keeps the full line.
- **A person further back** (People) is drawn with 0.75 of the line.
- **Line ends and joins are round** (`stroke-linecap` and `stroke-linejoin: round`), except the mitred points of the stars and the compass needle.
- **No double lines**: where two shapes share an edge, the edge is drawn once.

## 5. Corners

- **Right angles are rounded**, with a centre radius of 0.8 of the line: the outside of the corner is 1.3 lines round and the inside stays visibly curved.
- **Frames 15 units or larger** (the folded page, the clipboard, the window, the frame of Identity) take a fixed radius of 2 units, so their inside corners stay round at every size.
- **A tint has the same radius as its outline**, so no white wedge shows in a corner.
- **Stars** keep straight sides and soften only by the round join (one star shape everywhere: ten points, inner radius 0.45). The Brand star is mitred and crisp.
- Corners that are not right angles (a slanted folder edge, a tag's point) are not rounded beyond the join.

## 6. Fills and tints

A symbol uses only **three fills**, all of its own colour:

| Fill | Opacity | Used for |
|---|---|---|
| Light tint | 0.18 | Large surfaces: a page, a body, a cylinder, the upper course |
| Darker tint | 0.40 | The part that carries weight: a fold, a lower course, a shield, the middle bar |
| Solid | 1 | Small parts only: a dot, a needle half, the short bar, the whole symbol at the small sizes |

- **Darker goes low**: where a symbol has levels (Foundation's bars, the Metrics bars, the briefcase below its band) the darker fill is at the bottom, as weight sits on the ground.
- **Clear** (no fill) keeps a part readable: heads, lenses, the glass of the bulb, the top of the database, the @.
- Tints are transparent, so the ground of the tile shows through: there are no white cut-outs, and a symbol works on any ground and in any reading mode.

## 7. Overlaps and gaps

- **One gap size**: where one shape passes behind another, the one behind is cut **one line clear** of the one in front (Lucide and Tabler: 2px at 24px). Outlines and tints are cut alike.
- **Cut ends are round**: the line behind ends in a round cap, one line clear, never a square stub.
- Gaps grow with the line, size by size, so a gap is always exactly one line wide.
- Where a gap is the whole point of the shape (the People pair, Data's shield, Research's lens on the page) it is checked at every size.

## 8. Colour and reading modes

A symbol takes its Capability's colour; Foundation and its four Systems take the neutral ink.

| Capability | Colour | Contrast on white | On sepia | In dark mode |
|---|---|---|---|---|
| Foundation | `#0f172a` | 17.9:1 | 16.5:1 | 12.4:1 |
| Value Delivery | `#0d5929` | 8.5:1 | 7.8:1 | 13.0:1 |
| Information | `#a45d0a` | 5.1:1 | 4.7:1 | 8.9:1 |
| Organisation | `#1c4ab0` | 7.9:1 | 7.3:1 | 4.3:1 |
| Communication | `#bb4b11` | 5.1:1 | 4.7:1 | 6.2:1 |
| Performance | `#531fad` | 9.7:1 | 8.9:1 | 3.5:1 |

Every symbol meets WCAG 2.2, 1.4.11 (3:1 for the parts of a graphic) in all three modes. In the dark mode the colour turns light at the same hue and saturation, its lightness mirrored, so it reads on the dark ground; the dark-mode figures are measured on that result. The colour is written once in each file (`color` on the `svg`), and every line and tint uses `currentColor`.

### 8.1 The rule: a symbol takes its card's hue

> **Owner, 2026-11-26 21:32 UTC+2:** "Make a rule, and fix it on the root of all the icons, that they take the hue of their cards."

**Every symbol on a tile is drawn in its card's hue, never in a colour of its own.** One shared component draws them all, `SymbolMark` (`src/components/interview/tiles/TileParts.tsx`), with one rule, `.symbol-mark` (`src/styles/colors.css`):

- The symbol's file is a **mask** (`mask: url(<file>)`) over the **card's ink** (`background`): the card's own colour where the card has one (`--tile-colour`: a Capability's tile, the frame of its Systems), else the card's hue in the reading mode's mark tone (`hsl(var(--strategy-theme-hue) var(--theme-mark-ink))`: a Resource in Infrastructure or in the Offering). A line may name its own ink (`--symbol-line-ink`): the Channel's teal on the Offering's Channel line, the faint ink of an empty category. The text ink is not used: it is the same neutral grey on every card, so it would not carry the card's hue.
- **Dark mode**: a card's own colour has its lightness mirrored (`hsl(from var(--tile-colour) h s calc(100 - l))` in effect, the figures above); the mark tone is the dark mode's own, light already. Light and sepia take the colour as it is.
- **Tints and cut-outs survive**: a file's fills are opacities (0.18, 0.40, 1) and its cut-outs are holes, and a mask keeps both, so a tint is the card's ink at 18% or 40% and the tile's ground shows through a hole in every mode.
- **Hidden from a screen reader** (`aria-hidden`): the title or the line beside it says its name (WCAG 2.2, 1.1.1).
- Where it is used: the symbol under a tile's title (`section-tile-title-mark`), before it (`section-tile-title-icon`), in a dialog's title (`section-tile-title-symbol`), before a line of a list (`section-tile-list-symbol`) and in a Resources tile's grid (`section-tile-list-fallback`).

A new place that shows a symbol on a tile uses `SymbolMark`, never an `<img>`. The two headers stay pictures in their file's colour, which is the colour of the page they head: a System page's header (`interview-header-icon`, which measures the picture's ink to stand level with the title) and the Capability description (`capability-description-icon`); the dark mode inverts them and turns their hue back (`filter: invert(1) hue-rotate(180deg)`), which gives the same light colour.

## 9. The symbols

The drawing each symbol uses, by size. The pictures are in the PDF and the review page.

| Symbol | Family | Drawing | By size | File |
|---|---|---|---|---|
| Foundation | Capability | Pyramid of tiles | Up to 24px: a stepped plinth of three solid courses. 36-48px: three outlined bars widening to the ground, one line apart, darker lower down. From 66px: six equal square tiles, 3-2-1, the writing line as the gap, tinted from the base up. | `01-foundation.svg` |
| Value Delivery | Capability | Gem | Up to 24px: the whole gem tinted, no crown line. From 36px: the cut facets, the crown light, the lower part darker. | `02-value-delivery.svg` |
| Information | Capability | Open folder | The open folder, every corner soft; its label line from 32px. | `03-information.svg` |
| Organisation | Capability | Organisation chart | Clear top box over light-tinted teams; rounded reporting lines; two teams small and medium, three large. | `04-organisation.svg` |
| Communication | Capability | Two speech bubbles | One line of space between the bubbles at every size; the eyes of the first bubble from 32px. | `05-communication.svg` |
| Performance | Capability | Rising trend | The area under the line fills from 32px. | `06-performance.svg` |
| Identity | System of Foundation | Person in a frame | Up to 36px: the person alone. From 48px: the person in a light-tinted frame, the head clear. | `01-identity.svg` |
| Brand | System of Foundation | Tag with a star | The tag with a crisp solid star and a hole (no hole at 20px). | `02-brand.svg` |
| Business | System of Foundation | Briefcase | The briefcase: light-tinted body; from 36px the band, with the part below it darker; the clasp at large sizes. | `03-business.svg` |
| Strategy | System of Foundation | Compass | Up to 24px: the needle alone, half solid. From 36px: ring, four indicators and the needle at the writing line. | `04-strategy.svg` |
| Client | System of Value Delivery | Client with a star | Up to 36px: the star alone, light tint. From 48px: the person, head clear, with a smaller light-tinted star. | `05-client.svg` |
| Project | System of Value Delivery | Checklist on a clipboard | Up to 24px: a solid box with the tick cut through. From 36px: a clear clipboard with an outlined, light-tinted handle, one tick and an open circle; two ticks from 66px. | `06-project.svg` |
| Product | System of Value Delivery | Box | The cube with softly rounded outer corners. | `07-product.svg` |
| Operations | System of Value Delivery | Process loop | Up to 24px: the six-tooth gear of Human Resources (Lucide's settings gear) in outline, light tint, a clear centre. From 36px: a clear first step and a tinted second step with arrows; a done tick at large sizes. | `08-operations.svg` |
| Innovation | System of Value Delivery | Light bulb | Up to 24px: one base line. 36-48px: two lines. From 66px: a tinted cap and five rays. The glass is clear. | `09-innovation.svg` |
| Documentation | System of Information | Page with a fold | The shared folded page. 20-24px: clear page, solid fold. From 36px: light page, darker fold, two writing lines. | `10-documentation.svg` |
| Research | System of Information | Magnifier on a page | Up to 24px: the magnifier alone, tinted glass. From 36px: light page, darker fold, a fully clear lens; a tick in it at large sizes. | `11-research.svg` |
| Knowledge | System of Information | Open book | The open book: tinted cover behind clear pages. | `12-knowledge.svg` |
| Asset | System of Information | Labelled box | The archive box with its label. | `13-asset.svg` |
| Data | System of Information | Database with a shield | Clear top, light-tinted cylinder, cut one line clear of the darker shield. | `14-data.svg` |
| Governance | System of Organisation | Columns | Roof, columns and base; three columns small, four from 32px, a step under them at large sizes. | `15-governance.svg` |
| People | System of Organisation | A pair | Up to 24px: a big and a small solid person, the one behind cut one line clear. From 36px: a pair, the one behind smaller with a lighter line; its body light-tinted at 84px and up. | `16-people.svg` |
| Finance | System of Organisation | Dollar in a circle | Up to 24px: the dollar alone. From 36px: the dollar in a clear circle. | `17-finance.svg` |
| Stakeholder | System of Organisation | Stakeholder map | Up to 36px: four dots, the lower-left one solid. From 48px: Mendelow's map with the key group lower left (solid dot; its square darker at large sizes). | `18-stakeholder.svg` |
| Publishing | System of Communication | Newspaper | Up to 36px: a megaphone. From 48px: the newspaper, its picture darker, the folded page light. | `19-publishing.svg` |
| Website | System of Communication | Window with @ | Up to 36px: the @ alone, clear. 48px: the window with a small clear @. From 66px: text lines beside the @. Light title band. | `20-website.svg` |
| Social Media | System of Communication | Bubble with a heart | 20-24px: a solid heart. 36px: the heart, darker tint. From 48px: a clear bubble with the darker heart. | `21-social-media.svg` |
| Analytics | System of Performance | Rising bars | Three equal columns at every size: the short bar solid, the middle darker, the tall one light; a base line at large sizes. | `22-analytics.svg` |
| Quality | System of Performance | Shield, then medal | Up to 24px: a solid shield with the tick cut through. 36px: tinted shield. From 48px: a clear round medal, its darker ribbons joined to it. | `23-quality.svg` |
| Improvement | System of Performance | Improvement cycle | 20px: a solid up arrow. 24-36px: one turning arrow with a tick. From 48px: two arrows around a rising arrow. | `24-improvement.svg` |

## 10. The files

### 10.1 In the app

The app reads one file per symbol, at the same paths as before:

- `src/assets/capability-icons/NN-name.svg` (6 files), read by `src/data/capabilityIcons.ts`;
- `src/assets/system-icons/NN-name.svg` (24 files), read by `src/data/systemIcons.ts`.
- `src/assets/resource-icons/name.svg` (9 files, named after the category: `materials-inventory.svg` for Materials & Inventory), read by `src/data/resourceIcons.ts` (section 11).

**Format: one adaptive SVG per symbol.** Each file holds the seven drawings of the ladder (eight for a Resource, section 11.3), each in its own group with its own line width, and a short style block that shows the drawing for the size the file is shown at (CSS media queries inside an SVG answer to the size of the picture, in an `<img>` or a CSS mask alike). The 48px drawing shows by default, so a program that ignores the style block still shows a good symbol.

Why this format:

- **Vector**: sharp at every size and on every screen density (a PNG would need several files per size and density).
- **The right drawing at every size, with no code**: the small, medium and large drawings switch by themselves, so a symbol shown at 32, 36, 44 or 48px is the drawing made for that size; the pages and components did not change.
- **One file per symbol**: the paths and the loaders stay as they were, and the browser caches one file; a tile draws it through `SymbolMark` (section 8.1), a header as an `<img>`.
- **Small**: 0.3 MB for the 30 Capabilities and Systems, about 0.1 MB for the 9 Resources; each file is read once.
- The app runs in a Chromium web view (WebView2 on Windows), which supports media queries in SVG images; Safari and Firefox do too.

### 10.2 The download set

`tiles-symbols-2026-11-26.zip` (in the project's Library, `designs/tiles-symbols/`) holds, for each symbol, one SVG per ladder size (`system/16-people/16-people-24.svg`, `resource/workstation/workstation-32.svg` and so on: 210 files for the Capabilities and the Systems, 72 for the Resources), drawn in `currentColor` with the line width of their size written in, ready for code (`fill="currentColor"` follows the text colour) or a design program; the 39 adaptive files of the app (`app/`); `symbols.json` (each symbol's id, file, name and family); and the PDF of this document.

### 10.3 Changing a symbol

The drawings are generated from one source (the review page's drawing script), never edited by hand in the files: a change is made in the source, checked on the review page at every ladder size (lines, gaps, tints, corners, the square), approved by the owner, then written out again to both sets of files. The exported files are compared pixel by pixel with the review page before they replace the app's.

## 11. The Resource symbols

### 11.1 What they are and where they show

The nine Resource categories of a Capability (Utilities, Equipment, Digital Infrastructure, Documents & Rights, Vehicles, Workspace, Human Resources, Workstation, Materials & Inventory) each have one symbol. They follow sections 2 to 7 in full: the 24-unit grid, the 18 by 18 square, the three levels of detail, the line, the corners, the three fills and the one-line gaps.

They show in the two Resources sections, **Infrastructure's** and the **Offering's**, wherever their names do not fit (the responsive layout, layout-rules sections 8 and 9):

| Place | Size | Class |
|---|---|---|
| A Resources tile too small to list its categories: a 3 x 3 grid of symbols, each named in its tooltip | Sized by the room at rest: 24px, then 32, 36 or 48px as the tile grows (layout rules, section 4) | `section-tile-list-fallback` |
| The Resources dialog where its titles do not fit three across: the symbol under or in place of the title | 48px (`--title-symbol-size`); smaller where the tile leaves less room | `section-tile-title-symbol` |

A symbol stands for words that are kept for assistive technology (the line's words stay in the list, the title's in its tooltip), so the picture itself is hidden from a screen reader (`aria-hidden`; WCAG 2.2, 1.1.1).

### 11.2 Colour: the card's own

A Resource symbol has **no colour of its own** (owner, 2026-11-26 21:30 UTC+2: "Their hue would change according to their card colour"): it follows the rule of section 8.1, as every symbol on a tile does. A Resources card has no `--tile-colour`, so the symbol takes its card's hue in the mark tone of the reading mode: Infrastructure's and the Offering's each their own, the Channel line's teal, an empty category's faint ink. Measured on the tiles of both examples (11.5), the line is 4.4:1 or more in every mode, above the 3:1 that WCAG 2.2, 1.4.11 asks of a graphic.

### 11.3 Sizes: eight drawings

The Resources are drawn on the ladder of section 3 **plus 32px**, the size of the large grid, so the size shown most has its own pixel-fitted drawing:

| Shown at | Drawing used |
|---|---|
| under 22px | 20px |
| 22 to 29px | 24px |
| 30 to 33px | 32px |
| 34 to 41px | 36px |
| 42 to 56px | 48px |
| 57 to 74px | 66px |
| 75 to 101px | 84px |
| 102px and up | 120px |

The 32px drawing is the 36px drawing with a 2.17px line, so the large grid shows exactly what the list of drawings shows (owner, 2026-11-26 22:24 UTC+2). Every drawing from 20 to 120px is **pixel-fitted**: shifted by quarter pixels (and at 20px scaled 14/15) so its main edges fall on whole pixels, measured on the outline with the tints off.

### 11.4 The symbols

| Symbol | Drawing | By size | File |
|---|---|---|---|
| Utilities | Plug | Up to 24px: the bolt alone, solid. From 32px: the plug, its body light, right-angle corners soft. From 66px the bolt sits in the middle of the plug. | `utilities.svg` |
| Equipment | Open-end spanner | A round head with a straight-sided slot that holds a nut, and a straight handle; every corner soft. Up to 24px: solid. From 32px: light tint. | `equipment.svg` |
| Digital Infrastructure | Processor chip | A 13-unit body with short pins evenly spaced on every side and a darker core. Up to 24px: solid, two pins a side, the core cut clear. From 66px a pin-1 dot marks the corner. | `digital-infrastructure.svg` |
| Documents & Rights | Page with a seal | Documentation's page with a smaller seal in the lower corner, clear of the fold. 20-36px: the page unfolded, the seal solid (set lower at 36px). 48px: the folded page, the seal solid and lower. From 66px: the seal under the fold, its circle clear, with ribbons (solid at 66px, darker above). | `documents-rights.svg` |
| Vehicles | Van | One outline with one cab wall: a light cargo box and a darker cab. 20-24px: body and wheels as one solid shape. 32-48px: the body arches over solid wheels, one line clear. From 66px: clear wheels. | `vehicles.svg` |
| Workspace | Office building | A tower and a lower, darker wing on the ground line; each tint is its own fill without a line, so every edge is drawn once. Windows as writing lines on the tower: two at 36-48px, three from 66px. Up to 24px: a solid tower with its windows cut through. | `workspace.svg` |
| Human Resources | ID badge, then person with a gear | 20-36px: a staff ID badge, its clip solid at the top, a clear card with a person on it. From 48px: Client's person at the same size and place, and a six-tooth gear in the place and size of Client's star (centre 17,7, 7.2 units across), in the writing line and the light tint. The gear is Lucide's settings gear (six rounded teeth). | `human-resources.svg` |
| Workstation | PC desk | Built on Phosphor's desk, after the owner's reference picture; the desk leads. Up to 24px: the desk alone, a solid top, a leg on the left and a clear drawer unit split once. From 32px: a light monitor on a neck over a darker top, the leg, and a light drawer unit with two drawers, its lower corners rounded as every right angle; three drawers from 66px; the handles are writing lines. | `workstation.svg` |
| Materials & Inventory | Open package | Lucide's open package, redrawn to these rules: the box below and its two flaps lifted open above, their corners sharp, softened only by the round join; light flaps (one fill, so no overlap darkens), a darker box, the opening clear. Up to 24px: the box alone, in a cube's proportions (16 by 18 units), solid sides and a clear opening, no flaps. | `materials-inventory.svg` |

The shared parts are drawn once for the whole set: Documents & Rights uses Documentation's page, Human Resources Client's person, and Operations (section 9) takes Human Resources' gear at 20 and 24px.

### 11.5 The test of 2026-11-26

All nine symbols at all eight sizes, on the review page:

| Test | Result |
|---|---|
| Colour leak (tint painted red at 6x, flood-filled from outside) | Pass. No tint outside an outline. Documents & Rights from 32px shows tint only along the designed cut round the seal, one line clear. |
| The square (ink against the 18 by 18 square) | Fill it: Digital Infrastructure, Equipment, Workspace, Workstation. Narrower by their shape: Utilities, Documents & Rights, Human Resources. Shorter by their shape: Vehicles, and Materials & Inventory from 32px (the open flaps); its 20-24px box fills the height. |
| Blur at 20 and 24px (share of half-covered edge pixels, after the pixel fit) | 10-27%: lowest Vehicles (10%), highest Human Resources at 24px (27%). |
| Blur from 32px | Up to 48%: the line is not a whole number of pixels there (2.17 to 4px), as with the approved System symbols. |
| Reading modes | Pass. Light, sepia and dark read the same; only the ink changes. |
| Line thickness (every drawing's line against max(2, 1.5 + size / 48)) | Pass. All 72 drawings at the rule; every writing line 0.6 of it, the Human Resources gear and the open package's flaps included (each inside its own scale). |
| Colour values (every fill and line in the files) | Pass. `currentColor` only, at full strength or as the 0.18 and 0.40 tints; white and black only inside the cut masks. |
| Corners (each right angle's radius against 0.8 of the line, measured on all 72 drawings) | Pass after one fix. Workstation's drawer unit had its two lower corners drawn as two lines meeting (a plain round join, no radius) from 32px: now rounded as every right angle, its tint with them. Vehicles' two lower body corners beside the wheels are tighter from 32 to 84px (0.55 and 0.68 units against 0.8 of the line), as the room between the corner and the cut round the wheel allows. Tints under a rounded line keep a square corner where the line covers it, as on the System symbols. Utilities' bolt keeps its sharp inner corners: it is a slanted shape (section 5). |
| Contrast in the card's hue (the symbol's line on its tile, both examples, light, sepia and dark, 768 and 1366px) | Pass after one fix. The first build drew the symbols in the tile's text ink, a neutral grey on every card, so they did not take the card's hue: now the card's mark tone (8.1). Infrastructure 5.9:1 light, 6.6:1 sepia, 4.4:1 dark; the Offering 5.3:1, 5.9:1 and 4.8:1; the Channel line's teal 5.4:1 or more. |
| The 32px drawing against the list of drawings | Pass after one fix. At 32px Documents & Rights showed the folded page with a clear seal and Vehicles clear wheels, drawings the list never showed: both now use their 36px drawing (the unfolded page with a solid seal; solid wheels). |

The exported files were compared pixel by pixel with the review page at every size: they match.

### 11.6 Changing a Resource symbol

As section 10.3: the drawing changes in the review page's source, is checked at all eight sizes, approved by the owner, written out again and compared pixel by pixel. A new Resource category takes its file name from its words (`resourceIconName`, `src/data/resourceIcons.ts`); a category with no file, such as one the founder adds, shows its name and no symbol.

## 12. Sources

- IBM Design Language, Icons: the 32px grid, 2px line and sizes 16 to 32px. https://www.ibm.com/design/language/iconography/ui-icons/design/
- Lucide, Icon design guide: 24px canvas, 2px line, round caps and joins, 2px between shapes. https://lucide.dev/guide/design/icon-design-guide
- Tabler Icons: 24px grid, 2px line. https://tabler.io/icons
- Google, Material Symbols: optical size and weight axes, lighter at large sizes. https://fonts.google.com/icons
- Apple, Human Interface Guidelines, SF Symbols: small, medium and large scales. https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- McDougall, Curry and de Bruijn (1999), Measuring symbol and icon characteristics, Behavior Research Methods 31(3). https://eprints.bournemouth.ac.uk/10165/
- Bar and Neta (2006), Humans prefer curved visual objects, Psychological Science 17(8). https://pubmed.ncbi.nlm.nih.gov/16913943/
- Mendelow (1991), stakeholder mapping (the power and interest grid), Proceedings of the 2nd International Conference on Information Systems.
- Nielsen Norman Group, Icon usability. https://www.nngroup.com/articles/icon-usability/
- W3C, WCAG 2.2: 1.1.1 Non-text Content, 1.4.1 Use of Color, 1.4.11 Non-text Contrast. https://www.w3.org/TR/WCAG22/
- W3C, SVG 2 and CSS Media Queries Level 4 (media queries inside an SVG image). https://www.w3.org/TR/SVG2/
- Lucide, `settings` (the six-tooth gear) and `package-open` (the open package). https://lucide.dev/icons/
- Phosphor Icons, `desk`: the base of Workstation. https://phosphoricons.com/
- MDN, `mask-image`: an image used as a mask keeps its opacity. https://developer.mozilla.org/docs/Web/CSS/mask-image
