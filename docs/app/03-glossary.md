# Glossary

Status: **reference**, written 2026-08-02, updated 2026-11-27 (every term checked against its owner document and the code on 2026-11-02; the Glossary entry on 2026-11-09; the reading mode and the Review, Calendar and Notes on 2026-11-27). Covers the framework, the app, the questionnaire and the first version, and the documents.

One-line definitions, so that terminology is the same in every document and Skill; each term has one owner document, where the full explanation is. A name without a folder is a file in `docs/ai/`; "Questions 2" is the document numbered 28 in `docs/README.md`.

## 1. The framework

**Capability** — one of the 6 top-level groupings (for example Foundation, Value Delivery) under which the 24 Systems are organised. *Owner: `06-framework-conventions-and-patterns.md`.*

**System** — one of the 24 units of the Framework (for example the Identity System), each delivered as a structured interview. *Owner: `06-framework-conventions-and-patterns.md`.*

**Section** — a numbered subdivision of a System (`## N. Title`), the unit that a `Structure:` and its content belong to. *Owner: `07-framework-dsl-grammar.md`.*

**Content triad** — the three Markdown files that define one System: its Answer file (structure), Questions file (plain-language prompts) and Help file (explanatory text); they are joined by section title, so the three must stay in step. *Owner: `07-framework-dsl-grammar.md`.*

**AnswerType / AnswerDefinition** — the typed structure a Section's content parses into (Table, Free Text, Multi-Part, and others); an `AnswerDefinition` is one Section's instance of an `AnswerType`. *Owner: `06-framework-conventions-and-patterns.md`.*

**Field / Field Registry** — a shared, named dropdown option set (Status, Scale, Frequency, Category, Platform) that a Table column can name by suffix instead of repeating its own list. *Owner: `07-framework-dsl-grammar.md`.*

**dynamicSource** — a column whose options are read live from another Section's column, by the `- Dynamic Field (Section: Column)` suffix, instead of a fixed list. *Owner: `07-framework-dsl-grammar.md`.*

**Tab Group / tabbed Multi-Part** — a Multi-Part Section drawn as one flat tab bar (one tab per part, each part with its own Structure), switched on by `**Tab Group:** Yes`. *Owner: `07-framework-dsl-grammar.md`.*

**The three special-case editors** — Process Library, Operational Log and Roles Responsibilities: hand-built code, not generic-renderer output, for the one hierarchical or derived relationship in the Framework. *Owner: `06-framework-conventions-and-patterns.md`.*

## 2. The app

**Page** — one screen of a System, with its title and rails. **Chapter** — a frame on a page that holds Master Tiles. *Owner: Foundation 1, C.0.*

**Master Tile / Tile** — the square on a page that opens a dialog (the page tile), and the other tile drawings (a section tile in a dialog, a category tile, a card tile); all are drawn by one `Tile` component. A **Diagram tile** is a Master Tile that stands for a drawing (the Roadmap). *Owner: `09-layout-rules.md`; Interface 1.*

**Card / Floating card** — a card is an opened tile; a floating card is a card placed over the page (a placement, not a type); every floating card shares one width, content line and double rule between its sections. A card of a completed activity is grey. *Owner: `08-card-kinds.md`, `09-layout-rules.md`.*

**Help tile** — a tile that holds no information of its own and only filters and presents records: the **Inventory** (every card with its cost, as tiles or a table, with a filter and sort window) and **Completed**. They stand in the footer band of the Business page Infrastructure & Capability (2 in the pages rail). *Owner: `09-layout-rules.md`, section 12.*

**Rail / page tab** — the bullets and page tags at the side of a page (Pages on the left, Sections on the right), and the tab that holds them with the Back button. *Owner: `09-layout-rules.md`.*

**Reading mode** — light, sepia, dark or auto, chosen in the header's Menu, under Appearance. **Token** — a named colour or size in `src/styles/tokens/tokens.ts`, generated into the stylesheets; the colours are tokens per mode. *Owner: `09-layout-rules.md`, section 2.*

**Shared component** — a control or part drawn once and used everywhere (`AddButton`, `RemoveButton`, `NavArrow`, `FoldArrow`, `RadioChoice`, `TextLink`, `OptionPicker` and the rest); a look is a token or a global rule, never one page's own. *Owner: Interface 1.*

**Tooltip** — a dark label above a pressed control that says in one sentence, beginning "Click to ...", what a click does. *Owner: Interface 8.*

**Layout check** — the automatic check of every Foundation page against the rulebook (`npm run check:layout`), with a baseline of known findings. *Owner: `09-layout-rules.md`, section 18.* **Card audit** — the check of one floating card against the card pattern: its width, content line and double rule (`npm run check:card`). *Owner: `09-layout-rules.md`.*

**Library / contract / placement** — the assets library records every asset once with its variants and a contract (`src/library`); a placement says where an asset stands in the app; two logs record the changes. *Owner: Library 1.*

**Global Settings** — the per-organization settings in the header (Financial plan, Business stages, Pay & tax, Assets, Rates, Reserve, Channel Fee Table). *Owner: Foundation 1, Part D 6.*

**Opening Date** — the date the organisation opens, a field of the Organisation tile (Questions 7); the budget before it is the cash to raise. **Business stage** — Planning, Launching, Managing or Growing, worked out from the Opening Date and the four durations in the Global Settings, never chosen; it sets the limits and locks of the Positioning questions. Defaults: Planning 3 months, counted back from the Opening Date; Launching 12 months from it; Managing the next 12 (to month 24); Growing the next 3 years (to month 60). **Key dates** — the milestones of the organisation (plan start, registration, opening, the end of each stage's window), shown on the Review and the Calendar. *Owner: Questions 2, 8.2a.*

**Glossary / app term / your term** — the Workbook's Glossary tab (`/workbook`; `/glossary` opens it there): an A to Z list of the app's own terms (their meaning for the app user is owned by `src/data/glossary.ts`; this document stays the developers' glossary) and of the user's own terms, the names they gave their Segments, Profiles, Competitors, Offerings, Founders, Partners and suppliers, Themes, Objectives and the Organisation; each kind has its colour (app terms blue, yours terracotta), and one funnel chooses the kinds and the letter ranges. From the Landing page it lists every organisation's terms, each named with its organisation, and the funnel chooses the organisations too. The tab after it is the **References**. *Owner: Foundation 1, C.2.*

**Harvard reference / citation** — how every source the app shows is written: in the text the author and year ("(Gupta et al., 2006)"), in an "i" note and on the References tab the full reference (author, year, title in italics, place and publisher or journal details, "Available at:" and "Accessed:"). *Owner: Research 1, 2.1; `Sources.ts`.*

**Review / Calendar / Notes** — the Workbook's Review (the open items of the organisation, with the key dates), the Calendar (every card date, in the left rail of System Selection and from the header's Menu) and Notes (the user's own notes, from the header's Menu; every card's Notes text by page is the Workbook's Card Notes). *Owner: Foundation 1, C.2.*

## 3. The questionnaire and the first version

Questions 2 is the questionnaire specification, Questions 4 the first version and what it leaves for later (sections 10 to 15), Research 5 the positioning collection.

### Positioning and the market

| Term | Meaning | See |
|---|---|---|
| Early Positioning | The Positioning tile while Planning and Launching: a temporary, targeted statement for the first market (seller and buyer relationship, audience, buyer's category, the End User, purpose, outcome) | Questions 8; Questions 2, 8.2 |
| Core Market Positioning | The tile's name while Managing | Questions 2, 8.2 |
| Corporate & Portfolio Positioning | The tile's name while Growing | Questions 2, 8.2 |
| Organisation tile | Holds the legal entity, the activity and its code, and when the business opens | Questions 7; Questions 2, 8.5 |
| Country profile | A country's own legal forms and settings in the code; the six named countries have one, every other country uses a neutral profile | Questions 4, section 3 |
| Legal form | The kind of legal entity (sole proprietorship, company and so on), from the country's own list | Questions 4, section 3 |
| Activity and code | What the business does, chosen through the levels of the country's classification, ending on its code | Research 3, 5.7 and 5.8 |
| Classification, crosswalk | A country's scheme of industry codes; a crosswalk maps one scheme to another (ISIC is the general one, a future feature) | Research 3, 5.3 |
| Other (country) | Any country outside the six named; the legal form comes from four generic options, the activity and code are typed by hand | Questions 4, section 3 |
| Market Structure (I11) | Single-sided or multi-sided; the first version has single-sided only | Questions 4, section 4 |
| Single-sided market | One audience of buyers pays; the product does not need another group to be worth buying | Questions 2, 8.2 |
| Multi-sided market (platform), side | A platform connects two or more distinct groups that need each other; each group is a side. A buyer who is not the user does not make a market multi-sided | Questions 2, 8.2 |
| Anchor side | The side of a platform that is critical to the start; the only side answered for while Planning and Launching (future) | Questions 2, 8.2 |
| Seller and Buyer Relationship (I3) | Who pays: B2C or B2B in the first version | Questions 4, section 4 |
| B2C, B2B | Business to consumer; business to business | Questions 2, 8.2 |
| B2G, G2B | Business to government; government to business (future) | Questions 4, items 6 and 7 |
| Audience (I7b) | The buyer's life stage (B2C) or scale (B2B), one question for each relationship chosen; for B2G the Administrative Level (Local Government to Institutional / Public Organisations), for G2B the Regulatory Intensity of the target industry (General Commerce to Heavily Regulated Markets) | Questions 2, 8.2 |
| Locked audience | An audience option that is greyed while Planning and Launching (Central Government & Ministries, Heavily Regulated Markets) | Questions 2, 8.2 |
| Differentiation (I7c), Outcome (I7j), Outcome for the user (I7k) | What the offering does differently (six options), the buyer's measurable result, and what matters most to a Proxy or Dual-Intent buyer's user; asked with the Purpose as separate items | Questions 2, 8.2 |
| Segment | A group of customers described by ranges; the card on Business 1. Its five boxes (Demographics, Geographics, Business Data, Purchasing Power & Behaviour, Market Size & Industry Outlook) ask choice questions, and a Proxy or Dual-Intent buyer adds a User part | Questions 12; Questions 2, 6.3 |
| Business Data | The Segment box about a business buyer. Its kind is kept under the key `business-data`; it is not a tick: where Positioning chose both B2C and B2B, two Segment cards are made automatically (people, then businesses), and a Segment added after them asks "Who is this Segment's customer?" | Questions 12 |
| Settled answer | A Segment answer read against Identity as it stands now: an answer to a question no longer asked is left out of the documents and the export, and is removed on the next choice (`settledSegmentAnswers`, `SegmentContext.ts`) | Questions 12 |
| Profile | A typical person inside a Segment, described by specifics; its choice questions are in five boxes A to E: personal information, psychographics, social and interest hubs, information and shopping habits, motivations | Questions 13; Questions 2, 6.4 |
| Cascade | The Segment sets the range; the Profile chooses within it | Questions 2, 6.5 |

### Buyer and user

| Term | Meaning | See |
|---|---|---|
| Buyer | The one who pays | Research 5, 5 |
| User | The one who uses the offering | Research 5, 5 |
| End User | The user when the buyer is a Proxy or Dual-Intent buyer; asked in the first version: the relationship (I7e), the user's life stage (I7d) and the outcome for the user (I7k, the former "what matters most"); "who chooses" (I7f) is a future feature | Questions 2, 8.2; Questions 4, section 5 |
| Audience scale (B2B) | The **app user's audience**: the customers of the business the app user describes (Solopreneurs & Freelancers, Startups & SMBs, Mid-Market, Enterprise or Public Sector). It is not the **app's audience**, the people who use the app (the app users themselves) | Research 5, 10.7 |
| Differentiation | What the offering does differently from the competitors: Cost-driven, Convenience-driven, Compliance, Risk & Security, Status & Premium, Performance & Innovation, Ecosystem & Integration | Questions 2, 8.2 |
| Outcome (for the buyer, for the user) | The measurable result the buyer gets; where the buyer is a Proxy or Dual-Intent Buyer the user has an outcome of their own (what matters most to them) | Questions 2, 8.2 |
| Buyer's category | Direct, Proxy or Dual-Intent; separate from the life stage | Questions 4, section 5 |
| Direct Buyer | Buys exclusively for personal use | Questions 4, section 5 |
| Proxy Buyer | Buys exclusively on behalf of someone else; the payer is not the user. The built life-stage option "Proxy Buyers / Gifters" is the older form of it | Questions 4, section 5 |
| Dual-Intent Buyer | Buys one offering for themselves and their dependents | Questions 4, section 5 |
| Buyer's life stage | Students / Young Adults; Workers / Professionals; Seniors | Questions 4, section 5 |
| User's life stage | Minors; Young Adults; Adults; Seniors (B2C only) | Questions 4, section 5 |
| Detailed life stages, Dependent seniors | The fine stages (Infancy through Late Adolescence; Young, Established, Peak, Mature, Active Retirees); Dependent seniors are 75 and over; a future feature | Research 5, 1 and 2; Questions 4, item 8 |
| Stage edge rule | "From X up to but not including Y": an age belongs to one stage only | Research 5, 10.1 |
| Micro-Buyer | A buyer aged 16 to 18 with restricted payment methods; a sub-category of Direct Buyers (future). The Segment card calls the buyer of 13 to 18 "Minors, semi-dependent" | Research 5, 2; decision 5; Questions 2, 6.3a |
| Buyer and User relationship | One of seven consumer (B2C: five personal ones, Commercial & Professional, and Other) or six business (B2B) relationships in the first version (22 in the collection); shown only for Proxy and Dual-Intent buyers | Research 5, 6; Questions 4, section 5 |
| Proxy archetype, Dual-Intent archetype | The default intent of a B2B relationship; the relationship only suggests the buyer's category, the buyer's own answer governs | Research 5, 10.6 |
| Purpose | Why the offering is bought; 12 in the collection; a question in the first version | Research 5, 7; Questions 4, section 5 |
| Household plan | An offering priced for a household, checked against a single-user option (a future Review check) | Questions 4, item 19 |
| Accessibility and caregiving tags | Questions saved as Profile tags (permanent, temporary or situational need; who is cared for and in what role); future | Research 5, 3 and 4; Guide 3, section 8.2, items 15 and 16 |

### Question ids and rules

| Term | Meaning | See |
|---|---|---|
| I | Identity question; I3 Seller and Buyer Relationship, I7b Audience, I7c Differentiation, I7d and I7e the End User questions (life stage, relationship), I7h Buyer's category, I7i Purpose, I7j and I7k the Outcomes, I11 Market Structure | Questions 2, 1 and 8.2 |
| G | The customer Group (the Segment card); G6 is its age range | Questions 2, 1 |
| A to E | The boxes and questions of the Profile in Questions 13: A1 the exact age, A2 gender, A3 the kind of work, A5 the part in the purchase; B1 what they care about; C1 to C4 devices, social media, communities, events; D1 and D2 how they compare options and how much help they want; E1 to E3 goals, frustrations, objections. A4 (kind of business) and A6 (specialised needs) are proposed, not built | Questions 13 |
| P | The Person (the Profile card, the earlier ids of Questions 2): P1 an age, P9 what they care about, P13 how they buy, P14 how they pay, P17 goals, P21 "What part do they play in the purchase" (use, influence, order, decide, control access), P22 how it is decided, P25 "Buyer's Relationship to this User" (proposed) | Questions 2, 1 and 6.4; Research 5, decision 18 |
| K | The Competitor | Questions 2, 1 |
| O | The Offering; O3 how it is bought, O12 minimum ages to buy | Questions 2, 1 and 10.3 |
| L1 to L16 | The shared Lists | Research 3, 5.2 |
| W | The Work of the Delivery card | Questions 2, 1 |
| C, R, J, D | Capability and founders; Revenue stream; customer Journey; Demand card | Questions 2, 1 |
| F | Ids of the earlier question files (Appendix A only) | Questions 2, 1 |
| Driver | A question whose answer produces a proposal; built first | Questions 1, 1 |
| Check (question) | A question that only raises a Review item or an evidence line | Questions 1, 1 |
| Note | A field nothing reads; not asked | Questions 1, 1 |
| Filter, Reveal, Suggest, Review dependencies | The four behaviours of an answer: hide an incompatible option; show a follow-up; offer a labelled suggestion; flag what depends on a changed answer, never delete it | Questions 2, 3 |
| Tendency, evidence line | A connection that is not certain: shown with its source, worded "tends to", never used to exclude, hide or price | Questions 2, 3 |
| [D] | A decision the owner still has to make | Questions 2 and 3 |
| Check (for the owner) | In Questions 4: the assistant's check of the owner's text against the app, for the owner to confirm | Questions 4 |
| Rule 14 | Lists come only from documents: official bodies for classifications, business schools or universities for plain lists | Questions 2, 3 |
| R-1, R-2 | Requirements for age-restricted activities and buyers on the Organisation and Positioning cards; superseded: ages go in the Segment | Research 5, decision 25 |

### The first version

| Term | Meaning | See |
|---|---|---|
| First version | The first published version of the app | Questions 4 |
| Future feature | Collected, designed or built, but not in the first version; built ones stay in the code, hidden | Questions 4 |
| Collection | A document that records the owner's data as given, before any design | Research 5 |
| Decisions register | The numbered decisions on the positioning data, with their state | Research 5, 9 |
| Age limits | The legal ages by activity and country, and for a buyer; shown on the Segment in the first version | Research 4; Questions 4, section 6 |

## 4. Documents and working

**Reference** — a stable knowledge file in `docs/ai/` that skills and assistants use rather than duplicate. *Owner: `README.md`.*

**Playbook** — a procedure plus a living record, as opposed to a static spec (`03-toolchain-and-verification-playbook.md`, with its list of expected failures). *Owner: `03-toolchain-and-verification-playbook.md`.*

**Skill** — a packaged set of instructions (a `SKILL.md`) that an assistant uses for one kind of task; it owns behaviour, facts stay in a reference. *Owner: `01-ai-collaboration-rules.md`.*

**Outstanding Finding** — a real, confirmed problem found by a diagnostic and not fixed in that turn, recorded so it is not lost. *Owner: Records 2, section 5.9 (`design/records/02-to-do-list.md`).*

**Log** — `design/records/01-log.md`: every change, newest row on top, and nowhere else. **Generated document** — written by a script, never edited by hand (`docs/README.md` says which). **Kinds** of document (rules, reference, current design, living list, proposal, specification, playbook, archive) — defined in `docs/README.md`.
