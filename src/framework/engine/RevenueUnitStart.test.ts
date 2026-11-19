import { describe, expect, it } from "vitest";

import lumen from "../../data/examples/lumen-and-loom-studio.json";
import { businessFoundationSegments } from "./AnswerUtils.ts";
import { offeringStartsById } from "./EffectiveAnswers.ts";

/* A REVENUE STREAM'S PER, FROM THE OFFERING (owner, 2026-11-19 21:44 UTC+2: "Check which parts can be auto-filled by previous answers"). */
describe("a revenue stream's Per starts from the Offering's terms and form", () => {

    const segments = businessFoundationSegments((lumen as { systems: Record<string, { responses: { sectionNumber: number; value?: unknown }[] }> }).systems["3"].responses.find(response => response.sectionNumber === 1)!.value);
    const unitOf = (name: string) => {
        const offering = segments.flatMap(segment => segment.offerings).find(entry => entry.name === name)!;
        return offeringStartsById(segments, offering.id).unit;
    };

    it("says what one sale is, as Lumen's own streams say it", () => {
        expect(unitOf("Homeware Collection")).toBe("Product");
        expect(unitOf("Weaving Workshops")).toBe("Participant");
        expect(unitOf("Bespoke Commissions")).toBe("Project");
    });

});
