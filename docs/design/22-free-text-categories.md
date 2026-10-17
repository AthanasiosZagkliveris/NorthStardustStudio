# Free texts: four categories

A proposal, for the owner to confirm. It reads `docs/design/18-text-holders.md` (183 text holders found by the walk of the running app: 176 text areas and 7 text fields; the Quillfield example, 1920px, light theme). No text holder has a character limit today (no `maxLength` anywhere), so the "limit" column below is a proposal, set from the longest text the example holds and rounded up.

Name cells, numbers, dates, colours and search boxes are not free texts (they have their own components); the Text Hierarchy's px boxes are numbers.

## The four categories

| # | Category | What it holds | Size (type) | Rows it opens with | Grows to | Width | What the example holds today | Proposed limit |
|---|---|---|---|---|---|---|---|---|
| 1 | **Short text** | One value that is a word or a few: a setting, a code, a title, a trade-mark number | 18px | 1 | Never (one row, a longer text scrolls sideways and shows whole under the pointer) | One of the control widths (128, 160, 220, 300) | 7 fields; 6 to 30 characters | 60 characters |
| 2 | **List line** | One entry of a numbered list: a Value, a Principle, an Offering, a Responsibility, an Assumption | 18px | 1 in a dialog's list, 2 in a floating card's list | 5 rows | The list's column (345 to 637px) | 87 lines; 19 to 161 characters; 1 to 5 rows | 200 characters per line |
| 3 | **Note** | An optional description or usage note behind a tick (Description / Relevant Information, Usage, Notes, Address, Activity) | 18px | 2 | 12 rows, then scrolls | The card's width (328 to 668px) | 75 notes; 37 to 557 characters; 2 to 18 rows | 600 characters |
| 4 | **Long text** | A paragraph that is the answer itself: a tile's text (Aesthetics, Body Language, Imprint), the Value Proposition, a strategy statement | 18px | 6 in a tile's dialog, 8 for the proposition, 11 for a strategy statement | 12 rows, then scrolls | The dialog's width (668px) | 14 areas; 74 to 580 characters; 6 to 12 rows | 1,000 characters |

## What decides the category

- **One line or many?** One line (and never growing) is Short text. Everything else grows down as it is written, so the holder never shows a scroll bar before its maximum.
- **Is it a row of a list?** A numbered row is a List line, whatever its length: its number is inside the cell and its width is the list's.
- **Is it behind a tick?** An optional text (the tick is its label) is a Note.
- **Is it the answer of a tile itself?** The text a tile shows in its picture (the tile's own first lines) is Long text.

## What every category shares

- The one look of a cell you write into: the same edge, ground and focus ring (rule 13 in `layout-rules.md`), 18px text, the text left-aligned.
- A holder grows with its text from its opening rows to its maximum, and never changes the layout beside it.
- A character count under the holder only when it is within 20% of its limit.

## Where today's 183 holders fall

| Category | Holders | Style classes now | Differences to remove |
|---|---|---|---|
| 1 Short text | 7 | `interview-input` (text field) | none |
| 2 List line | 87 | `numbered-list-input` | opens with 1 row in a dialog and 2 in a floating card: one rule (1 row) |
| 3 Note | 75 | `business-foundation-note` 62, `legal-entity-note` 6 (+2 variants), `strategy-note` 3, `brand-mark-note`, `notepad-note-text` | five classes for one thing: one component |
| 4 Long text | 14 | `interview-input` (6 rows) 11, `strategy-prose` 2, `business-foundation-proposition-input` 1 | three sets of opening rows (6, 8, 11): one rule per kind of tile |

The four add up to 183: 7 + 87 + 75 + 14. The notes of category 3 are 58 in floating cards, 16 in tile dialogs and 1 in the Notes panel.

## Decided by the owner (2026-10-17)

- **List line**: one row by default, everywhere (the channel card's action lines too); a longer text grows it.
- **Note**: every optional text (Description / Relevant Information, Usage, Notes) is labelled **Notes**; the keys under it do not change.
- **Long text**: eight rows by default (a tile's text, the strategy statements); the Value Proposition keeps the height its column needs.
- **Not built yet**: all notes gathered under the Notes button, with a funnel in its side window, as a summary of every card's Notes.
- **Record time**: each floating card shows "Recorded <date> <time>" under it, as a note does (kept per organization in the browser, set the first time the card is made or opened).
