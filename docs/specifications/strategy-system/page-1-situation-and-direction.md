# 4. Strategy System — Situation & Direction

Status: **current design**, written 2026-11-20, updated 2026-11-21. The Strategy System's one page and its one chapter: the four Master Tiles, what each asks, the cards of the Strategic Period, what the page reads and writes, and the rules it follows. The questions, their options and "i" are Questions 21's; the layout is the rulebook's; this file names them and does not repeat them.

> **Keep this document true:** whoever changes a tile, a question, a draft, a card's field or a read of this page changes this file in the same commit and writes the change in the log (`design/records/01-log.md`).

## Contents

1. [The page](#1-the-page)
2. [Current Situation](#2-current-situation)
3. [SWOT Analysis](#3-swot-analysis)
4. [Strategic Compass](#4-strategic-compass)
5. [Strategic Period: the Themes and their cards](#5-strategic-period-the-themes-and-their-cards)
6. [The Roadmap](#6-the-roadmap)
7. [What reads the page](#7-what-reads-the-page)
8. [Not built yet](#8-not-built-yet)
9. [Where it is in the code](#9-where-it-is-in-the-code)

## The System: its page, what it holds and what crosses it

(This was the folder's README until 2026-11-21.) The Strategy System (System 4 of the Foundation) is ONE page, "4. Strategy System", of one chapter, **Situation & Direction** (`PageGroups.ts`: section 1 the page; sections 2, Goals & Objectives, and 3, Roadmap, hidden, their answers drawn inside the chapter's Strategic Period tile). The System is answered after the Business System: a founder describes the business before choosing a strategy for it.

Each file here describes the app as it is; where it and the code differ, both are mended in one commit with a row in the log (`design/records/01-log.md`). The layout is the rulebook's (`ai/layout-rules.md`, sections 13 and 23); the questions are Questions 21's (`design/questions/21-strategy.md`), the codes the register's (Questions 6, section 8).

### The page

| Section | Part | Specification | Editor | Data (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Situation & Direction: Current Situation, SWOT Analysis, Strategic Compass, Strategic Period | this file | `StrategyFoundationEditor` | `AnswerStrategy.ts`, `StrategyChoices.ts`, `businessDocuments/reading.ts`, `businessDocuments/swotSuggestions.ts` |
| 2 (hidden) | Goals & Objectives: the Themes' cards, drawn in the Strategic Period tile | this file, section 5 | `StrategicPeriodEditor` | `AnswerStrategy.ts` |
| 3 (hidden) | Roadmap: the diagram tile in the Strategic Period dialog | this file, section 6 | `StrategicRoadmapEditor` | `AnswerStrategy.ts` |

The editors are in `src/components/interview/editors/`; what the page reads from the other Systems is assembled in `src/pages/strategyReaders.ts`.

### What crosses into and out of the page

1. **In, from the Business System** (`strategyReaders.ts`, with the Global Settings): the Current Situation's draft, the SWOT's starts and SW2's suggestions, the Compass choices' context (the Segments, their Differentiation, the changes they named), the Objectives' drafts, the Financial Plan's dates.
2. **In, from the Identity System:** the Vision (shown above the SWOT and in the Compass's "i"), PB7 (the Themes' order) and PB8 (SC2's start, an Opportunity).
3. **Out:** the Business Plan's **Strategy and Milestones** (the situation, the SWOT, the Compass, the Themes, Goals, Objectives and Metrics, the Roadmap) and its Risks (pointing to the SWOT's Weaknesses and Threats) (`businessDocuments/plan.ts`).

## 1. The page

One page, "4. Strategy System", one chapter, **Situation & Direction**, of four Master Tiles in the 2 x 2: a standard chapter, half the page less 12px from a window of 1200px, at the left, its tiles the one size of every page in that window (layout rules, sections 13, "A page of one chapter", and 23). The tile titles are in capitals; a Theme's tile, which opens a dialog, too (layout rules, section 9). Each tile opens its dialog at its frame's top (section 23, "Every dialog opens at its frame's top").

| Tile | Its face | Saved under |
|---|---|---|
| Current Situation | the text's first lines | `strategyFoundation.situation` (and whether it was edited) |
| SWOT Analysis | the four lists' first lines | `strategyFoundation.swot`, `swotEdited`, `changeEffects` |
| Strategic Compass | the text's first lines | `strategyFoundation.compass`, `stance`, `growth`, `firstSegmentId` |
| Strategic Period | the period, then the Themes | section 1's period; sections 2 and 3 (the Themes' cards, the Roadmap) |

## 2. Current Situation

One text, its draft written from the Business System and followed until the founder edits it; "Refresh" replaces it with a new draft, asked first ("Replace your Current Situation?"). The draft says, a line each where answered (`currentSituationDraft`; Questions 21, 2.3 and 10): what is sold to whom with its price; each Segment's market (growing, shrinking, crowded, open); its named competitors and what it stands out for (K14); each Offering still being built, from Launching on (O2); how customers find and reach the business (the Discover, Evaluation and Purchase channels); the money in hand and sought, the expected revenue and the break even, the funding gap. Its "i": three linked questions (what you sell and to whom, how people reach you, how you are supported).

## 3. SWOT Analysis

Four numbered lists: Strengths, Weaknesses (inside the business), Opportunities, Threats (outside it). The dialog shows the Vision first ("the aim the SWOT is read against", P6, Questions 21, 9).

- **Starts** (Questions 21, 2.3): a quadrant never edited shows the market's starts (each Segment's growth and crowding) and SW1's lines; once edited, the founder's lines stand. Each start line once (a rated change's line, written twice before the round of 2026-11-20 18:35, is once; a test).
- **SW1**, "How could these changes affect you?", above Opportunities and Threats: a rating per change ticked (1 = Threat, 5 = Opportunity), the Segments' changes first and ticked (Questions 21, 2.3).
- **SW2**, "Which of these fit you?", under each list: ticks of the suggestions the answers support, a ticked one a line of the list (the list is the one owner) (Questions 21, 2.3 and 10; `swotSuggestionsOf`): the Differentiation, the funding need covered, the break even month (Strengths); the funding gap, the break even beyond the plan, an Offering still being built (Weaknesses); the market's starts, SW1's lines, the clear opening, customers beyond today's reach (Opportunities); the market's starts, SW1's lines, a Competitor hard to beat, a growing Competitor (Threats).
- Each choice band stands in the shared bands (layout rules, section 6, the band rule).

## 4. Strategic Compass

Three choices above the text, in this order (Questions 21, 2.4 and 9): **SC3** "Which Segment comes first?" (with two Segments or more), **SC2** "Where will growth come from in this period?" (2 max; Ansoff, and a first launch while Planning and Launching), **SC1** "What will this period's strategy mainly do?" (TOWS; at Planning and Launching the two options that seize opportunities), each with its start from the SWOT and the answers; under SC1, a line per Segment saying what it stands out for (P8). The text's draft is written in from the three (`compassDraft`; layout rules, section 6, "A draft is written in by itself"); its "i" holds the Vision.

## 5. Strategic Period: the Themes and their cards

- **Start and End**, month and year (three to five years; the Start up to 24 months back), beside the Financial Plan's dates.
- **Themes**: a tile each, added from seven suggestions (Growth & Market … Partnerships & Expansion) or named by the founder; a Theme's dialog is its card.
- **The cards** (layout rules, section 13, the strategy cards' heads and navigation): a **Theme** (its name, "What will you build?", and an optional description) holds **Goals** ("What will you achieve?"), a Goal **Objectives** ("What will be done, by when?", its name drafted from the open items of the Value Propositions and the uncovered skills, P9; a Start and End inside the period; a Responsible where there are founders), an Objective its **Initiatives** (a numbered list) and **Metrics** ("What will you count?": a description, a frequency, a unit with its currency, a baseline at the start and a target at the end). The names' questions are their placeholders (Questions 21, 10).

## 6. The Roadmap

A diagram tile in the Strategic Period dialog (layout rules, section 9, "Diagram tile"): the Themes' Objectives as bars across the period's months (`StrategicRoadmapEditor`).

## 7. What reads the page

- The **Business Plan's Strategy and Milestones** (the situation, the SWOT, the Compass, the Themes with their Goals, Objectives and Metrics, the Roadmap) and its **Risks**, which point to the SWOT's Weaknesses and Threats (`businessDocuments/plan.ts`).
- The **Review**: the Objectives outside the period, the period beside the Financial Plan.

## 8. Not built yet

Kept in Questions 21 with its rule; listed here so this page's state is whole: the SWOT's suggestions and Current Situation lines that need the founders' skill areas (2.9), the spare hours and the delivery shortfall, the Stress Test's case, the price below the cost of each sale, the unmet value and the K10 openings (2.3, 10); the "waiting" line and the six-month reminder (2.3); the Themes' order with its reasons and the balance check (2.5); the Goals' and Initiatives' suggestions (2.6); a Metric's linked figure and the Month unit (2.7); the Roadmap's markers (2.8).

## 9. Where it is in the code

| Part | File |
|---|---|
| The page's sections | `src/assets/system-answers/04_StrategySystemAnswer.md`, `PageGroups.ts`, `AnswerStrategy.ts` |
| The four tiles and their dialogs | `src/components/interview/editors/StrategyFoundationEditor.tsx` |
| SW1, SW2's labels, SC1 to SC3, the Compass draft | `src/framework/engine/choices/StrategyChoices.ts` |
| The drafts, the starts and the suggestions read from the Business System | `src/framework/engine/businessDocuments/reading.ts`, `swotSuggestions.ts`; `src/pages/strategyReaders.ts` |
| The Themes' cards and the Roadmap | `StrategicPeriodEditor.tsx`, `StrategicRoadmapEditor.tsx` |
