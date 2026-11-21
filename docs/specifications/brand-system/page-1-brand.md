# 2. Brand System — the page

Status: **current design**, written 2026-11-20, updated 2026-11-21. The Brand System's one page: its two chapters, their tiles, what each asks, what it reads and writes, and the rules it follows. The questions are doc 46's; the tile and card layout is the rulebook's (`ai/layout-rules.md`); this file names them and does not repeat them.

> **Keep this document true:** whoever changes a tile, a question, a draft or a read of this page changes this file in the same commit and writes the change in the log (`design/records/04-log.md`).

## Contents

1. [The page](#1-the-page)
2. [Chapter 1, Ambassador: the tiles](#2-chapter-1-ambassador-the-tiles)
3. [The Ambassador's questions and drafts](#3-the-ambassadors-questions-and-drafts)
4. [Chapter 2, Style: the tiles](#4-chapter-2-style-the-tiles)
5. [What the Style holds](#5-what-the-style-holds)
6. [What reads the page](#6-what-reads-the-page)
7. [Where it is in the code](#7-where-it-is-in-the-code)

## The System: its page, what it holds and what crosses it

(This was the folder's README until 2026-11-21.) The Brand System (System 2 of the Foundation) is ONE page, "2. Brand System" (`PageGroups.ts`: sections 1 and 2 on one page, no page name in the header), of two chapters, each its own section of the saved answer (`src/assets/system-answers/02_BrandSystemAnswer.md`).

Each file here describes the app as it is; where it and the code differ, the code is the bug or this file is, and both are mended in one commit with a row in the log (`design/records/04-log.md`). The layout (tiles, cards, measures) is the rulebook's (`ai/layout-rules.md`, sections 8, 9 and 13); the questions are kept in their questionnaire documents (`design/questionnaire/`), not repeated here.

### The page

| Section | Chapter | Specification | Editor | Data (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Ambassador | this file, sections 2 and 3; the questions in doc 46 | `AnswerRenderer` (the column page as tiles), `brand/AmbassadorChoices.tsx`, `fields/ColumnFields.tsx` (Imprint) | `AmbassadorChoices.ts` |
| 2 | Style | this file, sections 4 and 5 | `BrandStyleEditor`, `BrandInventoryEditor` | `AnswerBrand.ts` |

The editors are in `src/components/interview/editors/`.

### What crosses into and out of the page

1. **In:** the Identity System's Values (BA9's options, with their ids: `ValueIds.ts`, doc 46, section 5), the Business System's Segments, Profiles and Customer Engagement (BA1's limit by the business stage, BA7's order, BA8's options, the Body Language draft's relationship phrase: doc 46, section 2), the business stage (doc 28, 8.2).
2. **Out:** the Business Plan's Marketing and Sales, "Brand & Voice", and its Appendix, the Brand Style Guide (`businessDocuments/plan.ts`; the Workbook's Business Documents); the logo on every exported document's cover (`brandPictures`).

## 1. The page

One page, titled "2. Brand System", its two chapters side by side as every page of two chapters (layout rules, section 23: one chapter size in a window; below 1200px they stack). Each chapter is a frame of four Master Tiles in the 2 x 2 (layout rules, section 23), every tile a square of the one size, its title in capitals (layout rules, section 9, "A tile's title is in capitals, but a card tile's"), its list centred under it (section 8, "Tile anatomy").

| Chapter | Section saved | Tiles |
|---|---|---|
| 1. Ambassador | 1, `ambassador` and the four texts | Aesthetics, Body Language, Communication & Voice, Imprint |
| 2. Style | 2, `brandStyle` (with the inventory) | Colours, Typography & Text Hierarchy, Icon & Logo, Brand Images |

## 2. Chapter 1, Ambassador: the tiles

Each tile is a text the founder writes about the brand as a person (doc 46, section 1). The tile lists the text's first lines (a column page's tile: layout rules, section 9, "The text on a column page's tile"); its dialog shows the tile's choices in bands, one question a band, the tints alternating (layout rules, section 6, "Infrastructure & Capability's cards: one band a section", the band rule), then the text a field gap (12px) under the last band (layout rules, section 6, "A text under its choices stands a field gap under them"). The text's guidance is the "i" beside the dialog's title (layout rules, section 13), from `src/assets/system-questions/02_BrandSystemQuestions.md`.

## 3. The Ambassador's questions and drafts

Doc 46 owns the questions, their options, starts and "i" (section 2) and the drafts (sections 3 and 9); the register (doc 44, section 8) owns their codes. In short:

| Tile | Questions (doc 46, section 2) | Its text's draft (doc 46, section 3) |
|---|---|---|
| Aesthetics | BA1 the character (one choice while Planning and Launching, two from Managing), BA2 the dress, BA3 the surroundings (2 max) | "Our Ambassador is …, dresses in a … way and is pictured …." |
| Body Language | BA4 how it comes across (two ratings, started by BA1) | "They come across as …, and …." (the relationship, J3) |
| Communication & Voice | BA6 the tone (four ratings, started by BA1), BA7 the words | the tone and the words in a sentence |
| Imprint | BA8 how people should feel (2 max), BA9 what they should remember (2 max) | the two boxes: "People feel …." and "They remember us for …." |

BA5 is withdrawn (the relationship type answers it). Every draft is written in by itself while its text is empty or still the app's own, and the founder edits it freely (layout rules, section 6, "A draft is written in by itself"; `useAutoDraft`). No question changed in the round of 2026-11-20 18:35 (doc 46, section 11).

## 4. Chapter 2, Style: the tiles

| Tile | Its face | Its dialog | A box opens |
|---|---|---|---|
| Colours | every colour as a block, three across, the A colours first (layout rules, section 6, 20) | the colour boxes and the add box | a colour's card, floating |
| Typography & Text Hierarchy | the typefaces | the typeface boxes, then the Text Hierarchy's table (its roles in the table's "i") | a typeface's card, floating |
| Icon & Logo | the picture | the Icon and the Logo, each a holder with its file name and Notes (layout rules, section 13, item 11) | — |
| Brand Images | the images as blocks | the image boxes by kind | an image's card, floating |

The Brand pages' guidance opens in a note of double width (layout rules, section 13).

## 5. What the Style holds

- **Colours:** six slots, Primary A and B, Secondary A and B, Neutral A and B (`BRAND_COLOUR_SLOTS`); A slots on by default where a brand nearly always has one, a B slot depending on its A; each colour's contrast checked against white and black (WCAG 2.2, contrast ratio).
- **Typography:** three slots, Primary, Secondary, Optional (`BRAND_TYPEFACE_SLOTS`).
- **Text Hierarchy:** H1, H2, H3, Body Text, Captions & Metadata / Interface, each with a recommended size range (guidance, never enforced) and a Role column (Title, Section, Subsection) (`BRAND_HIERARCHY_LEVELS`; the round of 2026-11-20 18:35, batch A).
- **Icon & Logo, Brand Images:** the uploaded files, kept as thumbnails sized to their blocks (the log, 2026-10-31).

## 6. What reads the page

- The **Business Plan**: Marketing and Sales, "Brand & Voice" (the Ambassador's texts), and its Appendix, the **Brand Style Guide** (the colours, typefaces, Text Hierarchy and pictures); every exported document's cover carries the logo (`businessDocuments/plan.ts`, `brandPictures`).
- The **Review** and the **Glossary** (the names the founder gave: doc 46, section 5).

## 7. Where it is in the code

| Part | File |
|---|---|
| The page's sections | `src/assets/system-answers/02_BrandSystemAnswer.md`, `PageGroups.ts` |
| The Ambassador's tiles and dialogs | `src/components/interview/editors/AnswerRenderer.tsx`, `brand/AmbassadorChoices.tsx`, `fields/ColumnFields.tsx` |
| The Ambassador's questions and drafts | `src/framework/engine/choices/AmbassadorChoices.ts` |
| The Style | `src/components/interview/editors/BrandStyleEditor.tsx`, `BrandInventoryEditor.tsx`, `src/framework/engine/answers/AnswerBrand.ts` |
