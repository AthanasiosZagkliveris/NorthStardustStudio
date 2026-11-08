import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { draftOffered, highestRated, offeringAsks, offeringOptions, offeringShown, valueMismatch, valuePropositionDraft, valuePropositionOpenItems } from "./OfferingQuestions";

const segment = asBusinessFoundationValue({
    segments: [{
        id: "s", name: "Busy parents",
        profiles: [
            { id: "p1", name: "A", questions: { b1: ["speed", "quality-and-results"], e1: ["learn-something-new", "win-customers-or-earn-more"], "e1-rating": ["learn-something-new:3", "win-customers-or-earn-more:5"], e2: ["it-takes-too-long"], "e2-rating": ["it-takes-too-long:4"], e3: ["the-price-or-their-budget", "whether-it-fits-their-needs"] }, needs: { functional: ["Book in one minute", "Pay by phone"], emotional: [""], social: [""] } }
        ],
        competitors: [{ id: "c", name: "Rival", type: "direct", questions: { "k8-rating": ["speed:2"] } }],
        offerings: [{ id: "o", name: "Quick Book", category: "Service", needsAddressed: ["Book in one minute"], questions: { o1: ["live"], o4: ["speed", "a-service-made-for-them"], o8: ["the-price-or-their-budget"] } }]
    }]
}).segments[0];

describe("the Offering's questions (doc 43; owner, 2026-11-07)", () => {
    it("asks O1 by Type, O10 of a Service or Hybrid, O8 only when a Profile has worries", () => {
        expect(offeringOptions("o1", { type: "Product" }).map(option => option.id)).toEqual(["physical", "digital", "app", "access"]);
        expect(offeringOptions("o1", { type: "Hybrid" })).toHaveLength(8);
        expect(offeringAsks("o1", { type: "Other" })).toBe(false);
        expect(offeringAsks("o10", { type: "Product" })).toBe(false);
        expect(offeringAsks("o8", { type: "Service", worries: [] })).toBe(false);
        expect(offeringOptions("o3", { type: "Service", pay: ["invoice"] })[0].id).toBe("project");
    });
    it("starts O2 from the stage, O4 from the differentiation, O6 from O1, never over an answer", () => {
        const shown = offeringShown({ o1: ["physical"] }, { type: "Product", stage: "plan", differentiation: ["cost", "premium"] });
        expect(shown).toMatchObject({ o1: ["physical"], o2: ["building"], o4: ["lower-price", "quality-and-results", "shared-values-or-identity"], o6: ["shipped"] });
        expect(offeringShown({ o2: ["idea"], o4: ["speed"] }, { type: "Product", stage: "grow", differentiation: ["cost"] })).toMatchObject({ o2: ["idea"], o4: ["speed"] });
        expect(offeringShown({ o1: ["physical"] }, { type: "Service" }).o1).toBeUndefined();
    });
});

describe("the Value Proposition's draft and open items (doc 42)", () => {
    it("writes the draft with the highest-rated goal and frustration, the form and the main benefit, and the clear opening", () => {
        const offering = segment.offerings[0];
        const answers = offeringShown(offering.questions ?? {}, { type: "Service", worries: ["the-price-or-their-budget", "whether-it-fits-their-needs"] });
        expect(draftOffered(segment)).toBe(true);
        expect(highestRated(segment.profiles.map(profile => profile.questions ?? {}), "e1")).toBe("win-customers-or-earn-more");
        expect(valuePropositionDraft(segment, offering, answers, { type: "Service" }))
            .toBe("For Busy parents who wait too long and want to grow their income, Quick Book is a live online session that offers speed.");
    });
    it("lists what is open: values, needs by id, worries", () => {
        const answers = [offeringShown(segment.offerings[0].questions ?? {}, { type: "Service", worries: ["the-price-or-their-budget", "whether-it-fits-their-needs"] })];
        const kinds = valuePropositionOpenItems(segment, answers).map(item => item.kind + ": " + item.text);
        expect(kinds).toEqual([
            "Unmet value: Your Profiles care about Quality, and no Offering does it best.",
            "Unwanted benefit: Quick Book does Personalisation best, which no Profile ticks as what matters most.",
            "Unanswered need: \"Pay by phone\" is not addressed by any Offering.",
            "Worry left open: Your Profiles worry about Fit, and no Offering answers it."
        ]);
        expect(valueMismatch([{ b1: ["speed"] }], [{ name: "X", answers: { o4: ["speed"] } }])).toEqual({ unmet: [], unwanted: [] });
    });
});

describe("no question asked twice (owner, 2026-11-07: \"avoid overlapping and repetition\")", () => {
    it("asks the terms in O3, leaves the payment terms out of O10, and lets O7 answer the Support worry", () => {
        expect(offeringOptions("o10", { type: "Service" }).map(option => option.id)).toEqual(["access", "brief", "approval", "place", "equipment"]);
        expect(offeringOptions("o8", { type: "Service", worries: ["support-after-they-buy", "risk-or-security"] }).map(option => option.id)).toEqual(["risk-or-security"]);
        expect(offeringAsks("o8", { type: "Service", worries: ["support-after-they-buy"] })).toBe(false);
        const support = { ...segment, profiles: [{ ...segment.profiles[0], questions: { e3: ["support-after-they-buy"] } }] };
        const kinds = (o7: string) => valuePropositionOpenItems(support, [{ o7: [o7] }]).filter(item => item.kind === "Worry left open").length;
        expect(kinds("none")).toBe(1);
        expect(kinds("guides")).toBe(0);
    });
});
