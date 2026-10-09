import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** An editor's source, as the test runner reads it from the project root. */
const source = (name: string) => readFileSync("src/components/interview/" + name, "utf8");

describe("the one card order: fields, the Description, the tick-box link lists, then the card's state ticks last", () => {

    it("puts each Offering's Capability card's Linked to after its Description, last", () => {
        const text = source("BusinessCapabilityEditor.tsx");
        for (const card of ["\"Resource \" + number + \" linked Offerings\"", "\"Activity \" + number + \" linked Offerings\"", "\" linked Offerings\","]) {
            const links = text.indexOf(card);
            expect(links).toBeGreaterThan(0);
            const description = text.lastIndexOf("<OptionalNote", links);
            const cardStart = text.lastIndexOf("<BusinessCard", links);
            // Its Description comes before it, inside the same card ...
            expect(description).toBeGreaterThan(cardStart);
            // ... and nothing but the links follows it: the card ends, or the activity's row does.
            const after = text.slice(links, links + 400);
            expect(after).not.toMatch(/<OptionalNote|<BusinessField/);
        }
    });

    it("puts an Activity's Completed tick at the very end, after its Description and its links", () => {
        const text = source("BusinessCapabilityEditor.tsx");
        const links = text.indexOf("\"Activity \" + number + \" linked Offerings\"");
        const completed = text.indexOf("\"Activity \" + number + \" completed\"");
        const description = text.indexOf("\"Activity \" + number + \" description\"");
        expect(description).toBeGreaterThan(0);
        expect(links).toBeGreaterThan(description);
        expect(completed).toBeGreaterThan(links);
    });

    it("puts a Legal Entity expense's Linked registration before its Description (the card structure's order)", () => {
        const text = source("LegalEntityEditor.tsx");
        const description = text.indexOf("\"Expense \" + (index + 1) + \" description\"");
        const linked = text.indexOf("\"Expense \" + (index + 1) + \" linked registration\"");
        expect(description).toBeGreaterThan(0);
        expect(linked).toBeGreaterThan(0);
        expect(linked).toBeLessThan(description);
    });

    it("keeps a funding source's Linked Funding Need last, under its optional texts", () => {
        const text = source("FinancialFoundationEditor.tsx");
        const links = text.indexOf("label=\"Linked Funding Need\"");
        expect(text.lastIndexOf("label=\"Conditions\"", links)).toBeGreaterThan(text.lastIndexOf("<BusinessCard", links));
        expect(text.slice(links, text.indexOf("</BusinessCard>", links))).not.toMatch(/<OptionalNote/);
    });

});
