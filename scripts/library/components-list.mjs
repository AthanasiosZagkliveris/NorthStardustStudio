/**
 * Writes the list of the components (docs/design/14-components-list.md) in a form that is easy to read:
 * tables to scan (the components, the variants, the corners), then one block per component with its facts
 * grouped under titles (Size, Text, Shape, Spacing, Reaction, Use), one fact per line, a label before every
 * value, full words (Height, Width) and the unit after every number. The layout follows Baymard's finding on
 * spec sheets (group the specs under subheadings, a single column of label and value) and DITA's properties
 * model (property, value, description).
 *
 *   node scripts/library/components-list.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "../catalogue/build.mjs";
import { library } from "../../src/library/data/library.ts";

const file = "docs/design/14-components-list.md";
const db = await build(".");
const out = [];
const say = (...lines) => out.push(...lines);
const px = n => (n === null || n === undefined ? "" : n + " px");

/** Sizes measured by the scan for components that have no look of their own. */
const EXTRA = {
    "BTN.003": { height: "25 px", width: "76 px", note: "measured by the scan: the Back button and its word" },
    "ARW.001": { height: "44 px", width: "24 px", note: "measured by the scan: page arrow and carousel arrow; each grows 1.2 times on hover" },
    "BUL.001": { height: "12 px (17.4 px when selected)", width: "12 px (17.4 px when selected)", note: "measured by the scan; the one bullet of every rail" },
};
/** The width of the components whose width is not a number of their own. */
const WIDTH = {
    "BTN.001": "32 px (a square)", "BTN.002": "24 px (a circle)", "BTN.003": "76 px", "BTN.004": "fills its column",
    "DRP.001": "set by the layout (fills its column)", "TIK.001": "24 px (a square)", "TXT.001": "set by the layout (fills its column)",
    "LST.001": "fills its column", "NUM.001": "set by the layout", "DAT.001": "set by the layout", "DAT.002": "fits its calendar",
    "DIV.001": "fills its column", "LBL.001": "fits its words", "LBL.HEA.001.001": "fits its words", "TTL.001": "fits its words", "LNK.001": "fits its words", "HLP.001": "fits its words", "LST.001": "fills its column", "ARW.002": "36 px (the fold arrow)", "ARW.LAB.002.001": "24 px", "ARW.TTL.002.002": "28 px"
};
/** What happens under the pointer and the keyboard, in words (measured: docs/design/06-catalogue-record.md). */
const REACTION = {
    "BTN.001": "Hover and focus: the box fills with its colour and the symbol turns light.",
    "BTN.002": "Hover and focus: the circle fills with its colour and the i turns light.",
    "BTN.003": "Hover and focus: the text turns blue.",
    "BTN.004": "Not read yet.",
    "DRP.001": "Hover: the inset edge glows. Focus: a blue ring. In use: the glow and a wire in the contrast colour.",
    "TIK.001": "Hover: a blue ring inside the box. Focus: the browser's outline.",
    "TXT.001": "Hover: the inset edge glows. Focus: a blue ring. While typing: the glow and a wire in the contrast colour.",
    "LST.001": "Like the text holders: the edge glows under the pointer, a blue ring on focus; Enter opens the next row.",
    "NUM.001": "Hover: no change. Focus: a blue ring.",
    "DAT.001": "The calendar button fills with a light blue and takes a blue border on hover.",
    "DAT.002": "Not read yet.",
    "DIV.001": "None.",
    "TTL.001": "None, except the card title: it is a link (underlined and bolder under the pointer and the focus).",
    "LNK.001": "Underlined and bolder under the pointer and the focus.",
    "HLP.001": "None.",
    "LBL.001": "None.",
    "ARW.001": "Hover and focus: the arrow grows 1.2 times; focus adds a 2 px blue outline.",
    "ARW.002": "Outline at rest; filled under the pointer and the focus.",
    "BUL.001": "Default, hover, selected: the bullet changes colour or opacity with the card's colour; the selected bullet is larger.",
};
/** Where the scan found each asset or variant (a condition on the scan's records). */
const FOUND = {
    "BTN.DLT.001.001": "type = 'x'", "BTN.ADD.001.002": "type = 'plus' and cls like '%plus-box%'", "BTN.002": "type = 'info'",
    "BTN.004": "type = 'plus' and cls like '%strategy-add-button%'", "DRP.001": "type = 'dropdown'", "TIK.001": "type = 'tick box'",
    "TXT.BOX.001.001": "type = 'text box' and cls not like '%date-cell-input%'",
    "TXT.ARE.001.002": "type = 'text area' and (cls like '%business-foundation-note%' or cls like '%legal-entity-note%' or cls like '%brand-image-note%' or cls = 'interview-input')",
    "TXT.NAM.001.003": "type = 'text area' and (cls like '%card-name-input%' or cls like '%suggested-input%')",
    "LST.001": "type = 'text area' and cls like '%numbered-list-input%'",
    "NUM.001": "type = 'number box'", "DAT.001": "type = 'text box' and cls like '%date-cell-input%'", "LBL.001": "type = 'label'",
    "ARW.002": "type = 'fold arrow'", "ARW.LAB.002.001": "type = 'label arrow' and h = 24", "ARW.TTL.002.002": "type = 'label arrow' and h = 28"
};
const whereFound = code => {
    if (!FOUND[code]) return null;
    const rows = db.prepare("select system, page, count(*) n from observations where kind = 'control' and " + FOUND[code] + " group by system, page order by n desc").all();
    if (!rows.length) return null;
    const total = rows.reduce((s, r) => s + r.n, 0);
    return total + " in all: " + rows.map(r => r.system.replace(" System", "") + ", " + r.page + " " + r.n).join("; ");
};

const heightText = (l, code) => (code === "DAT.002" || (code.startsWith("DAT.") && code.split(".")[2] === "002") ? "fits its calendar" : l.height === null ? "follows the words" + (l.minHeight ? ", at least " + l.minHeight + " px" : "") : px(l.height));
const widthText = (l, code, parent) => (l.width ? px(l.width) : WIDTH[code] ?? (parent ? WIDTH[parent] : undefined) ?? "set by the layout");
const textSize = l => (l.fontSize ? l.fontSize + " px (" + l.scale + ")" : "no text (a symbol)");
const corner = l => (parseFloat(l.corners) === 0 ? "–" : l.corners.replace("px", " px"));

const GROUPS = [
    ["Components to fill in", "A person types, chooses or ticks them. The text and number holders use the body text (18 px); their variants depend on their function.", ["TXT", "LST", "NUM", "DAT", "DRP", "TIK"]],
    ["Components to read", "A person reads them; they are not filled in. Their style varies with their function, size and style. A label and a title are prefilled or generated by another input; a link opens something; a help text is a text that is there and is not a label or a title.", ["LBL", "TTL", "LNK", "HLP"]],
    ["Buttons and controls", "A person presses them, or they show where the person is.", ["BTN", "ARW", "BUL"]],
    ["Structure", "Parts that divide or hold.", ["DIV"]]
];
const rank = a => GROUPS.findIndex(g => g[2].includes(a.code.slice(0, 3)));
const components = library.assets.filter(a => a.category === "component").sort((a, b) => rank(a) - rank(b));
const rows = [];
for (const a of components) {
    if (a.look) rows.push({ code: a.code, name: a.name, kind: "component", l: a.look });
    for (const v of a.variants) if (v.look) rows.push({ code: v.code, name: a.name + ", " + v.name, kind: "variant", l: v.look });
}

say("# The components", "",
    "Generated by `node scripts/library/components-list.mjs` from the library. Do not edit by hand. " + components.length + " components. Height and Width are in pixels (px). A look is the most used one measured, after the owner's decisions of 2026-10-15 (docs/design/13-component-defaults.md). Each block gives the facts in the same order: Size, Text, Shape, Spacing, Reaction, Use, Variants.", "",
    "## At a glance", "",
    "| Code | Name | Height | Width | Corners | Variants |", "|---|---|---|---|---|---|");
for (const a of components) {
    const l = a.look, ex = EXTRA[a.code];
    say("| " + a.code + " | " + a.name + " | " + (l ? heightText(l, a.code) : ex?.height ?? "see the variants") + " | " + (l ? widthText(l, a.code) : WIDTH[a.code] ?? ex?.width ?? "set by the layout") + " | " + (l ? corner(l) : "–") + " | " + (a.variants.length ? a.variants.map(v => v.name).join(", ") : "none") + " |");
}
say("", "## Every variant at a glance", "", "| Code | Name | Height | Width | Corners | Text size |", "|---|---|---|---|---|---|");
for (const a of components) for (const v of a.variants) {
    const l = v.look ?? a.look, ex = EXTRA[v.code];
    say("| " + v.code + " | " + a.name + ", " + v.name + " | " + (l ? heightText(l, v.code) : ex?.height ?? "see the asset") + " | " + (l ? widthText(l, v.code, a.code) : WIDTH[v.code] ?? ex?.width ?? "see the asset") + " | " + (l ? corner(l) : "none") + " | " + (l ? textSize(l) : "none") + " |");
}
say("");

say("## Corners and sizes", "", "The size of the rounded corners, and which components and surfaces have it. Components with square corners are not listed.", "",
    "| Corners | Components and variants |", "|---|---|");
const byCorner = new Map();
for (const r of rows.filter(x => parseFloat(x.l.corners) > 0)) { const key = corner(r.l); byCorner.set(key, [...(byCorner.get(key) ?? []), r.code + " " + r.name + " (" + (r.l.height === null ? "words" : px(r.l.height)) + (r.l.width ? " by " + px(r.l.width) : "") + ")"]); }
for (const [c, list] of [...byCorner].filter(([c]) => parseFloat(c) > 0).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))) say("| " + c + " | " + list.join("; ") + " |");
say("", "Surfaces (measured by the scan, 1920 px wide window):", "",
    "| Surface | Corners | Width | Padding |", "|---|---|---|---|",
    "| Floating card (CRD.001) | 8 px | 492 px (founder: 297 px) | 12 px on every side |",
    "| Master tile (TIL.001) | 8 px | 328 px | 13 px |",
    "| Open tile (TIL.002) | 8 px | 214 px | 13 px |",
    "| Calendar popup (DAT.002) | 8 px | fits its calendar | 12 px |",
    "");

let lastGroup = -1;
for (const a of components) {
    if (rank(a) !== lastGroup) { lastGroup = rank(a); say("## " + GROUPS[lastGroup][0], "", GROUPS[lastGroup][1], ""); }
    say("### " + a.code + " " + a.name[0].toUpperCase() + a.name.slice(1), "", a.summary, "");
    const ex = EXTRA[a.code];
    if (a.look) {
        const l = a.look;
        say("**Size**", "- Height: " + heightText(l, a.code), "- Width: " + widthText(l, a.code), "",
            "**Text**", "- Size: " + textSize(l), "- Weight: " + l.fontWeight, "",
            "**Shape**", "- Corners: " + corner(l), "- Border: " + l.border + " px", "",
            "**Spacing**", "- Padding left: " + l.paddingLeft + " px", "- Padding top: " + l.paddingTop + " px", "");
    } else if (ex) say("**Size**", "- Height: " + ex.height, "- Width: " + ex.width, "- Source: " + ex.note, "");
    if (REACTION[a.code]) say("**Reaction**", "- " + REACTION[a.code], "");
    const here = whereFound(a.code);
    if (a.look?.found || here) say("**Use**", "- Found: " + (here ?? a.look.found + " times in the example organisation"), ...(a.look?.places ? ["- Places in the app: " + a.look.places + " (distinct pages and classes; the count of the UI, not of the example)"] : []), "");
    if (a.variants.length) {
        say("**Variants**", "");
        for (const v of a.variants) {
            const l = v.look ?? a.look, vx = EXTRA[v.code];
            say("#### " + v.code + " " + v.name, "", v.description, "", "- What changes: " + v.edits);
            if (l) {
                say("- Height: " + heightText(l, v.code), "- Width: " + widthText(l, v.code, a.code), "- Text size: " + textSize(l),
                    "- Corners: " + corner(l) + "; Border: " + l.border + " px; Padding left: " + l.paddingLeft + " px; Padding top: " + l.paddingTop + " px");
            } else if (vx) say("- Height: " + vx.height, "- Width: " + vx.width, "- Source: " + vx.note);
            const w = whereFound(v.code);
            if (w) say("- Found: " + w);
            say("");
        }
    }
    if (a.requires.length) say("**Built from**", ...a.requires.map(r => "- " + (r.variant ?? r.asset) + ": " + r.role), "");
}

const text = out.join("\n") + "\n";
if (process.argv.includes("--check")) {
    const now = existsSync(file) ? readFileSync(file, "utf8").split("\r").join("") : "";
    if (now !== text) { console.error("out of date: " + file); process.exit(1); }
    console.log("the components list is up to date");
} else { writeFileSync(file, text); console.log("wrote " + file + " (" + out.length + " lines)"); }
