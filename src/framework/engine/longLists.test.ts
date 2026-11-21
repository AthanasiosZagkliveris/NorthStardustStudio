import { describe, expect, it } from "vitest";

import { SEGMENT_QUESTIONS, segmentOptions, type SegmentContext } from "./choices/SegmentQuestions";
import { PROFILE_QUESTIONS, profileOptionsShown } from "./choices/ProfileQuestions";
import { offeringOptionsWith, offeringReachNote, offeringShown } from "./choices/OfferingQuestions";
import { competitorChannelOptions } from "./choices/CompetitorQuestions";

/* Long lists filtered, ordered and grouped by the answers above them, and the reach (the open decisions and gaps, Group 4b; owner, 2026-11-17). */
const OPEN: SegmentContext = { frame: "open", stage: "manage", lifeStages: [], endsUser: false, userStages: [], relations: [], scales: [] };
const ids = (list: readonly { id: string }[]) => list.map(option => option.id);
const segmentQuestion = (id: string) => SEGMENT_QUESTIONS.find(entry => entry.id === id)!;

describe("the Segment's long lists", () => {

    it("offers the marketplaces the Offerings' forms sell on, Other always", () => {
        const offered = (forms: string[]) => ids(segmentOptions(segmentQuestion("marketplaces"), {}, { ...OPEN, forms }, false));
        expect(offered(["physical"])).toEqual(["etsy", "amazon", "ebay", "noths", "folksy", "other"]);
        expect(offered(["digital"])).toEqual(["etsy", "gumroad", "other"]);
        expect(offered(["project"])).toEqual(["fiverr", "upwork", "other"]);
        expect(offered([])).toHaveLength(9);
    });

    it("orders the payment services by where they shop", () => {
        const order = (setting: string[]) => ids(segmentOptions(segmentQuestion("providers"), { setting }, OPEN)).slice(0, 3);
        expect(order(["store"])).toEqual(["sumup", "square", "zettle"]);
        expect(order(["mobile"])).toEqual(["stripe", "paypal", "shopify"]);
    });

});

describe("the Profile's social media (C2)", () => {
    it("puts LinkedIn first for a business Segment, TikTok and Instagram for customers under 25", () => {
        const c2 = PROFILE_QUESTIONS.find(question => question.id === "c2")!;
        expect(ids(profileOptionsShown(c2, {}, { ...OPEN, frame: "business" }, {}))[0]).toBe("linkedin");
        expect(ids(profileOptionsShown(c2, { age: ["young"] }, { ...OPEN, frame: "people" }, {})).slice(0, 2)).toEqual(["tiktok", "instagram"]);
    });
});

describe("the Offering's O3, O6, O20 and O15", () => {

    it("offers O6 by the form; a saved way outside it stays, with its note", () => {
        const o6 = (form: string, chosen: string[] = []) => offeringOptionsWith("o6", { type: "Product" }, chosen, { o1: [form] });
        expect(ids(o6("physical"))).toEqual(["inperson", "shipped", "collect"]);
        expect(ids(o6("digital"))).toEqual(["auto", "byyou"]);
        expect(ids(o6("app"))).toEqual(["access"]);
        expect(ids(o6("live"))).toEqual(["live", "inperson"]);
        expect(o6("project")).toHaveLength(7);
        const kept = o6("digital", ["shipped"]).find(option => option.id === "shipped") as { note?: string };
        expect(kept.note).toBe("Kept from your earlier answer. It sits outside the usual ways to receive this kind of Offering.");
    });

    it("orders O6 and O20 by the Segment's reach, the post and couriers first for a rural area; several countries starts O15 at One to four weeks", () => {
        expect(ids(offeringOptionsWith("o6", { type: "Product", reach: ["city"] }, [], { o1: ["physical"] })).slice(0, 2)).toEqual(["inperson", "collect"]);
        expect(ids(offeringOptionsWith("o20", { type: "Product", reach: ["countries"] })).slice(0, 2)).toEqual(["courier", "fulfilment"]);
        expect(ids(offeringOptionsWith("o20", { type: "Product", reach: ["city"] }))[0]).toBe("local");
        expect(ids(offeringOptionsWith("o20", { type: "Product", area: "1" })).slice(0, 2)).toEqual(["postal", "courier"]);
        expect(offeringShown({}, { type: "Product", reach: ["countries"] }).o15).toEqual(["weeks"]);
    });

    it("notes customers far away for an Offering given only in person or collected", () => {
        expect(offeringReachNote({ o6: ["inperson"] }, { type: "Service", reach: ["countries"] }))
            .toBe("Your customers live in several countries, and this Offering is given in person. Add a live online session or shipping, or narrow where your customers are.");
        expect(offeringReachNote({ o6: ["inperson", "shipped"] }, { type: "Service", reach: ["countries"] })).toBeNull();
        expect(offeringReachNote({ o6: ["inperson"] }, { type: "Service", reach: ["city"] })).toBeNull();
    });

});

describe("K5, the competitor's channels", () => {
    it("gains Advertising, Print & mail and Samples & trials, and puts the customers' own groups first", () => {
        const options = competitorChannelOptions(["social-media", "advertising"]);
        expect(ids(options).slice(0, 2)).toEqual(["social-media", "advertising"]);
        expect(options.filter(option => option.heading).map(option => option.heading)).toEqual(["Your customers' channels", "Others"]);
        expect(ids(competitorChannelOptions([]))).toEqual(expect.arrayContaining(["advertising", "print-mail", "samples-trials"]));
    });
});
