import { describe, expect, it } from "vitest";

import { asBrandInventoryValue, brandMarkFile } from "./AnswerUtils";
import { brandInventoryBlocks } from "./ExportRenderers";

const svg = { dataUrl: "data:image/svg+xml;base64,AA", fileName: "mark.svg" };
const png = { dataUrl: "data:image/png;base64,AA", fileName: "mark.png" };
const newer = { dataUrl: "data:image/png;base64,BB", fileName: "new.png" };

describe("the Brand Inventory's one icon and one logo", () => {

    it("shows a mark's own file first", () => {
        expect(brandMarkFile({ file: newer, svg, png })).toEqual(newer);
    });

    it("shows a second set's file while the one set is empty, SVG before PNG", () => {
        expect(brandMarkFile({ svg, png })).toEqual(svg);
        expect(brandMarkFile({ png })).toEqual(png);
        expect(brandMarkFile({})).toBeUndefined();
    });

    it("keeps the second set as saved, even once the mark has a file of its own", () => {
        const inventory = asBrandInventoryValue({ icon: { file: newer, svg, png }, logo: { png } });
        expect(inventory.icon).toEqual({ file: newer, svg, png });
        expect(inventory.logo.png).toEqual(png);
    });

    it("shows nothing for a file removed by hand, but keeps the older one saved", () => {
        const inventory = asBrandInventoryValue({ icon: { file: null, svg } });
        expect(brandMarkFile(inventory.icon)).toBeUndefined();
        expect(inventory.icon.svg).toEqual(svg);
        expect(inventory.icon.file).toBeNull();
    });

    it("loads an answer saved before the description with it empty", () => {
        expect(asBrandInventoryValue({ icon: { svg }, logo: {} }).markDescription).toBe("");
        expect(asBrandInventoryValue({ markDescription: "A quill" }).markDescription).toBe("A quill");
        expect(asBrandInventoryValue({ markDescription: 4 }).markDescription).toBe("");
    });

    it("exports the one file of each and the description", () => {
        const blocks = brandInventoryBlocks({ icon: { svg }, logo: { file: newer, png }, markDescription: "A quill in a circle." });
        expect(blocks).toContainEqual({ kind: "subheading", text: "Icon & Logo", level: 1 });
        const list = blocks.find(block => block.kind === "list");
        expect(list && list.kind === "list" ? list.items.map(item => item.text) : []).toEqual(["Icon: mark.svg", "Logo: new.png"]);
        expect(blocks).toContainEqual({ kind: "paragraph", text: "A quill in a circle.", label: "Description" });
    });

});
