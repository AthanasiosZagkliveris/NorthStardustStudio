import { describe, expect, it } from "vitest";

import lumen from "../../data/examples/lumen-and-loom-studio.json";
import { businessFoundationSegments } from "./AnswerUtils.ts";
import { competitorFaceLines, offeringFaceLines, profileFaceLines } from "./CardFaces.ts";

/* WHAT A CARD'S TILE SAYS (owner, 2026-11-19 16:52 UTC+2, 1.2). */
describe("a card's tile", () => {

    const segments = businessFoundationSegments((lumen as { systems: Record<string, { responses: { sectionNumber: number; value?: unknown }[] }> }).systems["3"].responses.find(response => response.sectionNumber === 1)!.value);
    const homes = segments[0];

    it("says a Profile's age, kind of work and first goal", () => {
        expect(profileFaceLines(homes.profiles[0], homes, undefined)).toEqual(["36 years old", "Professional", "Expression"]);
    });

    it("says an Offering's Type, form, whether it can be bought today and how it is paid for", () => {
        expect(offeringFaceLines(homes.offerings[0], homes, undefined)).toEqual(["Product", "A physical item", "Available now", "One purchase"]);
    });

    it("says a Competitor's Type, reach and size, leaving out what is not answered", () => {
        expect(competitorFaceLines(homes.competitors[0])).toEqual(["Direct competitor", "Anywhere online", "Micro, 1–9 employees"]);
        expect(competitorFaceLines({ ...homes.competitors[0], type: "", questions: {} })).toEqual([]);
    });

});
