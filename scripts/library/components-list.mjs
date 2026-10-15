/**
 * Writes the list of the components (docs/design/14-components-list.md) in a form that is easy to read:
 * one table to scan, then one block per component with its facts grouped under titles (Size, Text, Shape,
 * Spacing, Reaction, Use), one fact per line, a label before every value, full words (Height, Width) and
 * the unit after every number. The layout follows Baymard's finding on spec sheets (group the specs under
 * subheadings, a single column of label and value) and DITA's properties model (property, value, description).
 *
 *   node scripts/library/components-list.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { library } from "../../src/library/data/library.ts";

const file = "docs/design/14-components-list.md";
const out = [];
const say = (...lines) => out.push(...lines);
const px = n => (n === null || n === undefined ? "" : n + " px");

/** Sizes measured by the scan for components that have no look of their own (the navigation and the symbols). */
const EXTRA = {
    "BTN.003": { height: "25 px", width: "76 px", note: "measured by the scan: the Back button and its word" },
    "ARW.001": { height: "44 px", width: "24 px", note: "measured by the scan: page arrow and carousel arrow; each grows 1.2 times on hover" },
    "BUL.001": { height: "12 px (17.4 px when selected)", width: "12 px (17.4 px when selected)", note: "measured by the scan; the one bullet of every rail" },
    "RAL.PAG.001.001": { height: "follows the items (230 px for six pages)", width: "37 px", note: "measured by the scan" },
    "RAL.SEC.001.002": { height: "follows the items (76 to 174 px)", width: "37 px (a tab, below 1700 px wide windows)", note: "measured by the scan" },
    "RAL.NAM.001.003": { height: "follows the items (110 to 668 px)", width: "217 px (from 1700 px wide windows)", note: "measured by the scan" },
    "RAL.NST.001.004": { height: "88 px", width: "88 px", note: "measured by the scan: two arrows and the bullets of a nested card" }
};
/** The width of the components whose width is not a number of their own. */
const WIDTH = {
    "BTN.001": "32 px (a square)", "BTN.002": "24 px (a circle)", "BTN.003": "76 px", "BTN.004": "fills its column",
    "DRP.001": "set by the layout (fills its column)", "TIK.001": "24 px (a square)", "TXT.001": "set by the layout (fills its column)",
    "LST.001": "fills its column", "NUM.001": "set by the layout", "DAT.001": "set by the layout", "DAT.002": "fits its calendar",
    "DIV.001": "fills its column", "LBL.001": "fits its words", "ARW.002": "36 px (the fold arrow)", "ARW.LAB.002.001": "24 px", "ARW.TTL.002.002": "28 px", "RAL.001": "see the variants"
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
    "LST.001": "As a text input; Enter opens the next line.",
    "NUM.001": "Hover: no change. Focus: a blue ring.",
    "DAT.001": "The calendar button fills with a light blue and takes a blue border on hover.",
    "DAT.002": "Not read yet.",
    "DIV.001": "None.",
    "LBL.001": "None.",
    "ARW.001": "Hover and focus: the arrow grows 1.2 times; focus adds a 2 px blue outline.",
    "ARW.002": "Outline at rest; filled under the pointer and the focus.",
    "BUL.001": "Default, hover, selected: the bullet changes colour or opacity with the card's colour; the selected bullet is larger.",
    "RAL.001": "Below 1700 px the name shows as a tooltip on hover; from 1700 px the name is inline and is underlined on hover."
};

const lookLines = (l, name) => {
    if (!l) return [];
    const lines = ["**Size**", "- Height: " + (name === "DAT.002" ? "fits its calendar" : l.height === null ? "follows the words" + (l.minHeight ? ", at least " + l.minHeight + " px" : "") : px(l.height))];
    lines.push("- Width: " + (l.width ? px(l.width) : WIDTH[name] ?? "set by the layout"));
    lines.push("", "**Text**", "- Size: " + (l.fontSize ? l.fontSize + " px" : "no text (a symbol)") + (l.fontSize ? " (" + l.scale + ")" : ""), "- Weight: " + l.fontWeight);
    lines.push("", "**Shape**", "- Corners: " + l.corners.replace("px", " px"), "- Border: " + l.border + " px");
    lines.push("", "**Spacing**", "- Padding left: " + l.paddingLeft + " px", "- Padding top: " + l.paddingTop + " px");
    if (l.found) lines.push("", "**Use**", "- Found: " + l.found + " times in the four systems");
    return lines;
};

const components = library.assets.filter(a => a.category === "component");
say("# The components", "",
    "Generated by `node scripts/library/components-list.mjs` from the library. Do not edit by hand. " + components.length + " components. Each block gives the facts in the same order: Size, Text, Shape, Spacing, Reaction, Use, Variants. Height and Width are in pixels (px). A look is the most used one measured, after the owner's decisions of 2026-10-15 (docs/design/13-component-defaults.md).", "",
    "## At a glance", "",
    "| Code | Name | Height | Width | Variants |", "|---|---|---|---|---|");
for (const a of components) {
    const l = a.look;
    const extra = EXTRA[a.code];
    const h = a.code === "DAT.002" ? "fits its calendar" : l ? (l.height === null ? "follows the words" + (l.minHeight ? " (at least " + l.minHeight + " px)" : "") : px(l.height)) : extra?.height ?? "see the variants";
    const w = l?.width ? px(l.width) : WIDTH[a.code] ?? extra?.width ?? "set by the layout";
    say("| " + a.code + " | " + a.name + " | " + h + " | " + w + " | " + (a.variants.length ? a.variants.map(v => v.name).join(", ") : "none") + " |");
}
say("");

for (const a of components) {
    say("## " + a.code + " " + a.name[0].toUpperCase() + a.name.slice(1), "", a.summary, "");
    const extra = EXTRA[a.code];
    if (a.look) say(...lookLines(a.look, a.code), "");
    else if (extra) say("**Size**", "- Height: " + extra.height, "- Width: " + extra.width, "- Source: " + extra.note, "");
    if (REACTION[a.code]) say("**Reaction**", "- " + REACTION[a.code], "");
    if (a.variants.length) {
        say("**Variants**", "");
        for (const v of a.variants) {
            const l = v.look;
            const ex = EXTRA[v.code];
            say("### " + v.code + " " + v.name, "", v.description, "");
            say("- What changes: " + v.edits);
            if (l) {
                say("- Height: " + (l.height === null ? "follows the words" + (l.minHeight ? ", at least " + l.minHeight + " px" : "") : px(l.height)));
                say("- Width: " + (l.width ? px(l.width) : WIDTH[v.code] ?? "set by the layout"));
                say("- Text size: " + (l.fontSize ? l.fontSize + " px (" + l.scale + ")" : "no text (a symbol)"));
                say("- Corners: " + l.corners.replace("px", " px") + "; Border: " + l.border + " px; Padding left: " + l.paddingLeft + " px; Padding top: " + l.paddingTop + " px");
                if (l.found) say("- Found: " + l.found + " times");
            } else if (ex) say("- Height: " + ex.height, "- Width: " + ex.width, "- Source: " + ex.note);
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
