import { describe, expect, it } from "vitest";

import {
    competitorAsks,
    competitorOtherAdd,
    competitorOtherName,
    competitorOtherRemove,
    competitorOtherSettle,
    competitorOtherTick,
    competitorOthers,
    otherMatch,
    competitorAsksLoyalty,
    competitorOpenings,
    competitorRate,
    competitorRatings,
    competitorSettle,
    competitorWording,
    hardToBeat,
    industryOfActivity,
    insightsDraft,
    reviewPlatformOrder
} from "./CompetitorQuestions";

const none = { profiles: [], others: [] };
const ids = (list: readonly { id: string }[]) => list.map(entry => entry.id);

describe("what each type of competitor is asked (doc 41)", () => {

    it("asks a rival business everything, a substitute no size or reach, the others the ratings only", () => {
        expect(["k1", "k2", "k3", "k4", "k5", "k7", "k8", "k9", "k10", "k11"].every(id => competitorAsks("direct", id as never))).toBe(true);
        expect(competitorAsks("substitutes", "k3")).toBe(false);
        expect(competitorAsks("substitutes", "k5")).toBe(false);
        expect(competitorAsks("substitutes", "k7")).toBe(true);
        expect(["k1", "k2", "k3", "k4", "k5", "k7", "k8"].some(id => competitorAsks("internal", id as never))).toBe(false);
        expect(["k9", "k10", "k11"].every(id => competitorAsks("status-quo", id as never))).toBe(true);
        expect(competitorAsksLoyalty("indirect")).toBe(true);
        expect(competitorAsksLoyalty("substitutes")).toBe(false);
        // No type chosen yet: asked as a direct competitor.
        expect(competitorAsks("", "k5")).toBe(true);
    });

    it("words each question for its type", () => {
        expect(competitorWording("direct", "k1")).toBe("What do they offer?");
        expect(competitorWording("indirect", "k1")).toBe("What do they offer?");
        expect(competitorWording("substitutes", "k1")).toBe("What form does this alternative take?");
        expect(competitorWording("internal", "k9")).toBe("How does doing it themselves do on what customers value?");
        expect(competitorWording("status-quo", "k10")).toBe("How could each change affect customers who do nothing?");
    });

    it("removes, on the next choice, the answers of the questions a new type does not ask", () => {
        const answers = { k3: ["small"], k5: ["website"], k8: ["loyalty"], "k8-rating": ["purchase:2"], k9: [], "k9-rating": ["speed:4"] };
        expect(competitorSettle(answers, "substitutes")).toEqual({ "k8-rating": ["purchase:2"], "k9-rating": ["speed:4"] });
        expect(competitorSettle(answers, "status-quo")).toEqual({ "k9-rating": ["speed:4"] });
        expect(competitorSettle(answers, "direct")).toEqual({ k3: ["small"], k5: ["website"], k8: ["loyalty"], "k8-rating": ["purchase:2"], "k9-rating": ["speed:4"] });
    });

    it("keeps a platform's rating only while it is ticked, and nothing outside 1 to 5", () => {
        const rated = competitorRate({ k7: ["google"] }, "k7", "google", 4);
        expect(competitorRatings(rated, "k7")).toEqual({ google: 4 });
        expect(competitorSettle({ ...rated, k7: [] }, "direct")).toEqual({});
        expect(competitorSettle({ k7: ["google"], "k7-rating": ["google:7"] }, "direct")).toEqual({ k7: ["google"] });
        expect(competitorRate(rated, "k7", "google", undefined)["k7-rating"]).toBeUndefined();
    });

});

describe("the review platforms in the order of the App User's industry and country (L18)", () => {

    it("reads the industry from the first activity's code, through the crosswalk L7", () => {
        expect(industryOfActivity("GB", "13921")).toBe("manufacturing");
        expect(industryOfActivity("GB", "56101")).toBe("hospitality");
        expect(industryOfActivity("US", "722511")).toBe("hospitality");
        expect(industryOfActivity("CA", "541511")).toBe("professional");
        expect(industryOfActivity("AU", "4511")).toBe("hospitality");
        expect(industryOfActivity("NZ", "H451100")).toBe("hospitality");
        expect(industryOfActivity("GB", "")).toBeUndefined();
    });

    it("puts Google and Facebook first, then the industry's, then the country's; the rest behind Show all", () => {
        expect(ids(reviewPlatformOrder("GB", "13921").first)).toEqual(["google", "facebook", "marketplace", "trustpilot"]);
        expect(ids(reviewPlatformOrder("US", "511210").first)).toEqual(["google", "facebook", "g2", "capterra", "app-store", "apple-maps", "yelp", "bbb"]);
        expect(ids(reviewPlatformOrder("AU", "4511").first)).toEqual(["google", "facebook", "tripadvisor", "booking", "airbnb", "opentable", "food-delivery", "trustpilot", "productreview"]);
        // Outside the six countries: Trustpilot; Japan's restaurants: Tabelog.
        expect(ids(reviewPlatformOrder("JP", "5610").first)).toEqual(["google", "facebook", "tripadvisor", "booking", "airbnb", "opentable", "food-delivery", "tabelog", "trustpilot"]);
        expect(ids(reviewPlatformOrder("DE", "6201").first)).toEqual(["google", "facebook", "g2", "capterra", "app-store", "omr", "trustpilot"]);
        // Nothing known: the two first, the rest behind Show all.
        const unknown = reviewPlatformOrder("", "");
        expect(ids(unknown.first)).toEqual(["google", "facebook"]);
        expect(unknown.rest).toHaveLength(19);
    });

});

describe("K11: the openings, from the card's own answers", () => {

    const profiles = [{ b1: ["speed", "lower-price"], "b1-rating": ["speed:5"] }];

    it("scores the values (5 − rating) × weight and words each by its rating", () => {
        const answers = { "k9-rating": ["speed:3", "lower-price:2", "good-support:4", "expert-knowledge:4", "quality-and-results:5"] };
        const openings = competitorOpenings(answers, "direct", { profiles, others: [] });
        // Speed: (5-3) x 5 = 10; Lower price: (5-2) x 2 = 6; Good support 4, not a B1 value: no option; Quality 5: no option.
        expect(openings.map(opening => opening.label)).toEqual(["Stand out on: Speed", "Offer better: Lower price"]);
        expect(hardToBeat("Etsy weavers", answers)).toEqual(["Etsy weavers is hard to beat on Quality and results; compete elsewhere."]);
        // A B1 value rated 4 is matched.
        expect(competitorOpenings({ "k9-rating": ["speed:4"] }, "direct", { profiles, others: [] }).map(opening => opening.label)).toEqual(["Match them on: Speed"]);
    });

    it("breaks a tie by how many of the Segment's competitors rate the value low", () => {
        const others = [{ "k9-rating": ["good-support:1"] }];
        const openings = competitorOpenings({ "k9-rating": ["expert-knowledge:2", "good-support:2"] }, "direct", { profiles: [], others });
        expect(openings.map(opening => opening.id)).toEqual(["better:good-support", "better:expert-knowledge"]);
    });

    it("reads the stages, the reviews, the loyalty, the growth and the changes", () => {
        const answers = { "k8-rating": ["purchase:2", "delivery:4"], k7: ["google"], "k7-rating": ["google:3"], k4: ["2"], "k10-rating": ["technology:5", "economy:1", "society:3"] };
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.label)).toEqual([
            "Make buying easier",
            "Win over their unhappy customers",
            "Give customers a reason to come back",
            "Win customers they are losing",
            "Use technology too",
            "Be ready where the economy hurts them"
        ]);
        // A loyalty tick: no "reason to come back"; a substitute's unhappy customers are this alternative's.
        expect(competitorOpenings({ ...answers, k8: ["loyalty"] }, "direct", none).some(opening => opening.id === "loyalty")).toBe(false);
        expect(competitorOpenings(answers, "substitutes", none).find(opening => opening.id === "unhappy")?.label).toBe("Win over this alternative's unhappy customers");
        // Nothing answered: no openings.
        expect(competitorOpenings({}, "direct", none)).toEqual([]);
    });

    it("words the status quo's and the internal solution's openings for what they are", () => {
        const answers = { "k9-rating": ["lower-price:5", "speed:1"], "k10-rating": ["regulation:2"] };
        expect(competitorOpenings(answers, "status-quo", none).map(opening => opening.label)).toEqual(["Show what doing nothing costs: Speed", "Use rules and law as a reason to act"]);
        expect(competitorOpenings({ "k9-rating": ["speed:2"] }, "internal", none).map(opening => opening.label)).toEqual(["Offer better: Speed", "Make it easier than doing it themselves"]);
    });

    it("drafts the lines for the Insights text: the values customers want that competitors fall short on, then the openings ticked", () => {
        const mine = { "k9-rating": ["speed:2", "lower-price:1"], k11: ["better:speed"] };
        const other = { "k9-rating": ["speed:1"] };
        const context = { profiles: [{ b1: ["speed"] }], others: [other], names: [{ name: "Etsy weavers", answers: mine }, { name: "High street", answers: other }] };
        const openings = competitorOpenings(mine, "direct", context);
        expect(insightsDraft("Etsy weavers", mine, context, openings)).toBe("Customers want speed; Etsy weavers, High street fall short on it.\nYou could offer better: Speed.");
    });

});

describe("Customer Acquisition, loyalty and Other (owner, 2026-11-04)", () => {

    it("rates a channel only while it is ticked, asks how they attract a rival's customers, and drops Aftercare", () => {
        const answers = competitorRate({ k5: ["website", "email"] }, "k5", "email", 2);
        expect(competitorSettle({ ...answers, k5: ["website"] }, "direct")).toEqual({ k5: ["website"] });
        expect(competitorSettle(answers, "direct")["k5-rating"]).toEqual(["email:2"]);
        expect(competitorAsks("direct", "k6")).toBe(true);
        expect(competitorAsks("substitutes", "k6")).toBe(false);
        expect(competitorWording("indirect", "k6")).toBe("How do they attract new customers?");
        expect(competitorSettle({ k6: ["trial", "nope"] }, "direct")).toEqual({ k6: ["trial"] });
        // A loyalty tick saved before Aftercare went is dropped.
        expect(competitorSettle({ k8: ["aftercare", "loyalty"] }, "direct")).toEqual({ k8: ["loyalty"] });
        // A channel they are little active on is an opening.
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.label)).toEqual(["Reach customers by email"]);
    });

    it("keeps an Other row while Other is ticked; a name that means a listed item becomes it, its rating kept", () => {
        let answers = competitorOtherTick({}, "k7", true);
        expect(competitorOthers(answers, "k7")).toEqual([""]);
        answers = competitorRate(competitorOtherName(answers, "k7", 0, "  Etsy "), "k7", "other-0", 3);
        answers = competitorOtherSettle(answers, "k7", 0);
        expect(answers.k7).toEqual(["marketplace"]);
        expect(competitorRatings(answers, "k7")).toEqual({ marketplace: 3 });
        expect(competitorOthers(answers, "k7")).toEqual([]);
        // A name that is no listed item stays an Other row, rated, and is a platform as the others are.
        answers = competitorRate(competitorOtherName(competitorOtherTick({}, "k7", true), "k7", 0, "Houzz UK forum"), "k7", "other-0", 2);
        expect(competitorOtherSettle(answers, "k7", 0)).toBe(answers);
        expect(competitorSettle(answers, "direct")).toEqual({ "k7-other": ["Houzz UK forum"], "k7-rating": ["other-0:2"] });
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.id)).toEqual(["unhappy"]);
        // Unticked: the rows and their ratings go.
        expect(competitorSettle(competitorOtherTick(answers, "k7", false), "direct")).toEqual({});
    });

    it("reads a value written under Other as a value, by its own words", () => {
        expect(otherMatch("k9", "shared values / identity")).toBe("shared-values-or-identity");
        expect(otherMatch("k9", "Speed")).toBe("speed");
        expect(otherMatch("k9", "Local sourcing")).toBeUndefined();
        let answers = competitorOtherName(competitorOtherTick({}, "k9", true), "k9", 0, "Local sourcing");
        answers = competitorRate(answers, "k9", "other-0", 2);
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.label)).toEqual(["Offer better: Local sourcing"]);
        expect(hardToBeat("Them", competitorRate(answers, "k9", "other-0", 5))).toEqual(["Them is hard to beat on Local sourcing; compete elsewhere."]);
        // Removing a row moves the later rows' ratings up.
        const two = competitorRate(competitorOtherAdd(answers, "k9"), "k9", "other-1", 4);
        expect(competitorRatings(competitorOtherRemove(two, "k9", 0), "k9")).toEqual({ "other-0": 4 });
    });

});
