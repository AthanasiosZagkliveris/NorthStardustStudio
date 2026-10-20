# The review checklist: what to check when reviewing a table, tile, card, page or control

Status: **rules**, updated 2026-10-20.

Read this before reviewing or changing anything on screen, and tick every line that applies before saying "done". Each line is here because it was missed once. The rules it points to are in `layout-rules.md`, `tile-and-card-pattern.md`, `20-reactions.md`, `23-shared-components.md` and `26-tooltips.md`.

## 0. Before looking

1. **Open the thing in a browser, as the owner sees it**: the real example (Lumen & Loom, and Quillfield where it differs), the page as it is reached (not a test render). A passing test is not a look.
2. **Say what is being reviewed** (a table, a tile, a card, a dialog, a pop-up, a page) and find its rules: grep the rulebook for its name before judging.
3. **Take the picture before changing anything**, in light and dark (and sepia where the thing has its own ground), so the change can be compared.

## 1. Every control: replace, never adjust

1. **Name what kind of control it is** (remove ×, add +, labelled button, text link, dropdown, tick, text box, number, date, segmented choice, fold arrow, navigation arrow, funnel, "i", tab).
2. **Use the existing component of that kind** (`RemoveButton`, `AddButton` with its shape or `look`, `TextLink`, `OptionPicker` / `ValuePicker` / `MultiPicker`, `TickField`, `TextBox` / `NumberCell` / `TextField`, `DateCellInput`, `SegmentedToggle`, `FoldArrow`, `NavArrow`, `FunnelButton`, `InfoNote`). If none fits, stop and ask; do not write a look of its own, do not restyle a copy.
3. **No `<button>`, `<input>`, `<select>` or `<textarea>` of its own** outside the components themselves.
4. **No second class that adds a look** to a shared control (a hover, a ring, a size). A place's class says only where it stands.
5. **Delete what the replacement makes dead** (the old CSS, the old test's expectation) and run the dead-rule lint.
6. **A control's style lives with the control** (the component imports it): look at it on a page that does not load the interview sheets (the Landing, the System Selection, the Notes panel, the header, the documents).

## 2. Size, shape, colour

1. **Heights**: a single-line control and a labelled button 44px (`--add-button-height`, `--control-square`); the × and the "+" 32px; a tick 24px; the fold arrow 36px. Nothing random.
2. **Widths**: the closed set of widths (`--control-s/m/l`, hug, fill); a table column by what it holds.
3. **Colour follows the card**: a card, its tile, its tags, its pop-ups and windows take the card's hue (ground, line, ink), never a neutral grey or black where the card has a colour.
4. **A card is not a tile**: a card has a wireframe in its own line and a drop shadow; no inner light or shade (that is a tile's).
5. **Tokens, not values**: no hard-coded colour, size or gap; the tokens check and the style lint stay green.
6. **Text**: the type scale (14 / 18 / 24 / 36), the tracking that follows weight, text colour with the contrast of the rulebook in every mode.

## 3. Reactions: every control that can has them

1. **Hover** (the kind's own: glow, ground, thickened letters), **focus** (ring), **active / pressed** (darker), **disabled** (muted, not-allowed), **open** where it opens.
2. **One reaction per kind**: compare two controls of the same kind side by side (the add button against a header tool against a calendar button); a difference is a defect.
3. **Press and keyboard**: Enter, Space, Escape, arrows where the control has them; Escape closes what opened last.

## 4. Tooltips and names

1. Only a pressed control has a tooltip; an icon says its name; cut text says itself whole; never what is already shown (`26-tooltips.md`). A dropdown, a field, a tick, a tile, a label: none.
2. Every control has an accessible name; an icon-only control has an `aria-label`; no `title` that repeats it.

## 5. Layout and behaviour

1. **Does it fit?** At 1920, 1440, 1366 and the minimum 768: nothing cut, nothing wrapped by word where a phrase should stay together, nothing pushed off the edge; where it cannot fit, it scrolls, and the heading and the first column stay.
2. **Alignment**: one centre line in a row, one top and bottom for components of one height, the gaps of the closed set (6, 8, 12, 16).
3. **Layers**: a card over a card hides the one under it (one stack, one scrim, no double shadow); the page behind is shaded once; arrows and rails of a hidden layer are hidden.
4. **Order of opening and closing**: open A, then B from A, then C from B; close with Escape, Back and a press outside; each leaves the right thing open. Open the same card two ways.
5. **Empty, one, many, long**: no data, one row, hundreds of rows, a very long name, a number with many digits.
6. **Dark, light, sepia**: each, with the picture of section 0.

## 6. Content and data

1. **Words**: sentence case, no abbreviations that are not the app's, no bracketed hints in a dropdown option (the "i" says it), the same word for the same thing everywhere.
2. **What it shows is what is stored**: change an answer and see every place that shows it change (the page, the Inventory, the calendar, the review, the documents).
3. **A removed option**: what happens to old data that held it (cleared, said in the description, never lost silently).

## 7. Proof before "done"

1. `tsc`, the whole test suite, `lint:css`, `lint:styles`, `tokens:check`, `docs:check`, `library:check`, the layout check (0 new findings).
2. **The pictures after**, next to the pictures before, in the browser: say what was looked at and what was not (dark and sepia, the widths, the other pages that use the same component).
3. **Documents**: the log row (dated, newest on top), the component's state in `23-shared-components.md`, the rule if a rule changed, the examples if the interface changed, `npm run docs:index`.
4. **Report per request**, one line each: what was done, how it was checked, what is left. Never "done" for what was not looked at.
5. **Commit** only what was changed; no push, merge or tag without the owner's yes.

## 8. What the headless browser cannot see

It is not the owner's window: the owner's build may be stale (ask for a hard reload), the owner's screen size and zoom differ, and a hover or a pressed state must be driven by hand. Say so when a check rests on it.
