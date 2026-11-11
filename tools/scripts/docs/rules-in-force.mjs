/**
 * THE RULES IN FORCE, AT A GLANCE (owner, 2026-11-11: "Go on, do all together", the optimisation's step 5): the two longest documents get a short
 * summary at their top, written from their own text so it can never say something they do not:
 *   - docs/ai/layout-rules.md: each section's rules, by the bold words that open each of them ("- **...**"), linked to the section;
 *   - docs/design/current/26-card-structure.md: each card's entry, by its headings, linked to them.
 * The summary stands between <!-- generated:in-force --> and <!-- /generated:in-force -->, under the document's head.
 *
 *   node tools/scripts/docs/rules-in-force.mjs           write the summaries
 *   node tools/scripts/docs/rules-in-force.mjs --check   fail where a summary is not the one the document's text gives (part of npm run docs:check)
 */
import { readFileSync, writeFileSync } from "node:fs";

const check = process.argv.includes("--check");
const START = "<!-- generated:in-force -->";
const END = "<!-- /generated:in-force -->";

/** GitHub's anchor of a heading. */
const anchor = heading => heading.toLowerCase().replace(/[`*_]/g, "").replace(/[^\p{L}\p{N} -]/gu, "").trim().replace(/ /g, "-");

/** Outside the generated blocks the document already has (the token table, ...), so a rule is read only from the text written by hand. */
const outsideGenerated = text => text.replace(/<!-- generated:[\s\S]*?<!-- \/generated:[^>]*-->/g, "");

function layoutRules(text) {
    const lines = outsideGenerated(text).split("\n");
    const out = ["**The rules in force, at a glance** (written from this document by `npm run docs:in-force`; each line opens a rule of the section below, where it is given whole).", ""];
    let section = null;
    let leads = [];
    const flush = () => {
        if (section && leads.length > 0) {
            out.push("- [" + section.replace(/^\d+\.\s*/, (m) => m) + "](#" + anchor(section) + "): " + leads.join("; ") + ".");
        }
        leads = [];
    };
    for (const line of lines) {
        const heading = line.match(/^## (\d+\..*)$/);
        if (heading) {
            flush();
            section = heading[1].trim();
            continue;
        }
        const lead = section && line.match(/^- \*\*([^*]+)\*\*/);
        if (lead) {
            leads.push(lead[1].trim().replace(/[.:]$/, ""));
        }
    }
    flush();
    return out.join("\n");
}

function cardStructure(text) {
    const lines = outsideGenerated(text).split("\n");
    // (A heading met again -- Offering's categories after Infrastructure's -- is linked as GitHub names it: its anchor and -1, -2 ...)
    const used = new Map();
    const unique = heading => { const base = anchor(heading); const n = used.get(base) ?? 0; used.set(base, n + 1); return n === 0 ? base : base + "-" + n; };
    const out =["**The cards at a glance** (written from this document by `npm run docs:in-force`): each card's entry, by its place.", ""];
    let place = null;
    let entries = [];
    const flush = () => {
        if (place) {
            out.push("- [" + place.text + "](#" + place.id + ")" + (entries.length ? ": " + entries.map(entry => "[" + entry.text + "](#" + entry.id + ")").join(", ") : "") + ".");
        }
        entries = [];
    };
    for (const line of lines) {
        const heading = line.match(/^(#{1,6}) (.+)$/);
        if (!heading) continue;
        const entry = { text: heading[2].trim(), id: unique(heading[2].trim()) };
        if (heading[1] === "###") {
            flush();
            place = entry;
        } else if (heading[1] === "####" && place) {
            entries.push(entry);
        }
    }
    flush();
    return out.join("\n");
}

const DOCUMENTS = [
    ["docs/ai/layout-rules.md", layoutRules],
    ["docs/design/current/26-card-structure.md", cardStructure]
];

let stale = 0;
for (const [file, summarise] of DOCUMENTS) {
    const raw = readFileSync(file, "utf8");
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    const text = raw.split("\r\n").join("\n");
    const block = START + "\n\n" + summarise(text) + "\n\n" + END;
    let next;
    if (text.includes(START)) {
        next = text.slice(0, text.indexOf(START)) + block + text.slice(text.indexOf(END) + END.length);
    } else {
        // Under the head: before the document's Contents.
        const at = text.indexOf("\n## Contents");
        if (at < 0) throw new Error(file + ": no Contents to stand above");
        next = text.slice(0, at) + "\n" + block + "\n" + text.slice(at);
    }
    if (next !== text) {
        stale++;
        if (check) {
            console.log(file + ": the summary at its top is not the one its text gives (run npm run docs:in-force).");
        } else {
            writeFileSync(file, next.split("\n").join(eol));
            console.log(file + ": summary written.");
        }
    }
}
if (check) {
    if (stale > 0) process.exit(1);
    console.log("The rules-in-force summaries match their documents.");
}
