# 4. Strategy System — the page and its specification

Status: **index**, written 2026-11-20. The Strategy System (System 4 of the Foundation) is ONE page, "4. Strategy System", of one chapter, **Situation & Direction** (`PageGroups.ts`: section 1 the page; sections 2, Goals & Objectives, and 3, Roadmap, hidden, their answers drawn inside the chapter's Strategic Period tile). The System is answered after the Business System: a founder describes the business before choosing a strategy for it.

Each file here describes the app as it is; where it and the code differ, both are mended in one commit with a row in the log (`design/records/04-log.md`). The layout is the rulebook's (`ai/layout-rules.md`, sections 13 and 23); the questions are doc 49's (`design/questions/49-strategy-questions.md`), the codes the register's (doc 44, section 8).

## The page

| Section | Part | Specification | Editor | Data (`src/framework/engine/`) |
|---|---|---|---|---|
| 1 | Situation & Direction: Current Situation, SWOT Analysis, Strategic Compass, Strategic Period | `page-1-situation-and-direction.md` | `StrategyFoundationEditor` | `AnswerStrategy.ts`, `StrategyChoices.ts`, `businessDocuments/reading.ts`, `businessDocuments/swotSuggestions.ts` |
| 2 (hidden) | Goals & Objectives: the Themes' cards, drawn in the Strategic Period tile | `page-1-situation-and-direction.md`, section 5 | `StrategicPeriodEditor` | `AnswerStrategy.ts` |
| 3 (hidden) | Roadmap: the diagram tile in the Strategic Period dialog | `page-1-situation-and-direction.md`, section 6 | `StrategicRoadmapEditor` | `AnswerStrategy.ts` |

The editors are in `src/components/interview/editors/`; what the page reads from the other Systems is assembled in `src/pages/strategyReaders.ts`.

## What crosses into and out of the page

1. **In, from the Business System** (`strategyReaders.ts`, with the Global Settings): the Current Situation's draft, the SWOT's starts and SW2's suggestions, the Compass choices' context (the Segments, their Differentiation, the changes they named), the Objectives' drafts, the Financial Plan's dates.
2. **In, from the Identity System:** the Vision (shown above the SWOT and in the Compass's "i"), PB7 (the Themes' order) and PB8 (SC2's start, an Opportunity).
3. **Out:** the Business Plan's **Strategy and Milestones** (the situation, the SWOT, the Compass, the Themes, Goals, Objectives and Metrics, the Roadmap) and its Risks (pointing to the SWOT's Weaknesses and Threats) (`businessDocuments/plan.ts`).
