import { describe, expect, test } from "vitest";
import { brandColourMissing, brandImageMissing, cardNameMissing, hasContent, legalExpenseMissing, legalRequirementMissing } from "./SystemCardCompleteness.ts";

describe("what a card of the Identity, Brand, Foundation and Strategy Systems still lacks", () => {

    test("a card that holds nothing is not flagged; one that holds something but not what it needs is", () => {
        expect(legalExpenseMissing({ name: "", cost: "", frequency: "", description: "", responsibility: "" })).toEqual([]);
        expect(legalExpenseMissing({ name: "Fee", cost: "", frequency: "", description: "", responsibility: "" })).toEqual(["Cost", "Frequency"]);
        expect(legalExpenseMissing({ name: "Fee", cost: "50", frequency: "Annually", description: "", responsibility: "" })).toEqual([]);
        expect(legalRequirementMissing({ type: "", name: "", reference: "", notes: "x" })).toEqual(["Type", "Name"]);
        expect(brandColourMissing({ name: "Indigo", hex: "", usage: "" })).toEqual(["Colour"]);
        expect(brandImageMissing({ dataUrl: "data:x", name: "", description: "" })).toEqual(["Name"]);
    });

    test("a card of a Segment or a Strategy card needs its name once anything else is written", () => {
        expect(cardNameMissing({ id: "a", name: "", notes: [""] })).toEqual([]);
        expect(cardNameMissing({ id: "a", name: "", notes: ["x"] })).toEqual(["Name"]);
        expect(cardNameMissing({ id: "a", name: "", objectives: [{ name: "x" }] }, ["objectives"])).toEqual([]);
        expect(hasContent({ a: [{ b: " " }] })).toBe(false);
        expect(hasContent({ a: [{ b: "x" }] })).toBe(true);
    });

});
