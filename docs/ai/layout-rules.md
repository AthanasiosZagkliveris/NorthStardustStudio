# Layout rules: the Foundation pages' rulebook

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
| `--card-body-indent` | 44px | a card body's left edge from the head's left (the arrow's 36px plus 8px) |
| `--side-label-gap` | 12px | a side label to its control |
| `--control-xs` | 80px | XS width step |
| `--control-code` | 128px | Code width step |
| `--control-s` | 220px | S width step |
| `--control-m` | 300px | M width step |
| `--control-l` | 420px | L width step |
| `--control-square` | 45px | the square variant; also the one control height |
| `--name-number-columns` | `minmax(0,1fr) min(var(--control-s),40%) 32px` | the Name / Number list |

---

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
  name wraps downward and nothing else moves.
- **A folded card's head is the open card's head.** The written name
  (`.strategy-name-static`) takes the name box's own line, padding and
  (unseen) edge, so folding moves nothing but what is under the head.
- A folded card's one-line summary sits under the name, from the name's x.

### Card body

- Everything starts at the body's left edge (`--card-body-indent`).
- **One vertical rhythm** in every card and section box: a label 6px
  (`--space-label`) above its control; a control, list row or add button
  12px (`--space-field`) above what follows it; two groups divided by a
  rule, 12px either side of it (a group gap of 24px). A side label is part
  of its control's row.
- A card's two columns (`.card-field-pairs-grid`): `repeat(2, minmax(0, S))`
  `--space-cell` (12px) apart, one column under 300px.
- An optional field (tick + growing box) has its tick at the body edge and
  its box under it, from the same edge.

### Cards and section boxes

Every card and every section box (Legal Entity's numbered sections, the
Financial Foundation's need and offering-cost cards, Strategy boxes) has
the same inner side margin: `--card-padding` (12px).

---

## 4. Sizes: the closed set

### Widths (five steps, plus "its column")

| Step | Width | Holds | Used for |
|---|---|---|---|
| XS | 80px | 3-4 digits, or "33.333" | Quantity, a person's hours, calendar weeks (`.delivery-number`), a founder's Ownership % |
| Code | 128px | 10 characters ("10001-1234" 98px, ten digits 107px, "£250,000") | a founder's Capital |
| S | 220px | 18 characters, or a whole date with its calendar button (159px) | numbers and amounts in fields, dates, short pickers (Status, Role, Owner), month pickers, the activity code, the Number column of a Name / Number list |
| M | 300px | an amount with its currency | price + currency pairs |
| L | 420px | a long option | pickers whose longest option needs it (OptionPicker picks S, M or L itself) |
| Column | its column | anything | text fields and pickers that fill their column (Country, State / Region, the Address) |

The two-column grids are built from these: a pair row is two S columns, a
Name / Number list is "the rest" plus S. A width outside this list fails
the check, except a control that fills its column, its container, or one
track of the grid it stands in.

### Heights

- **One single-line control height: 45px** (drawn 44.33px, the 1px border
  snapped by the browser). Inputs, pickers, date inputs.
- **Square** (`--control-square`, 45 x 45): a 2-3 digit value with its unit
  after it; the Text Hierarchy's px boxes. Value centred.
- **Text boxes** grow with their text and are never resized by hand:
  at least **2 lines** for a written answer, **4 lines** for the Legal
  Entity's Main Activity and Address (side by side, one column each, the
  same size), **5 lines** for an image's description (Brand Inventory).
  One-line text boxes (a card's name, a founder's name, a registration's
  name) wrap and grow instead of clipping.

### Compact items

- The x (remove): 32 x 32, on every row of a list in one column.
- A tick box: 18 x 18.
- The fold arrow: 36 x 36.

---

## 5. Alignment

### The in-row cell gap

Cells side by side in one row inside a card are `--space-cell` (12px)
apart, everywhere: field grids, pair rows, Name / Number lists, tables.
Gaps between cards, sections and page columns (`--space-card`, the page
grids' 24px) are not cell gaps.

### The mid-line rule

- **Text beside a control** has its first line centred on the control's
  centre line (a side label, "px" after a box, the words of a fixed list
  row). A second line hangs below.
- **A tick box** is centred on its words' first line.
- **An "i"** follows its words' last word at 8px, on that line's centre
  (glued to the last word, `.info-note-glue`); after a badge, on the
  badge's centre.
- Exception: a Text Hierarchy level's row (see 7) centres the tick, the
  name's whole block and the px box on the row's centre line.

### Grids and lists

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
  of one tick list (several ticks under one label) are rows of that field.
- **Founder card** (Founders Profile): on the card's two equal columns,
  the Roles in the first column of the first row (the second empty), then
  Industry | Management, then Achievements | Skills; one column under a
  600px card.
- **Objective card** (Strategy): on the columns of its Initiatives | Metrics
  row; the Description in the first (as wide as the Initiatives box); in
  the second, from the Metric column's edge, "Start [month]" over "End
  [month]" (the Strategic Period's pair, S each) and beside them
  "Responsible" over its picker: "Start" and "Responsible" on the
  Description label's line, the End box and the picker on the next row.
  In a card under 600px, Responsible goes under the period; one column
  under 900px.
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
  Formation & Registration.

### Body order

Fields follow the order a founder answers them: what it is, then where,
then the details. On the Legal Entity page every section box is half the
page, in pairs: 1. Organization | 2. Founders & Ownership, 3 | 4, 5 | 6,
each as tall as its own content, stacked under 1100px. The Organization
section is two columns `--space-cell` apart: "what it is" reads Organization
Name, Main Activity, its activity code (label beside its box, on the box's
centre line; the box the S step at most, ending at the column's edge),
Legal Form (the column's width: every UK
and US form reads in full; the longest, 57 characters, fits from a 1366px
window, and a closed picker too narrow ends in "..."); "where it is" reads
Country, State / Region (where the country has one: it decides which
registry and tax apply), then the Address: one box of lines, its
placeholder the lines expected in the country's words ("Street", "City",
"Postcode" / "ZIP Code" / "PLZ"; no postal line where addresses carry
none).

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
| x (remove) | its ground: the danger colour, the same on every x (a Strategy card's x too; no second hover overrides it) | focus ring | muted |
| Fold arrow | its ground | focus ring | n/a |

The check hovers up to three of each kind on every page and fails a kind
that does not react as its row says; it hovers up to twelve x and fails
if any two turn different colours (one reaction per kind).

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

---

## 8. The check

`scripts/layout-check/layout-probe.js` measures a page in the browser;
`scripts/layout-check/run.mjs` opens every Foundation page of both examples
(`docs/examples`), every card unfolded, at **1920, 1366 and 768px** in
**light and dark**, runs the probe and the hover check, and lists the
failures. **It must report 0 failures.**

Rules checked: number-left = body-left; number to name gap (8); control at
its column's left edge; same-row tops; list x column; add button spans its
list; side-by-side bottoms; text box not clipped and at least two lines;
picker one line; nothing overflows its card or the page; text beside a
control on its centre line; tick box on its words' first line; an "i" on its words' line, 8px after them; a hierarchy
level on its row's centre line; control width is a size step; single-line
control height; card side margin; label gap (6) and row gap (12, or 24
across a dividing rule) in every card; and the hover reactions above.

Run it with the dev server up (`npm run dev`, port 1420):

- **With Node**: `node scripts/layout-check/run.mjs` (needs the
  `playwright` package; not a project dependency). Exits 1 on any failure.
- **From an agent's Playwright browser tool**: evaluate `run.mjs`'s
  functions with `page` bound (strip its imports and `export`s, fetch the
  probe from `/scripts/layout-check/layout-probe.js`, the examples from
  `/docs/examples/`), then call `runLayoutCheck(page, { probe })` for each
  seeded example. The check writes the examples into the browser's storage:
  back up and restore localStorage around it.

The probe's pure helpers are unit-tested in `src/test/layoutProbe.test.ts`.
