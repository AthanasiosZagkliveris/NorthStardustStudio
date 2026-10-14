# 5. What has not been done yet

Status: **living list**, written 2026-10-14. Remove an item when it is done and record it in document 4. Everything here is a plan or a proposal unless it says "decided". Nothing in sections 5.3 to 5.6 is built.

## 5.1 The road (decided 2026-10-14)

| Phase | Content |
|---|---|
| 1 | **Light clean-up now (steps 2, 3, 6 and 7 done in whole or in part on 2026-10-14, see 5.6 and 5.11):** one rulebook, baseline triage, current page names in docs and checks, a wider layout check; the drafts are already converted (document 4, section 4.4). Asset library, first half: inventory, names and hierarchy, contracts. |
| 2 | **Finish the Tile System** on the three places that are not tiles yet (section 5.3). |
| 3 | **Batches D and E** (section 5.4). |
| 4 | **Full clean-up and optimisation** of the completed Foundation (section 5.6), plus the second half of the asset library (merge duplicates, fold the rules into the contracts). |
| 5 | **Extraction** into the new app (section 5.7). |

## 5.2 The task plan F to K: status

The plan of 33 tasks (document 4, section 4.2; the task list is kept in document 4, section 4.5).

| Batch | Content | Status |
|---|---|---|
| F1–F4 | Mapping, data model (9 categories, 47 groups), migration, frequencies and quantity | Committed 2026-10-09 (batches F to H) |
| G1–G11 | Page 3 tiles and cards: categories, groups, statuses, link symbols, dates, cost row, extras, payment plan, notes, All Tiles | Committed 2026-10-09 |
| H1–H5 | Activities, Technical Support, Insurances and Certificates, channel templates, Legal Entity | Committed 2026-10-09 |
| I1–I8 | Global Settings, Opening Date, billing types, cost nature rules, calculated lines, funds and the page 4 screens, scheduling | Engine files present and committed 2026-10-12 (Global Settings, cost nature, calculated lines, contingency funds with tests); **not individually re-verified** in the audit of 2026-10-14 |
| J1–J3 | Examples updated, stale specifications rewritten, tests and layout check | Examples moved into the code 2026-10-13; specifications updated 2026-10-12; layout check with a baseline 2026-10-13. The owner's one visual pass is not recorded. |
| K1 | VAT as a pass-through, import VAT included, rates in Global Settings | **Not done** (a later batch) |
| K2 | Actuals: the Repair Record draws on the Contingency Fund; plan against actual | **Not done** (a later batch) |

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

The briefs (written 2026-09-29, in `docs/superpowers/plans/`) say D and E wait until the structure is stable; it now is, and the order is decided (after the Tile System).

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

**How Delivery works today.** The Delivery card of an offering holds: *Delivered* (per unit or every month); for every month, *Hours Given* (per week or per month) and hours per client; for per unit, hours per unit and *Calendar Time (weeks)*; constraints. The weeks are elapsed time only: they give the "While one runs: hours a week" line and "about N running at once", and are **never multiplied into hours** or turned into dates. Capacity is the founders' delivery hours; the check compares expected sales times each person's hours against it, with recurring work served first. People listed on the card: every founder, and the **partners** linked to that offering. Suppliers (including Logistics & Fulfilment) and Delivery Team cards are **not** listed.

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
| Opening Date, Plan Start, Plan Length | Financial Foundation plan header; Strategic Period shows them read-only | S–M |
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

## 5.6 Clean-up, optimisation and asset library (plan)

### Ground rules for both actions

- **Content and logic only, never a visible change.** The clean-up must not change how any page looks or behaves (rule: keep the existing layout, style and structure). The proof is the automatic layout check plus before/after screenshots of every page.
- **Shared components and tokens, not per-page tweaks.** A problem found on one card is fixed where the card type is defined.
- **Project documents are Markdown (.md).** PDFs are only exports and do not live in the project.
- **One step, one commit.** After each step: `tsc`, `npm test`, `npm run build`, and the quick layout check must pass. Any step can be reverted alone.
- **Nothing is deleted without your confirmation of the list.**

### Action 1: clean-up round

Reading note: steps 1, 2, 3, 6 and 7 run **now** (they are prerequisites for the library). Steps 4, 5 and 8 (CSS coverage, colours and breakpoints, unused code) move to the full clean-up and optimisation after the Foundation is completed (section 5.1, phase 4), because finishing the Tile System will change the stylesheets anyway.

### What the project looks like today (measured 2026-10-14)

| Area | Finding |
|---|---|
| Rulebook | `docs/ai/layout-rules.md` is 194 KB, 1,552 lines. Sections 1–8 are the base rules; after them come about 25 appended "Batch" and "latest" addenda that sometimes restate or overrule earlier rules. |
| Stylesheets | About 1.07 MB of CSS. `conversation.css` 439 KB, `section-tiles.css` 262 KB, `global.css` 55 KB, `organization-calendar.css` 33 KB, `colors.css` 34 KB. New rules were appended in blocks; duplicates were removed once from `section-tiles.css` (selectors that tests read were left in place). |
| Colours | About 690 tokens in `colors.css`, but about 213 hard-coded colours outside it, and theme overrides spread over five other CSS files. Four reading modes: light, sepia, dark, auto. The layout probe checks light only. |
| Breakpoints | About 55 media/container rules with inconsistent values; no stated minimum width until now (768 px is now decided). |
| Layout check baseline | 1,830 known findings, all recorded on one example (Quillfield), at 1920 px, in light mode. |
| Stale names | Docs, one test comment and the layout check still describe the old page structure (see step 6). |

Baseline findings by page: Infrastructure 661, Customer Engagement 630, Foundation 211, Organization 91, Brand 86, Strategy 62, Definition 35, Sustainability 33, Financial Foundation 17 (a few more at other window sizes).

Baseline findings by rule (top of 25+ rules): an "i" must hold 3:1 contrast between letter and ground (298); an "i" on its words' centre line (255); row gap (160); content starts at the title (127); a tile's "+" box holds 3:1 contrast (119); a section heading is the h3 size (57); tile list items are one line each (56).

Two of the three biggest groups are contrast rules. They match the WCAG 2.2 AA rule for non-text contrast, so they are real accessibility work, not cosmetic.

### The steps, in order

| # | Step | What exactly | Checked by | Risk |
|---|---|---|---|---|
| 1 | Treat the drafts | **Done 2026-10-14:** the current drafts were converted into documents 1 to 5; the HTML and PDF drafts were removed (document 4, section 4.4) | | |
| 2 | Reconcile the rulebook | **Done 2026-10-14** (`layout-rules.md` reconciled: topic sections 9 to 16, section 17 the check, Appendix A history, Appendix B still to settle) | | |
| 3 | Triage the 1,830 baseline findings | **Done in part 2026-10-14** (section 5.11: probe corrected, baseline 1,830 to 677; real defects and owner decisions wait) | | |
| 4 | Unused and duplicate CSS | Run a browser coverage pass over every page, both examples, all four modes; list selectors never used; remove them in small batches. Remove duplicate declarations in `conversation.css` as was done in `section-tiles.css`. Change the tests that read CSS text so they check behaviour or a token instead of exact text, where that can be done safely. | Coverage list reviewed; build size; layout check; screenshots. | **Highest.** CSS-reading tests and rarely opened floating cards. Batches must stay small. |
| 5 | One colour source and one breakpoint set | Move the hard-coded colours into tokens in `colors.css`; gather the theme overrides in one file; align media/container rules to the agreed set (768, 1200, and the heights 900 and 1250 from the website). | Contrast report for light, sepia, dark; layout check in all modes. | Medium |
| 6 | Docs and checks use the current structure | **Done 2026-10-14** (docs, test comment, README). The layout check already covers every chapter of a compound page (Ethics, Legal Entity and Founders & Capability are part of their pages); it reports by page, not by chapter | | |
| 7 | Widen the layout check | **Done in part 2026-10-14** (`npm run check:layout:wide` exists; the wide baseline is not written yet) | | |
| 8 | Unused code | List exports no file imports (a tool such as `knip` or `ts-prune`; to be chosen), review, remove. | `tsc`, tests, build. | Low–Medium |
| 9 | Close the round | Update `docs/ai/README.md`, `app-guide.md`, the memory notes, the example files if any interface changed, and write the result: files removed, bytes saved, findings before/after. | All gates green. | Low |

I cannot give honest numbers for how much CSS or how many findings step 3 and step 4 will remove before the coverage run and the triage. Expect that most of the 1,830 findings collapse into a few shared-component fixes, but that is a hypothesis to test in step 3.

Open decisions for this action: the 768 px floor against WCAG 1.4.10 Reflow (320 CSS px at 400 % zoom) needs a ruling once I have verified that criterion at W3C; accept as a declared exception, or support narrower windows later.

### Action 2: asset library

The goal is one place that records every kind of piece the interface is built from, with one name, one definition and one contract each, so that a new page is assembled from known assets and the checks can be tied to the contract.

### Scope (what the library covers)

The **Tile** is the root asset (the Foundation is to be formed entirely by the Tile System). Master Tile, opened cards, floating cards, nested cards, chapters (frames), tables, sections, plus the smaller shared parts the audits found repeated: pickers, info notes, option lists, date and money fields, empty states, buttons. The list of asset types is **produced by step A1 from the code**, not assumed.

### Steps

| # | Step | Output |
|---|---|---|
| A1 | Inventory from the code | For each asset type: component name, where used (pages), CSS class family, duplicates (two components doing the same job). |
| A2 | Names and hierarchy | One proposed hierarchy: Framework > System > Page > Chapter (frame) > Master Tile > opened card or floating card > nested card > field; tables and sections placed where they occur. You approve the names before anything else is written. |
| A3 | Merge duplicates | Where two components do one job, one shared component. Visible result unchanged; checked by the layout check and screenshots. |
| A4 | Write the contract per asset | One short entry per asset (below). |
| A5 | Fold the rules in | Each rule from the cleaned rulebook moves to the asset it governs. Tie each contract line to the layout-check rule that tests it. |
| A6 | Retire overlapping documents | `docs/ai/asset-library.md` becomes the single description. `tile-and-card-pattern.md` and `card-kinds.md` are absorbed (they stay until you approve). `layout-rules.md` keeps only the page-wide tokens and the check. |

Where to record it: `docs/ai/asset-library.md` (Markdown, in the project).

### The contract per asset, kept simple

One entry per asset, seven lines, one sentence each:

| Line | Question it answers |
|---|---|
| Function | What does it hold, and which function reads it? |
| Presentation | Which shared pattern is it (tile, frame, card, floating card, table)? |
| Layout | Which grid, sizes and rails (by reference to the token, not numbers copied)? |
| Style | Which tokens only? |
| Screens | Behaviour per class (below). |
| Modes | Light, sepia, dark, auto: what must hold in all of them. |
| Accessibility | Which WCAG 2.2 AA checks apply. |

Screen classes proposed (width and height; from the website profiles and cross-checked with Android's window size classes):

| Class | Width | Height | Notes |
|---|---|---|---|
| Below minimum | under 768 | any | Not supported by the app. |
| Tablet | 768–1199 | any | Continuous scroll. |
| Laptop | 1200 and up | under 1250 | Header and section gaps tighten under 900. |
| Desktop | 1200 and up | 1250 and up | Full composition. |

WCAG 2.2 AA checks to attach to the contracts (confirmed by W3C "What's New in WCAG 2.2"): focus not obscured (2.4.11), dragging movements have a non-drag alternative (2.5.7, only if the app has a drag action), target size 24 px (2.5.8), accessible authentication (3.3.8, not applicable: the app has no sign-in). Text contrast 4.5:1 and non-text contrast 3:1 are also AA, as are reflow (1.4.10) and text spacing (1.4.12); those two I still have to verify at W3C.

### What optimisation includes (proposal, with measurements)

Optimising is not guessed here. It means improving these six things, each with a measurement taken before and after, in the same order as the ISO/IEC 25010 quality characteristics of *performance efficiency* and *maintainability* (modularity, reusability):

| # | Area | Today (measured 2026-10-14) | Action | Measured by |
|---|---|---|---|---|
| 1 | Load | `Conversation` 662 KB, `Landing` 396 KB, `FrameworkRegistry` 383 KB, main 236 KB (minified, before compression). The two examples (352 KB and 228 KB of JSON) are bundled into `Landing`. Only the page routes are lazy; every editor is in one chunk. | Load examples on demand; lazy-load each editor by answer type; split by system. | `npm run build` sizes, before and after |
| 2 | Run | The biggest editors have no memoisation (`BusinessEngagementEditor` 4,230 lines, `BusinessCapabilityEditor` 5,766 lines) and re-render on every key. | Profile with the React Profiler; split into per-card parts; memoise only where the profile shows it. | Interaction time per keystroke on the biggest page; target "good" Interaction to Next Paint is 200 ms or less |
| 3 | Style | 1.07 MB of CSS; about 213 hard-coded colours; duplicates | Coverage purge, tokens, one breakpoint set (clean-up steps 4–5) | CSS bytes; contrast report; layout check |
| 4 | Code | 10 source files over 2,000 lines (`AnswerUtils` 9,099 lines is one utility file for everything); duplicated helpers (`round`, `normalize`, `toIsoDate`, `readNumber`, `shortMonth`, `systemTitle` and others); dead non-tile paths; stale `Operations` and social-media branches in `Conversation` | Split by domain; one shared `dates` and `ids` helper; delete dead paths | Lines per file; duplicates list; `tsc`, tests |
| 5 | Tests and checks | 131 test files, 1,355 passing and 1 known expected failure, 44 s; layout check about 25 min | Keep the speed; widen the layout check (768, sepia, dark) | Time; findings |
| 6 | Docs | A comment says "~470 KB" of Markdown; it is 153 KB. Rulebook 194 KB | Correct; fold the rulebook into the library | Review |

Reference points: web.dev gives the "good" thresholds for Core Web Vitals (Largest Contentful Paint 2.5 s, Interaction to Next Paint 200 ms, Cumulative Layout Shift 0.1), measured on field data. Bundle-size limits have **no official value**; the figures in the search results (150–200 KB compressed for the first load) are third-party suggestions, so the limit for this app is a team choice to set after the first measurement.

Dependencies are already lean (four runtime packages: React, ReactDOM, React Router, a font), so optimising dependencies is not a task.

## 5.7 Extraction into the new app: what the audit found

- **No Foundation folder exists.** Systems 01–24 are rows in `src/data/systems.ts`; the interview code is shared and the business editors are wired in as answer types. The cut is by feature, not by folder. Foundation-only Markdown content is about 9 KB of 153 KB.
- **To keep** (shared parts): reading mode (`ThemeService`, colours), focus mode, notes (Notepad), calendar, search, review, undo, help notes, export and documents, preferences, storage behind its interface.
- **To leave behind:** Systems 05–24 content and menu rows, `CapabilityGenerator`, the operations and social-media branches in `Conversation`, and any editor only they use (Process Library, Operational Log, Roles & Responsibilities).
- **Not to leave behind:** Financial Foundation, Sustainability and the financial model. They are Business pages 4 and 5. (The raw audit listed them as "likely other systems"; that is wrong.)
- **Desktop-only code:** one import (`@tauri-apps/plugin-opener` in `InfoNote`, with a web fallback already in place), plus the Tauri folder and two port settings in the build file. A web build is straightforward.
- **Storage:** all data is in the browser's local storage (about 5 MB), behind one store interface. A server or IndexedDB store fits behind the same interface. The two example organizations alone are 580 KB.
- **Calendar: decided, it exists in the new app.** The earlier Foundation App Plan listed it as staying behind. It reads card dates, so it depends on the card engine and travels with it; its sources (card dates, Operational Log, schedules) are kept.
- **Decision:** is the new app still a web app with accounts (as in the Foundation App Plan), or something else?


## 5.8 Open decisions

Decided on 2026-10-14 and therefore not open: Delivery Teams are connected to the Delivery cards; the Calendar exists in the new app; the order of the road; the Master Tile definition; the Inventory tile is a help tile; the minimum width 768; WCAG 2.2 AA; English only.

Still open:

1. What exactly the Delivery Team connection does to the numbers. Proposed reading: each linked Delivery Team card appears on the offering's Delivery card as a person row, like a linked partner, with hours that count as external hours beside the founders' capacity; the card keeps its cost.
2. Does the Offering type drive anything (materials group and stock for a product, delivery hours for a service, both for a hybrid)?
3. T7 "Travel and van hire": move to Vehicles, or split into trips and van hire?
4. Remove the duplicate global income tax rate first?
5. Which relationship-type definition (six fields) is accepted, and who writes it?
6. Is a rough cost per customer by channel wanted at this stage?
7. The 768 px floor against WCAG 1.4.10 Reflow: accept as a declared exception?
8. Is the new app still a web app with accounts (as in the Foundation App Plan), and does it keep the Examples?

## 5.9 Known open findings (from `docs/ai/outstanding-findings.md`)

- `useListAutoFormat`: cursor lands mid-word after a paste whose renumbering crosses a digit-count boundary (marked as an expected failure in the test; a real bug).
- `react-router`: a known high-severity advisory in the resolved dependency range (`npm audit`).
- `.vscode/extensions.json` is ignored by git, so its recommendation is never shared.

## 5.10 What stayed in the project, and why

- `docs/examples/`: the owner's own copy of the two examples; the app reads `src/data/examples`.

## 5.11 Layout check: triage of the 1,830 known findings (2026-10-14)

The baseline of the quick check (Quillfield, 1920 px, light) held 1,830 findings in 70 rules. Each rule was read in the probe (`scripts/layout-check/layout-probe.js`) and in the code that produces the finding, and put in one class.

| Class | Meaning | Rules | Findings |
|---|---|---|---|
| A | Real defect: the UI breaks the intent of a right rule | 8 | 365 |
| B | The probe measured the wrong thing or too strictly | 27 | 1,207 |
| C | The rule or its number is stale against the code | 23 | 177 |
| D | Accepted: a declared exception | 6 | 27 |
| U | The owner decides | 6 | 54 |

**Done (changes to the check and the rulebook only; nothing the user sees):**
- An "i" and a "+" box are measured on the ground they stand on, not on their own transparent background. This cleared the 298 "i holds 3:1" and the 119 "+ box holds 3:1" findings; the real contrast of every "i" on the Business pages is 5.7:1 or more in light, sepia and dark (measured).
- The squeezed Inventory and Completed row (titles only, by design), the text lists of the column pages, the Customer Engagement reference rows, the Legal Entity side fields and unframed sections, the Performer's picker (8px short of its x) and the focus on a card without a name box are declared exceptions in the probe.
- The dialog header: the slash is 6px in the trail of views and 8px after the root title; the names are the body size (probe and rulebook).
- The standard baseline was rewritten from 1,830 to 677 findings. One rule (the "i" contrast) gave 33 findings in one run and none in two others, so those 33 were removed as noise: that rule can flicker while a card is animating.
- The wide check (`npm run check:layout:wide`) exists; its first sample (sepia, 768 × 1024 and 1440 × 864, one page) found 381 findings, so the **wide baseline has not been written yet**. A full wide run covers 3 modes × 7 windows × 2 examples and takes hours.

**The real defects and the decisions, after checking each by hand (second pass, 2026-10-14).** The first pass took its numbers from the triage agents. Each was then measured in the running app (Quillfield, 1920 × 1000, light), and several were wrong.

| Item | What I measured | State |
|---|---|---|
| A tile's list stays clear of its "+" box | On the Resources tiles the list ended 3.3px below the top of the "+" (Infrastructure, Offering's Capability). | **Fixed.** The list may now run 5px past its row, to the top of the "+" and not under it (`SectionTiles.tsx`). One visible change: a Resources tile with nine items shows 6 whole lines, not 7; the rest scrolls. |
| The remove x has two reds | A cell's x was `#b00020`; a card's x was `#d01818` (a rule kept "the previous default red"). The Goal, Objective and Metric x also had an 8px corner, caught by a rule meant for boxes (`[class*="strategy-"][class*="-box"]` matched the name `strategy-box-remove`), where every other x has 6px. | **Fixed.** One red for every x, the danger text red of the reading mode (`remove-button.css`, the override is deleted); one corner. The test that asserted the override now asserts there is none. |
| The Performer's dropdown ends past the name cell | Name cell ends at x = 1502, the dropdown at 1506, the x or "+" begins at 1514. The dropdown is 4px past the name cell and 8px from the x; the name cell is 12px from the x. The rulebook says the dropdown ends where the name cell ends; the 12px rule says nothing ends closer than 12px to the x. Both are broken by 4px. | **Fixed** (approved): the dropdown ends at the name cell's edge, 4px shorter (`section-tiles.css`, `.card-box-open .business-capability-performer > .option-picker`). |
| An "i" one gap (8px) after its words | In the Strategy card heads the "i" stands 4px after Theme, Goal, Objective and Metric. | **Fixed** (approved): `.strategy-head-kind` gap 8px. "Initiatives" (16px) is not verified. |
| An "i" on its words' centre line | In the Customer Engagement reference lists (Profiles, Offerings) the "i" is 3px above the centre of the link on 5 of 15 rows; one row has a link that wraps to two lines and its "i" stays on the first line. | **Fixed** (approved): the "i" is 3px lower in every reference row (`conversation.css`); in the one row with a wrapped link it stays on the first line. |
| The Add Performer "+" holds 3:1 | Measured on the ground it stands on: 5.9:1 in light, 6.4:1 in sepia, 5.3:1 in dark. | **Refuted.** The 2.82:1 figure was wrong, and the four findings disappeared once the check measured the ground correctly. Nothing to fix. |
| Payment plan row 1.6px low | The count box and the words beside it are both centred at 698.6px in the live app. | **Not confirmed**, probably an artefact of what the check measures as "the text". Not changed. |
| Currency and payment-plan pickers narrower than their widest option | Not measured by hand. | Unverified; **waiting**. |

No item in this list is a WCAG 2.2 AA failure.

**Questions for you (class U), in plain words:**
1. **Roadmap tile: decided.** The Roadmap is a Gantt diagram and a unique element: a **diagram tile**, a category of Master Tile of its own (`SectionTile.diagram`; rulebook section 9). The original question was: In the Strategic Period dialog the Roadmap tile is 442 × 102px with a 36px title, while the Theme tiles are 215px squares with 18px titles. Is the Roadmap tile meant to be a wide banner with a large title (as it is now), or a normal square tile? (Two findings, one cause.)
2. **Goal and Objective head buttons / card navigation: open.** The owner finds the navigation arrows "way too far" and asked for them 12px from the card edge, aligned with the sides of the buttons above and centred on the Description label. The arrows were moved inside the card by mistake and put back; they now stand on the Description label's centre line, and what else is to move is to be marked on a picture (rulebook, Appendix B). The original question was: In the head of a Goal or Objective card made with "+", the "+" and the x end 12px short of the card's right padding edge. Other cards' head buttons end at the edge. Is the 12px intended (room for the previous and next arrows)?
3. **A picker that wraps: fixed** (approved). It was the Type dropdown of entry 5 in the Skills list of the Jordan Ellis card (Identity, 2. Organization, chapter 2 Founders & Capability). It is now one line, cut with an ellipsis (full text in the tooltip and the open list), and runs to its cell's edge (the 6px at its right is gone). The original question was: In the Jordan Ellis card of Founders & Capability the check found one dropdown whose text takes two lines (54px high instead of 45). I could not reproduce it by hand; which dropdown is it, and should its text be shortened or the card let it grow?
4. **Focus ring after Escape: open.** The owner sent a picture of the ring (a white outline round the list item that opened a card). It is the ring of the keyboard focus; decision pending whether it should show after a card opened with the mouse is closed with Escape. The original question was: At 1366 × 700 the check opens a card with the mouse, closes it with the Escape key, and sees a focus ring on the opener. For a keyboard user that ring is right; for a mouse user it is not. The check should close the card with the mouse before judging. Nothing for you to decide unless you want the ring gone after Escape.

**Stale rules and probe gaps still to correct** (class B and C; they stay in the baseline until then): the Back button now stands in the tab rail (45 findings); the order number is drawn inside the name cell (26); the founder card was redesigned to the 492px card, so its 18 rules in probe section 17e and the rulebook describe the old 297px card (38 findings); the row-gap rule does not know the "+ Add Customer Source" block (74 raw); the dialog-size rules do not clamp a card taller than the window (16); Qty 56px is not in the width steps; the Delivery tile "+" adds an inline row, not a floating card; the card ground in a dialog is opaque, not glass; `--founder-card-min` and the two glass tokens are unused.
