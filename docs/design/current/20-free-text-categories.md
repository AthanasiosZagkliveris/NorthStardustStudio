# 20. Free texts: four categories

Status: **current design**, updated 2026-10-29. The four categories and the owner's decisions are current; the character limits are a proposal and the one component per category is not built.

The four kinds of free text and what decides the kind. The holders themselves, with their counts, styles, rows and widths as the walk of the running app found them (Quillfield example, 1920px, light theme), are in `docs/design/current/16-text-holders.md` (generated; its counts are the current ones). No text holder has a character limit today (no `maxLength` anywhere in `src/`), so the "Proposed limit" column is a proposal, set from the longest text the example held when the categories were drawn up and rounded up.

Name cells, numbers, dates, colours and search boxes are not free texts (they have their own components); the Text Hierarchy's px boxes are numbers.

## The four categories

| # | Category | What it holds | Size (type) | Rows it opens with | Grows to | Width | Proposed limit |
|---|---|---|---|---|---|---|---|
| 1 | **Short text** | One value that is a word or a few: a setting, a code, a title, a trade-mark number | 18px | 1 | Never (one row, a longer text scrolls sideways and shows whole under the pointer) | One of the control widths (128, 160, 220, 300) | 60 characters |
| 2 | **List line** | One entry of a numbered list: a Value, a Principle, an Offering, a Responsibility, an Assumption | 18px | 1 (decided; one rule everywhere) | 5 rows | The list's column (345 to 637px) | 200 characters per line |
| 3 | **Note** | An optional description or usage note behind a tick (Description / Relevant Information, Usage, Notes, Address, Activity) | 18px | 2 | 12 rows, then scrolls | The card's width (328 to 668px) | 600 characters |
| 4 | **Long text** | A paragraph that is the answer itself: a tile's text (Aesthetics, Body Language, Imprint), the Value Proposition, a strategy statement | 18px | 8 (decided); today 6 in a tile's dialog, 8 for a strategy statement; the Value Proposition keeps the height its column needs | 12 rows, then scrolls | The dialog's width (668px) | 1,000 characters |

## What decides the category

- **One line or many?** One line (and never growing) is Short text. Everything else grows down as it is written, so the holder never shows a scroll bar before its maximum.
- **Is it a row of a list?** A numbered row is a List line, whatever its length: its number is inside the cell and its width is the list's.
- **Is it behind a tick?** An optional text (the tick is its label) is a Note.
- **Is it the answer of a tile itself?** The text a tile shows in its picture (the tile's own first lines) is Long text.

## What every category shares

- The one look of a cell you write into: the same edge, ground and focus ring (rule 13 in `layout-rules.md`), 18px text, the text left-aligned.
- A holder grows with its text from its opening rows to its maximum, and never changes the layout beside it.
- A character count under the holder only when it is within 20% of its limit.

## Decided by the owner (2026-10-17)

- **List line**: one row by default, everywhere (the channel card's action lines too); a longer text grows it.
- **Note**: every optional text (Description / Relevant Information, Usage, Notes) is labelled **Notes**; the keys under it do not change.
- **Long text**: eight rows by default (a tile's text, the strategy statements); the Value Proposition keeps the height its column needs.
- **Card notes**: the Notes panel lists every card's Notes (name, page, text) under a funnel that chooses the pages; a press opens the card (`CardNotesService.ts`).
- **Record time**: each floating card shows "Recorded <date> <time>" under it, as a note does (kept per organization in the browser, set the first time the card is made or opened).

## What is still to make

By rule there are **four** categories. In the styles there are still more classes than that (the classes and counts are in `16-text-holders.md`):

| Category | Style classes now | Difference to remove |
|---|---|---|
| 1 Short text | `interview-input` (text field) | none |
| 2 List line | `numbered-list-input` | none: one row by default (decided) |
| 3 Note | `business-foundation-note`, `legal-entity-note` (+2 variants), `strategy-note`, `brand-mark-note`, `notepad-note-text` | five classes for one thing: one component |
| 4 Long text | `interview-input` (6 rows), `strategy-prose`, `business-foundation-proposition-input` | different opening rows (6 in a tile's dialog, 8 for a strategy statement, the proposition's own): one rule per kind of tile |

One component per category is still to be made. A list you write in (a numbered list), an image's holder and the holder of an image's name and note are drawn as a text box now (recessed, no stroke at rest).
