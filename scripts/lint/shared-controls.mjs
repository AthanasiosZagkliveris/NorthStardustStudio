/**
 * THE SHARED-CONTROL LINT: a shared control (AddButton, TextLink, OptionPicker, MenuOption ...) has ONE look, written in its own stylesheet. A rule in any other stylesheet that sets the
 * LOOK of such a control (its ground, its line, its letters, its height, its padding) is a second look: a place says only where the control stands (its margin, width, position, grid),
 * never how it looks (docs/ai/review-checklist.md, section 1: "No second class that adds a look to a shared control").
 *
 *   npm run lint:controls             fail on a finding beyond the baseline
 *   npm run lint:controls:baseline    record what the stylesheets hold now (only after the owner decided that a second look stays,
 *                                     or after a clean-up removed some)
 *   node scripts/lint/shared-controls.mjs --all   list every finding
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const STYLES = fileURLToPath(new URL("../../src/styles/", import.meta.url));
const BASELINE = fileURLToPath(new URL("./shared-controls-baseline.json", import.meta.url));

/** The class of each shared control -> the stylesheets that own its look (a part of the file's name is enough). */
const CONTROLS = {
    "strategy-add-button": ["accent-button.css", "add-button.css"],
    "plus-box": ["add-button.css", "04-tile-slot-and-floating-card.css"],
    "add-card-tile": ["add-button.css"],
    "text-link": ["text-links.css"],
    "option-picker-trigger": ["option-picker.css"],
    "option-picker-option": ["option-picker.css", "menu-option.css"],
    "menu-option": ["menu-option.css"],
    "remove-button": ["remove-button.css"],
    "radio-choice-option": ["radio-choice.css"],
    "tab-list-tab": ["tab-list.css"],
    "day-button": ["day-button.css"],
    "choice-card": ["choice-card.css"],
    "notepad-chip-open": ["chip.css"],
    "notepad-suggestion": ["suggestion-option.css"],
    "date-format-toggle-option": ["date-format-toggle.css"],
    "label-arrow": ["label-arrow.css"],
    "fold-card-toggle": ["fold-arrow.css"],
    "funnel-box": ["add-button.css"]
};

/** What makes a look: the ground, the line, the letters, the size and the room inside. */
const LOOK = /^(background|border|box-shadow|color|font|letter-spacing|text-transform|text-decoration|text-shadow|outline|height|min-height|line-height|padding)/;

function listCss(dir) {
    return readdirSync(dir).flatMap(name => {
        const full = path.join(dir, name);
        return statSync(full).isDirectory() ? listCss(full) : name.endsWith(".css") ? [full] : [];
    });
}

/** The rules of a stylesheet: [{ selector, body, line }], media blocks entered. */
function rules(text) {
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, " "));
    const found = [];
    let depth = 0;
    let start = 0;
    const stack = [];
    for (let at = 0; at < clean.length; at += 1) {
        const char = clean[at];
        if (char === "{") {
            stack.push({ header: clean.slice(start, at).trim(), from: at + 1 });
            start = at + 1;
            depth += 1;
        } else if (char === "}") {
            const open = stack.pop();
            depth -= 1;
            if (open && !open.header.startsWith("@")) {
                found.push({ selector: open.header, body: clean.slice(open.from, at), line: clean.slice(0, open.from).split("\n").length });
            }
            start = at + 1;
        } else if (char === ";" && depth === 0) {
            start = at + 1;
        }
    }
    return found;
}

/** The class a part of a selector styles: the last compound's classes (what the rule is about, not what it stands under). */
function targets(selectorPart) {
    const last = selectorPart.trim().split(/[\s>+~]+/).filter(Boolean).pop() ?? "";
    return [...last.matchAll(/\.([A-Za-z0-9_-]+)/g)].map(match => match[1]);
}

const findings = [];
for (const file of listCss(STYLES)) {
    const name = path.basename(file);
    const rel = path.relative(STYLES, file).replace(/\\/g, "/");
    for (const rule of rules(readFileSync(file, "utf8").replace(/\r\n/g, "\n"))) {
        const properties = [...rule.body.matchAll(/(?:^|;|\n)\s*([a-z-]+)\s*:/g)].map(match => match[1]).filter(property => LOOK.test(property));
        if (properties.length === 0) {
            continue;
        }
        for (const part of rule.selector.split(",")) {
            for (const target of targets(part)) {
                const owners = CONTROLS[target];
                if (owners && !owners.some(owner => name === owner)) {
                    findings.push({ key: rel + " | " + part.trim().replace(/\s+/g, " ") + " | " + [...new Set(properties)].sort().join(","), line: rule.line, control: target });
                }
            }
        }
    }
}
const unique = [...new Map(findings.map(finding => [finding.key, finding])).values()];

if (process.argv.includes("--write-baseline")) {
    writeFileSync(BASELINE, JSON.stringify(unique.map(finding => finding.key).sort(), null, 2) + "\n");
    console.log("Baseline written: " + unique.length + " second looks.");
    process.exit(0);
}
if (process.argv.includes("--all")) {
    unique.forEach(finding => console.log(finding.control.padEnd(24) + " " + finding.key + "  (line " + finding.line + ")"));
    console.log(unique.length + " findings.");
    process.exit(0);
}
let known = new Set();
try { known = new Set(JSON.parse(readFileSync(BASELINE, "utf8"))); } catch { /* none yet */ }
const newer = unique.filter(finding => !known.has(finding.key));
const gone = [...known].filter(key => !unique.some(finding => finding.key === key));
newer.forEach(finding => console.error("NEW second look on " + finding.control + ": " + finding.key));
if (gone.length) {
    console.log(gone.length + " baseline entr" + (gone.length === 1 ? "y is" : "ies are") + " no longer needed (run npm run lint:controls:baseline).");
}
console.log(unique.length + " second looks, " + newer.length + " beyond the baseline.");
process.exit(newer.length > 0 ? 1 : 0);
