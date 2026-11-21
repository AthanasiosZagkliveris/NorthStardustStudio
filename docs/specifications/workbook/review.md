# The Workbook — Review

Status: **current design**, written 2026-11-20. The Workbook's Review section: what is still to answer, worth a second look, missing from the documents, and the dates that matter, for the open Organisation; from the Landing page, the **Total review** of every Organisation.

> **Keep this document true:** whoever changes a group, an item's rule or "Go there" changes this file in the same commit, with a row in the log.

## What it shows

One column (`.glossary-page`), each Organisation a section headed by its name, then four groups (`OrganizationReview.tsx`):

| Group | What it lists |
|---|---|
| Still open | the questions and cards not answered yet, page by page |
| Worth a second look | answers that contradict or outrun others (an Objective outside the Strategic Period, the period beside the Financial Plan, a skill not covered …) |
| Key dates | the Opening Date, the business stage and the dates the answers set |
| Missing from the documents | what a document part needs and the answers do not hold yet |

Each item's **Go there** opens the page, card or field it is about (the field keys: `FieldKeys.ts`). Every gap, head and count is a token of the layout (layout rules, the Review: section 7, "The Review"); an Organisation's head and a group's head are the shared `FoldHead`, one count style; a group's count that repeats the Organisation's is left out; the key dates are never counted.

## The Total review (from the Landing page)

The header is the Landing page's (only the Workbook button); every Organisation in the Landing page's order, each its own section; with two Organisations or more, the Glossary's funnel chooses which show (`ResponsibilityFilter`). "No Organisations to show: the funnel leaves them all out." when none is ticked.

## Where it is in the code

`src/components/workbook/OrganizationReview.tsx`, `src/framework/engine/ReviewItems.ts`, `src/pages/Workbook.tsx`; the tests `src/pages/Review.test.tsx`, `src/pages/Workbook.test.tsx`.
