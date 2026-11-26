# 11. The symbols of the Capabilities and the Systems

Status: **current design**, written 2026-11-26, updated 2026-11-26. The 30 symbols of the app (6 Capabilities, 24 Systems): how they are drawn, their sizes, lines, corners, tints, gaps and colours, the drawing each one uses at each size, and the files the app reads.

Related: Interface 1 (shared components), layout-rules (`ai/09-layout-rules.md`, sections 8 and 9: the symbol under a tile's title), Records 1 (the log).

> **Approved (owner, 2026-11-26 02:35 UTC+2):** "Great, all these icons are approved." The drawings below are the approved set; a change to one goes through the owner first.

## 1. What the symbols are

Every Capability and every System has one symbol. A symbol stands for the area it names: a person in a frame for Identity, a compass for Strategy, a pair of people for People. The six Capability symbols open the six groups; the 24 System symbols sit under their Capability and take its colour.

The app shows a symbol in four places:

| Place | Size | Class |
|---|---|---|
| A Capability's or a System's tile, under its title | 44px (`--add-button-height`); 32px on a phone | `section-tile-title-mark` |
| A Capability's page and the System list on it | 44px; 32px on a phone | `section-tile-title-symbol` |
| The header of a System's page, before its title | 36px | `interview-header-icon` |
| A Capability's description window | 48px | `capability-description-icon` |

A symbol is a picture beside words that already name it, so it is decorative for a screen reader (`alt=""`; WCAG 2.2, 1.1.1).

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
- Where a gap is the whole point of the shape (the People pair, Data Governance's shield, Research's lens on the page) it is checked at every size.

## 8. Colour and reading modes

A symbol takes its Capability's colour; Foundation and its four Systems take the neutral ink.

| Capability | Colour | Contrast on white | On sepia | In dark mode |
|---|---|---|---|---|
| Foundation | `#0f172a` | 17.9:1 | 16.5:1 | 12.4:1 |
| Deliver Value | `#0d5929` | 8.5:1 | 7.8:1 | 13.0:1 |
| Manage Information | `#a45d0a` | 5.1:1 | 4.7:1 | 8.9:1 |
| Manage the Organisation | `#1c4ab0` | 7.9:1 | 7.3:1 | 4.3:1 |
| Communicate | `#bb4b11` | 5.1:1 | 4.7:1 | 6.2:1 |
| Measure & Improve | `#531fad` | 9.7:1 | 8.9:1 | 3.5:1 |

Every symbol meets WCAG 2.2, 1.4.11 (3:1 for the parts of a graphic) in all three modes. In the dark mode the app inverts the symbol and turns its hue back (`filter: invert(1) hue-rotate(180deg)`, `src/styles/colors.css`), so the colour reads light on the dark ground; the dark-mode figures are measured on that result. The colour is written once in each file (`color` on the `svg`), and every line and tint uses `currentColor`.

## 9. The symbols

The drawing each symbol uses, by size. The pictures are in the PDF and the review page.

| Symbol | Family | Drawing | By size | File |
|---|---|---|---|---|
| Foundation | Capability | Pyramid of tiles | Up to 24px: a stepped plinth of three solid courses. 36-48px: three outlined bars widening to the ground, one line apart, darker lower down. From 66px: six equal square tiles, 3-2-1, the writing line as the gap, tinted from the base up. | `01-foundation.svg` |
| Deliver Value | Capability | Gem | Up to 24px: the whole gem tinted, no crown line. From 36px: the cut facets, the crown light, the lower part darker. | `02-deliver-value.svg` |
| Manage Information | Capability | Open folder | The open folder, every corner soft; its label line from 32px. | `03-manage-information.svg` |
| Manage the Organisation | Capability | Organisation chart | Clear top box over light-tinted teams; rounded reporting lines; two teams small and medium, three large. | `04-manage-the-organization.svg` |
| Communicate | Capability | Two speech bubbles | One line of space between the bubbles at every size; the eyes of the first bubble from 32px. | `05-communicate.svg` |
| Measure & Improve | Capability | Rising trend | The area under the line fills from 32px. | `06-measure-and-improve.svg` |
| Identity | System of Foundation | Person in a frame | Up to 36px: the person alone. From 48px: the person in a light-tinted frame, the head clear. | `01-identity.svg` |
| Brand | System of Foundation | Tag with a star | The tag with a crisp solid star and a hole (no hole at 20px). | `02-brand.svg` |
| Business | System of Foundation | Briefcase | The briefcase: light-tinted body; from 36px the band, with the part below it darker; the clasp at large sizes. | `03-business.svg` |
| Strategy | System of Foundation | Compass | Up to 24px: the needle alone, half solid. From 36px: ring, four indicators and the needle at the writing line. | `04-strategy.svg` |
| Client | System of Deliver Value | Client with a star | Up to 36px: the star alone, light tint. From 48px: the person, head clear, with a smaller light-tinted star. | `05-client.svg` |
| Project | System of Deliver Value | Checklist on a clipboard | Up to 24px: a solid box with the tick cut through. From 36px: a clear clipboard with an outlined, light-tinted handle, one tick and an open circle; two ticks from 66px. | `06-project.svg` |
| Product Development | System of Deliver Value | Box | The cube with softly rounded outer corners. | `07-product-development.svg` |
| Operations | System of Deliver Value | Process loop | Up to 24px: a solid six-tooth gear with a clear centre. From 36px: a clear first step and a tinted second step with arrows; a done tick at large sizes. | `08-operations.svg` |
| Innovation | System of Deliver Value | Light bulb | Up to 24px: one base line. 36-48px: two lines. From 66px: a tinted cap and five rays. The glass is clear. | `09-innovation.svg` |
| Documentation | System of Manage Information | Page with a fold | The shared folded page. 20-24px: clear page, solid fold. From 36px: light page, darker fold, two writing lines. | `10-documentation.svg` |
| Research | System of Manage Information | Magnifier on a page | Up to 24px: the magnifier alone, tinted glass. From 36px: light page, darker fold, a fully clear lens; a tick in it at large sizes. | `11-research.svg` |
| Knowledge | System of Manage Information | Open book | The open book: tinted cover behind clear pages. | `12-knowledge.svg` |
| Asset | System of Manage Information | Labelled box | The archive box with its label. | `13-asset.svg` |
| Data Governance | System of Manage Information | Database with a shield | Clear top, light-tinted cylinder, cut one line clear of the darker shield. | `14-data-governance.svg` |
| Governance | System of Manage the Organisation | Columns | Roof, columns and base; three columns small, four from 32px, a step under them at large sizes. | `15-governance.svg` |
| People | System of Manage the Organisation | A pair | Up to 24px: a big and a small solid person, the one behind cut one line clear. From 36px: a pair, the one behind smaller with a lighter line; its body light-tinted at 84px and up. | `16-people.svg` |
| Finance | System of Manage the Organisation | Dollar in a circle | Up to 24px: the dollar alone. From 36px: the dollar in a clear circle. | `17-finance.svg` |
| Stakeholder | System of Manage the Organisation | Stakeholder map | Up to 36px: four dots, the lower-left one solid. From 48px: Mendelow's map with the key group lower left (solid dot; its square darker at large sizes). | `18-stakeholder.svg` |
| Publishing | System of Communicate | Newspaper | Up to 36px: a megaphone. From 48px: the newspaper, its picture darker, the folded page light. | `19-publishing.svg` |
| Website | System of Communicate | Window with @ | Up to 36px: the @ alone, clear. 48px: the window with a small clear @. From 66px: text lines beside the @. Light title band. | `20-website.svg` |
| Social Media | System of Communicate | Bubble with a heart | 20-24px: a solid heart. 36px: the heart, darker tint. From 48px: a clear bubble with the darker heart. | `21-social-media.svg` |
| Metrics & Reporting | System of Measure & Improve | Rising bars | Three equal columns at every size: the short bar solid, the middle darker, the tall one light; a base line at large sizes. | `22-metric-and-reporting.svg` |
| Quality | System of Measure & Improve | Shield, then medal | Up to 24px: a solid shield with the tick cut through. 36px: tinted shield. From 48px: a clear round medal, its darker ribbons joined to it. | `23-quality.svg` |
| Improvement | System of Measure & Improve | Improvement cycle | 20px: a solid up arrow. 24-36px: one turning arrow with a tick. From 48px: two arrows around a rising arrow. | `24-improvement.svg` |

## 10. The files

### 10.1 In the app

The app reads one file per symbol, at the same paths as before:

- `src/assets/capability-icons/NN-name.svg` (6 files), read by `src/data/capabilityIcons.ts`;
- `src/assets/system-icons/NN-name.svg` (24 files), read by `src/data/systemIcons.ts`.

**Format: one adaptive SVG per symbol.** Each file holds the seven drawings of the ladder, each in its own group with its own line width, and a short style block that shows the drawing for the size the file is shown at (CSS media queries inside an SVG answer to the size of the picture, in an `<img>` as well). The 48px drawing shows by default, so a program that ignores the style block still shows a good symbol.

Why this format:

- **Vector**: sharp at every size and on every screen density (a PNG would need several files per size and density).
- **The right drawing at every size, with no code**: the small, medium and large drawings switch by themselves, so a symbol shown at 32, 36, 44 or 48px is the drawing made for that size; the pages and components did not change.
- **One file per symbol**: the paths, the loaders and the `<img>` tags stay as they were, and the browser caches one file.
- **Small**: 0.3 MB for all 30; each file is read once.
- The app runs in a Chromium web view (WebView2 on Windows), which supports media queries in SVG images; Safari and Firefox do too.

### 10.2 The download set

`tiles-symbols.zip` holds, for each symbol, one SVG per ladder size (`system/16-people/16-people-24.svg` and so on: 210 files), drawn in `currentColor` with the line width of their size written in, ready for code (`fill="currentColor"` follows the text colour) or a design program; the 30 adaptive files of the app (`app/`); `symbols.json` (each symbol's id, file, name and family); and the PDF of this document.

### 10.3 Changing a symbol

The drawings are generated from one source (the review page's drawing script), never edited by hand in the files: a change is made in the source, checked on the review page at every ladder size (lines, gaps, tints, corners, the square), approved by the owner, then written out again to both sets of files. The exported files are compared pixel by pixel with the review page before they replace the app's.

## 11. Sources

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
