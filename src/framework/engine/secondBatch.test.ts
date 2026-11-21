import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./answers/AnswerBusinessFoundation";
import { effectiveProfileAnswers, segmentForms } from "./answers/EffectiveAnswers";
import { offeringOptions, offeringShown } from "./choices/OfferingQuestions";
import { segmentAnswerStarts, segmentQuestionAsked, SEGMENT_QUESTIONS } from "./choices/SegmentQuestions";
import { journeySuggestions } from "./JourneySuggestions";
import { competitorReviewStarts } from "./choices/CompetitorQuestions";
import { relationshipApproachDraft, relationshipPurposeDraft } from "./RelationshipDrafts";
import type { SegmentIdentity } from "./SegmentContext";

/* The review's second batch (owner, 2026-11-18 00:46): what it starts, orders and asks. */

const people: SegmentIdentity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], stage: "manage" };
const segmentOf = (offerings: { id: string; category: string; questions?: Record<string, string[]> }[], questions: Record<string, string[]> = {}, profile: Record<string, string[]> = {}) => asBusinessFoundationValue({
    segments: [{ id: "s", name: "Makers", questions, profiles: [{ id: "p", name: "A", questions: profile }], offerings: offerings.map(offering => ({ name: offering.id, ...offering })) }]
}).segments[0];
const question = (id: string) => SEGMENT_QUESTIONS.find(entry => entry.id === id)!;

describe("2.8: how they pay, from who decides; no payment service where they buy on a marketplace", () => {
    it("starts Invoice or purchase order where a manager signs off or a formal procurement decides", () => {
        expect(segmentAnswerStarts({ authorise: ["executive"] }, { authorise: ["executive"] }).pay).toEqual(["invoicepo"]);
        expect(segmentAnswerStarts({}, { orgtype: ["public"] }).pay).toEqual(["invoicepo"]);
        expect(segmentAnswerStarts({}, { setting: ["mobile"], authorise: ["procurement"] }).pay).toEqual(["wallet", "invoicepo"]);
        expect(segmentAnswerStarts({ authorise: ["solo"] }, { authorise: ["solo"] }).pay).toBeUndefined();
    });
    it("asks for the payment services only where they do not shop on a marketplace", () => {
        const context = { frame: "people" as const, lifeStages: [], scales: [], relations: [], userStages: [], stage: "manage", endsUser: false };
        expect(segmentQuestionAsked(question("providers"), { pay: ["card"], setting: ["mobile"] }, context as never)).toBe(true);
        expect(segmentQuestionAsked(question("providers"), { pay: ["card"], setting: ["marketplace"] }, context as never)).toBe(false);
    });
});

describe("1.5: lists filtered by O1 show everything until every Offering has its form", () => {
    it("filters by the forms only once each Offering has one", () => {
        expect(segmentForms(segmentOf([{ id: "a", category: "Product", questions: { o1: ["physical"] } }, { id: "b", category: "Product" }]))).toEqual([]);
        expect(segmentForms(segmentOf([{ id: "a", category: "Product", questions: { o1: ["physical"] } }]))).toEqual(["physical"]);
    });
});

describe("1.3, 2.6 and 2.12: the Profile's starts from where the Segment discovers and what makes it shop", () => {
    it("starts D1 from free samples (the ways the Offerings fit) and from media and reviews, D3 from seasons", () => {
        const segment = segmentOf([{ id: "rug", category: "Product", questions: { o1: ["physical"] } }], { discover: ["samples", "media"], trigger: ["seasonal"] });
        const shown = effectiveProfileAnswers(segment.profiles[0], segment, people);
        expect(shown.d1).toEqual(expect.arrayContaining(["a-free-sample", "reviews-and-recommendations-online"]));
        expect(shown.d3).toContain("around-seasons-holidays");
        // (No way to try it first while an Offering's form is unknown.)
        const unknown = segmentOf([{ id: "rug", category: "Product" }], { discover: ["samples"] });
        expect(effectiveProfileAnswers(unknown.profiles[0], unknown, people).d1 ?? []).not.toContain("a-free-sample");
    });
});

describe("1.13, 2.11 and 2.13: the Offering's orders and starts", () => {
    it("puts the Ongoing terms first for a fixed salary, Per session first for hourly or variable pay", () => {
        expect(offeringOptions("o3", { type: "Service", workincome: "salary" })[0]).toMatchObject({ heading: "Ongoing" });
        expect(offeringOptions("o3", { type: "Service", workincome: "hourly" })[0]).toMatchObject({ id: "session", heading: "One purchase" });
        expect(offeringOptions("o3", { type: "Service" })[0]).toMatchObject({ id: "once" });
    });
    it("orders O4 and O8 by the Profiles' ratings, the rest in their own order", () => {
        const values = offeringOptions("o4", { type: "Product", valueWeights: { "good-support": 5, "lower-price": 2 } }).map(option => option.id);
        expect(values.slice(0, 2)).toEqual(["good-support", "lower-price"]);
        const worries = offeringOptions("o8", { type: "Product", worries: ["the-price-or-their-budget", "whether-they-can-trust-you"], worryWeights: { "whether-they-can-trust-you": 4, "the-price-or-their-budget": 1 } }).map(option => option.id);
        expect(worries).toEqual(["whether-they-can-trust-you", "the-price-or-their-budget"]);
    });
    it("starts O3t from O3: per session and a licence before they get it, commission when it is done", () => {
        expect(offeringShown({ o1: ["live"], o3: ["session"] }, { type: "Service" }).o3t).toEqual(["before"]);
        expect(offeringShown({ o1: ["digital"], o3: ["licence"] }, { type: "Product" }).o3t).toEqual(["before"]);
        expect(offeringShown({ o1: ["project"], o3: ["commission"] }, { type: "Service" }).o3t).toEqual(["after"]);
    });
});

describe("1.12: O10 says where an in-person Offering is given", () => {
    it("makes Customer Location where they give access to their home or site, Studio / Shop where they give something else", () => {
        const at = (o10?: string[]) => journeySuggestions(segmentOf([{ id: "fit", category: "Service", questions: { o1: ["inperson"], o6: ["inperson"], ...(o10 ? { o10 } : {}) } }]), people)
            .filter(entry => entry.stage === "delivery" && entry.category === "In Person").map(entry => entry.name);
        expect(at(["home"])).toContain("Customer Location");
        expect(at(["brief"])).toContain("Studio / Shop");
        expect(at()).toContain("Customer Location");
    });
});

describe("2.15: K6's rows from K5", () => {
    it("ticks the Marketplace and Facebook rows where they reach customers there, while K6 is never answered", () => {
        expect(competitorReviewStarts({ k5: ["marketplace", "social-media"], "k5-sub": ["social-media:facebook"] })).toEqual(["marketplace", "facebook"]);
        expect(competitorReviewStarts({ k5: ["marketplace"], k6: ["google"] })).toEqual(["google"]);
    });
});

describe("2.14: a relationship type's drafts", () => {
    it("drafts a Purpose from the type and the Offering's answers, and an Approach from a stage's channels", () => {
        expect(relationshipPurposeDraft("personal-assistance", "Weaving Workshops", { o16: ["oneday"] })).toBe("A person helps each customer of Weaving Workshops whenever they need it, replying within one working day.");
        expect(relationshipApproachDraft("personal-assistance", ["Instagram", "Email", "Instagram"])).toBe("A personal reply through Instagram and Email.");
        expect(relationshipApproachDraft("community", [])).toBe("");
    });
});

describe("a start unticked to none stays none (owner, 2026-11-18: starts follow their source until edited)", () => {
    const reload = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
    it("keeps the Segment's How they pay and Who decides empty, through a reload and a change of their source", async () => {
        const { segmentChoose, segmentSettleSaved } = await import("./choices/SegmentQuestions");
        const context = { frame: "business" as const, lifeStages: [], scales: [], relations: [], userStages: [], stage: "manage", endsUser: false };
        let saved = segmentSettleSaved(segmentChoose(question("pay"), { orgtype: ["public"] }, []), context as never);
        expect(saved.pay).toEqual([]);
        saved = asBusinessFoundationValue(reload({ segments: [{ id: "s", name: "S", questions: saved, profiles: [], offerings: [] }] })).segments[0].questions;
        expect(saved.pay).toEqual([]);
        // (The source changes -- a manager signs off --: still none.)
        saved = segmentSettleSaved(segmentChoose(question("authorise"), saved, []), context as never);
        expect(segmentAnswerStarts(saved, { ...saved, size: ["large"] }).pay).toBeUndefined();
        expect(segmentAnswerStarts(saved, { ...saved, size: ["large"] }).authorise).toBeUndefined();
    });
    it("keeps a Profile's D1 and D3, and an Offering's O20, empty through a reload and a change of their source", () => {
        const segment = segmentOf([{ id: "rug", category: "Product", questions: { o1: ["physical"], o6: ["shipped"], o20: [] } }], { discover: ["samples", "media"], trigger: ["seasonal"], reach: ["country"] }, { d1: [], d3: [] });
        const again = asBusinessFoundationValue(reload({ segments: [segment] })).segments[0];
        const shown = effectiveProfileAnswers(again.profiles[0], again, people);
        expect(shown.d1).toEqual([]);
        expect(shown.d3).toEqual([]);
        expect(again.offerings[0].questions?.o20).toEqual([]);
        expect(offeringShown(again.offerings[0].questions ?? {}, { type: "Product", reach: ["countries"] }).o20 ?? []).toEqual([]);
    });
    it("keeps K6 empty once its starts are unticked, through the settle and a change of K5", async () => {
        const { competitorSettle } = await import("./choices/CompetitorQuestions");
        const settled = competitorSettle(reload({ k5: ["marketplace"], k6: [] }), "direct");
        expect(settled.k6).toEqual([]);
        expect(competitorReviewStarts({ ...settled, "k5-sub": ["social-media:facebook"] })).toEqual([]);
    });
    it("keeps DV12 unticked to none on the saved card", async () => {
        const { asBusinessCapabilityValue } = await import("./answers/AnswerUtils");
        const capability = asBusinessCapabilityValue(reload({ delivery: { rug: { holdUps: [], duration: "", effort: "" } } }));
        expect(capability.delivery.rug.holdUps).toEqual([]);
    });
});
