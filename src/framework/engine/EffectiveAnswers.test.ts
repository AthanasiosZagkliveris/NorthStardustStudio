import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { effectiveOfferingAnswers, effectiveProfileAnswers, withFieldSet } from "./EffectiveAnswers";
import { offeringChoose, valuePropositionOpenItems } from "./OfferingQuestions";
import type { SegmentIdentity } from "./SegmentContext";

/* Starting values follow their source answers until the user sets that field (docs 36 and 43; owner, 2026-11-08: "App follows the docs"). */

const people: SegmentIdentity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], stage: "plan", differentiation: ["cost"] };

const segmentWith = (income: string, offeringQuestions: Record<string, string[]> = {}, profileQuestions: Record<string, string[]> = {}) => asBusinessFoundationValue({
    segments: [{
        id: "s", name: "Busy parents", questions: { income: [income] },
        profiles: [{ id: "p", name: "A", questions: profileQuestions }],
        offerings: [{ id: "o", name: "Quick Book", category: "Product", questions: offeringQuestions }]
    }]
}).segments[0];

describe("a field set saves that field only", () => {
    it("takes the field, its ratings and its Other from the answers shown, and nothing else", () => {
        const shown = { e3: ["the-price-or-their-budget"], d1: ["reviews-and-recommendations-online"], "d1-rating": ["x:3"], a7: ["alone"] };
        expect(withFieldSet({ a7: ["alone"] }, shown, "d1")).toEqual({ a7: ["alone"], d1: ["reviews-and-recommendations-online"], "d1-rating": ["x:3"] });
        // A field cleared by the user stays cleared (saved empty), so its start does not come back.
        expect(withFieldSet({}, { e3: [] }, "e3")).toEqual({ e3: [] });
    });
});

describe("the Profile's starts follow the Segment until the field is set", () => {
    it("starts the worry about price from a low household income, and follows a change of income while E3 is not set", () => {
        const low = segmentWith("1");
        expect(effectiveProfileAnswers(low.profiles[0], low, people).e3).toEqual(["the-price-or-their-budget"]);
        // Another field set does not freeze E3: the income changes, the start goes.
        const setOther = segmentWith("4", {}, { a7: ["alone"] });
        expect(effectiveProfileAnswers(setOther.profiles[0], setOther, people).e3).toBeUndefined();
        // E3 set by the user is kept whatever the income.
        const setE3 = segmentWith("4", {}, { e3: ["the-price-or-their-budget"] });
        expect(effectiveProfileAnswers(setE3.profiles[0], setE3, people).e3).toEqual(["the-price-or-their-budget"]);
    });
});

describe("the Offering's starts follow their sources until the field is set", () => {
    it("starts O2 from the stage and O4 from the Differentiation, and an answer to O1 freezes neither", () => {
        const segment = segmentWith("3", { o1: ["physical"] });
        const offering = segment.offerings[0];
        expect(effectiveOfferingAnswers(offering, segment, people)).toMatchObject({ o2: ["building"], o6: ["shipped"] });
        const grown = effectiveOfferingAnswers(offering, segment, { ...people, stage: "grow", differentiation: ["premium"] });
        expect(grown.o2).toEqual(["now"]);
        expect(grown.o4).not.toEqual(effectiveOfferingAnswers(offering, segment, people).o4);
        // O6 follows O1 while O6 is not set.
        const digital = segmentWith("3", { o1: ["digital"] });
        expect(effectiveOfferingAnswers(digital.offerings[0], digital, people).o6).toEqual(["auto"]);
    });
});

describe("O4 keeps the order ticked (doc 43, O4: the first ticked is the main benefit)", () => {
    it("keeps the ticks already there in their place and puts a new one last", () => {
        expect(offeringChoose("o4", ["quality-and-results"], ["speed", "quality-and-results"])).toEqual(["quality-and-results", "speed"]);
        expect(offeringChoose("o4", ["quality-and-results", "speed"], ["speed"])).toEqual(["speed"]);
        // Another question keeps the list's order.
        expect(offeringChoose("o14", ["packages"], ["range", "packages"])).toEqual(["range", "packages"]);
    });
});

describe("the readers read the answers as the card shows them", () => {
    it("raises a starting worry the Offerings leave open, before it is ever saved", () => {
        const segment = segmentWith("1", { o1: ["physical"] });
        const offerings = segment.offerings.map(offering => effectiveOfferingAnswers(offering, segment, people));
        const profiles = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, people));
        expect(valuePropositionOpenItems(segment, offerings, profiles).some(item => item.kind === "Worry left open")).toBe(true);
        expect(valuePropositionOpenItems(segment, offerings).some(item => item.kind === "Worry left open")).toBe(false);
    });
});
