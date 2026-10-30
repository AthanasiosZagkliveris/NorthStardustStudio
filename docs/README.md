# The documents of NorthStardustStudio

Status: **index**, updated 2026-10-30. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (`design/core/04-log.md`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (nothing built; in the archive), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); `npm run docs:standard` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the code is right** and the document is the one to fix. The checks that keep them honest: `npm run docs:check` (generated sections), `npm run tables:check`, `npm run library:check`, and the document-reference test (six documents name only properties, classes and files the code has).
- **This index is written by `npm run docs:index`** (the lists are in `tools/scripts/docs/write-index.mjs`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with `ai/README.md`; the owner starts with `app/contents.md` (the map), `design/core/05-not-done-yet.md` (what is open) and `design/core/04-log.md` (what changed).

## Contents

1. [The standard of the documents](#1-the-standard-of-the-documents)
2. [The app](#2-the-app-app)
3. [The design and its records (`design/core/`, documents 1 to 7)](#3-the-design-and-its-records-designcore-documents-1-to-7)
4. [The library (`design/library/`, documents 8 to 15)](#4-the-library-designlibrary-documents-8-to-15)
5. [The current design (`design/current/`, documents 16 to 26)](#5-the-current-design-designcurrent-documents-16-to-26)
6. [The first version and the questionnaire (`design/questionnaire/`, documents 27 to 35)](#6-the-first-version-and-the-questionnaire-designquestionnaire-documents-27-to-35)
7. [Rules for the assistant](#7-rules-for-the-assistant-ai)
8. [The specifications](#8-the-specifications-specifications)
9. [The archive](#9-the-archive-archive)

The documents are numbered in the order of the chapters (the number is in the file name and the title, and it is how they cite one another: "doc 28"). The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).

## 1. The standard of the documents

How the documents are numbered, headed and written.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [standard.md](standard.md) | rules | The standard of the documents: where a document goes, how it is numbered, the head every document has, the kinds, how a document is written, and how to add one. | 2026-10-29 |

## 2. The app (`app/`)

How the app is entered, its Systems and pages, the places in it, and the terms.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [app/contents.md](app/contents.md) | contents | The contents of the app: how it is entered, the Systems and pages, where the figures and dates come from, where things are in the code. | 2026-10-29 |
| [app/index.md](app/index.md) | index | An alphabetical index of the places in the app (pages, tiles, cards, the header): where each is, and which document describes it. | 2026-10-29 |
| [app/glossary.md](app/glossary.md) | reference | One line per term: the framework, the app, the business stage, positioning, buyer and user, the question ids, the documents. | 2026-10-30 |

## 3. The design and its records (`design/core/`, documents 1 to 7)

The current design of the Foundation, the sources, the research, the log of every change, what has not been done, and the generated catalogue and structure tables.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/core/01-current-design.md](design/core/01-current-design.md) | current design | The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map. | 2026-10-29 |
| [design/core/02-references.md](design/core/02-references.md) | reference | The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it. | 2026-10-29 |
| [design/core/03-research.md](design/core/03-research.md) | research | The research behind the design decisions: the question, the recommendation, the reason and the source. Document 1 prevails where they differ. | 2026-10-29 |
| [design/core/04-log.md](design/core/04-log.md) | log | Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written. | 2026-10-30 |
| [design/core/05-not-done-yet.md](design/core/05-not-done-yet.md) | living list | What has not been done: the road, the plans, the requirements still open, the open decisions and the open points of the reviews. | 2026-10-30 |
| [design/core/06-catalogue-record.md](design/core/06-catalogue-record.md) | generated | The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes. | 2026-10-29 |
| [design/core/07-structure-tables.md](design/core/07-structure-tables.md) | generated | The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue. | 2026-10-29 |

## 4. The library (`design/library/`, documents 8 to 15)

The assets library, its generated lists, its logs, and the library measured against the app.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/library/08-library-system.md](design/library/08-library-system.md) | specification | The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built. | 2026-10-29 |
| [design/library/09-assets-library.md](design/library/09-assets-library.md) | generated | The assets library: every asset, its variants and its contract. | 2026-10-29 |
| [design/library/10-library-log.md](design/library/10-library-log.md) | log | The library log: every change to an asset of the library, newest on top. | 2026-10-29 |
| [design/library/11-app-structure-log.md](design/library/11-app-structure-log.md) | log | The app structure log: every change of the tables, that is of the structure of the app, newest on top. | 2026-10-29 |
| [design/library/12-component-defaults.md](design/library/12-component-defaults.md) | generated | The default of each component: the reference sizes and the criteria. | 2026-10-29 |
| [design/library/13-components-list.md](design/library/13-components-list.md) | generated | The components, and which fields and cards use each. | 2026-10-29 |
| [design/library/14-fields-list.md](design/library/14-fields-list.md) | generated | The fields, the add buttons and the field names. | 2026-10-29 |
| [design/library/15-library-vs-app.md](design/library/15-library-vs-app.md) | generated | The library measured against the running app. | 2026-10-29 |

## 5. The current design (`design/current/`, documents 16 to 26)

What the app is today in detail: the texts, the reactions, the shared components, the pop-ups, the tooltips, the folders and the card structure.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/current/16-text-holders.md](design/current/16-text-holders.md) | generated | The text holders: sizes, style classes and rules. | 2026-10-29 |
| [design/current/17-frequency-options.md](design/current/17-frequency-options.md) | generated | The Frequency options by group, compared with the code. | 2026-10-29 |
| [design/current/18-reactions.md](design/current/18-reactions.md) | current design | How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup. | 2026-10-30 |
| [design/current/19-text-links.md](design/current/19-text-links.md) | generated | The text link: look and behaviour, from the code and the walk of the app. | 2026-10-29 |
| [design/current/20-free-text-categories.md](design/current/20-free-text-categories.md) | current design | Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build. | 2026-10-29 |
| [design/current/21-shared-components.md](design/current/21-shared-components.md) | current design | Which components are shared, with their props, and what is still hand-made. | 2026-10-29 |
| [design/current/22-help-texts.md](design/current/22-help-texts.md) | generated | The help texts of the app, from the walk of the running app. | 2026-10-29 |
| [design/current/23-popups.md](design/current/23-popups.md) | current design | Pop-ups in six categories, with their placement rules and the order of fallbacks. | 2026-10-29 |
| [design/current/24-tooltips.md](design/current/24-tooltips.md) | current design | Which controls have a tooltip, what it says, its look and its rules. This document owns the tip. | 2026-10-29 |
| [design/current/25-folder-plan.md](design/current/25-folder-plan.md) | current design | The folders of the repository: the app files, the examples, the working files and the exports, and the documents folder. | 2026-10-29 |
| [design/current/26-card-structure.md](design/current/26-card-structure.md) | current design | Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it. | 2026-10-29 |

## 6. The first version and the questionnaire (`design/questionnaire/`, documents 27 to 35)

What the first published version contains (read 33 first; it governs), what it leaves for later (34), and the questions, the lists and the research behind them. Reading order: 33, 34, then 27 (the plan), 28 (every question and rule), 29 (the flow), 35 (the lists and classifications), 31 and 32 (the positioning decisions and their sources), 30 (age limits).

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/questionnaire/27-questionnaire-plan.md](design/questionnaire/27-questionnaire-plan.md) | proposal | The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut. | 2026-10-29 |
| [design/questionnaire/28-questionnaire-specification.md](design/questionnaire/28-questionnaire-specification.md) | proposal | The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence. | 2026-10-30 |
| [design/questionnaire/29-question-guide.md](design/questionnaire/29-question-guide.md) | proposal | The question guide: the flow of the questions as trees, the key branches and how a question earns its place. | 2026-10-30 |
| [design/questionnaire/30-age-limits-by-activity.md](design/questionnaire/30-age-limits-by-activity.md) | research | Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status. | 2026-10-29 |
| [design/questionnaire/31-positioning-categories.md](design/questionnaire/31-positioning-categories.md) | collection | The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables. | 2026-10-30 |
| [design/questionnaire/32-positioning-sources.md](design/questionnaire/32-positioning-sources.md) | research | The sources behind each positioning list of doc 31, what has none, and the pages checked. | 2026-10-29 |
| [design/questionnaire/33-specs-and-limitations.md](design/questionnaire/33-specs-and-limitations.md) | specification | The first published version: language, countries, legal forms, market structure, relationships, buyer and user, ages. It governs the other questionnaire documents. | 2026-10-30 |
| [design/questionnaire/34-future-features.md](design/questionnaire/34-future-features.md) | living list | Everything that is not in the first published version: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do. | 2026-10-30 |
| [design/questionnaire/35-lists-and-classifications.md](design/questionnaire/35-lists-and-classifications.md) | proposal | The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification). | 2026-10-29 |

## 7. Rules for the assistant (`ai/`)

Standing rules, references and playbooks for an AI assistant working on the project.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [ai/README.md](ai/README.md) | index | The map of this folder: what to read first, what to read for a task. | 2026-10-29 |
| [ai/ai-collaboration-rules.md](ai/ai-collaboration-rules.md) | rules | Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows. | 2026-10-29 |
| [ai/toolchain-and-verification-playbook.md](ai/toolchain-and-verification-playbook.md) | playbook | What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures. | 2026-10-29 |
| [ai/framework-dsl-grammar.md](ai/framework-dsl-grammar.md) | reference | Grammar of the Markdown that defines a System's content. | 2026-10-29 |
| [ai/framework-conventions-and-patterns.md](ai/framework-conventions-and-patterns.md) | reference | The architectural patterns and the data model of the framework. | 2026-10-29 |
| [ai/review-criteria.md](ai/review-criteria.md) | rules | The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured, the report. | 2026-10-29 |
| [ai/review-checklist.md](ai/review-checklist.md) | rules | What to check when reviewing a table, tile, card, page or control, and the proof before saying done. | 2026-10-29 |
| [ai/code-map.md](ai/code-map.md) | reference | Where things are in src: the folders and what is in each; the rules for a new file. | 2026-10-29 |
| [ai/layout-rules.md](ai/layout-rules.md) | rules | The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check. | 2026-10-30 |
| [ai/tile-and-card-pattern.md](ai/tile-and-card-pattern.md) | rules | How tiles, frames, cards, rails and dialogs are built; the global rules. | 2026-10-29 |
| [ai/card-kinds.md](ai/card-kinds.md) | reference | The kinds of card, where each one's code is, how its head is built. | 2026-10-29 |
| [ai/customer-engagement-layout.md](ai/customer-engagement-layout.md) | rules | Layout of the Customer Engagement tables, the channel resources and the action markers. | 2026-10-29 |
| [ai/outstanding-findings.md](ai/outstanding-findings.md) | living list | Confirmed problems found by diagnostic skills and not yet fixed. | 2026-10-29 |

## 8. The specifications (`specifications/`)

The pages of the Business System.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [specifications/business-system/README.md](specifications/business-system/README.md) | specification | The Business System: index of the pages and the editor mapping. | 2026-10-29 |
| [specifications/business-system/page-1-foundation.md](specifications/business-system/page-1-foundation.md) | specification | Page 1: Foundation. | 2026-10-29 |
| [specifications/business-system/page-2-section-1-channels.md](specifications/business-system/page-2-section-1-channels.md) | specification | Page 2, section 1: the channels. | 2026-10-29 |
| [specifications/business-system/page-2-section-2-customer-relationships.md](specifications/business-system/page-2-section-2-customer-relationships.md) | specification | Page 2, section 2: customer relationships. | 2026-10-29 |
| [specifications/business-system/page-2-section-2-customer-relationships-worked-example.md](specifications/business-system/page-2-section-2-customer-relationships-worked-example.md) | specification | A worked example of the customer relationships section. | 2026-10-29 |
| [specifications/business-system/page-3-infrastructure-and-capability.md](specifications/business-system/page-3-infrastructure-and-capability.md) | specification | Page 3: Infrastructure and Capability. | 2026-10-29 |
| [specifications/business-system/page-4-financial-foundation.md](specifications/business-system/page-4-financial-foundation.md) | specification | Page 4: Financial Foundation. | 2026-10-29 |
| [specifications/business-system/page-5-financial-sustainability.md](specifications/business-system/page-5-financial-sustainability.md) | specification | Page 5: Financial Sustainability. | 2026-10-29 |

## 9. The archive (`archive/`)

Documents that are finished or replaced; each is kept for its information.

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [archive/library/library-log-archive.md](archive/library/library-log-archive.md) | archive | Older rows of the library log. | 2026-10-29 |
| [archive/engineering-phase-completion.md](archive/engineering-phase-completion.md) | archive | The engineering phase completion report. | 2026-10-29 |
| [archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md](archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md) | archive | Brief: workspace features D, duplicate, scenarios, compare (not started). | 2026-10-29 |
| [archive/plans/2026-09-29-workspace-E-founder-helpers.md](archive/plans/2026-09-29-workspace-E-founder-helpers.md) | archive | Brief: workspace features E, helpers for founders (not started). | 2026-10-29 |
| [archive/plans/2026-10-14-cleanup-and-library-plans.md](archive/plans/2026-10-14-cleanup-and-library-plans.md) | archive | The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of document 5); what is left is in document 5. | 2026-10-29 |
| [archive/proposals/cost-section-proposal.md](archive/proposals/cost-section-proposal.md) | archive | Proposal: what the Cost section should record (the page was built afterwards). | 2026-10-29 |
| [archive/proposals/segment-by-selection-proposal.md](archive/proposals/segment-by-selection-proposal.md) | archive | Proposal: building a Customer Segment by selection (not built). | 2026-10-29 |
| [archive/proposals/shared-workspace.md](archive/proposals/shared-workspace.md) | archive | Proposal: Shared Workspace, working together without a server (not built). | 2026-10-29 |

