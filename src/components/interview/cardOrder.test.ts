import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** An editor's source, as the test runner reads it from the project root. */
const source = (name: string) => readFileSync("src/components/interview/" + name, "utf8");

describe("the one card order: tick-box link lists last, the Description directly above them", () => {

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
            expect(after).not.toMatch(/<OptionalNote|<BusinessField|<label className/);
        }
    });

    it("puts a Legal Entity expense's Links after its Description", () => {
        const text = source("LegalEntityEditor.tsx");
        const description = text.indexOf("\"Expense \" + (index + 1) + \" description\"");
        const links = text.indexOf("className=\"legal-entity-links\"");
        expect(description).toBeGreaterThan(0);
        expect(links).toBeGreaterThan(description);
    });

    it("keeps a funding source's Linked Funding Need last, under its optional texts", () => {
        const text = source("FinancialFoundationEditor.tsx");
        const links = text.indexOf("label=\"Linked Funding Need\"");
        expect(text.lastIndexOf("label=\"Conditions\"", links)).toBeGreaterThan(text.lastIndexOf("<BusinessCard", links));
        expect(text.slice(links, text.indexOf("</BusinessCard>", links))).not.toMatch(/<OptionalNote/);
    });

});
