import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { differentiationFromOpenings, openingDifferentiation } from "./CompetitorQuestions";
import { effectiveSegmentAnswers } from "./EffectiveAnswers";
import type { SegmentIdentity } from "./SegmentContext";

/* K10 → K14 (doc 41, 2026-11-09): the openings ticked on a Segment's Competitors start its Differentiation, through the crosswalk; a saved K14 wins. */

const people: SegmentIdentity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], stage: "grow" };

const segmentWith = (k10s: string[][], questions: Record<string, string[]> = {}) => asBusinessFoundationValue({
    segments: [{
        id: "s", name: "Busy parents", questions,
        competitors: k10s.map((k10, at) => ({ id: "c" + at, name: "Rival " + at, type: "direct", questions: { k10 } }))
    }]
}).segments[0];

describe("the crosswalk from a K10 opening to a Differentiation", () => {
    it("maps the openings that set the offering apart, and no other", () => {
        expect(openingDifferentiation("better:lower-price")).toBe("cost");
        expect(openingDifferentiation("better:speed")).toBe("convenience");
        expect(openingDifferentiation("standout:ease-and-convenience")).toBe("convenience");
        expect(openingDifferentiation("better:safety-and-low-risk")).toBe("compliance");
        expect(openingDifferentiation("better:quality-and-results")).toBe("premium");
        expect(openingDifferentiation("standout:trust-and-reputation")).toBe("premium");
        expect(openingDifferentiation("better:expert-knowledge")).toBe("performance");
        expect(openingDifferentiation("better:a-service-made-for-them")).toBe("personal");
        expect(openingDifferentiation("better:good-support")).toBe("personal");
        expect(openingDifferentiation("stage:support")).toBe("personal");
        expect(openingDifferentiation("stage:purchase")).toBe("convenience");
        // Matching keeps level; reach, reviews, growth and changes say where or when; shared values has no Differentiation.
        expect(openingDifferentiation("match:quality-and-results")).toBeUndefined();
        expect(openingDifferentiation("cost:lower-price")).toBeUndefined();
        expect(openingDifferentiation("unhappy")).toBeUndefined();
        expect(openingDifferentiation("reach:social-media:tiktok")).toBeUndefined();
        expect(openingDifferentiation("better:shared-values-or-identity")).toBeUndefined();
    });

    it("orders the Differentiations by how many ticks argue for them, then by the first ticked", () => {
        expect(differentiationFromOpenings([
            { questions: { k10: ["better:good-support", "better:lower-price"] } },
            { questions: { k10: ["better:lower-price", "stage:delivery"] } }
        ])).toEqual(["cost", "personal", "convenience"]);
        expect(differentiationFromOpenings([])).toEqual([]);
    });
});

describe("the K10 ticks start the Segment's K14", () => {
    it("starts it where neither the Segment nor Positioning answered, within the stage's limit", () => {
        const segment = segmentWith([["better:lower-price", "better:quality-and-results"], ["better:lower-price"]]);
        expect(effectiveSegmentAnswers(segment, people).differentiation).toEqual(["cost", "premium"]);
        // Planning allows one.
        expect(effectiveSegmentAnswers(segment, { ...people, stage: "plan" }).differentiation).toEqual(["cost"]);
    });

    it("lets a saved K14 win, even cleared, and Positioning's saved answer start it first", () => {
        expect(effectiveSegmentAnswers(segmentWith([["better:lower-price"]], { differentiation: ["personal"] }), people).differentiation).toEqual(["personal"]);
        expect(effectiveSegmentAnswers(segmentWith([["better:lower-price"]], { differentiation: [] }), people).differentiation).toEqual([]);
        expect(effectiveSegmentAnswers(segmentWith([["better:lower-price"]]), { ...people, differentiation: ["premium"] }).differentiation).toEqual(["premium"]);
    });

    it("starts nothing from openings that argue for no Differentiation", () => {
        expect(effectiveSegmentAnswers(segmentWith([["unhappy", "match:speed"]]), people).differentiation).toBeUndefined();
    });
});
