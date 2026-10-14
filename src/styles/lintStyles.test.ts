import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import baselineFile from "../../scripts/lint/styles-baseline.json";
import { compareWithBaseline, lintFile, lintStyles, toBaseline, type Baseline } from "../../scripts/lint/styles.ts";

/* The style lint (scripts/lint/styles.ts, npm run lint:styles). The first
   block tests the rules on small snippets; the second runs them on the real
   stylesheets against the recorded baseline, so a new literal colour, corner,
   gap or breakpoint fails the tests. When it fails: use a token, or, if the
   owner decided that the literal stays, run npm run lint:styles:baseline. */

const lint = (css: string) => lintFile({ name: "x.css", text: css }).map(finding => finding.rule + " " + finding.value);

describe("the style lint's rules", () => {

    it("finds a colour literal in any property, and not one built from tokens", () => {
        expect(lint("a { color: #fff; }")).toEqual(["colour #fff"]);
        expect(lint("a { border: 1px solid rgba(0, 0, 0, .2); }")).toEqual(["colour rgba(0, 0, 0, .2)"]);
        expect(lint("a { box-shadow: 0 1px 2px black; }")).toEqual(["colour black"]);
        expect(lint("a { background: var(--bg-page, #fff); }")).toEqual(["colour #fff"]);
        expect(lint("a { color: hsl(var(--strategy-theme-hue, 0) var(--theme-text-ink)); }")).toEqual([]);
        expect(lint("a { color: color-mix(in srgb, var(--text-body) 40%, transparent); }")).toEqual([]);
        expect(lint("a { color: var(--text-black); }")).toEqual([]);
        expect(lint("a { background: url(\"data:image/svg+xml,%3Csvg fill='%23fff'/%3E\"); }")).toEqual([]);
    });

    it("never reads a comment", () => {
        expect(lint("/* a { color: #fff; gap: 10px; } */ a { color: var(--x); }")).toEqual([]);
    });

    it("accepts a corner that is a token, zero, a circle or a pill, and finds a px literal", () => {
        expect(lint("a { border-radius: var(--radius-lg); }")).toEqual([]);
        expect(lint("a { border-radius: 0 0 var(--radius-md) var(--radius-md); }")).toEqual([]);
        expect(lint("a { border-radius: 50%; }")).toEqual([]);
        expect(lint("a { border-radius: 999px; }")).toEqual([]);
        expect(lint("a { border-radius: 10px; }")).toEqual(["corner 10px"]);
        expect(lint("a { border-top-left-radius: 3px !important; }")).toEqual(["corner 3px"]);
        expect(lint("a { border-radius: 8px 8px 0 0; }")).toEqual(["corner 8px", "corner 8px"]);
    });

    it("accepts a gap that is a token, zero or normal, and finds a px, em or vw literal", () => {
        expect(lint("a { gap: var(--gap-8); }")).toEqual([]);
        expect(lint("a { gap: 0; row-gap: normal; }")).toEqual([]);
        expect(lint("a { gap: var(--space-field) var(--space-cell); }")).toEqual([]);
        expect(lint("a { gap: 10px; }")).toEqual(["gap 10px"]);
        expect(lint("a { column-gap: var(--space-field) 14px; }")).toEqual(["gap 14px"]);
        expect(lint("a { gap: 0.4em; }")).toEqual(["gap 0.4em"]);
        expect(lint("a { gap: calc(2 * var(--space-field)); }")).toEqual([]);
    });

    it("accepts a query of the catalogue and finds one outside it", () => {
        expect(lint("@media (max-width: 900px) { a { color: var(--x); } }")).toEqual([]);
        expect(lint("@container (max-width: 599.98px) { a { color: var(--x); } }")).toEqual([]);
        expect(lint("@media (max-width: 901px) { a { color: var(--x); } }")).toEqual(["breakpoint max-width: 901px"]);
        expect(lint("@media (min-width: 1200px) and (max-width: 1250px) { a { color: var(--x); } }")).toEqual(["breakpoint min-width: 1200px", "breakpoint max-width: 1250px"]);
    });

    it("skips the generated files", () => {
        expect(lintStyles([{ name: "colors.generated.css", text: "a { color: #fff; }" }])).toEqual([]);
    });

    it("compares with a baseline: more of a known value or a new value is new; fewer is gone", () => {
        const base: Baseline = toBaseline(lintFile({ name: "x.css", text: "a { gap: 10px; } b { gap: 10px; } c { color: #fff; }" }));
        expect(base).toEqual({ colour: { "x.css": { "#fff": 1 } }, gap: { "x.css": { "10px": 2 } } });
        const same = compareWithBaseline(lintFile({ name: "x.css", text: "a { gap: 10px; } b { gap: 10px; } c { color: #fff; }" }), base);
        expect(same.newer).toEqual([]);
        expect(same.gone).toEqual([]);
        const more = compareWithBaseline(lintFile({ name: "x.css", text: "a { gap: 10px; } b { gap: 10px; } d { gap: 10px; } c { color: #fff; } e { color: #000; }" }), base);
        expect(more.newer.map(finding => finding.value)).toEqual(["10px", "#000"]);
        const fewer = compareWithBaseline(lintFile({ name: "x.css", text: "a { gap: 10px; } c { color: #fff; }" }), base);
        expect(fewer.newer).toEqual([]);
        expect(fewer.gone).toEqual([{ rule: "gap", file: "x.css", value: "10px", recorded: 2, now: 1 }]);
    });

});

describe("the stylesheets", () => {

    // Every stylesheet of src/styles: the glob lists the names (a plain CSS import is an empty module in the test runner, and so is a raw one), the files are read from disk.
    const names = Object.keys(import.meta.glob("./*.css")).sort().map(path => path.replace("./", ""));
    const files = names.map(name => ({ name, text: readFileSync(new URL("./" + name, import.meta.url), "utf8").replace(/\r\n/g, "\n") }));
    const baseline = baselineFile as Baseline;

    it("are all read (the lint is not run on nothing)", () => {
        expect(files.length).toBeGreaterThan(30);
        expect(files.every(file => file.text.length > 0)).toBe(true);
    });

    it("hold no colour, corner, gap or breakpoint literal beyond the baseline", () => {
        const { newer } = compareWithBaseline(lintStyles(files), baseline);
        expect(newer.map(finding => finding.rule + " " + finding.file + ":" + finding.line + " " + finding.value)).toEqual([]);
    });

    it("keep the baseline tight: it lists nothing the stylesheets no longer hold", () => {
        const { gone } = compareWithBaseline(lintStyles(files), baseline);
        expect(gone, "run npm run lint:styles:baseline").toEqual([]);
    });

});
