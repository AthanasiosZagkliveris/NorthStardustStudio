# Similar components, fields, cards and tiles: which share one component

This document describes the current situation, one dated section per state, the newest on top. What changed, and when, is written in the log (`04-log.md`), not here.

## State on 2026-10-20, the last of the day

- **The fold arrow is one**: the outlined triangle (an outline in the ink colour, filled under the pointer and the keyboard focus, 11 x 18 pointing right, 18 x 11 pointing down, no ground, no ring under the pointer). `FoldArrow` draws it everywhere (`fold-arrow.css`), `FoldHead` and the Notes' close arrow too; the title arrow (`title-arrow.css`) draws the same triangle at the title's size. The label arrow (`LabelArrow`, an SVG of the same shape) is the arrow that stands inside a label.
- **The native `title` tooltip is replaced**: `TitleTooltips` (`src/components/controls/TitleTooltips.tsx`, mounted once in `App`) shows an element's `title` in the app's tooltip (`TooltipBox`, placed by `aboveTipPosition`: above the element, 6px over it, its middle under the pointer, under it where there is no room above) and removes the attribute, so the browser's own tip (white, black frame and letters, whatever the reading mode) is never drawn. The element keeps its name: `aria-label` where it has no text, `aria-description` where it has. Escape closes it. The tests that render a component alone still see the `title`.
- **The header's tools and Refresh are the add button's look** (`.header-tool`: the accent ink, line and ground, the body size at weight 500, capitals, the add button's hover and focus).
- **The tags above and below a floating card** (its title and its record time) are the card's own look (ground of the card's hue, ink, corners, raised edge and shadow), 6px from the words to the edges, 12px from the card.
- **The calendar's controls** are the add button's look (the month's arrows, All and None, the periods, the date presentation) and the option picker's (the drop-down cells' chevron; the list they open).

## State on 2026-10-20, at the end

`FoldHead` (`src/components/controls/FoldHead.tsx`) is the head of a folding group outside the cards: the card's fold arrow (`FoldArrow`), the name in the card head's type (body size, bold, tracked), the count and a rule under them. The Review's Organizations and the Notes panel's groups (the Organizations' and the card notes) are drawn with it; the Review keeps its Organization name at the section's size and its groups as subheads. `FoldArrow` loads its own stylesheet (`fold-arrow.css`), so a page that does not load the interview sheets draws it as every card does.

A card opened from another card that stays open stands BELOW it as a pair (`StackUnderContext`, `DialogLevels.tsx`): the page that holds the open card gives it, live, and `SectionTiles` draws it with the card it opened (a legal expense under a founder's card). The Inventory's card is alone.

Left, on purpose: the typed arrows of the Process library's rows (a page not reachable in this app version), the Notes panel's close arrow (the drawn arrow, its own action), the Business fields and the founders' cards' rows, `NumberedListInput` and `SuggestedInput`.

## State on 2026-10-20, last

`FieldHead` (in `interview/FieldRow.tsx`) draws the label of a field with its "i", mark and status line for the Business fields (`BusinessField`) and the Legal Entity page's (`FieldRow`): 867 field rows compared against the build before by their markup: the same. `Tile` draws every tile, `TileGrid` every tile grid, `BusinessCard` every card.

## State on 2026-10-20, later

Three components that were missing are written (the counts are the ones in the list they leave):

| Component | File | Draws | Places |
|---|---|---|---|
| `TickField` | `src/components/controls/TickField.tsx` | A tick and its words as one `<label>` (the words clickable, the tick the one `TickBox`); the class a place passes is its row's layout, the look of the words is one rule (`.tick-field`, `cell-focus.css`) | 13 (the tick fields, the optional fields', the switches, the options, the filters') |
| `PopupPanel`, `usePopupDismiss` | `src/components/controls/PopupPanel.tsx` | `usePopupDismiss`: a press outside closes a popup and Escape closes it and goes no further. `PopupPanel`: a panel drawn outside the boxes around its control (in the dialog's overlay, else on the page), placed free of them and again when its size changes, in the hue of its control's box, with the focus on it where asked | `PopupPanel`: the info note, the colour picker; `usePopupDismiss`: those two and the option picker, the suggested input, the date and month popups, the theme switch, the calendar's period menu, the reorder menu and the responsibility filter (10) |
| `FieldRow` | `interview/FieldRow.tsx` | A label and its control as a cell of the Legal Entity page's grid: the label with its "i", mark, status line, link symbol and ×; beside or above; wide; a pair of a column, nested | the page's two row helpers (`field`, `labelled`) |

Still their own: the dismissal of the floating card itself, the Notes panel, the calendar panel, the card title help and the channel resources (they close a layer, not a popup); the Business fields (`BusinessField`, 69 uses: its own class family, its lacks and its tick) and the founders' cards' rows.

Checked in a browser against the build before (9 pages, both examples, the dialogs and the floating cards): the rows, labels, ticks, heads, cards, texts, dropdowns, info notes and colour pickers are the same; the colour picker, the info note, a dropdown, the date popup and the notes funnel close by a press outside and by Escape.

## What is left on 2026-10-19

The survey below was re-counted in the code on this date; two of its figures were out of date (no raw date inputs are left; the plain text boxes are about 40 in the components, not 106).

| # | Family | Counted in the code on 2026-10-19 | One component | Risk |
|---|---|---|---|---|
| 1 | Raw `<select>` | Done 2026-10-19: none is left (8 were raw: `ProcessLibraryEditor` 3, `OperationalLogEditor` 3, `CalendarFunnel` 1, `DynamicTable` 1, and the select mode of `InterviewInput`, which `FieldRenderer` uses twice; the first count of 11 included comments) | `OptionPicker`; `ValuePicker` for choices whose value is not their words | Done |
| 2 | Date and month popups | Done 2026-10-19 as far as the popup goes: `DateCellInput` (14 uses) and `MonthYearPicker` (8 uses) share `DatePopup.tsx` (`useDatePopup`: opening, placement, close on a press outside and on Escape; `DatePopupHead`: the four steps around the title) and its `date-cell-popup-*` classes; each still draws its own days or months | `DatePopup`; a single `DateCell` with a month setting is not done: the two cells differ (typed text and a calendar button against a button with the month's name) | Done (the cell itself: decide) |
| 3 | Lists | Done 2026-10-19: the read-only lists are one `ListStatic` (`marker` number or bullet; 5 uses), and the name's text area (`CardNameInput`, 14 uses) is a `TextField` (`maxLines={2}`, `list={false}`). Left: `NumberedListInput` (708 lines, 10 uses: the editor, with its own drag, add and remove per line) and `SuggestedInput` (3 uses: a text area with a suggestion list), which are different controls, not copies | `ListStatic`; `TextField` | Done (the editors: decide) |
| 4 | One-line text box | Done 2026-10-19 for the components and pages: 28 plain text inputs are `TextBox` and 12 numeric ones that computed their keyboard (from the number's limits) are `NumberCell` (which now takes `inputMode`). Left, on purpose: the filter boxes of `CapabilityOverview` (bare, styled by their menu), the date cell's own text (`DateCellInput`), the option picker's search box, the search dialog's combobox, the native `type="number"` and `type="time"` inputs, the library's demo parts and the Looks page | `TextBox` | Done |
| 5 | Grids | Done 2026-10-20: every tile grid is a `TileGrid`; the Inventory's is `bare` (its own box and scroll, its columns from the stylesheet) | `TileGrid` | Done |
| 6 | Tiles | Done 2026-10-20: every tile (the page tile, the dialog's section tile, the category tile, the card tile) is drawn by `Tile` (`interview/Tile.tsx`): the slot with the tile's control in it (a button, or a plain box) and what the place puts after it, in its order; the repeated parts are `TileLinks`, `TilePlus`, `useTileAim`. The markup of 1,041 slots of the 9 pages and their dialogs is the same as before, attribute for attribute | `Tile` | Done |
| 7 | Card bodies | Done 2026-10-20 for the Legal Entity cards: the requirement, the expense and the founder card are drawn by `BusinessCard` (`legal`: the Legal Entity page's box, head and number, `legal-entity-*`), with the card's head (`CardHead`), name (`NameCell`) and box (`CardShell`) like every card. The merge of their CSS into the Business card's was tried on 2026-10-20 and put back (it moved the number and the glass ground): the look is the same, the component is one | `BusinessCard` | Done (the CSS stays two) |
| 8 | Not joined, by decision | The fold arrow (36px) and the label arrow; the image-holder label; the sub-channel head; the Brand column headings; `NumberedListInput` and `SuggestedInput` (editors with their own keys, not copies); the Strategy boxes' heads (`StrategyHead`, no fold arrow) | none | none |

Checked in a browser on 2026-10-19 (the build before the unifications, 840ce91, beside this one, on the 9 pages of the layout check at 1400 wide, every card open): the position, size and 11 computed styles of every add button, tick box, number cell, field label, card head, name, tile grid and slot, card box, text cell and dropdown are the same (one difference found and fixed: two cells that are a number only when the field has limits had become number cells). Clicked: the add button adds a card, a tick box toggles, a number cell takes its number. Not looked at: the tooltips (the Roadmap bars, the action symbols, the noted fields and the card tiles' tips are not on a reachable page of this example; their tests pass) and the Process library and Operational log pages (not reachable in this app version).

## State on 2026-10-20

`CardBoxes` draws its grid through `TileGrid` (`threeAcross`).

The tiles share their links layer (`TileLinks`), their "+" (`TilePlus`) and the page tile's hover origin (`useTileAim`), all in `TileParts.tsx`. Checked in a browser against the build before this change: the rest and hover rectangle, origin, transform, lines and markup of 96 tiles of the 9 pages and their dialogs are the same.

## State on 2026-10-19

Every one-line text cell is a `TextBox` (a plain text input; the place's class gives the look) and every number a `NumberCell`, with the exceptions in the list below.

The read-only lists are `ListStatic` (a numbered or a bullet list); a card's name is a `TextField` with `maxLines={2}` (`CardNameInput`).

The date cell and the month picker open, place and close their popup through `DatePopup` (`useDatePopup`, `DatePopupHead`).

Every dropdown is an `OptionPicker`: no `<select>` element is drawn anywhere. `ValuePicker` (in `OptionPicker.tsx`) is the same dropdown for choices whose value is not their words (a key, a number, a period's id); `InterviewInput`'s select mode is an `OptionPicker`. The CSS of the native select (7 files) is removed.

As 2026-10-19, and the free text cells, the names, the card heads, the tooltips, the cards' outer boxes and the tile grids are components:

| Component | File | Draws | Places |
|---|---|---|---|
| `TextField` | `src/components/controls/TextField.tsx` | Every free-text cell: a text area that grows with its words and never scrolls inside itself (the shared `useAutoGrow`; its own CSS height or `rows` is the floor), with the list writing ("- " or "1. " at the start of a line; Enter continues). `list={false}` for a name or a one-line purpose, `grow={false}` for a fixed height, `onKeyDown` for a place's own keys (the Notes panel's #), `elementRef` for a place that moves the focus | the Notes field, the Strategy text area, the interview input's text area, the table cells, the answer renderer's subtitles, the process library's cells, the Notes panel's notes (7 families, 5 hand-written copies removed) |

| `NameCell` | `interview/NameCell.tsx` | A card's name in its head, one slot for three ways: asked (`editing`: the name's box, `CardNameInput`, two rows at most), a link (`link`: the name opens another place) or shown as text (`empty` when there is none) | 6 heads |
| `CardHead` | `interview/CardHead.tsx` | The head of a folding card, always in this order: fold arrow (absent when the card does not fold), number (`CardNumber`), the card's mark, the name (a `NameCell` or the section's title), the actions (x, handle), then the row under the name (the summary). The classes stay the card kind's own (`className`, with `fold-card-head`) | 6 heads: the shared business card, Segment, the financial sections, the Legal Entity requirement and expense cards, the founders' cards |

| `Tooltip` | `src/components/controls/Tooltip.tsx` | The dark tooltip label: `TooltipBox` is the one box every tooltip is drawn in (on the page body, hidden until placed; `className` only adds a place's inside look). `useAboveTip(text, { box, alignRight })` is the hook of an icon or symbol: above the hovered text, 6px over it, its middle under the pointer (or its right edge on the box's right edge), under it where there is no room above | the card tiles' and the channel resources' tips, the action symbols, the Roadmap's bars (its own placement), the noted fields' notes (their own placement and content): 5 families, 3 hand-built boxes removed |

| `StrategyHead` | `interview/StrategicPeriodEditor.tsx` | The head of a Strategy box (Theme, Goal, Objective, Metric): the number with the name (`NumberedName`), the kind with its "i" (`HeadKind`), the box's actions (`BoxActions`) | 4 heads |

| `CardShell` | `interview/CardShell.tsx` | The outer box of every card and section panel: `business-foundation-input`, `business-foundation-card`, `business-engagement-input` (each switched off only where a box never had it), the place's own `className`, its anchors, rail and hue. `legal`: the Legal Entity and Founder cards' own box (`legal-entity-card`) | 17 section panels and cards, the shared `BusinessCard` itself, 3 Legal Entity and Founder cards |
| `TileGrid` | `interview/TileGrid.tsx` | The grid of tiles of a dialog or page view: the page's tile size, as many across as fit, the grid box and its `card-boxes` outer box; its tiles are a function of `across` (and `placed`, for a grid whose boxes keep their places: `columns`) | SubTiles, PictureBoxes, the section view and the category view of `SectionView` (4) |

`SectionTiles.tsx` (2,415 lines until 2026-10-19) is now the page tile and its slot (643 lines), with its parts in their own files and re-exported from it, so no import changed: `SectionTileTypes.ts` (the tile, link, add, mark, crumb and floating types), `SectionTileGeometry.tsx` (columns, anchors, frames, titles), `DialogLevels.tsx` (the dialog's inner levels, crumbs, heading, contexts, focus return), `TileParts.tsx` (face, title, list), `CarouselArrows.tsx`, `FloatingCards.tsx` (the floating cards and the tile dialog).

Not joined to `CardHead`, on purpose: the Strategy boxes' heads (they have no fold arrow and carry a kind label, in their own CSS), the sub-channel's head (no number; its name is a drop-down or a text box), and the Brand page's column headings (`brand-style-head`: a title with bullets, not a card's head). Forcing them into the folding card's head would change their markup and CSS for no shared behaviour.

Still their own: the rail labels (a CSS label beside a bullet), the Legal Entity heads keep their own number markup (`legal`: `legal-entity-card-number`, its own CSS, until the two numbers are one); the heads that are not folding cards (the brand style head, the Strategic Period's boxes, the sub-channel head); the suggestions box (`SuggestedInput`) and the numbered list (`NumberedListInput`), which join with `ListField`.

## State on 2026-10-19

Every place that needs one of these uses the component, never its own markup (rule 22.24 of `docs/ai/layout-rules.md`).

| Component | File | Draws | Places |
|---|---|---|---|
| `BackButton` | `src/components/controls/BackButton.tsx`, `back-button.css` | Every Back (card tab, dialog foot, page footer, Capability description): the solid arrow, the word in capitals, the tab's mid tone; bold and the "+" box colour under the pointer, the arrow growing 20% | all |
| `RemoveButton` | `RemoveButton.tsx` | The 32px x of cards, rows and notes | 8 |
| `FunnelButton` | `FunnelButton.tsx` | The one funnel (Responsibilities, Inventory and sort); filled while a filter is active | 2 |
| `AddButton` | `AddButton.tsx` | The wide "+ Add ..." button, the "+" box (`small` too) and the dashed Add Card tile (`shape` wide, box, tile) | 18 |
| `NumberCell` | `NumberCell.tsx` | Every numeric cell (`kind` int or decimal); width and alignment still come from the place's own class | 28 |
| `FieldLabel` | `FieldLabel.tsx` | Every `field-label` (`as` span or label) | 38, plus the channel resources' label |
| `TickBox` | `TickBox.tsx` | Every tick (class `brand-tick-box`), the bare ticks of the filters included | 15 |
| `LabelArrow` | `interview/LabelArrow.tsx` | The arrow beside a label, the Inventory menu's titles included | 4 menus + labels |
| `FoldArrow` | card and section code | The 36px fold arrow of cards and sections | by decision a second control, not merged with the label arrow |
| `TextLink` | `TextLink.tsx`, `text-links.css` | The text link; its long-text slide is the scroll of the link's box (`textLinks.ts`), as a tile's long title is, and ignores the reduce-motion setting because it moves only under the pointer | about 25 |
| `DateCellInput`, `MonthYearPicker`, `OptionPicker`, `OptionalNote`, `InfoNote` | their own files | Date, month, dropdown, optional note (one class: `business-foundation-note`), info "i" | as in the survey below |

Left as they are, on purpose: the image-holder label keeps its own line (a layout rule measures it).

What is left is listed, counted, in "What is left on 2026-10-19" below.

## State on 2026-10-17 (the survey)

A survey of 2026-10-17 (grep counts over `src`, non-test `.tsx`; a class may be shared in a way a count cannot see, so confirm one family before changing it). The owner's aim: all similar things share ONE component. Per `docs/design/17-library-vs-app.md` the looks already agree (24 of 25 library components match the app; only the Back of a tile view differs: 66 x 33 against 76 x 25); what is not shared is the code that draws them.

"Shared" says: **Yes** one component draws every one; **Partly** one component plus hand-built copies; **No** several.

| Family | Kind | Drawn today by | Shared? | What differs | One component |
|---|---|---|---|---|---|
| Name cell (name with its number) | field | `CardNameInput.tsx` (5 editors, 17 uses), `CardNumber.tsx`; number classes `legal-entity-card-number`, `strategy-box-head` | Partly | The number's place and size per card kind; the name is a link in some heads | `NameCell` (TXT.NAM.001.002), 2 rows at most |
| Free text, notes, optional description | field | `NotesField` (4 files), `StrategyTextArea` (21 uses), `OptionalField` (7), `InterviewInput`, `SuggestedInput`, `Notepad`, `DynamicTable`, `ProcessLibraryEditor`, AnswerRenderer | No (15 `<textarea>` in 12 files, 5 grow-as-you-type versions) | Grow rules, placeholder, the tick that opens it, class | One `TextArea` (TXT.ARE.001.001); the others become presets of it (see doc 22: four categories) |
| Numbered list text | field | `NumberedListInput` (10 uses), `NumberedListStatic`, `BulletListStatic` | Yes for input; read versions separate | Edit or read, number or bullet | `ListField` (LST.001) |
| One-line text box | field | `InterviewInput`, `SuggestedInput`, table cells, 106 plain `<input>` in 31 files | No | Width, suggestions, validation | `TextBox` (TXT.001) |
| Number boxes | field | `numberInput.ts` helper, 42 numeric inputs in 14 files | Partly (the logic, not the box) | Whole, decimal, digit limit, square | `NumberBox` (TXT.WHL / DEC / SQR) |
| Date cells | field | `DateCellInput` (12 uses); 2 `<input type="date">` in `CalendarFunnel` | Partly | The popup | `DateCell` (DAT.001) |
| Month pickers | field | `MonthYearPicker` (8 uses) with a popup that copies `DateCellInput`'s | Partly | Months or days | `DateCell` with a month setting, one popup (DAT.MON.001.001) |
| Dropdowns | field | `OptionPicker` (49 uses); 9 raw `<select>` in 6 files | Partly | Searchable, table cell | `OptionPicker` only |
| Tick boxes and tick lists | field | 22 checkboxes in 13 files, 8 class names | No | Label place, list layout, nesting | `TickBox` and `TickList` (TIK.001) |
| Text links | text | One look (`text-links.css`), 7 class names, about 25 call sites | Partly (the look) | Only the class and what it opens | `TextLink` |
| x remove button | button | 13 class names in 13 files, one look (`remove-button.css`) | Partly | Line weight in a completed card | `RemoveButton` (BTN.001) |
| + add button | button | `plus-box`, `strategy-add-button`, `organization-add-button`, `add-card-tile`; 30+ uses | No | Box, wide with words, tile | `AddButton` (BTN.ADD, 004, 005) |
| Info "i" | button | `InfoNote` (90 uses) with per-editor label wrappers | Yes | Note width | `InfoNote` |
| Back buttons | button | 5 classes (`carousel-rail-back`, `section-tile-back`, `back-arrow`, `back-link`, ...) | No | Footer, carousel tab, tile view | `BackButton` by placement |
| Arrows | button | `FoldArrow`, `PageArrow`, `LabelArrow`, `FoldAllToggle`, title arrow | Partly | Fold, page, title, label | One `Arrow` by kind |
| Label with its control | field | `field-label` x40 with 6 modifier classes, hand-built in each editor | No | Label width, "i", status mark | `FieldRow` |
| Card heads | card part | 8 head classes (`strategy-box-head`, `fold-card-head`, `brand-style-head`, ...) | No | Name cell, fold arrow, x, number | `CardHead` |
| Cards | card | `BusinessCard`, `CardBoxes`, `FounderCards`, brand cards, `strategy-box`, `legal-entity-card`, floating and completed cards; three editors of 5,849, 2,877 and 1,961 lines | No (about 8 versions) | Fold state, completed tint, floating or inline | One `Card` (open, folded, completed, floating) |
| Tiles | tile | `SectionTiles` (page tiles), `CardTile`, `PictureBoxes`, master tiles, add-card tile, `SubTiles` | Partly (one stylesheet family) | Size, dots, picture | One `Tile` by kind |
| Dialog headers | component | `DialogHeading` (25 uses, in `SectionTiles.tsx`) plus three dialogs with their own | Partly | Info note, size | `DialogHeader` in its own file |
| Rails and tabs | component | `BulletRail` family, `carousel-rail-*` | Partly | Dot rail only | `BulletRail` |

### The ten biggest groups to join

1. Free texts: 15 text areas in 12 files.
2. One-line text boxes: 106 inputs in 31 files.
3. Tick boxes: 22 in 13 files, 8 class names, no component.
4. + add buttons: 4 families, 30+ uses.
5. x remove buttons: 13 class names.
6. Cards: about 8 versions.
7. Label with its control: 6 modifier classes.
8. Card heads: 8 classes.
9. Back buttons: 5 classes, 3 sizes.
10. Raw `<select>` (9) and the day/month popup copy; then the text links (7 classes).
