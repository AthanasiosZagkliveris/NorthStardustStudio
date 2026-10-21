import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assets } from "../library";
import { BEGIN, END, renderAssets } from "../../tools/scripts/docs/assets.ts";

/* The rulebook's section on the assets is written from the contracts in
   src/library. When this fails: run `npm run docs:assets` and commit the
   result (or, if the rulebook's block was edited by hand, edit the contract). */

// (a built path, not a literal: Vite turns new URL("literal", import.meta.url) into an asset URL)
const RULEBOOK = "docs/ai/layout-rules.md";
const rulebook = readFileSync(new URL("../../" + RULEBOOK, import.meta.url), "utf8").replace(/\r\n/g, "\n");

describe("the rulebook's section on the assets", () => {

    it("is the block written from the contracts", () => {
        const from = rulebook.indexOf(BEGIN);
        const to = rulebook.indexOf(END);
        expect(from).toBeGreaterThan(0);
        expect(to).toBeGreaterThan(from);
        expect(rulebook.slice(from, to + END.length)).toBe(renderAssets(assets));
    });

    it("has a part for every asset, with its numbers and its findings", () => {
        const text = renderAssets(assets);
        for (const asset of assets) {
            expect(text).toContain("### " + asset.name);
            for (const key of Object.keys(asset.knownFindings ?? {})) expect(text).toContain("`" + key + "`");
        }
        expect(text).toContain("| openShiftEm | 0.1945 |");
    });

});
