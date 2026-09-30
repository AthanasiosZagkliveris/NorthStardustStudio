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
| `--card-padding` | 12px | inside every card **and every section box**, border to content (sides) |
| `--space-row` | 6px | one row of a table to the next |
| `--card-body-indent` | 44px | a card body's left edge from the head's left (the arrow's 36px plus 8px) |
| `--side-label-gap` | 12px | a side label to its control |
| `--control-xs` | 80px | XS width step |
| `--control-code` | 160px | Code / Date width step |
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
- Fields are 12px apart; a label is 6px above its control.
- A card's two columns (`.card-field-pairs-grid`): `repeat(2, minmax(0, S))`
  with a 24px gap, one column under 300px.
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
| XS | 80px | 3-4 digits | Quantity, a person's hours, calendar weeks (`.delivery-number`) |
| Code / Date | 160px | 11 characters, or a whole date with its calendar button (159px) | Postcode / ZIP beside City; a date in a one-column row |
| S | 220px | 18 characters | numbers and amounts in fields, dates, short pickers (Status, Role, Owner), month pickers, the activity code, the Number column of a Name / Number list |
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
  at least **2 lines** for a written answer, **5 lines** for an image's
  description (Brand Inventory). One-line text boxes (a card's name, a
  City, a registration's name) wrap and grow instead of clipping.

### Compact items

- The x (remove): 32 x 32, on every row of a list in one column.
- A tick box: 18 x 18.
- The fold arrow: 36 x 36.

---

## 5. Alignment

### The mid-line rule

- **Text beside a control** has its first line centred on the control's
  centre line (a side label, "px" after a box, the words of a fixed list
  row). A second line hangs below.
- **A tick box** is centred on its words' first line.
- Exception: a Text Hierarchy level's row (see 7) centres the tick, the
  name's whole block and the px box on the row's centre line.

### Grids and lists

- A control starts at its column's left edge; controls of one row share
  their top edge; side-by-side boxes share their bottom edge.
- A list with a x keeps the x column on every row (`32px` track), so the
  columns before it stay put.
- An add button at a list's end spans the list ("+ ADD ...", labelled).
- **Pair rows** (`.legal-entity-pair-row`): two short fields sharing one
  row of a column, the grid's 24px gap, stacking where the column is under
  300px. City | Postcode: the postcode at Code / Date, the City the rest.
- **Name / Number list** (`--name-number-columns`): the name the rest, the
  number S (two fifths of a narrow list), the x column. Names wrap and grow;
  the number and x stay on the name's first line. Used by the Legal
  Entity's Formation & Registration and Tax & Business Registration, so
  their Number columns share one x. Column heads head only the rows the user
  adds; rows that name themselves (the tax number, VAT) have none.
- **Side-label row snapped to the grid** (`.legal-entity-side-row`): a row
  of fields whose labels sit beside their controls on the columns of the
  list below (a subgrid): each label at its column's left edge, its control
  filling the rest of the column (so it ends where the column ends), labels
  on the controls' centre line. Where a column cannot hold its label and
  its control's longest value, the labels go above. Status | Date on
  Formation & Registration.

### Body order

Fields follow the order a founder answers them: what it is, then where,
then the details. The Legal Entity's Organization section is two columns
on the card's two-column grid: "what it is" reads Organization Name, Main
Activity, its activity code (S), Legal Form (the column's width: every UK
and US form reads in full; the longest, 57 characters, fits from a 1366px
window, and a closed picker too narrow ends in "..."); "where it is" reads
Country, State / Region (where the country has one: it decides which
registry and tax apply), City | Postcode, Address.

---

## 6. Interactions: one set of reactions per kind

| Kind | Hover | Focus | Disabled |
|---|---|---|---|
| Text box (input, textarea) | primary edge + soft glow (18%) | primary edge + stronger ring (28%) | muted, no reaction |
| Text holder (an image's name and description, one box) | as a text box, on the holder | as a text box | as a text box |
| Picker | as a text box | as a text box | as a text box |
| Tick box | its words underlined, the box's glow ring (whether or not the words are in its label: `.brand-tick` too) | focus ring | not-allowed cursor |
| Add button | its ground | focus ring | muted |
| x (remove) | its ground | focus ring | muted |
| Fold arrow | its ground | focus ring | n/a |

The check hovers up to three of each kind on every page and fails a kind
that does not react as its row says.

---

## 7. Declared exceptions

- **Text Hierarchy rows**: each row is fixed at the height of its name at
  the largest size its range allows (`levelHeight()`), never under 45px,
  so the box never changes size; the name scales about the row's centre
  line from a fixed left edge and, where too wide, is scaled to fit rather
  than wrapped. The two-line "Captions & Metadata / Interface" is centred
  as a block.
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
control on its centre line; tick box on its words' first line; a hierarchy
level on its row's centre line; control width is a size step; single-line
control height; card side margin; and the hover reactions above.

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
