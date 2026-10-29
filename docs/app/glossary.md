# Glossary

Status: **reference**, updated 2026-10-29. Covers the framework, the app, the questionnaire and the documents.

Canonical, one-line definitions. Each term has exactly one owner document, linked below — read that document for the full explanation; this file exists for fast lookup and to keep terminology consistent across every other document and Skill, not to explain anything itself.


## Project domain

**Capability** — one of 6 top-level groupings (e.g. Foundation, Deliver Value) that the 24 Systems are organized under. *Owned by: `framework-conventions-and-patterns.md`.*

**System** — one of 24 top-level units of the Framework (e.g. Identity System, Operations System), each delivered as a structured interview. *Owned by: `framework-conventions-and-patterns.md`.*

**Section** — a numbered subdivision of a System (`## N. Title`), the unit a `Structure:` and its content belong to. *Owned by: `framework-dsl-grammar.md`.*

**Content triad** — the three Markdown files that together define one System: its Answer file (structure), Questions file (plain-language prompts), and Help file (explanatory text). All three must stay in sync section-by-section. *Owned by: `framework-dsl-grammar.md`.*

**AnswerType / AnswerDefinition** — the typed structure a Section's content parses into (Table, Free Text, Multi-Part, and others); `AnswerDefinition` is one specific Section's instance of an `AnswerType`. *Owned by: `framework-conventions-and-patterns.md`.*

**Field / Field Registry** — a shared, named dropdown option set (Status, Scale, Frequency, Category, Platform) that a Table column can reference by suffix instead of repeating its own option list. *Owned by: `framework-dsl-grammar.md`.*

**dynamicSource** — a column whose options are sourced live from another Section's own column, via the `- Dynamic Field (Section: Column)` suffix, rather than a static list. *Owned by: `framework-dsl-grammar.md`.*

**Tab Group / tabbed Multi-Part** — a Multi-Part Section rendered as a single flat tab bar (one tab per part, each part able to use a different Structure), enabled by a `**Tab Group:** Yes` marker. *Owned by: `framework-dsl-grammar.md`.*

**The three special-case editors** — Process Library, Operational Log, and Roles Responsibilities: hand-built application code (not generic-renderer output) for the one genuinely hierarchical/derived relationship in the Framework. *Owned by: `framework-conventions-and-patterns.md`.*

## The app (Foundation pages)

**Page** — one screen of a System, with its title and rails. **Chapter** — a frame on a page that holds Master Tiles. *Owned by: `design/current/01-current-design.md`, C.0.*

**Master Tile / Tile** — the square on a page that opens a dialog (the page tile), and the other tile drawings (a section tile in a dialog, a category tile, a card tile); all are drawn by one `Tile` component. A **Diagram tile** is a Master Tile that stands for a drawing (the Roadmap). *Owned by: `tile-and-card-pattern.md`, `design/current/22-shared-components.md`.*

**Card / Floating card** — an opened tile; a floating card is a card placed over the page (a placement, not a type). A card of a completed activity is grey. *Owned by: `card-kinds.md`, `tile-and-card-pattern.md`.*

**Help tile** — a tile that holds no information of its own and only filters and presents records: the **Inventory** (every card with its cost, as tiles or a table, with a filter and sort window) and **Completed**. They stand in the footer band of page 3. *Owned by: `layout-rules.md`, section 12.*

**Rail / page tab** — the bullets and page tags at the side of a page, and the tab that holds them with the Back button. *Owned by: `tile-and-card-pattern.md`.*

**Reading mode** — light, sepia, dark or auto; the colours are tokens per mode. **Token** — a named colour or size in `src/styles/tokens/tokens.ts`, generated into the stylesheets. *Owned by: `layout-rules.md`, section 2.*

**Shared component** — a control or part drawn once and used everywhere (`AddButton`, `RemoveButton`, `NavArrow`, `FoldArrow`, `RadioChoice`, `TextLink`, `OptionPicker` and the rest). A look is a token or a global rule, never a page's own. *Owned by: `design/current/22-shared-components.md`.*

**Tooltip** — a dark label above a pressed control that says what a click does, in one sentence beginning "Click to ...". *Owned by: `design/current/25-tooltips.md`.*

**Layout check** — the automatic check of every Foundation page against the rulebook (`npm run check:layout`), with a baseline of known findings. *Owned by: `layout-rules.md`, section 18.*

**Library / contract / placement** — the assets library records every asset once with its variants and a contract (`src/library`); a placement says where an asset stands in the app; two logs record changes. *Owned by: `design/library/08-library-system.md`.*

**Global Settings** — the per-organization settings in the header (the Business stages, Plan Start, tax, reserves, useful life and others). **Opening Date** — the date the organization opens, set on the Organization tile; the budget before it is the cash to raise. **Business stage** — Planning, Launching, Managing or Growing, worked out from the Opening Date and the four durations in the Global Settings; it sets the limits and locks of the Positioning questions. **Key dates** — the milestones of the organization (plan start, registration, opening, the end of each stage's window), on the Review and the Calendar. *Owned by: `app-guide.md`; the stage and the key dates by `design/questionnaire/28-questionnaire-specification.md`, 8.2a.*

**Early Positioning** — the Positioning tile, named by the stage (Early Positioning, Core Market Positioning, Corporate & Portfolio Positioning): market structure, seller and buyer relationship, audience and outcome. A *multi-sided market* is a platform of two or more distinct groups; a buyer who is not the user is not one. *Owned by: `design/questionnaire/28-questionnaire-specification.md`, 8.2.*

## Documents and working

**Reference** — a stable knowledge file in this folder (`docs/ai/`) that skills and assistants consume rather than duplicate. *Owned by: `README.md`.*

**Playbook** — a procedure plus a living record, as opposed to a static spec (`toolchain-and-verification-playbook.md`, with its list of expected failures). *Owned by: `toolchain-and-verification-playbook.md`.*

**Skill** — a packaged set of instructions (a `SKILL.md`) that an assistant uses for one kind of task. It owns behaviour; facts stay in a reference. *Owned by: `ai-collaboration-rules.md`.*

**Outstanding Finding** — a real, confirmed problem found by a diagnostic and not fixed in that turn, recorded so it is not lost. *Owned by: `outstanding-findings.md`.*

**Log** — `design/records/04-log.md`: every change, newest row on top, and nowhere else. **Generated document** — written by a script; never edited by hand (`docs/README.md` says which).

## The questionnaire and the first version

One line per term; the document that explains it is in the last column. Doc numbers are the files in `design/`.

### Business stage

| Term | Meaning | See |
|---|---|---|
| Business stage | Worked out from the Opening Date and the durations of the Global Settings; never chosen | doc 28 8.2a |
| Planning | Before the Opening Date (default 3 months, counted back from it) | doc 28 8.2a |
| Launching | From the Opening Date, 12 months by default | doc 28 8.2a |
| Managing | The next 12 months by default (to month 24) | doc 28 8.2a |
| Growing | The next 3 years by default (to month 60) | doc 28 8.2a |
| Opening Date | The date the business opens; a field of the Organization tile | doc 28 8.2a |
| Early Positioning | Name of the Positioning tile while Planning and Launching | doc 28 8.2 |
| Core Market Positioning | Name of the tile while Managing | doc 28 8.2 |
| Corporate & Portfolio Positioning | Name of the tile while Growing | doc 28 8.2 |

### Identity and positioning

| Term | Meaning | See |
|---|---|---|
| Organization tile | Holds the legal entity, the activity and its code, and when the business opens | doc 28 8.5 |
| Other (country) | Any country outside the six named; legal form from five generic options, activity and code typed by hand | doc 33 section 3 |
| Market Structure (I11) | Single-sided or multi-sided; the first version has single-sided only | doc 33 section 4 |
| Seller and Buyer Relationship (I3) | Who pays: B2C or B2B in the first version | doc 33 section 4 |
| B2C, B2B | Business to consumer; business to business | doc 28 8.2 |
| B2G, G2B | Business to government; government to business (future) | doc 34 |
| Audience (I7b) | The buyer's life stage (B2C) or scale (B2B), one question for each relationship chosen | doc 28 8.2 |
| Differentiation and Outcome (I7c) | What the business competes on and the result it gives | doc 28 8.2 |
| Anchor side | The side of a platform critical to the start (future) | doc 28 8.2 |
| Segment | A group of customers described by ranges; the card on Business 1 | doc 28 6.3 |
| Profile | A typical person inside a Segment, described by specifics | doc 28 6.4 |
| Cascade | The Segment sets the range; the Profile chooses within it | doc 28 6.5 |

### Buyer and user

| Term | Meaning | See |
|---|---|---|
| Buyer | The one who pays | doc 31 5 |
| User | The one who uses the offering | doc 31 5 |
| End User | The user when the buyer is a Proxy or Dual-Intent buyer | doc 31 decision 19 |
| Direct Buyer | Buys exclusively for personal use | doc 33 section 5 |
| Proxy Buyer | Buys exclusively on behalf of someone else; the payer is not the user | doc 33 section 5 |
| Dual-Intent Buyer | Buys one offering for themselves and their dependents | doc 33 section 5 |
| Buyer's category | Direct, Proxy or Dual-Intent; separate from the life stage | doc 33 section 5 |
| Buyer's life stage | Students / Young Adults; Workers / Professionals / Adults; Seniors | doc 33 section 5 |
| User's life stage | Minors; Young Adults; Adults; Seniors | doc 33 section 5 |
| Buyer and User relationship | One of six personal (B2C) or six business (B2B) relationships in the first version (22 in the collection) | doc 31 6 |
| Proxy archetype, Dual-Intent archetype | The default intent of a B2B relationship; the buyer's own answer governs | doc 31 section 10.6 |
| Micro-Buyer | A buyer aged 16 to 18 with restricted payment methods (future) | doc 31 2 |
| Stage edge rule | "From X up to but not including Y": an age belongs to one stage only | doc 31 section 10.1 |
| Purpose | Why the offering is bought; 12 in the collection | doc 31 7 |

### Question ids and marks

| Term | Meaning | See |
|---|---|---|
| I | Identity question | doc 28 1 |
| G | The customer Group (Segment card) | doc 28 1 |
| P | The Person (Profile card) | doc 28 1 |
| K | The Competitor | doc 28 1 |
| O | The Offering | doc 28 1 |
| L1 to L16 | The shared Lists | doc 36 5.2 |
| W | The Work of the Delivery card | doc 28 1 |
| C, R, J, D | Capability and founders; Revenue stream; customer Journey; Demand card | doc 28 1 |
| F | Ids of the earlier question files (Appendix A only) | doc 28 1 |
| Driver | A question whose answer produces a proposal; built first | doc 27 1 |
| Check | A question that only raises a Review item or evidence line | doc 27 1 |
| Note | A field nothing reads; not asked | doc 27 1 |
| [D] | A decision the owner still has to make | docs 28, 29 |
| Rule 14 | Lists come only from documents: official bodies for classifications, business schools or universities for plain lists | doc 28 |
| P21 | "What part do they play in the purchase": use, influence, order, decide, control access | doc 28 6.4 |
| P25 | "Buyer's Relationship to this User" (proposed Profile field) | doc 31 decision 18 |

### Documents of the first version

| Term | Meaning | See |
|---|---|---|
| First version | The first published version of the app | doc 33 |
| Future feature | Collected, designed or built, but not in the first version | doc 34 |
| Collection | A document that records the owner's data as given, before any design | doc 31 |
| R-1, R-2 | Requirements: age-restricted activities on the Organization card; age-restricted buyers on the Positioning card (future) | doc 31 section 9 |
