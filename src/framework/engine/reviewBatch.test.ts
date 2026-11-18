import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { offeringStartsById, segmentTrials } from "./EffectiveAnswers";
import { offeringShown } from "./OfferingQuestions";
import { demandSuggestions, journeySuggestions, withAnswerChannels } from "./JourneySuggestions";
import { BUSINESS_CHANNEL_ALL_OFFERINGS } from "./AnswerUtils";
import type { SegmentIdentity } from "./SegmentContext";

/* The review's bugs and its first batch (owner, 2026-11-17 08:38: "Bugs plus the first batch"). */

const people: SegmentIdentity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], stage: "manage" };
const segmentOf = (offerings: { id: string; category: string; questions?: Record<string, string[]> }[], questions: Record<string, string[]> = {}) => asBusinessFoundationValue({
    segments: [{ id: "s", name: "Makers", questions, profiles: [{ id: "p", name: "A", questions: {} }], offerings: offerings.map(offering => ({ name: offering.id, ...offering })) }]
}).segments[0];

describe("B1: Calendar Time starts from O15 less the sending", () => {
    it("takes the sending weeks off O15's upper end, a week at least", () => {
        const segment = segmentOf([
            { id: "kit", category: "Product", questions: { o1: ["physical"], o6: ["shipped"], o15: ["weeks"], o20: ["courier"] } },
            { id: "cushion", category: "Product", questions: { o1: ["physical"], o6: ["shipped"], o15: ["week"], o20: ["courier"] } }
        ]);
        expect(offeringStartsById([segment], "kit", people).duration).toBe("3");
        expect(offeringStartsById([segment], "cushion", people).duration).toBe("1");
    });
});

describe("B2: every way to try it first while no Offering says what it is", () => {
    it("gives no list of ways (so all show) until an Offering has a Type or a form", () => {
        expect(segmentTrials(segmentOf([]))).toBeUndefined();
        expect(segmentTrials(segmentOf([{ id: "x", category: "" }]))).toBeUndefined();
        // (An Offering whose form is unknown yet could be tried any way: 1.5, the second batch of the review; owner, 2026-11-18 00:46.)
        expect(segmentTrials(segmentOf([{ id: "x", category: "Product" }]))).toEqual(["sample", "trial", "demo", "taster", "catalogue"]);
        expect(segmentTrials(segmentOf([{ id: "x", category: "Product", questions: { o1: ["physical"] } }]))).toEqual(["sample", "catalogue"]);
    });
});

describe("B3: a channel the answers make serves the Offerings whose answers made it", () => {
    it("serves the Offerings received that way, and every Offering where the Segment's own answer made it", () => {
        const segment = segmentOf([
            { id: "kit", category: "Product", questions: { o1: ["physical"], o6: ["shipped"], o20: ["courier"] } },
            { id: "class", category: "Service", questions: { o1: ["live"] } }
        ], { discover: ["search"] });
        const channels = withAnswerChannels([], [], segment, people);
        const courier = channels.find(channel => channel.stages.includes("delivery") && channel.category !== "Online / Live");
        expect(courier?.offerings).toEqual(["kit"]);
        const booking = channels.find(channel => channel.name === "Booking / Registration Page");
        expect(booking?.offerings).toEqual(["class"]);
        const search = channels.find(channel => channel.stages.includes("discovery"));
        expect(search?.offerings).toEqual([BUSINESS_CHANNEL_ALL_OFFERINGS]);
        // (The suggestion says whose answer it is.)
        expect(journeySuggestions(segment, people).find(entry => entry.stage === "purchase" && entry.name === "Booking / Registration Page")?.offeringIds).toEqual(["class"]);
    });
});

describe("3.2: Visitors from where they buy", () => {
    it("makes a Visitors row from a Purchase channel of a marketplace, a shop or an online store", () => {
        const segment = segmentOf([{ id: "kit", category: "Product", questions: { o1: ["physical"] } }]);
        const etsy = { id: "etsy", category: "Marketplace", name: "Etsy", links: [""], offerings: [BUSINESS_CHANNEL_ALL_OFFERINGS], stages: ["purchase"], actionIds: {}, actions: {} };
        const rows = demandSuggestions(segment, "kit", [etsy], { sources: [] }, people);
        expect(rows.map(row => row.type)).toContain("marketplace");
    });
});

describe("3.4, 3.7, 3.9: O3, O15 and O20 start from the answers above them", () => {
    it("starts O20 with one way from the Segment's reach", () => {
        expect(offeringShown({ o1: ["physical"], o6: ["shipped"] }, { type: "Product", reach: ["country"] }).o20).toEqual(["postal"]);
        expect(offeringShown({ o1: ["physical"], o6: ["shipped"] }, { type: "Product", reach: ["countries"] }).o20).toEqual(["courier"]);
        expect(offeringShown({ o1: ["physical"], o6: ["shipped"], o20: [] }, { type: "Product", reach: ["country"] }).o20).toBeUndefined();
    });
    it("starts O15 from how they receive it", () => {
        expect(offeringShown({ o1: ["digital"], o6: ["auto"] }, { type: "Product" }).o15).toEqual(["now"]);
        expect(offeringShown({ o1: ["physical"], o6: ["shipped"] }, { type: "Product", reach: ["countries"] }).o15).toEqual(["weeks"]);
    });
});

describe("2.8: a batch's set-up is asked of a physical item only", () => {
    it("asks it of a physical Product, not of a digital one", () => {
        const segment = segmentOf([
            { id: "rug", category: "Product", questions: { o1: ["physical"] } },
            { id: "pattern", category: "Product", questions: { o1: ["digital"] } }
        ]);
        expect(offeringStartsById([segment], "rug", people).batches).toBe(true);
        expect(offeringStartsById([segment], "pattern", people).batches).toBeUndefined();
    });
});
