# The documents of NorthStardustStudio

Status: **index**, updated 2026-10-21. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (`design/04-log.md`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (nothing built; in the archive), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **Where the code and a document disagree, the code is right** and the document is the one to fix. The checks that keep them honest: `npm run docs:check` (generated sections), `npm run tables:check`, `npm run library:check`, and the document-reference test (six documents name only properties, classes and files the code has).
- **This index is written by `npm run docs:index`** (the lists are in `tools/scripts/docs/write-index.mjs`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with `ai/README.md`; the owner starts with `design/05-not-done-yet.md` (what is open) and `design/04-log.md` (what changed).

## For the assistant and the rules (`ai/`)

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [ai/README.md](ai/README.md) | index | The map of this folder: what to read first, what to read for a task. | 2026-10-21 |
| [ai/ai-collaboration-rules.md](ai/ai-collaboration-rules.md) | rules | Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows. | 2026-10-21 |
| [ai/toolchain-and-verification-playbook.md](ai/toolchain-and-verification-playbook.md) | playbook | What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures. | 2026-10-22 |
| [ai/framework-dsl-grammar.md](ai/framework-dsl-grammar.md) | reference | Grammar of the Markdown that defines a System's content. | 2026-10-20 |
| [ai/framework-conventions-and-patterns.md](ai/framework-conventions-and-patterns.md) | reference | The architectural patterns and the data model of the framework. | 2026-10-20 |
| [ai/glossary.md](ai/glossary.md) | reference | One line per project term, with a pointer to where it is explained. | 2026-10-21 |
| [ai/review-criteria.md](ai/review-criteria.md) | rules | The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured, the report. | 2026-10-21 |
| [ai/review-checklist.md](ai/review-checklist.md) | rules | What to check when reviewing a table, tile, card, page or control, and the proof before saying done. | 2026-10-21 |
| [ai/code-map.md](ai/code-map.md) | reference | Where things are in src: the folders and what is in each; the rules for a new file. | 2026-10-21 |
| [ai/app-guide.md](ai/app-guide.md) | reference | Where each part of the app is, what it is for, with the code locations. | 2026-10-22 |
| [ai/layout-rules.md](ai/layout-rules.md) | rules | The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check. | 2026-10-21 |
| [ai/tile-and-card-pattern.md](ai/tile-and-card-pattern.md) | rules | How tiles, frames, cards, rails and dialogs are built; the global rules. | 2026-10-21 |
| [ai/card-kinds.md](ai/card-kinds.md) | reference | The kinds of card, where each one's code is, how its head is built. | 2026-10-22 |
| [ai/customer-engagement-layout.md](ai/customer-engagement-layout.md) | rules | Layout of the Customer Engagement tables, the channel resources and the action markers. | 2026-10-20 |
| [ai/outstanding-findings.md](ai/outstanding-findings.md) | living list | Confirmed problems found by diagnostic skills and not yet fixed. | 2026-10-21 |

## The design of the app (`design/`)

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [design/01-current-design.md](design/01-current-design.md) | current design | Every kind of element the Foundation capability is built from, by layer. | 2026-10-21 |
| [design/02-references.md](design/02-references.md) | reference | Every decision in the app and the source behind it. | 2026-10-14 |
| [design/03-research.md](design/03-research.md) | reference | The research record: sources, findings, how they were weighed. | 2026-10-14 |
| [design/04-log.md](design/04-log.md) | log | History, changes and updates, newest on top. Every change is written here, nowhere else. | 2026-10-22 |
| [design/05-not-done-yet.md](design/05-not-done-yet.md) | living list | The road, the plans and what has not been done yet. | 2026-10-22 |
| [design/06-catalogue-record.md](design/06-catalogue-record.md) | generated | The catalogue record of the app's pages, fields and cards. | 2026-10-15 |
| [design/07-structure-tables.md](design/07-structure-tables.md) | generated | The structure tables (npm run tables). | 2026-10-18 |
| [design/08-library-system.md](design/08-library-system.md) | current design | The library system: tables, library, inventory and logs. | 2026-10-21 |
| [design/09-assets-library.md](design/09-assets-library.md) | generated | The assets library: every asset, its variants and contract. | 2026-10-17 |
| [design/10-library-log.md](design/10-library-log.md) | log | The library log, newest rows on top (npm run library:log). | 2026-10-21 |
| [design/11-library-log-archive.md](design/11-library-log-archive.md) | archive | Older rows of the library log. | 2026-10-21 |
| [design/12-app-structure-log.md](design/12-app-structure-log.md) | log | The app structure log. | 2026-10-21 |
| [design/13-component-defaults.md](design/13-component-defaults.md) | generated | Component defaults. | 2026-10-17 |
| [design/14-components-list.md](design/14-components-list.md) | generated | The components, and which fields and cards use each. | 2026-10-21 |
| [design/15-fields-list.md](design/15-fields-list.md) | generated | The fields, the add buttons and the field names. | 2026-10-21 |
| [design/16-library-vs-app.md](design/16-library-vs-app.md) | reference | The library measured against the app. | 2026-10-21 |
| [design/17-text-holders.md](design/17-text-holders.md) | current design | The text holders: sizes and rules. | 2026-10-21 |
| [design/18-frequency-options.md](design/18-frequency-options.md) | current design | The Frequency options by group, and the open proposals. | 2026-10-21 |
| [design/19-reactions.md](design/19-reactions.md) | current design | How elements react to the pointer and the keyboard. | 2026-10-21 |
| [design/20-text-links.md](design/20-text-links.md) | current design | The text link: look and behaviour. | 2026-10-21 |
| [design/21-free-text-categories.md](design/21-free-text-categories.md) | current design | Free texts in four categories. | 2026-10-21 |
| [design/22-shared-components.md](design/22-shared-components.md) | current design | Which components are shared, with their props, what is still hand-made, and a short history. | 2026-10-21 |
| [design/23-help-texts.md](design/23-help-texts.md) | current design | The help texts of the app. | 2026-10-21 |
| [design/24-popups.md](design/24-popups.md) | current design | Pop-ups in six categories, with their placement rules. | 2026-10-21 |
| [design/25-tooltips.md](design/25-tooltips.md) | current design | Which controls have a tooltip, what it says, and the five rules. | 2026-10-21 |
| [design/26-folder-plan.md](design/26-folder-plan.md) | proposal | The app files, the examples and the working files: what is where, and a three-step plan to separate them. | 2026-10-22 |

## The specifications (`specifications/`)

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [specifications/business-system/README.md](specifications/business-system/README.md) | specification | The Business System: index of the pages and the editor mapping. | 2026-10-20 |
| [specifications/business-system/page-1-foundation.md](specifications/business-system/page-1-foundation.md) | specification | Page 1: Foundation. | 2026-10-20 |
| [specifications/business-system/page-2-section-1-channels.md](specifications/business-system/page-2-section-1-channels.md) | specification | Page 2, section 1: the channels. | 2026-10-20 |
| [specifications/business-system/page-2-section-2-customer-relationships.md](specifications/business-system/page-2-section-2-customer-relationships.md) | specification | Page 2, section 2: customer relationships. | 2026-10-20 |
| [specifications/business-system/page-2-section-2-customer-relationships-worked-example.md](specifications/business-system/page-2-section-2-customer-relationships-worked-example.md) | specification | A worked example of the customer relationships section. | 2026-10-20 |
| [specifications/business-system/page-3-infrastructure-and-capability.md](specifications/business-system/page-3-infrastructure-and-capability.md) | specification | Page 3: Infrastructure and Capability. | 2026-10-21 |
| [specifications/business-system/page-4-financial-foundation.md](specifications/business-system/page-4-financial-foundation.md) | specification | Page 4: Financial Foundation. | 2026-10-20 |
| [specifications/business-system/page-5-financial-sustainability.md](specifications/business-system/page-5-financial-sustainability.md) | specification | Page 5: Financial Sustainability. | 2026-10-20 |

## Examples and archive

| Document | Kind | What it holds | Updated |
|---|---|---|---|
| [archive/engineering-phase-completion.md](archive/engineering-phase-completion.md) | archive | The engineering phase completion report. | 2026-10-20 |
| [archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md](archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md) | archive | Brief: workspace features D, duplicate, scenarios, compare (not started). | 2026-10-20 |
| [archive/plans/2026-09-29-workspace-E-founder-helpers.md](archive/plans/2026-09-29-workspace-E-founder-helpers.md) | archive | Brief: workspace features E, helpers for founders (not started). | 2026-10-20 |
| [archive/plans/2026-10-14-cleanup-and-library-plans.md](archive/plans/2026-10-14-cleanup-and-library-plans.md) | archive | The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of document 5); what is left is in document 5. | 2026-10-21 |
| [archive/proposals/cost-section-proposal.md](archive/proposals/cost-section-proposal.md) | archive | Proposal: what the Cost section should record (the page was built afterwards). | 2026-10-21 |
| [archive/proposals/segment-by-selection-proposal.md](archive/proposals/segment-by-selection-proposal.md) | archive | Proposal: building a Customer Segment by selection (not built). | 2026-10-21 |
| [archive/proposals/shared-workspace.md](archive/proposals/shared-workspace.md) | archive | Proposal: Shared Workspace, working together without a server (not built). | 2026-10-21 |
