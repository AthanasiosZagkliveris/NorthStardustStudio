import { beforeEach, describe, expect, it } from "vitest";
import { notesOfPage } from "./CardNotesService";
import { OrganizationService } from "./OrganizationService";
import { CardRecordService } from "./CardRecordService";

/* THE CARD NOTES AND THE CARD RECORD. */

describe("the card notes", () => {
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
});

describe("the card record", () => {
    describe("the record time of a card", () => {

        beforeEach(() => localStorage.clear());

        it("is set the first time it is asked for, kept in the organisation's document, and does not change", () => {
            const summary = OrganizationService.create("Test Studio");
            OrganizationService.setSelected(summary.id);
            const first = CardRecordService.recordedAt("card-1", 1000);
            expect(first).toBe(1000);
            expect(CardRecordService.recordedAt("card-1", 2000)).toBe(1000);
            expect(OrganizationService.loadDocument(summary.id)?.cardTimes).toEqual({ "card-1": 1000 });
            expect(OrganizationService.exportDocument(summary.id)?.cardTimes).toEqual({ "card-1": 1000 });
        });

    });
});
