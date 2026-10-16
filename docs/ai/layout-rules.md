# Layout rules: the Foundation pages' rulebook

Reconciled on 2026-10-14: one rule in one place. Sections 1 to 7 are the base rules (tokens, anatomy, sizes, alignment, tiles and dialogs, interactions, exceptions); sections 9 to 16 hold what the later rounds added, by topic; section 17 is the check. Rules that a later round replaced were moved, word for word, to Appendix A; Appendix B lists what is still to be settled. Where a rule gives a number and the table "Values as built" (section 8) gives another, the table is right: it is read from the code, which the tests check.

The measured rules every card, field and list on the Foundation pages
(Identity, Brand, Business and Strategy Systems) follows, the tokens and
classes that carry them, the closed set of sizes, and the automated check
that proves them. A page that breaks a rule here is a bug; a new pattern
is added here first, then built.

Every rule is carried by a shared token or class (`src/styles/global.css`,
`card-folding.css`, `conversation.css`), never by a per-page number: to
change a rule, change its token.

---

## 1. Principles

Four questions to ask of every card before calling it done. The rules
below are these, made measurable.

| Principle | What it means here | Checklist question |
|---|---|---|
| **Proximity** | Things that belong together sit together; things that do not are kept apart by the standard gaps, never by chance. A label is 6px from its control, a field 12px from the next, a card 12px from the next. | Can a reader tell, without reading, which label names which control and which fields form one group? |
| **Right-sized controls** | A control is as wide as the longest answer it must show, taken from a small closed set of widths, or it fills its column. Never wider "because there is room", never so narrow its value is cut. | Is every control one of the standard widths (or its column), and does its longest value show in full? |
| **Readability** | Text never overflows or is clipped; long names wrap and grow; text beside a control sits on the control's centre line; the order of fields is the order a founder thinks in. | Can every word be read without scrolling a box, and does the eye travel down one left edge? |
| **Noise** | Nothing is drawn that carries no information: no headers over rows that name themselves, no empty boxes, no second border inside a card, one reaction per kind of element. | If this element were removed, would the reader lose anything? |

**One margin: 12px** (the owner's rule, 2026-10-14). The side margins, the top and bottom margins and the gaps between things are all 12px (`--space-field`, `--card-padding`). The exceptions are the label of a field and its box (6px, `--space-label`) and the Description label with the text cell that opens under it.

---

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--space-label` | 6px | a label to the control it names |
| `--space-field` | 12px | one field (label and control) to the next |
| `--space-card` | 12px | one card to the next in a list |
| `--bg-card-tint` | #f3f4f6 / #23272c / #f3e8d8 (light / dark / sepia) | the neutral card ground: every card without a hue (Legal Entity, Founders Profile, Brand Style, Business cards), so the white boxes stand out; every card text keeps 4.5:1 on it (faint text as `--text-faint-on-tint`) |
| `--card-padding` | 12px | inside every card **and every section box**, border to content (sides) |
| `--space-row` | 6px | one row of a table to the next |
| `--space-cell` | 12px | one cell of a row to the next inside a card: a field grid's columns, a pair row, a list's cells, a table's columns |
| `--space-column` | 12px (= `--space-card`) | one column to the next, wherever columns stand side by side: a page's answer columns (Identity's four, Brand's three, Strategy's four, Inventory's two), Legal Entity's paired section boxes, a Segment's three columns, its Description's two: a column is the same distance from its neighbour across as a card is down |
| `--list-number-gap` | 12px | every numbered list in a cell, editable (`NumberedListInput`: Roles, Skills, Action list, Initiatives, SWOT...) or shown (`NumberedListStatic`, the Value Proposition's Needs): the number's right edge to its text. The number starts `--space-cell` (12px) from the list box's inside left edge and is right-aligned in a column as wide as that list's widest number (the rows share the list's grid, subgrid), so a list under ten has its first digit at 12px, "10." widens the column for every row, and all texts of a list start at one x. (The Needs lists shown on Business Foundation are held 12px in by their own margin, so no extra inset. A card head's number-to-name stays 8px.) |
| `--bullet-size` / `--bullet-gap` | 6px / 12px | a shown (read-only) bulleted list (`.business-engagement-channel-list`: Customer Profiles, relationship types, channels per stage): the dot is drawn (`li::before`), its left edge is the list's left edge, and its right edge is `--bullet-gap` from the text |
| `--card-body-indent` | 44px | a card body's left edge from the head's left (the arrow's 36px plus 8px) |
| `--side-label-gap` | 12px | a side label to its control |
| `--side-label-short` | 177px | the SHORT side-label column (`BusinessField side`): wide enough for the tick, "Responsible" and its "i" on ONE line (22 + 8 + 100 + 8 + 22 = 160px), so the short labels of a Capability card (Frequency on a Resource, Responsible on a Partner / Provider) stand in one column and their dropdowns start at one x (see "Capability cards: short side labels") |
| `--section-tile-size` | `max(--section-tile-min, (100cqw - (max(--tile-columns, 3) - 1) * 12px) / max(--tile-columns, 3))` | a section tile (see "Section tiles and dialog"): a true square, this wide and this high, in every group of tiles: up to three across a third of the tile box's width less the two gaps (a 3 x 3 set exactly fills it), four or more across the width less its gaps over their number, never under `--section-tile-min` (`100cqw` is the width of `.section-tiles-box`, the tiles' size container; `--tile-columns` is the group's shape, set by `SectionTiles`) |
| `--title-arrow-size` | `calc(var(--font-h2) * 0.75)` (21px) | the long side of the glyph of the `.title-arrow` button of the capability overview menu (`title-arrow.css`); the arrows beside a label or a card title are the label arrow (`--label-arrow-size`), not this one |
| `--section-head-height` | 36px | a section heading's height in a card of tiles (the height the old fold arrow gave it), and the height of the heading-height spacer that lines Offering's Capability's tiles up with Infrastructure's |
| `--section-box-size` | 160px | a founder's closed square box (more than 8 founders): the tile component at this fixed side (the subcategory boxes are sized for two rows instead, "Subcategory boxes") |
| `--workspace-form-width` | 560px | the Workspace dialog's card: centred, this wide at most (it is 364px: 12px, the label column, 12px, the pickers' column, 12px, and the border) |
| `--workspace-label-width` | 97px | the Workspace form's label column: the widest label of the form ("Workspace", 96px; with its tick "Deposit" 91px) and no wider |
| `--open-card-width` | 492px | an opened card in a dialog (a card box pressed): centred, this wide at most |
| `--founder-marker` / `--founder-inset` | 35.5px / 4.5px | a founder's marker column, left of the content edge, where the head's number, the roles' bullets, the fold arrows and the list numbers hang: a single-digit head number in tabular figures (18.3px) plus the head's 8px gap, so the number stands exactly 8px before the name; the inset keeps the standard 36px fold arrow's 4px focus ring inside the card (its box reaches 12.5px left of its glyph). The card's left padding is `--card-padding` + `--founder-inset` + `--founder-marker` (42.8px) |
| `--founder-cell` / `--founder-card-min` | 108px / 297px | a founder's four cells (Salary, Frequency, Working Hrs, Delivery Hrs), one width: what the Frequency picker's longest option ("Annually") needs with padding, chevron and border; and the width of a founder's card: what its content needs and no more (42.8px + 108 + 12 + 120, the second column as wide as the label "Frequency (i)", + 12 + the 2px border) |
| `--section-tile-line-height` | 1.45 | a tile title (and a box title) that wraps, a tile's list, a founder's list items: room between lines; a single line looks the same |
| `--tile-title-top` / `--tile-list-gap` | 0.25 / 8px | a tile's or box's title: the centre of its LAST line stands this fraction down the square (a third; 0.66667 would put it two thirds down); the gap from a list's bullet to its text (the list itself starts 12px under the title's rule: `--space-card` less the tile's `--tile-lift`, which `TileTitle` measures) |
| `--box-light` / `--box-shade` / `--box-inset` | white 75% / black 18% (dark: white 10% / black 50%; sepia: cream 80% / brown 20%) / `inset 3px 3px 6px light, inset -3px -3px 6px shade` | THE EDGE OF A BOX (page tile, subcategory box, card box, Completed box): no stroke, an inset light from the top left and an inset shade to the bottom right |
| `--plus-fill-saturation` / `--plus-fill-lightness` | 36% / 38% (sepia 34% / 36%; dark 42% / 68%) | the darker tone of a tile's hue: the stroke and the "+" of a "+" box at rest, its fill under the pointer (the hue is the tile's own) |
| `--cell-light` / `--cell-shade` / `--cell-inset` | white 50% / black 12% (dark: white 7% / black 45%; sepia: cream 55% / brown 14%) / `inset 2px 2px 3px light, inset -2px -2px 3px shade` | THE EDGE OF A CELL (an input, a picker, a text box, a name cell, the x) in an opened card of page 3: the lighter twin of the box's edge, no stroke |
| `--floating-scrim` / `--floating-caption-ink` | black 60% / #fff | the page behind a floating card: a FLAT dim, no blur, no lifted brightness; and the ink of the box names standing on it (6.26:1 light, 6.31 sepia, 19.1 dark over the worst pixel behind a name) |
| `--card-side-label` | 124px | the label column of the side-label rows (Status, Frequency) of an opened card: as wide as "Frequency (i)" (120px) needs, so the Status dropdown can be as wide as its longest option (316px) in the card's 454px |
| `--dialog-ground-alpha` / `--dialog-blur` | 20% / 14px | THE ONE DIALOG GROUND: the card ground of every open section dialog at this alpha (the background colour is 80% transparent) over the dimmed page, blurred this much behind it (`backdrop-filter`) |
| `--dialog-backdrop-brightness` | 1.7 (dark: 1) | the page behind the dialog, lifted (`backdrop-filter: brightness()`): it undoes the overlay's dimming so every text keeps 4.5:1 over the worst smear of the page behind the 80%-transparent ground (see "One ground for every dialog") |
| `--card-glass-alpha` / `--card-glass-blur` | 62% / 8px | the glass ground of every card inside an open dialog (a founder's, a resource's, an activity's, a partner's): the card's inner tint at this alpha, blurred this much |
| `--section-tile-min` | 120px | the smallest a section tile gets: a group too narrow for three of them wraps to fewer across |
| `--control-xs` | 80px | XS width step |
| `--control-code` | 128px | Code width step |
| `--control-date` | 212px | Date width step |
| `--control-s` | 220px | S width step |
| `--control-m` | 300px | M width step |
| `--control-l` | 420px | L width step |
| `--control-square` | 44px | the square variant; also the one control height |
| `--name-number-columns` | `minmax(0,1fr) min(var(--control-s),40%) 32px` | the Name / Number list |

---

## 8. Values as built (read from the code on 2026-10-14)

| Token | Value | Where | Note |
|---|---|---|---|
| `--open-card-width` | 492px | `global.css` | A test asserts 492. Older text in this rulebook says 480px (454px content): 492 is the value |
| `--tile-title-top` | 0.25 (a quarter of the square) | `global.css` | A test asserts 0.25. Older text says a third (0.33333) |
| `--card-label-col` | 177px | `global.css` | The label column of every side-label row |
| `--side-label-short` | `var(--card-label-col)` (177px) | `global.css` | Older text says 124, 156 or 164px; they are replaced |
| `--qty-w` | 56px | `section-tiles.css` | Quantity box of the cost row. Older text says 80px |
| Tile hover | `scale(1.1)` | `section-tiles.css` | Every tile. Older text says 150% for page tiles |
| `--tile-radius` | 8px | `global.css` | |
| The "+" box at rest | transparent with a 2px stroke (a disabled box keeps the ground colour) | `section-tiles.css`, "A WIRED BUTTON ..." | The global rule for wired buttons: no fill at rest, an outline and a symbol. Measured by the library runner |
| `--card-padding` | 12px | `global.css` | |
| The remove x at rest | transparent with a 2px red stroke and X (a disabled x keeps the surface fill) | `section-tiles.css`, "A WIRED BUTTON ..." | Older text in `remove-button.css` and the rulebook says the fill is the card's ground (`--x-ground`). Measured by the library runner |
| An "i" at rest | transparent in every look; the page-3 stroke of 1.5px is drawn as 1px on a 1x screen at 100% zoom | `section-tiles.css`, "A WIRED BUTTON ..." | A wired button: no fill at rest, an outline and a letter. The tint rule for other hue cards is overridden by `conversation.css`'s base rule (known finding in `src/library/assets/infoNote.ts`) |
| `--space-label`, `--space-field` | 6px, 12px | `global.css` | |
| `--floating-scrim` | transparent | `global.css` | A floating card never darkens the page; a dialog does (`--bg-overlay`) |
| A tile's list | holds every item and scrolls; there is no "+N more" line | `SectionTiles.tsx` | Older text in section 5a says the list ends with "+N more" |
| `--card-side-label` | not defined | | A test asserts it is absent |
| `--workspace-form-width`, `--workspace-label-width` | not defined | | The Workspace is a category of the resource card |

## 3. Anatomy

### Card head (`.fold-card-head`, every folding card)

```
| arrow 36 | 8 | "1." (own width) | 8 | name (the rest) ............ | x 32 |
             ^ body indent 44px: the number starts where the body starts
```

- The number starts at `--card-body-indent`, the same x as every label and
  control in the body, and is only as wide as its digits.
- The name follows the number at **8px** on every card.
- The arrow, number, name and x sit on the name's **first line**; a long
  name wraps downward and nothing else moves. (A FOLDED Capability card's
  name does not wrap: one line, ellipsis, fixed card height; see Capability cards.)
- **A folded card is one fixed height** (`.fold-card-fixed` on the head, opt-in;
  card-folding.css): its written name on ONE line cut by an ellipsis where it does
  not fit (the full name is its tooltip), its one-line summary under it cut the same
  way, so every folded card of a kind has the one height (a card with no summary:
  the head only); open, the name box wraps and grows as before. It applies to the
  flat card lists only: Business Foundation's Profile, Competitor and Offering cards;
  Infrastructure & Capability's Resource, Activity, Partnership & Provider and
  Infrastructure cards; Brand's colour and typeface cards; the Legal Entity's
  requirement and expense cards; the Founders Profile's cards; the cards of the
  Financial pages (`BusinessCard`). NOT Customer Engagement (tables), Strategy
  (nested boxes), Page 1's Segment card, a section card (its title carries an "i")
  or Brand's Inventory. The probe checks it ("a folded card's name / summary is one
  ellipsis-cut line", "folded cards of a kind are equally high").
- **A folded card's head is the open card's head.** The written name
  (`.strategy-name-static`) takes the name box's own line, padding and
  (unseen) edge, so folding moves nothing but what is under the head.
- A folded card's one-line summary sits under the name, from the name's x
  (a Profile card shows none: number, name and x only).
- **A group that folds inside a card** (a Profile's Description,
  Motivations and Needs; a Competitor's Description and Competitors SWOT
  Analysis; an Offering's Description): the app's fold arrow before its
  title, hanging in the card's arrow column (the title stays at the
  body's edge), the row the arrow's 36px high; open until folded, and
  folded it shows only its title's line.
- **Head to body: 12px** (`--space-field`), from the head's lowest edge to
  the first thing under it, on every card (an Objective's Start box too:
  its Description label is set down onto the Start box's centre line
  instead of the Start box being lifted into the head's gap).
- **Head buttons** (a Strategy card's filter and x): 12px (`--space-cell`)
  after the name box, 12px apart, the last at the card's 12px side margin.
- **A grip and no fold arrow** (a Metric box, a Situation Theme box): the
  number's first character follows the grip at the head's 8px gap (no
  empty list-number column), and the body starts at the number's x
  (number-left = body-left), 32px in (the grip's 24px and 8px).

### Content starts at the title (numbered or not)

Under every head with a fold arrow, the content -- text, labels, cells,
boxes, tables, nested cards -- starts at the left edge of the title's
text: its NUMBER where it has one ("1. Segment", "2. Customer
Relationship", "1. Offering -", "1. Goal", "1. Metric"), its first letter
where it has none ("Demand & Conversion", "Electricity", "Establishment").
Fold arrows and drag grips are not content: they stand in front of that
edge. Where the block sits at its card's body edge, its arrow hangs in the
card's arrow column (Customer Engagement's sections, Infrastructure's
sections); where there is no arrow column before it, its
content moves in past the arrow and its gap instead (Demand &
Conversion, Infrastructure's subsections, Financial Foundation's cost
groups). The card rule (number-left = body-left) is this rule for cards.
Named exceptions: a Brand colour or typeface card's body (under its name
box); a Competitor's or Offering's Type (under its name box, ending at the
name box's right edge rather than starting at its left). A table's
band rows are set by their cells (the Customer Relationship's Offering
blocks, below). The check holds every head on every page.

### Card body

- Everything starts at the body's left edge (`--card-body-indent`).
- **One vertical rhythm** in every card and section box: a label 6px
  (`--space-label`) above its control; a control, list row or add button
  12px (`--space-field`) above what follows it; two groups divided by a
  rule, 12px either side of it (a group gap of 24px). A side label is part
  of its control's row.
- **A frozen field's hint** ("Choose a country first.", FrozenUntil) stands
  on the label's own line, right of the label and its "i", in the small
  hint style, vertically centred on that line -- never on a line of its own,
  so the label stays 6px above its control. Legal Entity labels only
  (`.legal-entity-label .field-status-line`).
- The Legal Entity's consumption-tax row (Tax & Business Registration) is
  drawn only once a country is chosen that has a profile with its own
  consumption tax; none before, none for an unprofiled country.
- A card's two columns (`.card-field-pairs-grid`): `repeat(2, minmax(0, S))`
  `--space-cell` (12px) apart, one column under 300px.
- An optional field (tick + growing box) has its tick at the body edge and
  its box under it, from the same edge.
- The Workspace card's optional **Deposit** (shown at Status Costs): the same
  `OptionalField` tick (label gap 6px), its body one row (`.business-capability-price
  .business-capability-deposit`): the amount box at the Code step (128px), then the
  card's currency as plain text 8px after it, on one centre line.

### Cards and section boxes

Every card and every section box (Legal Entity's numbered sections, the
Financial Foundation's need and offering-cost cards, Strategy boxes) has
the same inner side margin: `--card-padding` (12px).

---

## 4. Sizes: the closed set

### Widths (six steps, plus "its column")

| Step | Width | Holds | Used for |
|---|---|---|---|
| XS | 80px | 3-4 digits, or "33.333" | Quantity, a person's hours, calendar weeks (`.delivery-number`), a founder's Ownership % |
| Code | 128px | 10 characters ("10001-1234" 98px, ten digits 107px, "£250,000") | a founder's Capital, the activity code, the Workspace's Deposit amount |
| Date | 170px | the longest month and year ("September 2030" 143px) and its insets | every Start / End month picker in Strategy: the Strategic Period's and every Objective's |
| S | 220px | 18 characters, or a whole date with its calendar button (159px) | numbers and amounts in fields, dates, short pickers (Status, Role, Responsible), month pickers outside Strategy, the Number column of a Name / Number list |
| M | 300px | an amount with its currency | price + currency pairs |
| L | 420px | a long option | pickers whose longest option needs it (OptionPicker picks S, M or L itself) |
| Column | its column | anything | text fields and pickers that fill their column (Country, State / Region, the Address) |

**The hug exception.** A side-label picker marked to hug (`hug`,
`data-size="hug"`: a Competitor's and an Offering's Type) is exactly as
wide as its longest option (or placeholder) with its padding, chevron and
border, rather than the step that holds it. The check measures that
width.

The two-column grids are built from these: a pair row is two S columns, a
Name / Number list is "the rest" plus S. A width outside this list fails
the check, except a control that fills its column, its container, or one
track of the grid it stands in.

### Heights

- **One single-line control height: 45px** (drawn 44.33px, the 1px border
  snapped by the browser). Inputs, pickers, date inputs.
- **Square** (`--control-square`, 44 x 44): a 2-3 digit value with its unit
  after it; the Text Hierarchy's px boxes. Value centred.
- **Text boxes** grow with their text and are never resized by hand:
  at least **2 lines** for a written answer, **2 lines** for the Legal
  Entity's Main Activity and Address (side by side, one column each, the
  same size), **5 lines** for an image's description (Brand Inventory).
  One-line text boxes (a card's name, a founder's name, a registration's
  name) wrap and grow instead of clipping.

### Compact items

- The x (remove): 32 x 32, on every row of a list in one column.
- A tick box: 18 x 18.
- The fold arrow: 36 x 36. (The exception is the label arrow beside a label or a title: a triangle of the label's own size with a hit area never under 24px; see "The label arrow" and "Section tiles and dialog".)
### The caps title

Every capitalised card kind word and group heading takes ONE calm style,
the card-head kind word's ("1. SEGMENT"): the body size, weight 600, the
0.05em tracking, `--caps-title-color` (the muted text colour), in
capitals on screen only (`text-transform`: the words read aloud and
every accessible name unchanged). Business Foundation's "1. SEGMENT",
PROFILES, COMPETITORS, OFFERINGS and VALUE PROPOSITION; Customer
Engagement's "1. SEGMENT", CUSTOMER CHANNEL and CUSTOMER RELATIONSHIP;
Strategy's THEME, GOAL, OBJECTIVE, METRIC and INITIATIVES wherever they
name a card. No bolder, full-ink variant. `--caps-title-color` holds
4.5:1 or more on every ground a caps title stands on, in light, sepia and
dark (5.8:1 at the least: sepia, on a Goal card and the Value Proposition
panel); a ground that fails darkens the token, never one title. A button
inside a heading (an "i", "Expand all") keeps its own case. The Roadmap
and the documents are unchanged.

### Card-list add buttons (an explicit list)

These add buttons span their list of cards, from the cards' left edge to
their right (the list's content width while it is empty), label centred
(`.card-list-add`, as `.legal-entity-list-add`):

- Legal Entity: "+ Add legal requirement" (5), "+ Add expense" (6).
- Business Foundation: "+ Add Profile", "+ Add Competitor", "+ Add
  Offering".

Every other add button keeps its own rule: as wide as its label (Goal,
Objective, Metric, Theme, Segment, Resource, Activity, Cost, Funding
Source...), the whole cell in a table cell, control to x under a
[control][x] row. The check holds only the buttons listed here.

---

## 5. Alignment

### The in-row cell gap

Cells side by side in one row inside a card are `--space-cell` (12px)
apart, everywhere: field grids, pair rows, Name / Number lists, tables.
Gaps between cards, sections and page columns (`--space-card`,
`--space-column`) are not cell gaps, but they are the same 12px: **every
gap between cells, cards, boxes and columns, side by side or stacked, is
12px.** The only 24px left between two blocks is a group gap across a
dividing rule (12px either side of it); the Roadmap, Capability, Financial
and Business Foundation's lower sections keep their own page layouts.

### The mid-line rule

- **Text beside a control** has its first line centred on the control's
  centre line (a side label, "px" after a box, the words of a fixed list
  row). A second line hangs below.
- **A tick box** is centred on its words' first line.
- **An "i"** follows its words' last word at 6px (`--info-gap`, one rule for every "i"), on that line's centre
  (glued to the last word, `.info-note-glue`); after a badge, on the
  badge's centre.
- Exception: a Text Hierarchy level's row (see 7) centres the tick, the
  name's whole block and the px box on the row's centre line.

### Connected components align as one (2026-10-16)

Components that belong together align as one, wherever they stand: side by side in one row, or joined to one field
(a label and its cell; a cell and its x, plus, calendar, link symbol or unit word; a tick and its words; a price with its
currency and its frequency; a date cell and its calendar).

1. **One centre line.** Their centres are on the same horizontal line, whatever their heights (the Responsible row: the tick, its words, the "i" and the dropdown cell share one middle, within 1px): a cell is 44px, a box button
   32px, a link symbol 24px, a tick 24px, an "i" 24px; each is centred on the row's centre line, and a text on its first line.
2. **Same height, same top.** Components of the same height in a row (the cells: 44px) share one top edge and one bottom edge.
3. **One gap.** The gap between connected components is the in-row gap (12px); an "i" and a label gap are 6px (see above).
4. **Column lines.** A connected component starts and ends on the card's column lines: the control column starts at one x in
   every row, and a row that holds several cells splits that width between them.
5. **No special case.** A component placed beside another follows this rule without an exception; a new component is
   checked against it before it is placed (docs/design/08-library-system.md).

The check: `node scripts/catalogue/align-check.mjs` opens every master tile and the first two cards of each view, and lists
every pair of controls side by side whose centres differ by more than 1px, or whose tops differ when their heights are equal.
It must list none.

### One dropdown alone in a row, and fields that pair (2026-10-16, owner)

6. **A dropdown alone in its row takes the row.** When a card's row holds one field and it is a dropdown, its right side is the available space's: 12px after the x's left side, which is the name cell's right edge, or, on a card with no x, 56px (12px gap + the 32px x + 12px side gap) from the card's right edge. It does not size to its longest option. (Built in `OptionPicker`: a hugging picker with no other control in its row is "full".)
7. **A field with the label above its holder usually has a partner beside it.** The common pairs: Working Hours with Delivery Hours; Salary, Cost, Price or Expense with its Frequency. A currency dropdown, where there is one, comes after the amount; a quantity (QTY) cell, where there is one, comes before it. (Rule recorded; applying it card by card is a survey of every card still to do.)
8. **The common fields are one thing everywhere.** A field kind (text cell, dropdown, date or month cell, number, tick, colour, x, plus, i) has one style, behaviour, size, shape and layout in every system, page and card; a difference is a defect, and is fixed in the library and the shared component, not in the page.

### Grids and lists

- **Page grids** (`.answer-columns`: Identity's, Strategy's; `.brand-style` /
  `.brand-inventory`: Brand's; `.legal-entity-body` and `.legal-entity-row`:
  Legal Entity): columns `--space-column`, rows `--space-field`, stacked
  section boxes `--space-card`: 12px every way. A Brand Inventory image and
  its preview are `--space-cell` apart.
- A control starts at its column's left edge; controls of one row share
  their top edge; side-by-side boxes share their bottom edge.
- A list with a x keeps the x column on every row (`32px` track), so the
  columns before it stay put.
- An add button at a list's end spans the list ("+ ADD ...", labelled).
- **List-end add button**: "+ ADD ..." under a list, the list's whole width,
  its label centred (`.legal-entity-list-add`): registrations, tax
  registrations, founders.
- **Free-text numbers wrap**: a registration or tax number, a VAT number, a
  requirement's reference are free text, not figures: they keep their
  standard width and wrap onto more lines, growing down; the x and the
  fields beside them stay on the first line.
- **Tick rows**: a tick that stands as a field ("Add to Legal Entity
  Expenses", "Relevant Information") is one line, a row gap from what is
  above and below it, and a label gap above the box it opens. The options
  of one tick list (several ticks under one label: a Legal Entity expense's
  Links) are rows of that field, each one line and a row gap (12px,
  `--space-field`) from the next: the tick-to-tick pitch is the same in a
  list as between two tick fields. **Every tick-to-tick gap in the app is that
  12px** (`--space-field`): a stack of tick options (the Links, a field's
  Functional Needs), a row of ticks (Goals, Demand), the Brand Style
  columns' slots and rows, and a tick field above or below another; a tick
  row has no min-height of its own beside the 45px of a row that holds a
  field (a tick row in a Brand Style column keeps 45px so the columns share
  a line; the gap between row boxes is still 12px). The probe checks
  `.legal-entity-links` and a field's stacked tick options.
- **Activity cards: Completed and the Links** (the owner's rule, 2026-10-15): a **divider line** stands above the Completed tick, 12px (`--space-field`) of space above and below it, and the **Links** ("Linked to", the Offerings the activity is linked to) come last, **after Completed**. Wherever an Activity card is opened (Infrastructure, Offering's Capability, the Completed tile) the order is: the fields, Description, the divider, Completed, the Links. To be applied in the app when the Activity card is built from the library (docs/design/09-assets-library.md, DIV.001 and CRD.003, CRD.007).
- **Navigation rails** (`bullet-rail.css`, wide windows): the two rails are
  mirrors of each other and share every rule: the name 18px over its list, rows
  18px apart, the dot 20px from the card, the text 12px
  (`gap`) from the dot, both rails (the dot is 12px wide: the name 24px past
  the dot's edge). The name's text edge is its list's INK edge: the right edge of the
  Pages labels (right-aligned beside their dots), the left edge of the
  Sections numbers' ink: the right rail's label is pulled left by
  `--rail-number-lead` (the blank the right-aligned number column leaves
  before a one-digit "N."), so the number's INK is 12px from the dot and the
  name's padding is plain 24px.
- **Founder card** (Founders Profile): on the card's two equal columns,
  the Roles in the first column of the first row (the second empty), then
  Industry | Management, then Achievements | Skills; one column under a
  600px card.
- **Objective card** (Strategy): on the columns of its Initiatives | Metrics
  row; the Description in the first (as wide as the Initiatives box); in
  the second, from the Metric column's edge, "Start [month]" over "End
  [month]" (the Strategic Period's pair: the same month picker, its
  label in a 48px column beside it, the Date step) and, as a third row
  under the End box, "Responsible": the Capability cards' own side-label
  row (`BusinessField side`, see "Capability cards: short side labels": the
  label in `--side-label-short`, `--side-label-gap`, a hugging dropdown, one
  centre line), a field gap (12px) under End. "Start" stands on the
  Description label's line. With exactly one founder (or none) there is no
  Responsible row at all (no label, no text, no empty row; the rows reflow
  at the 12px rhythm) and the objective is attributed to the sole founder
  wherever it is read (`strategyObjectiveOwnerId`). One column under 900px. Its columns, and every box inside the card, stand
  `--space-card` (12px) apart.
- **A Metric box's x under its Objective's filter (funnel) button.** The
  Metric box ends where that column needs it, and its name and
  description boxes end with it. (Every card's own x stays at its own
  12px side margin: a Goal's x is not moved in to its Objectives'.)
- **Segment card** (Business Foundation): one grid for its body, from the
  body's left edge (the number's x) to its right: three equal columns
  `--space-column` (12px, a card gap) apart. The Description's two columns
  and the Value Proposition above share their edges with Profiles,
  Competitors and Offerings below; each column's cards take its whole
  width, 12px apart. (Two columns under 1500px, one under 900px, on the
  same edges.) Above 1500px the Segment's x stands at the card's top-right
  corner, its centre on the name box's centre line (a one-line box), and the head is the first column's width: the name box's right
  edge is the first column's right edge, and the box grows with its text
  up to the second column's right edge (then wraps). The Description and
  the Value Proposition are two cards of one panel look (card padding,
  `--space-cell` between their title and cells), the Description two
  columns wide, both starting in the row below the name box at one top, so
  their titles share a line; the Description's cells are `--space-cell`
  apart and fill one grid, so Geographics and Market Size share a top. Business Data
  stays directly under Geographics: the tall Market Size spans the rows
  beside Geographics and Business Data, so it never stretches Geographics' row.
  A Segment is added with "+ Add Segment".
- **Competitor and Offering cards**: the Type field is a row of the head
  under the name, set against the name box's RIGHT edge: the picker's
  right edge is the name box's right edge. "Type" is a compact side label
  beside its picker on the picker's mid line, 12px under the name and
  12px above the body. The label and the picker keep their sizes (the
  picker hugs its longest option, see the hug exception); the pair is
  right-aligned.
- **Customer Engagement**: "1. Customer Channel" and "2. Customer
  Relationship" hang their fold arrows in the Segment card's arrow column
  (under its arrow), so their numbers stand at the Segment's number. In
  the Customer Channel table every cell (heads, category rows, nested
  channels, cells) has 12px (`--space-field`) between its edge and what
  stands in it, at the sides and top and bottom. While that table has its four
  columns (its box 1300px or wider) JOURNEY STAGE and CHANNEL are FITTED to their
  dropdowns: the Journey Stage picker is as wide as its longest option ("Support &
  Follow Up", hugging, sized for every stage so it does not change width as stages
  are chosen) and its column exactly that picker, the 12px gap, the x and the 12px
  cell padding at both sides; the Channel column fits the widest category or channel
  name preset ("Booking / Registration Page", the nested mark, the "i" and the x
  beside it) the same way; the Journey Stage column is also never narrower than its
  "+ Add Journey Stage" button on ONE line (the button's measured width, 272px at 18px,
  and the cell padding at both sides: 299px). A stage row is ONE block: the dropdown
  FILLS the track from the cell's 12px padding to the x (never narrower than its
  longest option; it does not hug), the x 12px from it, and the Add button spans from the
  dropdown's left edge to the x's right edge, the same widths on every row; OFFERINGS and ACTION share the rest, 45% / 55%. The widths
  are MEASURED in the font the table is drawn in (`useChannelColumns.ts`, sums in
  `ChannelTableColumns.ts`, set as `--col-channel`, `--col-stage`,
  `--col-offerings`, `--col-action` on the table and again on resize), never
  guessed; no picker shows a cut word. They are measured from a hidden copy of one
  stage row, so they are the same whether or not any category is open (a table with
  every category folded has no stage row to read) and the Channel Category picker
  ("Physical Delivery", the widest) never wraps in its category row. Narrower, the table stacks as before. The
  Customer Relationship table keeps its own columns. Under that table, "Channel
  resources" is a fold of its own (the section-head pattern: arrow in the
  card's arrow column, caps title, the table starting at the title's text;
  open by default, not drawn when the Segment has no channel resource): a
  read-only table (`.channel-resource-table`, derived by
  `buildChannelResourceTable`, never stored or counted) on the channel
  table's ground, hairlines and 8px corners, 12px (`--space-field`) from
  every cell's edge to its text, text wrapping, scrolling only inside its
  own box under 1050px; its columns are Resource, Cost,
  Behaviour, Channel, Offerings, Journey stages and Actions (no Status,
  "Where it lives" or "Also reaches" column). A cell holding two or more
  values (the Channel cell: the channel the resource was made on first, then
  each other channel it shows in through an action; Offerings; Journey
  stages) lists them one under the other as bullets
  (`.channel-resource-bullets`: the drawn bullet, `--bullet-size` /
  `--bullet-gap`), every item styled alike; a single value is plain text with
  no bullet, indented by the bullet's width and gap (`.channel-resource-single`)
  so the text of every cell of a column starts at ONE x. The Actions cell has NO
  bullets: its "#N" buttons sit side by side and wrap between buttons
  (`.channel-resource-chips`), each button one line (`white-space:nowrap`). Column
  widths come from the content (`.channel-resource-col-*` minimums; Cost and
  Behaviour on one line); the table fits 1600px with no inner scroll and wraps
  inside its box below that. A row's name carries the
  resource's warm colour
  (4px stripe and dot) and a hover wash, and its footer line is a summary
  of the rows, not a forecast (its Offerings
  column names only the Offerings the card links, "—" for none or for an
  Infrastructure / Workspace card, never "All Offerings"). In
  the Customer Relationship table, an Offering's block starts at the "1."
  of "1. OFFERING -" (the PROFILES: row and the Relationship column's
  cells); the kind word and "PROFILES:" (colon right after, 16px before
  the first link) are caps titles, and the Offering's name is an
  underlined link to it on the Foundation page, like a Profile's name; a Relationship Type's arrow stands under the
  Offering's (the band's 12px inset, the same 36px arrow, its 4px gap),
  and its picker [x], then its Purpose, then "+ Add Relationship Type"
  (from the picker's edge to the x's) start at that number; those cells
  stand 12px apart (the Purpose's label 6px from its box) and the x 12px
  from its picker. The Engagement Strategy
  is two parts (the table's second and third columns): the Journey Stage and
  its Goal / Approach. The stage band (fold arrow, name) and the GOAL (the
  "Goal" label with its "i", then Get / Keep / Grow) are cells of ONE row,
  the Goal centred on the band's 36px line like the stage name (mid-line
  rule), in the band's ground; the Approach (label and text box) follows
  under the Goal in the same column, beside the kind-of-channel lists. Under
  a journey stage, the kind of channel ("Social Media") and its list start at the
  stage's TEXT ("Discover", past its fold arrow and gap): the label's text
  and each bullet's left edge stand on that x. A stage's fold arrow folds ONLY
  those kind-of-channel lists; the Goal and the Approach stay (a folded stage
  keeps one row, with the Approach in the second part). Every Journey Stage band
  STARTS FOLDED (the item folds, `useItemFolds`: closed until opened; the choice is
  kept for the session as the other item folds are).
  The Segment card has NO head row of its own: its fold arrow (which still
  folds the whole card) stands in the card's arrow column next to "1.
  SEGMENT", the first reference column's heading, and the card's body
  (the references, then the two sections) starts at the body edge, as under
  any head. The references stand straight on the card in no box and have no
  Show / Hide button: three columns, 12px apart (`--space-column`), SEGMENT
  (the card's number before it, "1. SEGMENT", number then word at the 8px
  head gap), PROFILES and OFFERINGS, all caps titles, headings on one line
  and baseline; every arrow, the Segment's too, starts folded. Each column
  has ONE left edge: its title's text ("1." / PROFILES / OFFERINGS), every
  link's text and every details block's text (headings and paragraphs)
  start at it. Each link's fold is the ordinary 36px fold arrow at the RIGHT
  of the link's text (8px after it, centred on the link's FIRST line; if
  the name wraps it stays on that first line, at the link box's right edge,
  and never follows the name or the unfolded details down). Its right edge
  never passes the column's right edge, which is 12px (`--space-column`)
  short of the next column's hanging rule (the last column, Offerings: 12px
  short of the Segment card's right side, inside its border -- the same
  12px rule): the link is at most the column less `--reference-arrow-room`
  (36px + 8px) and wraps inside that. Not an arrow in front of it,
  so no arrow column is reserved; the details stand directly under the link,
  and their vertical rule is not content: it hangs 12px before the text
  edge (the Segment's in the card's arrow column; the Profiles' and
  Offerings' in a 12px strip reserved in their tracks). The three contents are equal in
  width, the columns 12px apart. Folded, the card is one row: its arrow, "1. SEGMENT" and the
  Segment's name (so it stays identifiable); its accessible names are the
  arrow's "Segment N" and the card's group name "Segment N: name". In an Action list the x (32 x 32) is pinned to the box's right
  edge on every row, 6px in from the top and right; the row's
  symbols stand under it (see Action markers).
- **Action markers** (Customer Channel, `ActionMarkers.tsx`, `ActionOrder.ts`,
  `numbered-list.css`). SHAPE says the kind of tie, COLOUR says which one.
  A SHARED symbol (link icon) stands on every row of an action placed in more
  than one row; a LINKED-TO-RESOURCE symbol (tag icon) on every action linked
  to a resource (a resource's own card has NO symbol: its summary line says
  "no actions", "action" or "N actions" in words). Each shared action takes one of
  six COOL hues (`--shared-hue-1..6`: teal, blues, violets; position among the
  Segment's shared actions in table order), each resource one of six
  WARM hues (`--resource-hue-1..6`: amber, orange, rust, red, rose, pink;
  position among the Segment's linked resources), as `.tint-shared-N`
  / `.tint-resource-N` (global.css; the card-family tokens `--tint-ink`,
  `--tint-mark`, `--tint-ground`, `--tint-wash` from `--theme-*`, never a
  per-theme value). Glyphs and lines >= 3:1 and chip text >= 4.5:1 in light,
  sepia and dark (greens are left out of the palettes: they fall under 3:1).
  PAST SIX the hues come round in a PATTERN with a contrasting second colour
  (`--pattern-alt`, colors.css: dark ink in light / sepia, light ink in dark, >= 3:1
  on the surface, as every hue's ink is; `actionPattern.test.ts`): the 7th to
  12th place in diagonal 4px STRIPES (`.tint-pattern-stripes`: the hue against
  `--pattern-alt`, repeating-linear-gradient 45deg, 4px bands), the 13th to 18th
  in a CROSS-HATCH (`.tint-pattern-hatch`), then round again (`markHue`,
  `markPattern`, `markTint`, `connectionPaint` in ActionOrder.ts; the paint is
  `--tint-fill`). The pattern is on the symbol (a 2px ring of it round the
  glyph), the 4px lines, the resource card's stripe, its chips' left edge and
  the Channel resources table's stripe and dot.
  The same colour is on the symbol, on a 4px CONNECTION LINE inside the action
  cell (shared action: the RIGHT edge, identical on every row it stands in;
  resource: the LEFT edge, one segment per resource, split top to bottom in equal
  parts when an action has two or more; both lines when it is both) and, for a
  resource, on its card (4px left stripe, tinted chips). Never colour alone:
  the shapes differ and every symbol has an aria-label.
  An ACTION LINE is two text lines high at least (70px), and under its list
  number stands its TOTAL ACTION ORDER NUMBER ("#12", small, muted, bottom of the
  cell): the count of the Segment's DISTINCT actions down the table (category,
  channel, stage, line), a shared action numbered where it first appears and
  showing that SAME number on every row it stands in (1..N, no gaps); numbers
  never change while rows are folded or isolated. Typing "#12" (hash and digits)
  in an action line offers action 12 as its one suggestion and Enter or a click
  shares it there (the same action; a number that refers to nothing, or to an
  action the row already holds, offers nothing and the text stays as typed).
  A line left EMPTY disappears when focus leaves it (a moment later, so a click
  beside it is not lost) unless it is the row's only line, which keeps its one
  empty line; Enter still opens a new line to type in. The x (32 x 32) stays 6px in from the top and right and the
  SYMBOLS (24 x 24 hit area, 16px glyph, absolutely placed so nothing moves on
  hover) stand UNDER it: one symbol directly under; two, text of 1 or 2 lines:
  side by side under it; two, 3+ lines: one under the other; two, one line that
  fits with both beside the x: side by side level with it (the list sets
  `data-marks` = under | pair | stack | beside on the row from the text's measured
  size, at a width that does not depend on the placement, so it cannot flip
  back and forth). The text keeps its full width except the 16px (pair) or 48px
  (beside) the symbols need. Pointing at (or focusing) a symbol shows the app's
  tooltip (`.app-tooltip`) ABOVE its ACTION CELL (the line's box), its RIGHT edge
  on the cell's right edge (below the cell only with no room above, still right
  aligned), nowrap, hugging its one line -- "Shared in N places", "Linked to
  <resource>", "Linked to N resources" -- and Escape closes it.
  A CLICK ISOLATES (one at a time; a second click, Escape (consumed, so it is not
  Back) or the note in the title row restores everything and returns the keyboard
  to the symbol; `aria-pressed` on the pressed one): every action line not
  involved collapses (height and opacity, ~.2s, none under reduced motion; hidden
  to the keyboard once shut), the stage rows, channels and categories left with
  none are not drawn (categories folded shut are shown open meanwhile, their fold
  untouched), and EVERY Add button/row of the Segment's table goes (+ Add
  resource, offering, journey stage, channel, channel category, Link an action).
  NOTHING IS CREATED while a Segment is isolated: no creation path works in its
  table (Enter in an action line opens no new line, the Links tick of a channel
  cannot open a new box and its list takes no new line, a click-to-pick "Link an
  action" in progress ends); the text already there stays editable. A CLICK ON
  EMPTY SPACE also restores everything (focus back on the symbol, as the other
  exits): anywhere that is not a control or a cell's content -- the page's
  background, the table's head, a blank part of a cell. A button, field, action
  line (number, text and symbols), resource card or chip, list, tooltip or label
  keeps the isolation; so does a press that began on one and was let go outside it.
  Shared isolation also hides the resource cards and "Costs: ..." lines not linked
  to the action. Resource isolation (from an action's symbol, or the "action" / "N actions" words
  of a resource card's summary line) draws only the isolated
  resource card(s) in the channel cells (no other card, no cost summary), each
  with ALL its actions as chips, the chip of the action clicked from ringed in
  the resource colour and bolder (none, if clicked from the card). The note at the
  title row's far end names everything, wrapping rather than cutting:
  "Shared: Instagram, Pinterest x" (the channels holding the action, in table
  order) or "Linked: Shopify Basic, Klaviyo x". A resource card's chips read
  "#<total order number> <action words>" on one line, ellipsised (the full text is
  the title); typing "#12" or just "12" in "Link an action" finds an action of the
  Segment's WHOLE table -- any channel's, not only the card's own (the exact number first
  and selected, then numbers that start with it, then words); the click-to-pick takes any
  action line of that Segment's table. A resource may so be linked to an action that stands
  only in another channel: its card stays in its own channel's cell and shows in the cell of
  every channel whose rows hold the action. A card shared into another channel's cell reads
  its name and cost, then "via shared action" under them, in words (no symbol): "shared action" is a
  link (the notepad-text-button style of "# Link an action") that goes to that action's line
  and puts the caret in it, the same jump as the "#N" buttons of the Channel resources table;
  shared through several actions it reads "via shared actions #3 #7", one such link each.
  Isolating a SHARED action shows every card linked to it in every channel kept: at home in
  the channel it was made on, "via shared action" in the others. Starting an isolation takes the top of that Segment's Customer
  Channel section (its title row, with the note) to just under the app header
  (smooth, none under reduced motion); ending one scrolls nothing.
  Pointing at a shared row lights its twins, and at a resource card or symbol its
  actions, on the tint's wash.
- **Demand & Conversion** (Customer Engagement): what the block is for
  and where its Expected Sales are used are the points of one "i" on its
  title, not paragraphs around its fields.
  A Customer Source card's fields stand on one row (Customer Source,
  Estimated, then the figure or the calculation's figures), each as narrow
  as it can be: the pickers hug their longest option, a number takes the
  step its largest value needs (XS to six characters, Code to ten), a cell
  gap apart, labels above, tops aligned; a row too long for the card wraps
  from the same left edge (at 768px every type with a calculation does,
  "Other" does not). The Basis stays under them at the card's width.
  Under the sources and their add button, one row: Customers Buy (its
  picker hugging its longest option) and, for an Offering kept until
  cancelled, Cancel / Month (%) (XS), labels above, tops aligned; then
  the Expected Sales, Assumptions and Channels That Bring Them.
- **Additional Legal Requirement card**: Reference or Number | Type on one
  row of the card's two columns, the Type at the width its longest option
  needs.
- **Name / Number list** (`--name-number-columns`): the name the rest, the
  number S (two fifths of a narrow list), the x column. Names wrap and grow;
  the number and x stay on the name's first line. Used by the Legal
  Entity's Formation & Registration and Tax & Business Registration, so
  their Number columns share one x. Column heads head only the rows the user
  adds; rows that name themselves (the tax number, VAT) have none.
- **Founders table**: Name the rest (wraps and grows), Ownership % the XS
  step, Capital the Code step, the x column on every row, `--space-cell`
  apart. Heads are field labels, on one line, centred over their figures
  ("Ownership %" is wider than XS and reaches into the gaps beside it).
  Total Capital, then the Total Ownership badge, under the table from its
  left edge. A block per founder under 700px.
- **Side-label row snapped to the grid** (`.legal-entity-side-row`): a row
  of fields whose labels sit beside their controls on the columns of the
  list below (a subgrid): each label at its column's left edge, its control
  filling the rest of the column (so it ends where the column ends), labels
  on the controls' centre line. Where a column cannot hold its label and
  its control's longest value, the labels go above. Status | Date on
  Formation & Registration. The Status field's left edge (its label, then
  its picker) is the card body's left edge, so the "Status" label aligns
  with the "Authority / Name" label below it; the label stands
  `--side-label-gap` (12px) before its picker, which hugs its longest
  option (never truncated).
- **Capability cards: short side labels** (Business System, 3. Infrastructure &
  Capability). Frequency on a Resource card (at Costs) and Responsible on a Partner /
  Provider card are `BusinessField side` rows (an Activity's Responsible keeps its own
  side label, and a Partner / Provider's own Frequency is unchanged: its label above its
  dropdown, beside the Price): the label in the one short column (`--side-label-short`,
  164px, the width of the tick, "Responsible" and its "i"), `--side-label-gap` (12px), then the
  dropdown, which HUGS its longest option (the hug exception), the label centred on the
  dropdown's centre line (`align-items:center`). The two dropdowns therefore start at the
  same x (the card body's left + 164 + 12). A Resource's Frequency row spans the fields
  under Qty | Price | currency; a Partner / Provider's Responsible row spans the card's
  fields under its Price | Frequency pair; under 340px (the fields' own box) the label goes
  above its dropdown. A Partner / Provider's field is labelled "Responsible" (its field key
  is still "responsibility"); a Strategy Objective's Responsible is this same row. In an
  organization with exactly one founder the Responsible / Responsibility field is NOT shown
  at all -- on an Activity, a Partner / Provider and a Strategy Objective: no label, no
  text, no empty row (a folded Activity does not name him either); he is still responsible
  where it is read (`businessAutoResponsibleId`, `businessPartnerResponsibleId`,
  `strategyObjectiveOwnerId`: documents, exports, Review). With several founders or none it
  is unchanged.
  **The Responsible tick**: with two or more founders the Responsible / Responsibility label
  carries a tick box NEXT TO it (`BusinessField tick`: `label.business-foundation-tick` =
  the `brand-tick-box` then the label's words, centred on the label's first line; the "i"
  after the label, outside it), ticked by default. The tick, the words and the "i" are ONE
  line (`white-space:nowrap`; the "i" 6px (`--info-gap`) after the last word, all on one centre line), in the
  short side-label column beside the dropdown and in a stacked narrow card alike, never split
  across lines. Unticking removes the field for that card
  (an Activity, a Partner / Provider, a Strategy Objective): the dropdown goes, the tick and
  the label stay so it can be ticked again, the stored choice is cleared and
  `responsibleOff: true` is stored on the card (the key absent = ticked, so no stored answer
  changes). An unticked card means "no responsible by choice": it is not flagged in Review /
  Open Items, the sole-founder / single-Performer rules do not attribute it (`responsibleIsOff`,
  read through `businessResponsibleId`, `businessPartnerResponsibleId`,
  `strategyObjectiveOwnerId`), and exports / documents leave it empty. With one founder there
  is no field and so no tick.
  Offering's Capability › 1. Resources and 2. Activities lay their cards out in
  **independent columns** (`CardColumns`, `.card-columns` / `.card-column`): as many columns
  as fit (each at least 410px wide; Activities at most 2), recomputed from the container's
  width (ResizeObserver); card i goes to column (i - 1) mod N, so the numbering still counts
  across -- 1 2 3, then 4 5 6, card 4 under card 1 -- and each column is its own vertical
  stack, tops aligned, `--space-card` (12px) between cards and columns. Opening or closing a
  card moves only the cards below it in ITS column (no grid row couples the heights). The
  DOM, so the tab order, runs column by column. Active / Completed lists distribute
  within themselves; "+ Add ..." sits under the columns.
  **Folded Capability cards are one fixed size** (Resource, Activity, Partner / Provider:
  `fixedFolded`, `.fold-card-head-fixed`): the name on ONE line cut by an ellipsis (the full
  name is its tooltip) and the summary on one line under it, cut the same way and kept when
  empty, so every folded card in a list has the same height. Open, the name box wraps and
  grows as on every card.
  **4. Delivery cards** carry no static paragraph: the explanations sit in "i" notes (on
  "Working Hours per Unit, by person" and on the capacity line). Delivered, Hours Given and
  Calendar Time are side-label rows (`BusinessField side`, one label column wide enough for
  "Calendar Time (weeks)", the control hugging, one centre line; the label above in a card
  narrower than that), a person's row is [name ... hours box] with the XS boxes on one right
  edge and the box on the first line's centre of a wrapped name, the Total under the rows
  and the computed panel (compact labelled lines, 12px padding) 12px apart (the effort stack).
  A person's hours box has no unit after it (its name says hours).

### Body order

Fields follow the order a founder answers them: what it is, then where,
then the details. On the Legal Entity page every section box is half the
page, in pairs: 1. Organization | 2. Founders & Ownership, 3 | 4, 5 | 6,
each as tall as its own content, stacked under 1100px. The Organization
section is two columns `--space-cell` apart: "what it is" reads Organization
Name, Main Activity, its activity code (always a tick row, as the VAT tick,
exactly 12px under the Main Activity box, unticked or ticked -- the row is as
high as its content, so unticked just the tick, and the column's own 6px label
gap plus a 6px margin make the 12px; only while ticked its box (45px high)
stands beside the words, the tick and its words on the box's centre line, the
Code step wide (six digits fit), at the column's right edge; a saved code
loads ticked),
Legal Form (the column's width: every UK
and US form reads in full; the longest, 57 characters, fits from a 1366px
window, and a closed picker too narrow ends in "..."); "where it is" reads
Country, State / Region (where the country has one: it decides which
registry and tax apply), then the Address: one box of lines, its
placeholder the lines expected in the country's words ("Street", "City",
"Postcode" / "ZIP Code" / "PLZ"; no postal line where addresses carry
none).

---

## 5a. Section tiles and dialog

3. Business System › Infrastructure & Capability draws its sections as
**tiles** (`SectionTiles.tsx`, `section-tiles.css`); the section itself is
drawn only in a dialog that its tile opens.

- **Tiles.** A true square, `--section-tile-size` wide and high
  (`aspect-ratio: 1 / 1`), one size in every group of a card. The size is
  **derived from the width the tiles have**, in CSS (no script): each group
  sits in a `.section-tiles-box` (`container-type: inline-size`), and
  `--section-tile-size` = (`100cqw` - gaps) / the number across, never under
  `--section-tile-min` (120px) and always counted as at least three across, so a group of up to three keeps the
  three-across size (about 215px at 1600px wide, 190px at 1366px) and one of four or more across shrinks to fit. The
  cards have no head and nothing in them folds, so there is no body indent: a 3 x 3 set exactly fills the card's content width.
  **Tile anatomy** (the tile is a two-row grid: the title's row and the rest): the title (with its rule) stands **one line above** the line one
  third down the square: its **last line is centred one line (`--tile-title-lift`, 1.45 x the title's own font size: 26.1px at 18px, 20.3px at 14px) above
  the third-down line** (`--tile-title-top`; the title's row is that third less the border, plus the rule and half a line; the lift is the title's bottom
  margin, so the list under it keeps its place and the gap from the rule to the list is a line wider), whatever the number of lines -- a long title grows upward --
  **underlined** by a rule of its own (a 1px bottom border on the title element, in the title's colour at 40%, 4px under
  its last line), at most three lines (fewer where the room above the line holds fewer) then an ellipsis. A title too long for the room
  above its line (first line at least 12px from the square's top) drops to `--font-small` (14px), **that title only**
  (`TileTitle` measures it; the tile takes `data-title-small`). Under the rule, **12px** down (`--space-card`; the list moves up with the lifted title: `TileTitle` writes the tile's lift into `--tile-lift` and the list's top margin is `12px - --tile-lift`, so the gap from the rule to the list is 12px whatever the lift or the title's size),
  the **list of what the section includes** (`TileList`): small text (`--font-small`), `--text-muted` (5.56:1 at the
  least, sepia), the app's drawn bullet, one line per item cut by an ellipsis -- an item whose text carries a forced break (`\n`: "Cooling & Air" / "Conditioning", "Online Presence" / "& Communication", the only two) is TWO lines, each cut by its own ellipsis, the bullet on the first, and the text hangs under the text, not the bullet -- as many lines as the room holds and then
  "+N more" as the last line (no bullet); a block as wide as its longest item (at most the tile's inner width, 12px in
  from each side), **centred under the title**, its lines left-aligned inside it; on a page tile every item is a real control (see
  "The page tile's slot"), and the tile's **accessible name** says it again: the title and the first six items joined by commas, cut at about
  140 characters ("Utilities, Electricity, Internet, Heating & Gas ..."). What each tile lists: the Founders tile each founder
  with their names alone, the Workspace tile its type or "Not set", Utilities / Workstation /
  Equipment / Digital Infrastructure their subcategory names, always (an added one too, and a subcategory that holds no card yet), an Activities tile its active
  activities, the partner tiles their partners and providers, Offering's Capability's tiles the names of their cards
  (Delivery: the Offerings), a subcategory box its cards' names. An EMPTY section (no cards yet) that has the "+" box shows no list and no glyph, only the box (the tile is still described as "No items yet"); an empty box WITHOUT a "+" box (a subcategory box in a dialog) keeps the small "+" (24px,
  `--font-h3`, the title's colour, decorative) where the list would be. Founders, the Workspace and Delivery are not lists of cards and never show either. Measured at 1600 x 1000 (tile 214.9px): a one-line title (18px) tops at 32.8px, its rule is at 63.6px (last line centred 45.5px) and the LIST STARTS AT 75.6px -- 12.00px under the rule; a title that drops to 14px ("Digital Infrastructure"): top 41.5px, rule 66.5px, list 78.5px, still 12.00px; the three-line "External Professionals & Partners" (14px) tops at 21.2px. At 1366 x 800 (tile 190.5px): 24.7px / rule 55.5px / list 67.5px, and 13.1px / 58.4px / 70.4px for the small ones: 12.00px every time.
  The title is the body size (18px), weight 600 and the button tracking (0.1em); the type scale is `--font-small` 14px,
  `--font-body` 18px, `--font-h3` 24px, `--font-h2` 28px, `--font-h1` 36px (see "Title sizes"). The longest word
  ("Infrastructure", 145px at 18px) fits a tile from about 171px wide; in a narrower tile a long word breaks inside the square
  (`overflow-wrap: anywhere`). **An "&" never ends a line**: in every tile, box and founder-box title it is joined to the word
  after it with a no-break space (`drawnTitle()`, drawn text only; the button's accessible name is the plain title and list).
  **No stroke and no border:** a box has no border at all (`border: 0`; the padding takes the pixel the border had, so every position inside it is where it was); its edge is an inset light from the top
  left and an inset shade to the bottom right (`--box-inset`: `inset 3px 3px 6px --box-light, inset -3px -3px 6px --box-shade`, per theme). The ground is the card's inner ground in the hue of
  the card the tile sits in; radius 8px (a card's). Hover keeps a 4px soft glow beside the inset; focus a 2px primary outline. The dashed add boxes keep their own edge. **Why no border:** a transparent 1px border left a hairline of the plain ground OUTSIDE the inset shadow (an inset shadow is drawn inside the border), light where the shade is and dark where the light is -- a thin line around the box in the opposite tones. Measured (luminance across the Utilities tile's four edges): outside 241 -> 240, 239, 236 ... 228 at the left and the top, 228 ... 202, 213, 241 at the right and the bottom -- one smooth step each, no line.
  Where a title still does not fit, it is cut after as many lines as stand above its line.
  Reactions: see "The page tile's slot" below and section 6.
- **The page tile's slot** (`TileSlot` in `SectionTiles.tsx`). A tile on the page is a SLOT -- the grid item, the tile's size -- that holds, all INSIDE the
  square: the tile's own button (the square: title, rule, the "+" of an empty section; its press opens the section's dialog), the **list of what it
  includes laid over the square** (`.section-tile-links-layer` on the tile's own rows, so the list stands exactly where it stood inside the
  button) and, on some tiles, the "+" box. A button cannot hold buttons, so the list is not inside the tile's button; it is a sibling over it, the
  layer taking no pointer events and its buttons taking theirs: a click on the tile outside an item is the tile's own. (The dialog's boxes --
  subcategory boxes, card boxes -- are plain buttons as before.)
  - **List items are controls.** Each item that leads somewhere is a `button.section-tile-link` (focusable, its own accessible name = its text),
    underlined under the pointer and the focus (`text-decoration-color` from transparent to the text colour, offset 3px; focus: a 2px primary outline
    inside the row). Pressing it opens THAT item ALONE as a **floating card** (see below): a founder's name that founder's card, an activity /
    resource / partner / provider the card's editor, the Workspace's item the Workspace form. A subcategory name (Utilities > Electricity ...) opens its ONE card alone, floating, when it holds exactly one; the section's dialog ON that subcategory when it holds several (a grid is not a card; Back returns to the boxes); and, empty, the dialog on it, where a blank card is made and waits (the first-open rule). "+N more" opens the section's dialog. Delivery's
    list stays plain text, hidden from assistive technology, as it was.
  - **The reaction (hover).** Under the pointer ONLY -- not with the focus: a tile that holds the focus has its ring, it does not grow -- the whole slot grows to **150%**
    (`transform: scale(1.5)`, `transition: transform .15s`, none under `prefers-reduced-motion`): no layout change, the other tiles stay, the grown tile is
    above them (`z-index: 6`) and overlaps them, and a drop shadow grows with it (`0 10px 22px --shadow-18` and `0 3px 8px --shadow-12`, scaled with the tile).
    It grows INWARD from the corner it stands in: the left column from its left edge, the right from its right, the middle from its centre; the top
    row from the top, the bottom from the bottom; a single row or column from the centre (`scaleOrigin()`, set ONCE when the pointer arrives and never again while it stays: the slot is measured as it rests -- its scale and transition switched off for the measure -- on `pointerenter` / the first `pointermove`, and forgotten on `pointerleave`). **The bug this fixed:** a press on a list item moves the focus, and the old code measured the slot again on focus, with the tile already at 150% and the transition's first frame still the grown one; it took the grown tile for its size, set another origin and slid the tile (40.8px at 1600 x 780) between the press and the release, so the click never landed -- only on the tiles whose origin is moved to keep them inside the card, i.e. the first row of Offering's Capability in a low window and Infrastructure's Activities near the foot of its card. Where the card is
    too narrow for that (the grown tile would leave the scrolling body of its card) the origin moves toward the centre by exactly as much as it takes, so the
    grown tile is always inside the card's body (measured at 1600 x 1000 and 1366 x 800 for every tile of both cards: 322 x 322 for a 215 tile, inside the
    card on every side). The text inside grows with it (it is a transform of the whole tile). This does NOT apply to the boxes in a dialog. Hovering the "+" box
    or a list item is hovering the tile. **Closing returns to the default page:** after a dialog or a floating card closes (Escape, Back, a click outside) no tile is grown even if the pointer rests on one (`data-tiles-settled` on the root, until the pointer moves 3px), and the focus comes back to the opener WITHOUT a ring after a mouse click (`data-focus-quiet`, until the keyboard is used); after the keyboard (Enter) it shows its ring, and still no tile grows. The real-mouse check (`checkRealMouse` in `run.mjs`) presses every list item of every first-row tile at the top of the page in a tall and a low window and tests all of this (the old code fails it with 38 failures at 1600 x 780).
  - **The "+" box** (`.plus-box`, on a page tile `.section-tile-plus`) is on the tiles that take new cards, and only on them: Infrastructure's Operational, Production, Marketing, Sales & Customer
    (and any category tile the founder added), Partners and Suppliers, **Utilities, Workstation, Equipment and Digital Infrastructure**; Offering's Capability's Resources, Activities and Partners & Suppliers
    (one "+" for the tile: it adds a partner). NOT on Completed (either), Founders, Workspace, Delivery or a channel tile.
    A 36px square (radius 8px) at the tile's LOWER RIGHT, 12px from the edges; the list keeps clear above it (the layer's bottom padding grows by the box and 5px). The "+" is two 2px bars 16px long drawn from the
    middle of the box (`::before`, `::after` at `top/left: 50%`, `translate(-50%, -50%)`): no glyph of text, so its centre IS the box's (the bars' computed centres equal the box's to 0.01px; the ink, measured on a screenshot, is
    within 0.5px). **A swap of two colours** (150ms): at REST it is TRANSPARENT (a wired button: an outline and a symbol, no fill; it takes the colour of what it stands on, `--plus-ground`: the tile's, the card's) with a 2px stroke and the "+" in the darker tone of the hue (`--plus-fill`:
    36% saturation, 38% lightness; the lighter tone in dark); under the pointer or the focus it is FILLED with the darker tone, no stroke (the border turns transparent: the fill shows under it, nothing moves) and the "+" is the ground
    colour. No growth of its own: the tile grows around it. The "+" against its ground is 5.88:1 (light), 6.43 (sepia), 5.28 (dark), the same in both states. Named `Add <Item> to <tile>` ("Add Activity to Operational", "Add Resource to Utilities").
    Pressing it adds a blank card of that tile's kind at the END of its list and opens it as a floating card, its Name focused; left completely blank it is removed again, as on first open. **On a resource group** it makes the
    resource in the group's own "Other" subsection -- the first one the founder added, or a new one, unnamed (it reads "Unnamed Subsection" until named, as the dialog's "Add Other" makes it) -- and a blank card left behind is removed together
    with the subsection the "+" made for it. The same box at the x's size (`.plus-box-small`, 32px, bars 14px) is the Activity card's Add Performer (below). The small "+" glyph of an empty tile is gone from every tile that has the box.
- **Floating cards** (`FloatingCards`). One card alone, or a parent and its child stacked (below), in a portal over the dimmed, inert page: a `role="dialog"` `aria-modal`, each card in an opaque ground (the page card's own, in the hue
  of the card the tile stands in) with a **drop shadow** (`0 24px 56px --shadow-18`, `0 8px 20px --shadow-12`), a "← Back" button under the stack. **The page behind is only dimmed**: a flat scrim (`--floating-scrim`, black 60%) -- no blur, no lifted
  brightness, no inset light or shade on the page behind (those are the grouped boxes' own); the dialog keeps its own glass ground, which the user asked for (the 80%-transparent ground below). Back, Escape and a click on the dimmed space close
  it (an open picker or "i" takes its own Escape first); the focus returns to the control that opened it (once the page is no longer inert: after the render; quietly after a click, see the reaction). **The box name above each card:** a centred caption, 12px over the
  card, outside it -- the name of the tile or box it belongs to ("Operational", "Providers", "Founders", "Workspace"; a child's: its tile's) -- as plain title text (`--font-h3`, bold, `--floating-caption-ink`, white) on the backdrop, not in a cell, box or
  input, **with the box's "i" after it** where the box has a note (the same note its dialog's header carries; the Workspace's, which has no dialog header, is only here). Contrast of the name on the scrim, over the worst pixel of the page behind it
  (measured with the text hidden): light 6.26:1, sepia 6.31, dark 19.1.
  Width: any card 480px (`--open-card-width`, at most the window less 16px), a founder's `--founder-card-min` (297px), the Workspace form its own (364px). **Placed on the first row:** the TOP of the first card stands on the top of the first row of tiles of its
  page column as the page rests (scrolled up) -- that row's top now plus how far the column's body is scrolled, so the same y however the page was scrolled -- and the box name stands above that line (over the column's first heading); horizontally it is centred over the
  card of the page it belongs to (Infrastructure's or Offering's Capability's rectangle; the Workspace over the tile group of 1. Resources). A taller stack extends downward and, once it would pass the footer, scrolls inside itself (the captions and the cards
  scroll; the Back button stays in view under them, never over a card); it is kept 8px inside the window. Where that first row is out of view -- the cards stacked under 1100px and the page scrolled -- the stack stands at the top of the band instead (8px under the page heading's underline, never lower than 200px above the footer). jumpTo / Review / search / the Financial links to the Workspace press its tile, which opens the form alone.
  Measured at 1600 x 1000: every card of a first-row y 282.3 (the Founders / Resources row's top), its caption 12px over it; a founder's card 297 wide, centred on the Infrastructure card's x 447; a provider card over the Offering's Capability card's centre.
- **A status and the activity it creates: PARENT -> CHILD.** A resource (or the Workspace) whose Status is "Needs Activity" or "Needs Investigation" has ONE child activity (its `sourceId` is the parent's
  id; the same two statuses as before). The tie (`syncDerivedActivities`, applied on every render and written back):
  - the child's name follows the parent's ("Investigate <name>", "Set up <name>") and is not the user's: the child's card has **no name cell and no x** -- its number and its name stand as plain text where the cell was (the same metrics, the x's place left empty so a long
    name wraps where a cell's would), the **name a link** to the parent card (`.business-capability-child-name`: `--text-primary`, underlined and bolder under the pointer and the focus; `aria-label` "Activity 1 follows <parent>: open it"); the old line under it
    ("Follows ..., its Status asks for this. Open it") is gone;
  - when the parent's Status becomes anything else, or the parent is deleted, the child is **removed**;
  - the parent shows ONE line under its Status, always while the child exists: `Open Activity “<child name>”` (the quoted name is the link). When the child holds details of the user's (a description, a performer or responsible other than the only
    founder it was made with, the Responsible unticked, Completed ticked: `activityHasDetails`) the line is an ALARM (`.business-capability-alarm`): under the pointer on the Status cell it turns bold -- a `text-shadow` (`--hover-bold`), 150ms, so no letter
    moves; without details it is the same line without the alarm (`.business-capability-activity-line`). The old second line ("Recorded under 2. Activities as ...") is gone from a resource's card;
  - a link either way opens BOTH as floating cards, stacked: the **parent above the child**, 12px apart (each with its own box name above it, the caption of the child 12px over it), on one centre line, the parent's top on the first row's top; whatever was open gives way; Back or
    Escape closes both; if either is gone (the Status changed in the open parent) the pair closes.
  The Workspace is the parent of the same tie but its form is FROZEN: it gets no link line (its own line "Recorded under 2. Activities as ..." stays as it is, in the form); its child links back to it.
- **Tile grids: ONE SHAPE.**- **Tile grids: ONE SHAPE.** Every set of tiles, subcategory boxes and card boxes takes the same shape
  (`gridColumns(n)`, mirrored by the probe): **one to three in a single row, exactly four as a 2 x 2 square, five or more
  in TWO rows** (`ceil(n / 2)` across, the last row possibly shorter). On the page the groups are left-aligned, 12px apart every way,
  the tiles square and never stretched, a group too narrow for its row wrapping to fewer across: Infrastructure ›
  1. Resources: six tiles, 3 x 2 (Founders, Workspace, Utilities, Workstation, Equipment, Digital Infrastructure), with no
  "Organizational / Operational Resources" headings and no rule down the left; 2. Activities: Operational, Production,
  Marketing, Sales & Customer as a **2 x 2 square** (a category the founder added earlier is one more tile while it holds
  activities: five tiles are 3 x 2, six 3 x 2, seven 4 x 2 ...) and the grey **Completed** tile (below); 3. Partnerships &
  Providers: Partners, Providers (one row of two). Offering's Capability: Resources, Activities,
  Partners & Suppliers, Delivery as a 2 x 2 square; with channel tiles 5 or 6 tiles are 3 x 2 and 7 or more two rows with more
  across (4 x 2, 5 x 2 ...; each channel tile after its category). Where the old rule ("up to 3 x 3") gave another shape:
  the Activities group with five categories or more was a column of two across (three rows) and is now two rows; Offering's
  Capability with seven or more tiles was 3 x 3 and is now 4 x 2 or wider; Offering's two partner kinds in a dialog were a column
  of two and are now a row of two.
  **The declared exception: the tail tile.** Infrastructure's grey Completed tile is not counted in the shape of the categories
  (`SectionTile.tail`, `tailPlacement()`): it takes the first free cell of the categories' LAST row, beside the last one; with
  the 2 x 2 square (a full last row) in a third column of that row, **right of "Sales & Customer"**, the first row's third cell
  empty, same size and 12px gap; with three across or more and a full last row, on a new row under the first column. Its size
  is the others'. Infrastructure's three sections keep their heading (number, title, "i") as a PLAIN heading of
  `--section-head-height` (36px) over their tiles: **no fold arrow and no fold behaviour, and no "Expand all"** on them (the
  tiles are the grouping). Offering's Capability holds its tiles directly, under a heading-height **spacer**
  (`.business-capability-heading-spacer`, `aria-hidden`, the same 36px and 12px as Infrastructure's first heading, no text: the
  column title is the card's label), so the first tile row of both cards starts at one y.
- **The two cards.** 1. Infrastructure and 2. Offering's Capability stand
  **side by side**, each in one of the page's two equal columns
  (`--space-column`, 12px, between them), tops level, each as tall as its
  content; each card takes the page's 13px side padding on its outer side only,
  so they are equally wide and never overlap. Only when the page (`page-card`
  container) is under 1100px wide are they stacked, Infrastructure above
  Capability, each the page's full width (nothing then to line up across them).
  **The column title is the card's one label and its first row** -- "1.
  INFRASTRUCTURE", "2. OFFERING'S CAPABILITY" (the `answer-column-label` caps
  title, `--font-h3`, centred) -- inside the card: the card has **no head row of
  its own** (no fold arrow, no second "N. Name" label, no "i"; the page's
  guidance says what the old "i" said). Vertically, inside a card: padding 12px,
  the title row, 12px to the first section heading (Infrastructure) or the
  heading-height spacer (Capability), 12px from a heading to its tiles, 12px from
  the tiles to the next heading, 12px to the card's end -- all box gaps, a
  section heading (36px) being the shared height. Measured at 1600px: the title
  row 12px under the card's top edge, its first tile row 277px from the page top
  in both cards, tiles 214.7px, gaps 12px.
- **The label arrow and its drop-down help.** This page has NO "Hide Help" /
  "Need Help?" button (`Conversation.tsx` passes the page's `titleHelpArrows`
  condition; the other pages keep theirs). Each card title has a **label arrow**
  (`LabelArrow.tsx`, `label-arrow.css`, drawn by `CardTitleHelp.tsx`) after its text
  and its "i", 8px from the previous item of the title row, centred on
  the title's line: pointing right while the title's help is hidden (the default),
  down while open. It is NOT the 36px fold arrow: it is the label arrow (see "The
  label arrow"), a triangle the title's size (`--label-arrow-size: var(--font-h2)`),
  its hit area never under 24px (28px at this title), `aria-expanded`, `aria-controls` and the
  name "Show help for <title>" / "Hide help for <title>"; keyboard operable;
  an outline at rest, filled under the pointer and the keyboard focus (no ground, no ring). The help is a **drop-down
  panel** (`CardTitleHelp.tsx`): absolutely positioned under the title row
  (6px, `--space-label`), the card content's width, the help box's ground
  (`--bg-help`, no stroke) with a shadow, `z-index: 20` above the tiles -- it
  takes no room, so nothing below it moves. One panel is open at a time (opening
  the other title's closes it); it closes with its arrow, **Escape** (the key is
  consumed, so it is not the page's Back; the focus returns to the arrow) or a
  press anywhere outside the title and the panel. The open state is view-only
  (never saved; there is no saved help state on any page: the old "Hide Help"
  was `useState(true)` in `Conversation.tsx`, also unsaved).
- **Channel tiles.** A card a Customer Channel made ("+ Add expenses" on a
  channel: a Resource in Offering's Capability › Resources linked by
  `engagement.channelResources`; a partner or provider so linked) is NOT
  among the user's own cards: it has its own tile in its category, next to
  that category's tile, in a hue of its own (`CHANNEL_TILE_HUE`, the
  palette's teal, apart from the Infrastructure rose and the Capability
  terracotta; the tile, its dialog and the cards inside take it through
  `--strategy-theme-hue`): "Channel resources" after Resources, "Channel
  partners" after Partners & Suppliers. A tile is drawn only when the
  category has such cards (never empty); it has no "+ Add". Inside, the cards
  are the same cards (same editor, same columns) and each keeps its
  "For channel: ..." line with the way back to its channel. A card of
  Infrastructure linked from a channel stays in Infrastructure.
- **Dialog: ONE frame, the page's width, between the page heading's underline and the
  footer.** `role="dialog"`, `aria-modal`, named by the section (the tile's title,
  `aria-labelledby`; "Utilities, Electricity" while a subcategory is shown), over a dimmed
  overlay, the page behind inert. EVERY dialog (Founders, Workspace, Utilities, Workstation,
  Equipment, Digital Infrastructure, Activities, Partners & Suppliers, the Capability
  sections, the channel tiles) has the same frame: its vertical extent is the space between
  the **underline of the page heading** (`.interview-divider`, never above the fixed app
  header) and the **footer** (`.workspace-footer`, the fixed 64px band at the bottom of the
  window that holds "← Back"; its top edge), and it is as wide as the page's **card area**
  (`.conversation-card`, the width the two page cards share: 1400px at 1600, 1254px at
  1366, at most 92vw), centred across the window. There is no square dialog and no wide
  exception any more (the tiles and the subcategory/founder boxes stay true squares). Measured at
  1600 x 1000: 1400 x 775px, top 161px (the underline) to 936px (the footer's top); at
  1366 x 800: 1254 x 575px. It is measured when it opens (`dialogFrame()`,
  `SectionTiles.tsx`) so the text boxes inside lay out at their final width, and again when the
  window is resized; without those lines (a test, a page without the heading) the CSS
  fallback is the least of 92vw and 1400px wide, 88vh high, centred. It scrolls inside its
  body only, when the content is taller. It holds the section's own content, unchanged: its
  heading and "i" notes, "Expand all", its cards fully editable, the same folds. The
  **Back** button ("← Back") stands at the lower left, always in view below the scrolling
  body; **Escape** does the same and nothing else (the key is consumed, so it is not the
  page's Back; an open list or "i" inside takes its own Escape first, and an inner view -- a
  subcategory, an open founder box -- is left before the dialog is closed); a **click on the
  dimmed backdrop** (outside the dialog, on an empty space) closes the whole dialog -- a
  press that starts inside the dialog (a text drag) and ends outside never does, a click
  inside never does. One dialog at a time. Opening is view-only state, never saved.
- **One ground for every dialog and its cards (glass).** The dialog's ground is its
  card's own (the hue of the card it opens from: Infrastructure rose, Capability terracotta,
  channel teal -- the only thing that differs) made 80% TRANSPARENT and BLURRED: the ground at
  `--dialog-ground-alpha` (20%) over the dimmed page, `backdrop-filter: blur(--dialog-blur) brightness(--dialog-backdrop-brightness)`
  (14px; the page behind lifted by 1.7 in the light and sepia themes, 1 in dark), the card's edge colour,
  `box-shadow: 0 16px 40px`, padding `--card-padding`.
  The cards inside any dialog (`.section-tile-dialog .business-foundation-card`) use the same
  glass one step on, unchanged: the inner tint at `--card-glass-alpha` (62%), blurred
  `--card-glass-blur` (8px), the same edge -- one rule, not per-dialog colours. **Contrast:**
  text on the glass is held at 4.5:1 or more against the WORST ground, measured on the real page: the dialog's text is hidden
  (colour transparent), a screenshot is taken, and the worst pixel under each text's rectangle is read against the text's
  colour (Founders with Responsibilities unfolded, Utilities > Electricity, Operational, Completed, Offering's Resources; 68 / 11 / 17 / 9 / 23 texts).
  With the ground at 20% and nothing else the least was 2.56:1 (light, the muted crumb "Electricity"), 2.56 (sepia) and 3.12 ("Active 3", sepia): the
  dimming of the page (35% black) and the dark smears of its text behind a transparent ground are too dark for muted and red text. A NEUTRAL SCRIM (the
  page's own ground) between the page and the dialog would have to be 60% (light) to 70% (sepia) opaque, which makes the dialog three quarters opaque, so
  none is used: the page behind is LIFTED instead (`brightness(1.7)`, which undoes the dimming), the ground staying 80% transparent. Result, the least
  per theme: **light 5.67:1** (the muted crumb "Electricity"), **sepia 5.56**, **dark 7.34** (dark needs no lift). Raising the blur or lowering an alpha
  needs that table redone.
- **The dialog header.** The section's heading is the dialog's title (title style, `--font-h3`, 24px); the views opened inside the
  dialog follow it ON THE SAME LINE after a slash -- "6. Digital Infrastructure / Software / Xero accounting", "Activities / Completed /
  Finished one", "1. Founders / Maya Chen" (`DialogHeading`, fed by `useDialogInnerBack`): the slash 8px each side after the root title and
  6px each side inside the trail of views, the names the body size (18; a size under the root title), regular weight, `--text-muted`, one line high; a long header cuts the names with an ellipsis (the full name is the tooltip) and keeps
  the "i" after them. The "i" is the nearest note along the way (the subcategory's, else the title's). There is no separate subtitle row: a
  fixed subcategory has no head row of its own (an added "Other" subcategory keeps its name box and its x). The accessible name is
  "Title, Subtitle, ..." (the names joined by commas).
- **Content centred, at the top.** What a dialog holds -- a grid of tiles or boxes (its boxes left-aligned inside their own block, the block
  centred), the opened card, the Workspace card, a founder's cards, an empty message -- is **centred across the dialog and starts at its top**
  (12px under the title row), never in the middle of its height; what is taller scrolls in the body. The title row keeps its place at the
  dialog's left.
- **Subcategory boxes.** A section with MORE THAN ONE subcategory opens, inside its
  dialog, on a grid of SQUARE BOXES, one per subcategory (`SubcategoryBoxes`, the
  section tile component: the same title, underline and list, colour, the "&" rule), in the **one shape** (the add box counts as
  one), the side = (content width - gaps) / columns, **never more than a third of the content width and never so tall that its rows do not
  fit the dialog** (`(dialog height - 160px - (rows - 1) * 12px) / rows`). Measured with Utilities (5 boxes + add = 6, 3 x 2): 301px squares at 1600 x 1000
  (content 1375px), 201px at 1366 x 800; Workstation, Equipment, Digital Infrastructure (3 + add = 4, 2 x 2) the same size; Offering's two
  partner kinds (no add box) are one row of two. They are: Utilities (Electricity, Internet, Heating & Gas, Cooling & Air Conditioning, Water),
  Workstation (Furniture, Electrical, Supporting), Equipment (Computing, Peripherals, Specialized), Digital Infrastructure (Software, Digital
  Services, Online Presence & Communication), each plus any "Other" subsection the founder added (named "Unnamed Subsection" until named in its
  head), and, in Offering's Capability, Partners & Suppliers (Partners, Providers; the Channel partners tile shows
  the kinds that have some, one kind alone directly). A box lists its cards' names (or shows the "+" while it has none). "Cooling & Air Conditioning" is drawn on two lines in its box too (a forced break after "Air": "Cooling & Air" / "Conditioning"); the stored id ("cooling", "heating") and every saved answer are unchanged -- nothing is stored by label. Pressing a box shows that
  subcategory's card boxes in the same dialog in place of the grid (the header names it after a slash); **Back and Escape return to the box grid
  first, then close the dialog** (`useDialogInnerBack`, one level per nested view); a backdrop click closes the whole dialog. A section with one
  subcategory (an Activities category, Offering's Resources, Delivery, a single partner kind) shows its content directly. **The add box.** Where a
  founder can add a subcategory of their own (the four resource groups: "Other") the grid ends with a HALF-SIZE BOX after the last box: a true
  square of half their side, a dashed, lighter edge and a plain ground to read as an action, a "+" over "Add Other" centred, at the TOP LEFT of
  its grid cell; `aria-label="Add Other"`, keyboard-operable like a tile. Pressing it adds an Other subcategory and opens it at once, to be named
  in its head. The grid is reset each time the dialog opens. Links: a box carries `data-anchor` ("subsection-<group>-<kind>"), `data-holds` (its
  cards' ids) and `data-opens`; `jumpTo.ts` presses the tile (`data-tile` + `data-holds`), then the subcategory box, then the card's box.
- **Card tiles** (`CardTile.tsx`, `card-tile.css`; `CardBoxes.tsx` lays them out). ONE tile is a card wherever cards are shown as tiles: every dialog's list of cards
  (Resources, Activities, Partners and Suppliers, a category's / subcategory's, the channel tiles', the Completed activities) and the Inventory overlay. It is
  the page tile's make (`TileFace`: the name with its rule, then a list of lines), 215px (the page tile's side, read from a page tile), in the colour of the
  section it stands in (Infrastructure, Offering's Capability, a Customer Channel's teal; a legal expense the Legal Entity's neutral ground). Under the name
  (with its number where the list is numbered: "1. Xero accounting") the lines are the same everywhere: where it belongs (section, group, subgroup), its
  status, its cost and frequency. A small coloured circle per link (Activity, Investigate, Partner, Provider). Hover is the page tile's (lift, glow,
  transition) at 110%, growing INWARDS from the side of the grid it stands on. Grids start at the left, as many across as fit, 12px apart; the add box ends
  the flow (half the side, dashed, "Add Resource" / "Add Activity" / "Add Partner" / "Add Provider"). A tile is pressed to open its card FLOATING; Activities
  are ordered by dragging one onto another (grab hand; faded while dragged; a dashed edge on the one it is over); a completed activity's tile is the grey.
  A section with no cards opens directly on ONE new blank card, as before. There is no other tile markup or stylesheet for cards: change `CardTile` /
  `card-tile.css` and every grid changes. (`cardBoxLayout` and the 96px floor are gone; the probe's card tile rule checks side, gaps, title size, add box.)
- **Completed activities (the grey).** The CARDS of the finished ones are grey too, wherever they are opened -- the card boxes, the Completed tile's floating cards, the Completed dialog's category boxes: the Completed
  tint for the ground and edge (`.business-capability-activity-completed`), the muted grey for the text (7.17:1 at the least in the light theme). Infrastructure › 2. Activities has a grey **Completed** tile (`SectionTile.completed`, the neutral
  `--bg-completed-card` ground, `--line-completed` edge, `--text-completed-ink` text: 9.78:1 light, 6.28 sepia, 11.07 dark; no category hue; its
  list and title the same grey, its dialog grey too) after the categories, beside the last (see the tail tile). It holds every activity
  ticked Completed, **each stored where it always was, in its category's list** (the flag only moves where it is shown: no migration); a
  category's tile and dialog show the active ones only (its "Active N" counts them); ticking Completed on a card files it under Completed,
  un-ticking returns it to its category. Up to 8 completed activities are card boxes in one flat grid (all inactive, numbered 1..n, no add box:
  an activity becomes completed by ticking, not by adding); more than 8 first show BOXES named after the categories that hold finished ones
  (the four defaults as a 2 x 2 square, plus custom ones), each opening that category's finished ones. The tile exists only while an activity is completed (no
  "+"); un-ticking the last one closes the dialog by itself. **Offering's Capability has the same grey Completed TILE** (the tail tile, placed by the one grid rule: with the four tiles of a 2 x 2 square in a third column of the second row, with six (3 x 2) on a new row under the first column; no "+" box; the same look, list, "+N more", links to frozen cards, dialog of grey card boxes; present only while one is completed); it replaces the nested "Completed" box the Activities dialog used to end with (`CardBoxes folder`, removed), and a completed Offering activity leaves the Activities tile's list. Its floating card stays open when the tick is taken off (the activity goes back to the Activities tile).
  **A completed activity is FROZEN** wherever it is opened (both sections): every field of its card sits in a disabled `fieldset.business-capability-frozen` (`display: contents`: it takes no box) -- the name, the performers and their "+" / x, the Responsible and its tick, the Description and its tick, the linked Offerings, the x -- and only the **Completed tick** is outside it, live and normal, so it can be unticked (which unfreezes the card and files it back in its category). The frozen look: the fields flat in the grey of everything completed (`--text-completed-ink` on `--bg-completed-ground`, no light or shade, no stroke), `cursor: default`, no hover reaction (the hover rules all exclude `:disabled`), the "+" box grey; text still 4.5:1 or more on its ground. (A child activity's name link to its parent stays live: it is a way to another card, not a field.)
- **The opened card** (a card box pressed, or a floating card; Resource of Infrastructure or Offering's Capability, Activity, Partner, Provider, channel-origin card).
  Centred, `--open-card-width` (**480px**, at most the window) wide, 12px padding (a 454px content width), label gap 6px, field gap 12px. **The head:** [number] [name cell] [x]: the arrow that once stood before the number is
  gone, so the number starts at the card's content edge (x 12.7 in the card, where the labels start; left-aligned, as wide as its digits) and the name cell takes the rest; the number and the x are boxes as high as
  the one-line name cell (`--card-name-line`, 44.3px), centred in it, so they stay centred on the name's FIRST line and do not move when the name wraps: the cell grows downward only (measured with a 110-character name,
  one line 44.3px to three lines 98.3px: the number's and the x's centres at 34.8px both times, the first line's at 34.9px). **Nothing is stretched**: a picker (Status, Performer, Responsible, Provider / Partner, Frequency) is as
  wide as its longest OPTION and no wider (the placeholder, "Select", is shorter than any option and is always shown whole): the Resource's Status 316px (its longest option 282.3px + 33.3px of padding, chevron and border), Frequency 127px ("Per project" 93.1px
  + 33.3px), measured to within 0.6px; the cost row is `[Qty] [Price] [currency] ... [Frequency]` (see "The cost row" below). **The side-label
  row** of a Resource -- the Status -- is a label (the "i" glued to it) beside the dropdown, mid-aligned, `--side-label-gap` (12px) apart, in the label column (`--card-side-label` = `--side-label-short`, 164px), so the Status and the Responsible
  dropdowns start at one x (the currency stands over it). Under 358px of content the Frequency goes under the row; the Description box at the card's content width, two lines at least; rows 12px apart; every control starts at the one left edge (x 13 in the card). **The Responsible tick row is ONE ROW at every width**: the tick, its
  words and "i" in a column as wide as they need up to `--side-label-short` (164px), then the dropdown, which hugs and is cut to what is left -- never under the tick row (measured on an Activity, a Partner and a Provider in cards 480,
  440, 400 and 342px wide; the narrow-card rules that put a label above its field do not apply to a field with a tick, the Deposit and the optional notes excepted). **An Activity's Performer and Responsible rows:** the label (the
  Responsible's with its tick) and its dropdown stand next to each other, 12px apart, on one centre line, in one shared column (the Responsible's row shares the stack's two columns: `grid-template-columns: subgrid`), so both dropdowns start at one x. **The Performer's dropdown runs from
  its label's gap to the right edge of the name cell above it** (it is not limited to its longest option here: `OptionPicker fill="fit"`; the head's name cell ends 8px short of the x, and so does the dropdown), and at the x's own place -- the x's column, its size (32px), centred on the dropdown -- stands the **"+" box** (`.plus-box-small`, the page's "+" box at the x's size,
  named "Add Performer to Activity 1", replacing the old "+ Add Performer" rectangle) on the FIRST row while another performer can be added; a further performer's row repeats the label's empty place, the dropdown and, in the x's column, an x (32px) that takes it away. The label stands on the first dropdown's centre line. **The Completed tick** is the card's last row, at the left with the other ticks (the Responsible's and the Description's: one x). The single-founder hiding and the tick are unchanged.
  Measured on an Activity card at 1600 x 1000: the label-to-dropdown gap 12.00px; the dropdown's right edge = the name cell's (difference 0.00px) = the x's left edge less 8px; the "+" and the x at one x (0.00px apart), 32 x 32; the "+" centred on the dropdown (0.00px); the Responsible's dropdown at the Performer's x (0.00px); the Completed, Responsible and Description ticks at one x (0.00px). Nothing runs out of the card at 480, 440, 400 or 342px.
- **Page 3, the last round (rulebook entries).**
  - **Corners.** Unchanged: every box, card and dialog keeps the radius it had (8px boxes and cards, 6px cells); nothing follows the box size.
  - **Recessed text and number cells.** A text or number input / textarea (not a picker, not a tick box) is the raised cell turned over: `--cell-inset-recess` (shade at the top left, light at the bottom right) on the cell edge (`--cell-edge`); a picker keeps `--cell-inset`; the focus ring stays over it; a disabled (frozen) cell is flat. The Workspace form and the Delivery cards take it through the same selector. The x (`.strategy-box-remove`), ticks, the "i", "+" boxes, arrows and other small buttons are NOT touched by the page-3 edges: the x is the app's one (remove-button.css) and no rule of `page-3-edges.css` names it; the probe checks every x at rest has no inset shadow and looks like every other.
  - **Wired / filled arrows.** The founders' fold arrows (11 x 18 closed, 18 x 11 open at an 18px label) and the title arrows are the label arrow (see "The label arrow"): an SVG triangle, an outline (2px line inside the shape) at rest, the same triangle filled under the pointer and keyboard focus. Box, margins and place are identical in both states, so nothing moves. No ground or ring on hover.
  - **The dropdown list** is a card of its own under the cell (above it where there is no room): 6px gap, no stroke (the boxes' inset light and shade plus the drop shadow), exactly the cell's width and left edge (inline width / min / max from the cell's box), a long option wrapping inside it with its full text as tooltip. A Status, Responsible or Provider picker `fill="fit"` runs from its label's gap to the right edge of the name cell.
  - **The opened card's columns** (Resource, Activity, Partner, Provider, channel cards; not Delivery, not the Workspace form): a grid of three columns -- the marker (the number, as wide as its digits), the content and the x (32px) -- 8px apart, the head on a subgrid. Everything under the head starts at the name cell's LEFT edge (x 245.9 at the 480px card) and ends at its RIGHT edge (634.3); the x column stays empty but for an Activity's "+" / x beside a performer; the Responsible row (Partner / Provider and Activity) ends at the name cell's edge; the Description box ends there too. A Partner's / Provider's Price (219 with its currency) and Frequency (hugging its longest option, 126px; the placeholder is just "Select") sit side by side while the content column has 358px (at the 480px card it has 388px), under each other below that. A child activity's head: the number at the card's padding edge (12px), 8px to the name, the name's text starting at the name column's left edge, both on one centre line (0.3px apart); the head 12px from the card's top. Probe rules 18c / 18f read all of it, including that no picker shows a cut value; the one exception is a Status picker holding its longest option (282px of text beside a 124px label in a 388px column), which ends in an ellipsis with its whole text in the list.
  - **Subcategory "+".** Each subcategory box of the four resource groups (fixed ones, and a founder's own Other) has a 36px "+" box at its lower right (in the box's own grid cell, 12px in) that makes a blank resource in that subcategory and opens it floating, captioned with the subcategory's name; left blank it is removed again (the subcategory stays). The four group tiles have no "+".
  - **Completed tile** (Infrastructure and Offering's Capability) exists only while at least one activity is completed; un-ticking the last one closes the dialog by itself. No "None yet".
  - **Founders tile** lists the names alone. **Delivery tile** items are links: each opens that Offering's Delivery card floating, captioned "Delivery". A Delivery card's order number stands at the card's padding edge (12px in, left-aligned); a person's "(founder)" / "(external)" is in the tooltip and the input's accessible name, not drawn. Opened floating, a Delivery card keeps its own wide label column (`--side-label-short`).
  - **Channel cards** (a Resource, partner or provider a Customer Channel made, in Offering's Capability) are auto-generated: no name cell and no x -- the number and the name are plain text (the name from the channel's cell, where it is renamed and where the card is removed); their other fields stay editable; the "For channel: ... Go there" line stays. A card of Infrastructure only linked from a channel is the user's own and keeps its name cell and x.
  - **Landing:** a "Reload" button after the theme switch in the header (reloads the app).

- **Page 3, the round after it (rulebook entries).**
  - **Names.** Offering's Capability's third tile is **Partners & Suppliers**, and its grid has two boxes, **Partners** and **Providers**; Infrastructure's third section is "3. Partners & Suppliers" with the same two tiles, **Partners** (it was "External Professionals & Partners") and **Providers**. "Partnerships" is no longer said anywhere. The Status option "External Professionals & Partners" of a resource (an answer, not a section) keeps its words; stored keys are unchanged.
  - **One way to present a card.** A Resource, Activity, Partner or Provider card (channel-made, finished and the parent / child pair too) is ONLY a **floating card** on its section part of the page (top-aligned with the first tile row, its box name above it, a drop shadow, stacked when several are open), never shown inside a dialog and never centred in the page behind a blurred ground. A tile or subcategory box connected with exactly ONE card opens that card at once; one with none makes one blank card and opens it (taken away again if left blank); one that groups several opens the DIALOG, which is only a grid to choose from (subcategory boxes, card boxes with their add box; the glass look stays on that grid) -- pressing a card box closes the grid and opens the card floating. Back, Escape and the backdrop close a floating card and return to the page (not to the grid). Not these kinds, unchanged: the Founders dialog, the Workspace form (a floating card of its own) and the Delivery dialog (its cards in the dialog; its list links open one floating).
  - **The cost row** of a Resource, Partner or Provider card is ONE row: `[Qty] [Price .......] [currency] ... [Frequency]`, the labels (Qty, Price, Frequency) above their cells, the currency with none. Qty is the 56px of its label's column (`--qty-w`: three digits and the cell's padding), 12px to the Price, 12px from the Price to the currency; the currency's left edge is the side pickers' (Status's, Responsible's: the label column `--side-label-short`, 164px, and its 12px gap); the Frequency hugs its longest option (126px; its placeholder is just "Select") and ends at the name cell's right edge. Measured at the 480px card: Partner Price 245.9-409.9, currency 421.9-501.4, Frequency 507.9-634.3 (name cell 245.9-634.3); Resource Qty 951.9-1007.9, Price 1019.9-1115.9, currency 1127.9 (= the Status picker's left), Frequency to 1340.3 (= the name cell's right). Under 358px of content the Frequency goes under the row. The Resource's Status label column is therefore 164px (it was 124px): the Status picker is 212px, the longest option ends in an ellipsis there.
  - **The x** (the one shared `.strategy-box-remove`, and the three older removes that share it) is a swap of two colours like the "+" box, app-wide: at rest it has NO fill (a wired button: transparent, it takes the colour of the card it stands on; `--x-ground` names that ground, set where each card kind sets its ground, the page surface where none does, and is the X's colour under the pointer), the stroke 2px (the "+" box's) and the X both the danger red (`--x-red`, `--text-danger`: #b00020 light, #ff9b96 dark); under the pointer or the keyboard focus no stroke, filled red, the X in the ground colour. 32 x 32 as before, no inset light or shade (`page-3-edges.css` names no x).
  - **A floating card has no Back button**: it closes with a press outside it. The Back buttons that exist are the dialog foot's (`.section-tile-back`) and the one in the rail's tab (`.carousel-rail-back`); see "Navigation rails" and the Back button contract (`src/library/assets/backButton.ts`).
  - **The hover lift** of page 3 (the glow a tile, a cell, a list row takes under the pointer) is its old amount times `--hover-lift` (1.2): the tile and cell glow 18% -> 21.6%, the chosen list row 28% -> 33.6%.
  - **The focus ring.** The cell's focused edge was the primary line (`--line-primary`: #7aa7f5 in dark, a thin light-blue line round the cell). In the dark theme it is now a clean white (`--focus-ring-ink`: rgba(255,255,255,.9), 2px, no coloured glow; about 14:1 on the cell); light and sepia keep the primary line (#0b57d0, #3e5f7e) and the soft glow. The tiles', links', "+", x and Back outlines use the same token.
  - **Numbers on the right.** A numeric input of page 3 (inputmode decimal / numeric, type number: Qty, Price, Deposit, Salary, the hours) right-aligns its value with 12px of padding; text inputs are unchanged.
  - **The section help drop-down** (1. Infrastructure, 2. Offering's Capability) is 480px wide (the card's width where that is less), centred under the title row.
  - **Lists on the tiles** hold every item and scroll inside their bounds (under the title's underline, above the "+" box): a thin themed scrollbar, the wheel scrolls the list before the card behind, the keyboard walks the links; there is no "+N more".
  - **Titles and captions** (app-wide): `--title-ink` for the page title, column titles, section headings, tile and dialog titles and the header's name, `--floating-caption-ink` for the caption: light #303a49 (was #111827 / #1f2937), sepia #3b2f25 (unchanged), dark #cdd1d8 (was #e6e8eb; the caption was #ffffff). Measured contrast, before -> after: light column title 13.0 -> 10.2, section heading 15.7 -> 10.2, tile title 14.0 -> 9.1; dark column title 10.7 -> 9.7, section heading 12.1 -> 9.7, tile title 11.4 -> 9.1, caption on the scrim 20.0 -> 13.1; sepia 10.5-11.3 (kept). The caption in light and sepia stays white: it stands on the dimmed page (5.7 and 6.4:1). Body text keeps its ink.
  - **The type scale** on page 3: only 14 (`--font-small`: list text, summaries, a title that dropped a size), 18 (`--font-body`: tile titles, card names, labels, fields), 24 (`--font-h3`: section headings, dialog titles, captions), 28 (`--font-h2`: column titles) and 36 (`--font-h1`: the page title). The one deviation found, the dialog's visually hidden name at the browser's 16px, now takes 18. Probe rule 18i reads every text.
  - **The Workspace Deposit.** Its amount box has the Price box's left edge, width and height; its currency is plain text (the card's, taken from the Price) whose letters start where the letters "GBP" start in the Price row's currency picker (measured: both 545.3px, same centre line).

- **The edge of an opened card and its cells (no stroke).** The opened cards -- a founder's, a resource's, a partner's and a provider's, an activity's, and, named in the same request, the **Workspace form and the Delivery cards** -- their CELLS (inputs, pickers, text boxes, name cells, the x) have no stroke. The edge is the box's inset light and shade
  (`--box-inset` for a card, `--cell-inset` -- the lighter twin -- for a cell); the 1px border they keep for the box model (so nothing moves) is painted in the light on its top and left and the shade on its right and bottom (`--box-edge`, `--cell-edge`: `border-color` of four values), so the inset shadow runs on into it and there is no
  hairline of plain ground outside it. Pointed at, a cell keeps the soft glow (18%) around it; focused, the ring (35%) -- accessibility -- over the inset edge; disabled, flat (no light, no shade); the x is filled red under the pointer, no stroke. Tick boxes keep their own box, the dashed add boxes their dashed edge. All in `page-3-edges.css`; the Workspace form's and the Delivery cards'
  share is ONE block at its foot ("THE WORKSPACE FORM AND THE DELIVERY CARDS"), with the same tokens, nothing else of them changed: delete that block and they have their strokes back.
- **The "i" of a coloured card.** Every "i" on this page (`InfoNote`): at rest it has NO fill (a wired button: an outline and a letter; the ground of the surface it stands on shows through, and `--info-fill` names that ground: the page card's, the dialog's, an opened card's own; on a box name over the dimmed page, a dark ground) with a 1.5px stroke (drawn as 1px at 100% zoom on a 1x screen: a border is drawn in whole device pixels) and its letter in the darker tint of the card's hue
  (`--info-ink`, `--theme-text-ink`; white on the scrim); under the pointer or the focus (or while its note is open) the stroke is gone and the two swap -- filled with the tint, the letter in the ground colour. The size (22px) is unchanged. Letter against ground at least 3:1 in both states.
- **The label arrows have no ground, ring or bolder glyph under the pointer.** The label arrows of a founder's card (Responsibilities, Completed) and of the titles (1. INFRASTRUCTURE, 2. OFFERING'S CAPABILITY) only fill their outline triangle under the pointer and the keyboard focus (focus draws no ring: the filled triangle is the focus). They keep their size, their name, and -- the founder's -- no shift on a click.
- **The column title's "i".** After the title's text, 6px (`--info-gap`, like every "i"; the title row's own gap is 8px and the note takes 2px off it), and before the label arrow: what the column is ("Existing or planned resources, activities, and partnerships & providers the organization needs ..."; Offering's: "What each Offering needs on top of ..."): the notes the page had before it was drawn as tiles. Where the old page had an "i" the tiles have it still: on the column titles, the section headings, the dialogs' headers (the tile's, then each subcategory's), the fields' labels; the Workspace's, which has no dialog header, and the other boxes' are said after the box name above a floating card.
- **Title sizes** (type scale tokens only): page title 36 (`--font-h1`) > column title 28 (`--font-h2`; "1. INFRASTRUCTURE") > dialog title and
  section heading 24 (`--font-h3`; "6. Digital Infrastructure", "1. Resources") > tile, subcategory / card box title, subcategory heading, card
  name 18 (`--font-body`; weight 600 on tiles and boxes, 700 on headings; 14 for a title too long for its room and in a box under 120px) >
  labels 18 (lighter weight and muted colour) > lists, summaries, notes 14 (`--font-small`). Final sizes against the old: page title 36 -> 36;
  column title 24 -> 28; section heading on the page 18 -> 24; dialog title 18 -> 24 (it was smaller than the tile that opened it); tile and box
  titles 18 -> 18; subcategory heading 18 -> 18; card name 18 -> 18; label 18 -> 18. (The column title and the section headings are scoped to this
  page; the other pages' are unchanged.) Equal sizes with different weights are deliberate: the scale has no step between 18 and 24.
- **Title Case.** Every multi-word title the app itself writes -- tile, box and dialog titles, the add-box labels, the placeholders of an unnamed card -- capitalises the first
  letter of every word except the symbols "&" and "/": "Channel Resources", "Channel Partners", "Digital Infrastructure", "Partners & Suppliers", "Cooling & Air Conditioning",
  "Heating & Gas", "Online Presence & Communication", "Sales & Customer", "Partners", "Add Other", "Add Resource", "Add Activity", "Add Partner",
  "Add Provider", "Unnamed Subsection", "Unnamed Activity", "Untitled Category"; single words are unchanged. It is the visible text only (what is stored is as it was) and what the user
  types is never altered.
- **Page 3 scrolls in its cards.** In a window from 1212px wide and 560px high (the two
  cards side by side) the PAGE does not scroll: the app header, the page heading with its
  underline and the footer stay, and each card keeps its title row ("1. INFRASTRUCTURE
  ▸", "2. OFFERING'S CAPABILITY ▸", on the card's own ground) fixed at its top while the
  card's BODY (`.card-scroll`: `overflow-y: auto`, `overscroll-behavior: contain`) scrolls on
  its own beneath it. The body's top edge is the clip line, 6px under the title row's
  12px gap (its 6px padding and -6px margin give the tiles' hover glow room), so what
  scrolls up is cut there, never behind or over the title; no ghost text, no
  overlap. The cards stand from 12px under the heading's underline, as tall as their
  content, at most down to 12px above the footer; the guidance drop-down floats above
  the body (`z-index: 20`, taking no room) and the dialogs and their backdrop cover
  everything as before. Offering's Capability shows all its tiles without a bar unless the
  window is too small. Measured: 1600 x 1000, the card area 173 to 924px, Infrastructure's
  body 694px high (1278 of content), Offering's 502 (no bar); 1366 x 800, 173 to 724px,
  494px (1157 of content) and 453 (no bar). The document is exactly the window high (one bar
  at most, the card's). Rails and links: a rail bullet scrolls its card's body to the
  top; `jumpTo` scrolls the element into view inside its `.card-scroll`. Stacked (under 1212px)
  or in a window under 560px high the page scrolls as the other pages do and the body does not.
- **The Workspace form card (FROZEN: its markup, CSS, cells and tests are not to be changed again -- only how it is opened).** (`.workspace-card` > `.workspace-form`, `workspaceFields`). It is opened ALONE as a floating card (see "Floating cards"), centred over the group of 1. Resources, with no dialog and no title bar around it. The form sits in a CARD -- the shared glass card
  ground (`--card-glass-alpha` / `--card-glass-blur`, 12px padding, the card edge), centred across the dialog and at its top, hugging its content (364 x 296px
  at Costs; label text 6.5:1 at the least on the worst ground, light) -- on two tracks: a label column (`--workspace-label-width`, 97px: the widest
  label) then `--side-label-gap` (12px) and the control column, which is **as wide as the widest option of the three pickers (Workspace type, Status,
  Frequency)**: every picker is exactly that wide (`OptionPicker fill`, made wide enough for the union of the three lists), 229px; the Price row (the box
  at what the currency leaves, 142px, 8px, the currency 79px) ends on the same right edge; the provider / professional picker fills the column and cuts a
  longer name with an ellipsis. Rows 12px apart, every label beside its control on one centre line. The **Deposit** is a row like the others: its tick and
  label in the label column (the tick at the column's left edge), the row **45px high ticked or not** (the amount reserves its place), so the label's x
  and y are the same before and after ticking (measured: x 630.8, y 460.4, tick 464.9 either way); ticked, the amount (the Code step) and the currency
  text on its line in the control column. Fields, behaviour and the Status-dependent fields are unchanged. (Measured: label column x 630.8 to 727.8 at
  1600, controls 739.8 to 969.2; at 1366 x 513.8 and 622.8 to 852.2; the card centred on the dialog's centre, 800 and 683.)
- **The Founders' dialog.** The same frame as every dialog. Its content (`FounderCards.tsx`) depends on the number of founders: **1 to 4** founders:
  every founder's card OPEN (no fold arrow), side by side in ONE row, the row centred; **5 to 8**: two balanced rows of open cards (5 is 3 + 2, 6 is
  3 + 3, 7 is 4 + 3, 8 is 4 + 4), an incomplete last row centred; every open card is one width, **`--founder-card-min` (297px: what the content needs and no more)**, 12px apart. As many
  stand across as the dialog's content holds: **four from 1224px** (4 x 297 + 3 gaps) -- at 1600 (content 1375px) and at 1366 (1229px) -- **three from 915px, two from 606px**, else one
  (`--founder-across`). **More than 8**: each founder is a CLOSED SQUARE BOX (the subcategory box look, `--section-box-size`; the name, the first role under it small), as many across
  as fit, left-aligned; pressing one opens that founder's card in place of the grid (one at a time; the header reads "1. Founders / Maya Chen");
  **Back and Escape return to the grid first, then close the dialog**. A link to a founder presses their box (`data-opens`, `jumpTo.ts`); a founder's name on the Founders tile opens the
  card alone, floating.
  **A founder's card: ONE LEFT EDGE, one marker column.** Glass, padding `--card-padding` (12px) + `--founder-inset` (4.5px) + `--founder-marker` (26.3px) on its left: the
  CONTENT EDGE is 43.5px in (the border included). Every text -- the name, the roles' text, the labels (Salary, Working Hrs ...), the left column's cells, the share line, the
  Responsibilities label, the list items' text, "Completed N" -- starts at the content edge; the head's number "1.", the roles' bullets, the
  Responsibilities fold arrow, the list numbers and the Completed arrow all start at ONE x, the marker column's (17.2px from the card's edge, measured on the glyphs); a wrapped line of an
  item aligns under its first line's text (hanging). A two-digit number is wider than the column: the column grows and the list's text follows it. **The head:** the number and the name are on
  ONE line -- one line height (28px), so the same baseline (246.5) and vertical centre (240.2) -- and the number, in tabular figures (every single digit 18.3px), ends **8px** (measured
  8.01) before the name. **Both fold arrows are the label arrow** (`LabelArrow`, see "The label arrow": an outline triangle in the card's tint that fills under the pointer and the keyboard focus, no ground and no ring): the
  Responsibilities row and the Completed row are the same row of one component. **The arrow does not move when it is toggled:** open and closed it has ONE margin, so its box and the label after it stay where they are; the glyph turns about its centre and is shifted by 0.1945em when open, so its left edge stays on the markers' x. The glyph starts on the markers' x and the label after it starts where a tick box's words start (26px from the edge). Lists: line height 1.45 (`--section-tile-line-height`, 26.1px at 18px), 6px between
  items (item pitch 32.1px, a wrapped item 52.2px + 6), 12px between blocks (the Completed block 12px under the list, its struck items 6px apart
  under it). The head: number, 8px, name; the roles 12px under it. **Four cells of one size** -- `--founder-cell` (108px, what "Annually" needs) x 45px
  high -- in two columns **12px apart, both at the left**: Salary | Frequency over Working Hrs | Delivery Hrs (the right column NOT pushed to the card's right edge; measured cells at x 43.5
  and 163.5 of a 297px card); each label stands over its cell, left-aligned: "Salary (£)" and "Frequency (i)" on one line, **"Working Hrs (i)" and "Delivery Hrs (i)" on TWO lines** ("Working" /
  "Hrs (i)", the "i" glued to the last word), and the second column is as wide as "Frequency (i)" (120px, 12px wider than its cell), so no label leaves the card or touches the other. Then
  ONE short muted line, the share of the working hours ("70% of working hours"; nothing at all while the working hours are blank or 0); then the Responsibilities row: its fold arrow,
  "Responsibilities (i)", and only the RATE ("0/6"). The Responsibilities list is COLLAPSED by default and **every time** (reset when the dialog opens, when a founder's box opens its card
  and when a floating founder's card opens). Equal heights are not required.
- **Closing** leaves the page as it was: the focus returns to the tile that
  opened the dialog, the scroll position and every fold are kept, nothing is
  re-created. A link to a card inside a tile (Review, search, a channel's
  "Go there", the Financial pages) presses the tile first (`data-holds` and
  `data-anchor` on the tile, `jumpTo.ts`).
- **The check** (section 8) measures the tiles (a square of `--section-tile-size`, one size per card, the group's shape -- a row of up to three, a 2 x 2 square,
  two rows -- and the tail tile's place; the title's last line on the third-down line, at least 12px from the top, underlined; the list a small muted
  centred block inside the square, contrast 4.5:1; the "+" of an empty section under the title, 24px, "No items yet"; the Completed tile's grey; every part of a page tile -- title, list, items, "+" box -- inside its square (no overflow); the "+" box 36px at the lower right, 12px from the edges, the list clear of it; each tile grown to 150% inside its card), the title
  arrows (hit area, 8px after the title, centred on its line, glyph size, the card's title first and 12px above its content, an open help floating and
  taking no room), the first tile rows of the side-by-side cards (one y), and opens every tile's dialog in turn
  (`__layoutProbe.checkWithTiles(spec, { settle, only })`), measures it (a rectangle from the underline to the footer, centred; Back at its lower left; the
  header one line with its slashes; the content centred across and at the top), unfolds everything in it, checks the dialog's cards against every rule, and opens
  the boxes level by level -- the first two founders' boxes of a 9+ set, EVERY subcategory box of Utilities, Workstation, Equipment, Digital Infrastructure and
  Offering's Partners & Suppliers, and the first three card boxes of each list -- measured, unfolded and checked, then Back to the level it came from; an
  empty list opens on its blank card, which is checked too and removed with Back. Then each page tile's first list item and its "+" box are pressed in turn (`checkFloating`; a child activity's link opens the stacked pair, which is checked: parent above child, 12px, one centre line, a disabled name, no x): a floating card is a modal dialog with a drop shadow, the dimmed backdrop and a Back button, wholly in the window, 480px (a founder's 297px) wide, its box name centred 12px above it and outside it, centred over its page column (or the tile group for the Workspace), a card added with the "+" has its Name focused and, left blank, is removed again; the Workspace tile opens its form alone. It checks the card boxes (one side, the largest that fits, centred block,
  12px apart, the add box half the side at the top left of its cell and last, the shape of the group), the title sizes (page 36, column 28, dialog and section
  24, tiles / boxes / names 18 or 14, lists 14, the "+" 24), the opened card's controls (Quantity 80, Price 128, nothing stretched, 480px at most, centred), the
  glass ground of the dialog and of its cards (translucent alpha < 1 and a blur), the one dialog frame, page 3's scroll, the founder card (every text at the
  content edge, markers and fold-arrow glyphs at the marker column, the head number and name on one baseline and centre with 8px between, both fold arrows the standard 36px with their ring inside the card, four cells of 108px x 45px, left cells at the content edge, the right column 12px after the left, Salary / Frequency labels one line and Working Hrs / Delivery Hrs two, labels never touching, lists 1.45 with
  6px between items), and the Workspace card (<= 560px, centred, label column no wider than its widest label, every picker and the price row on one right edge, the
  Deposit row 45px). Rules measure inside the scroll containers (a body is measured at its top). `checkWithTiles` leaves what it opened in
  `__layoutProbe.stats`.

---

## 6. Interactions: one set of reactions per kind

| Kind | Hover | Focus | Disabled |
|---|---|---|---|
| Text box (input, textarea) | primary edge + soft glow (18%) | primary edge + stronger ring (28%) | muted, no reaction |
| Text holder (an image's name and description, one box) | as a text box, on the holder | as a text box | as a text box |
| Picker | as a text box | as a text box | as a text box |
| Tick box | its words underlined, the box's glow ring (whether or not the words are in its label: `.brand-tick` too) | focus ring | not-allowed cursor |

A tick box toggles only from the box itself or its words: its label is as
wide as they are (`width: fit-content`), never the empty space beside
them; Space toggles the focused box. A tick's "i" stands outside its label,
so reading the note never toggles the tick.
| Add button | its ground | focus ring | muted |
| x (remove) | filled with the danger red (`--x-red`), no stroke, the X in the card's ground (`--x-ground`); at rest transparent (no fill), a 2px red stroke and a red X; the same on every x | outline, the focus ring ink, 2px, 2px off | muted |
| Fold arrow (`FoldArrow`, 36px) | its ground and the card-line edge -- **not** a founder's Responsibilities / Completed arrows, which have none | focus ring | n/a |
| Page tile (its slot: button, list, "+") | grows to 150% about its aimed corner (set once per stay), above its neighbours, a drop shadow growing with it | a 2px primary outline on the control that holds it (no growth) | n/a |
| Box in a dialog (subcategory, card, founder, add) | soft glow (18%) beside its inset light and shade (no stroke) | a 2px primary outline | n/a |
| Item of a page tile's list | underlined | underlined and a 2px primary outline | n/a |
| "+" box (a page tile's, 36px; the Activity card's Add Performer, 32px) | the colours swap (150ms): at rest the ground, a 2px stroke and the "+" in the darker tone; under the pointer the darker tone filled, no stroke, the "+" in the ground | the same and a 2px outline | muted, not-allowed |
| "i" of a coloured card | stroke gone, filled with the tint, the letter in the ground (a swap) | the same | n/a |
| Line under a parent's Status ("Open Activity “...”", an alarm when the child holds details) | bold (a text-shadow, nothing moves) while the pointer is on the Status cell or on the line; its link underlined | outline on a link | n/a |
| A child's name (the link to its parent) | underlined and bolder | a 2px outline | n/a |
| Label arrow (beside a label or a card title) | the outline triangle fills | the same fill (no ring) | n/a |

The check hovers up to three of each kind on every page and fails a kind
that does not react as its row says; it hovers up to twelve x and fails
if any two turn different colours (one reaction per kind).

**The one x.** Every remove button is the shared `.strategy-box-remove`
and nothing else (no second class adding a hover, a ring or a glyph size):
the Strategy Theme, Goal, Objective and Metric x are the Legal Entity
card's. Its look is the "+" box's swap of two colours (remove-button.css, app-wide): at rest there is no fill (transparent: the card's ground
shows, `--x-ground`), the stroke 2px and the X the danger red (`--x-red`); under the pointer or the focus no stroke, filled red, the X in the ground. The check reads a Legal Entity card's x at rest, under the
pointer and focused (square, edge, corners, ground, colour, ring,
transition and the two drawn bars) and fails any x on any page that
differs.

---

## 6a. Picker options

- **No bracketed text in an option.** A hint, a note or an explanation
  ("(common here)", "(not listed)") goes in the field's "i" instead:
  a Legal Requirement's Type says "Usually required here: ..." in its note;
  "Other (not listed)" reads "Other" (the field that follows names it; the
  saved value is unchanged).
- **Exception: an abbreviation in brackets stays** ("Private Company
  Limited by Shares (Ltd)", "Limited Liability Company (LLC)", a currency
  code). Stored values never change for a wording; documents keep full
  names.
- **Exception: official and legal names stay as written**, brackets and
  all: legal forms ("Toiminimi (sole proprietorship)", "Corporation
  (federal)", "Empresario individual (autónomo)", "Stichting
  (foundation)", "Unternehmergesellschaft (UG, haftungsbeschränkt)"), a
  tax's official name ("VAT (USt)") and a platform's name ("X
  (Twitter)").

---

## 7. Declared exceptions

- **Text Hierarchy box**: every row is one height, the room H1 needs at
  its largest size (lines at 1.25), 12px apart, so the px squares stand at
  one equal pitch and the box never changes size. Each square stands at its
  row's foot with its tick on its centre line. A name is centred on its
  square while no taller than it, then keeps its foot on the square's foot
  and grows upward only: never below its square, never into the row above
  (checked at every size of every range). The box takes 12px more inside
  each side (24px), and as much room under the last square as above the
  first (the first row's reserve is matched at the foot).
- **Colour and Typeface cards: the body under the name box.** Their rows
  (Role, Colour, Usage) start at the name box's left edge and end at its
  right edge, not at the number's x and the card's edge (the card is a
  grid whose head shares its columns). Role and Colour are side-label rows
  (`.brand-side-rows`): labels in one column on their controls' centre
  line, controls to the right edge; a colour's contrast is the first point
  of the Colour's "i". Every other card keeps the number-left rule; the
  check tests this exception as "body under the name box".
- **Composite groups** measured as one control: price + currency, swatch +
  HEX, a list row with its x, month side-label rows, the channel pick and
  resource rows, the founders table (see `GROUPS` in the probe).
- **Boxes that are not cards**: the Financial Foundation's settings bar,
  headline and tiles, a demand source and a channel resource keep their
  own inner margins.
- **Tables** (`table` elements, numbered lists, the Notepad) size their
  own cells.
- **A founder's card** (the Founders' dialog): its left padding is the card padding plus the inset and the marker column (4.5px + 26.3px), the head's number, the bullets, the fold arrows and the list numbers hang in that column (the "number-left = body-left" and "content starts at the title" rules are replaced by the founder-card rule of the check: text at the content edge, markers at the marker column, the head number 8px before the name). Its four cells are `--founder-cell` wide, a width of their own (the Frequency picker's longest option), whatever their column; the two hours labels are two lines. **The Workspace card's controls** fill the form's control column (the widest of its three pickers; the amounts the Code step), measured against the form's second track; the form is FROZEN.
- **The tail tile** (Infrastructure's Completed tile) is not counted in its group's shape: see "Tile grids".
- **A side label whose control is the empty message** ("Add a founder under ...", a card of an organization with no founder yet) is centred on that message, which may wrap to two lines: the row-gap rule skips it.
- **A card in a dialog, opened** (a card box pressed) is centred and `--open-card-width` (480px) wide, not stretched across the dialog.
- **A page tile at 150%** (hover or focus) overlaps its neighbours (declared): it is above them (`z-index: 6`) and inside its card's body; the check scales each one and measures it.
- **Pickers whose list is wider than their cell** (opened cards): the rule that a picker is as wide as its longest option, and shows its whole text, has these named exceptions besides the Status picker. A supplier or partner cascade's Group and Name pickers (a group name such as "Landlords, Leasing & Warehouses" is 322px with its padding; a name the user gave is any length), an activity's Performer pickers (a person's name and role, or a partner's), and the Group picker of a Resource, Partner or Provider card. Each is as wide as its 212px cell and ends in an ellipsis there; the whole text is in its list, its tooltip and its accessible name. The check skips them by their accessible name ("... supplier group: ...", "... supplier: ...", "... performer N: ...", "... group: ...").
- **The cost row's Frequency column** (a card with no group yet offers all seven frequencies, "% of revenue" the longest, 148px): the column gives way to the room left (`minmax(0, max-content)`), so the Frequency ends at the name cell's right edge, up to 16px narrower. A Per unit price with a Unit picker puts the Frequency and the Unit together under the row (`:has(.business-capability-frequency-unit)`), the currency keeping its place.
- **An activity's Responsible stack**, which has no Performer list and so no x, has two columns and ends at the name cell's right edge (the Performer's stack keeps its third, the x's).

## 8a. Added on 2026-10-14: tracking and the label arrow

(The table "Values as built" is section 8, above.)

### Tracking follows weight (2026-10-14)

Text that goes bold under the pointer (`--hover-bold`) gets 0.05em of tracking ON TOP of what the element already has (`--bold-tracking` added to `--rest-tracking`: a button's 0.1em, none elsewhere), as the Capability and System list always did; text that is bold by default has the same. Spacing comes with bold only: the lit rail item is wider than the others, never tighter. A bullet under the pointer is only underlined. Every CSS rule that sets a bold weight (600 and up) or `--hover-bold` sets `letter-spacing: calc(var(--rest-tracking, 0em) + var(--bold-tracking))` with it, unless it states its own tracking (the uppercase labels keep theirs); `strong`, `b`, `th` and `h1`-`h6` carry it by default. A glyph (a chip's ×) is not text and takes none. A row that holds bold text on hover must be sized for the wider text (one line, no re-wrap).

### The label arrow (2026-10-14)

One fold arrow (`LabelArrow.tsx`, `label-arrow.css`) for an arrow that stands beside a label or a text and shows or hides what belongs to it.
Today: the chapter titles of 3. Infrastructure & Capability (right of the title and its "i"), and, left of the label and inside it, a founder's Responsibilities and Completed, a card's Links and the Initiatives of an Objective.
- No frame and no ground: only the triangle. At rest an outline in the card's tint (the "+" box's colour); under the pointer and the keyboard focus the same triangle filled.
- The shape is the Completed arrow's (11px wide and 18px high pointing right, 18 x 11px pointing down, at an 18px label); the size scales with the label's letters (1em high). The line is 2px, inside the shape, like the "+" box's. The colour is the card's tint (the "+" box's).
- Inside a label its glyph starts at the content edge, like a tick box, and the words start where a tick box's words start (26px). The button is never under 24px; it overhangs the triangle and takes no more room.
- Only these use it: the chapter titles of 3. Infrastructure & Capability, the Initiatives, a founder's Responsibilities and Completed, and a card's Links. Every other fold arrow keeps the standard 36px arrow (`FoldArrow`).

## 9. Tiles: kinds, titles, lists, marks, hover and size

- **Diagram tile** (`SectionTile.diagram`, class `section-tile-diagram`), a category of Master Tile of its own (2026-10-14). It stands for a drawing that opens in its dialog, not for a list of what a section holds: today the Roadmap, a Gantt diagram. It is a wide banner (442 x 102px beside the Strategic Period's dates) with a large title (36px) and no list, not a square of the page tile size; the tile anatomy rules, the square rule and the one-size-per-group rule do not apply to it. Its dialog covers the page (`wide`).
- Tile titles stand at `--tile-title-top` (0.25 of the square); a tile's list shows whole lines only, its scrollbar has no arrows and shows on hover.
- **Incomplete card**: `card-tile-incomplete` on the slot (red flashing glow around the tile; steady under prefers-reduced-motion), `section-tile-list-alert` on a line of a page tile's list (red, bold, flashing, first in the list). The tooltip says "Missing: <fields> (not counted until it is fixed)".
- Category/group titles uppercase (`.section-tile-category .section-tile-title`, `.dialog-heading-sub`); an empty group tile has opacity 0.5.
- **Add Card**: ONE tile (`AddTile`, `.add-card-tile`) ends every section/category/group grid, labelled "Add Card" (tooltip names what it adds); half the tile side; at the bottom right (last grid column, the free place of the lowest row else a row of its own; right edge = last column's tiles', bottom = row bottom); no scale on hover, ground turns semi-transparent and its + grows 10%.
- **Categories**: every category has its tile from the start (empty at 50%); Offering's Resources and Partners & Suppliers views add a CHANNEL category tile (channel teal, one constant `CHANNEL_TILE_HUE`); a channel-made card's floating card takes the same hue. Main page tile titles are capitals; dialog header wraps (no ellipsis), all names the title's size.
- **Growth**: an area whose tiles do not fit grows down (page scrolls; dialogs have `min-height`, their overlay scrolls). The two page cards start their tiles 12px under their titles (no 36px spacer row).
- Tiles per row: `useTilesAcross` (+2px tolerance) gives 3 across at every window width from 1280px (tile 176/191/203/215px at 1280/1366/1440/1600+).
- **Page cards**: `.section-tiles-quad` (four tiles): side = min((box width - 12) / 2, window height left under the title) -- the dialogs' tile (`pageTileSide`) stays the three-across side; tile radius token `--tile-radius` (8px) for tiles and the Add Card. Costs row: label column 164px (`--side-label-short`), `--cost-x` 176px (Qty 56, Price 96, currency over the Status picker's left edge, Frequency to the name cell's right edge).
- **Tile title** (`TileTitle`): `white-space: nowrap`, ellipsis, 18px on every tile, tooltip with the full text; the same top on every tile of a size (`--tile-lift` is the one margin). Page 4-tile blocks: list 18px from 250px a side, else 14px.
- **Hover**: every tile scales `scale(1.1)`, `.15s ease`; the Add Card never scales; its hover is: stroke gone, fill `color-mix(currentColor 16%, transparent)`, label and "+" in the card's dark tint (`--plus-fill`).
- A tile's list line can carry a mark (`SectionTile.itemMarks`): **empty** (the category has no card) `--list-empty-opacity` .7 (3:1 in every theme), text and bullet; **teal** (Offering's Resources: the Channel line) text and bullet in `--channel-marker`; **channel** (Offering's Activities / Partners & Suppliers: the line holds cards a channel made) two stacked bullets in the one bullet column, the line's own on top, the teal one 2px under it, both `--bullet-size`, centred on the line. No mark changes a line's text x or height; the probe's list-line rules hold.
- A tile title cut by an ellipsis slides left under the pointer (a scroll of the title's box, `useTitleSlide`) and back on leave; its size and position never change; nothing moves under `prefers-reduced-motion`.
- `TileList` measures each line's bottom from the top of the LIST (not of its layer), so the list ends at the foot of the last whole line that fits, plus 4px for descenders; no line is ever cut or taller than the list.
- A list line of a card with the channel tone is teal (`--channel-marker`) unless it is incomplete (red); `--list-empty-opacity` (.7) for empty categories.
- **The text on a column page's tile** (Definition, Ethics, Ambassador, Legal Entity ...) is plain text: no bullets, the lines running down to a line above the tile's foot, the last line fading (`.column-tiles-page .section-tile-list`). A press on it opens the tile.
- **Large tiles** (`SectionTile.large`): two of them stand side by side, as large as the four of a 2 x 2 page. A tile's own picture (`SectionTile.picture`) fills its square under the title.
  - Brand Style: Colours (every colour as a block on the tile) and Typography & Text Hierarchy (the typefaces). Their dialogs open boxes that are pictures (`PictureBoxes.tsx`): a colour's box is covered with the colour and carries its name, role and code; a typeface's box carries its name, role and a specimen. A box opens its card floating. The Text Hierarchy stays the table it was, under the typefaces, in the Typography dialog.
- **A title with a forced break** (`\n`) is drawn on its lines (Typography & Text Hierarchy).
- **A tile's lines**: a list (founders, registrations, expenses, themes, roles and skills) has a bullet on each line (`ItemMark.bullet`); text (Description, Philosophy, the gaps) has none; a line that stands alone is centred (`ItemMark.centre`). A line may carry bold words between pairs of asterisks. Text on a column page ends at a whole line, a line above the foot (no fading).
- **A "+" on a tile** (`SectionTile.add`) adds a card and opens it: Expenses, the Strategic Period (a Theme), Colours, Typography, Brand Images. Where a kind has a fixed number of cards (the colours, the typefaces) the "+" is hidden once all are there and returns when one is removed.
- **A title with a forced break** stands with its first line where the other titles stand.
- **Business tiles**: a priced card's tile shows the price in bold and no longer says "Costs".
- **Two columns on a tile** (a name and its share): an item with \u0001 between the parts; the second column starts at one x.
- **A tile's title** stands with its first line at one level on every tile (a title of two lines has its rule, and what follows it, a line lower); its list or picture follows its rule. A frame's heading (a page of several sections) is in capitals, in the centre; the frames start and end where the Business System's do.
- **A tile's content may be linkable** (`SectionTile.links`, `SectionTile.cardFor`): a listed line opens its card (expenses, requirements, themes) or a section of its dialog (`{ box }`: the Registrations tile's three lines open that sub tile); a block of a tile's picture names its card with `data-card` (a colour, an image, a typeface). A press anywhere else on the tile opens the tile. Text on a tile scrolls like a list.
- **Sub tiles** (`SubTiles.tsx`) are category tiles one level in: one-line capital title, a linkable list, a "+" (`SubTile.add`) where they take cards (Additional legal requirements).
- **The blocks of Colours and Brand Images** are squares with the same space around the set as between them; under the pointer a block takes the tile's own reaction (a 10% growth inwards, from the corner, edge or centre of its place, and the tile's drop shadow); a typeface is underlined.
- **A Business card tile** lists, under its name, where it belongs (plain lines, no bullets), then what it says (status, dates, warranty, cost) with bullets (`tileMarks`). A card that names a partner or supplier in a further status row is linked to it as well (a circle each).
- **A Business card tile lists its dates first** (`FloorRow.dates`): both days, or the Start date alone; "From" only where there is no End date and the cost runs on a schedule (monthly, quarterly, annually).
- **Small tiles (`small` on SectionTiles).** The Themes of 2. Goals & Objectives and the Roadmap keep the page's small tile size whatever their number (four are not drawn as the 2 x 2 of large tiles); the grid stands in the middle of its card.
- **Deactivated tiles** (a channel or subchannel not used yet) are drawn in the grey of every deactivated tile (`section-tile-completed`); pressing one makes it and opens it.
- **Tables with equal columns** (the Engagement Strategy) set the width on the header cells and put the gap in the cells' padding; labels shared by every column (Goal, Approach) stand in a row of their own.
- **A tile not used yet** (a channel, a subchannel the category offers) is half transparent, as every tile with no card in it (`section-tile-slot-empty`); pressing it makes the card.
- **Values placed by the app** (`business-capability-static-value`) take the cell's height (44px), one line and an ellipsis with a tooltip.
- **Partner and Supplier tiles** begin with their dates, as Resource and Activity tiles do (`capabilityFloor.ts`).

## 10. Dialogs, floating cards, layers and the navigation stack

- **Layers**: page -> section view -> category view -> group view -> floating card -> (stacked pair). A card floats over the view it was opened from, which stays mounted under it (inert). **Back** and a click on the dimmed backdrop remove the TOP layer only; a dialog's Back / backdrop go one level up (`useDialogInnerBack`). **Escape** dispatches `CLOSE_TILES_EVENT`: every layer closes (a blank card is removed as on closing); a popup open inside takes its own Escape first.
- **Popups**: the "i" note is portaled to the dialog's overlay (else the body), so no clipping parent or glass `backdrop-filter` box cuts it; it keeps the hue of its button.
- **Page-wide dialogs** (Inventory, Completed): from the top of the page cards to 12px above the footer, centred, scrolling inside their body; a section dialog grows down.
- **Floating card**: no Back button; no `inert` on the page; the scrim (`.floating-overlay`) has `pointer-events: none`, the card and the notes in it `auto`; a `mousedown` outside the card (and outside a listbox/menu) closes the TOPMOST card (`FloatingCards`); a dialog's backdrop ignores a press while a card floats over it.
- A dropdown list (`OptionPicker`) inside `.business-capability`, a tile dialog/overlay or a sort menu is drawn free (`useFloatingPanel(..., free)`): fixed, window-placed, never clipped by a scrolling box; the cell's width, flipped above or capped and scrolling when there is no room.
- **The header over the layers:** with a dialog, floating card or Inventory open, `.app-header` has `z-index: 1001`, is never `inert`, and the element at its centre is its own (probe rule 17e2). A press in it does not close a floating card; Escape typed in it with a header popup open is the popup's.
- Declared exceptions added to the picker rule: the Category pickers (` category:`), an activity's Resource pickers (` resource N:`) and a rent's supplier name (` rent:`), like the Group and Name pickers already named: a long list or a name the user gave may be wider than the 212px cell.
- **A dialog over a card taller than the window** covers only what the window shows, under the header and above the footer (`dialogFrame`).
- **One card**: every floating card is 480px wide, with the card ground, a hairline, 8px corners and the same padding; a colour's, a typeface's, a requirement's and an expense's card stand their rows on the name's columns, so everything under the name starts and ends where the name does. A drop-down is the app's own (OptionPicker), including a founder's Skills kind.
- **A card is tinted by its tile**: a card floating over a tile, the "i" of a tile or a card, a Back button under the pointer, and the Text Hierarchy's box all take the tile's hue; a floating card is one box with 8px corners and one shadow.
- **A dialog darkens the page behind it, a floating card does not** (`--bg-overlay`; `--floating-scrim` is clear). The names above the cards keep their own dark ground. Every floating card's box (Business, Legal Entity, Brand and Strategy) has the inner light and shade (`--box-inset`) and its drop shadow.
- **A dialog's header is one row** (`DialogHeading`): the root name (Resources, Activities) keeps its size; the names after it are one size lower (`--font-body`); a trail too long for the row is cut at its left (the last name stays in view, the full text in the tooltip).
- **The "i" takes its card's hue in every reading mode**: its stroke, letter and fill are set on the button itself (page-3-edges.css), so they read the hue of the card or tile the button stands in (a dialog's hue is set on the card inside it, below where the pair used to be set, which made the "i" red on a green or blue card). The caption above a floating card keeps its own pair. Checked on the Business, Identity, Brand and Strategy dialogs and cards, in light, sepia and dark.
- **Carousel arrows** (`CarouselArrows`, SectionTiles.tsx): a "‹" at the left and a "›" at the right of the card or the opened section that was opened last, 44px circles over the page (fixed, measured from the box they flank). A floating card steps through the cards of its tile (of its box, where it was opened from one); an opened section steps through the section's tiles that have something to open; both round the ends. A dialog under a floating card has its arrows hidden (only the last-opened layer has them). Alt + ← / → does the same. A parent and child pair has none yet.
- **Carousel arrows stand 24px from the card or dialog**, in a bright fill of the card's hue with a dark outline (contrast over the dimmed page in light, sepia and dark); none while a card is being made (fresh); a dialog with sections of its own (Registrations) steps through them first (`useDialogInnerStep`), then goes on to the next tile.
- **Only the app header cuts a floating card**; it scrolls to the window's bottom.
- **A rail whose names wrap** shows its bullets alone (class `bullet-rail-compact`): the title and names are hidden and a name appears beside the bullet under the pointer.
- The carousel arrows are the card's ground outlined by its accent colour, and the page's own arrows are hidden while they show. Going back into a tile of sections opens its last section; from the Registrations grid the right arrow opens Formation.
- A floating card's overlay starts under the app header and scrolls: the header is the only edge that cuts a card.
- A picker's list starts at its cell's left edge and is as wide as its longest option (never narrower than the cell). Rail names appear inwards. The app header throws a drop shadow.
- Carousel arrows step within the deepest open level (sections, categories, groups) before leaving it.
- **A card opened from a floating card.** A tile inside a floating card (an Objective on its Goal's card) opens its own card in the same place (OpenCardContext is provided by the floating layer). A card alone shows its place in its list (Objective 3), and its x removes it (no blank put in its place).
- **A section of a dialog stands on the dialog** (the Value Proposition, the Segment's Description): no frame of its own.
- **A floating card has its tile's colour**: the hue of the section whose tile opened it (the dialog's), whatever hue its own content carries (`--floating-hue`, section-tiles.css).
- **The "i" note opens above its "i"** where there is room, below where there is none.
- **A floating card's ground is checked in all three themes** (light, sepia, dark): the card and the dialog it was opened from take their ground from the same hue, the card one step deeper; a card's own neutral ground (`--bg-card-tint`) is never drawn on it.
- **A card's navigation** (Goal, Objective, Metric with two or more under one parent): the left arrow under the "+", the right under the x, the bullet rail under the right arrow (one bullet each, this card's lit), sticky while the card scrolls; an arrow or a bullet goes to that card (scrolled to where it stands, opened where it is a tile's floating card). Outside the card, beside its x, a symbol of four arrows pointing at the centre shows the cards as tiles (the Metrics of an Objective switch to tiles; a Goal's or an Objective's own floating card is closed).
- **Global: arrows that step through a list carry a rail.** Under the carousel arrows of a card or a section dialog (`CarouselArrows`, SectionTiles.tsx), under the right arrow, a vertical rail has one bullet for each of the list (this one's lit); pressing a bullet goes there, and hovering it shows a tooltip with the name (a section's title; a card's group and number where the tile gives no name). Any new set of arrows that steps through a list gives the list's items (`CarouselStep.items`, `current`, `go`).
- **Arrows and rails 12px from the frame**: `--rail-offset` (12px, `bullet-rail.css`) places the Pages and Sections rails' bullets and the page arrows; `CAROUSEL_ARROW_GAP` (12, `SectionTiles.tsx`) places a dialog's or card's arrows. The same on every page.
- **Rails**: a card's carousel bullet names the card (`SectionTile.nameFor`, else the tile's line that opens it); a tile's bullet carries its name beside it (`.carousel-rail-named`, drawn on the tooltip's chip) where the room right of the arrows is 160px or more.
- **Scrolling is global** (`useScrollRules.ts`): the wheel over an open layer scrolls the layer (also over a dialog's blank body, where `overscroll-behavior: contain` stops the chain), never the page; every scroller whose content is taller than itself (`main.conversation-content`, a dialog's body, a tall card's stack) gets `data-reserve`: 25vh of bottom padding.
- **Page tab** (`bullet-rail.css`, `useRailTab.ts`; `.carousel-rail-tab`): a rail stands in a tab touching the frame (absolute, as wide as its names), `--rail-left-*` / `--rail-right-*` colours read from the frames.

## 11. Business cards: Infrastructure & Capability, Customer Engagement

- Cards' x (`.card-remove`, `.profile-card-remove`) is `--bg-danger-strong`; a cell's or field's x keeps `--x-red`.
- The link line of a connected card (`.business-capability-card-link`) is a flex row: prefix, the name (a button the ellipsis cuts), closing quote; one line.
- **Category cell** (Partner / Provider and Activity cards): ONE component (`categoryRow` in the editor): the `Category` label and its drop-down on one row under the name, the "Name the category" box only while a new category is being named.
- **Widths reverted**: `--side-label-short` is 156px again and `.card-box-open { --card-side-label: 124px; }`; the user asked for no cell-width change.
- One resource card (`resourceCard`); `workspaceBody` adds the Workspace fields in the card flow when the slot is in the `workspace` group: side-label rows for Workspace and Status (the label column and the 212px side cell as on every resource card), the cost row (Price 164 beside the currency at 176, Frequency to the name cell's right edge), the Deposit row (`.business-capability-deposit-row`: amount = the Price column, the currency text at the currency picker's x with its inner left padding). Removed with the merge: the standalone Workspace form (`workspaceFields`, `.workspace-form`, `.workspace-card`, `--workspace-label-width`, `--workspace-form-width`), the Workspace floating variant (`.floating-card-workspace`, `kind: "workspace"`, the "group" centre), the Workspace category tile/box logic and its Add Workspace, the `workspaces` list and `createBusinessWorkspace`, the FloorKind "workspace".
- A new resource card is filed under `unassigned` (Category) / `unassigned` (Group): placeholder "Select", incomplete until chosen.
- A new Activity / Partner / Provider card starts at Category "Select" (incomplete till chosen), like a Resource.
- **Resources rows (activities)**: a row is a dropdown (`OptionPicker`) with the link symbol, one row per resource, "+" adds a row; never a tick list. Performers use the same row. A people card in Offering's Capability uses `.business-capability-people` in `section-tiles.css`.
- **Group label order in a card**: Category, Group, Name. A partner or supplier card has no Category row.
- **Cost row additions** (cost option, billing type, rate override, useful life, warranty, amortisation period, payment plan, extras, dated notes) sit inside the existing cost row on the same two-column label rhythm (`--space-field`, `--space-label`); the rate override's placeholder shows the Global Settings default.
- **An activity's Resources list** is a list of rows like the Performer's (`.business-capability-resource-row`): dropdown, units box (56px, `.business-foundation .interview-input.business-capability-people`), link symbol (38.5px), and the "+" or × in the head's x column. Every row keeps the places of the units and of the link (`.business-capability-row-spacer`), so the dropdowns of a list end at one x; the field extends into the x column by the column's width and the gap (`margin-right`). The estimated cost of each linked card is a muted line under the list (with two or more, then the sum), never beside the row. The check tests it as "every Resource dropdown has one left and one right edge" and "the + or the x beside a Resource stands in the head's x column".
- **The Performer's link symbol**: beside a partner or supplier performer, between the dropdown and the "+" or ×; the dropdown then ends one link place (38.5px and the 8px gap) before the name cell's right edge, in every row of the list.
- **One label column** for the Performer and the Responsible stacks of an activity (`--activity-label-column`, 7.25em of the body size), so the Performer's dropdown and the Responsible's name start at one x.
- **The link symbol stands at the LEFT of its dropdown.** It is drawn first in the row and its slot (38.5px and the 8px gap, `--link-slot`) hangs out to the left of the dropdown into the label column, which is wider by that slot in an activity (`--activity-label-column`). Every picker still starts at the column's edge; a row without a link keeps the empty slot (`.business-capability-row-spacer`). It applies to the Performer, the Resources of an activity and the Name rows of a status. A founder performer has a link too (it opens the founder's card).
- **The Resources of an activity**: the tick, the label and the first dropdown are on ONE line (`OptionalField` with `inline`, subgrid of the activity stack); the dropdown starts at the Performer's and the Responsible's x. The cost lines stand under the dropdown.
- **End date is optional**: a tick before its label (`BusinessField` with `tick`); the date field shows once ticked, and unticking clears the date.
- **Linked Offerings**: with several, the percent each carries is a whole number of two digits (`.business-capability-share`, 56px) at the end of its own row, its right edge at the "+" and x column. The old rows below the list (a wide box and a text) are gone.
- **Group, not Category, on a partner or supplier card** and on a resource's Partners & Suppliers status: ONE Group dropdown listing every group of the place (Partners' first, then Suppliers'); the group picked says which of the two the card is. The Type field of a Pre-Operational activity is removed.
- **The payment plan** (`.business-capability-plan-row`): a payment is one row, amount | percent | date (an Instalment's order number before them: `1.5em 88px 80px 1fr`). Deposit & Balance: two rows. Instalments: a one-digit box (`.business-capability-plan-count`, 56px) beside the type makes that many numbered rows. Milestones: two rows each, the stage with the "+" (an x after the first) and then the values. The amount and the percent are one figure (typing either sets the other); the total must be 100%.
- **A card's cells start at one left edge.** An activity's Start date, End date and Group start where its Performer and Responsible do (`--side-label-short` 177px for the card). A founder's Start date: its label ends where the Salary cell ends, its cell starts where the Frequency cell starts (`--founder-cell`, 108px, for both). A Legal expense's Date: its label's words end at the Cost cell's right edge, its cell starts where the Frequency cell starts; its Responsible picker starts there too.
- **"Responsible" is the same field on every card**: a tick (on until taken off; off clears the choice) and the picker beside it (`BusinessField` with `tick`); the Legal expense's "Responsibility" is now that field, shown where there is more than one founder.
- **One set of measures for a card's fields** (`global.css`): `--card-label-col` (177px, the label column of every side-label row, so Start date, Group, Performer, Responsible and Frequency start their cells at one x on every Business card), `--card-cell-gap`, `--card-cell-narrow` (108px, a founder's Salary | Frequency pair) and `--card-x-col` (the delete x's column). A card's content runs from the name's left edge to its right edge; a founder's card, with no name cell, keeps the same left (after the number) and right (the x's column clear).
- **Links between cards, both ways**: an activity's Performer, Responsible and Resources rows open the founder, partner or resource (a pair of floating cards); a partner's card lists the activities that name it as performer, a resource's card the activities that list it, each a link.
- **An optional field is a tick box** (`OptionalField`): the Legal requirement's Reference or Number, like its Description; a founder's Skills kind drop-down is one width on every row, the empty one included.
- **Links between cards, checked in every direction** (Lumen & Loom, 62 cards): a resource links to its supplier, to the activity its status chooses and to the activities that list it; an activity to its performers, its Responsible founder, its partners and its resources, and back to the resource that chooses it; a partner or supplier to every resource that names it (by its status or a further status row) and every activity it performs; a founder's Responsibilities to its activities; a Customer Channel's card to its channel; a tile's circles show what a card is connected to. Each opens the other card with this one (a pair).
- **The "Open ..." links of a card are last in it** (`linksSection`): one is the line itself; several are a folded section named Links, its label at the left with the other labels, the fold arrow after it and the count beside it. A card's circles (the linked indicators on its tile) match its links: every activity a resource is listed in, and every resource an activity lists, is a circle on both tiles (`floorRows`).
- **The Links fold arrow stands at the left of its label**, hung in the margin, so the label starts where the card's other labels do.
- **The Links of a card are laid out as a founder's Responsibilities**: the same row (fold arrow, label, count) and the list under it, its lines 6px apart. A field-by-field measurement of the card kinds is in `card-field-measures-report.md`.
- **A link line is a kind letter, then the name**: R. Resource, A. Activity, P. Partner, S. Supplier (the noun's first letter, one fixed column), then the name as the link; no "Open", no quotes (its tooltip and accessible name keep the full "Open Resource “Name”").
- **Every cell of a card is `--card-cell-height` (44px) high**, a date cell included. A Status picker is narrower than the other side-label cells on purpose: its "+" stands in the x column (159 + 40 = 199).
- **A Legal requirement's or expense's floating card stands on the Business card's geometry**: the same three columns, name cell and side-label rows (label in `--card-label-col`, cell to the content's right edge). A colour's and a typeface's card share one label column, as wide as its longest label ("Colour (i)"), then 12px, then the cells, which both end at the name cell's right edge. A card a Customer Channel made shows its Category and Group as text where the other cards' cells stand.
- **Legal Entity links**: an expense shows a link symbol beside "Linked registration", a requirement beside "Add to Legal Entity Expenses", a linked number a symbol hung at its left; the tiles carry the second (link-coloured) bullet on linked lines (`OPEN_EVENT` opens the other card or section).
- **The cost row**: the currency cell is 66px (its left edge stays at the label column), the Frequency takes the rest of the row, to the content's right edge.
- A side-label cell (Category, Group, Responsible, Status) keeps its one fixed width and one line; a sole-option Group stays a disabled cell like the Category's, never plain text.
- Linked resources of an activity: one line each (name left, cost right), "no price yet" where none; the Total ends the list. Rate override is optional (a tick).
- Payment plan rows: [amount (what is left)] [percent: a 44px square, right-aligned] [the date cell, 212px]; 12px between cells; a milestone's name runs the card's name cell with its "+" in the x column. The date cell is 212px everywhere (the Start date cell).
- A requirement ticked "Add to Legal Entity Expenses" makes one expense (named as it is, text-link name, no Linked registration); the two open together, the requirement above. A linked registration number carries its link symbol inside the right of its cell.
- Activity costs: the partners and suppliers named as Performers are costed after the last performer; a rule stands over the Total.
- Customer Engagement: "Channel" is the old Channel Category and "Subchannel" the old channel; "Channel expenses" (was Channel resources) has Cost (currency in its heading), Frequency, and a Channel column of channel / rule / subchannel.
- Customer Relationship: per relationship type a block (type beside its label, Purpose, then the Engagement Strategy with the stages side by side, each Goal with its ticks under the label); "+ Add Relationship Type" follows the last block.
- Channel expenses: "Channel Expense" column; a percentage's symbol is in the Frequency column ("% of revenue") and its behaviour is Variable; several subchannels are a bullet list; actions two to a row.
- **A channel opens as tiles of its subchannels**, each opening a card with the table of that one subchannel (1300px or more wide, the width the table needs).
- **A subchannel's card** names the subchannel in its table head ("Instagram"); its channel's row and the "+ Add Subchannel" row are not drawn; its x removes it.
- **Goal & Approach** are one title with an "i" beside each word; the Engagement Strategy has no row of labels.
- **A Delivery card follows the opened card's columns** (marker, content, x): everything under its head starts at the name's left edge; each person's hours stand in the label column and cell column of the card's other side-label rows. (This replaces the earlier exception that left the Delivery card out.)
- **A subchannel made by pressing a tile not used yet** opens its card at once and, left with no name, no link and no stage, is taken away when the card is closed.
- **A page of small tiles on a wide card** (the Roadmap) keeps the 215px tile of every page. **Demand & Conversion**: the channels that bring the customers stand in a row of their own under each Offering's sources (the ticks in a line), not in a column of the table.
- **Order number inside the name cell (every opened card)**: the number is drawn over the left of the name cell (10px in) and the name's text starts at 38px; the marker column is gone (`--card-marker-col` and `--card-marker-gap` 0, `--card-x-column` 40px), so the name cell and everything under it start at the card's padding and the cells widen by the 40px the marker column took. The list of card kinds and their heads: `docs/ai/card-kinds.md`. The founder's card (no name cell) keeps its marker edge.
- **Channel card without wires**: the parts of the card (Offerings, a Journey Stage with its Actions, links, expenses) have no border or padding; they stand on the card's 12px, end where the name cell does (40px before the card's padding; a stage's × stands in that column), 12px apart (6px between a stage's picker and its actions).
- **A category with one group** shows that group's tile (`SubcategoryBoxes`), so arrow navigation into it never makes a blank card.
- **Channel card**: Offerings are tick boxes (`BusinessTicks`: "All Offerings" first, at least one ticked); "Links" has its cell under its label; labels and part labels are the global label style; a name the app wrote is 18px semi-bold.
- **A legal card has one ground**: the tile content around it has none (no square box behind its round corners).
- **x column 44px** (`--card-x-column`), a channel card's parts are tinted bands (`--part-tint-a`, `--part-tint-b`) with a hairline between Journey Stages.

## 12. The Inventory help tile

- The Completed tile stands outside both sections (`.section-tiles-completed`, under Offering's Capability's card); while it exists the "Offering's Capability shows all its tiles without a bar" rule is waived (the card scrolls inside).
- The row under Offering's Capability's card (Inventory, Completed) is 66% of the card's width.
- **Funnel**: portal to the overlay, outward beside the dialog when there is room; Status / Frequency are `OptionPicker` (hug, tight).
- **The Inventory funnel menu is 250px wide** (`.strategy-sort-menu-wide`; max `100vw - 24px`): long labels ("Digital Infrastructure", "Online Presence & Communication") wrap onto two lines, "Partners & Suppliers" stays on one, never widen the menu for a label. Its height is capped to the window (scrolls inside), it opens outward where there is room, and the Cost from / to cells are 6.5em (91px). Buttons read "High to low" / "Low to high", the tick "Linked".
- The Inventory funnel menu uses only `--space-field` (12px: padding, between blocks, around a block's label, between sub-lists and fields) and `--space-label` (6px: between ticks, label to control, between the two cost buttons / cells). Include, Belongs to and Sort have a fold arrow (`title-arrow`, button, `aria-expanded`), open by default, the state kept while the overview is open; the menu is never taller than the window.
- Funnel blocks: Include, Sort, Belongs to (folded at first, arrow right after the label), then Status / Frequency / Linked / Costs; cost order = two arrow buttons beside Costs; range labels From / To. Tick boxes: `align-items: center`, no margin on the box.
- Inventory table columns exactly: Name, Type, Section, Category, Group, Cost, Frequency, Status, Linked; Linked only the link bullets; no sideways scroll at 1366.
- A Customer Channel card's Group is "Channel" (table column, last tile line, funnel Group list).
- **Table mode** uses `--table-ground`, `--table-ink`, `--table-line`, `--table-tint`, `--table-hover` per theme (ink at least 7:1), a sticky heading, and the sizes 14 / 18 / 24px (`--font-small`, `--font-body`, `--font-h3`).
- **Inventory** (formerly All Tiles): the table has two more columns, Cost Nature and Behaviour, after Frequency (`inventoryClassification`: the same rules as the Financial Foundation). The legend says Supplier for what was Provider; "Partners and Providers" is "Partners and Suppliers" everywhere.
- Inventory and Completed are 215px squares; only when the window's height asks, their height shrinks (rectangles). The gap between the four tiles follows their size from 12px.

## 13. Identity, Brand and Strategy: column pages, Legal Entity, Brand Style, Founders Profile, Strategic Period

- **A strategy card's navigation** (`CardNav`, in the margin lane at the card's right edge): the two arrows are the page arrows at 15/22 of their size (their shape, box, grow-by-a-fifth and ring), in the colour of the head's "+" button (`--accent-ink`), not the card's ground, so they stand out from it; the rail's bullets take the same tint. The arrows stand on the centre line of the card's Description label; their vertical sides stand 12px from the card's edge, one on each side: the left arrow's on the x's right side, the right arrow's on the left side of the symbol of four arrows above it (the owner's marked picture, 2026-10-14). The symbol and the rail stand 12px from the card's edge.
- **A strategy card's head**: the "i" is 6px (`--info-gap`) after its word, like every "i"; the "+" is 12px after the "i" and the x 12px after the "+" (the owner, 2026-10-14).
- **Channel expenses (Page 2)**: "+ Add expenses" and "Typical costs for this channel" are card-list add buttons in the channel cell, same size as "+ Add Journey Stage"; template cards use the channel teal tone (`--channel-marker`) and the cascade link rules above.
- **A column's guidance is the "i" beside its dialog title** (`DialogHeading info`), never bullets under it. The guidance of the Brand pages (Style, Inventory) and of the Themes (beside the Add Theme button) opens in a note of double the one width (`InfoNote size="double"`, 720px).
- **A founder's card in its dialog** stands one field under the other (`.founders-profile-row`), so every row has the room it was drawn for.
- **Legal Entity** is four large tiles: Organization, Founders & Ownership, Registrations, Expenses. Registrations holds 3. Formation & Registration, 4. Tax & Business Registration (both with no frame) and the Additional Legal Requirements as card tiles. Its tile lists the state and the names of the registration numbers; a requirement's card tile says its Type and whether it has expenses; an expense's says its start date and its registration.
- **A legal requirement's or expense's card in its tile** is a grid of the head's own columns, and everything under the head stands in the name's column (`.column-tile-content .legal-entity-card`): the Type, the Date and the Responsibility have their label beside the control, to the name cell's right edge; the Reference or Number and the Linked registration are as wide as the name cell; the Cost and the Frequency share the row. "Add to Legal Entity Expenses" is one line.
- **The Style page carries the Icon & Logo and the Brand Images** (the Inventory page is gone): four large tiles. The Inventory's answer is saved as the Style answer's `inventory` (StorageService moves a saved one; the examples were moved). The page's sections are `BRAND_STYLE_PAGE_SECTIONS`.
- **Founders Profile**: a founder's tile lists the roles, a line (`TILE_DIVIDER`), then the skills and degrees, with bullets; the dialogs have no frame; the Skills' kind drop-down is half width.
- **Help notes**: the Brand pages' and the Themes' note is 480px (`InfoNote size="double"`); the Strategic Period's title note holds the period and the Themes guidance, the one beside Add Theme the common Themes. The period's Start, End and the plan's dates stand in the dialog's second column.
- **No Sections rail on a page drawn as tiles** (`drawnAsTiles`); the sections are still the page's (the rail items name them elsewhere).
- **The colour map** (`WorkColours.ts`, docs/design/01-current-design.md, part I) colours the tile pages: Definition, Ambassador and Style Create (purple), Ethics Decide (orange), Legal Entity and Founders Profile Define (green), Situation & Direction Discover (blue).
- **A page can hold several sections** (`PageGroups.ts`): Identity page 1 "Definition and Ethics" (the chapters Definition and Ethics), page 2 "Organization" (Legal Entity, Founders Profile); Brand's one page (Ambassador, Style) has no page name. Each section keeps its number, its title and its saved answer; the frames stand side by side, each with its heading ("1. Definition") on top of its tiles, as the Business System's Infrastructure & Capability page does. The first section is the page's own; the others are companions, not pages of their own (the pages rail, the arrows and "What it covers" skip them).
- **Without a Sections rail, no rail title** (`BulletRail`).
- **The Registrations dialog** shows its three sections as sub tiles (`SubTiles.tsx`): Formation & registration, Tax & business registration, Additional legal requirements. The Legal Entity's tiles are in sentence case, with no order numbers; card tiles of requirements and expenses have centred lines with no bullets.
- **Column answers as parts**: Ethics' Values and Principles are numbered lists; the Ambassador's Imprint is two texts, the First and the Lasting impression (the one answer, "First impression: ... Lasting impression: ..."); the Founders' Capability is two texts, Gaps and Cover (`teamCover`).
- **A page's name in the pages rail** is its group's (`PageGroups.ts`): Definition and Ethics, Organization, Brand System; its frames are numbered 1, 2 within the page, with their own names where given ("Founders & Capability").
- **A frame's heading** (Identity and Brand pages of several sections) is the column title of the Business System: 28px, and its tiles start at the same distance below it.
- **Registered is worked out, never chosen** (`formationStatusOf`): a registration number in the first row says Registered, none says not yet (a form with no company registry, a sole trader, counts as registered once it has a date). The Status is text; the Number is always asked; the Formation date shows once there is a number; the other numbers (a trade mark) never set the status. A number that looks short is questioned, not refused.
- **The registration authority is the country's own, filled in and shown as text** (`registrationAuthorityFor`): the user cannot mistype it. A country the app does not know leaves it a cell to write.
- **The Formation card**: no Status (the number registers it); the Date stands on the registrations' columns (its label ends where the registry's name, text, ends; its cell over the Number) and is no later than today; a list of further numbers takes at most five (`MAX_MORE_NUMBERS`), the registrations' and the tax registrations' alike.
- **A registration number takes only what its country's numbers hold** (`registrationNumberRule`, from the stated shape): "8 digits" takes digits only, no more than 8; "8 characters" letters and digits, no more than 8; a shape with separators takes what it shows. Further numbers (a trade mark) take up to 30 characters. The UK's UTR (and Brazil's CNPJ) follow the same rule through `taxIdNumberHint` (10 and 14 digits).
- **A founder's card, everything after the number**: the roles' bullets and the Responsibilities / Completed arrows start at the content edge (where a name's cell would), with their words after them, not hanging in the number's column. A founder's Skills kind drop-down is 14em on every row and its list as wide as the cell, so no kind takes more than two lines.
- Foundation: each Segment frame has four tiles: Segment (Description and Profiles), Value Proposition, Competitors, Offerings. Legal Registrations' tiles and Expenses' tiles carry circles for what they are linked to.
- Legal Entity arrows: between the page's four tiles (Organization, Founders & Ownership, Registrations, Expenses); inside Registrations between its three sections; between the requirement cards; between the expense cards. A second bullet in a list means a channel's cards only; a link is a circle.
- Foundation: each Segment frame has Customers (Description and Profiles as sub-tiles), Value Proposition, Competitors and Offerings; every part is a floating card on its own tile.
- Strategy: Goals & Objectives is a tile per Theme (several Goals: a tile per Goal, each floating); the Roadmap is one large tile. Delivery shows a tile per Offering's Delivery card.
- Strategy cards (Goal, Objective, Metric) have no fold arrow and no grip; a card head is one row: number and "i", the name cell, its buttons. Generated tiles (Goals, Objectives) have a label above them; a Theme tile has a "+" to add a Goal. The Roadmap page has no Sections rail.
- Value Proposition is a section of a Segment (a tile that opens a dialog and is stepped through by the arrows); a single founder is a section of Infrastructure, likewise.
- **One founder**: Salary, Frequency, Working Hrs and Delivery Hrs stand beside their labels, in cells of the same width as before.
- **Strategy cards (Theme, Goal, Objective, Metric) heads**: the order number stands inside the name cell, then the kind label with its "i" (capitals), a "+" and the x; the "+" adds a NEW CARD OF THE SAME KIND beside this one (a Theme, a Goal, an Objective, a Metric); there are no other "+ Add" buttons. What stands under a head starts at the name cell's left (12px) and ends 12px before the x (a 56px margin at the right). Two tints only (the Theme's and the Objective's), swapped from card to card; the x and the "i" have no fill at rest.
- **The Strategy System is one page** ("4. Strategy System", no page number; its rail names it): its frame is headed "Situation & Direction", centred. The Strategic Period's Goals, Objectives, Initiatives and Metrics are written in each Theme's card; the old pages 2 (Goals & Objectives) and 3 (Roadmap) are hidden sections (`HIDDEN_SECTIONS`, PageGroups.ts): they keep the saved answer but no page, bullet or arrow shows them.
- **The Strategic Period's tile** has a "+" (a Theme made and opened as a card with all its sections) and a hairline after its dates. Its dialog: the Start and the End side by side from the left edge, the Financial Plan in one line under them, then the tiles (the Roadmap, each Theme, and an "Add Card" tile of their size, which keeps the suggested Themes' menu). A Metric tile says the Objective's period, then its Baseline and Target.
- **Founder's card in a page frame (labels beside cells)**: the four cells (Salary, Frequency, Working Hours, Delivery Hours) are 108px in two pairs; each label column is as wide as its widest label (at least 8.8 body-em, the Start date's column too), 12px before its cell, so no "i" runs under a cell.

## 14. Financial pages and Global Settings

New fields follow the rules above and reuse their neighbours' shapes; nothing here is a new pattern of its own.
- **Costs table (Page 4)**: one more column, **Cost nature**, after When, with an i in its header (`business-foundation-label-info`) and an `OptionPicker` (hug) in the row, plus a muted line for the part before the opening (the three classes that drew them were unused and are removed on 2026-10-16: the Financial sections will change). The Amount column (header and cells) is right-aligned and holds the figures alone; the currency is written once, in its header ("Amount (EUR)"). The grid's template in `conversation.css` has the extra column; the row's remove cell stays last.
- **Opening Date**: a date field beside Plan Start in the same row style, same label size and field width; no new row height.
- **Funds** (`data-anchor="financial-funds"`, under Funding Need): the same cards as the funding-need cards (`.financial-need-card`) in the same grid; the Total Pre-operational Budget is a `.financial-total` line under the costs (`data-anchor="financial-pre-operational-budget"`). Without an Opening Date the block is replaced by one muted sentence.
- **Global Settings** (`/settings`, `pages/GlobalSettings.tsx`, `styles/global-settings.css`): a page of ordinary cards and fields on the existing tokens, opened from the **Settings** button in `AppHeader` (`SettingsButton`), which takes the header's button size and spacing; no new sizes.
- **Plan Start is never typed** (`derivedPlanStart`): the earlier of the Opening Date's month and the month of the earliest costed Business card; the Global Settings show it as a read-only line. A cost dated before it (a registration paid before the plan, for one) counts as already paid, as the model has always had it; the Legal Entity's expenses do not move it. It is kept in the Financial Foundation answer too, so the documents read the same month.
- **The Opening Date** is the one date the user chooses; a warning says when it is before the company was formed.
- **VAT is answered once, on the Legal Entity.** Not registered there: Global Settings says "Not registered" and offers no choice. Registered: the one choice left is Amounts including or excluding the tax (`effectiveVatBasis`).
- **A "Per unit" frequency** is one option per unit of the group ("Per hour", "Per kg"); the plain "Per unit" is offered only where the group has no unit of its own.
- **Default useful life** (Global Settings > Assets): every asset group has a default, from `UsefulLifeReferences.ts` (IRS Publication 946 and the Texas DFPS asset schedule, 2026-10-10); an "i" beside the title says what useful life is, and one beside each group lists its 6 to 8 popular items with both schedules' lives and the sources as links.
- **Global Settings follows the Business style**: every detail is in an "i" beside its label; the Assets section is one table (capitalisation limit, each group's useful life, each asset's own years); Reset sets a group, or all of them, back to the default.
- Global Settings: figure boxes are 112px; the Assets table has four fixed columns (Asset, Cost, Useful life, Reset); the Capitalisation limit sits in Cost.
- Global Settings > Assets ends with "Intangible assets" (amortisation years by group, with FRS 102, IAS 38, US section 197 and common-practice sources).
- Global Settings: Intangible assets list only the groups that hold a card, each card numbered under its group with its own years.
- **Costs (4. Financial Foundation)**: three totals (Launch budget, Running costs a month, Cost of each sale), the Total Pre-operational Budget written as capital expenditure + startup + pre-operating, filters (group, Offering, nature, order), then one table under four headings, with "Not counted yet" last.

## 15. Dates, order and formats

- **A card's date is today when it is made or switched on** (`createBusiness*`, `createLegalEntityExpense`: Start date today; ticking End date sets today, or the Start date if later). Turning a Payment Plan on gives the card a Start and an End date (today) where it has none, since the plan's dates fall between them.
- **The date defines the order, then the number** (`orderedByDate`, applied on every change of the Infrastructure & Capability page): each list of cards is kept in Start-date order (ties keep their place; no date goes last). The founders keep the Legal Entity's order.
- **A day is shown in the reader's date format everywhere** (`isoToDisplay` with the preference): the date cells (`DateCellInput`, now also the Legal Entity's Formation date and expense Date, and the generic date field), the card tiles and the Registrations tile.
- **Where a list has a date, the date defines the order**, then the number: the Business cards (Start date) and the Legal Entity's expenses (Date).
- **The day in a date cell** is written at body size (`--font-body`), the size of the text around it.
- **The Calendar lists every card date** (`CalendarCardDates.ts`) and has a funnel (`CalendarFunnel.tsx`): the period (Today, Tomorrow, This week, Next week, This month, This year, Xmas, the user's own) and the kinds of date (the recommended ones, all, or chosen).
- **Dates are limited where they can conflict**: an End date is not before its Start (a Start after the End takes the End along), a payment falls between Start and End, a warranty is not before the Start (`min` / `max` of `DateCellInput`).
- **A note's Date** is a tick; ticked, its label is the day to pick and the note stands on that day of the Calendar.

## 16. Texts and names

- **Text**: no em dash in any app text or source (`noEmDash.test.ts`).
- **Notes (the side window)**: each note shows "Recorded <date and time>" (read-only, muted, 14px) under its text, and an "Add Date" text button beside "Link a field" (`.notepad-note-actions-text`) that adds today's date to the text on its own line. The Description of a card carries no stamp and no button.
- **The "i" of a category's dialog** (Resources, Partners, Suppliers) says the help text of its groups from the help-texts document: the text of its one group, or one line for each group ("Company Vehicles: cars and bikes ..."). Opening one group of a category shows that group's own text.
- **Names**: the Ambassador's "Attitude & Body Language" is "Body Language" (its saved key stays `attitude-body-language`).
- **A drop-down with nothing chosen says "Select"** (the Legal expense's Frequency and Responsible, the Strategy's Responsible).

## 17. The check

**The progress line** (the thin bar under the Hide Help button) is hidden for now; one switch, `SHOW_PROGRESS_LINE` in `src/components/InterviewProgress.tsx` (false). No check or rule depends on it, and no gap is left behind.

`scripts/layout-check/layout-probe.js` measures a page in the browser;
`scripts/layout-check/run.mjs` opens every Foundation page of both examples
(`src/data/examples`), every card unfolded, at **1920, 1366 and 768px** in
**light and dark**, runs the probe and the hover check, and lists the
failures. **It must report 0 failures.**

Rules checked: number-left = body-left; number to name gap (8); control at
its column's left edge; same-row tops; list x column; add button spans its
list; side-by-side bottoms; text box not clipped and at least two lines;
picker one line; nothing overflows its card or the page; text beside a
control on its centre line; tick box on its words' first line; an "i" on its words' line, 6px (`--info-gap`) after them; a hierarchy
level on its row's centre line; control width is a size step; single-line
control height; card side margin; page grid column, row and box gaps (12); label gap (6) and row gap (12, or 24
across a dividing rule) in every card; section tiles (a square of `--section-tile-size` -- a third of the group's width less the gaps, one size per card, three across fill the group --, title centred, 12px apart, left-aligned) and everything inside each tile's opened dialog; and the hover reactions above.

Run it with the dev server up (`npm run dev`, port 1420):

- **With Node**: `node scripts/layout-check/run.mjs` (needs the
  `playwright` package; not a project dependency). Exits 1 on any failure.
- **From an agent's Playwright browser tool**: evaluate `run.mjs`'s
  functions with `page` bound (strip its imports and `export`s, fetch the
  probe from `/scripts/layout-check/layout-probe.js`, the examples from
  `/src/data/examples/`), then call `runLayoutCheck(page, { probe })` for each
  seeded example. The check writes the examples into the browser's storage:
  back up and restore localStorage around it.

**The real mouse.** `checkRealMouse(page, where)` in `run.mjs` (called for page 3 at 1366 x 1000, 1366 x 700 and 1920 x 1000) presses every list item of every first-row tile, the page scrolled to its top, with real mouse events (move, down, up): the item must not move 0.5px between the press and the release, its card or dialog must open, Escape must return to the default page (no tile grown, no ring on a mouse-opened opener), and one Enter-opened item must keep its ring on closing with no tile grown. (The old code fails it: 38 failures at 1600 x 780.)

**Section tiles.** The page is measured as drawn, then
`await window.__layoutProbe.checkWithTiles(spec)` (what `run.mjs` calls) opens each
`.section-tile` in turn, unfolds the dialog ("Expand all", then any arrow
still folded), runs the same checks with the dialog open (each failure names
its `tile`), and closes it with Back. Call it instead of `check(spec)` on any page
with tiles; on a page without, it is the plain check.

The probe's pure helpers are unit-tested in `src/test/layoutProbe.test.ts`.

- **Probe**: hover is held (`holdHover`) so tile-geometry rules ignore the 110% scale; the dialog rules compare with the section card's rect; several Add tiles may end a grid; an empty group tile (`section-tile-slot-empty`, 50%) may list nothing.
- **The check**: the full layout check (`scripts/layout-check`) must be run once over these additions (task J3); they are not yet covered by a recorded run.
- **The check**: the layout check (`scripts/layout-check`) was not run over this round (the `playwright` package is not installed here).
- **Layout probe**: a remove x keeps 12px from the cell beside it and never lies on one.
`npm run check:layout` runs the layout probe (`scripts/layout-check/`) on every page of the Quillfield example (1920 wide, light page) and fails only on a finding that is NOT in `scripts/layout-check/baseline.json` (the findings known and accepted so far; random ids of cards made by a "+" are ignored in a finding's key). It says how many known findings are gone. `npm run check:layout:baseline` rewrites the baseline after findings were fixed on purpose; `CHECK_PAGES="Customer Engagement" npm run check:layout` runs one page; without `--quick` (`node scripts/layout-check/run.mjs`) it runs every width, both themes and both examples. A full run takes about 25 minutes; a sub-pixel finding (a gap of 12.95 for 12) can come and go between runs.

### The stylesheets stay clean (2026-10-16)

`npm run lint:css` fails when a stylesheet holds a rule for a class that no component draws, or a declaration that a later one of the same selector always overrides (`scripts/lint/css-usage.mjs`, `css-shadowed.mjs`; the flag remove, with a file, deletes what they list). `node scripts/catalogue/style-snapshot.mjs` with the flag out and a file name writes the box and the computed style of every element of every page, opened tile and first card, in light and dark at 1920px and light at 768px (about 107,000 elements); the flag compare, with two snapshots, lists what differs between two snapshots, so a clean-up can be proved to change nothing. How the stylesheets are laid out: the custom properties of the app are in one TOKENS section at the top of global.css, in seven groups; conversation.css and section-tiles.css are lists of imports over a folder of the same name, one file per topic, in the order of the old single file (the cascade follows that order, so a rule is moved between files only on purpose); a relative url() in those files is one folder deeper. A test or a tool reads such a sheet with its imports in place (scripts/lint/css-imports.ts). A few elements move between two runs of the same code (the Registrations tile of Identity: Organization, the carousel arrows at 768px): those are timing, not the change.

### The automatic check (after every layout change)

`npm run check:layout` runs the layout probe (`scripts/layout-check/`) on every page of the Quillfield example (1920 wide, light page) and fails only on a finding that is NOT in `scripts/layout-check/baseline.json` (the findings known and accepted so far; random ids of cards made by a "+" are ignored in a finding's key). It says how many known findings are gone. `npm run check:layout:baseline` rewrites the baseline after findings were fixed on purpose; `CHECK_PAGES="Customer Engagement" npm run check:layout` runs one page; without `--quick` (`node scripts/layout-check/run.mjs`) it runs every width, both themes and both examples. A full run takes about 25 minutes; a sub-pixel finding (a gap of 12.95 for 12) can come and go between runs.

## 18. The assets (generated from the contracts)

<!-- generated:assets (from src/library; do not edit; run npm run docs:assets) -->

Written from the asset contracts in `src/library`; the library runner (`npm run library`) measures the app against them in light, dark and sepia at 768, 1440 and 1920 px wide. A number here is the contract's, so it is the app's.

### Label arrow

One frameless triangle beside a label or a title that shows or hides what belongs to it. Outline at rest, filled under the pointer and the keyboard focus; right while hidden, down while open.

- **Kind:** fold arrow. **Code:** `src/components/interview/LabelArrow.tsx`. **Stylesheet:** `src/styles/label-arrow.css`.
- **Parts:** button (the hit area); triangle (svg polygon, 2px line inside its edge).
- **States:** rest, hover, focus, closed, open.
- **Used in:** chapter titles of 3. Infrastructure & Capability; a founder's Responsibilities and Completed; a card's Links; the Initiatives of an Objective.
- **Custom properties it reads:** `--label-arrow-size`, `--label-arrow-hit`, `--strategy-theme-hue`, `--plus-fill-saturation`, `--plus-fill-lightness`.

| Variant | Where | Note |
|---|---|---|
| field-label (18px label) | field-label | inside a label, left of the words (a founder's Responsibilities, the Initiatives) |
| title-row (28px label) | title-row | after a chapter title and its i, at the title's size (--label-arrow-size: --font-h2) |

| Number | Value |
|---|---|
| glyphWidthEm | 0.611 |
| glyphHeightEm | 1 |
| openShiftEm | 0.1945 |
| lineWidthPx | 2 |
| minTargetPx | 24 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by the asset's own fill; no ring or outline. Name: Names what it shows or hides, and says which (Show/Hide ...). Contrast it must hold:
- the arrow's tint (the + box's colour) (page): at least 3:1.
- the arrow's tint (the + box's colour) (card): at least 3:1.

### Plus box

A square button with a drawn plus that adds a card or a row. A swap of two colours between rest and hover or focus (transparent with a stroke at rest, filled under the pointer); it never changes size.

- **Kind:** add button. **Code:** `a <button className="plus-box"> in SectionTiles.tsx, SectionView.tsx, SubTiles.tsx, BusinessCapabilityEditor.tsx`. **Stylesheet:** `src/styles/section-tiles.css`.
- **Parts:** button (the square, 2px stroke); two bars (::before, ::after) drawn from the middle of the box.
- **States:** rest, hover, focus, disabled.
- **Used in:** page tiles that take new cards (Operational, Production, Marketing, Utilities, Equipment ...); Offering's Capability: Resources, Activities, Partners & Suppliers; the Activity card's Add Performer (small).
- **Custom properties it reads:** `--plus-ground`, `--plus-fill`, `--plus-size`, `--plus-bar`, `--plus-fill-saturation`, `--plus-fill-lightness`, `--strategy-theme-hue`, `--theme-bg-inner`, `--focus-ring-ink`, `--card-padding`.

| Variant | Where | Note |
|---|---|---|
| tile | tile | 32px, bars 14px, at the lower right of a page tile, 12px from the edges (.plus-box.section-tile-plus) |
| small | inline | 32px (the x's size), bars 14px, beside a row (.plus-box.plus-box-small: the Activity card's Add Performer) |

| Number | Value |
|---|---|
| sizeTile | 32 |
| sizeSmall | 32 |
| barTile | 14 |
| barSmall | 14 |
| barThickness | 2 |
| strokeWidth | 2 |
| radius | 6 |
| insetTile | 12 |
| transitionMs | 150 |
| disabledOpacity | 0.5 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| centreTolerancePx | 0.01 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Add <Item> to <tile>. Contrast it must hold:
- the plus and the stroke (the darker tone) against the page the box stands on (page): at least 3:1.
- the plus and the stroke (the darker tone) against the card the box stands on (card): at least 3:1.
- under the pointer: the plus (the ground colour) against the fill (fill): at least 3:1.

### Info note

A 24px round "i" after a label that opens a note. A swap of two colours under the pointer (the disc filled, the letter in the ground colour); it never changes size.

- **Kind:** round button. **Code:** `src/components/interview/InfoNote.tsx`. **Stylesheet:** `src/styles/conversation.css` (also `src/styles/section-tiles.css`, `src/styles/page-3-edges.css`, `src/styles/global.css`).
- **Parts:** button (24px disc with a stroke); the letter i (bold italic, small size); an invisible 24px hit area (::after).
- **States:** rest, hover, focus, open.
- **Used in:** after the label of nearly every field and every section or column title; dialog headers and the box names over a floating card; a tick box's label (outside it).
- **Custom properties it reads:** `--info-gap`, `--font-small`, `--line-primary`, `--text-primary`, `--bg-surface`, `--bg-primary`, `--text-on-fill`, `--theme-line-accent`, `--info-ink`, `--info-fill`, `--glow-color`, `--strategy-theme-hue`.

| Variant | Where | Note |
|---|---|---|
| plain | page | the base look: blue stroke and letter on a white disc, in a label outside any card of a hue |
| tinted | hue | inside a card or tile of a hue: stroke and letter in the card's tint (section-tiles.css) |
| page-3 | answer-columns business-capability | the page-3 card look: ground fill, 1.5px stroke, letter in --info-ink, a full swap on hover, focus and open (page-3-edges.css) |

| Number | Value |
|---|---|
| disc | 24 |
| hitArea | 24 |
| gap | 6 |
| strokePlain | 1 |
| strokePage3 | 1.5 |
| fontSizeVar | 14 |
| fontWeight | 700 |
| centreTolerancePx | 0.6 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: <label>: what this means (aria-expanded, aria-haspopup=dialog). Contrast it must hold:
- the letter against the disc at rest (rest): at least 3:1.
- the letter against the disc under the pointer, the focus and while open (swapped): at least 3:1.

**Known findings** (measured, not changed; to decide):
- `tinted-rule-overridden`: The rule that gives an "i" the tint of its card (section-tiles.css, ":where(.section-tile-overlay, [style*=--strategy-theme-hue]) .info-note-button", about line 3869) has the same specificity as the base ".info-note-button" rule in conversation.css, which the app loads after it, so the base wins: an "i" in a card of a hue that has no page-3 rule is drawn in the page blue, at rest and under the pointer. Measured with the stylesheets in the order the interview page loads them. Not changed; to decide.

### Remove x

A 32px square with a drawn X that removes a card or a row. Red stroke and X at rest, filled red under the pointer and the focus; it never changes size.

- **Kind:** remove button. **Code:** `src/components/interview/BusinessCardFields.tsx (RemoveButton) and the other cards that use .strategy-box-remove`. **Stylesheet:** `src/styles/remove-button.css` (also `src/styles/section-tiles.css`, `src/styles/global.css`).
- **Parts:** button (the square, 2px stroke); two bars (::before, ::after) turned +45 and -45 degrees, drawn from the middle of the box.
- **States:** rest, hover, focus, disabled.
- **Used in:** every card's delete and every row's remove (performers, milestones, costs, partners ...); the older removes that share its look: profile cards, brand holder clear, legal entity field remove.
- **Custom properties it reads:** `--x-red`, `--x-ground`, `--bg-surface`, `--text-danger`, `--text-faint`, `--line-card`, `--radius-md`, `--focus-ring-ink`, `--line-primary`.

| Variant | Where | Note |
|---|---|---|
| cell | row | an x beside a row inside a card's cell (a performer, a milestone): .strategy-box-remove |
| card | card | a card's own delete: .strategy-box-remove.card-remove |

| Number | Value |
|---|---|
| size | 32 |
| barLength | 14 |
| barThickness | 2 |
| strokeWidth | 2 |
| radius | 6 |
| disabledStrokeWidth | 1 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| centreTolerancePx | 0.01 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Remove <what> (aria-label and title). Contrast it must hold:
- the red stroke and X against the ground behind the box (page): at least 3:1.
- the red stroke and X against the ground behind the box (card): at least 3:1.
- under the pointer: the X (the ground colour) against the red fill (fill): at least 3:1.

### Rails

The Pages and Sections rails: a column of items, each a bullet and a label in one button. Rest, lit and hover looks; bullets only below 1700px with the name as a tooltip, labels inline from 1700px.

- **Kind:** navigation rail. **Code:** `src/components/interview/rails/BulletRail.tsx`. **Stylesheet:** `src/styles/bullet-rail.css` (also `src/styles/status-shape.css`, `src/styles/global.css`).
- **Parts:** nav (the rail); list (18px between items); item button (label, 12px gap, bullet; 2px padding above and below); bullet (a plain dot, or a page status shape); label (tooltip below 1700px, inline from 1700px).
- **States:** rest, hover, focus, open.
- **Used in:** the Pages rail (left) and the Sections rail (right) beside the interview card.
- **Custom properties it reads:** `--rail-dot`, `--rail-dot-active`, `--rail-bloom`, `--rail-dot-hover`, `--rail-hover-ring`, `--rail-status`, `--rail-status-hover`, `--text-subtle`, `--text-strong`, `--text-primary`, `--hover-bold`, `--bold-tracking`, `--line-primary`, `--tooltip-bg`, `--tooltip-text`, `--tooltip-border`.

| Variant | Where | Note |
|---|---|---|
| pages-left | left | the Pages rail: label then bullet; page status shapes (not started, in progress, defined) and the Introduction in capitals; one lit item |
| sections-right | right | the Sections rail: bullet then label; plain bullets; one lit item |

| Number | Value |
|---|---|
| bullet | 12 |
| itemGap | 12 |
| itemPaddingY | 2 |
| listGap | 18 |
| activeScale | 1.45 |
| hoverScale | 1.3 |
| activeRing | 4 |
| hoverRing | 3 |
| outlineWidth | 2 |
| outlineOffset | 4 |
| wideFrom | 1700 |
| tooltipOffset | 24 |
| minTargetPx | 24 |
| underlineOffsetEm | 0.2 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: The label (with the status word on the Pages rail); aria-current on the lit item. Contrast it must hold:
- a page status shape (its ink) against the page (status): at least 3:1.
- the label against the page, where labels stand inline (from 1700px) (label): at least 4.5:1.
- the label under the pointer (the link colour) against the page (hover): at least 4.5:1.
- the tooltip text against the tooltip block (tooltip): at least 4.5:1.

### Back button

The way back out of a dialog or card: a left-pointing triangle and the word Back. Plain at rest; the card's tint, thickened, under the pointer and the focus.

- **Kind:** navigation button. **Code:** `src/components/interview/SectionTiles.tsx (the dialog foot's .section-tile-back, the rail tab's .carousel-rail-back`. **Stylesheet:** `src/styles/section-tiles.css` (also `src/styles/label-arrow.css`, `src/styles/global.css`).
- **Parts:** button; back-arrow (a solid left-pointing triangle, 0.8em high); the word Back (capitals in the rail form).
- **States:** rest, hover, focus.
- **Used in:** the foot of every section dialog; the rail tab beside a dialog's card.
- **Custom properties it reads:** `--text-default`, `--text-primary`, `--hover-bold`, `--bold-tracking`, `--rest-tracking`, `--font-body`, `--focus-ring-ink`, `--theme-line-accent`, `--plus-fill-saturation`, `--plus-fill-lightness`, `--tab-ink`, `--tab-edge`, `--gap-6`, `--gap-12`.

| Variant | Where | Note |
|---|---|---|
| foot | dialog foot | < Back at the foot of a dialog: .section-tile-back |
| rail | rail tab | the way back in the rail's tab: .carousel-rail-back, capitals, built like a rail item |

| Number | Value |
|---|---|
| arrowHeightEm | 0.8 |
| arrowRatio | 0.7857 |
| footGap | 6 |
| footPaddingY | 6 |
| railGap | 12 |
| railPaddingY | 2 |
| railArrowBox | 12 |
| railArrowGrow | 1.2 |
| outlineWidth | 2 |
| outlineOffset | 2 |
| minTargetPx | 24 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Back (the word, or aria-label and title Back in the rail form). Contrast it must hold:
- the word and arrow at rest against the ground they stand on (rest): at least 4.5:1.
- the word and arrow under the pointer and the focus against the ground (hover): at least 4.5:1.

### Fold arrow

The standard 36px fold arrow: a solid triangle, right while folded and down while open. A ground and a card-line stroke under the pointer; a primary stroke under the keyboard focus.

- **Kind:** fold arrow. **Code:** `src/components/interview/FoldArrow.tsx`. **Stylesheet:** `src/styles/conversation.css` (also `src/styles/card-folding.css`).
- **Parts:** button (36px square, 1px stroke, transparent at rest); triangle (::before, drawn with borders from the button's middle).
- **States:** rest, hover, focus, open, closed.
- **Used in:** every folding card, group and section head; the Segment card's arrow column, the Relationship Type rows, the Customer Engagement reference rows.
- **Custom properties it reads:** `--text-default`, `--line-card`, `--bg-surface`, `--line-primary`, `--glow-color`, `--radius-md`.

| Variant | Where | Note |
|---|---|---|
| plain | any head | the arrow on its own; in a card head it also takes the body size and an invisible fallback glyph (card-folding.css) |

| Number | Value |
|---|---|
| size | 36 |
| triangleLong | 18 |
| triangleShort | 11 |
| strokeWidth | 1 |
| radius | 6 |
| centreTolerancePx | 0.01 |
| minTargetPx | 24 |
| tolerancePx | 0.5 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: Minimize <what> / Maximize <what> (aria-label), with aria-expanded. Contrast it must hold:
- the triangle (the text colour) against the ground it stands on (page): at least 3:1.
- the triangle (the text colour) against the ground it stands on (card): at least 3:1.

### Dropdown

A drawn dropdown: a 44px trigger in one of the standard widths (or hugging its widest option) with a chevron, and a floating list of 43px options exactly as wide as the trigger.

- **Kind:** dropdown. **Code:** `src/components/interview/OptionPicker.tsx`. **Stylesheet:** `src/styles/option-picker.css` (also `src/styles/global.css`, `src/styles/conversation.css`).
- **Parts:** trigger (button.interview-input with the value, a hidden copy of every option, and a drawn chevron); list (role listbox, floating under the trigger); option (role option; the chosen one bold, aria-selected).
- **States:** rest, hover, focus, open, disabled.
- **Used in:** every choice of one value on the Foundation pages and in the cards; frequencies, statuses, types, currencies, countries (searchable).
- **Custom properties it reads:** `--control-s`, `--control-m`, `--control-l`, `--control-square`, `--select-padding-left`, `--select-padding-right`, `--select-chevron`, `--select-chevron-inset`, `--bg-surface`, `--text-default`, `--text-faint`, `--line-card`, `--glow-color`, `--box-inset`.

| Variant | Where | Note |
|---|---|---|
| step-s | step s | short options (Yes / No): the trigger is --control-s wide |
| step-m | step m | a typical choice ("No tax at business level"): --control-m wide |
| step-l | step l | a long choice ("Private Company Limited by Shares"): --control-l wide |
| hug | hug | as wide as its widest option exactly, no wider (a side-label picker's allowed exception) |
| disabled | disabled | a disabled trigger: faint text, the card-line edge, not-allowed cursor |

| Number | Value |
|---|---|
| height | 44 |
| stepS | 220 |
| stepM | 300 |
| stepL | 420 |
| chevronWidth | 12 |
| chevronHeight | 8 |
| fontSize | 18 |
| listGap | 6 |
| listPadding | 4 |
| listRadius | 8 |
| optionHeight | 43 |
| optionPaddingY | 8 |
| optionPaddingX | 10 |
| chosenWeight | 700 |
| minTargetPx | 24 |
| hugTolerancePx | 2 |
| tolerancePx | 0.6 |

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: <label>: <value> (aria-label), aria-haspopup=listbox, aria-expanded. Contrast it must hold:
- the value against the trigger's ground (page): at least 4.5:1.
- the value against the trigger's ground (card): at least 4.5:1.
- an option against the list's surface (list): at least 4.5:1.

### Floating card

The one surface every floating card stands on: 492px wide (a founder's 297px), 8px corners, 12px padding and 12px between everything, a height that follows its contents, an inset light and shade edge and a drop shadow, in the tint of its tile and the colours of the reading mode.

- **Kind:** card base. **Code:** `src/components/interview/SectionTiles.tsx, the FloatingCards component`. **Stylesheet:** `src/styles/section-tiles.css` (also `src/styles/page-3-edges.css`, `src/styles/global.css`).
- **Parts:** host (a dialog over the dimmed page, placed by its tile); stack (one card, or a parent above its child); item (the box name, then the card); caption (the box name, with the box's "i"); body (the card: its ground, edge and shadow).
- **States:** rest, open.
- **Used in:** every floating card on the Foundation pages (Identity, Brand, Business, Strategy); the Resource, Activity, Partner, Provider, Founder, Legal Entity and Brand cards.
- **Custom properties it reads:** `--open-card-width`, `--founder-card-min`, `--radius-lg`, `--card-padding`, `--space-field`, `--space-label`, `--control-square`, `--card-label-col`, `--theme-bg-inner`, `--theme-ground-weight`, `--theme-ground-paper`, `--theme-line-edge`, `--theme-line-accent`, `--strategy-theme-hue`, `--shadow-18`, `--shadow-12`, `--box-inset`.

| Variant | Where | Note |
|---|---|---|
| card | kind card | a Resource, Activity, Partner, Provider or any other card: --open-card-width wide |
| founder | kind founder | a founder's card: --founder-card-min wide |

| Number | Value |
|---|---|
| cardWidth | 492 |
| founderWidth | 297 |
| radius | 8 |
| padding | 12 |
| gap | 12 |
| labelGap | 6 |
| cellHeight | 44 |
| labelColumn | 177 |
| windowMargin | 16 |
| tolerancePx | 0.6 |

**Sizes by screen class** (one custom property each; the same in every class until the owner sets them apart):

| Use | Property | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Card width (kind card) (at most the window less the window margin) | `--open-card-width` | 492px | 492px | 492px |
| Founder card width | `--founder-card-min` | 297px | 297px | 297px |
| Card corners | `--radius-lg` | 8px | 8px | 8px |
| Card padding, side, top and bottom | `--card-padding` | 12px | 12px | 12px |
| Gap between rows, and between the box name and the card | `--space-field` | 12px | 12px | 12px |
| Gap from a label to the control it names | `--space-label` | 6px | 6px | 6px |
| Height of a single-line control (a cell) | `--control-square` | 44px | 44px | 44px |
| Label column of a side-label row | `--card-label-col` | 177px | 177px | 177px |
| Window margin (a card is never closer to the window's edge) (written in the width rule as calc(100vw - 16px), not a custom property yet) | (none yet) | 16px | 16px | 16px |

**From top to bottom:**

1. **Box name**: A centred caption above the card, outside it: the name of the tile or box the card belongs to, with the box's "i" where the box has a note.
2. **Card top padding** (12px above, `--card-padding`): The card's own padding above its first row.
3. **Head row**: The order number inside the name cell (44px high), then the x (32px) 12px from the cell. Everything under the head starts and ends where the name cell does.
4. **Rows** (12px above, `--space-field`): One row per field, 12px apart: a side-label row (the label in the 177px column, then the control), a label above its control (6px), a tick row (the tick and its words on one line), an optional field (the tick, then a growing box under it), a tick list (one tick per line, 12px box to box).
5. **Groups** (12px above, `--space-field`): Two groups are divided by a rule, 12px either side of it.
6. **Completed row (Activity cards)** (12px above, `--space-field`): A divider line stands above the Completed tick, 12px either side of it, and the Links (Linked to) come last, after Completed (the owner, 2026-10-15).
7. **Card bottom padding** (12px above, `--card-padding`): The card's own padding under its last row; the height follows the contents.

**Accessibility.** Keyboard focus is shown by a ring or outline. Name: role dialog, aria-modal, aria-label (the box name). Contrast it must hold:
- the card's text against the card's ground (card): at least 4.5:1.
- a control's border and marks against the card's ground (card): at least 3:1.

**WCAG 2.2 criteria it must meet:**
- **1.4.3 Contrast (minimum).** Every text holds 4.5:1 on the card ground in light, dark and sepia.
- **1.4.11 Non-text contrast.** Every border, mark and ring that identifies a control holds 3:1 on the card ground.
- **2.4.7 Focus visible.** Every control shows its keyboard focus (a ring, or the asset's filled state).
- **2.5.8 Target size (minimum).** Every control is at least 24px, or has the spacing exception.
- **1.4.10 Reflow.** The card is never wider than the window less the window margin and its content wraps; the 768px floor is a declared exception until the owner rules on 320px (docs/design/05, 5.8).
- **4.1.2 Name, role, value.** The host is a dialog with aria-modal and a name; the focus returns to the control that opened it; Escape and a press outside close it.

<!-- /generated:assets -->

## Appendix A. Rules replaced by a later round (history, word for word)

Each line below was replaced in full by a later rule (its number is the line in the file before the reconciliation of 2026-10-14). They are kept so that nothing is lost; they are not rules.

- (was line 1256, Page 3, this round) Costs rows (Financial Foundation) hold no control but the source link.
- (was line 1258, Page 3, this round) **Partner / Provider category cell**: under the name, `Category` label and drop-down on one row (a side field like Responsible, the picker hugging its longest option), then, only while a category the user made is being named, a "Name the category" box.
- (was line 1267, Page 3, section views (latest)) **One tile everywhere**: category, group, card and Add tiles are the page tile's 215px square with its hover (110%, growing inwards); the Add tile is full size. `SectionView.tsx` (`SectionView`, `SubcategoryBoxes`) and `CardTile.tsx` are the only tile grids; the grid columns are `repeat(across, side)` from `useTilesAcross`.
- (was line 1268, Page 3, section views (latest)) **Dialog area**: a section dialog stands over its section card's rect (`dialogFrame(opener)`, class `section-tile-overlay-placed`); Inventory and Completed keep the page frame, centred.
- (was line 1277, Page 3 (later in same round)) **Cost row**: `--cost-x: 176px` (Qty 56, Price 96, currency at 176, Frequency right-aligned) as the user approved it; it no longer follows `--side-label-short` (124px).
- (was line 1355, Batch K0) **A founder's Start date**: in the narrow founder card the label takes the room its words need and the date cell the rest (`.business-founder-open > .business-field-side`).
- (was line 1367, Batch L) Brand Inventory: Icon & Logo (the icon in front; its dialog is the uploads) and Brand Images (each image a box covered with the image, its title on top).
- (was line 1368, Batch L) **Legal Entity** is one tile for each of its six sections. Organization and Founders & Ownership open with no frame; Formation & Registration and Tax & Business Registration open in theirs; Additional Legal Requirements and Legal Entity Expenses open a card tile for each card with the "Add Card" box (as the Business System's cards do).
- (was line 1400, Batch O) **Tile titles stand half a line higher** (\`.section-tile-title\`).
- (was line 1422, Batch S) **A dialog (an open tile) darkens the page behind it; a floating card never does.**
- (was line 1448, Batch V) **A dialog (an open tile) darkens the page behind it; a floating card does not** (`--bg-overlay` for the dialog, `--floating-scrim` clear).
- (was line 1461, Batch V) **The marker column of an opened card is always two digits wide** (`--card-marker-col`, 32px), so the name cell (388) and every cell are the same width on every card whatever its number ("1." or "11."); the card is `--open-card-width` 492px. A card's number in its tile and in the card itself is the same (`offeringNumberOf`: its own Group's list, or the Channel tile's).
- (was line 1463, Batch V) **Carousel arrows are the page arrows' shape and level** (`.page-arrow.carousel-arrow`), 10% larger, outside the card on each side, in the card's own tint; their level is the page arrow's (`arrowLevel`). The page arrows are raised to the middle of the page's cards where the rail would hold them lower. Infrastructure & Capability shows no Sections rail (it is drawn as tiles).
- (was line 1464, Batch V) **The Foundation page is a set of four tiles for each Segment** (Customers: Segment and Profiles; Value Proposition; Competitors; Offerings; two by two), each Segment's frame in its own colour, the frames side by side. A tile's dialog holds that Segment's part only.
- (was line 1471, Batch V) **The Foundation page**: a frame for each Segment (blue, the Discover colour of the colour map (docs/design/01-current-design.md, part I)), five tiles in it: Segment, Profiles, Value Proposition, Competitors, Offerings; the frame title is "Segment" until named, numbered with several; a long title scrolls sideways.
- (was line 1474, Batch V) **3. Infrastructure & Capability is laid out like the other tile pages**: two cards of the same size in one row, their four tiles centred and as large as the card and the window allow; the Inventory and Completed tiles stand in a row under them, squeezed into the room that is left (never under `SQUEEZED_ROW_MIN`, 88px, titles only below 150px).
- (was line 1485, Batch V) The Foundation page is the nested frame of columns again (no tiles).
- (was line 1487, Batch V) Inventory and Completed are rectangles in the footer's band on a wide page, so the two cards are as large as every other system's.
- (was line 1511, Batch V) **Demand & Conversion** is one table for the Segment: an Offering's rows under its head (how it is bought), then its sources, "+ Add Customer Source", the result, and the assumptions beside the channels.
- (was line 1518, Batch V) **Demand & Conversion** is one table: Offering, Customers Buy, Channels, then a row for each Customer Source (Source, Estimated, Figures, Basis, Result, x).
- (was line 1539, Scrolling) **Scrolling (`src/hooks/useScrollRules.ts`, `data-reserve`)**: a wheel over an open dialog or card never scrolls the page; where content is taller than its scroller (the page, a dialog's body, a tall card's stack) the scroller gets 25vh of bottom padding.

## Appendix B. Still to settle

**Rules kept that a later round replaced in part** (the part that stays is still a rule; the replaced part has to be cut from the text):

- was line 1274: Add Card tile: half tile side, bottom right, no scale, semi-transparent ground, + grows 10% (superseded-by:1291; 1291 defines Add Card hover as stroke gone, 16% color-mix fill, dark tint label/plus; no-scale and placement still hold)
- was line 1309: Funnel uses --space-field/--space-label; Include, Belongs to, Sort fold arrows open by default (superseded-by:1314; 1314 says Belongs to folded at first and sets block order Include, Sort, Belongs to; spacing tokens still hold)
- was line 1334: Resources rows: dropdown with link symbol, '+' adds, never tick list; people card class (superseded-by:1343; row structure refined in 1343 (units box, spacer); keep sentence on Performers and .business-capability-people)
- was line 1363: Column-page tile text plain, no bullets, last line fading, press opens tile (superseded-by:1385; 1385 says no fading, whole line above foot)
- was line 1364: Column guidance is the i beside dialog title; Brand/Themes note 720px (superseded-by:1380; note width changed 720px -> 480px; rest (guidance as i, never bullets) stays)
- was line 1466: Carousel arrows 24px from card, bright fill dark outline; none when fresh; inner step first (superseded-by:1534; 24px gap replaced by 12px (CAROUSEL_ARROW_GAP 12); fill replaced by 1478. Keep: none while fresh, dialog steps through its own sections first (useDialogInnerStep))
- was line 1482: Foundation: four tiles per Segment; Registrations and Expenses tiles carry circles (superseded-by:1491; Foundation part only: Segment tile with Description and Profiles replaced by Customers with sub-tiles. Registrations/Expenses circles: keep (T13))
- was line 1496: Strategy: tile per Theme/Goal; Roadmap one large tile; Delivery tile per Offering (superseded-by:1531; Pages 2 and 3 hidden in 1531; Roadmap large tile also by 1506/1523 small tile; Delivery tile per Offering: keep (T13))
- was line 1500: Strategy cards: no fold arrow or grip; one-row head; generated tiles label; no Roadmap rail (superseded-by:1526; Head layout replaced by 1526; Theme tile '+' adds a Goal replaced by 1526/1532; no Roadmap Sections rail made moot by 1531. Keep: no fold arrow/grip, label above generated tiles)
- was line 1508: Deactivated tiles drawn in grey section-tile-completed; pressing makes and opens (superseded-by:1515; Grey replaced by half-transparent (section-tile-slot-empty); pressing behaviour kept)
- was line 1536: Channel card without wires: parts have no border; end 40px before padding; 12px apart (superseded-by:1546; 40px reserved column is now 44px (--card-x-column); no-wires rule stays)

**Rules that conflict and that the ledger could not settle:**

- was line 1260: Category cell: one component categoryRow, Name the category box only when naming (conflicts-with:1335; 1335 says partner or supplier card has no Category row; 1305 says Partner/Provider starts at Category Select)
- was line 1266: Widths reverted: --side-label-short 156px, card-box-open side label 124px (conflicts-with:1284; 1284 says label column 164px (--side-label-short); base 45 says 164px; 156 vs 164 unresolved)
- was line 1282: Layer stack; Back/backdrop remove top layer; Escape closes all; view under card inert (conflicts-with:1289; 1289 says no Back button, no inert, scrim pointer-events none, mousedown outside closes topmost; overrides base 770-773, 996, 871 (replaces return-to-default rule))
- was line 1284: Quad page cards tile side; --tile-radius 8px; Costs row 164px label, cost-x 176 (conflicts-with:1266; 164px vs 1266's 156px; also contains cost-row positions (T11))
- was line 1289: Floating card: no Back, no inert, scrim pointer-events none, mousedown outside closes topmost (conflicts-with:1282; overrides base 770, 773, 996 (Back button of floating card, dimmed inert page))
- was line 1335: Group label order Category, Group, Name; partner/supplier card has no Category row (conflicts-with:1260; 1258/1260/1305 give Partner/Provider a Category cell)
- was line 1435: Registered is derived from registration number; Status is text; Formation date after number (conflicts-with:1437; 1435 says Status is text, 1437 says Formation card has no Status)
- was line 1437: Formation card: no Status, Date on registrations' columns, not after today; max five more numbers (conflicts-with:1435; Status presence unclear vs 1435)

**Found in the base rules by the audit of 2026-10-14** (document against code; the code and its tests are the truth until the rule is rewritten):

The line numbers below are those of the file before the reconciliation; they match the Appendix A and B "was line" numbers.

- **Lists on tiles:** lines 719, 748, 962 and 1089 say a tile's list ends with "+N more"; line 1001 and the code say it holds every item and scrolls.
- **Open card width:** lines 52, 777, 965 and 1198 say 480px; the code says 492px (see "Values as built").
- **Tile title position:** lines 56, 710 to 713 and 1089 describe a third-down line; the code has 0.25. Lines 56 and 710 also describe different geometry for the title's last line.
- **Side-label tokens:** lines 61 and 971 say `--card-side-label` is 124px and then 164px; the token is not defined and a test asserts it is absent.
- **Dialog and cards:** lines 868 to 884 say the dialog is the page width and has no square; lines 964, 1097 and 1198 still say a pressed card box opens a card centred in the dialog; line 993 says cards are only floating cards. Lines 942 to 952 and 1090 to 1097 still describe card boxes opening a card in a dialog.
- **Workspace Deposit:** lines 167 to 170 and 1052 say the amount is the Code step (128px); line 1004 says it has the Price box's width.
- **Founder fold arrows:** line 1069 gives them a hover; lines 982, 1012 and 1123 say none.
- **Help button:** lines 835 to 838 say the page has no Hide Help button; line 1208 and `InterviewSection.tsx` still have one on other pages.
- **Quantity width:** line 1099 says Quantity 80 (XS); line 994 says 56.
- **Marker column:** line 984 describes a three-column grid with a marker; later rounds (old lines 1461 and 1533) removed the marker of an opened card, except the founder card.
- **Duplicates inside the base:** the "Tile grids: ONE SHAPE" rule (794 to 807, 926, 1098); the tail tile (808 to 811, 961, 962, 1196); the x colour swap (995, 1122, 1140); the "+" box swap (764 to 766, 1127); the founder card layout (325 to 328, 1055 to 1082); the Responsible tick (336 to 341, 626 to 647, 977); folded Capability cards (90 to 107, 657 to 661); the check list (1088 to 1104, 1216 to 1223); title sizes (729, 730, 1003, 1014 to 1020, 1098); the glass ground (62 to 64, 894 to 911, 1045). Line 794 has its heading twice.
- **Names that no longer exist or no longer match:** `--workspace-form-width` and `--workspace-label-width` (lines 50, 51); `cardBoxLayout` (952, gone); "Partnerships" (992, still in four source files); "marker column" (53, 984, 1063 to 1067, 1195).
- **Sections whose content does not match the heading:** section 5 "Alignment" holds the Customer Engagement tables, the action markers, Demand & Conversion and the Capability cards (lines 372 to 669); section 5a holds the Founders' dialog, the Workspace form, title sizes and the page scroll and several change-log blocks (lines 979 to 1002); section 4 holds the add buttons and the caps title; the table of section 6 is split by a paragraph at lines 1117 to 1120.
- **Not yet checked against code:** the box counts in lines 797 to 803.
