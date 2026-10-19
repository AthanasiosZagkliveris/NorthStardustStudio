# Similar components, fields, cards and tiles: which share one component

This document describes the current situation, one dated section per state, the newest on top. What changed, and when, is written in the log (`04-log.md`), not here.

## What is left on 2026-10-20

The survey below was re-counted in the code on this date; two of its figures were out of date (no raw date inputs are left; the plain text boxes are about 40 in the components, not 106).

| # | Family | Counted in the code on 2026-10-20 | One component | Risk |
|---|---|---|---|---|
| 1 | Raw `<select>` | 11 in 4 files (`ProcessLibraryEditor` 6, `OperationalLogEditor` 3, `CalendarFunnel` 1, `DynamicTable` 1), plus the select mode of `InterviewInput` (2 places in `FieldRenderer`); `OptionPicker` has 50 uses | `OptionPicker` | Low: the dropdown's look changes slightly |
| 2 | Date and month popups | `DateCellInput` (407 lines, 14 uses) and `MonthYearPicker` (225 lines, 8 uses) share the floating-panel hook but each draws its own calendar; no raw date inputs are left | One `DateCell`, a month setting | Medium: both popups are owner-approved looks |
| 3 | Lists | `NumberedListInput` (708 lines, 10 uses), `NumberedListStatic` (4), `BulletListStatic` (1); `SuggestedInput` (3 uses) and `CardNameInput` (14 uses) are text areas of their own | `ListField` (edit and read), the two text areas as presets of `TextField` | Medium |
| 4 | One-line text box | 46 `type="text"` and 74 text-like `<input>`s in all, of which 22 are on the pages (`Conversation` 14, `GlobalSettings` 8, `Landing` 3) and 7 in the library's own demo parts; about 40 are in the components | `TextBox` | Low, a big sweep with little visible change |
| 5 | Grids | `CardBoxes` (three across, its own measuring) and `CapabilityOverview` (the Inventory's own scroll and filters) still draw their own; `TileGrid` has the other 4 | `TileGrid` with those two options | Low to medium |
| 6 | Tiles | 6 uses of the three drawings: `TileSlot` (page tile, with its hover origin and incomplete-lines-first order), the `SubTiles` tile and `CategoryTile` (simpler copies), `CardTile` | One `Tile` | High: hover origin and ordering must not change |
| 7 | Card bodies | The Legal Entity page keeps its `legal-entity-*` CSS and its number markup (`legal`); the Strategy boxes have no fold arrow and their own CSS | `BusinessCard` for the Legal Entity cards | Medium to high: many `>` child selectors |
| 8 | Not joined, by decision | The fold arrow (36px) and the label arrow; the image-holder label; the sub-channel head; the Brand column headings | none | none |

Not checked in a browser (tests and the layout check only): the add buttons, tick boxes, number cells, field labels, tooltips, Strategy heads, tile grids and the Segment card.

## State on 2026-10-20

As 2026-10-19, and the free text cells, the names, the card heads, the tooltips, the cards' outer boxes and the tile grids are components:

| Component | File | Draws | Places |
|---|---|---|---|
| `TextField` | `src/components/TextField.tsx` | Every free-text cell: a text area that grows with its words and never scrolls inside itself (the shared `useAutoGrow`; its own CSS height or `rows` is the floor), with the list writing ("- " or "1. " at the start of a line; Enter continues). `list={false}` for a name or a one-line purpose, `grow={false}` for a fixed height, `onKeyDown` for a place's own keys (the Notes panel's #), `elementRef` for a place that moves the focus | the Notes field, the Strategy text area, the interview input's text area, the table cells, the answer renderer's subtitles, the process library's cells, the Notes panel's notes (7 families, 5 hand-written copies removed) |

| `NameCell` | `interview/NameCell.tsx` | A card's name in its head, one slot for three ways: asked (`editing`: the name's box, `CardNameInput`, two rows at most), a link (`link`: the name opens another place) or shown as text (`empty` when there is none) | 6 heads |
| `CardHead` | `interview/CardHead.tsx` | The head of a folding card, always in this order: fold arrow (absent when the card does not fold), number (`CardNumber`), the card's mark, the name (a `NameCell` or the section's title), the actions (x, handle), then the row under the name (the summary). The classes stay the card kind's own (`className`, with `fold-card-head`) | 6 heads: the shared business card, Segment, the financial sections, the Legal Entity requirement and expense cards, the founders' cards |

| `Tooltip` | `src/components/Tooltip.tsx` | The dark tooltip label: `TooltipBox` is the one box every tooltip is drawn in (on the page body, hidden until placed; `className` only adds a place's inside look). `useAboveTip(text, { box, alignRight })` is the hook of an icon or symbol: above the hovered text, 6px over it, its middle under the pointer (or its right edge on the box's right edge), under it where there is no room above | the card tiles' and the channel resources' tips, the action symbols, the Roadmap's bars (its own placement), the noted fields' notes (their own placement and content): 5 families, 3 hand-built boxes removed |

| `StrategyHead` | `interview/StrategicPeriodEditor.tsx` | The head of a Strategy box (Theme, Goal, Objective, Metric): the number with the name (`NumberedName`), the kind with its "i" (`HeadKind`), the box's actions (`BoxActions`) | 4 heads |

| `CardShell` | `interview/CardShell.tsx` | The outer box of every card and section panel: `business-foundation-input`, `business-foundation-card`, `business-engagement-input` (each switched off only where a box never had it), the place's own `className`, its anchors, rail and hue. `legal`: the Legal Entity and Founder cards' own box (`legal-entity-card`) | 17 section panels and cards, the shared `BusinessCard` itself, 3 Legal Entity and Founder cards |
| `TileGrid` | `interview/TileGrid.tsx` | The grid of tiles of a dialog or page view: the page's tile size, as many across as fit, the grid box and its `card-boxes` outer box; its tiles are a function of `across` (and `placed`, for a grid whose boxes keep their places: `columns`) | SubTiles, PictureBoxes, the section view and the category view of `SectionView` (4) |

`SectionTiles.tsx` (2,415 lines until 2026-10-20) is now the page tile and its slot (643 lines), with its parts in their own files and re-exported from it, so no import changed: `SectionTileTypes.ts` (the tile, link, add, mark, crumb and floating types), `SectionTileGeometry.tsx` (columns, anchors, frames, titles), `DialogLevels.tsx` (the dialog's inner levels, crumbs, heading, contexts, focus return), `TileParts.tsx` (face, title, list), `CarouselArrows.tsx`, `FloatingCards.tsx` (the floating cards and the tile dialog).

Not joined to `CardHead`, on purpose: the Strategy boxes' heads (they have no fold arrow and carry a kind label, in their own CSS), the sub-channel's head (no number; its name is a drop-down or a text box), and the Brand page's column headings (`brand-style-head`: a title with bullets, not a card's head). Forcing them into the folding card's head would change their markup and CSS for no shared behaviour.

Still their own: the rail labels (a CSS label beside a bullet), the native `title` tooltips; the Legal Entity heads keep their own number markup (`legal`: `legal-entity-card-number`, its own CSS, until the two numbers are one); the heads that are not folding cards (the brand style head, the Strategic Period's boxes, the sub-channel head); the suggestions box (`SuggestedInput`) and the numbered list (`NumberedListInput`), which join with `ListField`.

## State on 2026-10-19

Every place that needs one of these uses the component, never its own markup (rule 22.24 of `docs/ai/layout-rules.md`).

| Component | File | Draws | Places |
|---|---|---|---|
| `BackButton` | `src/components/BackButton.tsx`, `back-button.css` | Every Back (card tab, dialog foot, page footer, Capability description): the solid arrow, the word in capitals, the tab's mid tone; bold and the "+" box colour under the pointer, the arrow growing 20% | all |
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

What is left is listed, counted, in "What is left on 2026-10-20" below.

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
