# NorthStardust: guide to the app (navigation, purpose, content)

Status: **reference**, updated 2026-10-21.

One page to find your way: what each part of the app is for, what it holds, and where the data and the rules live. The rules of layout are in `layout-rules.md` and `tile-and-card-pattern.md`; the cost rules in `design/01-current-design.md` (the cost model parts); this file is the map. Where each component is, and which are shared: `code-map.md` and `design/22-shared-components.md`.

## How the app is entered
1. **Organizations** (home): create, import or export an Organization; the two examples are in `src/data/examples/` (Lumen & Loom Studio, Quillfield Automation).
2. **System Selection**: Capabilities (Foundation, Deliver Value, Manage Information, Manage the Organization, Communicate, Measure & Improve) and their Systems. Left rail: Calendar, Capabilities, Systems.
3. **A System's pages**: an Introduction, then its pages. The left rail lists the pages (Pages), the page arrows go previous / next, and the arrow keys do the same where nothing else uses them. A page drawn as tiles has no Sections rail.
4. **Header**: reading mode, Focus, Search, Notes (the user's own notes, and under them **Card notes**: every card's Notes text by page, with a funnel that chooses the pages; a press opens the card -- `CardNotesService.ts`), Review (what is incomplete), Settings (Global Settings).

## The Foundation systems
| System | Pages | What it records |
|---|---|---|
| 1. Identity | Definition & Ethics, Organization (Legal Entity, Founders Profile) | Who the organization is in law and in purpose |
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
- **Global Settings** (header): the Opening Date and Plan Start, plan length, tax, pay on-costs, capitalisation limit, Useful Life by group (and each asset's own years under its group), royalty and commission rates, reserves, the Channel Fee Table.
- **The cards** carry their own dates, costs and statuses; the date defines the order of a list, then the number.
- **The Calendar** lists every card date (opening, formation, legal fees, starts, ends, warranty, payments, deadlines) with a funnel: the period, the kinds of date, the cards they come from; a note is made only on request.
- **Currency**: every total is in the organization's currency (the registered country's); a card in another currency is listed and flagged, not counted.

## The pattern
Tiles open a dialog; a dialog lists card boxes; a card box opens a floating card; a card links to the cards it is connected to (R. Resource, A. Activity, P. Partner, S. Supplier). The arrows beside the last-opened card or section step through its list.

## Where things are in the code
- Pages and editors: `src/components/interview/*Editor.tsx`; the page shell `src/pages/Conversation.tsx`; Global Settings `src/pages/GlobalSettings.tsx`.
- Tiles, dialogs, floating cards, carousel: `src/components/interview/tiles/` (`SectionTiles.tsx`, `Tile.tsx`, `TileGrid.tsx`, `FloatingCards.tsx`, `DialogLevels.tsx`; the Inventory is `CapabilityOverview.tsx`), cards in `src/components/interview/cards/` (`CardBoxes.tsx`, `BusinessCard`).
- The Infrastructure & Capability editor (`editors/BusinessCapabilityEditor.tsx`) is a short component that calls five hooks in `editors/capability/` one after the other: `useCapabilityState` (writes, folds, reads of other pages), `useCapabilityCardFields`, `useCapabilityPeopleCards`, `useCapabilityActivityAndDelivery`, `useCapabilitySections` (the boxes and sections, which call one another); each gets what the ones before it returned and returns what the ones after it need.
- Data shapes and readers, by domain in `src/framework/engine/`: `AnswerUtils.ts` (the generic part: defaults, emptiness, roles; it also re-exports all the others, so imports from it keep working), `AnswerProcess.ts` (process library and operational log), `AnswerBrand.ts`, `AnswerExport.ts`, `AnswerStrategy.ts`, `AnswerLegal.ts`, `AnswerFounders.ts`, `AnswerBusinessFoundation.ts`, `AnswerBusinessCapability.ts`; the money model: `FinancialModel.ts`; settings: `GlobalSettings.ts`; calendar dates: `CalendarCardDates.ts`.
- Styles: `src/styles/` (colours and sizes are tokens in `tokens/tokens.ts`, generated into `colors.generated.css` and `sizes.generated.css` (`npm run tokens`); tiles and cards in `section-tiles/` and `card-tile.css`; the global rules of a control in `cell-focus.css`). The shared controls are in `src/components/controls/` and each loads its own style.
- Examples: `src/data/examples/`. Rules for AI assistants: `docs/ai/README.md`.
