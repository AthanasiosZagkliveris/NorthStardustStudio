# 5. What has not been done yet

Status: **living list**, written 2026-10-14, updated 2026-10-29. Remove an item when it is done and record it in the log (`04-log.md`). Everything here is a plan or a proposal unless it says "decided". Nothing in sections 5.3 and 5.5 is built.

## Open now

**The release**: `chore/light-cleanup` is merged into `main` (log, 2026-10-22). Next: the Tile System (5.3), then Batches D and E (5.4), then the extraction (5.7).

**Waiting for the owner**: the proposals in `17-frequency-options.md` (frequency groups); the generated cards' inputs beyond "adding, not removing"; the open decisions of 5.8; the sizes and gaps that are not on a step (5.6).

**To unify**: the Legal Entity cards' own CSS (`legal-entity-*`) stays: the merge was tried on 2026-10-20 and put back because the shared card's classes move the number, the name gap and the ground. The Inventory grid's columns come from the stylesheet and stay. The other places once thought to be copies are not (`21-shared-components.md`, "What is hand-made, read one by one").

**Not looked at in a browser**: the Process library and Operational log pages (not reachable in this version of the app); the tooltips of the Roadmap bars, the action symbols and the noted fields. The tests cover them.

**The catalogue records** (`06-catalogue-record.md` and the crawl behind it) still show Quillfield as an LLC (its "Form the LLC and get an EIN" activity); the next full crawl rewrites them. Quillfield is a sole proprietorship in the example now, and its figures moved with it (Funding Need $24,734, cash in hand $10,675, still short after the SBA loan's repayments $1,208; the golden files: `WRITE_GOLDEN=all`).

**The checks**: the wide layout check (`npm run check:layout:wide`) has no baseline yet; the standard baseline is rewritten only by the owner's decision.

**The library and the documents**: see 5.6 for the library (`npm run library:check` says whether it has drifted from the app). The content of the documents written on 2026-10-14 (`01`, `02`, `03`, and 5.1 to 5.5, 5.7 and 5.8 below) is not re-checked line by line: where the log says an item is done, it is done. The clean-up and library plans of 2026-10-14 (old 5.6, 5.11 to 5.14) are in `../archive/plans/2026-10-14-cleanup-and-library-plans.md`.

## 5.1 The road (decided 2026-10-14)

| Phase | Content | State |
|---|---|---|
| 1 | Light clean-up: one rulebook, baseline triage, current page names, a wider layout check; the drafts converted; asset library, first half | Done and merged (log, 2026-10-14 to 2026-10-22) |
| 2 | **Finish the Tile System** on the places that are not tiles yet (5.3) | Open |
| 3 | **Batches D and E** (5.4) | Open |
| 4 | **Full clean-up and optimisation** of the completed Foundation (5.6), plus the second half of the asset library (merge duplicates, fold the rules into the contracts) | Partly done: the CSS clean-up, the token source, the shared components and the lints are built; the load and run measurements of 5.6 are not |
| 5 | **Extraction** into the new app (5.7) | Open |

## 5.2 The task plan F to K: what is not done

The plan of 33 tasks is locked (log, 4.5). F, G and H were committed on 2026-10-09 and I and J by 2026-10-13; the engine files of I (Global Settings, cost nature, calculated lines, funds) were not individually re-verified in the audit of 2026-10-14, and the owner's one visual pass of J is not recorded. **Not done (a later batch):** K1, VAT as a pass-through, import VAT included, rates in Global Settings; K2, actuals: the Repair Record draws on the Contingency Fund, plan against actual.


## 5.3 Finish the Tile System

Eleven of thirteen chapters are drawn as tiles. The rest:

| Where | State | What remains inline | Conversion (suggestion) |
|---|---|---|---|
| Business 4 · Financial Foundation | Not tiles | Four folding cards: Costs, Funding Need, Capital & Funding, Financial Position; plan dates and VAT inline | One frame of four Master Tiles; each opens its existing section in a dialog (the pattern the Roadmap and Registrations use). Plan settings become a small tile or the first tile. |
| Business 5 · Sustainability | Not tiles | Two folding cards: Revenue, Break Even | Two tiles, same method |
| Business 2 · Customer Engagement | Mixed | The channel resource table, Customer Relationship and Demand & Conversion are folding sections | Add Relationship and Demand as large tiles in each segment's frame; the resource table becomes a table tile |
| Four editors | Old non-tile layout kept below an early return | Unreachable code (`asTiles` is always true) | Remove after confirming the tests do not use it |
| Help tile | Not a real kind in the code | Inventory and Completed are normal tiles recognised by id | Add a real "help tile" kind |

## 5.4 Workspace batches D and E: checked against the code on 2026-10-14

The briefs (written 2026-09-29, in `docs/archive/plans/`; they are not finished work, only kept there) say D and E wait until the structure is stable; it now is, and the order is decided (after the Tile System).

**Already built** (the briefs asked to reuse them): `FieldKey`, `openField`, the field status line (with the unused "Changed in … · Reset" parts), the Review page, the Notepad, the undo toast, search, and `Sources.ts`. **Absent:** `planOutcomes`, scenarios, duplicate organization and card, the Compare route, the lender check, the One-Pager, the glossary.

| Item | State | Outdated in the brief | Effort |
|---|---|---|---|
| `planOutcomes` (one function for all outcome figures) | Absent | Must be extracted from `planCase`, `stressTest` and the forecast | M |
| D1 Duplicate organization | Absent | "Annotations are copied": annotations no longer exist; notes live in the Notepad, per person, outside the organization | S |
| D2 Duplicate a card | Absent | The card kinds are now the cost-model cards; generated cards must not be duplicated; offering links and shares kept or cleared by rule | L |
| D3 Scenarios | Absent | The scenario-able inputs table no longer matches; Global Settings are per device; `withWhatIf` only scales revenue, so a layer that applies overrides to the whole document is needed | L (largest) |
| D4 Compare | Absent | Needs `planOutcomes` and a route; runway, funding gap, yearly profit and repayments must be added | M |
| E1 What would it take? | Partly exists ("What It Would Take" on Sustainability: percent levers for a cash shortfall) | The brief asks for "break even by month X", amounts per offering and "Try this" (needs D3) | M |
| E2 Lender-ready check | Absent | The Review page has changed; the ten rules must be re-checked against the new data; each needs a Source | M |
| E3 One-Pager and elevator pitch | Absent | Re-read segment, offering and founder data through `readFoundation`; one-page fit needs a measurement test | M |
| E4 Glossary hints | Absent | About 40 terms, each with a checked reference; conflicts with the global tooltip rules | M |

Suggested order: `planOutcomes`, then D1 and D3, then D4 and D2; E1 after D3; E2, E3 and E4 in parallel. One commit per item; the owner tries each batch once. References for E2 and E4 follow the source rule (document 2).

## 5.5 Business System requirements (proposal)

From the analysis in document 3, R10. Each requirement has an id, a priority (**M** must, **S** should, **C** could) and a state (**Gap** missing today, **Fix** exists but is wrong or unused, **New** a new idea, **Decision** waits for the owner). The findings table is document 3, R10.1.

### 5.5.0 Starting points

- **Users:** early-stage entrepreneurs, one person to a small team, often freelancers working from home. English only.
- **Screens:** minimum width 768 px; classes Tablet 768–1199, Laptop (≥1200 wide, <1250 high), Desktop (≥1200 wide, ≥1250 high).
- **Accessibility:** WCAG 2.2 AA.
- **Principle:** keep the existing layout, style and structure; add content and logic; reuse existing components.
- **Activities** record dates, performers and resources. They carry no cost. **Performers** are founders or partners/suppliers.

### 5.5.0a The six functions of the app, and where the requirements sit

| App function | What exists today | Where this proposal adds |
|---|---|---|
| **1. Requests information** by text, choice, field, number, with help | Field types on all pages; help notes; limits on numbers | F1–F4, C1, C4, I4–I5 (more choices instead of free text) |
| **2. Stores and connects it** and creates further requests from it | Answers saved per organization; cards link by id (resources, activities, offerings); generated cards (channel expenses, insurance) | F1, F6, C2, C11, C16 (links by id), I1 (Delivery Team shown on Delivery) |
| **3. Calculates, records, presents** (tables, diagrams, by time and category) | Demand, capacity, costs by nature, Funding Need, Break Even, forecast, Calendar, Inventory | C14 (spend by channel), I7–I9, A6, T1–T2 (tiles for the Financial pages), D4 Compare |
| **4. Proves and validates** | Completeness rules, open items, Review page, capacity check, date checks, Stress Test, "What It Would Take" | A5, F7, C9, E2 (Lender check), planOutcomes |
| **5. Helps** (instructions, resources, pre-filled data; Note and Calendar; messages, errors, reminders, limits; smart navigation) | InfoNote, Notepad, Calendar, Search, rails, arrows, Undo | A6, E4 (Glossary), C5 (proposals) |
| **6. Generates and exports Business Documents** | Business Plan, Canvas, Forecast; PDF and Markdown | E3 (One-Pager) |

Ordering of work (decided): the **Tile System** is finished first (T1–T2), then **Batches D and E** (section 5.4), then the full clean-up and optimisation, then the extraction.

### 5.5.2 App-wide requirements

| Id | Requirement | P | State |
|---|---|---|---|
| A1 | Minimum supported width **768 px**. Below it a plain notice, no broken layout. | M | New (decided) |
| A2 | Screen classes Tablet / Laptop / Desktop on width **and** height; one set of breakpoints (768, 1200, heights 900 and 1250) shared by all stylesheets and by the layout check. | M | Fix |
| A3 | WCAG 2.2 AA is the acceptance level, tested in all four reading modes (light, sepia, dark, auto). | M | Gap |
| A4 | Every setting that belongs to a business lives with the data it governs; Global Settings keeps only per-user and per-device preferences (section 5.5.6). | S | Fix |
| A5 | Completeness: each page names which answers are required, in one place, and the page status uses that list. Goals and targets are optional but nudged. | S | Gap |
| A6 | Calendar also reads: Strategic Period start/end, the plan start, and delivery calendar time of an offering when it is turned into dates. | C | Gap |
| A7 | Currency: an organization-level override beside the country default; cards of another currency are converted by a stated rate or flagged, not silently skipped. | S | Gap |
| A8 | Example organizations and their tests are updated with every interface or requirement change. | M | Rule |
| A9 | Documents in the project are Markdown; PDFs are exports only. | M | Rule |
| T1 | **Tile System complete:** Financial Foundation (4 sections) and Sustainability (2 sections) are drawn as tiles that open their existing sections in dialogs. | M | Gap |
| T2 | **Customer Engagement:** Customer Relationship, Demand & Conversion and the channel resource table become tiles in each segment's frame. | M | Gap |
| T3 | The old non-tile layout under the `asTiles` early return in four editors is removed once tests no longer use it. | S | Fix |
| X1 | **Extraction readiness:** shared parts (reading mode, notes, calendar, search, review, undo, help, export, preferences) have no import from Systems 05–24; the operations and social-media branches in `Conversation` are removed; storage stays behind the store interface; the desktop opener is the only Tauri import. | S | New |
| X2 | The examples load on demand, and are optional in the new app. | S | New |

### 5.5.3 Business page 1 · Foundation

#### 5.5.3.1 Customer Segment and Profile

| Id | Requirement | P | State |
|---|---|---|---|
| F1 | A profile's **needs** have stable ids. Offerings and the value proposition refer to a need by id. | M | Fix |
| F2 | **Pain points** are defined once: a need that is unmet or costly today, in the profile's words. The profile's challenges feed them; they are a choice list from the profile, not a new free text. | S | Gap |
| F3 | Segment and profile fields that are used as **filters** elsewhere (channel fit, relationship type, offering) are choices, not free text. A table lists which field filters which (section 5). | S | New |
| F4 | A segment can mark its **touch preference** (self-serve, assisted, personal). It proposes the relationship type on page 2; the user can override. | C | New |

#### 5.5.3.2 Competitor

| Id | Requirement | P | State |
|---|---|---|---|
| F5 | Competitor and alternative gives a **price anchor** per offering (optional number and unit) that Pricing can show next to the offering's own price. | C | New |

#### 5.5.3.3 Value Proposition

| Id | Requirement | P | State |
|---|---|---|---|
| F6 | The value proposition is **built from ticked needs** (id) of the segment, with one sentence per need that the offering addresses; the free sentence stays. | S | Fix |
| F7 | An offering that addresses no need, or a need no offering addresses, is shown as an open item. | M | Gap |

#### 5.5.3.4 Offering

| Id | Requirement | P | State |
|---|---|---|---|
| F8 | Offering type is validated against the list. **Decision:** should it drive anything? Candidates: Product shows a materials group and stock; Service shows delivery hours; Hybrid both. | S | Decision |
| F9 | Each offering states how it is **bought**: one sale at a time, or every month. This is the single source; Delivery and Demand read it instead of asking again (today the Delivery card shows a mismatch note). | S | Fix |

### 5.5.4 Business pages 2 and 3

#### 5.5.4.1 Page 2 · Customer Engagement

**Channels, stages, actions**

| Id | Requirement | P | State |
|---|---|---|---|
| C1 | Channel fit uses the segment's choices (F3): a channel shows which segments and profiles it suits. | S | New |
| C2 | A channel action has a **result** (a stage goal) as a choice and a link to the approach text, so the approach row can list its actions (the promise in the help text). | S | Fix |
| C3 | Removing a channel or category lists the expense cards it created and asks: keep (becomes an ordinary card), or remove. | M | Fix |

**Relationship types.** Each type is defined by the same short set of fields, so the types differ by data, not only by label:

| Field | Meaning |
|---|---|
| Purpose | Why the organization keeps this relationship (acquisition, retention, upselling). |
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

#### 5.5.4.2 Page 3 · Infrastructure & Capability

The Delivery card as built is described in the page 3 specification (specifications/business-system/page-3-infrastructure-and-capability.md, section 7).

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
| I9 | Where a card is in another currency than the organization's, the Inventory totals show each currency separately. | S | Fix |

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
| Income tax basis and rate | Identity > Organization > Legal Entity > Tax | M |
| VAT/GST basis | Same card as "registered?" | M |
| Opening Date, Plan Start, Plan Length | Opening Date on the Organization tile, Plan Start worked out, Plan Length in the Global Settings; Strategic Period shows them read-only | S–M |
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

- The unused-code pass (a list of exports no file imports; to be chosen: `knip` or `ts-prune`).
- The values of old 5.14 that are not on a step (gaps of 10, 14, 18, 20px and others; corners of 1, 2, 3, 7, 10, 12px; three window and container boundaries drawn twice) wait for the owner: each joins a step, becomes a step, or stays a literal in the lint's baseline. The decided breakpoint set (768, 1200, heights 900 and 1250) is not yet used by any query.
- The 768px floor against WCAG 1.4.10 Reflow (320px at 400% zoom): a declared exception until the owner rules (rulebook, section 20).
- The library: asset by asset, each with its contract, gallery entry and page code changed to use it (step 5), the style-reading tests converted as each asset gets its contract, then the page check last (step 6) with its baseline rewritten; the sync (`08-library-system.md`, step 7).
- Optimisation, measured before and after: load (`Conversation`, `Landing` and the registry chunks; the two examples are bundled into `Landing` and could load on demand; every editor is in one chunk), run (the biggest editors re-render on every key: profile first, memoise only where the profile shows it), code (files over 2,000 lines such as `AnswerUtils.ts`; duplicated helpers; the dead non-tile paths under `asTiles` in four editors; the Operations and social-media branches in `Conversation`). The old figures (a bundle of 662 KB, 1.07 MB of CSS, 1,355 tests) are of 2026-10-14 and must be measured again. Bundle-size limits have no official value: the limit is a choice to make after the first measurement. Target for interaction: "good" Interaction to Next Paint is 200 ms or less (web.dev).
- The page tab's width, the unlit rail bullets and the tracking rule were settled on 2026-10-14 and 2026-10-15 (the unlit bullets' low contrast at rest is by design).


## 5.7 Extraction into the new app: what the audit found

- **No Foundation folder exists.** Systems 01–24 are rows in `src/data/systems.ts`; the interview code is shared and the business editors are wired in as answer types. The cut is by feature, not by folder. Foundation-only Markdown content is about 9 KB of 153 KB.
- **To keep** (shared parts): reading mode (`ThemeService`, colours), focus mode, notes (Notepad), calendar, search, review, undo, help notes, export and documents, preferences, storage behind its interface.
- **To leave behind:** Systems 05–24 content and menu rows, `CapabilityGenerator`, the operations and social-media branches in `Conversation`, and any editor only they use (Process Library, Operational Log, Roles & Responsibilities).
- **Not to leave behind:** Financial Foundation, Sustainability and the financial model. They are Business pages 4 and 5. (The raw audit listed them as "likely other systems"; that is wrong.)
- **Desktop-only code:** one import (`@tauri-apps/plugin-opener` in `InfoNote`, with a web fallback already in place), plus the Tauri folder and two port settings in the build file. A web build is straightforward.
- **Storage:** all data is in the browser's local storage (about 5 MB), behind one store interface. A server or IndexedDB store fits behind the same interface. The two example organizations alone are 580 KB.
- **Calendar: decided, it exists in the new app.** The earlier Foundation App Plan listed it as staying behind. It reads card dates, so it depends on the card engine and travels with it; its sources (card dates, Operational Log, schedules) are kept.
- **Decision:** the form of the new app is open (5.8, item 8).


## 5.8 Open decisions

Decided on 2026-10-14 and therefore not open: Delivery Teams are connected to the Delivery cards; the Calendar exists in the new app; the order of the road; the Master Tile definition; the Inventory tile is a help tile; the minimum width 768; WCAG 2.2 AA; English only.

Still open (the requirement ids are those of 5.5):

1. What exactly the Delivery Team connection does to the numbers (I2). Proposed reading: each linked Delivery Team card appears on the offering's Delivery card as a person row, like a linked partner, with hours that count as external hours beside the founders' capacity; the card keeps its cost.
2. Does the Offering type drive anything (F8)?
3. T7 "Travel and van hire": move to Vehicles, or split into trips and van hire (C13)?
4. Remove the duplicate global income tax rate first (5.5.6)?
5. Which relationship-type definition (the six fields, C4) is accepted, and who writes it?
6. Is a rough cost per customer by channel wanted at this stage (C14)?
7. The 768 px floor against WCAG 1.4.10 Reflow: accept as a declared exception (5.6)?
8. Is the new app still a web app with accounts (as in the Foundation App Plan), and does it keep the Examples (5.7, X2)?

## 5.9 Known open findings

The confirmed problems that no turn has fixed are kept in one place: `docs/ai/outstanding-findings.md`.

## 5.10 What stayed in the project, and why

- `src/data/examples/`: the one copy of the two examples (the app reads it; `docs/examples/` was removed 2026-10-22). `UPDATE_EXAMPLES=1 npx vitest run src/services/ExampleDrift.test.ts` writes both from the app's own readers; the drift and review tests fail when an example is behind the interface.

## 5.11 Open from the documents review (2026-10-29)

For the owner to decide, or work not done. Each item leaves this list when done and the log records it.

**Pop-ups and tooltips (doc 23, 25)**
- P2's panels are 260px wide today for the calendar and the colour card; a menu is as wide as its longest line. One width for every P2 panel would be simpler: say if wanted.
- A P4 tip is not announced to a screen reader except by the control's own label; the label already says it.
- The comment on `useAboveTip` in `Tooltip.tsx` says "centred on it"; the code puts the tip's left edge on the control's left edge. Fix the comment.

**Free texts (doc 20, 17)**
- The character limits (60, 200, 600, 1000) and one component for each free-text category are not built.
- The tile text is decided at 8 rows by default; doc 16 shows 6 today.

**Library (doc 08, 10, 11, 12)**
- Step 7 of the library plan (the sync of the app to the tables, with a watch mode) is not built.
- Doc 11 (the library log archive) was moved to `docs/archive/library/` on 2026-10-29; its rows are only older entries of the library log.
- The hand-written rows of doc 10 (L0653 to L0659) and doc 11 (A0029 to A0034) hold facts the log does not (tipWords, aria-pressed, label-arrow.css, MultiPicker); doc 11 mentions `SegmentedToggle`, which is not in `src`.

**The design record (doc 01, 02, 03)**
- Part F of doc 01 is now doc 26 (2026-10-29); the repeated template for each card could still be reduced, but the catalogue tool reads its table shapes.
- Doc 02, 2.7 (the source register, about 100 KB) could become its own document; other documents cite its ids.
- The Part G "Key flag" idea and the Part E "Both" place are in no code and no longer in doc 01: formally dropped? (They stay in doc 03 R2.)
- The comment in `PartnerGroupHelp.test.ts` still says "part H"; it is Part D, section 3.

**The questionnaire (doc 27, 28, 29)**
- 25 ids are listed as withdrawn or merged, but 91 minus 67 is 24: the 91 or one id is wrong (doc 28, Appendix B).
- I6 is counted as a check while 8.2 withdraws it, and I7 is counted as a driver while described as merged into I7c. Without I6 the count is 20 checks and 66 questions.
- The customers' industry list (G15, P24): 5.7 says the 18 plain industries are retired, but 6.3, 27 section 5 and 29 still use them. Marked [D] in doc 28.
- Doc 28 is 207 KB since section 5 became doc 35 (2026-10-29); sections 6 to 15 remain.

**Added by the review of the docs folder (2026-10-29)**
- The Shared Workspace proposal (`docs/archive/proposals/shared-workspace.md`) has no item in this list; its place is to be decided.
- Doc 1, B.1 and the app index differ on whether the Organization tile is on Identity page 1 (Definition & Ethics) or page 2 (Legal Entity); check the code and fix the wrong one.
- `docs/ai/customer-engagement-layout.md` says every Journey Stage band starts folded; the code (`useItemFolds(true)`) starts them open and a test expects no fold arrow: the sentence is probably stale.
- `docs/ai/layout-rules.md`: section 8 says a dropdown list is exactly the width of its cell, section 10 says it is as wide as its longest option; the tile title in section 8 (a multi-line title) disagrees with `.section-tile-title` (nowrap, ellipsis). `tools/scripts/layout-check/run.mjs` cites a rulebook heading "Run the check" that does not exist.
- The Finance dynamic field points at the retired Revenue Model page (recorded in the specifications README only).
- Section 6 of `layout-rules.md` (Interactions) holds rows that doc 18 lacks (a parent's status line, a child's name, the Add button, a text holder): move them into doc 18, then keep one text.
- `src/library/assets/floatingCard.ts` line 86 still cites "docs/design/05, 5.8"; the generated section 19 of the rulebook repeats it.

**Left by the first-version build of the Organization and Positioning tiles (2026-10-29)**
- The ages in the Segment (doc 33, section 6) and anything in Business 1 that reads the buyer's category, the relationship or the purpose (the second Profile for the user, P25) are not built.
- Purpose, Differentiation and Outcome: the owner's list gave no separate lists for Differentiation and Outcome, so Differentiation & Outcome stays one question and Purpose is a new question (doc 33, section 8). Confirm or send the lists.
- The Country question lists the six and Other: a saved organisation of another country opens as Other with its country chosen. The legal-form wording and documents that follow the country's form (capital, the "limited company" phrase) still follow the profile of that country where the app has one.
- The four coarse user life stages have no age edges (doc 33, section 5).
- The lists of the Outcome (for the buyer) and the Outcome for the user were made from the words of the former question and of the former "what matters most": confirm or send your own (doc 33, section 8). The routing of the user's outcome into the second Profile (P9, P17) is not built.
- The relationships offered for each category are the owner's judgement from the tables (doc 31, 10.7): a Parent or a Caregiver is offered to both categories because a family plan or a household is a Dual-Intent purchase; change the table in `RelationshipFit.ts` if the owner reads it otherwise.
- The owner's life-stage table covers nine of the twelve purposes; Entertainment, Social Connection and Creation fall back to the relationship, category and seller and buyer tables (doc 31, 10.7). Confirm or send the three rows.
- The user's life-stage matrix is used only to hide the blank cells; the ● and ○ levels do not yet order or mark the options. The earlier parent rule is superseded by it where the buyer's life stage is chosen (a Senior parent: Adults offered).
- The owner's master matrix (doc 31) differs from the questions of doc 28: the Commercial & Professional umbrella with Landlord, Personal professional and Employer relationships, Direct Buyer (Self) as a relationship, other B2B relationship names and a Team / Org user are not built.
- The owner's business relationship tables leave out Access (Dual-Intent) and Social Connection, Business Growth and Creation (Proxy): those are read from the audience scale's table (doc 31, 10.7). Confirm or send the cells.
- A "Recommended" tag or highlight on the differentiations the chosen purposes drive was suggested (they are only ranked first now); it needs a new element, so it waits for the owner's word (doc 31, 10.7).
- Performance & Innovation and Ecosystem & Integration have rows only in the business relationship table: no purpose drives them yet and the audience scale and category tables do not rank them (doc 31). The owner's "Productivity pivot" (an employer's productivity puts Ecosystem first) needs the purpose rows. The examples (src/data/examples) still hold the four older ids and need no change.
