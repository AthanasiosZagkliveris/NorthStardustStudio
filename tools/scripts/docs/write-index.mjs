/* Writes docs/README.md: one line per document (kind, what it holds, the date of its last commit). Run: npm run docs:index. A new document is added to the lists below. */
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const R = fileURLToPath(new URL("../../../", import.meta.url));
const git = (args) => execSync("git " + args, { cwd: R, encoding: "utf8" }).trim();
const date = (p) => git('log -1 --format=%cs -- "' + p + '"') || new Date().toISOString().slice(0, 10);

// [path, kind, what it is, addHeader]
const AI = [
  ["docs/ai/README.md", "index", "The map of this folder: what to read first, what to read for a task.", false],
  ["docs/ai/ai-collaboration-rules.md", "rules", "Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows.", true],
  ["docs/ai/toolchain-and-verification-playbook.md", "playbook", "What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures.", true],
  ["docs/ai/framework-dsl-grammar.md", "reference", "Grammar of the Markdown that defines a System's content.", true],
  ["docs/ai/framework-conventions-and-patterns.md", "reference", "The architectural patterns and the data model of the framework.", true],
  ["docs/ai/glossary.md", "reference", "One line per project term, with a pointer to where it is explained.", true],
  ["docs/ai/review-criteria.md", "rules", "The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured, the report.", true],
  ["docs/ai/review-checklist.md", "rules", "What to check when reviewing a table, tile, card, page or control, and the proof before saying done.", true],
  ["docs/ai/code-map.md", "reference", "Where things are in src: the folders and what is in each; the rules for a new file.", true],
  ["docs/ai/app-guide.md", "reference", "Where each part of the app is, what it is for, with the code locations.", true],
  ["docs/ai/layout-rules.md", "rules", "The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check.", false],
  ["docs/ai/tile-and-card-pattern.md", "rules", "How tiles, frames, cards, rails and dialogs are built; the global rules.", true],
  ["docs/ai/card-kinds.md", "reference", "The kinds of card, where each one's code is, how its head is built.", true],
  ["docs/ai/customer-engagement-layout.md", "rules", "Layout of the Customer Engagement tables, the channel resources and the action markers.", true],
  ["docs/ai/outstanding-findings.md", "living list", "Confirmed problems found by diagnostic skills and not yet fixed.", true]
];
const DESIGN = [
  ["docs/design/01-current-design.md", "current design", "Every kind of element the Foundation capability is built from, by layer.", false],
  ["docs/design/02-references.md", "reference", "Every decision in the app and the source behind it.", false],
  ["docs/design/03-research.md", "reference", "The research record: sources, findings, how they were weighed.", false],
  ["docs/design/04-log.md", "log", "History, changes and updates, newest on top. Every change is written here, nowhere else.", false],
  ["docs/design/05-not-done-yet.md", "living list", "The road, the plans and what has not been done yet.", false],
  ["docs/design/06-catalogue-record.md", "generated", "The catalogue record of the app's pages, fields and cards.", false],
  ["docs/design/07-structure-tables.md", "generated", "The structure tables (npm run tables).", false],
  ["docs/design/08-library-system.md", "current design", "The library system: tables, library, inventory and logs.", false],
  ["docs/design/09-assets-library.md", "generated", "The assets library: every asset, its variants and contract.", false],
  ["docs/design/10-library-log.md", "log", "The library log, newest rows on top (npm run library:log).", false],
  ["docs/design/11-library-log-archive.md", "archive", "Older rows of the library log.", false],
  ["docs/design/12-app-structure-log.md", "log", "The app structure log.", false],
  ["docs/design/13-component-defaults.md", "generated", "Component defaults.", false],
  ["docs/design/14-components-list.md", "generated", "The components, and which fields and cards use each.", false],
  ["docs/design/15-fields-list.md", "generated", "The fields, the add buttons and the field names.", false],
  ["docs/design/16-library-vs-app.md", "reference", "The library measured against the app.", false],
  ["docs/design/17-text-holders.md", "current design", "The text holders: sizes and rules.", true],
  ["docs/design/18-frequency-options.md", "current design", "The Frequency options by group, and the open proposals.", true],
  ["docs/design/19-reactions.md", "current design", "How elements react to the pointer and the keyboard.", true],
  ["docs/design/20-text-links.md", "current design", "The text link: look and behaviour.", true],
  ["docs/design/21-free-text-categories.md", "current design", "Free texts in four categories.", true],
  ["docs/design/22-shared-components.md", "current design", "Which components are shared, with their props, what is still hand-made, and a short history.", false],
  ["docs/design/23-help-texts.md", "current design", "The help texts of the app.", true],
  ["docs/design/24-popups.md", "current design", "Pop-ups in six categories, with their placement rules.", true],
  ["docs/design/25-tooltips.md", "current design", "Which controls have a tooltip, what it says, and the five rules.", true],
  ["docs/design/26-folder-plan.md", "proposal", "The app files, the examples and the working files: what is where, and a three-step plan to separate them.", true],
  ["docs/design/27-questionnaire-plan.md", "proposal", "The questionnaire plan: the one test (does an answer save the founder work), the funnel from Identity to the journey, a worked example, the 42 drivers, the six building blocks, the stages and the decisions.", true],
  ["docs/design/28-questionnaire-specification.md", "proposal", "The questionnaire specification: the countries and shared lists with examples, the industry list in two levels, every question and option, the connection map with its evidence, the equality rules, the moves and the decisions.", true],
  ["docs/design/29-question-guide.md", "proposal", "The question guide: the flow of questions as trees, the key branching questions, what happens on both, mixed, not sure and other, the order that asks the least, why each question matters to the user, and how to write a new one.", true],
  ["docs/design/30-age-limits-by-activity.md", "research", "Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the UK, Ireland, the USA, Canada, Australia and New Zealand, with the sources, the open conflicts and how the app would use them.", true],
  ["docs/design/31-positioning-categories.md", "collection", "Positioning categories, collected as given by the owner before any question or layout: user age stages, buyer age stages, accessibility and caregiving cross-sections, buyer categories, buyer and user relationships, the offering purpose taxonomy and the relationship-to-purpose mapping, with what it leaves open.", true],
  ["docs/design/32-positioning-sources.md", "research", "Sources for the positioning lists: what supports each list of doc 31 (age stages, buyer categories, relationships, purposes, accessibility, caregiving), what has no acceptable source, and the five search result files with every page opened or marked not opened.", true],
  ["docs/design/33-specs-and-limitations.md", "specification", "The first published version: English only; the six countries and Other with their legal forms, activities and codes; single-sided; B2C and/or B2B; the buyer's category separate from the life stage.", true],
  ["docs/design/34-future-features.md", "living list", "Everything that is not in the first published version: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age limits by country, and the research still to do.", true],
  ["docs/design/35-contents.md", "index", "The questionnaire and first-version documents: what to read first, what each holds, how the first version relates to them.", true],
  ["docs/design/36-glossary.md", "reference", "The names used in the questionnaire documents: business stages, positioning, buyer and user, question ids and marks.", true]
];
const SPEC = [
  ["docs/specifications/business-system/README.md", "specification", "The Business System: index of the pages and the editor mapping.", true],
  ["docs/specifications/business-system/page-1-foundation.md", "specification", "Page 1: Foundation.", true],
  ["docs/specifications/business-system/page-2-section-1-channels.md", "specification", "Page 2, section 1: the channels.", true],
  ["docs/specifications/business-system/page-2-section-2-customer-relationships.md", "specification", "Page 2, section 2: customer relationships.", true],
  ["docs/specifications/business-system/page-2-section-2-customer-relationships-worked-example.md", "specification", "A worked example of the customer relationships section.", true],
  ["docs/specifications/business-system/page-3-infrastructure-and-capability.md", "specification", "Page 3: Infrastructure and Capability.", true],
  ["docs/specifications/business-system/page-4-financial-foundation.md", "specification", "Page 4: Financial Foundation.", true],
  ["docs/specifications/business-system/page-5-financial-sustainability.md", "specification", "Page 5: Financial Sustainability.", true]
];
const ARCHIVE = [
  ["docs/engineering-phase-completion.md", "docs/archive/engineering-phase-completion.md", "archive", "The engineering phase completion report."],
  ["docs/superpowers/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md", "docs/archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md", "archive", "Brief: workspace features D, duplicate, scenarios, compare (not started)."],
  ["docs/superpowers/plans/2026-09-29-workspace-E-founder-helpers.md", "docs/archive/plans/2026-09-29-workspace-E-founder-helpers.md", "archive", "Brief: workspace features E, helpers for founders (not started)."],
  ["docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "docs/archive/plans/2026-10-14-cleanup-and-library-plans.md", "archive", "The clean-up and library plans of 2026-10-14 (old sections 5.6, 5.11 to 5.14 of document 5); what is left is in document 5."],
  ["docs/archive/proposals/cost-section-proposal.md", "docs/archive/proposals/cost-section-proposal.md", "archive", "Proposal: what the Cost section should record (the page was built afterwards)."],
  ["docs/archive/proposals/segment-by-selection-proposal.md", "docs/archive/proposals/segment-by-selection-proposal.md", "archive", "Proposal: building a Customer Segment by selection (not built)."],
  ["docs/archive/proposals/shared-workspace.md", "docs/archive/proposals/shared-workspace.md", "archive", "Proposal: Shared Workspace, working together without a server (not built)."]
];

// 3. the index
const row = ([p, kind, what]) => "| [" + p.replace(/^docs\//, "") + "](" + p.replace(/^docs\//, "") + ") | " + kind + " | " + what + " | " + date(p) + " |";
const ar = ARCHIVE.map(([, to, kind, what]) => [to, kind, what]);
const table = (list) => "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + list.map(row).join("\n") + "\n";
const idx = `# The documents of NorthStardustStudio

Status: **index**, updated ${new Date().toISOString().slice(0, 10)}. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (\`design/04-log.md\`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (nothing built; in the archive), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **Where the code and a document disagree, the code is right** and the document is the one to fix. The checks that keep them honest: \`npm run docs:check\` (generated sections), \`npm run tables:check\`, \`npm run library:check\`, and the document-reference test (six documents name only properties, classes and files the code has).
- **This index is written by \`npm run docs:index\`** (the lists are in \`tools/scripts/docs/write-index.mjs\`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with \`ai/README.md\`; the owner starts with \`design/05-not-done-yet.md\` (what is open) and \`design/04-log.md\` (what changed).

## For the assistant and the rules (\`ai/\`)

${table(AI)}
## The design of the app (\`design/\`)

${table(DESIGN)}
## The specifications (\`specifications/\`)

${table(SPEC)}
## Examples and archive

| Document | Kind | What it holds | Updated |
|---|---|---|---|
${ar.map(row).join("\n")}
`;
writeFileSync(R + "docs/README.md", idx);
console.log("docs/README.md written");
