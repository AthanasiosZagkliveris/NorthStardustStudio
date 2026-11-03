/**
 * THE CLAUDE PROJECT KIT: copies the documents named below into `claude-project/knowledge/` (flat, one folder), ready to be added as the files of a Claude project (claude.ai > Projects).
 * The copies are a snapshot, not a second owner: the folder is not committed (.gitignore), and the script is run again whenever the documents change.
 *
 *   npm run project:kit
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..") + path.sep;
const OUT = R + "claude-project/knowledge/";

/** [source, name in the project]. Names are flat; the numbers of the design documents stay in them so a citation ("doc 35") finds its file. */
const FILES = [
    ["docs/README.md", "README.md"],
    ["docs/standard.md", "standard.md"],
    ["docs/app/index.md", "app-index.md"],
    ["docs/app/contents.md", "app-contents.md"],
    ["docs/app/glossary.md", "glossary.md"],
    ["docs/ai/ai-collaboration-rules.md", "ai-collaboration-rules.md"],
    ["docs/ai/tile-and-card-pattern.md", "tile-and-card-pattern.md"],
    ["docs/ai/code-map.md", "code-map.md"],
    ["docs/design/core/01-current-design.md", "01-current-design.md"],
    ["docs/design/core/05-not-done-yet.md", "05-not-done-yet.md"],
    ["docs/design/current/21-shared-components.md", "21-shared-components.md"],
    ["docs/design/questionnaire/33-specs-and-limitations.md", "33-specs-and-limitations.md"],
    ["docs/design/questionnaire/35-segment-questions.md", "35-segment-questions.md"],
    ["docs/design/questionnaire/36-profile-questions.md", "36-profile-questions.md"],
    ["docs/design/questionnaire/37-organization-fields.md", "37-organization-fields.md"],
    ["docs/design/questionnaire/38-positioning-questions.md", "38-positioning-questions.md"],
    ["docs/design/questionnaire/39-help-texts-guide.md", "39-help-texts-guide.md"],
    ["docs/design/questionnaire/40-tile-documents.md", "40-tile-documents.md"],
];

if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });
copyFileSync(R + "claude-project/instructions.md", OUT + "instructions.md");
let missing = 0, total = statSync(OUT + "instructions.md").size;
for (const [from, to] of FILES) {
    if (!existsSync(R + from)) { console.error("missing: " + from); missing++; continue; }
    copyFileSync(R + from, OUT + to);
    total += statSync(OUT + to).size;
}
console.log((readdirSync(OUT).length) + " files, " + Math.round(total / 1024) + " KB -> claude-project/knowledge/" + (missing ? " (" + missing + " missing)" : ""));
process.exit(missing ? 1 : 0);
