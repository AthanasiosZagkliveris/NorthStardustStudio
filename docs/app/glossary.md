# Glossary

Status: **reference**, updated 2026-10-29 (every term checked against its owner document). Covers the framework, the app, the questionnaire and the first version, and the documents.

One-line definitions, so that terminology is the same in every document and Skill; each term has one owner document, where the full explanation is. A name without a folder is a file in `docs/ai/`; "doc 28" is the document numbered 28 in `docs/README.md`.

## 1. The framework

**Capability** — one of the 6 top-level groupings (for example Foundation, Deliver Value) under which the 24 Systems are organized. *Owner: `framework-conventions-and-patterns.md`.*

**System** — one of the 24 units of the Framework (for example the Identity System), each delivered as a structured interview. *Owner: `framework-conventions-and-patterns.md`.*

**Section** — a numbered subdivision of a System (`## N. Title`), the unit that a `Structure:` and its content belong to. *Owner: `framework-dsl-grammar.md`.*

**Content triad** — the three Markdown files that define one System: its Answer file (structure), Questions file (plain-language prompts) and Help file (explanatory text); they are joined by section title, so the three must stay in step. *Owner: `framework-dsl-grammar.md`.*

**AnswerType / AnswerDefinition** — the typed structure a Section's content parses into (Table, Free Text, Multi-Part, and others); an `AnswerDefinition` is one Section's instance of an `AnswerType`. *Owner: `framework-conventions-and-patterns.md`.*

**Field / Field Registry** — a shared, named dropdown option set (Status, Scale, Frequency, Category, Platform) that a Table column can name by suffix instead of repeating its own list. *Owner: `framework-dsl-grammar.md`.*

**dynamicSource** — a column whose options are read live from another Section's column, by the `- Dynamic Field (Section: Column)` suffix, instead of a fixed list. *Owner: `framework-dsl-grammar.md`.*

**Tab Group / tabbed Multi-Part** — a Multi-Part Section drawn as one flat tab bar (one tab per part, each part with its own Structure), switched on by `**Tab Group:** Yes`. *Owner: `framework-dsl-grammar.md`.*

**The three special-case editors** — Process Library, Operational Log and Roles Responsibilities: hand-built code, not generic-renderer output, for the one hierarchical or derived relationship in the Framework. *Owner: `framework-conventions-and-patterns.md`.*

## 2. The app

**Page** — one screen of a System, with its title and rails. **Chapter** — a frame on a page that holds Master Tiles. *Owner: doc 1, C.0.*

**Master Tile / Tile** — the square on a page that opens a dialog (the page tile), and the other tile drawings (a section tile in a dialog, a category tile, a card tile); all are drawn by one `Tile` component. A **Diagram tile** is a Master Tile that stands for a drawing (the Roadmap). *Owner: `tile-and-card-pattern.md`; doc 21.*

**Card / Floating card** — a card is an opened tile; a floating card is a card placed over the page (a placement, not a type). A card of a completed activity is grey. *Owner: `card-kinds.md`, `tile-and-card-pattern.md`.*

**Help tile** — a tile that holds no information of its own and only filters and presents records: the **Inventory** (every card with its cost, as tiles or a table, with a filter and sort window) and **Completed**. They stand in the footer band of Business page 3. *Owner: `layout-rules.md`, section 12.*

**Rail / page tab** — the bullets and page tags at the side of a page (Pages on the left, Sections on the right), and the tab that holds them with the Back button. *Owner: `tile-and-card-pattern.md`.*

**Reading mode** — light, sepia, dark or auto, chosen in the header. **Token** — a named colour or size in `src/styles/tokens/tokens.ts`, generated into the stylesheets; the colours are tokens per mode. *Owner: `layout-rules.md`, section 2.*

**Shared component** — a control or part drawn once and used everywhere (`AddButton`, `RemoveButton`, `NavArrow`, `FoldArrow`, `RadioChoice`, `TextLink`, `OptionPicker` and the rest); a look is a token or a global rule, never one page's own. *Owner: doc 21.*

**Tooltip** — a dark label above a pressed control that says in one sentence, beginning "Click to ...", what a click does. *Owner: doc 24.*

**Layout check** — the automatic check of every Foundation page against the rulebook (`npm run check:layout`), with a baseline of known findings. *Owner: `layout-rules.md`, section 18.*

**Library / contract / placement** — the assets library records every asset once with its variants and a contract (`src/library`); a placement says where an asset stands in the app; two logs record the changes. *Owner: doc 8.*

**Global Settings** — the per-organization settings in the header (Financial plan, Business stages, Pay and tax, Assets, Rates, Reserve, Channel Fee Table). *Owner: doc 1, Part D 6.*

**Opening Date** — the date the organization opens, a field of the Organization tile; the budget before it is the cash to raise. **Business stage** — Planning, Launching, Managing or Growing, worked out from the Opening Date and the four durations in the Global Settings, never chosen; it sets the limits and locks of the Positioning questions. Defaults: Planning 3 months, counted back from the Opening Date; Launching 12 months from it; Managing the next 12 (to month 24); Growing the next 3 years (to month 60). **Key dates** — the milestones of the organization (plan start, registration, opening, the end of each stage's window), shown on the Review and the Calendar. *Owner: doc 28, 8.2a.*

**Review / Calendar / Notes** — the header's Review (the open items of the organization, with the key dates), the Calendar (every card date, in the left rail of System Selection) and Notes (the user's own notes, and every card's Notes text by page). *Owner: doc 1, C.2.*

## 3. The questionnaire and the first version

Doc 28 is the questionnaire specification, doc 33 the first version, doc 34 what it leaves for later, doc 31 the positioning collection.

### Positioning and the market

| Term | Meaning | See |
|---|---|---|
| Early Positioning | The Positioning tile while Planning and Launching: a temporary, targeted statement for the first market (seller and buyer relationship, audience, buyer's category, the End User, purpose, outcome) | Doc 28, 8.2 |
| Core Market Positioning | The tile's name while Managing | Doc 28, 8.2 |
| Corporate & Portfolio Positioning | The tile's name while Growing | Doc 28, 8.2 |
| Organization tile | Holds the legal entity, the activity and its code, and when the business opens | Doc 28, 8.5 |
| Country profile | A country's own legal forms and settings in the code; the six named countries have one, every other country uses a neutral profile | Doc 33, section 3 |
| Legal form | The kind of legal entity (sole proprietorship, company and so on), from the country's own list | Doc 33, section 3 |
| Activity and code | What the business does, chosen through the levels of the country's classification, ending on its code | Doc 35, 5.7 and 5.8 |
| Classification, crosswalk | A country's scheme of industry codes; a crosswalk maps one scheme to another (ISIC is the general one, a future feature) | Doc 35, 5.3 |
| Other (country) | Any country outside the six named; the legal form comes from five generic options, the activity and code are typed by hand | Doc 33, section 3 |
| Market Structure (I11) | Single-sided or multi-sided; the first version has single-sided only | Doc 33, section 4 |
| Single-sided market | One audience of buyers pays; the product does not need another group to be worth buying | Doc 28, 8.2 |
| Multi-sided market (platform), side | A platform connects two or more distinct groups that need each other; each group is a side. A buyer who is not the user does not make a market multi-sided | Doc 28, 8.2 |
| Anchor side | The side of a platform that is critical to the start; the only side answered for while Planning and Launching (future) | Doc 28, 8.2 |
| Seller and Buyer Relationship (I3) | Who pays: B2C or B2B in the first version | Doc 33, section 4 |
| B2C, B2B | Business to consumer; business to business | Doc 28, 8.2 |
| B2G, G2B | Business to government; government to business (future) | Doc 34, items 6 and 7 |
| Audience (I7b) | The buyer's life stage (B2C) or scale (B2B), one question for each relationship chosen; for B2G the Administrative Level (Local Government to Institutional / Public Organizations), for G2B the Regulatory Intensity of the target industry (General Commerce to Heavily Regulated Markets) | Doc 28, 8.2 |
| Locked audience | An audience option that is greyed while Planning and Launching (Central Government & Ministries, Heavily Regulated Markets) | Doc 28, 8.2 |
| Differentiation and Outcome (I7c) | What the business competes on (Cost-driven, Convenience-driven, Compliance, Risk & Security, Status & Premium) and the result it gives; in the first version asked with Purpose as three items | Doc 28, 8.2; doc 33, section 5 |
| Segment | A group of customers described by ranges; the card on Business 1 | Doc 28, 6.3 |
| Profile | A typical person inside a Segment, described by specifics | Doc 28, 6.4 |
| Cascade | The Segment sets the range; the Profile chooses within it | Doc 28, 6.5 |

### Buyer and user

| Term | Meaning | See |
|---|---|---|
| Buyer | The one who pays | Doc 31, 5 |
| User | The one who uses the offering | Doc 31, 5 |
| End User | The user when the buyer is a Proxy or Dual-Intent buyer; the built questions I7d to I7g (age group, relationship, who chooses, what matters most) stay until the new structure is built; only the relationship and the user's life stage are in the first version | Doc 28, 8.2; doc 33, section 5 |
| Buyer's category | Direct, Proxy or Dual-Intent; separate from the life stage | Doc 33, section 5 |
| Direct Buyer | Buys exclusively for personal use | Doc 33, section 5 |
| Proxy Buyer | Buys exclusively on behalf of someone else; the payer is not the user. The built life-stage option "Proxy Buyers / Gifters" is the older form of it | Doc 33, section 5 |
| Dual-Intent Buyer | Buys one offering for themselves and their dependents | Doc 33, section 5 |
| Buyer's life stage | Students / Young Adults; Workers / Professionals / Adults; Seniors | Doc 33, section 5 |
| User's life stage | Minors; Young Adults; Adults; Seniors (B2C only) | Doc 33, section 5 |
| Detailed life stages, Dependent seniors | The fine stages (Infancy through Late Adolescence; Young, Established, Peak, Mature, Active Retirees); Dependent seniors are 74 and over; a future feature | Doc 31, 1 and 2; doc 34, item 8 |
| Stage edge rule | "From X up to but not including Y": an age belongs to one stage only | Doc 31, 10.1 |
| Micro-Buyer | A buyer aged 16 to 18 with restricted payment methods; a sub-category of Direct Buyers (future) | Doc 31, 2; decision 5 |
| Buyer and User relationship | One of six personal (B2C) or six business (B2B) relationships in the first version (22 in the collection); shown only for Proxy and Dual-Intent buyers | Doc 31, 6; doc 33, section 5 |
| Proxy archetype, Dual-Intent archetype | The default intent of a B2B relationship; the relationship only suggests the buyer's category, the buyer's own answer governs | Doc 31, 10.6 |
| Purpose | Why the offering is bought; 12 in the collection; a question in the first version | Doc 31, 7; doc 33, section 5 |
| Household plan | An offering priced for a household, checked against a single-user option (a future Review check) | Doc 34, item 19 |
| Accessibility and caregiving tags | Questions saved as Profile tags (permanent, temporary or situational need; who is cared for and in what role); future | Doc 31, 3 and 4; doc 34, items 15 and 16 |

### Question ids and rules

| Term | Meaning | See |
|---|---|---|
| I | Identity question; I3 Seller and Buyer Relationship, I7b Audience, I7c Differentiation and Outcome, I7d to I7g the End User questions, I11 Market Structure | Doc 28, 1 and 8.2 |
| G | The customer Group (the Segment card); G6 is its age range | Doc 28, 1 |
| P | The Person (the Profile card): P1 an age, P9 what they care about, P13 how they buy, P14 how they pay, P17 goals, P21 "What part do they play in the purchase" (use, influence, order, decide, control access), P22 how it is decided, P25 "Buyer's Relationship to this User" (proposed) | Doc 28, 1 and 6.4; doc 31, decision 18 |
| K | The Competitor | Doc 28, 1 |
| O | The Offering; O3 how it is bought, O12 minimum ages to buy | Doc 28, 1 and 10.3 |
| L1 to L16 | The shared Lists | Doc 35, 5.2 |
| W | The Work of the Delivery card | Doc 28, 1 |
| C, R, J, D | Capability and founders; Revenue stream; customer Journey; Demand card | Doc 28, 1 |
| F | Ids of the earlier question files (Appendix A only) | Doc 28, 1 |
| Driver | A question whose answer produces a proposal; built first | Doc 27, 1 |
| Check (question) | A question that only raises a Review item or an evidence line | Doc 27, 1 |
| Note | A field nothing reads; not asked | Doc 27, 1 |
| Filter, Reveal, Suggest, Review dependencies | The four behaviours of an answer: hide an incompatible option; show a follow-up; offer a labelled suggestion; flag what depends on a changed answer, never delete it | Doc 28, 3 |
| Tendency, evidence line | A connection that is not certain: shown with its source, worded "tends to", never used to exclude, hide or price | Doc 28, 3 |
| [D] | A decision the owner still has to make | Docs 28, 29 |
| Check (for the owner) | In doc 33: the assistant's check of the owner's text against the app, for the owner to confirm | Doc 33 |
| Rule 14 | Lists come only from documents: official bodies for classifications, business schools or universities for plain lists | Doc 28, 3 |
| R-1, R-2 | Requirements for age-restricted activities and buyers on the Organization and Positioning cards; superseded: ages go in the Segment | Doc 31, decision 25 |

### The first version

| Term | Meaning | See |
|---|---|---|
| First version | The first published version of the app | Doc 33 |
| Future feature | Collected, designed or built, but not in the first version; built ones stay in the code, hidden | Doc 34 |
| Collection | A document that records the owner's data as given, before any design | Doc 31 |
| Decisions register | The numbered decisions on the positioning data, with their state | Doc 31, 9 |
| Age limits | The legal ages by activity and country, and for a buyer; shown on the Segment in the first version | Doc 30; doc 33, section 6 |

## 4. Documents and working

**Reference** — a stable knowledge file in `docs/ai/` that skills and assistants use rather than duplicate. *Owner: `README.md`.*

**Playbook** — a procedure plus a living record, as opposed to a static spec (`toolchain-and-verification-playbook.md`, with its list of expected failures). *Owner: `toolchain-and-verification-playbook.md`.*

**Skill** — a packaged set of instructions (a `SKILL.md`) that an assistant uses for one kind of task; it owns behaviour, facts stay in a reference. *Owner: `ai-collaboration-rules.md`.*

**Outstanding Finding** — a real, confirmed problem found by a diagnostic and not fixed in that turn, recorded so it is not lost. *Owner: `outstanding-findings.md`.*

**Log** — `design/core/04-log.md`: every change, newest row on top, and nowhere else. **Generated document** — written by a script, never edited by hand (`docs/README.md` says which). **Kinds** of document (rules, reference, current design, living list, proposal, specification, playbook, archive) — defined in `docs/README.md`.
