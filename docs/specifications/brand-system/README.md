# 2. Brand System — the page and its specification

Status: **index**, written 2026-11-20. The Brand System (System 2 of the Foundation) is ONE page, "2. Brand System" (`PageGroups.ts`: sections 1 and 2 on one page, no page name in the header), of two chapters, each its own section of the saved answer (`src/assets/system-answers/02_BrandSystemAnswer.md`).

Each file here describes the app as it is; where it and the code differ, the code is the bug or this file is, and both are mended in one commit with a row in the log (`design/records/04-log.md`). The layout (tiles, cards, measures) is the rulebook's (`ai/layout-rules.md`, sections 8, 9 and 13); the questions are kept in their questionnaire documents (`design/questionnaire/`), not repeated here.

## The page

| Section | Chapter | Specification | Editor | Data (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Ambassador | `page-1-brand.md`, sections 2 and 3; the questions in doc 46 | `AnswerRenderer` (the column page as tiles), `brand/AmbassadorChoices.tsx`, `fields/ColumnFields.tsx` (Imprint) | `AmbassadorChoices.ts` |
| 2 | Style | `page-1-brand.md`, sections 4 and 5 | `BrandStyleEditor`, `BrandInventoryEditor` | `AnswerBrand.ts` |

The editors are in `src/components/interview/editors/`.

## What crosses into and out of the page

1. **In:** the Identity System's Values (BA9's options, with their ids: `ValueIds.ts`, doc 46, section 5), the Business System's Segments, Profiles and Customer Engagement (BA1's limit by the business stage, BA7's order, BA8's options, the Body Language draft's relationship phrase: doc 46, section 2), the business stage (doc 28, 8.2).
2. **Out:** the Business Plan's Marketing and Sales, "Brand & Voice", and its Appendix, the Brand Style Guide (`businessDocuments/plan.ts`; the Workbook's Business Documents); the logo on every exported document's cover (`brandPictures`).
