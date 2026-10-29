# NorthStardust: contents of the app

Status: **contents and reference**, updated 2026-10-29 (checked against the code). How the app is entered, its Systems and pages, where the figures and dates come from, and where things are in the code. The alphabetical list of places is `index.md`; the terms are in `glossary.md`; the contents of the documents are `docs/README.md`.

What each part of the app is for and what it holds is below. The rules of layout are in `ai/layout-rules.md` and `ai/tile-and-card-pattern.md`; the cost rules are in `design/core/01-current-design.md` (the cost model parts). Where each component is, and which are shared: `ai/code-map.md` and `design/current/21-shared-components.md`. The page-by-page content of the Business System is in `specifications/business-system/`.

## How the app is entered

1. **Organizations** (home, `/`): create, import, export or delete an Organization; a **Reload** button after the reading-mode picker reloads the app and refreshes the saved examples. The two examples are in `src/data/examples/` (Lumen & Loom Studio, Quillfield Automation). Two buttons open the next screen: **System Selection** and **Capability Generator** (an unfinished page: one text box and a disabled "Analyze Capability"; nothing follows it yet).
2. **System Selection** (`/assistant`): the Capabilities (Foundation, Deliver Value, Manage Information, Manage the Organization, Communicate, Measure & Improve) and their Systems; a line "back to the last place worked" when there is one. In the Foundation, **Business Documents** (`/documents`: Business Plan, Business Model Canvas and Financial Forecast, annual, quarterly or monthly, with CSV and PDF). The left rail (the Framework Navigator) holds the Calendar, the Capabilities and the Systems.
3. **A System's pages** (`/introduction`, then `/conversation`): an Introduction, then its pages. The left rail lists the pages (Pages), the right rail the sections of the page (Sections), the page arrows go previous / next, and the arrow keys do the same where nothing else uses them. A page drawn as tiles has no Sections rail.
4. **Header** (with an Organization open): the Organization's name and the save status, the reading-mode picker, Focus (on a System's pages), Search (Ctrl+K), Notes (the user's own notes, and under them **Card notes**: every card's Notes text by page, with a funnel that chooses the pages; a press opens the card -- `CardNotesService.ts`), Review (what is incomplete, with the key dates), Settings (Global Settings). On the Organizations screen only Review is shown, and it reviews every organization.
5. **Other pages**: Review (`/review`: Still open, Worth a second look, Key dates, Missing from the documents; each item with "Go there") and Global Settings (`/settings`).

## The Foundation systems

| System | Pages | What it records |
|---|---|---|
| 1. Identity | 1 Definition and Ethics (tiles: Organization, the Positioning tile named by the business stage, Mission, Vision; Philosophy, Values, Principles, Manifesto), 2 Legal Entity (tiles: Founders & Ownership, Capability, Registrations, Expenses) | Who the organization is in law and in purpose |
| 2. Brand | One page, Brand System: Ambassador (Aesthetics, Body Language, Communication & Voice, Imprint) and Style (Colours, Typography, Text Hierarchy, Icon & Logo, Brand Images) | How it looks |
| 3. Business | 1 Foundation, 2 Customer Engagement, 3 Infrastructure & Capability, 4 Financial Foundation, 5 Sustainability | What it sells, to whom, with what, and whether the money works |
| 4. Strategy | One page, Situation & Direction: Current Situation, SWOT Analysis, Strategic Compass, Strategic Period (its dates, the Roadmap tile, the Theme cards with their Goals, Objectives and Metrics) | Where it is heading |

(The saved sections 2 Goals & Objectives and 3 Roadmap of the Strategy System, and the Founders Profile of the Identity System, are no pages of their own: their data is kept and drawn inside the tiles above. The table of every tile by page is `design/core/01-current-design.md`, B.1.)

### Business, page by page
- **1. Foundation**: for each customer Segment, four tiles: Segment Description (the Segment and its Profiles), Value Proposition, Competitors, Offerings. A Profile, a Competitor and an Offering are cards that open floating.
- **2. Customer Engagement**: how each Segment finds, chooses and buys: the Customer Channel (tiles per Segment; a channel can make cost cards: "+ Add expenses", typical costs), then Customer Relationship and Demand & Conversion (these still fold; they are not tiles yet, `design/core/05-not-done-yet.md` 5.3).
- **3. Infrastructure & Capability**: two cards of four tiles. Infrastructure: Founders, Resources, Activities, Partners & Suppliers. Offering's Capability: Resources, Activities, Partners & Suppliers, Delivery. Under them, in the footer's band beside the page's Back: Inventory (every card with its cost, as tiles or as a table with a column list and a filter and sort window that opens outward; text size Aa in three steps) and Completed (grey; only while a card is completed). The footer lets the pointer through to them.
- **4. Financial Foundation**: Costs (a summary of what was recorded elsewhere), Funding Need, Capital & Funding, Financial Position. Four folding cards, not tiles yet.
- **5. Sustainability**: Revenue, Break Even. Two folding cards, not tiles yet.

## Where figures and dates come from
- **The Opening Date** is set on the Identity System's Organization tile; it decides the business stage, the plan start and the key dates (design document 28, 8.2a).
- **Global Settings** (header; sections Financial plan, Business stages, Pay and tax, Assets, Rates, Reserve, Channel Fee Table): the Plan Start (worked out) and plan length, tax, pay on-costs, capitalisation limit, Useful Life by group (and each asset's own years under its group), royalty and commission rates, reserves, the Channel Fee Table, and the Business stages (the Opening Date as a record, and the four durations: Planning, Launching, Managing, Growing).
- **The cards** carry their own dates, costs and statuses; the date defines the order of a list, then the number.
- **The Calendar** (left rail of System Selection) lists every card date (the key dates: plan start, registration, opening and the end of each stage's window; legal fees, starts, ends, warranty, payments, deadlines) with a funnel: the period, the kinds of date, the cards they come from; a note is made only on request.
- **Currency**: every total is in the organization's currency (the registered country's); a card in another currency is listed and flagged, not counted.

## The pattern
Tiles open a dialog; a dialog lists card boxes; a card box opens a floating card; a card links to the cards it is connected to (R. Resource, A. Activity, P. Partner, S. Supplier). The arrows beside the last-opened card or section step through its list.

## Where things are in the code
- Pages and editors: `src/components/interview/*Editor.tsx`; the page shell `src/pages/Conversation.tsx`; the other screens in `src/pages/` (`Landing.tsx`, `SystemSelection.tsx`, `Review.tsx`, `GlobalSettings.tsx`, `BusinessDocuments.tsx`, `CapabilityGenerator.tsx`); the routes are in `src/App.tsx`. Which sections make one page: `src/framework/engine/PageGroups.ts`; the System content: `src/assets/SystemAnswers/`.
- Tiles, dialogs, floating cards, carousel: `src/components/interview/tiles/` (`SectionTiles.tsx`, `Tile.tsx`, `TileGrid.tsx`, `FloatingCards.tsx`, `DialogLevels.tsx`; the Inventory is `CapabilityOverview.tsx`), cards in `src/components/interview/cards/` (`CardBoxes.tsx`, `BusinessCardFields.tsx`).
- The Infrastructure & Capability editor (`editors/BusinessCapabilityEditor.tsx`) is a short component that calls five hooks in `editors/capability/` one after the other: `useCapabilityState` (writes, folds, reads of other pages), `useCapabilityCardFields`, `useCapabilityPeopleCards`, `useCapabilityActivityAndDelivery`, `useCapabilitySections` (the boxes and sections, which call one another); each gets what the ones before it returned and returns what the ones after it need.
- `AnswerRenderer.tsx` hands each Answer Structure to one function (`editors/answer/render*.tsx`, a `switch` on the type in `SingleAnswerRenderer`), each given one `scope` (the props with their defaults and the state of `useAnswerState.tsx`); add an Answer Structure by adding its function to a group file and a `case`.
- The other big editors are built the same way: the component calls hooks in a folder beside it (`editors/engagement/`, `editors/legal/`, `editors/foundation/`), and the constants and small helpers it had outside the component are in that folder's `shared.tsx`.
- Data shapes and readers, by domain in `src/framework/engine/`: `AnswerUtils.ts` (the generic part: defaults, emptiness, roles; it also re-exports all the others, so imports from it keep working), `AnswerProcess.ts` (process library and operational log), `AnswerBrand.ts`, `AnswerExport.ts`, `AnswerStrategy.ts`, `AnswerLegal.ts`, `AnswerFounders.ts`, `AnswerBusinessFoundation.ts` (pages 1 and 2), `AnswerBusinessCapability.ts`; the money model: `FinancialModel.ts`; settings: `GlobalSettings.ts`; the business stage and its windows: `BusinessStage.ts`; key dates: `KeyDates.ts`; the Review: `ReviewItems.ts`; calendar dates: `CalendarCardDates.ts`.
- Styles: `src/styles/` (colours and sizes are tokens in `tokens/tokens.ts`, generated into `colors.generated.css` and `sizes.generated.css` (`npm run tokens`); tiles and cards in `section-tiles/` and `card-tile.css`; the global rules of a control in `cell-focus.css`). The shared controls are in `src/components/controls/` and each loads its own style.
- Examples: `src/data/examples/`. Rules for AI assistants: `docs/ai/README.md`.
