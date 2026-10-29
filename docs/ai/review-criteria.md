# Review criteria: how a screen is judged

Status: **rules**, updated 2026-10-20.

This document is the standard a table, a tile, a card, a floating card, a dialog, a pop-up window, a page or a control is judged by. `review-checklist.md` is the short list to tick; this is the reference behind it: for each criterion, the standard, where the standard comes from, how to measure it and what counts as a failure. A review that does not name its criteria, measure them and report them is not a review.

## 1. How a review is done

1. **Fix the subject and the state.** Name what is reviewed (a table, a card, a pop-up window) and the state it is judged in (open, folded, empty, long data, hovered, focused, pressed, disabled). A review of one state says so.
2. **Open it as the owner does**: in a browser, from the real example (Lumen & Loom, and Quillfield where it differs), reached through the pages, at 1440 wide, in the light mode first. A test render is not a look.
3. **Take the picture** before any change, in light and dark (and sepia where the subject has its own ground).
4. **Measure, do not read by eye.** Every number in sections 3 to 8 is measured from the running page (computed style and box), not guessed from a picture. A difference of more than 1px, or of a token, is a finding.
5. **Compare with the same kind elsewhere.** A control, a heading, a card or a pop-up is correct when it is the same as the other of its kind (rule 8 of `layout-rules.md`: a difference is a defect). Measure one other of the kind beside it.
6. **Write the findings** as in section 11, fix them by the rules of section 2, and measure again.

## 2. The rules of the work

1. **Replace, never adjust.** A hand-made control is replaced by the app's own component of its kind; its style is not tuned. If no component of the kind exists, the review asks before writing one.
2. **Components first** (`22-shared-components.md`): `RemoveButton`, `AddButton` (shapes wide, box, tile; `look`), `TextLink`, `OptionPicker`, `ValuePicker`, `MultiPicker`, `TickField`, `TextBox`, `NumberCell`, `TextField`, `DateCellInput`, `FoldArrow`, `NavArrow`, `FunnelButton`, `InfoNote`, `CardShell`, `CardHead`, `Tile`, `TileGrid`, `BusinessCard`.
3. **Tokens, not values.** A size, a gap, a colour or a radius is a token (`global.css`, `colors.generated.css`, `components.generated.css`); a value written in a rule is a finding unless the rulebook lists it.
4. **The style lives with the component.** What a shared control looks like is in the sheet the component imports, so it is the same on every page (the Landing, the System Selection, the Notes panel, the header and the documents load no interview sheet).
5. **One of each.** One component, one rule, one reaction per kind. A second class that adds a look, a hover or a size to a shared control is a finding.
6. **Delete what is dead**: the old rule, the old markup, the old test expectation; `npm run lint:css` is the proof.

## 3. Typography: size, weight, case, tracking, colour

The scale is closed: `--font-small` 14px, `--font-body` 18px, `--font-h3` 24px, `--font-h2` 28px, `--font-h1` 36px. A size outside it is a finding.

| Text | Size | Weight | Case | Tracking | Colour |
|---|---|---|---|---|---|
| A page title | `--font-h1` | bold | as written | `--bold-tracking` over the rest | the text colour |
| A dialog or card title, a box name over a floating card | `--font-h3` | bold | as written | the bold tracking | the title ink / the card's label colour |
| The caps title (a card kind word, a group heading: "1. SEGMENT", "INCLUDE") | `--font-body` | 600 | capitals on screen only | 0.05em | `--caps-title-color` (muted, 4.5:1 or more on its ground) |
| A field label | `--font-body` | regular | sentence case | none | the card's label colour (`--label-color`): the darker tint of the card's hue |
| A value in a cell, a dropdown option, a tick's words | `--font-body` | regular (the chosen option 700) | as written | none | the text colour |
| A labelled button (add, header tool, export, toggle option) | `--font-body` | 500 | capitals on screen | 0.1em (`--rest-tracking`) | the accent ink |
| A text link | `--font-body` | regular; bold under the pointer | as written | the bold's tracking at rest, so nothing moves | the link blue |
| A tile title | `--font-body` | 600 | as written | 0.15em | the tile's ink |
| A tile's list, a count, a note, a table body in the small size | `--font-small` | regular | as written | none | the muted text colour |
| A tooltip | `--font-small` | 500 | as written | none | the tooltip text colour |

Measure: `fontSize`, `fontWeight`, `letterSpacing`, `textTransform`, `color` of the element. Findings: a label in capitals that is not a caps title or a button; a tick's words in capitals or in the small size; text smaller than `--font-body` on a button; two headings of one kind in two sizes; a colour that is not a token; contrast below 4.5:1 (3:1 for large text and for a non-text sign) in any mode (`npm run tokens:check`).

**Tracking follows weight**: bold text, at rest or under the pointer, carries `--bold-tracking`; a button's box never changes size under the pointer (the thickening is drawn on the letters, `--hover-bold`).

## 4. Spacing and gaps

The gaps are the closed set, as tokens: 2, 4, 6, 8, 12, 16, 24px (`--gap-*`) and the named spaces below. A gap that is not in the set is a finding.

| Between | Gap |
|---|---|
| a label and the control it names | `--space-label` 6px |
| one field and the next | `--space-field` 12px |
| one card and the next in a list | `--space-card` 12px |
| the border of a card or a section box and its content | `--card-padding` 12px |
| one cell and the next in a row | `--space-cell` 12px |
| one row of a table or a list and the next | `--space-row` 6px |
| one column and the next | `--space-column` 12px |
| a floating card and its title tag, and its record tag | 12px |
| the words of a tag and its edges | 6px above and below, 12px at the sides |
| the "i" and the last word of its label | 6px |
| a tick box and its words | 8px |
| a card's head number and its name | 8px, the numbers in one column |

Measure: the box rectangles of the two neighbours; the gap is the distance between them. **One centre line** in a row (within 1px); **one top and one bottom** for components of one height; the same x for the same column down a list. Findings: neighbours touching (0 gap) where the rule gives a gap; unequal gaps in one list; a row whose centres differ; a control pushed off its row's end.

## 5. Controls

| Kind | Height / size | Look | Component |
|---|---|---|---|
| A single-line cell (text, number, date, dropdown) | 44px (`--control-square`), the widths of the closed set (`--control-xs`, `-code`, `-date`, `-s`, `-m`, `-l`, or hugging the widest option) | no stroke at rest, the recessed field, 6px corners | `TextBox`, `NumberCell`, `DateCellInput`, `OptionPicker` |
| A labelled button | 44px (`--add-button-height`) | the accent ink, line and ground; capitals; 6px corners | `AddButton` |
| The × and the + box | 32px | the two-colour swap | `RemoveButton`, `AddButton` (box) |
| A tick box | 24px, corner 4px | drawn, recessed, ticked blue with the check | `TickField` |
| A fold arrow | 36px (the label arrow: the label's own size, a 24px hit area at least) | the outlined triangle, filled under the pointer | `FoldArrow` |
| A navigation arrow | the 44px circle of a page arrow; the 32px square for a row move | | `NavArrow` |
| The "i" | 22px | the ground, a stroke and its letter in the card's tint; a swap under the pointer | `InfoNote` |

A dropdown is **one** component for one choice (`OptionPicker`) and **one** for several (`MultiPicker`): its trigger, its chevron, its list (no stroke, the raised edge and the drop shadow; options 43px; the chosen one bold) are the same on every page. A dropdown is never drawn as a button or as an input.

Reactions (`19-reactions.md`, `layout-rules.md` section 6): every control that can has **hover**, **focus**, **pressed** and **disabled**; measure each state's `boxShadow`, `backgroundColor`, `color`, `textShadow` against the kind's row and against a second control of the kind. A control that is not a button does not look like one, and a button does not look like a field.

## 6. Colour: what follows what

1. **A card, its tile, its tags, its pop-ups and its windows are one family**: the ground, the line and the ink come from the card's hue (`--strategy-theme-hue`, the `--theme-*` tokens). A neutral grey or white window beside a coloured card is a finding.
2. **A card is not a tile.** A tile (a button that opens something) has the inner light and shade (`--box-inset`) and the drop shadow; a card (an opened tile, a floating card, a nested card, a dialog frame) has a **wireframe** (1px, the card's own line) and the drop shadow, never an inner light or shade.
3. **A completed card is an ordinary card in four greys** (`--bg-completed-card` and its three companions); what stands with it takes the same greys.
4. **The modes** (light, dark, sepia) are all the same design: measure each; a ground that stays light in the dark mode, or a shadow that glows (a shadow is the ink shadow, never the edge colour), is a finding.
5. **No colour alone**: a state is also shape, weight or text.

## 7. Tiles, cards and stacks

1. **A tile** is a true square of its grid (`--section-tile-size`), one title on one row cut by an ellipsis, its list under it, its corners `--tile-radius` 8px; under the pointer it grows 110% about its aimed corner, the others staying.
2. **A card** stands at `--open-card-width` (492px) at most, its content 466px; its head is the number, the name cell (44px) and the x; everything under the head starts and ends where the name cell does.
3. **A stack of cards** (a pair: a card and the card it leads to) is drawn once: one scrim, one shadow, the layer under it hidden, the arrows and rails of a hidden layer hidden. Open the same card three ways (its tile, a link, the Inventory) and from a stack: the result is the same card in the same place.
4. **Opening and closing**: Escape closes the last layer opened; a press outside closes the card; Back goes up one level; nothing that should stay open closes, nothing that should close stays.
5. **A card that leads to another** (a founder's responsibility to an activity or a legal expense) stacks the second under the first and keeps the first visible.

## 8. Tables, lists and windows

1. **A table** fits its panel or scrolls sideways with its heading and its first column kept; a column is named by what it holds (not counted); a number is right-aligned in figures of one width, its unit once in the header; a short column never breaks a word; the first column is one row cut by an ellipsis; rows are one height per size step; the text size is one of the three steps (14, 18 and 24px) and the default is the one that fits.
2. **A list** (a numbered list, a bulleted list, a tile's list) has the one gap between marker and text and the one line height (`--section-tile-line-height` 1.45 for a wrapping list).
3. **A pop-up window** (a menu, a filter window, a dropdown's list, a note, the calendar's list) opens next to its control, is placed free of the boxes around it, is the card's family in colour (section 6), has the app's type scale (section 3: its labels are field labels, its group heads caps titles, its options the dropdown's options, not smaller than `--font-body` unless the rulebook says), the app's controls (section 5), a width of the closed set, a maximum height with its own scroll, and closes on a press outside and on Escape, the focus returning to its control.
4. **A tooltip** follows `docs/design/current/25-tooltips.md`: a pressed control only; an icon says its name; cut words whole; what the words do not say; never what is shown.
5. **A dialog** has the one dialog ground and frame; its Back and its rails are the app's.

## 9. Pages

1. **The page is complete**: its heading, its rails (pages and sections), its Back, its header and footer, each in place at 768, 1366, 1440 and 1920 wide, with a minimum width of 768.
2. **The order and the alignment**: the order of its blocks follows the spec of the page; the columns align at one x; nothing is cut or hidden under the fixed header or footer.
3. **Every state of the data**: empty, one, many (hundreds), a very long name, a long number; folded and open.
4. **Navigation**: reached from the Review, the calendar, a card's link and the header; each lands on the same place and leaves a way back.

## 10. Words, data and accessibility

1. **Words**: sentence case, the same word for the same thing everywhere, no bracketed hint in a dropdown option (the "i" says it), no word the app does not use (a removed option leaves no trace in the words).
2. **What is shown is what is stored**: change an answer, and every place that shows it changes (the page, the Inventory, the Review, the calendar, the documents, the exports).
3. **Old data**: a removed option or a renamed field leaves old answers cleared and said, never lost or shown wrong.
4. **Names**: every control has an accessible name; an icon-only control has an `aria-label`; no `title` repeats it.
5. **Keyboard**: every control reachable by Tab and answering Enter and Space; a list by the arrows; Escape closes the last layer; the focus is visible and returns where it came from.
6. **WCAG 2.2 AA**: contrast, target size (24px at least), focus visible, no information by colour alone.

## 11. The report

A review is reported per criterion family, in this form:

| Criterion | Standard | Measured | Verdict |
|---|---|---|---|
| Type: a filter window's tick words | `--font-body`, regular, sentence case | 14px, uppercase | **Fail** |

Then: **what was fixed** (with the component or the token used), **what was measured again** (the picture after, in the same states and modes), **what was not looked at** (the modes, widths, pages and states left, and why), and **what needs the owner's decision**. "Done" is never said for what was not measured. A check made in a headless browser says so (the owner's window may be stale: ask for a hard reload; a hover or a pressed state is driven by hand).

## 12. The measuring tools

- **The automatic check**: `npm run check:layout` (0 new findings; it measures widths, gaps, alignment, the reactions of each kind and the ×). `--wide` adds the three reading modes and the screen classes.
- **The lints**: `npm run lint:css` (dead and shadowed rules), `npm run lint:styles` (colours, sizes and values written in rules), `npm run tokens:check` (contrast), `npm run docs:check`, `npm run tables:check`, `npm run library:check`.
- **The tests**: the whole suite; a test that reads a stylesheet is a guard on a criterion above.
- **The browser**: a script that opens the page, drives the state, and prints the computed style and the box of each element under review; the pictures before and after.
