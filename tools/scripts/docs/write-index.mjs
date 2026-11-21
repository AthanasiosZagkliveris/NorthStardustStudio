/* Writes docs/README.md: one line per document (kind, what it holds, the date of its last commit). Run: npm run docs:index. A new document is added to the lists below. */
import { writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const R = fileURLToPath(new URL("../../../", import.meta.url));
const git = (args) => execSync("git " + args, { cwd: R, encoding: "utf8" }).trim();
const date = (p) => git('log -1 --format=%cs -- "' + p + '"') || new Date().toISOString().slice(0, 10);

// [path, kind, what it is, addHeader]
const STANDARD = [
  ["docs/standard.md", "rules", "The standard of the documents: where a document goes, how it is numbered, the head every document has, the kinds, how a document is written, and how to add one.", true]
];
const APP = [
  ["docs/app/contents.md", "contents", "The contents of the app: how it is entered, the Systems and pages, where the figures and dates come from, where things are in the code.", true],
  ["docs/app/index.md", "index", "An alphabetical index of the places in the app (pages, tiles, cards, the header): where each is, and which document describes it.", true],
  ["docs/app/glossary.md", "reference", "One line per term: the framework, the app, the business stage, positioning, buyer and user, the question ids, the documents.", true],
];
const GUIDE = [
  ["docs/guide/user-guide.md", "playbook", "The user guide: how a founder uses the app step by step: the Organisations screen, the Foundation with its Identity and Business Systems, and the tools (Workbook, Notes, Search, Settings, Focus, the reading modes, the Calendar).", true],
  ["docs/guide/overview-and-future-features.md", "reference", "The app: what it is, where its guide and specifications are, how its answers connect, and its future features (an AI Assistant, Team working mode, Voice mode, more languages and countries), from online research.", true]
];
const AI = [
  ["docs/ai/README.md", "index", "The map of this folder: what to read first, what to read for a task.", false],
  ["docs/ai/ai-collaboration-rules.md", "rules", "Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows.", true],
  ["docs/ai/toolchain-and-verification-playbook.md", "playbook", "What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures.", true],
  ["docs/ai/framework-dsl-grammar.md", "reference", "Grammar of the Markdown that defines a System's content.", true],
  ["docs/ai/framework-conventions-and-patterns.md", "reference", "The architectural patterns and the data model of the framework.", true],
  ["docs/ai/review.md", "rules", "The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured and the report (sections 1 to 12), and the checklist to tick before saying done (section 13).", true],
  ["docs/ai/code-map.md", "reference", "Where things are in src: the folders and what is in each; the rules for a new file.", true],
  ["docs/ai/layout-rules.md", "rules", "The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check.", false],
  ["docs/ai/card-kinds.md", "reference", "The kinds of card, where each one's code is, how its head is built.", true],
  ["docs/ai/folder-plan.md", "reference", "The folders of the repository: the app files, the examples, the working files and the exports, and the documents folder (it was document 25; the number is retired).", true]
];
const DESIGN = [
  ["docs/design/foundation/01-current-design.md", "current design", "The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map.", false],
  ["docs/design/research/02-references.md", "reference", "The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it.", false],
  ["docs/design/research/03-research.md", "research", "The research behind the design decisions: the question, the recommendation, the reason and the source. Document 1 prevails where they differ.", false],
  ["docs/design/records/04-log.md", "log", "Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written.", false],
  ["docs/design/records/05-not-done-yet.md", "living list", "What has not been done: the road, the plans, the requirements still open, the open decisions and the open points of the reviews.", false],
  ["docs/design/records/06-catalogue-record.md", "generated", "The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes.", false],
  ["docs/design/records/07-structure-tables.md", "generated", "The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue.", false],
  ["docs/design/library/08-library-system.md", "specification", "The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built.", false],
  ["docs/design/library/09-assets-library.md", "generated", "The assets library: every asset, its variants and its contract.", false],
  ["docs/design/library/10-library-log.md", "log", "The library log: every change to an asset of the library, newest on top.", false],
  ["docs/archive/log/library-log-archive.md", "archive", "Older rows of the library log.", false],
  ["docs/design/library/11-app-structure-log.md", "log", "The app structure log: every change of the tables, that is of the structure of the app, newest on top.", false],
  ["docs/design/library/13-components-list.md", "generated", "The components, and which fields and cards use each.", false],
  ["docs/design/library/14-fields-list.md", "generated", "The fields, the add buttons and the field names.", false],
  ["docs/design/library/15-library-vs-app.md", "generated", "The library measured against the running app.", false],
  ["docs/design/interface/16-text-holders.md", "generated", "The text holders: sizes, style classes and rules.", true],
  ["docs/design/interface/17-frequency-options.md", "generated", "The Frequency options by group, compared with the code.", true],
  ["docs/design/interface/18-reactions.md", "current design", "How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup.", true],
  ["docs/design/interface/19-text-links.md", "generated", "The text link: look and behaviour, from the code and the walk of the app.", true],
  ["docs/design/interface/20-free-text-categories.md", "current design", "Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build.", true],
  ["docs/design/interface/21-shared-components.md", "current design", "Which components are shared, with their props, and what is still hand-made.", false],
  ["docs/design/interface/22-help-texts.md", "generated", "The help texts of the app, from the walk of the running app.", true],
  ["docs/design/interface/23-popups.md", "current design", "Pop-ups in six categories, with their placement rules and the order of fallbacks.", true],
  ["docs/design/interface/24-tooltips.md", "current design", "Which controls have a tooltip, what it says, its look and its rules. This document owns the tip.", true],
  ["docs/design/questions/27-questionnaire-plan.md", "proposal", "The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut, the order of work for docs 45 to 49 (section 10), and the form of a tile document with where each tile stands (section 11).", true],
  ["docs/design/questions/28-questionnaire-specification.md", "proposal", "The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence.", true],
  ["docs/design/questions/29-question-guide.md", "proposal", "The question guide: the flow of the questions as trees, the key branches and how a question earns its place.", true],
  ["docs/design/research/30-age-limits-by-activity.md", "research", "Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status.", true],
  ["docs/design/research/31-positioning-categories.md", "collection", "The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables.", true],
  ["docs/design/research/32-positioning-sources.md", "research", "The sources behind each positioning list of doc 31, what has none, and the pages checked.", true],
  ["docs/design/questions/33-specs-and-limitations.md", "specification", "The first published version (language, countries, legal forms, market structure, relationships, buyer and user, ages; it governs the other questionnaire documents, sections 1 to 9) and everything left for later (sections 10 to 15: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do).", true],
  ["docs/design/research/34-lists-and-classifications.md", "proposal", "The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification).", true],
  ["docs/design/foundation/26-card-structure.md", "current design", "Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it.", true],
  ["docs/design/questions/35-segment-questions.md", "specification", "The Segment card's questions as built: every question and option in order, when it is asked, what its help says and what it comes from and is read by.", true],
  ["docs/design/questions/36-profile-questions.md", "specification", "The Profile card's questions, built in part: every question and option in order (the specialised needs and the kind of business are not built yet), when it is asked, the starting values, the help, and the layout of the card.", true],
  ["docs/design/questions/37-organization-fields.md", "specification", "The Organisation tile's fields as built: control, when asked, options, the help and the connections.", true],
  ["docs/design/questions/38-positioning-questions.md", "specification", "The Positioning tile's questions as built, by stage: control, limits, options, the help and the connections.", true],
  ["docs/design/interface/39-help-texts-guide.md", "specification", "What a help text says: the analysis of the 159 help texts and a proposed structure per place and field, standard phrases, size budgets and a check.", true],
  ["docs/design/questions/41-competitor-questions.md", "specification", "The Competitor card: every question and option, as built (K1 to K10, in the card's order, by the competitor's type).", true],
  ["docs/design/questions/42-value-proposition-questions.md", "specification", "The Value Proposition tile: what it asks, the draft sentence it writes and the open items it lists, built in part.", true],
  ["docs/design/questions/43-offering-questions.md", "specification", "The Offering card: every question and option (O1 to O18), built in part.", true],
  ["docs/design/questions/44-questions-register.md", "generated", "The questions register: every question of the Foundation's cards by card and position, with its permanent code, saved id, control, limit, when it is asked, its start, options and \"i\", and the retired codes; generated from the code.", false],
  ["docs/design/questions/45-purpose-and-beliefs-questions.md", "specification", "Purpose & Beliefs: the Identity System's Mission, Vision, Values, Principles, Philosophy and Manifesto as three pair tiles, each text with its guiding questions, control, length, \"i\" and connections (codes PB1 to PB6), built with the owner's decisions (section 6).", true],
  ["docs/design/questions/46-ambassador-questions.md", "specification", "The Ambassador: the Brand System's four tiles with their choices BA1 to BA4 and BA6 to BA9, the drafts and the Style suggestions; built in part (the Style suggestions are still to build).", true],
  ["docs/design/questions/47-customer-engagement-tiles.md", "specification", "Customer Engagement as the Engagement subchapter of each Segment's chapter, its Master Tiles, the Offering's four faces and the journey rebuild; built in part (the journey rebuild is still to build).", true],
  ["docs/design/questions/48-financials-and-inventory.md", "specification", "The page Financials as one chapter of Master Tiles, the Offering Economics card, the questions RV1 and FN1, and the Inventory's changes IN1 to IN5; built in part (the questions and the Offering Economics card are still to build).", true],
  ["docs/design/questions/49-strategy-questions.md", "specification", "Strategy: SW1, the SWOT suggestions, SC1 to SC3 and the Compass draft, Themes, Goals and Metrics linked to the plan; built in part (SW1, SC1 to SC3 and the Compass draft).", true],
  ["docs/design/questions/50-channel-fees-and-sales-forecast.md", "specification", "Channel fees on Customer Engagement (the read-only Fees on a subchannel, the UK rows) and what Sales Forecast adds (Tried it, the time to buy, the market-size check); built.", true],
  ["docs/design/research/51-delivery-and-capacity-research.md", "proposal", "Delivery and capacity: what the sources say, what the app asks today, what is missing, and seven additions in priority order; not built.", true],
  ["docs/design/questions/52-capacity-and-delivery-tile.md", "specification", "Capacity & Delivery: the Delivery tile renamed, doc 51's seven additions on the Delivery card (DV1 to DV13), the dialog and Sustainability's check, the Lumen Workshops through the Online Store, and the decisions; built in part (Sustainability's check, section 5, is still to build).", true],
  ["docs/design/questions/53-legal-starts.md", "proposal", "Legal starts: the registrations, taxes and legal expenses the Legal Entity can start from Definition and the Business pages, by country, each with its official source; the eight decisions; stages 1 to 4 built (section 6).", true],
  ["docs/design/questions/54-auto-filled-answers.md", "reference", "Auto-filled answers: every answer the app drafts, starts, offers or works out from an earlier one (about 120): the field, the kind, its sources, the code and the document that describes it.", true],
  ["docs/design/research/55-beta-questionnaire.md", "proposal", "The Beta questionnaire: what the app would ask its Beta founders about the app, in sections, with the choices of each; nothing built.", true]
];
const chapter = (name) => DESIGN.filter(([p]) => p.startsWith("docs/design/" + name + "/"));
const FOUNDATION = chapter("foundation"), INTERFACE = chapter("interface"), QUESTIONS = chapter("questions"), RESEARCH = chapter("research"), RECORDS = chapter("records"), LIBRARY = chapter("library");
// A number whose document left the design chapters stays unused: the numbers are permanent ids (docs/standard.md, section 1).
const RETIRED = [[12, "docs/design/library/09-assets-library.md"], [25, "docs/ai/folder-plan.md"], [40, "docs/design/questions/27-questionnaire-plan.md"]];
const ARCHIVED_DESIGN = DESIGN.filter(([p]) => p.startsWith("docs/archive/"));
const SPEC = [
  ["docs/specifications/identity-system/page-1-definition.md", "current design", "1. Identity System, 1. Definition: the master tile with its four tiles (Organisation, Early Positioning, Mission, Vision), its layout, reactions and readers, and the extra information that is neither built nor a future feature.", true],
  ["docs/specifications/brand-system/page-1-brand.md", "current design", "2. Brand System: the one page, its two chapters and their tiles, what each asks, reads and writes, and the rules it follows.", true],
  ["docs/specifications/business-system/README.md", "index", "The Business System: its five sections on three pages, the file, editor and data module of each, and what crosses between the pages.", true],
  ["docs/specifications/business-system/page-1-foundation.md", "specification", "Page 1, Foundation & Engagement, Section 1: the Foundation.", true],
  ["docs/specifications/business-system/page-1-channels.md", "specification", "Page 1, Foundation & Engagement, Section 2, part 1: the channels.", true],
  ["docs/specifications/business-system/page-1-customer-relationships.md", "specification", "Page 1, Foundation & Engagement, Section 2, part 2: customer relationships (section 18 holds a worked example and the column rules).", true],
  ["docs/specifications/business-system/page-2-infrastructure-and-capability.md", "specification", "Page 2, Section 3: Infrastructure & Capability.", true],
  ["docs/specifications/business-system/page-3-revenue-and-pricing.md", "specification", "Section 4: Revenue & Pricing, drawn on the page Financials.", true],
  ["docs/specifications/business-system/page-3-costs-funding-and-position.md", "specification", "Section 5: Costs, Funding & Position, drawn on the page Financials.", true],
  ["docs/specifications/inventory/README.md", "current design", "The Inventory: the help tile of Infrastructure & Capability that holds every card of the page, as tiles or a table, under one funnel.", true],
  ["docs/specifications/strategy-system/page-1-situation-and-direction.md", "current design", "4. Strategy System, Situation & Direction: the four Master Tiles, the cards of the Strategic Period, what the page reads and writes, and the rules it follows.", true],
  ["docs/specifications/workbook/README.md", "current design", "The Workbook: the page drawn as a dialog, and each of its sections: Business Documents, Financial Documents, Review, References and Glossary, Card Notes.", true],
  ["docs/specifications/settings/README.md", "specification", "Settings: the Global Settings screen (how it is drawn and the rule each part follows), the reading mode (Appearance) and Focus, all three in the header's Menu.", true],
];
const PROPOSALS = [
  ["docs/proposals/workspace-d-duplicate-scenarios-compare.md", "proposal", "Workspace features D, not started: duplicate an Organisation or a card, financial scenarios, compare.", true],
  ["docs/proposals/workspace-e-founder-helpers.md", "proposal", "Workspace features E, not started: helpers for founders (what would it take, the lender-ready check, the one-pager, glossary hints).", true]
];
const ARCHIVE = [
  ["docs/engineering-phase-completion.md", "docs/archive/reports/engineering-phase-completion.md", "archive", "The engineering phase completion report."],
  ["docs/design/questions/28-questionnaire-specification.md", "docs/archive/reports/questionnaire-decisions-done-2026-11-21.md", "archive", "The rows of doc 28, section 13 (rebuilds, moves and decisions) that were built or superseded on 2026-11-21."],
  ["docs/design/questions/29-question-guide.md", "docs/archive/reports/question-guide-review-2026-10-26.md", "archive", "The question guide's review of 2026-10-26 (doc 29, sections 10 to 12): where each question stood, the conflicts decided and what was merged or deleted."],
  ["docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "archive", "The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of document 5); what is left is in document 5."],
  ["docs/archive/log/log-archive-2026-07-to-10.md", "docs/archive/log/log-archive-2026-07-to-10.md", "archive", "Older rows of the log (document 4): sections 4.1 and 4.4 before 2026-11-01, and sections 4.2 (the drafts' versions) and 4.5 (the task plan F to K)."],
  ["docs/archive/log/log-archive-2026-11-01-to-07.md", "docs/archive/log/log-archive-2026-11-01-to-07.md", "archive", "Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-01 to 2026-11-07."],
  ["docs/archive/log/log-archive-2026-11-08-to-10.md", "docs/archive/log/log-archive-2026-11-08-to-10.md", "archive", "Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-08 to 2026-11-10."],
  ["docs/archive/log/log-archive-2026-11-11-to-17.md", "docs/archive/log/log-archive-2026-11-11-to-17.md", "archive", "Older rows of the log (document 4): sections 4.1 and 4.4 from 2026-11-11 to 2026-11-17."],
  ["docs/archive/proposals/card-links.md", "docs/archive/proposals/card-links.md", "archive", "Proposal: which partner and supplier groups each resource group could link to, and which partners, suppliers and resources could link to each activity group (formerly document 41; not built)."],
  ["docs/archive/proposals/cost-section-proposal.md", "docs/archive/proposals/cost-section-proposal.md", "archive", "Proposal: what the Cost section should record (the page was built afterwards)."],
  ["docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md", "docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md", "archive", "The Competitor card and the Value Proposition tile as proposed on 2026-11-03; what is built is doc 41 and doc 42."],
  ["docs/archive/proposals/segment-questions-g-list-2026-10-23.md", "docs/archive/proposals/segment-questions-g-list-2026-10-23.md", "archive", "The Segment card's earlier design (the G-list of 2026-10-23, ids G1 to G25); the questions as built are doc 35."],
  ["docs/archive/proposals/segment-by-selection-proposal.md", "docs/archive/proposals/segment-by-selection-proposal.md", "archive", "Proposal: building a Customer Segment by selection (not built)."],
  ["docs/archive/proposals/shared-workspace.md", "docs/archive/proposals/shared-workspace.md", "archive", "Proposal: Shared Workspace, working together without a server (not built)."]
];

// 3. the index
const row = ([p, kind, what]) => "| [" + p.replace(/^docs\//, "") + "](" + p.replace(/^docs\//, "") + ") | " + kind + " | " + what + " | " + date(p) + " |";
const ar = ARCHIVE.map(([, to, kind, what]) => [to, kind, what]);
const table = (list) => "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + list.map(row).join("\n") + "\n";

const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 _-]/g, "").replace(/ /g, "-");
const archiveRows = [...ARCHIVED_DESIGN.map(([p, k, w]) => [p, k, w]), ...ar];
const CHAPTERS = [
  ["The standard of the documents", "How the documents are numbered, headed and written.", STANDARD],
  ["The app (`app/`)", "How the app is entered, its Systems and pages, the places in it, and the terms.", APP],
  ["The user guide (`guide/`)", "How a founder uses the app, step by step, and an overview of the app, its specifications and its future features.", GUIDE],
  ["The design of the Foundation (`design/foundation/`, documents 1 and 26)", "The single description of the Foundation capability (document 1) and its Part F, the card structure (document 26), from which the structure tables and the catalogue record are generated.", FOUNDATION],
  ["The interface (`design/interface/`, documents 16 to 24 and 39)", "What every screen shares: the text holders, the Frequency options, the reactions, the text links, the free texts, the shared components, the help texts and the guide to what an \"i\" says, the pop-ups and the tooltips.", INTERFACE],
  ["The questions (`design/questions/`, documents 27 to 29, 33, 35 to 38, 41 to 50, 52 to 54)", "What the first published version contains and what it leaves for later, and the questions of each tile. **What governs:** 33 (the first version, sections 1 to 9; what is left for later, sections 10 to 15). **The design behind them:** 27 (the plan, and the order of work for 45 to 49), 28 (every question, the connections and the evidence), 29 (the flow). **The tiles, one document each (27, section 11, gives the form and where each tile stands):** 37 (the Organisation), 38 (Positioning), 45 (Purpose & Beliefs), 35 (the Segment), 36 (the Profile), 41 (the Competitor), 42 (the Value Proposition), 43 (the Offering), 46 (the Ambassador), 47 (Customer Engagement), 52 (Capacity & Delivery), 48 (Financials and the Inventory), 49 (Strategy). **Built from the answers:** 50 (channel fees and Sales Forecast), 53 (the legal starts), 54 (every auto-filled answer). **Every question in one table, by card and position, with its permanent code:** 44 (generated). **How to word them:** 39 (in the interface chapter) and, in 28, sections 3 and 4.", QUESTIONS],
  ["The research and the sources (`design/research/`, documents 2, 3, 30 to 32, 34, 51 and 55)", "The source register (2), the research behind the design (3), the owner's positioning data and its sources (31, 32), age limits (30), the lists and classifications (34), delivery and capacity (51) and the Beta questionnaire that asks the founders (55).", RESEARCH],
  ["The records (`design/records/`, documents 4 to 7)", "The log of every change (4), what has not been done (5), and the generated catalogue record and structure tables (6, 7).", RECORDS],
  ["The library (`design/library/`, documents 8 to 11 and 13 to 15)", "The assets library, its generated lists, its logs, and the library measured against the app.", LIBRARY],
  ["Rules for the assistant (`ai/`)", "Standing rules, references and playbooks for an AI assistant working on the project, the code map and the folder plan.", AI],
  ["The specifications (`specifications/`)", "The pages of the four Systems (Identity, Brand, Business, Strategy), the Inventory, the Workbook and the Settings.", SPEC],
  ["The proposals (`proposals/`)", "Plans that are still open and not started; each leaves for the archive when it is built or replaced.", PROPOSALS],
  ["The archive (`archive/`)", "Documents that are finished or replaced; each is kept for its information.", "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + archiveRows.map(row).join("\n") + "\n"]
];
const idx = `# The documents of NorthStardustStudio

Status: **index**, updated ${new Date().toISOString().slice(0, 10)}. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (\`design/records/04-log.md\`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (a plan or design not built, or built only in part; its status line says what is built), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); \`npm run docs:standard\` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the latest dated decision wins** ([standard.md](standard.md), section 3); names of files and functions follow the code. The checks that keep them honest: \`npm run docs:check\` (generated sections), \`npm run tables:check\`, \`npm run library:check\`, and the document-reference test (five documents name only properties, classes and files the code has).
- **This index is written by \`npm run docs:index\`** (the lists are in \`tools/scripts/docs/write-index.mjs\`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with \`ai/README.md\`; the owner starts with \`app/contents.md\` (the map), \`design/records/05-not-done-yet.md\` (what is open) and \`design/records/04-log.md\` (what changed).

## Contents

${CHAPTERS.map(([title, , ], i) => (i + 1) + ". [" + title.replace(/ \(`[^`]*`\)$/, "") + "](#" + slug((i + 1) + ". " + title) + ")").join("\n")}

The design documents are grouped by what they hold, and each keeps its number wherever it stands: the number is a permanent id (in the file name and the title, and it is how they cite one another: "doc 28"); a retired number stays unused (12, the component defaults, is now a section of 9; 25, the folder plan, is \`ai/folder-plan.md\`; 40, the tile documents, is section 11 of 27). The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).

${CHAPTERS.map(([title, blurb, list], i) => "## " + (i + 1) + ". " + title + "\n\n" + blurb + "\n\n" + (typeof list === "string" ? list : table(list))).join("\n")}
`;


{
    const nums = DESIGN.map(([p]) => /\/(\d\d)-/.exec(p)).filter(Boolean).map(m => +m[1]).sort((x, y) => x - y);
    const gaps = []; for (let n = 1; n <= nums[nums.length - 1]; n++) if (!nums.includes(n) && !RETIRED.some(([r]) => r === n)) gaps.push(n);
    if (gaps.length || new Set(nums).size !== nums.length) { console.error("the design documents are not numbered 1 to " + nums[nums.length - 1] + " without a gap or a repeat: gaps " + gaps.join(", ")); process.exit(1); }
}
writeFileSync(R + "docs/README.md", idx);
console.log("docs/README.md written");

// 5. a README in each design chapter (docs/design/<chapter>/README.md), from the same data
{
    const chapterDefs = [["foundation", "The design of the Foundation", FOUNDATION], ["interface", "The interface", INTERFACE], ["questions", "The questions", QUESTIONS], ["research", "The research and the sources", RESEARCH], ["records", "The records", RECORDS], ["library", "The library", LIBRARY]];
    const rowIn = ([p, kind, what]) => "| [" + p.split("/").pop() + "](" + p.split("/").pop() + ") | " + kind + " | " + what + " | " + date(p) + " |";
    for (const [name, title, list] of chapterDefs) {
        const nums = list.map(([p]) => +/\/(\d\d)-/.exec(p)[1]).sort((x, y) => x - y);
        // (Runs of numbers written as ranges: 27 to 29, 33, 35 to 38.)
        const runs = nums.reduce((all, n) => (all.length && all[all.length - 1][1] === n - 1 ? all[all.length - 1][1] = n : all.push([n, n]), all), []).map(([a, b]) => a === b ? String(a) : b === a + 1 ? a + ", " + b : a + " to " + b);
        const scope = CHAPTERS.find(([heading]) => heading.includes("`design/" + name + "/`"))[1];
        const text = ["# " + title + " (documents " + (runs.length > 1 ? runs.slice(0, -1).join(", ") + " and " + runs[runs.length - 1] : runs[0]) + ")", "",
            "Status: **index**, updated " + new Date().toISOString().slice(0, 10) + ". Written by `npm run docs:index` from `tools/scripts/docs/write-index.mjs`; do not edit by hand.", "",
            scope, "",
            "The standard for these documents is [the standard of the documents](../../standard.md); the contents of all the documents are [README.md](../../README.md) and the alphabetical index is [index.md](../../index.md).", "",
            "| Document | Kind | What it holds | Updated |", "|---|---|---|---|", ...list.map(rowIn), ""].join("\n");
        writeFileSync(R + "docs/design/" + name + "/README.md", text);
    }
    console.log("chapter READMEs written");
}


// 4. the subject index (docs/index.md): topic -> where it is described
const TOPICS = [["Accessibility (user needs)", [["31 section 3", "design/research/31-positioning-categories.md"], ["33 (future)", "design/questions/33-specs-and-limitations.md"]]], ["Activities and codes (classifications)", [["34 sections 5.7 to 5.10", "design/research/34-lists-and-classifications.md"], ["37 section 4 (was 28, 8.5)", "design/questions/37-organization-fields.md"]]], ["Age limits by activity and country", [["30", "design/research/30-age-limits-by-activity.md"], ["31 section 10.2", "design/research/31-positioning-categories.md"]]], ["Age stages", [["31 section 10.1", "design/research/31-positioning-categories.md"]]], ["App, contents", [["app/contents", "app/contents.md"]]], ["App, places (index)", [["app/index", "app/index.md"]]], ["User guide (how to use the app)", [["guide/user-guide", "guide/user-guide.md"]]], ["Archive", [["README section 13", "README.md"]]], ["Proposals (open, not started)", [["README section 12", "README.md"]]], ["Standard of the documents", [["standard", "standard.md"]]], ["Assets library", [["8", "design/library/08-library-system.md"], ["9", "design/library/09-assets-library.md"]]], ["Audience (Identity)", [["38 section 4 (was 28, 8.2)", "design/questions/38-positioning-questions.md"]]], ["Business stage and Opening Date", [["28 section 8.2a", "design/questions/28-questionnaire-specification.md"]]], ["Buyer category and life stage", [["33 section 5", "design/questions/33-specs-and-limitations.md"], ["31", "design/research/31-positioning-categories.md"]]], ["Business System pages", [["specifications", "specifications/business-system/README.md"]]], ["Card kinds", [["card-kinds", "ai/card-kinds.md"]]], ["Card structure", [["26", "design/foundation/26-card-structure.md"], ["layout-rules section 8", "ai/layout-rules.md"]]], ["Caregiving", [["31 section 4", "design/research/31-positioning-categories.md"]]], ["Catalogue record", [["6", "design/records/06-catalogue-record.md"]]], ["Change history (log)", [["4", "design/records/04-log.md"], ["archive (before 2026-11-01)", "archive/log/log-archive-2026-07-to-10.md"], ["archive (2026-11-01 to 07)", "archive/log/log-archive-2026-11-01-to-07.md"], ["archive (2026-11-08 to 10)", "archive/log/log-archive-2026-11-08-to-10.md"], ["archive (2026-11-11 to 17)", "archive/log/log-archive-2026-11-11-to-17.md"]]], ["Colour map of the pages", [["1 Part I", "design/foundation/01-current-design.md"]]], ["Components, defaults", [["9, Defaults", "design/library/09-assets-library.md"]]], ["Components, list", [["13", "design/library/13-components-list.md"]]], ["Components, shared", [["21", "design/interface/21-shared-components.md"]]], ["Cost model", [["1 Part D", "design/foundation/01-current-design.md"]]], ["Countries of the first version", [["33 section 3", "design/questions/33-specs-and-limitations.md"]]], ["Customer Engagement", [["47 (built in part)", "design/questions/47-customer-engagement-tiles.md"], ["specifications, page 1 (Engagement)", "specifications/business-system/page-1-channels.md"], ["47 section 6 (was 28, 7)", "design/questions/47-customer-engagement-tiles.md"]]], ["Differentiation and Outcome", [["38 section 4 (was 28, 8.2)", "design/questions/38-positioning-questions.md"]]], ["Dual-Intent Buyer, Proxy Buyer", [["31 section 10.5", "design/research/31-positioning-categories.md"], ["33 section 5", "design/questions/33-specs-and-limitations.md"]]], ["End User questions", [["31 section 9", "design/research/31-positioning-categories.md"], ["38 section 4 (was 28, 8.2)", "design/questions/38-positioning-questions.md"]]], ["Fields, list", [["14", "design/library/14-fields-list.md"]]], ["First version", [["33", "design/questions/33-specs-and-limitations.md"]]], ["Folders of the repository", [["ai/folder-plan", "ai/folder-plan.md"]]], ["Free texts", [["20", "design/interface/20-free-text-categories.md"], ["16 (text holders)", "design/interface/16-text-holders.md"]]], ["Frequency options", [["17", "design/interface/17-frequency-options.md"]]], ["Future features", [["33", "design/questions/33-specs-and-limitations.md"]]], ["Glossary", [["app/glossary", "app/glossary.md"]]], ["Help texts", [["22 (as built)", "design/interface/22-help-texts.md"], ["39 (what an \"i\" says)", "design/interface/39-help-texts-guide.md"]]], ["Layout rules and the layout check", [["layout-rules", "ai/layout-rules.md"]]], ["Legal forms", [["33 section 3", "design/questions/33-specs-and-limitations.md"]]], ["Library log", [["10", "design/library/10-library-log.md"], ["archive", "archive/log/library-log-archive.md"], ["11 (app structure)", "design/library/11-app-structure-log.md"]]], ["Market structure (single- and multi-sided)", [["38 section 4 (was 28, 8.2)", "design/questions/38-positioning-questions.md"], ["33 (multi-sided is future)", "design/questions/33-specs-and-limitations.md"]]], ["Not done yet", [["5", "design/records/05-not-done-yet.md"]]], ["Pop-ups", [["23", "design/interface/23-popups.md"]]], ["Positioning", [["38 (the tile as built)", "design/questions/38-positioning-questions.md"], ["38 section 4 (was 28, 8.2)", "design/questions/38-positioning-questions.md"], ["31", "design/research/31-positioning-categories.md"]]], ["Profile card", [["36 (as built)", "design/questions/36-profile-questions.md"], ["28 section 6.4", "design/questions/28-questionnaire-specification.md"]]], ["Purposes of an offering", [["31 sections 7 and 10.4", "design/research/31-positioning-categories.md"]]], ["Reactions (hover, press, focus)", [["18", "design/interface/18-reactions.md"]]], ["References and sources", [["2", "design/research/02-references.md"], ["32 (positioning)", "design/research/32-positioning-sources.md"]]], ["Relationships (buyer and user)", [["31 section 6", "design/research/31-positioning-categories.md"], ["33 section 5", "design/questions/33-specs-and-limitations.md"]]], ["Research", [["3", "design/research/03-research.md"], ["30", "design/research/30-age-limits-by-activity.md"], ["32", "design/research/32-positioning-sources.md"]]], ["Rule 14 (lists come from documents)", [["28 section 3", "design/questions/28-questionnaire-specification.md"]]], ["Segment card", [["35 (as built)", "design/questions/35-segment-questions.md"], ["28 section 6.3", "design/questions/28-questionnaire-specification.md"]]], ["Shared components", [["21", "design/interface/21-shared-components.md"]]], ["Structure tables", [["7", "design/records/07-structure-tables.md"]]], ["Text holders", [["16", "design/interface/16-text-holders.md"]]], ["Text links", [["19", "design/interface/19-text-links.md"]]], ["Tile and card pattern", [["layout-rules sections 6, 8 to 10", "ai/layout-rules.md"]]], ["Tooltips", [["24", "design/interface/24-tooltips.md"]]], ["Verification (what to run after a change)", [["toolchain playbook", "ai/toolchain-and-verification-playbook.md"]]], ["Organisation tile", [["37 (as built)", "design/questions/37-organization-fields.md"], ["37 section 4 (was 28, 8.5)", "design/questions/37-organization-fields.md"]]], ["Tile documents (the form and the list)", [["27 section 11", "design/questions/27-questionnaire-plan.md"]]], ["Competitor card", [["41 (as built)", "design/questions/41-competitor-questions.md"], ["28 section 6.6", "design/questions/28-questionnaire-specification.md"]]], ["Value Proposition", [["42 (built in part)", "design/questions/42-value-proposition-questions.md"], ["28 section 6.7", "design/questions/28-questionnaire-specification.md"]]], ["Offering card", [["43 (built in part)", "design/questions/43-offering-questions.md"], ["28 section 6.8", "design/questions/28-questionnaire-specification.md"]]], ["Card links (proposal)", [["archive", "archive/proposals/card-links.md"]]], ["Lists and classifications", [["34", "design/research/34-lists-and-classifications.md"]]], ["Purpose & Beliefs (Mission, Vision, Values, Principles, Philosophy, Manifesto)", [["45 (as built)", "design/questions/45-purpose-and-beliefs-questions.md"], ["28 section 8.1", "design/questions/28-questionnaire-specification.md"]]], ["Ambassador (Brand)", [["46 (built in part)", "design/questions/46-ambassador-questions.md"], ["specifications, Brand System", "specifications/brand-system/page-1-brand.md"]]], ["Financial pages and Inventory (tiles)", [["48 (built in part)", "design/questions/48-financials-and-inventory.md"], ["specifications, the Inventory", "specifications/inventory/README.md"]]], ["Strategy (SWOT, Compass, Themes, Metrics)", [["49 (built in part)", "design/questions/49-strategy-questions.md"], ["specifications, Strategy System", "specifications/strategy-system/page-1-situation-and-direction.md"]]], ["Questions, the plan and the guide", [["44 (the register: every question and its code)", "design/questions/44-questions-register.md"], ["27", "design/questions/27-questionnaire-plan.md"], ["29", "design/questions/29-question-guide.md"], ["28", "design/questions/28-questionnaire-specification.md"]]], ["Channel fees and Sales Forecast additions", [["50", "design/questions/50-channel-fees-and-sales-forecast.md"], ["Global Settings", "specifications/settings/README.md"]]], ["Delivery and capacity", [["52 (Capacity & Delivery, built in part)", "design/questions/52-capacity-and-delivery-tile.md"], ["51 (research)", "design/research/51-delivery-and-capacity-research.md"]]], ["Legal starts (registrations, taxes, legal expenses)", [["53", "design/questions/53-legal-starts.md"]]], ["Auto-filled answers (drafts, starts, worked-out figures)", [["54", "design/questions/54-auto-filled-answers.md"]]], ["Beta questionnaire", [["55 (proposal)", "design/research/55-beta-questionnaire.md"]]], ["Workbook (Business and Financial Documents, Review, References, Glossary, Card Notes)", [["specifications, the Workbook", "specifications/workbook/README.md"]]], ["Settings (Global Settings, Appearance, Focus)", [["specifications, Settings", "specifications/settings/README.md"], ["Global Settings", "specifications/settings/README.md"]]], ["Brand System pages", [["specifications", "specifications/brand-system/page-1-brand.md"]]], ["Strategy System pages", [["specifications", "specifications/strategy-system/page-1-situation-and-direction.md"]]], ["Identity System pages", [["specifications", "specifications/identity-system/page-1-definition.md"]]], ["Inventory", [["specifications", "specifications/inventory/README.md"], ["48 (IN1 to IN5)", "design/questions/48-financials-and-inventory.md"]]], ["Future features (AI Assistant, Team mode, Voice, more languages)", [["guide/overview-and-future-features section 5", "guide/overview-and-future-features.md"]]]
];
{
    const missing = TOPICS.flatMap(([, refs]) => refs.map(r => r[1])).filter(f => !existsSync(R + "docs/" + f));
    if (missing.length) { console.error("index.md: missing files " + [...new Set(missing)].join(", ")); process.exit(1); }
    const sorted = [...TOPICS].sort((x, y) => x[0].localeCompare(y[0]));
    const out = ["# Index of the documents", "", "Status: **index**, updated " + new Date().toISOString().slice(0, 10) + ", written by `npm run docs:index` (the subjects are in `tools/scripts/docs/write-index.mjs`; do not edit by hand). An alphabetical list of subjects and where each is described. The contents by chapter are in [README.md](README.md); the places in the app are in [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).", ""];
    let letter = "";
    for (const [topic, refs] of sorted) {
        const l = topic[0].toUpperCase();
        if (l !== letter) { letter = l; out.push("## " + l, ""); }
        out.push("- **" + topic + "**: " + refs.map(([label, f]) => "[" + label + "](" + f + ")").join("; "));
    }
    writeFileSync(R + "docs/index.md", out.join("\n") + "\n");
    console.log("docs/index.md written");
}

