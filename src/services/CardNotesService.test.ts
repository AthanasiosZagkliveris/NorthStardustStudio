import { describe, expect, it } from "vitest";
import { notesOfPage } from "./CardNotesService";

describe("the card notes", () => {

    it("gathers the Notes text of every card on a page, whatever the list it is in", () => {
        const page = {
            resources: { utilities: [{ slots: [{ id: "r1", name: "Electricity", description: "Fair-use limit." }, { id: "r2", name: "Empty", description: "  " }] }] },
            typefaces: [{ id: "t1", font: "Fraunces", purpose: "Headings" }]
        };
        const found = notesOfPage(page, 3, 3, "3.3 Infrastructure");
        expect(found.map(note => [note.cardId, note.name, note.text])).toEqual([["r1", "Electricity", "Fair-use limit."], ["t1", "Fraunces", "Headings"]]);
    });

});

describe("the Brand's card notes", () => {

    it("names a colour, a typeface and an image by the id their card is opened by", () => {
        const page = {
            colours: [{ enabled: true, name: "Loom Indigo", hex: "#2F3E46", usage: "Logo and headings" }, { enabled: false, name: "", hex: "", usage: "" }],
            typefaces: [{ enabled: true, font: "Fraunces", purpose: "Headings" }],
            inventory: { images: [{ name: "Weave", description: "A close crop of the weave" }] }
        };
        const found = notesOfPage(page, 2, 1, "2.1 Style");
        expect(found.map(note => note.cardId)).toEqual(["brand-colour-primary-a", "brand-typeface-primary", "brand-image-0"]);
    });

});
