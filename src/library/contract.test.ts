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
            const css = [asset.stylesheet, ...(asset.alsoStylesheets ?? [])].map(path => stylesheet(path.replace("src/styles/", ""))).join(" ");
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


    it("gives the plus box the sizes and the swap its stylesheet draws", () => {
        const box = assets.find(asset => asset.name === "Plus box")!;
        const css = stylesheet("section-tiles.css");
        const g = box.geometry;
        expect(css).toContain("--plus-size: " + g.sizeTile + "px;");
        expect(css).toContain("--plus-bar: " + g.barTile + "px;");
        expect(css).toContain("--plus-size: " + g.sizeSmall + "px;");
        expect(css).toContain("--plus-bar: " + g.barSmall + "px;");
        expect(css).toContain("border: " + g.strokeWidth + "px solid var(--plus-fill);");
        expect(css).toContain("border-radius: var(--radius-lg);");
        expect(css).toContain("background-color .15s ease");
        expect(css).toContain("outline: " + g.outlineWidth + "px solid var(--focus-ring-ink);");
        expect(css).toContain("outline-offset: " + g.outlineOffset + "px;");
    });


    it("gives the info note the disc, the hit area, the gap and the page-3 stroke its stylesheets draw", () => {
        const note = assets.find(asset => asset.name === "Info note")!;
        const g = note.geometry;
        const conversation = stylesheet("conversation.css");
        expect(conversation).toContain(".info-note-button{ width:" + g.disc + "px; height:" + g.disc + "px;");
        expect(conversation).toContain("width:" + g.hitArea + "px; height:" + g.hitArea + "px;");
        expect(conversation).toContain("margin-left:var(--info-gap, " + g.gap + "px);");
        expect(stylesheet("global.css")).toContain("--info-gap: " + g.gap + "px;");
        expect(stylesheet("page-3-edges.css")).toContain("border: " + g.strokePage3 + "px solid var(--info-ink);");
        expect(Object.keys(note.knownFindings ?? {})).toEqual(["tinted-rule-overridden"]);
    });


    it("gives the remove x the size, the stroke, the bars and the swap its stylesheet draws", () => {
        const x = assets.find(asset => asset.name === "Remove x")!;
        const g = x.geometry;
        const css = stylesheet("remove-button.css");
        expect(css).toContain(".strategy-box-remove{ width:" + g.size + "px; height:" + g.size + "px;");
        expect(css).toContain("border-radius:var(--radius-md);");
        expect(css).toContain("width:" + g.barLength + "px; height:" + g.barThickness + "px;");
        expect(css).toContain("transform:rotate(45deg);");
        expect(css).toContain("transform:rotate(-45deg);");
        expect(css).toContain("border:" + g.strokeWidth + "px solid var(--x-red);");
        expect(css).toContain("outline:" + g.outlineWidth + "px solid var(--focus-ring-ink, var(--line-primary)); outline-offset:" + g.outlineOffset + "px;");
    });


    it("gives the rails the gaps, the growth, the rings and the wide breakpoint their stylesheet draws", () => {
        const rails = assets.find(asset => asset.name === "Rails")!;
        const g = rails.geometry;
        const css = stylesheet("bullet-rail.css");
        expect(css).toContain("gap: " + g.listGap + "px;");
        expect(css).toContain("padding: " + g.itemPaddingY + "px 0;");
        expect(css).toContain("transform: scale(" + g.activeScale + ");");
        expect(css).toContain("transform: scale(" + g.hoverScale + ");");
        expect(css).toContain("box-shadow: 0 0 0 " + g.activeRing + "px var(--rail-bloom);");
        expect(css).toContain("box-shadow: 0 0 0 " + g.hoverRing + "px var(--rail-hover-ring);");
        expect(css).toContain("outline: " + g.outlineWidth + "px solid var(--line-primary); outline-offset: " + g.outlineOffset + "px;");
        expect(css).toContain("@media (min-width: " + g.wideFrom + "px)");
        expect(stylesheet("status-shape.css")).toContain("width: " + g.bullet + "px;");
        expect(Object.keys(rails.knownFindings ?? {})).toEqual(["plain-bullet-contrast"]);
    });


    it("gives the back button the arrow, the gaps and the rail form its stylesheets draw", () => {
        const back = assets.find(asset => asset.name === "Back button")!;
        const g = back.geometry;
        const css = stylesheet("section-tiles.css");
        expect(css).toContain(".section-tile-back { display: inline-flex; align-items: center; gap: var(--gap-" + g.footGap + "); padding: " + g.footPaddingY + "px 0;");
        expect(css).toContain("outline: " + g.outlineWidth + "px solid var(--focus-ring-ink); outline-offset: " + g.outlineOffset + "px;");
        expect(css).toContain(".carousel-rail .carousel-rail-back > .back-arrow { flex: none; margin: 0 calc((" + g.railArrowBox + "px - 0.8em * 22 / 28) / 2);");
        expect(css).toContain("transform: scale(" + g.railArrowGrow + ");");
        expect(css).toContain("text-transform: uppercase;");
        expect(stylesheet("label-arrow.css")).toContain("width: calc(" + g.arrowHeightEm + "em * 22 / 28);");
    });

});
