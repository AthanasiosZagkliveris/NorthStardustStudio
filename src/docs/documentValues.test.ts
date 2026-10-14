import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { collectDefinitions, differences, evaluate, sync, tokenRows, valuesOf } from "../../scripts/docs/values.ts";

/* The numbers in the rulebook's token tables must be what the stylesheets give
   (scripts/docs/values.ts). When this fails: run `npm run docs:values` and
   commit the result; the code is right and the table follows it. A row about a
   property the code does not define is listed in NOT_DEFINED until the row is
   removed from the rulebook. */

const NOT_DEFINED = ["--card-side-label", "--workspace-form-width", "--workspace-label-width"];

const names = Object.keys(import.meta.glob("../styles/*.css")).map(path => path.split("/").pop() as string);
const sheets = names.map(name => ({ name, text: readFileSync(new URL("../styles/" + name, import.meta.url), "utf8").replace(/\r\n/g, "\n") }));
const defs = collectDefinitions(sheets);
// (a built path, not a literal: Vite turns new URL("literal", import.meta.url) into an asset URL)
const RULEBOOK = "docs/ai/layout-rules.md";
const rulebook = readFileSync(new URL("../../" + RULEBOOK, import.meta.url), "utf8").replace(/\r\n/g, "\n");

describe("the token values of the documents", () => {

    it("read the stylesheets (the check is not run on nothing)", () => {
        expect(sheets.length).toBeGreaterThan(30);
        expect(valuesOf("--info-gap", defs)).toEqual(new Set(["6px"]));
        expect(valuesOf("--open-card-width", defs)).toEqual(new Set(["492px"]));
    });

    it("work out var() and a calc() of plain numbers, and take the base value, not a reading mode's", () => {
        expect(valuesOf("--space-column", defs)).toEqual(new Set(["12px"]));
        expect(valuesOf("--plus-fill-saturation", defs)).toEqual(new Set(["36%"]));
        expect(valuesOf("--dialog-backdrop-brightness", defs)).toEqual(new Set(["1.7"]));
        expect(evaluate("calc(18px * 13)")).toBe("234px");
        expect(evaluate("calc(100% - 12px)")).toBe("calc(100% - 12px)");
    });

    it("find the token rows of a table and a number that differs", () => {
        const table = "| Token | Value | Use |\n|---|---|---|\n| `--info-gap` | 8px | a gap |\n| `--card-padding`, `--space-field` | 12px, 7px | two |\n";
        expect(tokenRows(table).map(row => row.names)).toEqual([["--info-gap"], ["--card-padding", "--space-field"]]);
        expect(differences(table, defs).map(d => d.name + " " + d.documented)).toEqual(["--info-gap 8px", "--space-field 7px"]);
        expect(sync(table, defs).text).toContain("| `--info-gap` | 6px | a gap |");
        expect(sync(table, defs).text).toContain("| `--card-padding`, `--space-field` | 12px, 12px | two |");
    });

    it("hold in the rulebook: every plain number in a token row is what the code gives", () => {
        const result = sync(rulebook, defs);
        expect(result.changed.map(d => d.name + " " + d.documented + " -> " + d.code[0])).toEqual([]);
        expect(result.unresolved.map(d => d.name).sort()).toEqual(NOT_DEFINED);
    });

    it("compare a good number of rows", () => {
        expect(tokenRows(rulebook).length).toBeGreaterThan(40);
    });

});
