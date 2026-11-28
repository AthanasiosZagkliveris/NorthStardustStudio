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
  ["docs/app/01-contents.md", "contents", "The contents of the app: how it is entered, the Systems and pages, where the figures and dates come from, where things are in the code.", true],
  ["docs/app/02-index.md", "index", "An alphabetical index of the places in the app (pages, tiles, cards, the header): where each is, and which document describes it.", true],
  ["docs/app/03-glossary.md", "reference", "One line per term: the framework, the app, the business stage, positioning, buyer and user, the question ids, the documents.", true],
];
const GUIDE = [
  ["docs/guide/01-user-guide.md", "playbook", "The user guide: how a founder uses the app step by step: the Organisations screen, the Foundation with its Identity and Business Systems, and the tools (Workbook, Notes, Search, Settings, Focus, the reading modes, the Calendar).", true],
  ["docs/guide/02-overview.md", "reference", "The app: what it is, where its guide and specifications are, and how its answers connect.", true],
  ["docs/guide/03-future-features.md", "proposal", "Every idea for after Version 1: an AI Assistant, Team working mode, Voice mode, more languages and countries, the other features ranked and scored, what the first version leaves out, the Business System ideas for later, and the other proposals kept for later.", true]
];
const TESTING = [
  ["docs/testing/01-app-tests-guide.md", "reference", "The app's tests: where they are, how they run (Vitest, the pre-commit hook, CI), and what every test file checks, in six groups (screens, business rules, saved data and examples, whole pages, design system and docs, content files).", false]
];
const AI = [
  ["docs/ai/README.md", "index", "The map of this folder: what to read first, what to read for a task.", false],
  ["docs/ai/01-ai-collaboration-rules.md", "rules", "Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows.", true],
  ["docs/ai/03-toolchain-and-verification-playbook.md", "playbook", "What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures.", true],
  ["docs/ai/07-framework-dsl-grammar.md", "reference", "Grammar of the Markdown that defines a System's content.", true],
  ["docs/ai/06-framework-conventions-and-patterns.md", "reference", "The architectural patterns and the data model of the framework.", true],
  ["docs/ai/02-review.md", "rules", "The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured and the report (sections 1 to 12), and the checklist to tick before saying done (section 13).", true],
  ["docs/ai/04-code-map.md", "reference", "Where things are in src: the folders and what is in each; the rules for a new file.", true],
  ["docs/ai/09-layout-rules.md", "rules", "The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check.", false],
  ["docs/ai/08-card-kinds.md", "reference", "The kinds of card, where each one's code is, how its head is built.", true],
  ["docs/ai/05-folder-plan.md", "reference", "The folders of the repository: the app files, the examples, the working files and the exports, and the documents folder (it was document 25; the number is retired).", true]
];
const DESIGN = [
  ["docs/design/foundation/01-current-design.md", "current design", "The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map.", false],
  ["docs/design/research/01-references.md", "reference", "The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it.", false],
  ["docs/design/research/02-research.md", "research", "The research behind the design decisions: the question, the recommendation, the reason and the source. Foundation 1 prevails where they differ.", false],
  ["docs/design/records/01-log.md", "log", "Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written.", false],
  ["docs/design/records/02-to-do-list.md", "living list", "The to-do list: the work for the Beta and Version 1, each item with its stage: the road, the requirements still open, the open decisions and the open points of the reviews.", false],
  ["docs/design/records/03-catalogue-record.md", "generated", "The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes.", false],
  ["docs/design/records/04-structure-tables.md", "generated", "The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue.", false],
  ["docs/design/library/01-library-system.md", "specification", "The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built.", false],
  ["docs/design/library/02-assets-library.md", "generated", "The assets library: every asset, its variants and its contract.", false],
  ["docs/design/library/06-library-log.md", "log", "The library log: every change to an asset of the library, newest on top.", false],
  ["docs/archive/log/library-log-archive.md", "archive", "Older rows of the library log.", false],
  ["docs/design/library/07-app-structure-log.md", "log", "The app structure log: every change of the tables, that is of the structure of the app, newest on top.", false],
  ["docs/design/library/03-components-list.md", "generated", "The components, and which fields and cards use each.", false],
  ["docs/design/library/04-fields-list.md", "generated", "The fields, the add buttons and the field names.", false],
  ["docs/design/library/05-library-vs-app.md", "generated", "The library measured against the running app.", false],
  ["docs/design/interface/02-text-holders.md", "generated", "The text holders: sizes, style classes and rules.", true],
  ["docs/design/interface/04-frequency-options.md", "generated", "The Frequency options by group, compared with the code.", true],
  ["docs/design/interface/05-reactions.md", "current design", "How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup.", true],
  ["docs/design/interface/06-text-links.md", "generated", "The text link: look and behaviour, from the code and the walk of the app.", true],
  ["docs/design/interface/03-free-text-categories.md", "current design", "Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build.", true],
  ["docs/design/interface/01-shared-components.md", "current design", "Which components are shared, with their props, and what is still hand-made.", false],
  ["docs/design/interface/09-help-texts.md", "generated", "The help texts of the app, from the walk of the running app.", true],
  ["docs/design/interface/07-popups.md", "current design", "Pop-ups in six categories, with their placement rules and the order of fallbacks.", true],
  ["docs/design/interface/08-tooltips.md", "current design", "Which controls have a tooltip, what it says, its look and its rules. This document owns the tip.", true],
  ["docs/design/questions/01-questionnaire-plan.md", "proposal", "The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut, the order of work for Questions 9, 11, 17, 20 and 21 (section 10), and the form of a tile document with where each tile stands (section 11).", true],
  ["docs/design/questions/02-questionnaire-specification.md", "proposal", "The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence.", true],
  ["docs/design/questions/03-question-guide.md", "proposal", "The question guide: the flow of the questions as trees, the key branches and how a question earns its place.", true],
  ["docs/design/research/04-age-limits-by-activity.md", "research", "Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status.", true],
  ["docs/design/research/05-positioning-categories.md", "collection", "The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables.", true],
  ["docs/design/research/06-positioning-sources.md", "research", "The sources behind each positioning list of Research 5, what has none, and the pages checked.", true],
  ["docs/design/questions/04-specs-and-limitations.md", "specification", "The first published version (language, countries, legal forms, market structure, relationships, buyer and user, ages; it governs the other questionnaire documents, sections 1 to 9) and everything left for later (sections 10 to 15: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do).", true],
  ["docs/design/research/03-lists-and-classifications.md", "proposal", "The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification).", true],
  ["docs/design/foundation/02-card-structure.md", "current design", "Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it.", true],
  ["docs/design/questions/12-segment-questions.md", "specification", "The Segment card's questions as built: every question and option in order, when it is asked, what its help says and what it comes from and is read by.", true],
  ["docs/design/questions/13-profile-questions.md", "specification", "The Profile card's questions, built in part: every question and option in order (the specialised needs and the kind of business are not built yet), when it is asked, the starting values, the help, and the layout of the card.", true],
  ["docs/design/questions/07-organisation-tile.md", "specification", "The Organisation tile's fields as built: control, when asked, options, the help and the connections.", true],
  ["docs/design/questions/08-positioning-tile.md", "specification", "The Positioning tile's questions as built, by stage: control, limits, options, the help and the connections.", true],
  ["docs/design/interface/10-help-texts-guide.md", "specification", "What a help text says: the analysis of the 159 help texts and a proposed structure per place and field, standard phrases, size budgets and a check.", true],
  ["docs/design/interface/11-symbols.md", "current design", "The 39 symbols of the Capabilities, the Systems and the Resources: grid, sizes and their three drawings, line, corners, tints, gaps, the rule that a symbol takes its card's hue, reading modes, each symbol's drawing by size, and the files the app reads.", true],
  ["docs/design/questions/14-competitor-questions.md", "specification", "The Competitor card: every question and option, as built (K1 to K10, in the card's order, by the competitor's type).", true],
  ["docs/design/questions/15-value-proposition.md", "specification", "The Value Proposition tile: what it asks, the draft sentence it writes and the open items it lists, built in part.", true],
  ["docs/design/questions/16-offering-questions.md", "specification", "The Offering card: every question and option (O1 to O18), built in part.", true],
  ["docs/design/questions/06-questions-register.md", "generated", "The questions register: every question of the Foundation's cards by card and position, with its permanent code, saved id, control, limit, when it is asked, its start, options and \"i\", and the retired codes; generated from the code.", false],
  ["docs/design/questions/09-purpose-and-beliefs.md", "specification", "Purpose & Beliefs: the Identity System's Mission, Vision, Values, Principles, Philosophy and Manifesto as three pair tiles, each text with its guiding questions, control, length, \"i\" and connections (codes PB1 to PB6), built with the owner's decisions (section 6).", true],
  ["docs/design/questions/11-ambassador.md", "specification", "The Ambassador: the Brand System's four tiles with their choices BA1 to BA4 and BA6 to BA9, the drafts and the Style suggestions; built in part (the Style suggestions are still to build).", true],
  ["docs/design/questions/17-customer-engagement.md", "specification", "Customer Engagement as the Engagement subchapter of each Segment's chapter, its Master Tiles, the Offering's four faces and the journey rebuild; built in part (the journey rebuild is still to build).", true],
  ["docs/design/questions/20-financials-and-inventory.md", "specification", "The page Financials as one chapter of Master Tiles, the Offering Economics card, the questions RV1 and FN1, and the Inventory's changes IN1 to IN5; built in part (the questions and the Offering Economics card are still to build).", true],
  ["docs/design/questions/21-strategy.md", "specification", "Strategy: SW1, the SWOT suggestions, SC1 to SC3 and the Compass draft, Themes, Goals and Metrics linked to the plan; built in part (SW1, SC1 to SC3 and the Compass draft).", true],
  ["docs/design/questions/18-channel-fees-and-sales-forecast.md", "specification", "Channel fees on Customer Engagement (the read-only Fees on a subchannel, the UK rows) and what Sales Forecast adds (Tried it, the time to buy, the market-size check); built.", true],
  ["docs/design/research/07-delivery-and-capacity-research.md", "proposal", "Delivery and capacity: what the sources say, what the app asks today, what is missing, and seven additions in priority order; not built.", true],
  ["docs/design/questions/19-capacity-and-delivery.md", "specification", "Capacity & Delivery: the Delivery tile renamed, Research 7's seven additions on the Delivery card (DV1 to DV13), the dialog and Sustainability's check, the Lumen Workshops through the Online Store, and the decisions; built in part (Sustainability's check, section 5, is still to build).", true],
  ["docs/design/questions/10-legal-starts.md", "proposal", "Legal starts: the registrations, taxes and legal expenses the Legal Entity can start from Definition and the Business pages, by country, each with its official source; the eight decisions; stages 1 to 4 built (section 6).", true],
  ["docs/design/questions/05-auto-filled-answers.md", "reference", "Auto-filled answers: every answer the app drafts, starts, offers or works out from an earlier one (about 120): the field, the kind, its sources, the code and the document that describes it.", true],
  ["docs/design/research/08-beta-questionnaire.md", "proposal", "The Beta questionnaire: what the app would ask its Beta founders about the app, in sections, with the choices of each; nothing built.", true],
  ["docs/design/research/09-kinds-of-app-and-systems.md", "research", "The kinds of app (web, installable web, store-packaged, web view, native) and what each system and store requires of an app (Android, iPhone and iPad, Windows, macOS, Linux), matched to Tiles.", true],
  ["docs/design/research/10-protecting-the-app.md", "research", "Protecting the app from copying and digging: what a web app exposes, the ways to protect it (obfuscation, WebAssembly, integrity checks, a server, store integrity), the law (EU copyright, trade secrets), a recommendation in layers, and the GitHub check minutes.", true],
  ["docs/design/research/11-terms-of-use-law-and-practice.md", "research", "The Terms of Use: what the law of Greece and the EU and of the six countries requires of them, what similar business-plan apps put in theirs, and the changes this made to the Terms.", true]
];
const chapter = (name) => DESIGN.filter(([p]) => p.startsWith("docs/design/" + name + "/")).sort(([a], [b]) => a.localeCompare(b));
const FOUNDATION = chapter("foundation"), INTERFACE = chapter("interface"), QUESTIONS = chapter("questions"), RESEARCH = chapter("research"), RECORDS = chapter("records"), LIBRARY = chapter("library");
// The old numbers (1 to 55, one sequence for all the folders) and the new ones, for reading older log rows, commits and PRs (owner, 2026-11-21: each folder has its own sequence).
const OLD_NUMBERS = [[1, "docs/design/foundation/01-current-design.md"],
   [2, "docs/design/research/01-references.md"],
   [3, "docs/design/research/02-research.md"],
   [4, "docs/design/records/01-log.md"],
   [5, "docs/design/records/02-to-do-list.md"],
   [6, "docs/design/records/03-catalogue-record.md"],
   [7, "docs/design/records/04-structure-tables.md"],
   [8, "docs/design/library/01-library-system.md"],
   [9, "docs/design/library/02-assets-library.md"],
   [10, "docs/design/library/06-library-log.md"],
   [11, "docs/design/library/07-app-structure-log.md"],
   [13, "docs/design/library/03-components-list.md"],
   [14, "docs/design/library/04-fields-list.md"],
   [15, "docs/design/library/05-library-vs-app.md"],
   [16, "docs/design/interface/02-text-holders.md"],
   [17, "docs/design/interface/04-frequency-options.md"],
   [18, "docs/design/interface/05-reactions.md"],
   [19, "docs/design/interface/06-text-links.md"],
   [20, "docs/design/interface/03-free-text-categories.md"],
   [21, "docs/design/interface/01-shared-components.md"],
   [22, "docs/design/interface/09-help-texts.md"],
   [23, "docs/design/interface/07-popups.md"],
   [24, "docs/design/interface/08-tooltips.md"],
   [26, "docs/design/foundation/02-card-structure.md"],
   [27, "docs/design/questions/01-questionnaire-plan.md"],
   [28, "docs/design/questions/02-questionnaire-specification.md"],
   [29, "docs/design/questions/03-question-guide.md"],
   [30, "docs/design/research/04-age-limits-by-activity.md"],
   [31, "docs/design/research/05-positioning-categories.md"],
   [32, "docs/design/research/06-positioning-sources.md"],
   [33, "docs/design/questions/04-specs-and-limitations.md"],
   [34, "docs/design/research/03-lists-and-classifications.md"],
   [35, "docs/design/questions/12-segment-questions.md"],
   [36, "docs/design/questions/13-profile-questions.md"],
   [37, "docs/design/questions/07-organisation-tile.md"],
   [38, "docs/design/questions/08-positioning-tile.md"],
   [39, "docs/design/interface/10-help-texts-guide.md"],
   [41, "docs/design/questions/14-competitor-questions.md"],
   [42, "docs/design/questions/15-value-proposition.md"],
   [43, "docs/design/questions/16-offering-questions.md"],
   [44, "docs/design/questions/06-questions-register.md"],
   [45, "docs/design/questions/09-purpose-and-beliefs.md"],
   [46, "docs/design/questions/11-ambassador.md"],
   [47, "docs/design/questions/17-customer-engagement.md"],
   [48, "docs/design/questions/20-financials-and-inventory.md"],
   [49, "docs/design/questions/21-strategy.md"],
   [50, "docs/design/questions/18-channel-fees-and-sales-forecast.md"],
   [51, "docs/design/research/07-delivery-and-capacity-research.md"],
   [52, "docs/design/questions/19-capacity-and-delivery.md"],
   [53, "docs/design/questions/10-legal-starts.md"],
   [54, "docs/design/questions/05-auto-filled-answers.md"],
   [55, "docs/design/research/08-beta-questionnaire.md"],
   [12, "docs/design/library/02-assets-library.md"],
   [25, "docs/ai/05-folder-plan.md"],
   [40, "docs/design/questions/01-questionnaire-plan.md"]];
const ARCHIVED_DESIGN = DESIGN.filter(([p]) => p.startsWith("docs/archive/"));
const SPEC = [
  ["docs/specifications/01-identity-system/01-definition.md", "current design", "1. Identity System, 1. Definition: the master tile with its four tiles (Organisation, Early Positioning, Mission, Vision), its layout, reactions and readers, and the extra information that is neither built nor a future feature.", true],
  ["docs/specifications/02-brand-system/01-brand.md", "current design", "2. Brand System: the one page, its two chapters and their tiles, what each asks, reads and writes, and the rules it follows.", true],
  ["docs/specifications/03-business-system/README.md", "index", "The Business System: its five sections on three pages, the file, editor and data module of each, and what crosses between the pages.", true],
  ["docs/specifications/03-business-system/01-foundation.md", "specification", "Page 1, Foundation & Engagement, Section 1: the Foundation.", true],
  ["docs/specifications/03-business-system/02-channels.md", "specification", "Page 1, Foundation & Engagement, Section 2, part 1: the channels.", true],
  ["docs/specifications/03-business-system/03-customer-relationships.md", "specification", "Page 1, Foundation & Engagement, Section 2, part 2: customer relationships (section 18 holds a worked example and the column rules).", true],
  ["docs/specifications/03-business-system/04-infrastructure-and-capability.md", "specification", "Page 2, Section 3: Infrastructure & Capability.", true],
  ["docs/specifications/03-business-system/05-revenue-and-pricing.md", "specification", "Section 4: Revenue & Pricing, drawn on the page Financials.", true],
  ["docs/specifications/03-business-system/06-costs-funding-and-position.md", "specification", "Section 5: Costs, Funding & Position, drawn on the page Financials.", true],
  ["docs/specifications/05-inventory/README.md", "current design", "The Inventory: the help tile of Infrastructure & Capability that holds every card of the page, as tiles or a table, under one funnel.", true],
  ["docs/specifications/04-strategy-system/01-situation-and-direction.md", "current design", "4. Strategy System, Situation & Direction: the four Master Tiles, the cards of the Strategic Period, what the page reads and writes, and the rules it follows.", true],
  ["docs/specifications/06-workbook/README.md", "current design", "The Workbook: the page drawn as a dialog, and each of its sections: Business Documents, Financial Documents, Review, References and Glossary, Card Notes.", true],
  ["docs/specifications/07-settings/README.md", "specification", "Settings: the Global Settings screen (how it is drawn and the rule each part follows), the reading mode (Appearance) and Focus, all three in the header's Menu.", true],
];
const PROPOSALS = [
  ["docs/proposals/workspace-d-duplicate-scenarios-compare.md", "proposal", "Workspace features D, not started: duplicate an Organisation or a card, financial scenarios, compare.", true],
  ["docs/proposals/workspace-e-founder-helpers.md", "proposal", "Workspace features E, not started: helpers for founders (what would it take, the lender-ready check, the one-pager, glossary hints).", true],
  ["docs/proposals/apps-on-every-system.md", "proposal", "The app on every system, not started: every requirement for the web app, Android and the iPhone, grouped by the work they share, and the work in batches 0 to 9.", true],

];
const ARCHIVE = [
  ["docs/engineering-phase-completion.md", "docs/archive/reports/engineering-phase-completion.md", "archive", "The engineering phase completion report."],
  ["docs/design/questions/02-questionnaire-specification.md", "docs/archive/reports/questionnaire-decisions-done-2026-11-21.md", "archive", "The rows of Questions 2, section 13 (rebuilds, moves and decisions) that were built or superseded on 2026-11-21."],
  ["docs/design/questions/03-question-guide.md", "docs/archive/reports/question-guide-review-2026-10-26.md", "archive", "The question guide's review of 2026-10-26 (Questions 3, sections 10 to 12): where each question stood, the conflicts decided and what was merged or deleted."],
  ["docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "archive", "The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of Records 2); what is left is in Records 2."],
  ["docs/archive/log/log-archive-2026-07-to-10.md", "docs/archive/log/log-archive-2026-07-to-10.md", "archive", "Older rows of the log (Records 1): sections 4.1 and 4.4 before 2026-11-01, and sections 4.2 (the drafts' versions) and 4.5 (the task plan F to K)."],
  ["docs/archive/log/log-archive-2026-11-01-to-07.md", "docs/archive/log/log-archive-2026-11-01-to-07.md", "archive", "Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-01 to 2026-11-07."],
  ["docs/archive/log/log-archive-2026-11-08-to-10.md", "docs/archive/log/log-archive-2026-11-08-to-10.md", "archive", "Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-08 to 2026-11-10."],
  ["docs/archive/log/log-archive-2026-11-11-to-17.md", "docs/archive/log/log-archive-2026-11-11-to-17.md", "archive", "Older rows of the log (Records 1): sections 4.1 and 4.4 from 2026-11-11 to 2026-11-17."],
  ["docs/archive/log/log-archive-2026-11-18-to-21.md", "docs/archive/log/log-archive-2026-11-18-to-21.md", "archive", "Older rows of the log (Records 1): section 4.1 from 2026-11-18 to 2026-11-21."],
  ["docs/archive/proposals/card-links.md", "docs/archive/proposals/card-links.md", "archive", "Proposal: which partner and supplier groups each resource group could link to, and which partners, suppliers and resources could link to each activity group (formerly Questions 14; not built)."],
  ["docs/archive/proposals/cost-section-proposal.md", "docs/archive/proposals/cost-section-proposal.md", "archive", "Proposal: what the Cost section should record (the page was built afterwards)."],
  ["docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md", "docs/archive/proposals/competitor-and-value-proposition-2026-11-03.md", "archive", "The Competitor card and the Value Proposition tile as proposed on 2026-11-03; what is built is Questions 14 and 15."],
  ["docs/archive/proposals/segment-questions-g-list-2026-10-23.md", "docs/archive/proposals/segment-questions-g-list-2026-10-23.md", "archive", "The Segment card's earlier design (the G-list of 2026-10-23, ids G1 to G25); the questions as built are Questions 12."],
  ["docs/archive/proposals/segment-by-selection-proposal.md", "docs/archive/proposals/segment-by-selection-proposal.md", "archive", "Proposal: building a Customer Segment by selection (not built)."],
  ["docs/archive/proposals/responsive-layout-2026-11-23.md", "docs/archive/proposals/responsive-layout-2026-11-23.md", "archive", "The responsive layout as proposed on 2026-11-23 (four tiers from monitor to phone); approved and built the same night, its rules are AI 9, sections 4 and 23."],
  ["docs/archive/proposals/app-review-2026-11-21.md", "docs/archive/proposals/app-review-2026-11-21.md", "archive", "The whole app reviewed on 2026-11-21: 21 measured items; what is left of it is Records 2, 5.6."],
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
  ["The design of the Foundation (`design/foundation/`, Foundation 1 and 2)", "The single description of the Foundation capability (1) and its Part F, the card structure (2), from which the structure tables and the catalogue record are generated.", FOUNDATION],
  ["The questions (`design/questions/`, Questions 1 to 21)", "How the questions work, then one document for each tile in the order the app shows them. **How they work:** 1 (the plan, the order of work and, in section 11, the form of a tile document), 2 (every question, the connections and the evidence), 3 (the flow), 4 (the first published version and what is left for later), 5 (every auto-filled answer), 6 (every question in one table with its permanent code, generated). **Identity System:** 7 (the Organisation), 8 (Positioning), 9 (Purpose & Beliefs), 10 (the legal starts). **Brand System:** 11 (the Ambassador). **Business System:** 12 (the Segment), 13 (the Profile), 14 (the Competitor), 15 (the Value Proposition), 16 (the Offering), 17 (Customer Engagement), 18 (channel fees and Sales Forecast), 19 (Capacity & Delivery), 20 (Financials and the Inventory). **Strategy System:** 21. **How to word them:** Interface 10 and, in Questions 2, sections 3 and 4.", QUESTIONS],
  ["The interface (`design/interface/`, Interface 1 to 11)", "What every screen shares, from the shared components (1) to the smallest text: the text holders (2), the free texts (3), the Frequency options (4), the reactions (5), the text links (6), the pop-ups (7), the tooltips (8), the help texts (9), the guide to what an \"i\" says (10) and the symbols of the Capabilities and the Systems (11).", INTERFACE],
  ["The research and the sources (`design/research/`, Research 1 to 11)", "The source register (1), the research behind the design (2), the lists and classifications (3), age limits (4), the owner's positioning data and its sources (5, 6), delivery and capacity (7), the Beta questionnaire that asks the founders (8) the kinds of app and what each system requires (9) protecting the app from copying (10) and the Terms of Use (11).", RESEARCH],
  ["The library (`design/library/`, Library 1 to 7)", "The library system (1), the assets library with the component defaults (2), the generated lists of components and fields (3, 4), the library measured against the app (5), and its two logs (6, 7).", LIBRARY],
  ["The records (`design/records/`, Records 1 to 4)", "The log of every change (1), what has not been done (2), and the generated catalogue record and structure tables (3, 4).", RECORDS],
  ["The tests (`testing/`)", "What the app's tests check, file by file, and how they run.", TESTING],
  ["Rules for the assistant (`ai/`)", "Standing rules, references and playbooks for an AI assistant working on the project, the code map and the folder plan.", AI],
  ["The specifications (`specifications/`)", "The pages of the four Systems (Identity, Brand, Business, Strategy), the Inventory, the Workbook and the Settings.", SPEC],
  ["The proposals (`proposals/`)", "Plans that are still open and not started; each leaves for the archive when it is built or replaced.", PROPOSALS],
  ["The archive (`archive/`)", "Documents that are finished or replaced; each is kept for its information.", "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + archiveRows.map(row).join("\n") + "\n\n**The old numbers.** Until 2026-11-21 the design documents had one sequence (1 to 55); 12, 25 and 40 had been retired. What each old number is now:\n\n| Old | Now |\n|---|---|\n" + OLD_NUMBERS.map(([n, p]) => "| " + n + " | [" + p.replace(/^docs\//, "") + "](" + p.replace(/^docs\//, "") + ") |").join("\n") + "\n"]
];
const idx = `# The documents of NorthStardustStudio

Status: **index**, updated ${new Date().toISOString().slice(0, 10)}. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (\`design/records/01-log.md\`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (a plan or design not built, or built only in part; its status line says what is built), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); \`npm run docs:standard\` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the latest dated decision wins** ([standard.md](standard.md), section 3); names of files and functions follow the code. The checks that keep them honest: \`npm run docs:check\` (generated sections), \`npm run tables:check\`, \`npm run library:check\`, and the document-reference test (five documents name only properties, classes and files the code has).
- **This index is written by \`npm run docs:index\`** (the lists are in \`tools/scripts/docs/write-index.mjs\`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with \`ai/README.md\`; the owner starts with \`app/01-contents.md\` (the map), \`design/records/02-to-do-list.md\` (the to-do list), \`guide/03-future-features.md\` (the ideas for after Version 1) and \`design/records/01-log.md\` (what changed).

## Contents

${CHAPTERS.map(([title, , ], i) => (i + 1) + ". [" + title.replace(/ \(`[^`]*`\)$/, "") + "](#" + slug((i + 1) + ". " + title) + ")").join("\n")}

The design documents are grouped by what they hold, and each folder has its own sequence from 1, in the order the app shows things (the questions run Identity, Brand, Business, Strategy). A document is cited by its folder and number, "Questions 2" or "Interface 1"; the number is in the file name and the title. Until 2026-11-21 the documents had one sequence for all the folders (1 to 55); the old numbers are in the last table here, for reading older log rows, commits and PRs. The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/02-index.md](app/02-index.md); the terms are in [app/03-glossary.md](app/03-glossary.md).

${CHAPTERS.map(([title, blurb, list], i) => "## " + (i + 1) + ". " + title + "\n\n" + blurb + "\n\n" + (typeof list === "string" ? list : table(list))).join("\n")}
`;


{
    const byFolder = {};
    for (const [p] of DESIGN) { const m = /^docs\/design\/([a-z]+)\/(\d\d)-/.exec(p); if (m) (byFolder[m[1]] ??= []).push(+m[2]); }
    for (const [folder, nums] of Object.entries(byFolder)) {
        nums.sort((x, y) => x - y);
        if (nums.some((n, i) => n !== i + 1)) { console.error("docs/design/" + folder + ": not numbered 1 to " + nums.length + " without a gap or a repeat: " + nums.join(", ")); process.exit(1); }
    }
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
        const text = ["# " + title + " (" + name[0].toUpperCase() + name.slice(1) + " " + (runs.length > 1 ? runs.slice(0, -1).join(", ") + " and " + runs[runs.length - 1] : runs[0]) + ")", "",
            "Status: **index**, updated " + new Date().toISOString().slice(0, 10) + ". Written by `npm run docs:index` from `tools/scripts/docs/write-index.mjs`; do not edit by hand.", "",
            scope, "",
            "The standard for these documents is [the standard of the documents](../../standard.md); the contents of all the documents are [README.md](../../README.md) and the alphabetical index is [index.md](../../index.md).", "",
            "| Document | Kind | What it holds | Updated |", "|---|---|---|---|", ...list.map(rowIn), ""].join("\n");
        writeFileSync(R + "docs/design/" + name + "/README.md", text);
    }
    console.log("chapter READMEs written");
}


// 4. the subject index (docs/index.md): topic -> where it is described
const TOPICS = [["Accessibility (user needs)", [["Research 5 section 3", "design/research/05-positioning-categories.md"], ["Questions 4 (future)", "design/questions/04-specs-and-limitations.md"]]], ["Activities and codes (classifications)", [["Research 3 sections 5.7 to 5.10", "design/research/03-lists-and-classifications.md"], ["Questions 7 section 4 (was Questions 2, 8.5)", "design/questions/07-organisation-tile.md"]]], ["Age limits by activity and country", [["Research 4", "design/research/04-age-limits-by-activity.md"], ["Research 5 section 10.2", "design/research/05-positioning-categories.md"]]], ["Age stages", [["Research 5 section 10.1", "design/research/05-positioning-categories.md"]]], ["App, contents", [["app/contents", "app/01-contents.md"]]], ["App, places (index)", [["app/index", "app/02-index.md"]]], ["User guide (how to use the app)", [["guide/user-guide", "guide/01-user-guide.md"]]], ["Archive", [["README section 13", "README.md"]]], ["Proposals (open, not started)", [["README section 12", "README.md"]]], ["Standard of the documents", [["standard", "standard.md"]]], ["Assets library", [["Library 1", "design/library/01-library-system.md"], ["Library 2", "design/library/02-assets-library.md"]]], ["Audience (Identity)", [["Questions 8 section 4 (was Questions 2, 8.2)", "design/questions/08-positioning-tile.md"]]], ["Business stage and Opening Date", [["Questions 2 section 8.2a", "design/questions/02-questionnaire-specification.md"]]], ["Buyer category and life stage", [["Questions 4 section 5", "design/questions/04-specs-and-limitations.md"], ["Research 5", "design/research/05-positioning-categories.md"]]], ["Business System pages", [["specifications", "specifications/03-business-system/README.md"]]], ["Card kinds", [["card-kinds", "ai/08-card-kinds.md"]]], ["Card structure", [["Foundation 2", "design/foundation/02-card-structure.md"], ["layout-rules section 8", "ai/09-layout-rules.md"]]], ["Caregiving", [["Research 5 section 4", "design/research/05-positioning-categories.md"]]], ["Catalogue record", [["Records 3", "design/records/03-catalogue-record.md"]]], ["Change history (log)", [["Records 1", "design/records/01-log.md"], ["archive (before 2026-11-01)", "archive/log/log-archive-2026-07-to-10.md"], ["archive (2026-11-01 to 07)", "archive/log/log-archive-2026-11-01-to-07.md"], ["archive (2026-11-08 to 10)", "archive/log/log-archive-2026-11-08-to-10.md"], ["archive (2026-11-11 to 17)", "archive/log/log-archive-2026-11-11-to-17.md"], ["archive (2026-11-18 to 21)", "archive/log/log-archive-2026-11-18-to-21.md"]]], ["Colour map of the pages", [["Foundation 1 Part I", "design/foundation/01-current-design.md"]]], ["Components, defaults", [["Library 2, Defaults", "design/library/02-assets-library.md"]]], ["Components, list", [["Library 3", "design/library/03-components-list.md"]]], ["Components, shared", [["Interface 1", "design/interface/01-shared-components.md"]]], ["Cost model", [["Foundation 1 Part D", "design/foundation/01-current-design.md"]]], ["Countries of the first version", [["Questions 4 section 3", "design/questions/04-specs-and-limitations.md"]]], ["Customer Engagement", [["Questions 17 (built in part)", "design/questions/17-customer-engagement.md"], ["specifications, page 1 (Engagement)", "specifications/03-business-system/02-channels.md"], ["Questions 17 section 6 (was Questions 2, 7)", "design/questions/17-customer-engagement.md"]]], ["Differentiation and Outcome", [["Questions 8 section 4 (was Questions 2, 8.2)", "design/questions/08-positioning-tile.md"]]], ["Dual-Intent Buyer, Proxy Buyer", [["Research 5 section 10.5", "design/research/05-positioning-categories.md"], ["Questions 4 section 5", "design/questions/04-specs-and-limitations.md"]]], ["End User questions", [["Research 5 section 9", "design/research/05-positioning-categories.md"], ["Questions 8 section 4 (was Questions 2, 8.2)", "design/questions/08-positioning-tile.md"]]], ["Fields, list", [["Library 4", "design/library/04-fields-list.md"]]], ["First version", [["Questions 4", "design/questions/04-specs-and-limitations.md"]]], ["Folders of the repository", [["ai/folder-plan", "ai/05-folder-plan.md"]]], ["Free texts", [["Interface 3", "design/interface/03-free-text-categories.md"], ["Interface 2 (text holders)", "design/interface/02-text-holders.md"]]], ["Frequency options", [["Interface 4", "design/interface/04-frequency-options.md"]]], ["Future features", [["Questions 4", "design/questions/04-specs-and-limitations.md"]]], ["Glossary", [["app/glossary", "app/03-glossary.md"]]], ["Help texts", [["Interface 9 (as built)", "design/interface/09-help-texts.md"], ["39 (what an \"i\" says)", "design/interface/10-help-texts-guide.md"]]], ["Layout rules and the layout check", [["layout-rules", "ai/09-layout-rules.md"]]], ["Legal forms", [["Questions 4 section 3", "design/questions/04-specs-and-limitations.md"]]], ["Library log", [["Library 6", "design/library/06-library-log.md"], ["archive", "archive/log/library-log-archive.md"], ["Library 7 (app structure)", "design/library/07-app-structure-log.md"]]], ["Market structure (single- and multi-sided)", [["Questions 8 section 4 (was Questions 2, 8.2)", "design/questions/08-positioning-tile.md"], ["Questions 4 (multi-sided is future)", "design/questions/04-specs-and-limitations.md"]]], ["To-do list (Beta and Version 1)", [["Records 2", "design/records/02-to-do-list.md"]]], ["Pop-ups", [["Interface 7", "design/interface/07-popups.md"]]], ["Positioning", [["Questions 8 (the tile as built)", "design/questions/08-positioning-tile.md"], ["Questions 8 section 4 (was Questions 2, 8.2)", "design/questions/08-positioning-tile.md"], ["Research 5", "design/research/05-positioning-categories.md"]]], ["Profile card", [["Questions 13 (as built)", "design/questions/13-profile-questions.md"], ["Questions 2 section 6.4", "design/questions/02-questionnaire-specification.md"]]], ["Purposes of an offering", [["Research 5 sections 7 and 10.4", "design/research/05-positioning-categories.md"]]], ["Reactions (hover, press, focus)", [["Interface 5", "design/interface/05-reactions.md"]]], ["References and sources", [["Research 1", "design/research/01-references.md"], ["Research 6 (positioning)", "design/research/06-positioning-sources.md"]]], ["Relationships (buyer and user)", [["Research 5 section 6", "design/research/05-positioning-categories.md"], ["Questions 4 section 5", "design/questions/04-specs-and-limitations.md"]]], ["Research", [["Research 2", "design/research/02-research.md"], ["Research 4", "design/research/04-age-limits-by-activity.md"], ["Research 6", "design/research/06-positioning-sources.md"]]], ["Rule 14 (lists come from documents)", [["Questions 2 section 3", "design/questions/02-questionnaire-specification.md"]]], ["Segment card", [["Questions 12 (as built)", "design/questions/12-segment-questions.md"], ["Questions 2 section 6.3", "design/questions/02-questionnaire-specification.md"]]], ["Shared components", [["Interface 1", "design/interface/01-shared-components.md"]]], ["Structure tables", [["Records 4", "design/records/04-structure-tables.md"]]], ["Text holders", [["Interface 2", "design/interface/02-text-holders.md"]]], ["Text links", [["Interface 6", "design/interface/06-text-links.md"]]], ["Tile and card pattern", [["layout-rules sections 6, 8 to 10", "ai/09-layout-rules.md"]]], ["Tooltips", [["Interface 8", "design/interface/08-tooltips.md"]]], ["Symbols of the Capabilities, the Systems and the Resources (icons)", [["Interface 11", "design/interface/11-symbols.md"]]], ["Verification (what to run after a change)", [["toolchain playbook", "ai/03-toolchain-and-verification-playbook.md"]]], ["Tests (what each one checks)", [["testing/app-tests-guide", "testing/01-app-tests-guide.md"]]], ["Organisation tile", [["Questions 7 (as built)", "design/questions/07-organisation-tile.md"], ["Questions 7 section 4 (was Questions 2, 8.5)", "design/questions/07-organisation-tile.md"]]], ["Tile documents (the form and the list)", [["Questions 1 section 11", "design/questions/01-questionnaire-plan.md"]]], ["Competitor card", [["Questions 14 (as built)", "design/questions/14-competitor-questions.md"], ["Questions 2 section 6.6", "design/questions/02-questionnaire-specification.md"]]], ["Value Proposition", [["Questions 15 (built in part)", "design/questions/15-value-proposition.md"], ["Questions 2 section 6.7", "design/questions/02-questionnaire-specification.md"]]], ["Offering card", [["Questions 16 (built in part)", "design/questions/16-offering-questions.md"], ["Questions 2 section 6.8", "design/questions/02-questionnaire-specification.md"]]], ["Card links (proposal)", [["archive", "archive/proposals/card-links.md"]]], ["Lists and classifications", [["Research 3", "design/research/03-lists-and-classifications.md"]]], ["Purpose & Beliefs (Mission, Vision, Values, Principles, Philosophy, Manifesto)", [["Questions 9 (as built)", "design/questions/09-purpose-and-beliefs.md"], ["Questions 2 section 8.1", "design/questions/02-questionnaire-specification.md"]]], ["Ambassador (Brand)", [["Questions 11 (built in part)", "design/questions/11-ambassador.md"], ["specifications, Brand System", "specifications/02-brand-system/01-brand.md"]]], ["Financial pages and Inventory (tiles)", [["Questions 20 (built in part)", "design/questions/20-financials-and-inventory.md"], ["specifications, the Inventory", "specifications/05-inventory/README.md"]]], ["Strategy (SWOT, Compass, Themes, Metrics)", [["Questions 21 (built in part)", "design/questions/21-strategy.md"], ["specifications, Strategy System", "specifications/04-strategy-system/01-situation-and-direction.md"]]], ["Questions, the plan and the guide", [["Questions 6 (the register: every question and its code)", "design/questions/06-questions-register.md"], ["Questions 1", "design/questions/01-questionnaire-plan.md"], ["Questions 3", "design/questions/03-question-guide.md"], ["Questions 2", "design/questions/02-questionnaire-specification.md"]]], ["Channel fees and Sales Forecast additions", [["Questions 18", "design/questions/18-channel-fees-and-sales-forecast.md"], ["Global Settings", "specifications/07-settings/README.md"]]], ["Delivery and capacity", [["Questions 19 (Capacity & Delivery, built in part)", "design/questions/19-capacity-and-delivery.md"], ["Research 7 (research)", "design/research/07-delivery-and-capacity-research.md"]]], ["Legal starts (registrations, taxes, legal expenses)", [["Questions 10", "design/questions/10-legal-starts.md"]]], ["Auto-filled answers (drafts, starts, worked-out figures)", [["Questions 5", "design/questions/05-auto-filled-answers.md"]]], ["Beta questionnaire", [["Research 8 (proposal)", "design/research/08-beta-questionnaire.md"]]], ["Workbook (Business and Financial Documents, Review, References, Glossary, Card Notes)", [["specifications, the Workbook", "specifications/06-workbook/README.md"]]], ["Settings (Global Settings, Appearance, Focus)", [["specifications, Settings", "specifications/07-settings/README.md"], ["Global Settings", "specifications/07-settings/README.md"]]], ["Brand System pages", [["specifications", "specifications/02-brand-system/01-brand.md"]]], ["Strategy System pages", [["specifications", "specifications/04-strategy-system/01-situation-and-direction.md"]]], ["Identity System pages", [["specifications", "specifications/01-identity-system/01-definition.md"]]], ["Inventory", [["specifications", "specifications/05-inventory/README.md"], ["Questions 20 (IN1 to IN5)", "design/questions/20-financials-and-inventory.md"]]], ["Future features (after Version 1)", [["Guide 3", "guide/03-future-features.md"]]]
];
{
    const missing = TOPICS.flatMap(([, refs]) => refs.map(r => r[1])).filter(f => !existsSync(R + "docs/" + f));
    if (missing.length) { console.error("index.md: missing files " + [...new Set(missing)].join(", ")); process.exit(1); }
    const sorted = [...TOPICS].sort((x, y) => x[0].localeCompare(y[0]));
    const out = ["# Index of the documents", "", "Status: **index**, updated " + new Date().toISOString().slice(0, 10) + ", written by `npm run docs:index` (the subjects are in `tools/scripts/docs/write-index.mjs`; do not edit by hand). An alphabetical list of subjects and where each is described. The contents by chapter are in [README.md](README.md); the places in the app are in [app/02-index.md](app/02-index.md); the terms are in [app/03-glossary.md](app/03-glossary.md).", ""];
    let letter = "";
    for (const [topic, refs] of sorted) {
        const l = topic[0].toUpperCase();
        if (l !== letter) { letter = l; out.push("## " + l, ""); }
        out.push("- **" + topic + "**: " + refs.map(([label, f]) => "[" + label + "](" + f + ")").join("; "));
    }
    writeFileSync(R + "docs/index.md", out.join("\n") + "\n");
    console.log("docs/index.md written");
}

