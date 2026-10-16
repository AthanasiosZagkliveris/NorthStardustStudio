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
        expect(css).toContain("--plus-size: var(--size-box-button);");
        expect(stylesheet("components.generated.css")).toContain("--size-box-button: " + g.sizeTile + "px;");
        expect(css).toContain("--plus-bar: " + g.barTile + "px;");
        expect(g.sizeSmall).toBe(g.sizeTile);
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
        expect(conversation).toContain(".info-note-button{ width:var(--size-mark); height:var(--size-mark);");
        expect(conversation).toContain("width:var(--size-mark); height:var(--size-mark);");
        expect(stylesheet("components.generated.css")).toContain("--size-mark: " + g.disc + "px;");
        expect(g.hitArea).toBe(g.disc);
        expect(conversation).toContain("margin-left:var(--info-gap, " + g.gap + "px);");
        expect(stylesheet("global.css")).toContain("--info-gap: " + g.gap + "px;");
        expect(stylesheet("page-3-edges.css")).toContain("border: " + g.strokePage3 + "px solid var(--info-ink);");
        expect(Object.keys(note.knownFindings ?? {})).toEqual(["tinted-rule-overridden"]);
    });


    it("gives the remove x the size, the stroke, the bars and the swap its stylesheet draws", () => {
        const x = assets.find(asset => asset.name === "Remove x")!;
        const g = x.geometry;
        const css = stylesheet("remove-button.css");
        expect(css).toContain(".strategy-box-remove{ width:var(--size-box-button); height:var(--size-box-button);");
        expect(stylesheet("components.generated.css")).toContain("--size-box-button: " + g.size + "px;");
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
        expect(rails.knownFindings).toBeUndefined();
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


    it("gives the fold arrow the size, the stroke, the triangle and the focus its stylesheets draw", () => {
        const fold = assets.find(asset => asset.name === "Fold arrow")!;
        const g = fold.geometry;
        const css = stylesheet("conversation.css");
        expect(css).toContain(".strategy-box-toggle{ position:relative; width:var(--fold-arrow-size); height:var(--fold-arrow-size);");
        expect(stylesheet("components.generated.css")).toContain("--fold-arrow-size: " + g.size + "px;");
        expect(css).toContain("border:" + g.strokeWidth + "px solid transparent; border-radius:var(--radius-md);");
        expect(css).toContain("border-width:" + g.triangleLong / 2 + "px 0 " + g.triangleLong / 2 + "px " + g.triangleShort + "px;");
        expect(css).toContain("border-width:" + g.triangleShort + "px " + g.triangleLong / 2 + "px 0 " + g.triangleLong / 2 + "px;");
        expect(css).toContain(".strategy-box-toggle:hover{ border-color:var(--line-card); background:var(--bg-surface); }");
        expect(css).toContain(".strategy-box-toggle:focus-visible{ outline:none; border-color:var(--line-primary);");
    });


    it("gives the dropdown the steps, the list and the options its stylesheets draw", () => {
        const dropdown = assets.find(asset => asset.name === "Dropdown")!;
        const g = dropdown.geometry;
        const picker = stylesheet("option-picker.css");
        const global = stylesheet("global.css");
        expect(global).toContain("--control-s: " + g.stepS + "px;");
        expect(global).toContain("--control-m: " + g.stepM + "px;");
        expect(global).toContain("--control-l: " + g.stepL + "px;");
        expect(stylesheet("components.generated.css")).toContain("--control-square: " + g.height + "px;");
        expect(picker).toContain("background-size:" + g.chevronWidth + "px " + g.chevronHeight + "px;");
        expect(picker).toContain("margin-top:" + g.listGap + "px; padding:" + g.listPadding + "px;");
        expect(picker).toContain("border-radius:var(--radius-lg);");
        expect(picker).toContain(".option-picker-option{ padding:" + g.optionPaddingY + "px " + g.optionPaddingX + "px;");
        expect(picker).toContain("font-weight:" + g.chosenWeight + ";");
    });

});
