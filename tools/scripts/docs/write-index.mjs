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
  ["docs/app/glossary.md", "reference", "One line per term: the framework, the app, the business stage, positioning, buyer and user, the question ids, the documents.", true]
];
const AI = [
  ["docs/ai/README.md", "index", "The map of this folder: what to read first, what to read for a task.", false],
  ["docs/ai/ai-collaboration-rules.md", "rules", "Standing rules for an AI assistant: commit but do not push, no unrequested changes, when to ask, what done requires, how work flows.", true],
  ["docs/ai/toolchain-and-verification-playbook.md", "playbook", "What to run after a change (typecheck, tests, the lints and document checks, build, layout check) and the list of expected test failures.", true],
  ["docs/ai/framework-dsl-grammar.md", "reference", "Grammar of the Markdown that defines a System's content.", true],
  ["docs/ai/framework-conventions-and-patterns.md", "reference", "The architectural patterns and the data model of the framework.", true],
  ["docs/ai/review-criteria.md", "rules", "The standard a screen is judged by: criteria by kind (type, spacing, controls, colour, tiles, cards, tables, windows, pages, data), how each is measured, the report.", true],
  ["docs/ai/review-checklist.md", "rules", "What to check when reviewing a table, tile, card, page or control, and the proof before saying done.", true],
  ["docs/ai/code-map.md", "reference", "Where things are in src: the folders and what is in each; the rules for a new file.", true],
  ["docs/ai/layout-rules.md", "rules", "The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check.", false],
  ["docs/ai/tile-and-card-pattern.md", "rules", "How tiles, frames, cards, rails and dialogs are built; the global rules.", true],
  ["docs/ai/card-kinds.md", "reference", "The kinds of card, where each one's code is, how its head is built.", true],
  ["docs/ai/customer-engagement-layout.md", "rules", "Layout of the Customer Engagement tables, the channel resources and the action markers.", true],
  ["docs/ai/outstanding-findings.md", "living list", "Confirmed problems found by diagnostic skills and not yet fixed.", true]
];
const DESIGN = [
  ["docs/design/core/01-current-design.md", "current design", "The single description of what the Foundation capability is: what the app does, how it is organised, the interface elements, the cost model, the automatic rules, the help texts and the colour map.", false],
  ["docs/design/core/02-references.md", "reference", "The source register: the rule for what counts as a reference, and every decision in the app and in these documents with the source behind it.", false],
  ["docs/design/core/03-research.md", "research", "The research behind the design decisions: the question, the recommendation, the reason and the source. Document 1 prevails where they differ.", false],
  ["docs/design/core/04-log.md", "log", "Every change to the app, the design, the documents or the plan, newest on top. The only place a change is written.", false],
  ["docs/design/core/05-not-done-yet.md", "living list", "What has not been done: the road, the plans, the requirements still open, the open decisions and the open points of the reviews.", false],
  ["docs/design/core/06-catalogue-record.md", "generated", "The catalogue record of the app's pages, tiles, cards and controls, from the card scan and the probes.", false],
  ["docs/design/core/07-structure-tables.md", "generated", "The structure tables of the app (pages, chapters, tiles, views, components, fields, card kinds), from the catalogue.", false],
  ["docs/design/library/08-library-system.md", "specification", "The library system: the tables, the library, the inventory and the two logs, with the procedure to change an asset and the steps built.", false],
  ["docs/design/library/09-assets-library.md", "generated", "The assets library: every asset, its variants and its contract.", false],
  ["docs/design/library/10-library-log.md", "log", "The library log: every change to an asset of the library, newest on top.", false],
  ["docs/archive/library/library-log-archive.md", "archive", "Older rows of the library log.", false],
  ["docs/design/library/11-app-structure-log.md", "log", "The app structure log: every change of the tables, that is of the structure of the app, newest on top.", false],
  ["docs/design/library/12-component-defaults.md", "generated", "The default of each component: the reference sizes and the criteria.", false],
  ["docs/design/library/13-components-list.md", "generated", "The components, and which fields and cards use each.", false],
  ["docs/design/library/14-fields-list.md", "generated", "The fields, the add buttons and the field names.", false],
  ["docs/design/library/15-library-vs-app.md", "generated", "The library measured against the running app.", false],
  ["docs/design/current/16-text-holders.md", "generated", "The text holders: sizes, style classes and rules.", true],
  ["docs/design/current/17-frequency-options.md", "generated", "The Frequency options by group, compared with the code.", true],
  ["docs/design/current/18-reactions.md", "current design", "How elements react to the pointer and the keyboard: the reactions by component. The check is in the layout rules; this is the lookup.", true],
  ["docs/design/current/19-text-links.md", "generated", "The text link: look and behaviour, from the code and the walk of the app.", true],
  ["docs/design/current/20-free-text-categories.md", "current design", "Free texts in four categories: the categories, the owner's decisions, the proposed limits and what is still to build.", true],
  ["docs/design/current/21-shared-components.md", "current design", "Which components are shared, with their props, and what is still hand-made.", false],
  ["docs/design/current/22-help-texts.md", "generated", "The help texts of the app, from the walk of the running app.", true],
  ["docs/design/current/23-popups.md", "current design", "Pop-ups in six categories, with their placement rules and the order of fallbacks.", true],
  ["docs/design/current/24-tooltips.md", "current design", "Which controls have a tooltip, what it says, its look and its rules. This document owns the tip.", true],
  ["docs/design/current/25-folder-plan.md", "current design", "The folders of the repository: the app files, the examples, the working files and the exports, and the documents folder.", true],
  ["docs/design/questionnaire/27-questionnaire-plan.md", "proposal", "The questionnaire plan: the goal, the funnel, the one test (does an answer save the founder work?), the order of building and what was cut.", true],
  ["docs/design/questionnaire/28-questionnaire-specification.md", "proposal", "The questionnaire specification: every question, option and rule for the Identity, Segment, Profile, Competitor, Offering and Engagement cards, the connections and the evidence.", true],
  ["docs/design/questionnaire/29-question-guide.md", "proposal", "The question guide: the flow of the questions as trees, the key branches and how a question earns its place.", true],
  ["docs/design/questionnaire/30-age-limits-by-activity.md", "research", "Age limits by activity and country: which kinds of business are connected with a minimum age (direct or possible) in the six countries, with sources and status.", true],
  ["docs/design/questionnaire/31-positioning-categories.md", "collection", "The owner's positioning data as given (age stages, buyer categories, relationships, purposes), the register of decisions on it and the reference tables.", true],
  ["docs/design/questionnaire/32-positioning-sources.md", "research", "The sources behind each positioning list of doc 31, what has none, and the pages checked.", true],
  ["docs/design/questionnaire/33-specs-and-limitations.md", "specification", "The first published version: language, countries, legal forms, market structure, relationships, buyer and user, ages. It governs the other questionnaire documents.", true],
  ["docs/design/questionnaire/34-future-features.md", "living list", "Everything that is not in the first published version: other languages and countries, multi-sided, B2G, G2B, the detailed positioning data, age rules, research to do.", true],
  ["docs/design/current/26-card-structure.md", "current design", "Card structure: what the user can reach in each card, row by row, and why. The structure tables and the catalogue record are generated from it.", true],
  ["docs/design/questionnaire/35-lists-and-classifications.md", "proposal", "The countries, the shared lists, the national crosswalks, the industry lists, the activity cascade, the codes and the classification data (section 5 of the former questionnaire specification).", true]
];
const chapter = (name) => DESIGN.filter(([p]) => p.startsWith("docs/design/" + name + "/"));
const CURRENT = chapter("current"), LIBRARY = chapter("library"), CORE = chapter("core"), QUESTIONNAIRE = chapter("questionnaire");
const ARCHIVED_DESIGN = DESIGN.filter(([p]) => p.startsWith("docs/archive/"));
const SPEC = [
  ["docs/specifications/identity-system/README.md", "specification", "The Identity System: index of the pages that have a document of their own.", true],
  ["docs/specifications/identity-system/page-1-definition.md", "current design", "1. Identity System, 1. Definition: the master tile with its four tiles (Organization, Early Positioning, Mission, Vision), its layout, reactions and readers, and the extra information that is neither built nor a future feature.", true],
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

const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 _-]/g, "").replace(/ /g, "-");
const archiveRows = [...ARCHIVED_DESIGN.map(([p, k, w]) => [p, k, w]), ...ar];
const CHAPTERS = [
  ["The standard of the documents", "How the documents are numbered, headed and written.", STANDARD],
  ["The app (`app/`)", "How the app is entered, its Systems and pages, the places in it, and the terms.", APP],
  ["The design and its records (`design/core/`, documents 1 to 7)", "The current design of the Foundation, the sources, the research, the log of every change, what has not been done, and the generated catalogue and structure tables.", CORE],
  ["The library (`design/library/`, documents 8 to 15)", "The assets library, its generated lists, its logs, and the library measured against the app.", LIBRARY],
  ["The current design (`design/current/`, documents 16 to 26)", "What the app is today in detail: the texts, the reactions, the shared components, the pop-ups, the tooltips, the folders and the card structure.", CURRENT],
  ["The first version and the questionnaire (`design/questionnaire/`, documents 27 to 35)", "What the first published version contains (read 33 first; it governs), what it leaves for later (34), and the questions, the lists and the research behind them. Reading order: 33, 34, then 27 (the plan), 28 (every question and rule), 29 (the flow), 35 (the lists and classifications), 31 and 32 (the positioning decisions and their sources), 30 (age limits).", QUESTIONNAIRE],
  ["Rules for the assistant (`ai/`)", "Standing rules, references and playbooks for an AI assistant working on the project.", AI],
  ["The specifications (`specifications/`)", "The pages of the Business System and of the Identity System.", SPEC],
  ["The archive (`archive/`)", "Documents that are finished or replaced; each is kept for its information.", "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + archiveRows.map(row).join("\n") + "\n"]
];
const idx = `# The documents of NorthStardustStudio

Status: **index**, updated ${new Date().toISOString().slice(0, 10)}. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (\`design/core/04-log.md\`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (nothing built; in the archive), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *archive* (finished or older; kept for the record).
- **The standard**: every document follows [standard.md](standard.md) (numbering, the head, the kinds, how a document is written); \`npm run docs:standard\` checks it, and each chapter folder has a README written from the same data.
- **Where the code and a document disagree, the code is right** and the document is the one to fix. The checks that keep them honest: \`npm run docs:check\` (generated sections), \`npm run tables:check\`, \`npm run library:check\`, and the document-reference test (six documents name only properties, classes and files the code has).
- **This index is written by \`npm run docs:index\`** (the lists are in \`tools/scripts/docs/write-index.mjs\`; a new document is added there). Do not edit it by hand.
- **Who reads what**: an assistant starts with \`ai/README.md\`; the owner starts with \`app/contents.md\` (the map), \`design/core/05-not-done-yet.md\` (what is open) and \`design/core/04-log.md\` (what changed).

## Contents

${CHAPTERS.map(([title, , ], i) => (i + 1) + ". [" + title.replace(/ \(`[^`]*`\)$/, "") + "](#" + slug((i + 1) + ". " + title) + ")").join("\n")}

The documents are numbered in the order of the chapters (the number is in the file name and the title, and it is how they cite one another: "doc 28"). The alphabetical index of the subjects is [index.md](index.md); the index of the places in the app is [app/index.md](app/index.md); the terms are in [app/glossary.md](app/glossary.md).

${CHAPTERS.map(([title, blurb, list], i) => "## " + (i + 1) + ". " + title + "\n\n" + blurb + "\n\n" + (typeof list === "string" ? list : table(list))).join("\n")}
`;


{
    const nums = DESIGN.map(([p]) => /\/(\d\d)-/.exec(p)).filter(Boolean).map(m => +m[1]).sort((x, y) => x - y);
    const gaps = []; for (let n = 1; n <= nums[nums.length - 1]; n++) if (!nums.includes(n)) gaps.push(n);
    if (gaps.length || new Set(nums).size !== nums.length) { console.error("the design documents are not numbered 1 to " + nums[nums.length - 1] + " without a gap or a repeat: gaps " + gaps.join(", ")); process.exit(1); }
}
writeFileSync(R + "docs/README.md", idx);
console.log("docs/README.md written");

// 5. a README in each design chapter (docs/design/<chapter>/README.md), from the same data
{
    const chapterDefs = [["core", 1, "The design and its records"], ["library", 2, "The library"], ["current", 3, "The current design"], ["questionnaire", 4, "The first version and the questionnaire"]];
    const lists = { core: CORE, library: LIBRARY, current: CURRENT, questionnaire: QUESTIONNAIRE };
    const rowIn = ([p, kind, what]) => "| [" + p.split("/").pop() + "](" + p.split("/").pop() + ") | " + kind + " | " + what + " | " + date(p) + " |";
    for (const [name, at, title] of chapterDefs) {
        const list = lists[name];
        const nums = list.map(([p]) => +/\/(\d\d)-/.exec(p)[1]);
        const scope = CHAPTERS[at + 1][1];
        const text = ["# " + title + " (documents " + Math.min(...nums) + " to " + Math.max(...nums) + ")", "",
            "Status: **index**, updated " + new Date().toISOString().slice(0, 10) + ". Written by `npm run docs:index` from `tools/scripts/docs/write-index.mjs`; do not edit by hand.", "",
            scope, "",
            "The standard for these documents is [the standard of the documents](../../standard.md); the contents of all the documents are [README.md](../../README.md) and the alphabetical index is [index.md](../../index.md).", "",
            "| Document | Kind | What it holds | Updated |", "|---|---|---|---|", ...list.map(rowIn), ""].join("\n");
        writeFileSync(R + "docs/design/" + name + "/README.md", text);
    }
    console.log("chapter READMEs written");
}


// 4. the subject index (docs/index.md): topic -> where it is described
const TOPICS = [ [ "Accessibility (user needs)", [ [ "31 section 3", "design/questionnaire/31-positioning-categories.md" ], [ "34 (future)", "design/questionnaire/34-future-features.md" ] ] ], [ "Activities and codes (classifications)", [ [ "35 sections 5.7 to 5.10", "design/questionnaire/35-lists-and-classifications.md" ], [ "28 section 8.5", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Age limits by activity and country", [ [ "30", "design/questionnaire/30-age-limits-by-activity.md" ], [ "31 section 10.2", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "Age stages", [ [ "31 section 10.1", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "App, contents", [ [ "app/contents", "app/contents.md" ] ] ], [ "App, places (index)", [ [ "app/index", "app/index.md" ] ] ], [ "Archive", [ [ "README section 9", "README.md" ] ] ], [ "Standard of the documents", [ [ "standard", "standard.md" ] ] ], [ "Assets library", [ [ "08", "design/library/08-library-system.md" ], [ "09", "design/library/09-assets-library.md" ] ] ], [ "Audience (Identity)", [ [ "28 section 8.2", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Business stage and Opening Date", [ [ "28 section 8.2a", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Buyer category and life stage", [ [ "33 section 5", "design/questionnaire/33-specs-and-limitations.md" ], [ "31", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "Business System pages", [ [ "specifications", "specifications/business-system/README.md" ] ] ], [ "Card kinds", [ [ "card-kinds", "ai/card-kinds.md" ] ] ], [ "Card structure", [ [ "26", "design/current/26-card-structure.md" ], [ "tile and card pattern", "ai/tile-and-card-pattern.md" ] ] ], [ "Caregiving", [ [ "31 section 4", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "Catalogue record", [ [ "06", "design/core/06-catalogue-record.md" ] ] ], [ "Change history (log)", [ [ "04", "design/core/04-log.md" ] ] ], [ "Colour map of the pages", [ [ "01 Part I", "design/core/01-current-design.md" ] ] ], [ "Components, defaults", [ [ "12", "design/library/12-component-defaults.md" ] ] ], [ "Components, list", [ [ "13", "design/library/13-components-list.md" ] ] ], [ "Components, shared", [ [ "21", "design/current/21-shared-components.md" ] ] ], [ "Cost model", [ [ "01 Part D", "design/core/01-current-design.md" ] ] ], [ "Countries of the first version", [ [ "33 section 3", "design/questionnaire/33-specs-and-limitations.md" ] ] ], [ "Customer Engagement", [ [ "specifications page 2", "specifications/business-system/page-2-section-1-channels.md" ], [ "28 section 7", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Differentiation and Outcome", [ [ "28 section 8.2", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Dual-Intent Buyer, Proxy Buyer", [ [ "31 section 10.5", "design/questionnaire/31-positioning-categories.md" ], [ "33 section 5", "design/questionnaire/33-specs-and-limitations.md" ] ] ], [ "End User questions", [ [ "31 section 9", "design/questionnaire/31-positioning-categories.md" ], [ "28 section 8.2", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Fields, list", [ [ "14", "design/library/14-fields-list.md" ] ] ], [ "First version", [ [ "33", "design/questionnaire/33-specs-and-limitations.md" ] ] ], [ "Folders of the repository", [ [ "25", "design/current/25-folder-plan.md" ] ] ], [ "Free texts", [ [ "20", "design/current/20-free-text-categories.md" ], [ "16 (text holders)", "design/current/16-text-holders.md" ] ] ], [ "Frequency options", [ [ "17", "design/current/17-frequency-options.md" ] ] ], [ "Future features", [ [ "34", "design/questionnaire/34-future-features.md" ] ] ], [ "Glossary", [ [ "app/glossary", "app/glossary.md" ] ] ], [ "Help texts", [ [ "22", "design/current/22-help-texts.md" ] ] ], [ "Layout rules and the layout check", [ [ "layout-rules", "ai/layout-rules.md" ] ] ], [ "Legal forms", [ [ "33 section 3", "design/questionnaire/33-specs-and-limitations.md" ] ] ], [ "Library log", [ [ "10", "design/library/10-library-log.md" ], [ "archive", "archive/library/library-log-archive.md" ], [ "11 (app structure)", "design/library/11-app-structure-log.md" ] ] ], [ "Market structure (single- and multi-sided)", [ [ "28 section 8.2", "design/questionnaire/28-questionnaire-specification.md" ], [ "34 (multi-sided is future)", "design/questionnaire/34-future-features.md" ] ] ], [ "Not done yet", [ [ "05", "design/core/05-not-done-yet.md" ] ] ], [ "Pop-ups", [ [ "23", "design/current/23-popups.md" ] ] ], [ "Positioning", [ [ "28 section 8.2", "design/questionnaire/28-questionnaire-specification.md" ], [ "31", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "Profile card", [ [ "28 section 6.4", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Purposes of an offering", [ [ "31 sections 7 and 10.4", "design/questionnaire/31-positioning-categories.md" ] ] ], [ "Reactions (hover, press, focus)", [ [ "18", "design/current/18-reactions.md" ] ] ], [ "References and sources", [ [ "02", "design/core/02-references.md" ], [ "32 (positioning)", "design/questionnaire/32-positioning-sources.md" ] ] ], [ "Relationships (buyer and user)", [ [ "31 section 6", "design/questionnaire/31-positioning-categories.md" ], [ "33 section 5", "design/questionnaire/33-specs-and-limitations.md" ] ] ], [ "Research", [ [ "03", "design/core/03-research.md" ], [ "30", "design/questionnaire/30-age-limits-by-activity.md" ], [ "32", "design/questionnaire/32-positioning-sources.md" ] ] ], [ "Rule 14 (lists come from documents)", [ [ "28 section 3", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Segment card", [ [ "28 section 6.3", "design/questionnaire/28-questionnaire-specification.md" ] ] ], [ "Shared components", [ [ "21", "design/current/21-shared-components.md" ] ] ], [ "Structure tables", [ [ "07", "design/core/07-structure-tables.md" ] ] ], [ "Text holders", [ [ "16", "design/current/16-text-holders.md" ] ] ], [ "Text links", [ [ "19", "design/current/19-text-links.md" ] ] ], [ "Tile and card pattern", [ [ "tile-and-card-pattern", "ai/tile-and-card-pattern.md" ] ] ], [ "Tooltips", [ [ "24", "design/current/24-tooltips.md" ] ] ], [ "Verification (what to run after a change)", [ [ "toolchain playbook", "ai/toolchain-and-verification-playbook.md" ] ] ], [ "Questions, the plan and the guide", [ [ "27", "design/questionnaire/27-questionnaire-plan.md" ], [ "29", "design/questionnaire/29-question-guide.md" ], [ "28", "design/questionnaire/28-questionnaire-specification.md" ] ] ]
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

