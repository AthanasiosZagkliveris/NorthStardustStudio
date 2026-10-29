# NorthStardust: index of the app and of its documents

Status: **index and reference**, updated 2026-10-29.

One page to find your way, in the app and in its documents. Terms: `app/glossary.md`. The list of every document: `README.md` in this folder's parent.

This page covers: what each part of the app is for, what it holds, and where the data and the rules live. what each part of the app is for, what it holds, and where the data and the rules live. The rules of layout are in `ai/layout-rules.md` and `ai/tile-and-card-pattern.md`; the cost rules in `design/01-current-design.md` (the cost model parts); this file is the map. Where each component is, and which are shared: `ai/code-map.md` and `design/22-shared-components.md`.

## How the app is entered
1. **Organizations** (home): create, import or export an Organization; the two examples are in `src/data/examples/` (Lumen & Loom Studio, Quillfield Automation).
2. **System Selection**: Capabilities (Foundation, Deliver Value, Manage Information, Manage the Organization, Communicate, Measure & Improve) and their Systems. Left rail: Calendar, Capabilities, Systems.
3. **A System's pages**: an Introduction, then its pages. The left rail lists the pages (Pages), the page arrows go previous / next, and the arrow keys do the same where nothing else uses them. A page drawn as tiles has no Sections rail.
4. **Header**: reading mode, Focus, Search, Notes (the user's own notes, and under them **Card notes**: every card's Notes text by page, with a funnel that chooses the pages; a press opens the card -- `CardNotesService.ts`), Review (what is incomplete, with the key dates; on the Landing page it is the review of every organization), Settings (Global Settings).

## The Foundation systems
| System | Pages | What it records |
|---|---|---|
| 1. Identity | 1 Definition & Ethics (Organization, Early Positioning, Mission, Vision; Philosophy, Values, Principles, Manifesto), 2 Legal Entity (Founders & Ownership, Capability, Registrations, Expenses) | Who the organization is in law and in purpose |
| 2. Brand | Style (colours, typefaces, hierarchy), Inventory (icon, logo, images) | How it looks |
| 3. Business | 1 Foundation, 2 Customer Engagement, 3 Infrastructure & Capability, 4 Financial Foundation, 5 Sustainability | What it sells, to whom, with what, and whether the money works |
| 4. Strategy | Strategic period, Foundation (themes), Roadmap | Where it is heading |

### Business, page by page
- **1. Foundation**: for each customer Segment, four tiles: Customers (the Segment and its Profiles), Value Proposition, Competitors, Offerings. A Profile, a Competitor and an Offering are cards that open floating.
- **2. Customer Engagement**: how each Segment finds, chooses and buys; channels (a channel can make cost cards: "+ Add expenses", typical costs).
- **3. Infrastructure & Capability**: two cards of four tiles. Infrastructure: Founders, Resources, Activities, Partners & Suppliers. Offering's Capability: Resources, Activities, Partners & Suppliers, Delivery. Under them, in the footer's band beside the page's Back: Inventory (every card with its cost, as tiles or as a table with a column list and a filter and sort window that opens outward; text size Aa in three steps) and Completed (grey; only while a card is completed). The footer lets the pointer through to them.
- **4. Financial Foundation**: Costs (a summary of what was recorded elsewhere), Funding Need, Capital & Funding, Financial Position.
- **5. Sustainability**: Revenue, Break Even.

## Where figures and dates come from
- **The Opening Date** is set on the Identity System's Organization tile; it decides the business stage, the plan start and the key dates (design document 28, 8.2a).
- **Global Settings** (header): the Plan Start (worked out) and plan length, tax, pay on-costs, capitalisation limit, Useful Life by group (and each asset's own years under its group), royalty and commission rates, reserves, the Channel Fee Table, and the Business stages (the Opening Date as a record, and the four durations: Planning, Launching, Managing, Growing).
- **The cards** carry their own dates, costs and statuses; the date defines the order of a list, then the number.
- **The Calendar** lists every card date (the key dates: plan start, registration, opening and the end of each stage's window; legal fees, starts, ends, warranty, payments, deadlines) with a funnel: the period, the kinds of date, the cards they come from; a note is made only on request.
- **Currency**: every total is in the organization's currency (the registered country's); a card in another currency is listed and flagged, not counted.

## The pattern
Tiles open a dialog; a dialog lists card boxes; a card box opens a floating card; a card links to the cards it is connected to (R. Resource, A. Activity, P. Partner, S. Supplier). The arrows beside the last-opened card or section step through its list.

## Where things are in the code
- Pages and editors: `src/components/interview/*Editor.tsx`; the page shell `src/pages/Conversation.tsx`; Global Settings `src/pages/GlobalSettings.tsx`.
- Tiles, dialogs, floating cards, carousel: `src/components/interview/tiles/` (`SectionTiles.tsx`, `Tile.tsx`, `TileGrid.tsx`, `FloatingCards.tsx`, `DialogLevels.tsx`; the Inventory is `CapabilityOverview.tsx`), cards in `src/components/interview/cards/` (`CardBoxes.tsx`, `BusinessCard`).
- The Infrastructure & Capability editor (`editors/BusinessCapabilityEditor.tsx`) is a short component that calls five hooks in `editors/capability/` one after the other: `useCapabilityState` (writes, folds, reads of other pages), `useCapabilityCardFields`, `useCapabilityPeopleCards`, `useCapabilityActivityAndDelivery`, `useCapabilitySections` (the boxes and sections, which call one another); each gets what the ones before it returned and returns what the ones after it need.
- `AnswerRenderer.tsx` hands each Answer Structure to one function (`editors/answer/render*.tsx`, a `switch` on the type in `SingleAnswerRenderer`), each given one `scope` (the props with their defaults and the state of `useAnswerState.tsx`); add an Answer Structure by adding its function to a group file and a `case`.
- The other big editors are built the same way: the component calls hooks in a folder beside it (`editors/engagement/`, `editors/legal/`, `editors/foundation/`), and the constants and small helpers it had outside the component are in that folder's `shared.tsx`.
- Data shapes and readers, by domain in `src/framework/engine/`: `AnswerUtils.ts` (the generic part: defaults, emptiness, roles; it also re-exports all the others, so imports from it keep working), `AnswerProcess.ts` (process library and operational log), `AnswerBrand.ts`, `AnswerExport.ts`, `AnswerStrategy.ts`, `AnswerLegal.ts`, `AnswerFounders.ts`, `AnswerBusinessFoundation.ts`, `AnswerBusinessCapability.ts`; the money model: `FinancialModel.ts`; settings: `GlobalSettings.ts`; the business stage and its windows: `BusinessStage.ts`; key dates: `KeyDates.ts`; the Review: `ReviewItems.ts`; calendar dates: `CalendarCardDates.ts`.
- Styles: `src/styles/` (colours and sizes are tokens in `tokens/tokens.ts`, generated into `colors.generated.css` and `sizes.generated.css` (`npm run tokens`); tiles and cards in `section-tiles/` and `card-tile.css`; the global rules of a control in `cell-focus.css`). The shared controls are in `src/components/controls/` and each loads its own style.
- Examples: `src/data/examples/`. Rules for AI assistants: `docs/ai/README.md`.

## Where each part is described

| Subject | Read | Kind |
|---|---|---|
| What the first published version contains | `design/33-specs-and-limitations.md` | specification |
| What it leaves for later | `design/34-future-features.md` | living list |
| The Business System pages, one by one | `specifications/business-system/` | specification |
| The Foundation elements, by layer | `design/01-current-design.md` | current design |
| Tiles, cards, rails, dialogs | `ai/tile-and-card-pattern.md`, `ai/card-kinds.md` | rules, reference |
| Layout, sizes, tokens, the layout check | `ai/layout-rules.md` | rules |
| Shared components, fields, defaults | `design/22-shared-components.md`, `design/14-components-list.md`, `design/15-fields-list.md`, `design/13-component-defaults.md` | current design, generated |
| Texts: holders, free texts, help, tooltips, pop-ups | `design/17-text-holders.md`, `design/21-free-text-categories.md`, `design/23-help-texts.md`, `design/25-tooltips.md`, `design/24-popups.md` | current design, generated |
| The assets library and its logs | `design/08-library-system.md`, `design/09-assets-library.md`, `design/10-library-log.md` | current design, generated, log |
| What changed, what is open | `design/04-log.md`, `design/05-not-done-yet.md` | log, living list |

## The questionnaire and the first version

The questions the app asks, in the order to read them. Where a later document disagrees with doc 33, **doc 33 governs**.

| Read | Document | What it answers |
|---|---|---|
| 1 | `design/33-specs-and-limitations.md` | The first published version: language, countries, legal forms, market structure, relationships, buyer and user, ages |
| 2 | `design/34-future-features.md` | Everything else, collected, designed or built, and deferred |
| 3 | `design/27-questionnaire-plan.md` | The goal, the funnel, the one test (does an answer save the founder work?) |
| 4 | `design/28-questionnaire-specification.md` | Every question, list, option and rule (the largest document) |
| 5 | `design/29-question-guide.md` | The flow of questions as trees and branches |
| 6 | `design/30-age-limits-by-activity.md` | Minimum ages by activity and country (research) |
| 7 | `design/31-positioning-categories.md` | The owner's buyer, user and purpose categories, and the decisions on them |
| 8 | `design/32-positioning-sources.md` | The sources behind each list of doc 31 |

| Topic | First version (doc 33) | Detail in |
|---|---|---|
| Countries and codes | The six countries and Other (any other country) | doc 28 5 |
| Legal forms | The six countries' own lists; five generic forms for Other | doc 33 section 3 |
| Market structure and relationship | Single-sided; B2C and/or B2B | doc 28 8.2 |
| Buyer category and life stage | Three categories, three life stages, separate questions | doc 33 section 5 |
| Buyer and user relationship; user's life stage | Six personal (B2C) or six business (B2B) relationships; four life stages (B2C) | doc 31 6.1, 6.2, section 10.6 |
| Ages | In the Segment, maybe as an "i" | doc 33 section 6, docs 30 and 31 |
| Accessibility, caregiving, full lists for more countries, multi-sided, B2G, G2B | Not included | doc 34 |
