import { describe, expect, it } from "vitest";

import { answerTexts, entry, normalize, search, snippet } from "./Search";

describe("search: the index", () => {

    it("compares without case or accents", () => {
        expect(normalize("Résumé  ÉTÉ")).toBe("resume ete");
    });

    it("takes every text a person wrote from an answer, with the cards it is in, innermost first, and no codes or ids", () => {
        const value = {
            segments: [{
                id: "seg-1",
                name: "Retail",
                frequency: "per-sale",
                profiles: [{ id: "p1", name: "Anna", offeringIds: ["o1"], goals: "Save time" }]
            }],
            notes: "Ask the bank"
        };
        expect(answerTexts(value)).toEqual([
            { text: "Retail", ids: ["seg-1"] },
            { text: "Anna", ids: ["p1", "seg-1"] },
            { text: "Save time", ids: ["p1", "seg-1"] },
            { text: "Ask the bank", ids: [] }
        ]);
    });

});

describe("search: finding", () => {

    const target = { systemNumber: 1 };
    const index = [
        entry("page", "3. Legal Entity", "1. Identity System", target, 1),
        entry("page", "1. Identity System", "System", target, 0),
        entry("field", "Legal Form", "1. Identity System → 3. Legal Entity", target, 2),
        entry("field", "Entity Type", "1. Identity System → 3. Legal Entity", target, 3),
        entry("answer", "A legal entity registered in Lyon", "1. Identity System → 3. Legal Entity", target, 4),
        entry("answer", "Café crème for the team", "3. Business System → 3. Infrastructure & Capability", target, 5),
        entry("page", "Legal", "somewhere later", target, 9)
    ];

    it("finds in three groups, pages before fields before answers", () => {
        const results = search(index, "legal");
        expect(results.pages.map(hit => hit.entry.label)).toEqual(["Legal", "3. Legal Entity"]);
        expect(results.fields.map(hit => hit.entry.label)).toEqual(["Legal Form"]);
        expect(results.answers.map(hit => hit.entry.label)).toEqual(["A legal entity registered in Lyon"]);
    });

    it("ranks an exact match first, then a start, then a word start, then the rest; then the app's order", () => {
        const ranked = [
            entry("field", "Unlegalised", "", target, 0),
            entry("field", "Other legal notes", "", target, 1),
            entry("field", "Legal Form", "", target, 3),
            entry("field", "Legal Entity", "", target, 2),
            entry("field", "legal", "", target, 4)
        ];
        expect(search(ranked, "Legal").fields.map(hit => hit.entry.label)).toEqual(["legal", "Legal Entity", "Legal Form", "Other legal notes", "Unlegalised"]);
    });

    it("needs every word, in any order, and ignores case and accents", () => {
        expect(search(index, "entity legal").answers).toHaveLength(1);
        expect(search(index, "CAFE creme").answers.map(hit => hit.entry.label)).toEqual(["Café crème for the team"]);
        expect(search(index, "legal zebra").pages).toHaveLength(0);
        expect(search(index, "   ").pages).toHaveLength(0);
    });

    it("keeps each group short", () => {
        const many = Array.from({ length: 30 }, (_, at) => entry("answer", "note " + at, "", target, at));
        expect(search(many, "note").answers).toHaveLength(8);
    });

    it("shows a short piece of an answer around what it found, the words marked", () => {
        const long = "The founders met in 2019 while working at a logistics firm and decided to build tools for small accounting practices in the city.";
        const parts = snippet(long, "accounting", 20);
        expect(parts[0]).toEqual({ text: "…", match: false });
        expect(parts.filter(part => part.match).map(part => part.text)).toEqual(["accounting"]);
        expect(parts.map(part => part.text).join("").length).toBeLessThan(long.length);
        expect(snippet("Café crème", "creme").filter(part => part.match).map(part => part.text)).toEqual(["crème"]);
    });

});
