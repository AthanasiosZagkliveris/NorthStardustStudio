# The documents of NorthStardustStudio

Status: **index**, updated 2026-11-21. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (`design/records/01-log.md`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (a plan or design not built, or built only in part; its status line says what is built), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); `npm run docs:standard` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the latest dated decision wins** ([standard.md](standard.md), section 3); names of files and functions follow the code. The checks that keep them honest: `npm run docs:check` (generated sections), `npm run tables:check`, `npm run library:check`, and the document-reference test (five documents name only properties, classes and files the code has).
- **This index is written by `npm run docs:index`** (the lists are in `tools/scripts/docs/write-index.mjs`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with `ai/README.md`; the owner starts with `app/contents.md` (the map), `design/records/02-not-done-yet.md` (what is open) and `design/records/01-log.md` (what changed).

## Contents

1. [The standard of the documents](#1-the-standard-of-the-documents)
2. [The app](#2-the-app-app)
3. [The user guide](#3-the-user-guide-guide)
4. [The design of the Foundation (`design/foundation/`, Foundation 1 and 2)](#4-the-design-of-the-foundation-designfoundation-foundation-1-and-2)
5. [The questions (`design/questions/`, Questions 1 to 21)](#5-the-questions-designquestions-questions-1-to-21)
6. [The interface (`design/interface/`, Interface 1 to 10)](#6-the-interface-designinterface-interface-1-to-10)
7. [The research and the sources (`design/research/`, Research 1 to 8)](#7-the-research-and-the-sources-designresearch-research-1-to-8)
8. [The library (`design/library/`, Library 1 to 7)](#8-the-library-designlibrary-library-1-to-7)
9. [The records (`design/records/`, Records 1 to 4)](#9-the-records-designrecords-records-1-to-4)
10. [Rules for the assistant](#10-rules-for-the-assistant-ai)
11. [The specifications](#11-the-specifications-specifications)
12. [The proposals](#12-the-proposals-proposals)
13. [The archive](#13-the-archive-archive)

The design documents are grouped by what they hold, and each folder has its own sequence from 1, in the order the app shows things (the questions run Identity, Brand, Business, Strategy). A document is cited by its folder and number, "Questions 2" or "Interface 1"; the number is in the file name and the title. Until 2026-11-21 the documents had one sequence for all the folders (1 to 55); the old numbers are in the last table here, for reading older log rows, commits and PRs. The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).

## 1. The standard of the documents

How the documents are numbered, headed and written.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [standard.md](standard.md) | rules | The standard of the documents: where a document goes, how it is numbered, the head every document has, the kinds, how a document is written, and how to add one. | 2026-11-21 |

## 2. The app (`app/`)

How the app is entered, its Systems and pages, the places in it, and the terms.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [app/contents.md](app/contents.md) | contents | The contents of the app: how it is entered, the Systems and pages, where the figures and dates come from, where things are in the code. | 2026-11-21 |
| [app/index.md](app/index.md) | index | An alphabetical index of the places in the app (pages, tiles, cards, the header): where each is, and which document describes it. | 2026-11-21 |
| [app/glossary.md](app/glossary.md) | reference | One line per term: the framework, the app, the business stage, positioning, buyer and user, the question ids, the documents. | 2026-11-21 |

## 3. The user guide (`guide/`)

How a founder uses the app, step by step, and an overview of the app, its specifications and its future features.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [guide/user-guide.md](guide/user-guide.md) | playbook | The user guide: how a founder uses the app step by step: the Organisations screen, the Foundation with its Identity and Business Systems, and the tools (Workbook, Notes, Search, Settings, Focus, the reading modes, the Calendar). | 2026-11-21 |
| [guide/overview-and-future-features.md](guide/overview-and-future-features.md) | reference | The app: what it is, where its guide and specifications are, how its answers connect, and its future features (an AI Assistant, Team working mode, Voice mode, more languages and countries), from online research. | 2026-11-21 |

## 4. The design of the Foundation (`design/foundation/`, Foundation 1 and 2)

The single description of the Foundation capability (1) and its Part F, the card structure (2), from which the structure tables and the catalogue record are generated.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/foundation/01-current-design.md](design/foundation/01-current-design.md) | current design | The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map. | 2026-11-21 |
| [design/foundation/02-card-structure.md](design/foundation/02-card-structure.md) | current design | Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it. | 2026-11-21 |

## 5. The questions (`design/questions/`, Questions 1 to 21)

How the questions work, then one document for each tile in the order the app shows them. **How they work:** 1 (the plan, the order of work and, in section 11, the form of a tile document), 2 (every question, the connections and the evidence), 3 (the flow), 4 (the first published version and what is left for later), 5 (every auto-filled answer), 6 (every question in one table with its permanent code, generated). **Identity System:** 7 (the Organisation), 8 (Positioning), 9 (Purpose & Beliefs), 10 (the legal starts). **Brand System:** 11 (the Ambassador). **Business System:** 12 (the Segment), 13 (the Profile), 14 (the Competitor), 15 (the Value Proposition), 16 (the Offering), 17 (Customer Engagement), 18 (channel fees and Sales Forecast), 19 (Capacity & Delivery), 20 (Financials and the Inventory). **Strategy System:** 21. **How to word them:** Interface 10 and, in Questions 2, sections 3 and 4.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/questions/01-questionnaire-plan.md](design/questions/01-questionnaire-plan.md) | proposal | The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut, the order of work for Questions 9, 11, 17, 20 and 21 (section 10), and the form of a tile document with where each tile stands (section 11). | 2026-11-21 |
| [design/questions/02-questionnaire-specification.md](design/questions/02-questionnaire-specification.md) | proposal | The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence. | 2026-11-21 |
| [design/questions/03-question-guide.md](design/questions/03-question-guide.md) | proposal | The question guide: the flow of the questions as trees, the key branches and how a question earns its place. | 2026-11-21 |
| [design/questions/04-specs-and-limitations.md](design/questions/04-specs-and-limitations.md) | specification | The first published version (language, countries, legal forms, market structure, relationships, buyer and user, ages; it governs the other questionnaire documents, sections 1 to 9) and everything left for later (sections 10 to 15: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do). | 2026-11-21 |
| [design/questions/05-auto-filled-answers.md](design/questions/05-auto-filled-answers.md) | reference | Auto-filled answers: every answer the app drafts, starts, offers or works out from an earlier one (about 120): the field, the kind, its sources, the code and the document that describes it. | 2026-11-21 |
| [design/questions/06-questions-register.md](design/questions/06-questions-register.md) | generated | The questions register: every question of the Foundation's cards by card and position, with its permanent code, saved id, control, limit, when it is asked, its start, options and "i", and the retired codes; generated from the code. | 2026-11-21 |
| [design/questions/07-organisation-tile.md](design/questions/07-organisation-tile.md) | specification | The Organisation tile's fields as built: control, when asked, options, the help and the connections. | 2026-11-21 |
| [design/questions/08-positioning-tile.md](design/questions/08-positioning-tile.md) | specification | The Positioning tile's questions as built, by stage: control, limits, options, the help and the connections. | 2026-11-21 |
| [design/questions/09-purpose-and-beliefs.md](design/questions/09-purpose-and-beliefs.md) | specification | Purpose & Beliefs: the Identity System's Mission, Vision, Values, Principles, Philosophy and Manifesto as three pair tiles, each text with its guiding questions, control, length, "i" and connections (codes PB1 to PB6), built with the owner's decisions (section 6). | 2026-11-21 |
| [design/questions/10-legal-starts.md](design/questions/10-legal-starts.md) | proposal | Legal starts: the registrations, taxes and legal expenses the Legal Entity can start from Definition and the Business pages, by country, each with its official source; the eight decisions; stages 1 to 4 built (section 6). | 2026-11-21 |
| [design/questions/11-ambassador.md](design/questions/11-ambassador.md) | specification | The Ambassador: the Brand System's four tiles with their choices BA1 to BA4 and BA6 to BA9, the drafts and the Style suggestions; built in part (the Style suggestions are still to build). | 2026-11-21 |
| [design/questions/12-segment-questions.md](design/questions/12-segment-questions.md) | specification | The Segment card's questions as built: every question and option in order, when it is asked, what its help says and what it comes from and is read by. | 2026-11-21 |
| [design/questions/13-profile-questions.md](design/questions/13-profile-questions.md) | specification | The Profile card's questions, built in part: every question and option in order (the specialised needs and the kind of business are not built yet), when it is asked, the starting values, the help, and the layout of the card. | 2026-11-21 |
| [design/questions/14-competitor-questions.md](design/questions/14-competitor-questions.md) | specification | The Competitor card: every question and option, as built (K1 to K10, in the card's order, by the competitor's type). | 2026-11-21 |
| [design/questions/15-value-proposition.md](design/questions/15-value-proposition.md) | specification | The Value Proposition tile: what it asks, the draft sentence it writes and the open items it lists, built in part. | 2026-11-21 |
| [design/questions/16-offering-questions.md](design/questions/16-offering-questions.md) | specification | The Offering card: every question and option (O1 to O18), built in part. | 2026-11-21 |
| [design/questions/17-customer-engagement.md](design/questions/17-customer-engagement.md) | specification | Customer Engagement as the Engagement subchapter of each Segment's chapter, its Master Tiles, the Offering's four faces and the journey rebuild; built in part (the journey rebuild is still to build). | 2026-11-21 |
| [design/questions/18-channel-fees-and-sales-forecast.md](design/questions/18-channel-fees-and-sales-forecast.md) | specification | Channel fees on Customer Engagement (the read-only Fees on a subchannel, the UK rows) and what Sales Forecast adds (Tried it, the time to buy, the market-size check); built. | 2026-11-21 |
| [design/questions/19-capacity-and-delivery.md](design/questions/19-capacity-and-delivery.md) | specification | Capacity & Delivery: the Delivery tile renamed, Research 7's seven additions on the Delivery card (DV1 to DV13), the dialog and Sustainability's check, the Lumen Workshops through the Online Store, and the decisions; built in part (Sustainability's check, section 5, is still to build). | 2026-11-21 |
| [design/questions/20-financials-and-inventory.md](design/questions/20-financials-and-inventory.md) | specification | The page Financials as one chapter of Master Tiles, the Offering Economics card, the questions RV1 and FN1, and the Inventory's changes IN1 to IN5; built in part (the questions and the Offering Economics card are still to build). | 2026-11-21 |
| [design/questions/21-strategy.md](design/questions/21-strategy.md) | specification | Strategy: SW1, the SWOT suggestions, SC1 to SC3 and the Compass draft, Themes, Goals and Metrics linked to the plan; built in part (SW1, SC1 to SC3 and the Compass draft). | 2026-11-21 |

## 6. The interface (`design/interface/`, Interface 1 to 10)

What every screen shares, from the shared components (1) to the smallest text: the text holders (2), the free texts (3), the Frequency options (4), the reactions (5), the text links (6), the pop-ups (7), the tooltips (8), the help texts (9) and the guide to what an "i" says (10).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/interface/01-shared-components.md](design/interface/01-shared-components.md) | current design | Which components are shared, with their props, and what is still hand-made. | 2026-11-21 |
| [design/interface/02-text-holders.md](design/interface/02-text-holders.md) | generated | The text holders: sizes, style classes and rules. | 2026-11-21 |
| [design/interface/03-free-text-categories.md](design/interface/03-free-text-categories.md) | current design | Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build. | 2026-11-21 |
| [design/interface/04-frequency-options.md](design/interface/04-frequency-options.md) | generated | The Frequency options by group, compared with the code. | 2026-11-21 |
| [design/interface/05-reactions.md](design/interface/05-reactions.md) | current design | How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup. | 2026-11-21 |
| [design/interface/06-text-links.md](design/interface/06-text-links.md) | generated | The text link: look and behaviour, from the code and the walk of the app. | 2026-11-21 |
| [design/interface/07-popups.md](design/interface/07-popups.md) | current design | Pop-ups in six categories, with their placement rules and the order of fallbacks. | 2026-11-21 |
| [design/interface/08-tooltips.md](design/interface/08-tooltips.md) | current design | Which controls have a tooltip, what it says, its look and its rules. This document owns the tip. | 2026-11-21 |
| [design/interface/09-help-texts.md](design/interface/09-help-texts.md) | generated | The help texts of the app, from the walk of the running app. | 2026-11-21 |
| [design/interface/10-help-texts-guide.md](design/interface/10-help-texts-guide.md) | specification | What a help text says: the analysis of the 159 help texts and a proposed structure per place and field, standard phrases, size budgets and a check. | 2026-11-21 |

## 7. The research and the sources (`design/research/`, Research 1 to 8)

The source register (1), the research behind the design (2), the lists and classifications (3), age limits (4), the owner's positioning data and its sources (5, 6), delivery and capacity (7) and the Beta questionnaire that asks the founders (8).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/research/01-references.md](design/research/01-references.md) | reference | The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it. | 2026-11-21 |
| [design/research/02-research.md](design/research/02-research.md) | research | The research behind the design decisions: the question, the recommendation, the reason and the source. Foundation 1 prevails where they differ. | 2026-11-21 |
| [design/research/03-lists-and-classifications.md](design/research/03-lists-and-classifications.md) | proposal | The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification). | 2026-11-21 |
| [design/research/04-age-limits-by-activity.md](design/research/04-age-limits-by-activity.md) | research | Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status. | 2026-11-21 |
| [design/research/05-positioning-categories.md](design/research/05-positioning-categories.md) | collection | The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables. | 2026-11-21 |
| [design/research/06-positioning-sources.md](design/research/06-positioning-sources.md) | research | The sources behind each positioning list of Research 5, what has none, and the pages checked. | 2026-11-21 |
| [design/research/07-delivery-and-capacity-research.md](design/research/07-delivery-and-capacity-research.md) | proposal | Delivery and capacity: what the sources say, what the app asks today, what is missing, and seven additions in priority order; not built. | 2026-11-21 |
| [design/research/08-beta-questionnaire.md](design/research/08-beta-questionnaire.md) | proposal | The Beta questionnaire: what the app would ask its Beta founders about the app, in sections, with the choices of each; nothing built. | 2026-11-21 |

## 8. The library (`design/library/`, Library 1 to 7)

The library system (1), the assets library with the component defaults (2), the generated lists of components and fields (3, 4), the library measured against the app (5), and its two logs (6, 7).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/library/01-library-system.md](design/library/01-library-system.md) | specification | The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built. | 2026-11-21 |
| [design/library/02-assets-library.md](design/library/02-assets-library.md) | generated | The assets library: every asset, its variants and its contract. | 2026-11-21 |
| [design/library/03-components-list.md](design/library/03-components-list.md) | generated | The components, and which fields and cards use each. | 2026-11-21 |
| [design/library/04-fields-list.md](design/library/04-fields-list.md) | generated | The fields, the add buttons and the field names. | 2026-11-21 |
| [design/library/05-library-vs-app.md](design/library/05-library-vs-app.md) | generated | The library measured against the running app. | 2026-11-21 |
| [design/library/06-library-log.md](design/library/06-library-log.md) | log | The library log: every change to an asset of the library, newest on top. | 2026-11-21 |
| [design/library/07-app-structure-log.md](design/library/07-app-structure-log.md) | log | The app structure log: every change of the tables, that is of the structure of the app, newest on top. | 2026-11-21 |

## 9. The records (`design/records/`, Records 1 to 4)

The log of every change (1), what has not been done (2), and the generated catalogue record and structure tables (3, 4).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/records/01-log.md](design/records/01-log.md) | log | Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written. | 2026-11-21 |
| [design/records/02-not-done-yet.md](design/records/02-not-done-yet.md) | living list | What has not been done: the road, the plans, the requirements still open, the open decisions and the open points of the reviews. | 2026-11-21 |
| [design/records/03-catalogue-record.md](design/records/03-catalogue-record.md) | generated | The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes. | 2026-11-21 |
| [design/records/04-structure-tables.md](design/records/04-structure-tables.md) | generated | The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue. | 2026-11-21 |

## 10. Rules for the assistant (`ai/`)

Standing rules, references and playbooks for an AI assistant working on the project, the code map and the folder plan.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [ai/README.md](ai/README.md) | index | The map of this folder: what to read first, what to read for a task. | 2026-11-21 |
| [ai/ai-collaboration-rules.md](ai/ai-collaboration-rules.md) | rules | Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows. | 2026-11-21 |
| [ai/toolchain-and-verification-playbook.md](ai/toolchain-and-verification-playbook.md) | playbook | What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures. | 2026-11-21 |
| [ai/framework-dsl-grammar.md](ai/framework-dsl-grammar.md) | reference | Grammar of the Markdown that defines a System's content. | 2026-11-21 |
| [ai/framework-conventions-and-patterns.md](ai/framework-conventions-and-patterns.md) | reference | The architectural patterns and the data model of the framework. | 2026-11-21 |
| [ai/review.md](ai/review.md) | rules | The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured and the report (sections 1 to 12), and the checklist to tick before saying done (section 13). | 2026-11-21 |
| [ai/code-map.md](ai/code-map.md) | reference | Where things are in src: the folders and what is in each; the rules for a new file. | 2026-11-21 |
| [ai/layout-rules.md](ai/layout-rules.md) | rules | The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check. | 2026-11-21 |
| [ai/card-kinds.md](ai/card-kinds.md) | reference | The kinds of card, where each one's code is, how its head is built. | 2026-11-21 |
| [ai/folder-plan.md](ai/folder-plan.md) | reference | The folders of the repository: the app files, the examples, the working files and the exports, and the documents folder (it was document 25; the number is retired). | 2026-11-21 |

## 11. The specifications (`specifications/`)

The pages of the four Systems (Identity, Brand, Business, Strategy), the Inventory, the Workbook and the Settings.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [specifications/identity-system/page-1-definition.md](specifications/identity-system/page-1-definition.md) | current design | 1. Identity System, 1. Definition: the master tile with its four tiles (Organisation, Early Positioning, Mission, Vision), its layout, reactions and readers, and the extra information that is neither built nor a future feature. | 2026-11-21 |
| [specifications/brand-system/page-1-brand.md](specifications/brand-system/page-1-brand.md) | current design | 2. Brand System: the one page, its two chapters and their tiles, what each asks, reads and writes, and the rules it follows. | 2026-11-21 |
| [specifications/business-system/README.md](specifications/business-system/README.md) | index | The Business System: its five sections on three pages, the file, editor and data module of each, and what crosses between the pages. | 2026-11-21 |
| [specifications/business-system/page-1-foundation.md](specifications/business-system/page-1-foundation.md) | specification | Page 1, Foundation & Engagement, Section 1: the Foundation. | 2026-11-21 |
| [specifications/business-system/page-1-channels.md](specifications/business-system/page-1-channels.md) | specification | Page 1, Foundation & Engagement, Section 2, part 1: the channels. | 2026-11-21 |
| [specifications/business-system/page-1-customer-relationships.md](specifications/business-system/page-1-customer-relationships.md) | specification | Page 1, Foundation & Engagement, Section 2, part 2: customer relationships (section 18 holds a worked example and the column rules). | 2026-11-21 |
| [specifications/business-system/page-2-infrastructure-and-capability.md](specifications/business-system/page-2-infrastructure-and-capability.md) | specification | Page 2, Section 3: Infrastructure & Capability. | 2026-11-21 |
| [specifications/business-system/page-3-revenue-and-pricing.md](specifications/business-system/page-3-revenue-and-pricing.md) | specification | Section 4: Revenue & Pricing, drawn on the page Financials. | 2026-11-21 |
| [specifications/business-system/page-3-costs-funding-and-position.md](specifications/business-system/page-3-costs-funding-and-position.md) | specification | Section 5: Costs, Funding & Position, drawn on the page Financials. | 2026-11-21 |
| [specifications/inventory/README.md](specifications/inventory/README.md) | current design | The Inventory: the help tile of Infrastructure & Capability that holds every card of the page, as tiles or a table, under one funnel. | 2026-11-21 |
| [specifications/strategy-system/page-1-situation-and-direction.md](specifications/strategy-system/page-1-situation-and-direction.md) | current design | 4. Strategy System, Situation & Direction: the four Master Tiles, the cards of the Strategic Period, what the page reads and writes, and the rules it follows. | 2026-11-21 |
| [specifications/workbook/README.md](specifications/workbook/README.md) | current design | The Workbook: the page drawn as a dialog, and each of its sections: Business Documents, Financial Documents, Review, References and Glossary, Card Notes. | 2026-11-21 |
| [specifications/settings/README.md](specifications/settings/README.md) | specification | Settings: the Global Settings screen (how it is drawn and the rule each part follows), the reading mode (Appearance) and Focus, all three in the header's Menu. | 2026-11-21 |

## 12. The proposals (`proposals/`)

Plans that are still open and not started; each leaves for the archive when it is built or replaced.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [proposals/workspace-d-duplicate-scenarios-compare.md](proposals/workspace-d-duplicate-scenarios-compare.md) | proposal | Workspace features D, not started: duplicate an Organisation or a card, financial scenarios, compare. | 2026-11-21 |
| [proposals/workspace-e-founder-helpers.md](proposals/workspace-e-founder-helpers.md) | proposal | Workspace features E, not started: helpers for founders (what would it take, the lender-ready check, the one-pager, glossary hints). | 2026-11-21 |

## 13. The archive (`archive/`)

Documents that are finished or replaced; each is kept for its information.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [archive/log/library-log-archive.md](archive/log/library-log-archive.md) | archive | Older rows of the library log. | 2026-11-21 |
| [archive/reports/engineering-phase-completion.md](archive/reports/engineering-phase-completion.md) | archive | The engineering phase completion report. | 2026-11-21 |
| [archive/reports/questionnaire-decisions-done-2026-11-21.md](archive/reports/questionnaire-decisions-done-2026-11-21.md) | archive | The rows of Questions 2, section 13 (rebuilds, moves and decisions) that were built or superseded on 2026-11-21. | 2026-11-21 |
| [archive/reports/question-guide-review-2026-10-26.md](archive/reports/question-guide-review-2026-10-26.md) | archive | The question guide's review of 2026-10-26 (Questions 3, sections 10 to 12): where each question stood, the conflicts decided and what was merged or deleted. | 2026-11-21 |
| [archive/plans/2026-10-14-cleanup-and-library-plans.md](archive/plans/2026-10-14-cleanup-and-library-plans.md) | archive | The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of Records 2); what is left is in Records 2. | 2026-11-21 |
| [archive/log/log-archive-2026-07-to-10.md](archive/log/log-archive-2026-07-to-10.md) | archive | Older rows of the log (Records 1): sections 4.1 and 4.4 before 2026-11-01, and sections 4.2 (the drafts' versions) and 4.5 (the task plan F to K). | 2026-11-21 |
| [archive/log/log-archive-2026-11-01-to-07.md](archive/log/log-archive-2026-11-01-to-07.md) | archive | Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-01 to 2026-11-07. | 2026-11-11 |
| [archive/log/log-archive-2026-11-08-to-10.md](archive/log/log-archive-2026-11-08-to-10.md) | archive | Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-08 to 2026-11-10. | 2026-11-11 |
| [archive/log/log-archive-2026-11-11-to-17.md](archive/log/log-archive-2026-11-11-to-17.md) | archive | Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-11 to 2026-11-17. | 2026-11-21 |
| [archive/proposals/card-links.md](archive/proposals/card-links.md) | archive | Proposal: which partner and supplier groups each resource group could link to, and which partners, suppliers and resources could link to each activity group (formerly Questions 14; not built). | 2026-11-21 |
| [archive/proposals/cost-section-proposal.md](archive/proposals/cost-section-proposal.md) | archive | Proposal: what the Cost section should record (the page was built afterwards). | 2026-11-21 |
| [archive/proposals/competitor-and-value-proposition-2026-11-03.md](archive/proposals/competitor-and-value-proposition-2026-11-03.md) | archive | The Competitor card and the Value Proposition tile as proposed on 2026-11-03; what is built is Questions 14 and 15. | 2026-11-21 |
| [archive/proposals/segment-questions-g-list-2026-10-23.md](archive/proposals/segment-questions-g-list-2026-10-23.md) | archive | The Segment card's earlier design (the G-list of 2026-10-23, ids G1 to G25); the questions as built are Questions 12. | 2026-11-21 |
| [archive/proposals/segment-by-selection-proposal.md](archive/proposals/segment-by-selection-proposal.md) | archive | Proposal: building a Customer Segment by selection (not built). | 2026-11-21 |
| [archive/proposals/shared-workspace.md](archive/proposals/shared-workspace.md) | archive | Proposal: Shared Workspace, working together without a server (not built). | 2026-11-21 |

**The old numbers.** Until 2026-11-21 the design documents had one sequence (1 to 55); 12, 25 and 40 had been retired. What each old number is now:

| Old | Now |
|---|---|
| 1 | [design/foundation/01-current-design.md](design/foundation/01-current-design.md) |
| 2 | [design/research/01-references.md](design/research/01-references.md) |
| 3 | [design/research/02-research.md](design/research/02-research.md) |
| 4 | [design/records/01-log.md](design/records/01-log.md) |
| 5 | [design/records/02-not-done-yet.md](design/records/02-not-done-yet.md) |
| 6 | [design/records/03-catalogue-record.md](design/records/03-catalogue-record.md) |
| 7 | [design/records/04-structure-tables.md](design/records/04-structure-tables.md) |
| 8 | [design/library/01-library-system.md](design/library/01-library-system.md) |
| 9 | [design/library/02-assets-library.md](design/library/02-assets-library.md) |
| 10 | [design/library/06-library-log.md](design/library/06-library-log.md) |
| 11 | [design/library/07-app-structure-log.md](design/library/07-app-structure-log.md) |
| 13 | [design/library/03-components-list.md](design/library/03-components-list.md) |
| 14 | [design/library/04-fields-list.md](design/library/04-fields-list.md) |
| 15 | [design/library/05-library-vs-app.md](design/library/05-library-vs-app.md) |
| 16 | [design/interface/02-text-holders.md](design/interface/02-text-holders.md) |
| 17 | [design/interface/04-frequency-options.md](design/interface/04-frequency-options.md) |
| 18 | [design/interface/05-reactions.md](design/interface/05-reactions.md) |
| 19 | [design/interface/06-text-links.md](design/interface/06-text-links.md) |
| 20 | [design/interface/03-free-text-categories.md](design/interface/03-free-text-categories.md) |
| 21 | [design/interface/01-shared-components.md](design/interface/01-shared-components.md) |
| 22 | [design/interface/09-help-texts.md](design/interface/09-help-texts.md) |
| 23 | [design/interface/07-popups.md](design/interface/07-popups.md) |
| 24 | [design/interface/08-tooltips.md](design/interface/08-tooltips.md) |
| 26 | [design/foundation/02-card-structure.md](design/foundation/02-card-structure.md) |
| 27 | [design/questions/01-questionnaire-plan.md](design/questions/01-questionnaire-plan.md) |
| 28 | [design/questions/02-questionnaire-specification.md](design/questions/02-questionnaire-specification.md) |
| 29 | [design/questions/03-question-guide.md](design/questions/03-question-guide.md) |
| 30 | [design/research/04-age-limits-by-activity.md](design/research/04-age-limits-by-activity.md) |
| 31 | [design/research/05-positioning-categories.md](design/research/05-positioning-categories.md) |
| 32 | [design/research/06-positioning-sources.md](design/research/06-positioning-sources.md) |
| 33 | [design/questions/04-specs-and-limitations.md](design/questions/04-specs-and-limitations.md) |
| 34 | [design/research/03-lists-and-classifications.md](design/research/03-lists-and-classifications.md) |
| 35 | [design/questions/12-segment-questions.md](design/questions/12-segment-questions.md) |
| 36 | [design/questions/13-profile-questions.md](design/questions/13-profile-questions.md) |
| 37 | [design/questions/07-organisation-tile.md](design/questions/07-organisation-tile.md) |
| 38 | [design/questions/08-positioning-tile.md](design/questions/08-positioning-tile.md) |
| 39 | [design/interface/10-help-texts-guide.md](design/interface/10-help-texts-guide.md) |
| 41 | [design/questions/14-competitor-questions.md](design/questions/14-competitor-questions.md) |
| 42 | [design/questions/15-value-proposition.md](design/questions/15-value-proposition.md) |
| 43 | [design/questions/16-offering-questions.md](design/questions/16-offering-questions.md) |
| 44 | [design/questions/06-questions-register.md](design/questions/06-questions-register.md) |
| 45 | [design/questions/09-purpose-and-beliefs.md](design/questions/09-purpose-and-beliefs.md) |
| 46 | [design/questions/11-ambassador.md](design/questions/11-ambassador.md) |
| 47 | [design/questions/17-customer-engagement.md](design/questions/17-customer-engagement.md) |
| 48 | [design/questions/20-financials-and-inventory.md](design/questions/20-financials-and-inventory.md) |
| 49 | [design/questions/21-strategy.md](design/questions/21-strategy.md) |
| 50 | [design/questions/18-channel-fees-and-sales-forecast.md](design/questions/18-channel-fees-and-sales-forecast.md) |
| 51 | [design/research/07-delivery-and-capacity-research.md](design/research/07-delivery-and-capacity-research.md) |
| 52 | [design/questions/19-capacity-and-delivery.md](design/questions/19-capacity-and-delivery.md) |
| 53 | [design/questions/10-legal-starts.md](design/questions/10-legal-starts.md) |
| 54 | [design/questions/05-auto-filled-answers.md](design/questions/05-auto-filled-answers.md) |
| 55 | [design/research/08-beta-questionnaire.md](design/research/08-beta-questionnaire.md) |
| 12 | [design/library/02-assets-library.md](design/library/02-assets-library.md) |
| 25 | [ai/folder-plan.md](ai/folder-plan.md) |
| 40 | [design/questions/01-questionnaire-plan.md](design/questions/01-questionnaire-plan.md) |

