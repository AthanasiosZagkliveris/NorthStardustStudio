import { describe, expect, it } from "vitest";

import { asVisionAmbitions, asVisionReach, reachRank, visionChoicesSentence, widestSegmentReach } from "./VisionChoices.ts";

/* THE VISION'S TWO CHOICES, PB7 AND PB8 (doc 45, section 3.8). */
describe("the Vision's choices", () => {

    it("keeps PB7's known ids, each once, three at most; PB8's one known id", () => {
        expect(asVisionAmbitions(["trusted", "trusted", "nope", "range", "loved", "smooth"])).toEqual(["trusted", "range", "loved"]);
        expect(asVisionReach("worldwide")).toBe("worldwide");
        expect(asVisionReach("online")).toBe("");
    });

    it("shares the Segment's reach ranks, \"Anywhere online\" level with Worldwide (D21)", () => {
        expect(reachRank("city")).toBe(1);
        expect(reachRank("countries")).toBe(4);
        expect(reachRank("online")).toBe(reachRank("worldwide"));
    });

    it("says the Segment's widest reach today, with its Segment", () => {
        expect(widestSegmentReach([
            { name: "Homes", questions: { reach: ["region"] } },
            { name: "Hotels", questions: { reach: ["country"] } },
            { name: "Unanswered", questions: {} }
        ])).toEqual({ label: "Across my country", segment: "Hotels", rank: 3 });
        expect(widestSegmentReach([{ name: "Homes" }])).toBeNull();
    });

    it("writes the Business Plan's sentence from PB7's phrases, joined with commas and \"and\", and PB8's", () => {
        expect(visionChoicesSentence(["trusted", "smooth", "partners"], "country"))
            .toBe("When our Vision comes true, the business will be trusted in its field, running smoothly with a strong team and working closely with strong partners, with customers across our country.");
        expect(visionChoicesSentence(["profitable"], "")).toBe("When our Vision comes true, the business will be profitable, paying its own way.");
        // (No sentence without PB7: the doc gives none.)
        expect(visionChoicesSentence([], "worldwide")).toBe("");
    });

});
