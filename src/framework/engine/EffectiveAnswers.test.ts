import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { effectiveOfferingAnswers, effectiveProfileAnswers, effectiveSegmentAnswers, offeringStarts, offeringStartsById, withFieldSet } from "./EffectiveAnswers";
import { segmentAnswerLines, segmentQuestionsOf, segmentSettle } from "./SegmentQuestions";
import { segmentContextFor, settledSegmentAnswers } from "./SegmentContext";
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

/* Positioning's questions 8 to 10 moved to the Foundation cards (owner, 2026-11-08, "Move all three"): the old Positioning answer is the start of the new place; a value saved there wins. */
describe("the Differentiation and the end user's outcome start from the Positioning answer saved before, per Segment", () => {
    const proxy: SegmentIdentity = {
        relationships: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"], stage: "manage",
        differentiation: ["cost", "premium"], outcome: ["time"], outcomeUser: ["safety"]
    };
    const withQuestions = (questions: Record<string, string[]>) => asBusinessFoundationValue({
        segments: [{ id: "s", name: "Parents", questions, profiles: [{ id: "p", name: "A" }], offerings: [{ id: "o", name: "Kit", category: "Product" }] }]
    }).segments[0];

    it("starts each Segment's Differentiation (K14) and its end user's outcome (End user, 9) from the old answers, within the stage's limit", () => {
        expect(effectiveSegmentAnswers(withQuestions({}), proxy)).toMatchObject({ differentiation: ["cost", "premium"], "u-outcome": ["safety"] });
        // (Planning allows one: the start keeps the first.)
        expect(effectiveSegmentAnswers(withQuestions({}), { ...proxy, stage: "plan" })).toMatchObject({ differentiation: ["cost"], "u-outcome": ["safety"] });
    });

    it("lets a value saved in the new place win, even one cleared", () => {
        expect(effectiveSegmentAnswers(withQuestions({ differentiation: ["personal"], "u-outcome": ["learning"] }), proxy)).toMatchObject({ differentiation: ["personal"], "u-outcome": ["learning"] });
        // (Cleared: saved as an empty list, read back as one, and the old answer does not come back.)
        const cleared = withQuestions({ differentiation: [] });
        expect(cleared.questions.differentiation).toEqual([]);
        expect(effectiveSegmentAnswers(cleared, proxy).differentiation).toEqual([]);
        expect(segmentSettle({ differentiation: [] }, segmentContextFor(proxy, false))).toEqual({ differentiation: [] });
        // (A saved answer over the stage's limit goes back to empty, as on Positioning.)
        expect(segmentSettle({ differentiation: ["cost", "premium"] }, segmentContextFor({ ...proxy, stage: "plan" }, false))).toEqual({ differentiation: [] });
    });

    it("asks the end user's outcome only where the Segment has an end user", () => {
        const direct: SegmentIdentity = { ...proxy, buyerCategory: ["b2c:direct"], endUser: [] };
        expect(effectiveSegmentAnswers(withQuestions({}), direct)["u-outcome"]).toBeUndefined();
        expect(effectiveSegmentAnswers(withQuestions({}), direct).differentiation).toEqual(["cost", "premium"]);
        expect(segmentQuestionsOf("user", {}, segmentContextFor(direct, false)).map(question => question.id)).not.toContain("u-outcome");
        // (Not shown on the Segment since it moved on to the Profile's end-user part, E4 (owner, 2026-11-08); kept and settled there as its start.)
        expect(segmentQuestionsOf("user", {}, segmentContextFor(proxy, false)).map(question => question.id)).not.toContain("u-outcome");
        expect(segmentSettle({ "u-outcome": ["safety"] }, segmentContextFor(proxy, false))).toEqual({ "u-outcome": ["safety"] });
        // (A saved one goes once the Segment has no end user.)
        expect(segmentSettle({ "u-outcome": ["safety"] }, segmentContextFor(direct, false))).toEqual({});
    });

    it("starts O4 from the Segment's own Differentiation (the old one where none is saved), then from the buyer's outcome saved before", () => {
        const unsaved = withQuestions({});
        expect(effectiveOfferingAnswers(unsaved.offerings[0], unsaved, proxy).o4).toEqual(["lower-price", "quality-and-results", "shared-values-or-identity"]);
        const own = withQuestions({ differentiation: ["personal"] });
        expect(effectiveOfferingAnswers(own.offerings[0], own, proxy).o4).toEqual(["a-service-made-for-them", "good-support", "speed"]);
        const none = withQuestions({ differentiation: [] });
        expect(effectiveOfferingAnswers(none.offerings[0], none, proxy).o4).toEqual(["speed", "ease-and-convenience"]);
    });

    it("gives the documents and the exports the Segment's answers with the starts (settledSegmentAnswers), worded under the Segment", () => {
        const organisation = { customerType: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"], differentiation: ["cost"], outcomeUser: ["safety"] };
        const lines = segmentAnswerLines(settledSegmentAnswers(withQuestions({}), organisation));
        expect(lines).toContainEqual({ label: "Differentiation", value: "Cost-driven" });
        // (The end user's outcome is printed with the Profile's end-user part, E4, no longer with the Segment.)
        expect(lines.some(line => line.label === "Outcome for the end user")).toBe(false);
        expect(segmentAnswerLines(settledSegmentAnswers(withQuestions({ differentiation: ["ecosystem"] }), organisation))).toContainEqual({ label: "Differentiation", value: "Ecosystem & Integration" });
    });
});

/* What the later pages start from (specifications/business-system/README.md, "What each later page reads from Page 1"; phase 5f, 2026-11-09). */
describe("the later pages' starts follow the Offering's O3, O3b, O10 and O15", () => {
    const offeringWith = (questions: Record<string, string[]>, category = "Service") => {
        const segment = asBusinessFoundationValue({ segments: [{ id: "s", name: "Firms", offerings: [{ id: "o", name: "Audit", category, questions }] }] }).segments[0];
        return offeringStarts(segment.offerings[0], segment, undefined);
    };

    it("maps every O3 term to Customers Buy, Delivered and Charged", () => {
        const cases: [string, boolean, "unit" | "monthly", string][] = [
            ["once", false, "unit", "per-sale"], ["session", false, "unit", "per-sale"], ["rent", false, "unit", "per-sale"], ["commission", false, "unit", "per-sale"],
            ["project", false, "unit", "per-project"],
            ["subscription", true, "monthly", "monthly"], ["retainer", true, "monthly", "monthly"], ["payg", true, "monthly", "monthly"], ["licence", true, "monthly", "annually"]
        ];
        for (const [terms, recurring, deliveryMode, charged] of cases) {
            expect(offeringWith({ o3: [terms] }), terms).toMatchObject({ recurring, deliveryMode, charged });
        }
        // Free to them, or no answer, starts nothing.
        expect(offeringWith({ o3: ["free"] })).toEqual({});
        expect(offeringWith({})).toEqual({});
        // A saved membership is a subscription (merged 2026-11-08).
        expect(offeringWith({ o3: ["membership"] })).toMatchObject({ recurring: true, charged: "monthly" });
    });

    it("maps O3b to the Payment Timing: instalments are Milestones on a charge paid once, and no start on a monthly one", () => {
        expect(offeringWith({ o3: ["project"], o3t: ["before"] }).paymentTiming).toBe("upfront");
        expect(offeringWith({ o3: ["project"], o3t: ["deposit"] }).paymentTiming).toBe("split");
        expect(offeringWith({ o3: ["project"], o3t: ["after"] }).paymentTiming).toBe("completion");
        expect(offeringWith({ o3: ["project"], o3t: ["invoice"] }).paymentTiming).toBe("completion");
        expect(offeringWith({ o3: ["project"], o3t: ["monthly"] }).paymentTiming).toBe("milestone");
        expect(offeringWith({ o3: ["retainer"], o3t: ["monthly"] }).paymentTiming).toBeUndefined();
    });

    it("starts Calendar Time from O15's band for an Offering delivered per unit only, and Constraints from O10's words", () => {
        expect(offeringWith({ o3: ["project"], o15: ["week"] }).duration).toBe("1");
        expect(offeringWith({ o3: ["project"], o15: ["weeks"] }).duration).toBe("4");
        expect(offeringWith({ o3: ["project"], o15: ["months"] }).duration).toBe("13");
        expect(offeringWith({ o3: ["project"], o15: ["now"] }).duration).toBeUndefined();
        expect(offeringWith({ o3: ["project"], o15: ["longer"] }).duration).toBeUndefined();
        expect(offeringWith({ o3: ["retainer"], o15: ["weeks"] }).duration).toBeUndefined();
        expect(offeringWith({ o10: ["access", "brief"] }).constraints).toBe("Access to their systems or information; A clear brief.");
        // O10 is not asked of a Product, so a Product's saved O10 starts nothing.
        expect(offeringWith({ o10: ["access"] }, "Product").constraints).toBeUndefined();
    });

    it("finds an Offering by its id in any Segment, and gives nothing for an id not on Page 1", () => {
        const segments = asBusinessFoundationValue({ segments: [{ id: "a", name: "A", offerings: [] }, { id: "b", name: "B", offerings: [{ id: "o2", name: "Care", category: "Service", questions: { o3: ["retainer"] } }] }] }).segments;
        expect(offeringStartsById(segments, "o2").recurring).toBe(true);
        expect(offeringStartsById(segments, "gone")).toEqual({});
    });
});

