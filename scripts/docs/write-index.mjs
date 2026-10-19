/* Writes docs/README.md: one line per document (kind, what it holds, the date of its last commit). Run: npm run docs:index. A new document is added to the lists below. */
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const R = fileURLToPath(new URL("../../", import.meta.url));
const git = (args) => execSync("git " + args, { cwd: R, encoding: "utf8" }).trim();
const date = (p) => git('log -1 --format=%cs -- "' + p + '"') || "2026-10-20";

// [path, kind, what it is, addHeader]
const AI = [
  ["docs/ai/README.md", "index", "The map of this folder: what to read first, what to read for a task.", false],
  ["docs/ai/ai-collaboration-rules.md", "rules", "Standing behavioural rules for an AI assistant: when to ask, when to push, what done requires.", true],
  ["docs/ai/environment-and-toolchain-playbook.md", "playbook", "The toolchain procedure: sync, typecheck, build, preview, verify.", true],
  ["docs/ai/verification-and-regression-playbook.md", "playbook", "What to run after a change; the living list of expected test failures.", true],
  ["docs/ai/ai-development-methodology.md", "reference", "How a change flows from request to integration; when to create or reuse knowledge.", true],
  ["docs/ai/framework-dsl-grammar.md", "reference", "Grammar of the Markdown that defines a System's content.", true],
  ["docs/ai/framework-conventions-and-patterns.md", "reference", "The architectural patterns and the data model of the framework.", true],
  ["docs/ai/glossary.md", "reference", "One line per project term, with a pointer to where it is explained.", true],
  ["docs/ai/app-guide.md", "reference", "Where each part of the app is, what it is for, with the code locations.", true],
  ["docs/ai/layout-rules.md", "rules", "The measured rulebook of the Foundation pages (tokens, sizes, alignment, interactions) and the layout check.", false],
  ["docs/ai/tile-and-card-pattern.md", "rules", "How tiles, frames, cards, rails and dialogs are built; the global rules.", true],
  ["docs/ai/card-kinds.md", "reference", "The kinds of card, where each one's code is, how its head is built.", true],
  ["docs/ai/customer-engagement-layout.md", "rules", "Layout of the Customer Engagement tables, the channel resources and the action markers.", true],
  ["docs/ai/card-field-measures-report.md", "snapshot", "A measured report of the sizes and set-up of the card fields.", true],
  ["docs/ai/outstanding-findings.md", "living list", "Confirmed problems found by diagnostic skills and not yet fixed.", true],
  ["docs/ai/cost-section-proposal.md", "proposal", "What the Cost section should record and how it should look.", false],
  ["docs/ai/segment-by-selection-proposal.md", "proposal", "Building a Customer Segment by selection.", false]
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
  ["docs/design/10-library-log-archive.md", "archive", "Older rows of the library log.", false],
  ["docs/design/11-app-structure-log.md", "log", "The app structure log.", false],
  ["docs/design/12-field-names.md", "generated", "The field names.", false],
  ["docs/design/13-component-defaults.md", "generated", "Component defaults.", false],
  ["docs/design/14-components-list.md", "generated", "The components.", false],
  ["docs/design/15-fields-by-component.md", "generated", "Fields and cards by component.", false],
  ["docs/design/16-fields-list.md", "generated", "The fields.", false],
  ["docs/design/17-library-vs-app.md", "reference", "The library measured against the app.", false],
  ["docs/design/18-text-holders.md", "current design", "The text holders: sizes and rules.", true],
  ["docs/design/19-frequency-options.md", "current design", "The Frequency options by group, and the open proposals.", true],
  ["docs/design/20-reactions.md", "current design", "How elements react to the pointer and the keyboard.", true],
  ["docs/design/21-text-links.md", "current design", "The text link: look and behaviour.", true],
  ["docs/design/22-free-text-categories.md", "current design", "Free texts in four categories.", true],
  ["docs/design/23-shared-components.md", "current design", "Which components are shared, which are not, what is left to unify. Dated states, newest on top.", false],
  ["docs/design/24-help-texts.md", "current design", "The help texts of the app.", true],
  ["docs/design/25-popups.md", "current design", "Pop-ups in six categories, with their placement rules.", true],
  ["docs/design/card-scan-2026-10-15.md", "snapshot", "A snapshot of every card written by scripts/cards/report.mjs.", false]
];
const SPEC = [
  ["docs/specifications/business-system/README.md", "specification", "The Business System: index of the pages and the editor mapping.", true],
  ["docs/specifications/business-system/page-1-foundation.md", "specification", "Page 1: Foundation.", true],
  ["docs/specifications/business-system/page-2-section-1-channels.md", "specification", "Page 2, section 1: the channels.", true],
  ["docs/specifications/business-system/page-2-section-2-customer-relationships.md", "specification", "Page 2, section 2: customer relationships.", true],
  ["docs/specifications/business-system/page-2-section-2-customer-relationships-worked-example.md", "specification", "A worked example of the customer relationships section.", true],
  ["docs/specifications/business-system/page-3-infrastructure-and-capability.md", "specification", "Page 3: Infrastructure and Capability.", true],
  ["docs/specifications/business-system/page-4-financial-foundation.md", "specification", "Page 4: Financial Foundation.", true],
  ["docs/specifications/business-system/page-5-financial-sustainability.md", "specification", "Page 5: Financial Sustainability.", true],
  ["docs/specifications/shared-workspace/README.md", "proposal", "Shared Workspace: working together without a server. Nothing built.", false]
];
const ARCHIVE = [
  ["docs/engineering-phase-completion.md", "docs/archive/engineering-phase-completion.md", "archive", "The engineering phase completion report."],
  ["docs/superpowers/plans/2026-09-27-navigation-rails-and-folding.md", "docs/archive/plans/2026-09-27-navigation-rails-and-folding.md", "archive", "Plan: navigation rails and card folding (done)."],
  ["docs/superpowers/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md", "docs/archive/plans/2026-09-29-workspace-D-duplicate-scenarios-compare.md", "archive", "Brief: workspace features D, duplicate, scenarios, compare (not started)."],
  ["docs/superpowers/plans/2026-09-29-workspace-E-founder-helpers.md", "docs/archive/plans/2026-09-29-workspace-E-founder-helpers.md", "archive", "Brief: workspace features E, helpers for founders (not started)."]
];

// 3. the index
const row = ([p, kind, what]) => "| [" + p.replace(/^docs\//, "") + "](" + p.replace(/^docs\//, "") + ") | " + kind + " | " + what + " | " + date(p) + " |";
const ar = ARCHIVE.map(([, to, kind, what]) => [to, kind, what]);
const table = (list) => "| Document | Kind | What it holds | Updated |\n|---|---|---|---|\n" + list.map(row).join("\n") + "\n";
const idx = `# The documents of NorthStardustStudio

Status: **index**, updated ${new Date().toISOString().slice(0, 10)}. One line per document: where it is, what kind it is, what it holds, when it last changed (the date of its last commit).

## How the documents are kept

- **A change is written in the log** (\`design/04-log.md\`), newest row on top, and nowhere else. The other documents **describe the present**: each says what is true now, under a dated heading, the newest on top, with its own status line (kind and date) under the title.
- **Kinds**: *rules* (what must hold; a check enforces most of them), *reference* (how things are, to look up), *current design* (what the app is today), *living list* (an open list: an item leaves it when done and the log records it), *log*, *proposal* (nothing built), *specification* (what a page asks and shows), *playbook* (a procedure), *generated* (written by a script; never edit by hand, run its command), *snapshot* (a measured picture on a date; not updated), *archive* (finished or older; kept for the record).
- **Where the code and a document disagree, the code is right** and the document is the one to fix. The checks that keep them honest: \`npm run docs:check\` (generated sections), \`npm run tables:check\`, \`npm run library:check\`, and the document-reference test (the six rule documents name only properties, classes and files the code has).
- **This index is written by \`npm run docs:index\`** (the lists are in \`scripts/docs/write-index.mjs\`; a new document is added there). Do not edit it by hand.
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
| [examples/](examples/) | data | The two example organizations (Quillfield Automation, Lumen & Loom Studio) as JSON; the same files are in \`src/data/examples/\`. | ${date("docs/examples/quillfield-automation-llc.json")} |
${ar.map(row).join("\n")}
`;
writeFileSync(R + "docs/README.md", idx);
console.log("docs/README.md written");
