import { describe, expect, it } from "vitest";
import { stylesheet } from "../test/stylesheet";
import { assets } from "./index.ts";

/* The contracts are measured by scripts/library/run.mjs (it needs the
   dev server and a browser); these tests keep the records themselves
   honest and tied to the stylesheets they describe. */
describe("the asset contracts", () => {

    it("names every asset once and gives it a variant, a state and a contrast need", () => {
        const names = assets.map(asset => asset.name);
        expect(new Set(names).size).toBe(names.length);
        for (const asset of assets) {
            expect(asset.variants.length, asset.name).toBeGreaterThan(0);
            expect(asset.states.length, asset.name).toBeGreaterThan(0);
            expect(asset.accessibility.contrast.length, asset.name).toBeGreaterThan(0);
        }
    });

    it("lists only custom properties its stylesheet reads", () => {
        for (const asset of assets) {
            const css = stylesheet(asset.stylesheet.replace("src/styles/", ""));
            for (const token of asset.tokens) expect(css, asset.name + " " + token).toContain(token);
        }
    });

    it("gives the label arrow the shape its stylesheet draws", () => {
        const arrow = assets.find(asset => asset.name === "Label arrow")!;
        const css = stylesheet("label-arrow.css");
        expect(css).toContain("width: " + arrow.geometry.glyphWidthEm + "em;");
        expect(css).toContain("height: " + arrow.geometry.glyphHeightEm + "em;");
        expect(css).toContain("translateX(" + arrow.geometry.openShiftEm + "em)");
        expect(css).toContain("stroke-width: " + arrow.geometry.lineWidthPx + "px;");
        expect(css).toContain("max(" + arrow.geometry.minTargetPx + "px, 1em)");
    });

});
