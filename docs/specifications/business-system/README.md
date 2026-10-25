# 3. Business System — specification index and editor mapping

Status: **specification**, updated 2026-10-14.

The seven specification documents for the Business System, reconciled
into one page sequence, plus the definitive mapping of each page to
the editor and data structure it needs.

The originals were authored separately and disagreed about their own
numbering. What follows is the reconciled sequence; the per-file
notes record what each document used to say.

---

## Page sequence

| Page | Title | Specification file | Previously labelled |
|---|---|---|---|
| 1 | Foundation | `page-1-foundation.md` | "Page 1" ✓ |
| 2 | Customer Engagement | `page-2-section-1-channels.md`, `page-2-section-2-customer-relationships.md`, `page-2-section-2-customer-relationships-worked-example.md` | unlabelled — the two sections named no page |
| 3 | Infrastructure & Capability | `page-3-infrastructure-and-capability.md` | "(Page 2)" |
| 4 | Financial Foundation | `page-4-financial-foundation.md` | "Page 1", and System "4" |
| 5 | Financial Sustainability | `page-5-financial-sustainability.md` | "Page B", following "Page A" |

The System is **3. Business System**, answered before **4. Strategy
System** — a founder describes the business before choosing a
strategy for it.

---

## What the reconciliation changed

Only numbering, naming and cross-references. No requirement was
added, removed or reinterpreted.

**Page references.** Every file now opens by stating its page
position out of five. Infrastructure & Capability said "(Page 2)",
which is Customers Engagement. Financial Foundation said "Page 1",
which is Foundation. Financial Sustainability used "Page A" and
"Page B" for the two Financial pages throughout; those are now
Page 4 and Page 5.

**System reference.** Financial Foundation's layout banner read
"4. BUSINESS SYSTEM", the number the Business System carried before
it moved ahead of the Strategy System. It now reads "3.".

**Letter drift.** Infrastructure & Capability's slot rule named
"B. Utilities, C. Workstation, D. Equipment, E. Digital
Infrastructure", one letter out from its own headings — A. Founders
and B. Workspace precede those four, so they are C, D, E and F.

**The unresolvable "3. Partners & Suppliers".** Three status
actions referred to a numbered subsection that carried no number
anywhere in the file. Infrastructure and Offering's Capability hold
the same three subsections, and Offering's Capability already
numbered its own 1 / 2 / 3; Infrastructure's are now numbered to
match, so the reference resolves in both.

**Dangling "Next to Status".** "Linked to (Next to Status)" appeared
three times. Under Offering's Capability → 1. Resources there *is* a
Status field, so it stands. Under 2. Activities and under
3. Partners & Suppliers there is none; those now read "next to
the Responsibility" and "next to the Costs", each naming that
subsection's actual last field.

**Cross-system sources.** Financial Foundation consolidates costs
from four places, which it listed by name only. Each is now
qualified: Legal Entity is **1. Identity System, page 2 "Organization", chapter 1**; the other
three are this System's own Page 3.

Left alone deliberately: spelling and grammar inside the
requirements ("Idividual", "Montly", "coulour", "Parners",
"Adressed", "bellow"), the wording of every instruction, and the
Workspace status list's four options against the general list's five.
None is a numbering or reference problem. The page *titles* were
corrected where they named the page itself — "Infrastruction" became
"Infrastructure".

---

## Editor and data-structure mapping

### What the framework already provides

- **`MultiPart` + `**Layout:** Columns`** — a page of equal-width
  columns, each with its own question bullets. What the Identity
  System's Definition and Ethics page (two chapters) and the Brand System's page
  use. **Each column parses its own `Structure:`**, so columns can
  mix Free Text, Card List, Table and bespoke types.
- **`**Numbering:** Nested`** — makes a page's sections number
  `1.`, `2.` … on their own instead of a running count across the
  System. What the Legal Entity page uses for its 1.–6.
- **`ProfileCards`** — an addable set of cards, each a one-line title
  plus a fixed set of named **text** fields. No select fields, no
  nesting, no maximum count.
- **`CardList`** — fixed named cards, each holding a reorderable list
  of free-text entries.
- **`Table`** with `FieldDefinition` — columns typed
  `select | input | textarea | number | date`, with an optional
  "Other" escape. This is the only existing home for dropdowns.
- **`dynamicSource`** — a live dropdown fed from another Section's
  **Card List card or Table column**, optionally in another System,
  matched by title. It cannot currently read a bespoke editor's
  value.

### Page 1 — Foundation

Page shell: **existing.** `MultiPart` + `**Layout:** Columns`, four
columns, each carrying its ≤3 instruction bullets from the Questions
triad.

| Column | Required structure | Status |
|---|---|---|
| 1. Customer Segments and Profiles | Segment cards (max 2), each containing nested Profile cards (min 1, max 3) with Name, Description ⓘ, Goals & Desires, Challenges & Problems, Objections, Needs ⓘ | **New.** `ProfileCards` has the field shape but cannot nest a card inside a card, and enforces no maximum |
| 2. Competitors and Alternatives | Addable cards: Name, Type (select of 5 with explanations), Description ⓘ, SWOT ⓘ ×4, Prioritise Insights ⓘ | **New, or extend `ProfileCards`** with an optional select field — everything else is text |
| 3. Value Proposition | One free-text area ⓘ, associated with the relevant Customer Segment | **Existing `Free Text`** if one per page; **new** if one per Segment, which the spec's "associated with the relevant Customer Segment" implies |
| 4. Offerings | Addable cards: Name, Needs Addressed (multi-select fed from column 1's Needs), Category/Format (select), Description ⓘ | **New.** Needs both select fields and a dynamic source pointing *within the same page* |

### Page 2 — Customer Engagement

Page shell: **one Structure, `Business Engagement`** — the two
sections stack rather than sitting side by side, and the second
picks the Channels the first defines, so they are one editor
(`BusinessEngagementEditor`) rather than two parts of a `MultiPart`.
The title is singular, matching the singular naming every other
heading on these two pages uses.

**Built.** Both sections are implemented, and the page is Section 2
of the Business System's content triad.

| Section | Required structure | How it is built |
|---|---|---|
| A. Customer Channel | Reference header (Segment / Profiles / Offerings from Page 1, as links with ⓘ, behind a **Hide References** toggle), then Channel Category (13) → Specific Channel → optional Links, Offerings (multi), Journey Stage (multi), and one or more Actions **per selected stage** | A four-column table — Channel, Offerings, Journey Stage, Action — with each channel's **Links under its name** (placeholder "Links (optional)") rather than in a column of their own. Channels are grouped under their category, drawn once, in the fixed category order; each category carries a fold arrow and its channels sit a step in from it. Channels keep their numbers when a category is folded. Actions are a `Record<stageId, string[]>`, so unticking a stage hides its Actions without deleting them |
| B. Customer Relationship | Offering → the Profiles it is sold to → Relationship Type (multi, each its own slot) → Purpose → Journey Stage → Channel → Approach → Goal (multi) | A three-column table whose two headings — **Relationship Type and Purpose** and **Engagement Strategy** (which the Interaction Context is part of, not a heading beside) — are repeated UNDER each Offering. **The relationship is kept ABOUT AN OFFERING, once**: three Profiles buying the same thing are not three relationships with it, so the Profiles an Offering serves are listed under it as reference (each with an ⓘ opening what Page 1 records about them), read off Page 1's needs chain and answered nowhere. Stored per Offering under `segment.offerings[]`; answers kept per Profile before are merged into it field by field, first-written wins, and the old per-Profile store is read but never written. Its rows are **derived from Section A**. The nesting is drawn as bands, each a 24px step in from the arrow that folds the level above: `1. Offering - Make Up Masterclass` from the left edge, then the Profiles, the headings and the Relationship Types a step in. The Engagement Strategy is two parts: the Journey Stage (a band in the second column, above the kinds of channel used at it) and, on the band's own line in the third column, the Goal, with the Approach following under it beside the channels. A stage's fold arrow folds only the kinds of channel under it; the Goal and the Approach stay. Every Journey Stage starts folded. Three levels fold: Offering, Relationship Type, Journey Stage — a folded Offering shows the relationship types kept about it, a folded Relationship Type the journey and the Approach written at each stage. Each kind of channel lists its channels — in the fixed category order, underlined — but **the Approach and the Goal are written once per stage**, spanning those rows, because an organisation has an approach to being discovered rather than a different one per platform; both are labelled inside the Engagement Strategy cell. Keyed by `offering\|stage`; the two earlier keyings (per channel, then per category) are read as fallbacks and never written to. The Goal sits on the **interaction**, optional, per the worked example's structural rule |

**The relationship is kept about an Offering, not about a Profile.**
The worked example puts Relationship Type before Offering, and the
Profile before both; the implementation turns on the Offering, so the
same person can buy a product on their own and be walked through a
service, and one answer stands for everyone who buys the same thing.
`types` and `purpose` therefore live under
`segment.offerings[].typeDetail`, and the Profiles an Offering serves
are read off Page 1's needs chain and listed under it rather than
answered.

**Section B asks nothing Pages 1 and 2 have already answered.** A
Profile's rows are a chain of three answers already given:

1. the Profile's **Functional needs** — Page 1, Profile → Needs;
2. the Offerings whose **Functional Needs Addressed** include one of
   them — Page 1, Offering;
3. the channels carrying those Offerings, and at which **Journey
   Stages** — Page 2, Section A.

So an Offering that answers none of a Profile's needs produces no
rows for that Profile, and adding a Journey Stage to a channel adds
the rows for every Profile whose needs that channel's Offerings
answer. The Offering and Journey Stage / Channel columns are
read-only, and the empty state names whichever link in the chain is
missing.

A channel may be marked as carrying **all** of a Segment's
Offerings (`BUSINESS_CHANNEL_ALL_OFFERINGS`) rather than listing
them — one row instead of five, and it keeps meaning all of them as
Page 1 gains more. Read it through `businessChannelOfferings`.

**Answered against Page 1, by id.** Segments, Profiles and Offerings
are referenced and never copied: the stored value holds ids only, so
renaming a Profile on Page 1 renames it here and the two pages
cannot disagree. Page 1's per-Segment colour is carried through, so
the same Segment is the same colour on both pages.

**The third document.** `page-2-section-2-customer-relationships-worked-example.md`
is Section 2's worked example and column rules, not a third section.
Its two rules that the main specification does not state are both
implemented: the Goal belongs to the journey stage rather than to
the whole relationship, and it is optional there; and the Goal
selector shows each goal's meaning beside its name rather than
"Get / Keep / Grow" alone.

### Page 3 — Infrastructure & Capability

Page shell: **one Structure, `Business Capability`**
(`BusinessCapabilityEditor`), Section 3 of the Business System.

**Built.** Both sections and all six subsections are implemented.

| Section | Required structure | How it is built |
|---|---|---|
| Infrastructure → 1. Resources | A. Founders (Name, Roles, Salary, auto-built Responsibilities), B. Workspace (single select + Status), C–F (group → subsection → slot, each slot Name, Quantity, Description, Status, Costs) | Drawn as **six section tiles**, three across in two rows (1. Founders, 2. Workspace, 3. Utilities, 4. Workstation, 5. Equipment, 6. Digital Infrastructure), with no group headings and no rule down the left: each tile is a square with the section's name centred, and opens that section, unchanged, in a dialog at the centre of the screen (Back at its lower left, or Escape, returns to the page as it was). The three numbered sections of the Infrastructure card carry their own arrows. Each resource section opens with its fixed subsections and takes named additions through **+ Add Other**, named in the added subsection's own head. A Founder's Roles are a numbered list, one role a line; a Roles answer saved as one line of text is read as the first role. Every Price carries a **currency**, defaulting to the currency of the country chosen on 1. Identity System — 3. Legal Entity and changeable per price; a price left on the default stores `""` and follows the registration. A fixed subsection's stored id **is** its own id, never a generated one, so it can be resolved while rendering |
| Infrastructure → 2. Activities | Four categories plus additions, each an addable list with Name, Description, Performers, Responsible; completion tick moving a row to Completed; drag reorder; active count per category | Four section tiles in a row (1. Operational, 2. Production, 3. Marketing, 4. Sales & Customer), each opening its list in a dialog; categories can no longer be added, and one added earlier is one more tile after them while it holds activities. `ActivityList`, using the app's own `useListDrag`. The active count is red; Completed folds away in the specified light blue |
| Infrastructure → 3. Partners & Suppliers | A. Partners (seeded with 3 editable rows), B. Providers; each Name, Description, Responsible, Costs | Infrastructure: two tiles in a row (A and B), each opening its column in a dialog; Offering's Capability: one tile holding A and B side by side. The three are seeded only when the key is **absent**, so deleting them all leaves them deleted |
| Offering's Capability → 1 / 2 / 3 | The same three subsections, each row additionally **Linked to** an Offering | Four section tiles in a row (Resources, Activities, Partners & Suppliers, Delivery), each opening its section in a dialog. Cards a Customer Channel made ("+ Add resource" on a channel, and partners linked by a channel) are not mixed with the user's own: each category that has any shows one more tile, "Channel resources" / "Channel partners", in a hue of its own (teal), its dialog and cards in the same hue. Partnerships keeps the A/B split its status list refers to |

The hard part is not the fields but the **actions**, and all three
are wired:

- A Status of **"Provided"** shows a chooser over that section's
  Providers, and **"External Professionals & Partners"** one over
  its professionals; each ends in **Other…**, which records a new
  card under 3. Partners & Suppliers, selects it, and asks its
  name.
- **"Needs Activity"** and **"Needs Investigation"** create an
  Activity under Operational, named after the resource, and the slot
  says where it went. Idempotent by the activity's `sourceId`, and
  non-destructive in the other direction.
- An Activity names the founder responsible for it, and that
  founder's **Responsibilities** list in 1. Resources is derived
  from those names rather than typed.

Each of these writes across subsections, so each is composed into a
**single** `onChange` — two writes from one render both start from
the same value, and the second would discard the first.

### Pages 4 and 5 — the model they share

**Built.** Both pages are Structures of their own
(`FinancialFoundationEditor`, `FinancialSustainabilityEditor`),
and every calculation on either lives in one module of pure
functions, `src/framework/engine/FinancialModel.ts`, tested in
`FinancialModel.test.ts` against the specifications' own worked
examples. The two editors share their month field, figure tiles,
cash timeline chart and signal list (`FinancialParts.tsx`).

Two decisions the specifications leave open, settled with the
product owner:

- **Time.** The month the plan starts is never typed: it is worked
  out from the Opening Date (set on the Identity System's
  Organization tile) and the earliest cost, a card's or a legal
  expense's. That is Month 1; the plan length is set in the Global
  Settings, and every date on either page is a month picked within
  it. (The earlier text asked page 4 for the start and modelled 24
  months.)
- **Currency.** Every total is in the organisation's currency (the
  Legal Entity country's). A cost priced in another currency on
  Page 3 is listed, flagged "Other currency: not counted", and left
  out of every total: there are no exchange rates to convert it.

### Page 4 — Financial Foundation

One page, four sections stacked in the order the specification's
logic runs, numbered **1–4** via `**Numbering:** Nested`.

| Section | Required structure | How it is built |
|---|---|---|
| 4.1 Costs | Consolidated view of costs originating elsewhere (each showing its source and a link back) plus `+ Add Cost` (as built the Costs are generated only, no Add Cost); per cost: Group, Amount, Frequency, Behaviour, Offering | Read, never retyped, from the Legal Entity's Expenses; Page 3's founder salaries, Workspace, every resource marked "Costs" and both kinds of partner; and Offering's Capability's (Offering group, linked to its Offering). Grouped Establishment / Operating / Offering / Other, each a table: Cost & Source, Amount, Frequency, When (for costs with a place in the calendar), Behaviour, Group, Offering. A read cost's amount and frequency stay where they were recorded; only its classification is stored here, under its source id (`classified`). Starting classification: an Offering's cost as Offering, a one-time cost as Establishment, anything else Operating; Fixed. Semi-variable costs take a fixed part and a variable part per unit |
| 4.2 Funding Need | Name/Purpose, Amount, Required Date or Period, Linked Costs, Description; one-time or distributed across periods | **As built the needs are calculated** (Establishment = cash to raise before the Opening Date; funds block under it). Earlier design, typed cards: Category (the four, with explanations), Timing (one amount by one date, or several over time), Linked Costs ticked from 4.1 with their total, Description / Conditions |
| 4.3 Capital & Funding | Internal / External / Other, with progressively revealed fields per funding type, funding schedules (one-time, periodic, milestone), and a calculated loan repayment schedule | Three columns. Founder's Capital is read from the Legal Entity's founders (only its status and month are asked here). Each source: Type (External grouped Non-repayable / Equity / Debt), Provider, Amount, Status, Received so far; a schedule for anything but debt; Ownership % for equity; for debt the loan terms and a calculated schedule — payment, principal and interest, total interest, and every repayment on request |
| 4.4 Financial Position | Calculated: Funding Need, Available Now, Confirmed Future, Pending, Funding Gap, Financial Runway, funding mix, timeline, upcoming obligations, decision signals | A headline (gap, or Funding Requirement Covered with the runway), six figure tiles, coverage per need, the funding mix, the month-by-month cash timeline, the next six months' obligations, and decision signals. **Pending money is never counted**; confirmed money counts when it is scheduled to arrive; loan repayments are outflows from their first month |

### Page 5 — Financial Sustainability

One page, two sections, numbered **5.1–5.2**.

| Section | Required structure | How it is built |
|---|---|---|
| 5.1 Revenue | Revenue Streams referencing Page 1 Offerings; Revenue Model, Price, Revenue Unit, Frequency, Expected Volume; revenue development timeline; optional payment timing; calculated revenue summary | Stream cards named by their Offering. Volume is per month at the normal level (for a subscription, the number active). Development: steady from a start month, a gradual build-up, or month by month (each entry holds until the next). Payment timing moves cash, not revenue: on completion, split, or milestone, with a delay in months. Variable cost per unit is read from Page 4's per-unit costs linked to the Offering and can be overridden. Summary table with each stream's share |
| 5.2 Break Even | Cost inputs read from Page 4 by behaviour (fixed / variable / semi-variable); break-even quantity and revenue; offering-level and organisation-level; **break-even time**; financial exhaustion; sustainability comparison and buffer; decision signals | Fixed = monthly equivalent of every recurring cost plus loan interest (principal and one-time costs excluded), with caveats where a semi-variable cost is unseparated. Offering break even alone, and the organisation's on the expected mix scaled to cover fixed costs. Break-even time month by month; exhaustion from Page 4's timeline with revenue and variable costs laid over it; status, buffer, summary and signals. Zero revenue is valid |

---

## Dependencies that cut across the five pages

1. **Offerings are read by four pages.** Page 1 defines them; Pages 2
   (Channels and Relationships), 4 (Offering costs) and 5 (Revenue
   Streams) all reference them. `dynamicSource` exists for exactly
   this, but reads only Card List cards and Table columns — so either
   Offerings is built on one of those, or `dynamicSource` is extended
   to read a bespoke editor's value. **This decision shapes Page 1.**
2. **Journey Stages appear in both Page 2 sections** and must be the
   same five: Discover (stored as `discovery`), Evaluation, Purchase, Delivery, Support &
   Follow Up.
3. **Page 3's Status actions write into Page 3's other subsections**,
   and Page 3's costs are read by Page 4.
4. **Page 5 reads Page 4** for cost behaviour and financial position,
   and Page 1 for Offerings.
5. **Legal Entity (1. Identity System, page 2 "Organization", chapter 1) feeds Page 4's
   costs**, and its country sets **Page 3's default currency** —
   the two cross-System reads. The currency is resolved in
   `Conversation.tsx` (`organisationCurrency`) and handed down.

## The original nine pages — retired

The Business System's content triad used to hold nine further pages
(Business Plan, Business Model, Revenue Model, Revenue Matrix,
Product Register, Customer Profiles, Competitor Analysis, Pricing
Strategy, Revenue Roadmap). Each of the five pushed them along by one
as it arrived, through `StorageService.insertBusinessSection` and a
per-insertion Organization flag, until they sat at Sections 6–14.

With all five built they were **removed**, and the System is now
exactly Sections 1–5. `StorageService.retireLegacyBusinessPages`
runs once per Organization (flag `legacyBusinessPagesRetired`): it
moves whatever was answered on Sections 6–14 out of the Business
System into the Organization's `retiredBusinessResponses`, set aside
rather than deleted, so no page later given one of those numbers can
open showing them; and it puts a reader last seen on one of them on
Page 5.

Anything that finds one of these pages must find it by **title or
Answer Structure, never by number**. The shared Product Register
binding in `Conversation.tsx` held the number 5 from before the first
insertion and went on copying the product list over whatever page
held Section 5; it matched by title before the nine were retired, and
now binds only the Product Development System's Register.

**Open dependency.** The Finance System's
`Dynamic Field (Business System / Revenue Model: Revenue Stream)`
pointed at the retired Revenue Model page, so its Revenue Stream
dropdown now offers nothing (a missing source resolves to no
options, not an error). Page 5's Revenue Streams is its natural
successor, but `dynamicSource` reads only Card List cards and Table
columns, so pointing it there means extending `dynamicSource` to read
a bespoke editor's value.


---

## Update after batches F to I

The current structure of Pages 2, 3 and 4 is in the "Current structure" section of `page-3-infrastructure-and-capability.md`, the "Channel expenses" section of `page-2-section-1-channels.md` and section 30 of `page-4-financial-foundation.md`; where the older text of those files or of the Page 3 / Page 4 tables above differs, those sections win. Page 3 has nine resource categories and 47 groups, a status model with "+" rows, a cost row with options, payment plans and extras; Page 4 reads Page 3 only, with an Opening Date, cost natures, funds and Global Settings (`/settings`).
