# Similar components, fields, cards and tiles: which share one component

This document describes the current situation, one dated section per state, the newest on top. What changed, and when, is written in the log (`04-log.md`), not here.

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

Not yet shared (the owner decides the order): free text and note cells (`TextField` categories), the name cell (`NameCell`), tooltips, the card head (`CardHead`), cards and tiles as one component each, the one-line text box, the raw `<select>`s.

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
