# 2. What has not been done yet

Status: **living list**, written 2026-10-14, updated 2026-11-21 (every item checked against the code on 2026-11-21; the done ones removed). The one list of what is not built yet: sections 5.1 to 5.11 hold the open work, 5.12 points to every planned connection between answers ("Read by (not built yet)"), and 5.13 to every future feature and proposal kept in another document, one line each with the place its design lives. Remove an item when it is done and record it in the log (`01-log.md`). Everything here is a plan or a proposal unless it says "decided".

## Open now

**The questionnaire build**: built are the Segment card's questions (Questions 12), the Profile card's questions A1 to A3, A5, B1, C1 to C4, D1, D2 and E1 to E3 (Questions 13), and the Organisation and Positioning tiles (Questions 7 and 8). Not built: the Profile's A4 (kind of business) and A6 (specialised needs), the proposed Profiles by age term (the B2B ones by buying role and the end user's part of a Proxy or Dual-Intent Profile are built, Questions 13, section 2), and every read of the Segment's and Profile's answers listed as "Read by (not built yet)" in Questions 12 and 13 (section 5.12). What else is left of the first version is Questions 4; where each tile stands is Questions 1, section 11. The help texts follow Interface 10 (a proposal: only its size budget is built).

**The road**: the Tile System is built but for the items of 5.3; next are Batches D and E (5.4), then the extraction (5.7).

**On hold (owner, 2026-11-09)**: P2, the Profile's Needs before its Motivations; P4, the Segment's Box 4 (Purchasing Power & Behaviour) split in two; a full third example Organisation. None is built; each waits for the owner's word.

**Waiting for the owner**: the generated cards' inputs beyond "adding, not removing"; the open decisions of 5.8; the sizes and gaps that are not on a step (5.6).

**To unify**: the Legal Entity cards' own CSS (`legal-entity-*`) stays: a merge into the shared card was tried and put back, because the shared card's classes move the number, the name gap and the ground. The Inventory grid's columns come from the stylesheet and stay. The other places once thought to be copies are not (`01-shared-components.md`, "What is hand-made, read one by one").

**Not looked at in a browser**: the Process library and Operational log pages (not reachable in this version of the app); the tooltips of the Roadmap bars, the action symbols and the noted fields. The tests cover them.

**The catalogue records** (`03-catalogue-record.md` and the crawl behind it) still show Quillfield as an LLC (its "Form the LLC and get an EIN" activity); the next full crawl rewrites them. Quillfield is a sole proprietorship in the example now, and its figures moved with it (Funding Need $24,734, cash in hand $10,675, still short after the SBA loan's repayments $1,208; the golden files: `WRITE_GOLDEN=all`).

**The checks**: the wide layout check (`npm run check:layout:wide`) has a baseline (`baseline-wide.json`, rewritten 2026-11-22 by the owner's decision) that accepts 1,147 findings in 8 rules, 0 under the 24px rule, all on Business System › Infrastructure, so it shows only new ones; two full runs now give the same list (the review of 2026-11-21, `docs/proposals/app-review-2026-11-21.md`, section 4, L1 and L3); the standard baseline (31 findings, all the 24px target size) is rewritten only by the owner's decision.

**The library and the documents**: see 5.6 for the library (`npm run library:check` says whether it has drifted from the app). The names of files, symbols and scripts in Foundation 1 and Research 1 and 2 are checked (the document-reference test for Foundation 1); their statements, and 5.1 to 5.5, 5.7 and 5.8 below, are not re-checked line by line: where the log says an item is done, it is done. The clean-up and library plans of 2026-10-14 (old 5.6, 5.11 to 5.14) are in `../archive/plans/2026-10-14-cleanup-and-library-plans.md`.

## 5.1 The road (decided)

| Phase | Content | State |
|---|---|---|
| 1 | Light clean-up: one rulebook, baseline triage, current page names, a wider layout check; the drafts converted; asset library, first half | Done and merged (log, 2026-10-14 to 2026-10-22) |
| 2 | **Finish the Tile System** on the places that are not tiles yet (5.3) | Mostly done (2026-11-12 to 2026-11-20): every chapter is drawn as tiles; what is left is 5.3 |
| 3 | **Batches D and E** (5.4) | Open |
| 4 | **Full clean-up and optimisation** of the completed Foundation (5.6), plus the second half of the asset library (merge duplicates, fold the rules into the contracts) | Partly done: the CSS clean-up, the token source, the shared components and the lints are built; the unused-code pass is done (2026-11-21); the load and run measurements of 5.6 are not |
| 5 | **Extraction** into the new app (5.7) | Open |

## 5.2 The task plan F to K: what is not done

The plan of 33 tasks is locked ([the log's archive, 4.5](../../archive/log/log-archive-2026-07-to-10.md#45-the-task-plan-f-to-k-as-locked-on-2026-10-09)). F, G, H, I and J are committed; the engine files of I (Global Settings, cost nature, calculated lines, funds) are not individually re-verified, and the owner's one visual pass of J is not recorded. **Not done (a later batch):** K1, VAT as a pass-through, import VAT included, rates in Global Settings; K2, actuals: the Repair Record draws on the Contingency Fund, plan against actual.


## 5.3 Finish the Tile System

Every chapter is drawn as tiles; the page Financials is one chapter, Financial Foundation: the tiles of Section 4 (Revenue & Pricing) and Section 5 (Costs, Funding & Position) in reading order (Questions 20, sections 1, 2 and 11); its tiles and the records in the Workbook's Financial Documents are Questions 20, section 14. Built 2026-11-20: the owner's minimum pay and the personal survival budget on the founder (Questions 20, section 13). Not built yet on them: the Offering Economics card, RV1, O19, K15 as a record, FN1 and the fee on a VAT-inclusive price (phase 7a), the dialogs' nested sub tiles and the Cash Timeline as a Diagram tile (Questions 20, section 1). The rest:

| Where | State | What remains inline | Conversion (suggestion) |
|---|---|---|---|
| Business 4 and 5 · Financials | Tiles (2026-11-17), one chapter, Financial Foundation (its tiles: Questions 20, section 14) | The dialogs' nested sub tiles and the Cash Timeline as a Diagram tile (Questions 20, section 1); the Costs sub tiles opening the Inventory's table (IN4); a dialog wide enough for the costs table and the Operating months (owner to decide: the dialog is the half-width chapter's width) | Later steps of phase 1 (Questions 1, section 10) |
| Four editors | The old non-tile layout below the `asTiles` early return (Founders Profile, Legal Entity, Brand Inventory, Customer Engagement) | Still reachable: `asTiles` defaults to false, and `AnswerRenderer.tsx` draws the Legal Entity twice without it, which draws the Founders Profile without it | Find which screens still open those paths; remove the layout where none does |
| Help tile | Not a real kind in the code | Inventory and Completed are normal tiles recognised by id | Add a real "help tile" kind |

## 5.4 Workspace batches D and E

The briefs (`docs/proposals/workspace-d-duplicate-scenarios-compare.md` and `workspace-e-founder-helpers.md`; nothing of either is built) say D and E wait until the structure is stable; it is, and the order is decided (after the Tile System). What they ask for is checked below against the code.

**Already built** (the briefs asked to reuse them): `FieldKey`, `openField`, the field status line (with the unused "Changed in … · Reset" parts), the Workbook (its Review and its Glossary), the Notepad (the Notes tool), the undo toast, search, and `Sources.ts`. **Absent:** `planOutcomes`, scenarios, duplicate organisation and card, the Compare route, the lender check, the One-Pager.

| Item | State | Outdated in the brief | Effort |
|---|---|---|---|
| `planOutcomes` (one function for all outcome figures) | Absent | Must be extracted from `planCase`, `stressTest` and the forecast | M |
| D1 Duplicate organisation | Absent | "Annotations are copied": annotations no longer exist; notes live in the Notepad, per person, outside the organisation | S |
| D2 Duplicate a card | Absent | The card kinds are now the cost-model cards; generated cards must not be duplicated; offering links and shares kept or cleared by rule | L |
| D3 Scenarios | Absent | The scenario-able inputs table no longer matches; Global Settings are saved with each organisation; `withWhatIf` only scales revenue, so a layer that applies overrides to the whole document is needed | L (largest) |
| D4 Compare | Absent | Needs `planOutcomes` and a route; runway, funding gap, yearly profit and repayments must be added | M |
| E1 What would it take? | Partly exists: `whatItWouldTake` (`engine/financial/whatItWouldTake.ts`, percent levers for a cash shortfall) is tested, but no screen shows it today | The brief asks for "break even by month X", amounts per offering and "Try this" (needs D3) | M |
| E2 Lender-ready check | Absent | The Review page has changed; the ten rules must be re-checked against the new data; each needs a Source | M |
| E3 One-Pager and elevator pitch | Absent | Re-read segment, offering and founder data through `readFoundation`; one-page fit needs a measurement test | M |
| E4 Glossary hints | Absent | About 40 terms, each with a checked reference; conflicts with the global tooltip rules | M |

Suggested order: `planOutcomes`, then D1 and D3, then D4 and D2; E1 after D3; E2, E3 and E4 in parallel. One commit per item; the owner tries each batch once. References for E2 and E4 follow the source rule (Research 1).

## 5.5 Business System requirements (proposal)

From the analysis in Research 2, R10. Each requirement has an id, a priority (**M** must, **S** should, **C** could) and a state (**Gap** missing today, **Fix** exists but is wrong or unused, **New** a new idea, **Decision** waits for the owner). The findings table is Research 2, R10.1.

### 5.5.0 Starting points

- **Users:** early-stage entrepreneurs, one person to a small team, often freelancers working from home. English only.
- **Screens:** minimum width 768 px; classes Tablet 768–1199, Laptop (≥1200 wide, <1250 high), Desktop (≥1200 wide, ≥1250 high).
- **Accessibility:** WCAG 2.2 AA.
- **Principle:** keep the existing layout, style and structure; add content and logic; reuse existing components.
- **Activities** record dates, performers and resources. They carry no cost. **Performers** are founders or partners/suppliers.

### 5.5.0a The six functions of the app, and where the requirements sit

| App function | What exists today | Where this proposal adds |
|---|---|---|
| **1. Requests information** by text, choice, field, number, with help | Field types on all pages; help notes; limits on numbers | F2–F4, C1, C4, I4–I5 (more choices instead of free text) |
| **2. Stores and connects it** and creates further requests from it | Answers saved per organisation; cards link by id (resources, activities, offerings); generated cards (channel expenses, insurance) | C2, C11, C16 (links by id), I1 (Delivery Team shown on Delivery) |
| **3. Calculates, records, presents** (tables, diagrams, by time and category) | Demand, capacity, costs by nature, Funding Need, Break Even, forecast, Calendar, Inventory | C14 (spend by channel), I7–I9, A6, D4 Compare |
| **4. Proves and validates** | Completeness rules, open items, the Workbook's Review, capacity check, date checks, Stress Test, the Value Proposition's open items | A5, C9, E2 (Lender check), planOutcomes |
| **5. Helps** (instructions, resources, pre-filled data; Note and Calendar; messages, errors, reminders, limits; smart navigation) | InfoNote, Notepad, Calendar, Search, rails, arrows, Undo | A6, E4 (Glossary), C5 (proposals) |
| **6. Generates and exports Business Documents** | Business Plan, Canvas, Forecast; PDF and Markdown | E3 (One-Pager) |

Ordering of work (decided): the **Tile System** first (built, but for 5.3), then **Batches D and E** (section 5.4), then the full clean-up and optimisation, then the extraction.

### 5.5.2 App-wide requirements

| Id | Requirement | P | State |
|---|---|---|---|
| A1 | Minimum supported width **320 px** (the phone, 600px and under: layout rules section 23, "The phone"; was 768px with a notice below it, never built). | M | Done 2026-11-22 |
| A2 | Screen classes Tablet / Laptop / Desktop on width **and** height; one set of breakpoints (768, 1200, heights 900 and 1250) shared by all stylesheets and by the layout check. | M | Fix |
| A3 | WCAG 2.2 AA is the acceptance level, tested in all four reading modes (light, sepia, dark, auto). | M | Gap |
| A4 | Every setting that belongs to a business lives with the data it governs; Global Settings keeps only per-user and per-device preferences (section 5.5.6). | S | Fix |
| A5 | Completeness: each page names which answers are required, in one place, and the page status uses that list. Goals and targets are optional but nudged. | S | Gap |
| A6 | Calendar also reads: Strategic Period start/end, the plan start, and delivery calendar time of an offering when it is turned into dates. | C | Gap |
| A7 | Currency: an organization-level override beside the country default; cards of another currency are converted by a stated rate or flagged with a note the founder sees. | S | Gap |
| A8 | Example organisations and their tests are updated with every interface or requirement change. | M | Rule |
| A9 | Documents in the project are Markdown; PDFs are exports only. | M | Rule |
| T3 | The old non-tile layout under the `asTiles` early return in four editors is removed once no screen opens it (section 5.3). | S | Fix |
| X1 | **Extraction readiness:** shared parts (reading mode, notes, calendar, search, review, undo, help, export, preferences) have no import from Systems 05–24; the operations and social-media branches in `Conversation` are removed; storage stays behind the store interface; the desktop opener is the only Tauri import. | S | New |
| X2 | The examples are optional in the new app (they already load on demand: `ExampleOrganizations.ts`). | S | New |

### 5.5.3 Business Section 1 · Foundation

#### 5.5.3.1 Customer Segment and Profile

| Id | Requirement | P | State |
|---|---|---|---|
| F2 | **Pain points** are defined once: a need that is unmet or costly today, in the profile's words. The profile's challenges feed them; they are a choice list from the profile, not a new free text. | S | Gap |
| F3 | Segment and profile fields that are used as **filters** elsewhere (channel fit, relationship type, offering) are choices, not free text. A table lists which field filters which (section 5). | S | New; partly built: the Segment and Profile ask choice questions (Questions 12 and 13), nothing yet filters by them |
| F4 | A segment can mark its **touch preference** (self-serve, assisted, personal). It proposes the relationship type on Customer Engagement; the user can override. | C | New |

#### 5.5.3.2 Competitor

| Id | Requirement | P | State |
|---|---|---|---|
| F5 | Competitor and alternative gives a **price anchor** per offering (optional number and unit) that Pricing can show next to the offering's own price. | C | New |

#### 5.5.3.3 Value Proposition

F1 (needs by id), F6 (the draft from the ticked needs) and F7 (the open items) are built (Questions 15, sections 1 and 2).

#### 5.5.3.4 Offering

| Id | Requirement | P | State |
|---|---|---|---|
| F8 | Offering type is validated against the list. **Decision:** should it drive anything? Candidates: Product shows a materials group and stock; Service shows delivery hours; Hybrid both. | S | Decision |
| F9 | Each offering states how it is **bought**: one sale at a time, or every month. This is the single source, asked once; Delivery and Demand read it from there (today the Delivery card shows a mismatch note). | S | Fix |

### 5.5.4 Business Sections 2 and 3

#### 5.5.4.1 Section 2 · Customer Engagement

**Channels, stages, actions**

| Id | Requirement | P | State |
|---|---|---|---|
| C1 | Channel fit uses the segment's choices (F3): a channel shows which segments and profiles it suits. | S | New |
| C2 | A channel action has a **result** (a stage goal) as a choice and a link to the approach text, so the approach row can list its actions (the promise in the help text). | S | Fix |
| C3 | Removing a channel or category lists the expense cards it created and asks: keep (becomes an ordinary card), or remove. | M | Fix |

**Relationship types.** Each type is defined by the same short set of fields, so the types differ by data, not only by label:

| Field | Meaning |
|---|---|
| Purpose | Why the organisation keeps this relationship (acquisition, retention, upselling). |
| Touch level | Self-serve, assisted, personal. |
| Who delivers | Founder, partner, nobody (automated). |
| Typical channels | Channel categories where it usually happens. |
| Cost driver | Time per client, tool subscription, per-seat fee, none. |
| Fit | Segments and offering types it suits (from F3, F8). |

| Id | Requirement | P | State |
|---|---|---|---|
| C4 | The five types get these fields as a fixed definition; the user chooses a type and the page shows its definition. | M | Gap |
| C5 | The page proposes a type from the segment's touch preference (F4) and the offering's value; the user decides. | C | New |
| C6 | One offering can have a **complementary** second type for another motive (for example self-service to acquire, personal assistance to keep). | S | Gap |

**Goals**

| Id | Requirement | P | State |
|---|---|---|---|
| C7 | A ticked goal (Get, Keep, Grow) may carry an optional **target**: number, unit, period. | S | Gap |
| C8 | Each goal links to the figure it affects: Get → funnel and expected sales; Keep → cancel per month; Grow → repeat purchases. The page shows that figure beside the goal. | S | Gap |
| C9 | Open item: an interaction with an approach but no goal. | C | Gap |
| C10 | Goals and targets can create **Objective** and **Metric** cards on the Strategy page (section 7). | C | New |

**Expenses created through channels**

| Id | Requirement | P | State |
|---|---|---|---|
| C11 | Templates are matched by an **id**, not by the card's name, so renaming a card does not break the template or the fee lookup. | M | Fix |
| C12 | A template sets its **cost option** where its group has options (T4, T9, T10, T12), so a new card is not left without one. | S | Fix |
| C13 | T7 "Travel and van hire": move to the Vehicles category, or split into trips and van hire. **Decision.** | S | Decision |
| C14 | A channel shows its **monthly spend**, the demand it brings (`demand.channelIds`, finally read), and a rough **cost per customer**. Sustainability lists spend against expected sales by channel. | S | Gap |
| C15 | The offering shares of a made card follow the demand of that channel, not equal parts, once demand is known. | C | Fix |
| C16 | Channel fees (commission, fixed fee, chargeback) sit on the channel or subchannel and are found by channel id. | S | Fix |

#### 5.5.4.2 Section 3 · Infrastructure & Capability

The Delivery card as built is described in the Infrastructure & Capability specification (specifications/03-business-system/04-infrastructure-and-capability.md, section 7).

| Id | Requirement | P | State |
|---|---|---|---|
| I1 | The Delivery card **is linked to the Delivery Team cards** of the offering (the link already exists as the card's required offering link, but the Delivery card does not read it): it lists them with their cost and unit, together with linked logistics suppliers. | M | Gap |
| I2 | **Decided: Delivery Teams are connected to the Delivery cards.** My reading of "connected", to be corrected if wrong: each Delivery Team card linked to an offering appears on that offering's Delivery card as a person row, like a linked partner, with hours per unit (or per client) that count as external hours beside the founders' capacity. The card keeps its cost. | M | Decided |
| I3 | Delivery calendar time can be shown on the Calendar as a window from the order date when a date exists; otherwise stays a pace line. | C | New |
| I4 | **Working hours**: hours per week stays; add optional **working days** and leave allowance; the week-to-month rule (52/12) is stated on the card. | S | Gap |
| I5 | **Logistics zone / weight**: "By weight or zone" gets a small table (zone or weight band, price per parcel). Without it the option is only a label. | C | Gap |
| I6 | Legal form carries a **kind** (sole trader, company, partnership) used by the drawings and registry rules, instead of reading the label text. | M | Fix |
| I7 | Inventory gets an **Offering** column and filter; missing prices are counted on the tile. | S | Gap |
| I8 | Activities: no cost and no effort. The Calendar shows start and end; the card shows the **duration in days** computed from them. | C | New |
| I9 | Where a card is in another currency than the organisation's, the Inventory totals show each currency separately. | S | Fix |

### 5.5.5 Which information can link or filter (proposal)

| From | Can filter or pre-fill | Kind |
|---|---|---|
| Segment touch preference (F4) | Relationship type, channel categories | Proposal, user decides |
| Profile needs (by id) | Offering addressed needs, value proposition | Link |
| Profile pain points (F2) | Offering emphasis, approach text | Link |
| Offering type (F8) | Delivery fields, resource groups | **Decision** |
| Offering "bought" (F9) | Delivery mode, Demand model | Link, single source |
| Relationship type definition (C4) | Typical channels, who delivers, cost driver | Fixed definition |
| Channel category | Expense templates | Exists |
| Goal Get / Keep / Grow | Funnel, cancel per month, repeat purchases | Link (C8) |

### 5.5.6 Global Settings: what could move (all proposals)

| Setting | Proposed home | Effort |
|---|---|---|
| Income tax rate (global) | **Remove** (it silently overrides the Financial Foundation rate; the examples show the clash) | M |
| Income tax basis and rate | Identity > Organisation > Legal Entity > Tax | M |
| VAT/GST basis | Same card as "registered?" | M |
| Opening Date, Plan Start, Plan Length | Built: the Opening Date is on the Organisation tile and the Plan Start is worked out; the Plan Length stays in the Global Settings (Financial plan); the Strategic Period does not show them | S–M |
| Contingency rates, reserve months | Financial Foundation > Funding Need | S–M |
| Employer on-cost rate | Financial Foundation > Costs, people costs | M |
| Insurance per employee | The key-person health card, which already overrides it | S |
| Capitalisation limit | Financial Foundation > Costs, classification | M |
| Useful life per asset group | Infrastructure > Resources, group default, card overrides | M |
| Amortisation groups | May stay global | M |
| Royalty, affiliate, agent rates | Partner/Supplier card; Referral & Affiliates subchannel | M |
| Channel Fee Table | Channel or subchannel card, found by id | L |
| Date format, user name, reading mode, focus mode | Stay global (per user and device) | none |

Order of work: remove the duplicate income tax rate, then contingencies, then the plan header, then the rest. Risks: a migration for both example files, the tests that read the old shape, and the Strategy period must not diverge from the plan.

### 5.5.7 What the business pages could create on the Strategy page

| From | Could create | Note |
|---|---|---|
| Segment and offering gaps | Current Situation text | Exists. |
| Break-even and funding need | Metric cards (break-even month, funding need) | New |
| Goals with targets (C7) | Objective cards with a metric (C10) | New |
| Open items from the pages | Initiative suggestions, as text the user accepts | New |
| Themes | Still from the fixed list; a theme can be proposed from the strongest unmet need | C |

The user accepts or discards every suggestion; nothing is created silently.

## 5.6 Clean-up, optimisation and library: what is left

The plans of 2026-10-14 for the clean-up round, the library automation and its sizes are in `../archive/plans/2026-10-14-cleanup-and-library-plans.md` (sections 5.6, 5.11, 5.12, 5.13 and 5.14 there; code comments and scripts cite them by those numbers). Built: the rulebook reconciled; the layout check's probe corrected and its baseline rewritten; the CSS clean-up (dead rules, tokens gathered, the big sheets split into folders); the token source and generator (`npm run tokens`); the style lint with a baseline (`npm run lint:styles`) and the CSS lints (`npm run lint:css`); the library with its contracts, gallery and runner (`npm run library`); the generated documents; the shared components. **Left:**

- **The sync between the app and the tables (step 7 of `docs/design/library/01-library-system.md`, not built; moved here from section 6 of that document):**

  **How a change in the app reaches the table (step 7; not built).** A sync reads the app, compares what it finds with the table, and for every difference updates the table and writes the app structure log entry. It runs on demand for the whole app, and in watch mode during development: when a file in src changes and the dev server reloads, the sync re-reads the pages that file affects and updates the table within seconds. That is the "real time".

  **How the three cases are told apart (the same step).** For every asset the sync finds in the app, it looks the asset up in the library. Found: case 1 or 2 (the library log has, or gets, its entry with where it is placed). Not found: case 3 (app structure log only, marked not in the library, and listed as a drift).

  **What the sync reads (recommendation for step 7; the owner may change it).** The running app: what the user sees, exact, and it needs the dev server running. A check of the source finds a component or class name that is in the app and not in the library. Reading only the source is faster, but the cards are separate builders today, so it cannot yet tell fields from components.

  **Later.** Once an asset has replaced the old one (phase 3), the app is built from the library for that asset, and the sync then finds the asset where the library put it.

- The values of old 5.14 that are not on a step (gaps of 10, 14, 18, 20px and others; corners of 1, 2, 3, 7, 10, 12px; three window and container boundaries drawn twice) wait for the owner: each joins a step, becomes a step, or stays a literal in the lint's baseline. The decided breakpoint set (768, 1200, heights 900 and 1250) is not yet used by any query.
- The library: asset by asset, each with its contract, gallery entry and page code changed to use it (step 5), the style-reading tests converted as each asset gets its contract, then the page check last (step 6) with its baseline rewritten; the sync (`01-library-system.md`, step 7).
- Optimisation, measured before and after: load (`Conversation`, `Landing` and the registry chunks; the two examples already load on demand; every editor is in one chunk), run (the biggest editors re-render on every key: profile first, memoise only where the profile shows it), code (files over 2,000 lines such as `FinancialModel.ts`, `AnswerBusinessCapability.ts` and `Conversation.tsx`; duplicated helpers; the non-tile paths under `asTiles` in four editors (5.3); the Operations and social-media branches in `Conversation`). The old figures (a bundle of 662 KB, 1.07 MB of CSS, 1,355 tests) are of 2026-10-14 and must be measured again. Bundle-size limits have no official value: the limit is a choice to make after the first measurement. Target for interaction: "good" Interaction to Next Paint is 200 ms or less (web.dev).


## 5.7 Extraction into the new app: what the audit found

- **No Foundation folder exists.** Systems 01–24 are rows in `src/data/systems.ts`; the interview code is shared and the business editors are wired in as answer types. The cut is by feature, not by folder. Foundation-only Markdown content (Systems 01 to 04: Answer, Questions and Help files) is about 10 KB of 131 KB.
- **To keep** (shared parts): reading mode (`ThemeService`, colours), focus mode, notes (Notepad), calendar, search, review, undo, help notes, export and documents, preferences, storage behind its interface.
- **To leave behind:** Systems 05–24 content and menu rows, `CapabilityGenerator`, the operations and social-media branches in `Conversation`, and any editor only they use (Process Library, Operational Log, Roles & Responsibilities).
- **Not to leave behind:** Financial Foundation, Sustainability and the financial model. They are the Business System's Sections 4 and 5, drawn on its page Financials. (The raw audit listed them as "likely other systems"; that is wrong.)
- **Desktop-only code:** one import (`@tauri-apps/plugin-opener` in `InfoNote`, with a web fallback already in place), plus the Tauri folder and two port settings in the build file. A web build is straightforward.
- **Storage:** the Organisations are kept in this device's IndexedDB, behind one store interface (`IndexedDbStorage.ts`, `LocalOrganizationStore.ts`); the theme, the notes and the preferences stay in local storage. A server store fits behind the same interface. The two example organisations alone are about 600 KB.
- **Calendar: decided, it exists in the new app.** The earlier Foundation App Plan listed it as staying behind. It reads card dates, so it depends on the card engine and travels with it; its sources (card dates, Operational Log, schedules) are kept.
- **Decision:** the form of the new app is open (5.8, item 8).


## 5.8 Open decisions

Decided on 2026-10-14 and therefore not open: Delivery Teams are connected to the Delivery cards; the Calendar exists in the new app; the order of the road; the Master Tile definition; the Inventory tile is a help tile; the minimum width 768; WCAG 2.2 AA; English only.

Still open (the requirement ids are those of 5.5):

1. What exactly the Delivery Team connection does to the numbers (I2). Proposed reading: each linked Delivery Team card appears on the offering's Delivery card as a person row, like a linked partner, with hours that count as external hours beside the founders' capacity; the card keeps its cost.
2. Does the Offering type drive anything (F8)?
3. T7 "Travel and van hire": move to Vehicles, or split into trips and van hire (C13)?
4. Which relationship-type definition (the six fields, C4) is accepted, and who writes it?
5. Is a rough cost per customer by channel wanted at this stage (C14)?
6. The 768 px floor against WCAG 1.4.10 Reflow: accept as a declared exception (5.6)?
7. Is the new app still a web app with accounts (as in the Foundation App Plan), and does it keep the Examples (5.7, X2)?

## 5.9 Known open findings

The confirmed problems that a diagnostic found and no turn has fixed (it was `docs/ai/outstanding-findings.md` until 2026-11-21).

- A diagnostic appends an entry here when it confirms a real problem and is not authorised to fix it in the same turn.
- An entry is removed (not marked done) once the problem is fixed and re-verified, and the log records it: this list holds what is still true.
- Before a new diagnostic scan, check here for anything already confirmed in the same area: re-verify it if the files changed since, confirm or correct the entry, and never add a second one beside it.
- The form of an entry: `### <short title>`, then Found by: `<skill>` · Confirmed: `<what was verified independently, not only what a scan reported>` · Fix: `<the correct fix, if known>`.

**Open today:** none.

## 5.10 What stayed in the project, and why

- `src/data/examples/`: the one copy of the two examples (the app reads it). `UPDATE_EXAMPLES=1 npx vitest run src/services/examples.test.ts` writes both from the app's own readers; the drift and review tests fail when an example is behind the interface.

## 5.11 Open from the documents review (2026-10-29)

For the owner to decide, or work not done. Each item leaves this list when done and the log records it.

**Pop-ups and tooltips (Interface 7, 25)**
- P2's panels are 260px wide today for the calendar and the colour card; a menu is as wide as its longest line. One width for every P2 panel would be simpler: say if wanted.
- A P4 tip is not announced to a screen reader except by the control's own label; the label already says it.

**Free texts (Interface 3, 17)**
- The character limits (60, 200, 600, 1000) and one component for each free-text category are not built.
- The tile text is decided at 8 rows by default; Interface 2 shows 6 today.

**Library (Library 1, 10, 11, 12)**
- Step 7 of the library plan (the sync of the app to the tables, with a watch mode) is not built.
- The hand-written rows of Library 6 (L0653 to L0659) and Library 7 (A0029 to A0034) hold facts the log does not (tipWords, aria-pressed, label-arrow.css, MultiPicker).

**The design record (Foundation 1, Research 1 and 2)**
- Part F of Foundation 1 is Foundation 2; its repeated template for each card could be reduced, but the catalogue tool reads its table shapes.
- Research 1, 2.7 (the source register, about 100 KB) could become its own document; other documents cite its ids.
- The Part G "Key flag" idea and the Part E "Both" place are in no code and no longer in Foundation 1: formally dropped? (They stay in Research 2 R2.)

**The questionnaire (Questions 1, 28, 29)**
- 25 ids are listed as withdrawn or merged, but 91 minus 67 is 24: the 91 or one id is wrong (Questions 2, Appendix B).
- I6 is counted as a check while 8.2 withdraws it, and I7 is counted as a driver while described as merged into I7c. Without I6 the count is 20 checks and 66 questions.
- The customers' industry list (G15, P24): 5.7 says the 18 plain industries are retired, but 6.3, 27 section 5 and 29 still use them. Marked [D] in Questions 2.
- Questions 2 is about 180 KB (sections 6 to 15 remain after section 5 became Research 3); Questions 7, 8, 12 and 13 are the tile documents taken out of it (Questions 1, section 11).

**Added by the review of the docs folder (2026-10-29)**
- The Shared Workspace proposal (`docs/archive/proposals/shared-workspace.md`) has no item in this list; its place is to be decided.
- `docs/ai/09-layout-rules.md`, section 11 ("The Engagement Strategy"), says every Journey Stage band starts folded; the code (`useItemFolds(true)` in `useEngagementState.tsx`) starts them open (the comment there says closed) and a test expects no fold arrow: the sentence and the comment are stale.
- `docs/ai/09-layout-rules.md`: section 8 says a dropdown list is exactly the width of its cell, section 10 says it is as wide as its longest option; the tile title in section 8 (a multi-line title) disagrees with `.section-tile-title` (nowrap, ellipsis). `tools/scripts/layout-check/run.mjs` cites a rulebook heading "Run the check" that does not exist.
- Section 6 of `09-layout-rules.md` (Interactions) holds rows that Interface 5 lacks (a parent's status line, a child's name, the Add button, a text holder): move them into Interface 5, then keep one text.
- `src/library/assets/floatingCard.ts` line 86 still cites "docs/design/05, 5.8"; the generated section 19 of the rulebook repeats it.

**Left by the first-version build of the Organisation and Positioning tiles (2026-10-29)**
- The Review's checks of the legal ages (Questions 4, section 6; the age terms themselves are asked by the Segment, Questions 12) and anything in Business 1 that reads the buyer's category, the relationship or the purpose (the user's own Profile, Questions 13) are not built.
- The Country question lists the six and Other: a saved organisation of another country opens as Other with its country chosen. The legal-form wording and documents that follow the country's form (capital, the "limited company" phrase) still follow the profile of that country where the app has one.
- The routing of the outcome for the user into the second Profile (P9, P17) is not built (Questions 4, item 13).
- The Canadian classification file (`src/data/classifications/ca-naics-2022.json`) has 694 industries and 923 Canadian industries; Statistics Canada publishes 695 and 922. Check it against the official structure file (Research 3, 5.7).
- The card scan `tools/catalogue/scans/quillfield-1920-light.json` is not written by any script of the repository; it still names page 2 "2. Organisation" (two rows of Records 4, twelve of Library 3). A script for it is not built.

## 5.12 Planned connections between answers (not built)

The questions documents mark each answer that a later page is meant to read, and does not yet, with "*Read by (not built yet):*" under the question. They stay in the question's own section (one owner per fact); this is where they are counted, by the feature that would read them. Map of the later pages: [what each later page reads](../../specifications/03-business-system/README.md).

| Feature that would read them | Where the planned reads are |
|---|---|
| **The Review** (a note where answers do not fit each other: ages, gender mix, devices, delivery cost, Offering stage, the competitor's reach) | Questions 12 (Segment), 13 (Profile), 14 (Competitor), 15 (Value Proposition, the same open items) and 16 (Offering): most of their "not built yet" reads |
| **The Value Proposition draft** (the purpose, the competitor's "stands out for") | Questions 8 (Positioning), 13 and 14 |
| **Customer Engagement and the customer journey** (the tender row for a public body, the times to reach them, the Journey Stages, the Evaluation stage's actions) | Questions 12, 14 and 16 |
| **The SWOT, the documents and the exports** (a competitor's ratings as strengths, weaknesses, threats and opportunities) | Questions 14 |
| **The Profiles** (the end user's Profile from the Segment, the proposed Profiles by age term, A6 when it is built) | Questions 12 and 13 |
| **The industry pack's examples** and the Segment's first customer question | Questions 7 (Organisation) and 13 |
| **The Brand System's voice and the Positioning notes** (display only) | Questions 9 (Purpose & Beliefs) |
| **The Business Plan's risks and operations text** | Questions 19 (Capacity & Delivery, section 4.2) |
| **Competitor emphasis** (a thought, Questions 4, section 15) | Questions 12 |

**Answers nothing reads, not even in a plan:** three questions of Questions 12 say "*Read by (not built yet):* Nothing yet": "Why are your customers not working?" (twice) and "How big are their clients' organisations?". For the owner: name a reader, or keep them as context the documents show.

## 5.13 Future features and proposals in other documents (not built)

Each line points to the one place its design lives; the item is removed here when the log records it built.

| What | Where its design lives | State |
|---|---|---|
| AI Assistant, Team working mode, Voice mode, extra languages and countries | [Guide 2, sections 5.1 to 5.4](../../guide/02-overview-and-future-features.md#5-future-features) | Not built |
| Other features ranked for an early-stage founder, and every future feature scored (lender-ready exports, scenarios, dashboard and plan against actual, privacy controls, industry templates, accounting integration, pitch export, funding finder, `.ics` reminders, onboarding tour) | [Guide 2, section 5.5](../../guide/02-overview-and-future-features.md#55-other-features-ranked-by-value-for-an-early-stage-founder), its roadmap (5.6) and every feature scored 1 to 10 (5.7) | Not built, except the rows that section marks built |
| Workspace D (duplicate an organisation or a card, scenarios, Compare) and E (What would it take, lender check, One-Pager, glossary hints) | [docs/proposals/](../../proposals/) and section 5.4 above | Not built |
| The open points of the first version, the research still to do, the heavy and public options, the Thoughts | [Questions 4](../questions/04-specs-and-limitations.md), sections 9, 12, 14 and 15 | Open, not scheduled |
| The Beta questionnaire for the app's first founders | [Research 8](../research/08-beta-questionnaire.md) | Proposal, nothing built |
| Delivery and capacity additions not yet on the cards | [Research 7](../research/07-delivery-and-capacity-research.md) and [Questions 19](../questions/19-capacity-and-delivery.md) (its status names the built parts) | Built in part |
| The Financials still to build (Offering Economics card, RV1, O19, K15 as a record, FN1, nested sub tiles, the Cash Timeline) | [Questions 20](../questions/20-financials-and-inventory.md), sections 1 and 14, and section 5.3 above | Not built |
| The Strategy's Current Situation lines (the market, the competition, the capacity check) | [Questions 21](../questions/21-strategy.md), section 10 (from section 2.3) | Not built |
| The review of the whole app: repository, speed, code, checks, tests, documents (21 items) | [docs/proposals/app-review-2026-11-21.md](../../proposals/app-review-2026-11-21.md) | Proposal, the owner picks |
| The free-text character limits and one component per category | [Interface 3](../interface/03-free-text-categories.md) | Proposal |
| The help texts' structure beyond the size budget | [Interface 10](../interface/10-help-texts-guide.md) | Built in part |
| The library's sync of the app to the tables (step 7) | [Library 1](../library/01-library-system.md), section 7, and section 5.6 above | Not built |
| Lists and classifications for more countries | [Research 3](../research/03-lists-and-classifications.md) (Questions 4 governs) | Future feature |
| What It Would Take (E1), built in the engine for a later screen | [Guide 2, section 5.5](../../guide/02-overview-and-future-features.md#55-other-features-ranked-by-value-for-an-early-stage-founder), row 15 | Tested, no screen shows it |
