# The Workbook — Card Notes

Status: **current design**, written 2026-11-20. The Workbook's last section, with an Organisation open: the Notes field of every card, page by page.

> **Keep this document true:** whoever changes what a card note holds or where a press leads changes this file in the same commit, with a row in the log.

- **What it lists:** each card's Notes that holds text (a card's last field; layout rules, section 7, rule 11), under its page and its card's name (`CardNotesService`, `WorkbookCardNotes`; doc 20).
- **The funnel** chooses the pages shown.
- **A press** on a note opens its card, on its page, floating where the card floats (layout rules, section 8, "One way to present a card").
- **Kept apart:** the Notes panel of the header holds the person's own notes, each linked to a page, card or field; it is not this section (layout rules, section 7, "Notes (the side window)").

## Where it is in the code

`src/components/notepad/Notepad.tsx` (`WorkbookCardNotes`), `src/services/CardNotesService.ts`, drawn by `src/pages/Workbook.tsx`; the tests `src/services/CardNotesService.test.ts`, `src/pages/Workbook.test.tsx`.
