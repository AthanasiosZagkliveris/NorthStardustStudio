# The documents of NorthStardustStudio

Status: **index**, updated 2026-11-21. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (`design/records/04-log.md`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (a plan or design not built, or built only in part; its status line says what is built), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); `npm run docs:standard` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the latest dated decision wins** ([standard.md](standard.md), section 3); names of files and functions follow the code. The checks that keep them honest: `npm run docs:check` (generated sections), `npm run tables:check`, `npm run library:check`, and the document-reference test (five documents name only properties, classes and files the code has).
- **This index is written by `npm run docs:index`** (the lists are in `tools/scripts/docs/write-index.mjs`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with `ai/README.md`; the owner starts with `app/contents.md` (the map), `design/records/05-not-done-yet.md` (what is open) and `design/records/04-log.md` (what changed).

## Contents

1. [The standard of the documents](#1-the-standard-of-the-documents)
2. [The app](#2-the-app-app)
3. [The user guide](#3-the-user-guide-guide)
4. [The design of the Foundation (`design/foundation/`, documents 1 and 26)](#4-the-design-of-the-foundation-designfoundation-documents-1-and-26)
5. [The interface (`design/interface/`, documents 16 to 24 and 39)](#5-the-interface-designinterface-documents-16-to-24-and-39)
6. [The questions (`design/questions/`, documents 27 to 29, 33, 35 to 38, 41 to 50, 52 to 54)](#6-the-questions-designquestions-documents-27-to-29-33-35-to-38-41-to-50-52-to-54)
7. [The research and the sources (`design/research/`, documents 2, 3, 30 to 32, 34, 51 and 55)](#7-the-research-and-the-sources-designresearch-documents-2-3-30-to-32-34-51-and-55)
8. [The records (`design/records/`, documents 4 to 7)](#8-the-records-designrecords-documents-4-to-7)
9. [The library (`design/library/`, documents 8 to 11 and 13 to 15)](#9-the-library-designlibrary-documents-8-to-11-and-13-to-15)
10. [Rules for the assistant](#10-rules-for-the-assistant-ai)
11. [The specifications](#11-the-specifications-specifications)
12. [The proposals](#12-the-proposals-proposals)
13. [The archive](#13-the-archive-archive)

The design documents are grouped by what they hold, and each keeps its number wherever it stands: the number is a permanent id (in the file name and the title, and it is how they cite one another: "doc 28"); a retired number stays unused (12, the component defaults, is now a section of 9; 25, the folder plan, is `ai/folder-plan.md`; 40, the tile documents, is section 11 of 27). The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).

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

## 4. The design of the Foundation (`design/foundation/`, documents 1 and 26)

The single description of the Foundation capability (document 1) and its Part F, the card structure (document 26), from which the structure tables and the catalogue record are generated.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/foundation/01-current-design.md](design/foundation/01-current-design.md) | current design | The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map. | 2026-11-21 |
| [design/foundation/26-card-structure.md](design/foundation/26-card-structure.md) | current design | Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it. | 2026-11-21 |

## 5. The interface (`design/interface/`, documents 16 to 24 and 39)

What every screen shares: the text holders, the Frequency options, the reactions, the text links, the free texts, the shared components, the help texts and the guide to what an "i" says, the pop-ups and the tooltips.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/interface/16-text-holders.md](design/interface/16-text-holders.md) | generated | The text holders: sizes, style classes and rules. | 2026-11-21 |
| [design/interface/17-frequency-options.md](design/interface/17-frequency-options.md) | generated | The Frequency options by group, compared with the code. | 2026-11-21 |
| [design/interface/18-reactions.md](design/interface/18-reactions.md) | current design | How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup. | 2026-11-21 |
| [design/interface/19-text-links.md](design/interface/19-text-links.md) | generated | The text link: look and behaviour, from the code and the walk of the app. | 2026-11-21 |
| [design/interface/20-free-text-categories.md](design/interface/20-free-text-categories.md) | current design | Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build. | 2026-11-21 |
| [design/interface/21-shared-components.md](design/interface/21-shared-components.md) | current design | Which components are shared, with their props, and what is still hand-made. | 2026-11-21 |
| [design/interface/22-help-texts.md](design/interface/22-help-texts.md) | generated | The help texts of the app, from the walk of the running app. | 2026-11-21 |
| [design/interface/23-popups.md](design/interface/23-popups.md) | current design | Pop-ups in six categories, with their placement rules and the order of fallbacks. | 2026-11-21 |
| [design/interface/24-tooltips.md](design/interface/24-tooltips.md) | current design | Which controls have a tooltip, what it says, its look and its rules. This document owns the tip. | 2026-11-21 |
| [design/interface/39-help-texts-guide.md](design/interface/39-help-texts-guide.md) | specification | What a help text says: the analysis of the 159 help texts and a proposed structure per place and field, standard phrases, size budgets and a check. | 2026-11-21 |

## 6. The questions (`design/questions/`, documents 27 to 29, 33, 35 to 38, 41 to 50, 52 to 54)

What the first published version contains and what it leaves for later, and the questions of each tile. **What governs:** 33 (the first version, sections 1 to 9; what is left for later, sections 10 to 15). **The design behind them:** 27 (the plan, and the order of work for 45 to 49), 28 (every question, the connections and the evidence), 29 (the flow). **The tiles, one document each (27, section 11, gives the form and where each tile stands):** 37 (the Organisation), 38 (Positioning), 45 (Purpose & Beliefs), 35 (the Segment), 36 (the Profile), 41 (the Competitor), 42 (the Value Proposition), 43 (the Offering), 46 (the Ambassador), 47 (Customer Engagement), 52 (Capacity & Delivery), 48 (Financials and the Inventory), 49 (Strategy). **Built from the answers:** 50 (channel fees and Sales Forecast), 53 (the legal starts), 54 (every auto-filled answer). **Every question in one table, by card and position, with its permanent code:** 44 (generated). **How to word them:** 39 (in the interface chapter) and, in 28, sections 3 and 4.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/questions/27-questionnaire-plan.md](design/questions/27-questionnaire-plan.md) | proposal | The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut, the order of work for docs 45 to 49 (section 10), and the form of a tile document with where each tile stands (section 11). | 2026-11-21 |
| [design/questions/28-questionnaire-specification.md](design/questions/28-questionnaire-specification.md) | proposal | The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence. | 2026-11-21 |
| [design/questions/29-question-guide.md](design/questions/29-question-guide.md) | proposal | The question guide: the flow of the questions as trees, the key branches and how a question earns its place. | 2026-11-21 |
| [design/questions/33-specs-and-limitations.md](design/questions/33-specs-and-limitations.md) | specification | The first published version (language, countries, legal forms, market structure, relationships, buyer and user, ages; it governs the other questionnaire documents, sections 1 to 9) and everything left for later (sections 10 to 15: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do). | 2026-11-21 |
| [design/questions/35-segment-questions.md](design/questions/35-segment-questions.md) | specification | The Segment card's questions as built: every question and option in order, when it is asked, what its help says and what it comes from and is read by. | 2026-11-21 |
| [design/questions/36-profile-questions.md](design/questions/36-profile-questions.md) | specification | The Profile card's questions, built in part: every question and option in order (the specialised needs and the kind of business are not built yet), when it is asked, the starting values, the help, and the layout of the card. | 2026-11-21 |
| [design/questions/37-organization-fields.md](design/questions/37-organization-fields.md) | specification | The Organisation tile's fields as built: control, when asked, options, the help and the connections. | 2026-11-21 |
| [design/questions/38-positioning-questions.md](design/questions/38-positioning-questions.md) | specification | The Positioning tile's questions as built, by stage: control, limits, options, the help and the connections. | 2026-11-21 |
| [design/questions/41-competitor-questions.md](design/questions/41-competitor-questions.md) | specification | The Competitor card: every question and option, as built (K1 to K10, in the card's order, by the competitor's type). | 2026-11-21 |
| [design/questions/42-value-proposition-questions.md](design/questions/42-value-proposition-questions.md) | specification | The Value Proposition tile: what it asks, the draft sentence it writes and the open items it lists, built in part. | 2026-11-21 |
| [design/questions/43-offering-questions.md](design/questions/43-offering-questions.md) | specification | The Offering card: every question and option (O1 to O18), built in part. | 2026-11-21 |
| [design/questions/44-questions-register.md](design/questions/44-questions-register.md) | generated | The questions register: every question of the Foundation's cards by card and position, with its permanent code, saved id, control, limit, when it is asked, its start, options and "i", and the retired codes; generated from the code. | 2026-11-21 |
| [design/questions/45-purpose-and-beliefs-questions.md](design/questions/45-purpose-and-beliefs-questions.md) | specification | Purpose & Beliefs: the Identity System's Mission, Vision, Values, Principles, Philosophy and Manifesto as three pair tiles, each text with its guiding questions, control, length, "i" and connections (codes PB1 to PB6), built with the owner's decisions (section 6). | 2026-11-21 |
| [design/questions/46-ambassador-questions.md](design/questions/46-ambassador-questions.md) | specification | The Ambassador: the Brand System's four tiles with their choices BA1 to BA4 and BA6 to BA9, the drafts and the Style suggestions; built in part (the Style suggestions are still to build). | 2026-11-21 |
| [design/questions/47-customer-engagement-tiles.md](design/questions/47-customer-engagement-tiles.md) | specification | Customer Engagement as the Engagement subchapter of each Segment's chapter, its Master Tiles, the Offering's four faces and the journey rebuild; built in part (the journey rebuild is still to build). | 2026-11-21 |
| [design/questions/48-financials-and-inventory.md](design/questions/48-financials-and-inventory.md) | specification | The page Financials as one chapter of Master Tiles, the Offering Economics card, the questions RV1 and FN1, and the Inventory's changes IN1 to IN5; built in part (the questions and the Offering Economics card are still to build). | 2026-11-21 |
| [design/questions/49-strategy-questions.md](design/questions/49-strategy-questions.md) | specification | Strategy: SW1, the SWOT suggestions, SC1 to SC3 and the Compass draft, Themes, Goals and Metrics linked to the plan; built in part (SW1, SC1 to SC3 and the Compass draft). | 2026-11-21 |
| [design/questions/50-channel-fees-and-sales-forecast.md](design/questions/50-channel-fees-and-sales-forecast.md) | specification | Channel fees on Customer Engagement (the read-only Fees on a subchannel, the UK rows) and what Sales Forecast adds (Tried it, the time to buy, the market-size check); built. | 2026-11-21 |
| [design/questions/52-capacity-and-delivery-tile.md](design/questions/52-capacity-and-delivery-tile.md) | specification | Capacity & Delivery: the Delivery tile renamed, doc 51's seven additions on the Delivery card (DV1 to DV13), the dialog and Sustainability's check, the Lumen Workshops through the Online Store, and the decisions; built in part (Sustainability's check, section 5, is still to build). | 2026-11-21 |
| [design/questions/53-legal-starts.md](design/questions/53-legal-starts.md) | proposal | Legal starts: the registrations, taxes and legal expenses the Legal Entity can start from Definition and the Business pages, by country, each with its official source; the eight decisions; stages 1 to 4 built (section 6). | 2026-11-21 |
| [design/questions/54-auto-filled-answers.md](design/questions/54-auto-filled-answers.md) | reference | Auto-filled answers: every answer the app drafts, starts, offers or works out from an earlier one (about 120): the field, the kind, its sources, the code and the document that describes it. | 2026-11-21 |

## 7. The research and the sources (`design/research/`, documents 2, 3, 30 to 32, 34, 51 and 55)

The source register (2), the research behind the design (3), the owner's positioning data and its sources (31, 32), age limits (30), the lists and classifications (34), delivery and capacity (51) and the Beta questionnaire that asks the founders (55).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/research/02-references.md](design/research/02-references.md) | reference | The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it. | 2026-11-21 |
| [design/research/03-research.md](design/research/03-research.md) | research | The research behind the design decisions: the question, the recommendation, the reason and the source. Document 1 prevails where they differ. | 2026-11-21 |
| [design/research/30-age-limits-by-activity.md](design/research/30-age-limits-by-activity.md) | research | Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status. | 2026-11-21 |
| [design/research/31-positioning-categories.md](design/research/31-positioning-categories.md) | collection | The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables. | 2026-11-21 |
| [design/research/32-positioning-sources.md](design/research/32-positioning-sources.md) | research | The sources behind each positioning list of doc 31, what has none, and the pages checked. | 2026-11-21 |
| [design/research/34-lists-and-classifications.md](design/research/34-lists-and-classifications.md) | proposal | The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification). | 2026-11-21 |
| [design/research/51-delivery-and-capacity-research.md](design/research/51-delivery-and-capacity-research.md) | proposal | Delivery and capacity: what the sources say, what the app asks today, what is missing, and seven additions in priority order; not built. | 2026-11-21 |
| [design/research/55-beta-questionnaire.md](design/research/55-beta-questionnaire.md) | proposal | The Beta questionnaire: what the app would ask its Beta founders about the app, in sections, with the choices of each; nothing built. | 2026-11-21 |

## 8. The records (`design/records/`, documents 4 to 7)

The log of every change (4), what has not been done (5), and the generated catalogue record and structure tables (6, 7).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/records/04-log.md](design/records/04-log.md) | log | Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written. | 2026-11-21 |
| [design/records/05-not-done-yet.md](design/records/05-not-done-yet.md) | living list | What has not been done: the road, the plans, the requirements still open, the open decisions and the open points of the reviews. | 2026-11-21 |
| [design/records/06-catalogue-record.md](design/records/06-catalogue-record.md) | generated | The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes. | 2026-11-21 |
| [design/records/07-structure-tables.md](design/records/07-structure-tables.md) | generated | The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue. | 2026-11-21 |

## 9. The library (`design/library/`, documents 8 to 11 and 13 to 15)

The assets library, its generated lists, its logs, and the library measured against the app.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/library/08-library-system.md](design/library/08-library-system.md) | specification | The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built. | 2026-11-21 |
| [design/library/09-assets-library.md](design/library/09-assets-library.md) | generated | The assets library: every asset, its variants and its contract. | 2026-11-21 |
| [design/library/10-library-log.md](design/library/10-library-log.md) | log | The library log: every change to an asset of the library, newest on top. | 2026-11-21 |
| [design/library/11-app-structure-log.md](design/library/11-app-structure-log.md) | log | The app structure log: every change of the tables, that is of the structure of the app, newest on top. | 2026-11-21 |
| [design/library/13-components-list.md](design/library/13-components-list.md) | generated | The components, and which fields and cards use each. | 2026-11-21 |
| [design/library/14-fields-list.md](design/library/14-fields-list.md) | generated | The fields, the add buttons and the field names. | 2026-11-21 |
| [design/library/15-library-vs-app.md](design/library/15-library-vs-app.md) | generated | The library measured against the running app. | 2026-10-29 |

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
| [archive/reports/questionnaire-decisions-done-2026-11-21.md](archive/reports/questionnaire-decisions-done-2026-11-21.md) | archive | The rows of doc 28, section 13 (rebuilds, moves and decisions) that were built or superseded on 2026-11-21. | 2026-11-21 |
| [archive/reports/question-guide-review-2026-10-26.md](archive/reports/question-guide-review-2026-10-26.md) | archive | The question guide's review of 2026-10-26 (doc 29, sections 10 to 12): where each question stood, the conflicts decided and what was merged or deleted. | 2026-11-21 |
| [archive/plans/2026-10-14-cleanup-and-library-plans.md](archive/plans/2026-10-14-cleanup-and-library-plans.md) | archive | The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of document 5); what is left is in document 5. | 2026-11-21 |
| [archive/log/log-archive-2026-07-to-10.md](archive/log/log-archive-2026-07-to-10.md) | archive | Older rows of the log (document 4): sections 4.1 and 4.4 before 2026-11-01, and sections 4.2 (the drafts' versions) and 4.5 (the task plan F to K). | 2026-11-21 |
| [archive/log/log-archive-2026-11-01-to-07.md](archive/log/log-archive-2026-11-01-to-07.md) | archive | Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-01 to 2026-11-07. | 2026-11-11 |
| [archive/log/log-archive-2026-11-08-to-10.md](archive/log/log-archive-2026-11-08-to-10.md) | archive | Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-08 to 2026-11-10. | 2026-11-11 |
| [archive/log/log-archive-2026-11-11-to-17.md](archive/log/log-archive-2026-11-11-to-17.md) | archive | Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-11 to 2026-11-17. | 2026-11-21 |
| [archive/proposals/card-links.md](archive/proposals/card-links.md) | archive | Proposal: which partner and supplier groups each resource group could link to, and which partners, suppliers and resources could link to each activity group (formerly document 41; not built). | 2026-11-21 |
| [archive/proposals/cost-section-proposal.md](archive/proposals/cost-section-proposal.md) | archive | Proposal: what the Cost section should record (the page was built afterwards). | 2026-11-21 |
| [archive/proposals/competitor-and-value-proposition-2026-11-03.md](archive/proposals/competitor-and-value-proposition-2026-11-03.md) | archive | The Competitor card and the Value Proposition tile as proposed on 2026-11-03; what is built is doc 41 and doc 42. | 2026-11-21 |
| [archive/proposals/segment-questions-g-list-2026-10-23.md](archive/proposals/segment-questions-g-list-2026-10-23.md) | archive | The Segment card's earlier design (the G-list of 2026-10-23, ids G1 to G25); the questions as built are doc 35. | 2026-11-21 |
| [archive/proposals/segment-by-selection-proposal.md](archive/proposals/segment-by-selection-proposal.md) | archive | Proposal: building a Customer Segment by selection (not built). | 2026-11-21 |
| [archive/proposals/shared-workspace.md](archive/proposals/shared-workspace.md) | archive | Proposal: Shared Workspace, working together without a server (not built). | 2026-11-21 |

