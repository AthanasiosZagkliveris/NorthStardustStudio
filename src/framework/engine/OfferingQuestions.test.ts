import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { OUTCOME_IDS } from "./PositioningIds";
import { OFFERING_BOX_QUESTIONS, asOfferingAnswers, draftOffered, highestRated, offeringAsks, offeringInfo, offeringOptions, offeringShown, valueMismatch, valuePropositionDraft, valuePropositionOpenItems } from "./OfferingQuestions";

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
    it("starts O4 from Performance & Innovation and Ecosystem & Integration through the nearest L1 options (doc 34, 5.2a; owner, 2026-11-08)", () => {
        expect(offeringShown({}, { type: "Product", differentiation: ["performance"] }).o4).toEqual(["quality-and-results", "expert-knowledge"]);
        expect(offeringShown({}, { type: "Product", differentiation: ["ecosystem"] }).o4).toEqual(["ease-and-convenience"]);
    });
    it("starts O4 from the buyer's outcome saved on Positioning before 2026-11-08 (O4 owns it now), through the crosswalk, after the differentiation's ticks (doc 34, 5.2a)", () => {
        // (Every outcome has its value in O4's list already: O4 needed no new option.)
        const values = offeringOptions("o4", { type: "Product" }).map(option => option.id);
        for (const outcome of OUTCOME_IDS) {
            const start = offeringShown({}, { type: "Product", outcome: [outcome] }).o4 ?? [];
            expect(start.length, outcome).toBeGreaterThan(0);
            expect(start.every(id => values.includes(id)), outcome).toBe(true);
        }
        expect(offeringShown({}, { type: "Product", outcome: ["savings"] }).o4).toEqual(["lower-price"]);
        expect(offeringShown({}, { type: "Product", outcome: ["assurance"] }).o4).toEqual(["safety-and-low-risk", "trust-and-reputation"]);
        // The differentiation's first, then the outcome's, three at most; a saved O4 wins.
        expect(offeringShown({}, { type: "Product", differentiation: ["cost"], outcome: ["time"] }).o4).toEqual(["lower-price", "speed", "ease-and-convenience"]);
        expect(offeringShown({}, { type: "Product", differentiation: ["premium"], outcome: ["prestige"] }).o4).toEqual(["quality-and-results", "shared-values-or-identity"]);
        expect(offeringShown({ o4: ["good-support"] }, { type: "Product", outcome: ["time"] }).o4).toEqual(["good-support"]);
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
    it("counts an unwanted benefit only from O4 ticks the user saved, not from its starting ticks (owner, 2026-11-08)", () => {
        const unsaved = { ...segment, offerings: [{ ...segment.offerings[0], questions: { o1: ["live"] } }] };
        const started = [offeringShown(unsaved.offerings[0].questions, { type: "Service", differentiation: ["premium"] })];
        expect(started[0].o4).toEqual(["quality-and-results", "shared-values-or-identity"]);
        const items = valuePropositionOpenItems(unsaved, started);
        expect(items.map(item => item.kind)).not.toContain("Unwanted benefit");
        // (The starting ticks still count for the other open items: Quality is done best, so only Speed is unmet.)
        expect(items.filter(item => item.kind === "Unmet value").map(item => item.text)).toEqual(["Your Profiles care about Speed, and no Offering does it best."]);
        // A tick the user saved counts.
        const savedTicks = { ...segment, offerings: [{ ...segment.offerings[0], questions: { o1: ["live"], o4: ["shared-values-or-identity"] } }] };
        expect(valuePropositionOpenItems(savedTicks, [offeringShown(savedTicks.offerings[0].questions, { type: "Service" })]).map(item => item.kind)).toContain("Unwanted benefit");
    });
});

describe("no question asked twice (owner, 2026-11-07: \"avoid overlapping and repetition\")", () => {
    it("asks the terms in O3, leaves the payment terms out of O10, and lets O7 answer the Support worry", () => {
        expect(offeringOptions("o10", { type: "Service" }).map(option => option.id)).toEqual(["access", "brief", "approval", "place", "equipment", "home", "attendance"]);
        expect(offeringOptions("o8", { type: "Service", worries: ["support-after-they-buy", "risk-or-security"] }).map(option => option.id)).toEqual(["risk-or-security"]);
        expect(offeringAsks("o8", { type: "Service", worries: ["support-after-they-buy"] })).toBe(false);
        const support = { ...segment, profiles: [{ ...segment.profiles[0], questions: { e3: ["support-after-they-buy"] } }] };
        const kinds = (o7: string) => valuePropositionOpenItems(support, [{ o7: [o7] }]).filter(item => item.kind === "Worry left open").length;
        expect(kinds("none")).toBe(1);
        expect(kinds("guides")).toBe(0);
    });
});

describe("O2, O3, O10 and O18 from the research (2026-11-08)", () => {

    it("starts O2 at Yes, now while launching", () => {
        expect(offeringShown({}, { type: "Service", stage: "launch" }).o2).toEqual(["now"]);
        expect(offeringShown({}, { type: "Service", stage: "plan" }).o2).toEqual(["building"]);
    });

    it("reads a saved A membership as A subscription / membership, and keeps A project or contract first for an invoice", () => {
        expect(asOfferingAnswers({ o3: ["membership"] }).o3).toEqual(["subscription"]);
        expect(offeringShown({ o3: ["membership"] }, { type: "Service" }).o3).toEqual(["subscription"]);
        const ids = offeringOptions("o3", { type: "Service" }).map(option => option.id);
        expect(ids).toEqual(["once", "subscription", "licence", "payg", "session", "rent", "project", "retainer", "commission", "free"]);
        expect(offeringOptions("o3", { type: "Service" }).find(option => option.id === "subscription")?.label).toBe("A subscription / membership");
        expect(offeringOptions("o3", { type: "Service", pay: ["invoice"] })[0].id).toBe("project");
        expect(offeringOptions("o3", { type: "Service", pay: ["invoice"] })).toHaveLength(10);
    });

    it("says only the Organisation country's cancellation rule in O18's \"i\"", () => {
        const info = (country?: string) => offeringInfo("o18", { type: "Service", country });
        expect(info()).toEqual(["The terms your customers agree to.", "Cancellation rights differ by country; check the rules where you sell.", "A legal minimum age is not ticked here: write an age limit in the Notes."]);
        expect(info("DE")).toEqual(info());
        expect(info("GB")[1]).toMatch(/^In the UK, a consumer can cancel/);
        expect(info("GB")[2]).toMatch(/^Not covered: goods made to their specification/);
        expect(info("GB")[4]).toMatch(/Consumer Contracts Regulations 2013, regulation 28/);
        expect(info("IE")[1]).toMatch(/^In Ireland and the EU/);
        expect(info("IE")[4]).toMatch(/2011\/83\/EU, Article 16/);
        expect(info("US").join(" ")).toMatch(/Cooling-Off Rule gives 3 business days/);
        expect(info("CA")[1]).toMatch(/^Set by each province/);
        expect(info("AU")[1]).toMatch(/10 business days/);
        expect(info("NZ")[1]).toMatch(/5 working days/);
        for (const country of ["GB", "IE", "US", "CA", "AU", "NZ"]) {
            const lines = info(country);
            expect(lines[0]).toBe("The terms your customers agree to.");
            expect(lines).toContain("A legal minimum age is not ticked here: write an age limit in the Notes.");
            expect(lines[lines.length - 1]).toMatch(/^Based on: /);
            for (const line of lines) {
                expect(line.length, line).toBeLessThanOrEqual(160);
            }
        }
        expect(offeringInfo("o3", { type: "Service", country: "GB" })).toBe(offeringInfo("o3", { type: "Service" }));
    });

    it("keeps every new point of O3 and O10 within 160 characters", () => {
        for (const line of [...offeringInfo("o3", { type: "Service" }), ...offeringInfo("o10", { type: "Service" })]) {
            expect(line.length, line).toBeLessThanOrEqual(160);
        }
    });

    it("starts O4 from Personal Service & Relationship with Personalisation and Support", () => {
        expect(offeringShown({}, { type: "Service", differentiation: ["personal"] }).o4).toEqual(["a-service-made-for-them", "good-support"]);
    });

    it("drafts the new goals in their phrases", () => {
        const draft = (goal: string) => valuePropositionDraft(segment, segment.offerings[0], {}, { type: "Service" }, [{ e1: [goal], e2: ["it-takes-too-long"] }]);
        expect(draft("save-time-money")).toContain("want to save time and money");
        expect(draft("get-a-problem-fixed")).toContain("want to get a problem fixed");
        expect(draft("enjoy-themselves")).toContain("want to enjoy themselves");
        expect(draft("meet-a-requirement")).toContain("want to meet their obligations");
    });

});

/* Phase 5, P6 and P7 (owner, 2026-11-08): the boxes in the order of the card; the codes stay. */
describe("the Offering's boxes", () => {
    it("asks O1 alone in Function, O8 then O4 in Customer Benefit (after the needs addressed), and O2, O3, O15, O6 in Purchase & Delivery", () => {
        expect(OFFERING_BOX_QUESTIONS.function).toEqual([["o1"]]);
        expect(OFFERING_BOX_QUESTIONS.benefit).toEqual([["o8"], ["o4"]]);
        expect(OFFERING_BOX_QUESTIONS.delivery).toEqual([["o2"], ["o3", "o3t"], ["o15"], ["o6"]]);
    });
    it("points O8's and O15's \"i\" where the other question stands now", () => {
        expect(offeringInfo("o8", { type: "Service" }).join(" ")).toContain("in Support & Communication");
        expect(offeringInfo("o8", { type: "Service" }).join(" ")).not.toContain("above");
        expect(offeringInfo("o15", { type: "Service" }).join(" ")).toContain("the question below");
    });
});

/* Phase 5, P5 (owner, 2026-11-08): O16 and O17 held back while Planning, their saved answers kept. */
describe("O16 and O17 held back while Planning", () => {
    it("are not asked while Planning (an empty stage too) and are from Launching; a saved answer stays readable", () => {
        for (const stage of ["plan", undefined]) {
            expect(offeringAsks("o16", { type: "Service", stage })).toBe(false);
            expect(offeringAsks("o17", { type: "Service", stage })).toBe(false);
        }
        expect(offeringAsks("o16", { type: "Service", stage: "launch" })).toBe(true);
        expect(offeringAsks("o17", { type: "Service", stage: "launch" })).toBe(true);
        expect(offeringShown({ o16: ["sameday"], o17: ["updates"] }, { type: "Service", stage: "plan" })).toEqual(expect.objectContaining({ o16: ["sameday"], o17: ["updates"] }));
    });
});
