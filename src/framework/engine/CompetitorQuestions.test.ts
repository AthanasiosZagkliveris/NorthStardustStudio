import { describe, expect, it } from "vitest";
import { asBusinessCompetitor } from "./AnswerBusinessFoundation";

import {
    competitorAsks,
    competitorOtherAdd,
    competitorOtherName,
    competitorOtherRemove,
    competitorOtherSettle,
    competitorOtherTick,
    competitorOthers,
    otherMatch,
    draftToAdd,
    competitorAsksLoyalty,
    competitorOpenings,
    competitorRate,
    competitorRatings,
    competitorSettle,
    competitorWording,
    hardToBeat,
    competitorValueRows,
    industryOfActivity,
    insightsDraft,
    reviewPlatformOrder
} from "./CompetitorQuestions";

const none = { profiles: [], others: [] };
const ids = (list: readonly { id: string }[]) => list.map(entry => entry.id);

describe("what each type of competitor is asked (doc 41)", () => {

    it("asks a rival business everything, a substitute no size or reach, the others the ratings only", () => {
        expect(["k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10"].every(id => competitorAsks("direct", id as never))).toBe(true);
        expect(competitorAsks("substitutes", "k3")).toBe(false);
        expect(competitorAsks("substitutes", "k5")).toBe(false);
        expect(competitorAsks("substitutes", "k6")).toBe(true);
        expect(["k1", "k2", "k3", "k4", "k5", "k6", "k7"].some(id => competitorAsks("internal", id as never))).toBe(false);
        expect(["k8", "k9", "k10"].every(id => competitorAsks("status-quo", id as never))).toBe(true);
        expect(competitorAsksLoyalty("indirect")).toBe(true);
        expect(competitorAsksLoyalty("substitutes")).toBe(false);
        // No type chosen yet: asked as a direct competitor.
        expect(competitorAsks("", "k5")).toBe(true);
    });

    it("words each question for its type", () => {
        expect(competitorWording("direct", "k1")).toBe("What do they offer?");
        expect(competitorWording("indirect", "k1")).toBe("What do they offer?");
        expect(competitorWording("substitutes", "k1")).toBe("What form does this alternative take?");
        expect(competitorWording("internal", "k8")).toBe("How does doing it themselves do on what customers value?");
        expect(competitorWording("status-quo", "k9")).toBe("How could each change affect customers who do nothing?");
    });

    it("removes, on the next choice, the answers of the questions a new type does not ask", () => {
        const answers = { k3: ["small"], k5: ["website"], k7: ["loyalty"], "k7-rating": ["purchase:2"], k8: [], "k8-rating": ["speed:4"] };
        expect(competitorSettle(answers, "substitutes")).toEqual({ "k7-rating": ["purchase:2"], "k8-rating": ["speed:4"] });
        expect(competitorSettle(answers, "status-quo")).toEqual({ "k8-rating": ["speed:4"] });
        expect(competitorSettle(answers, "direct")).toEqual({ k3: ["small"], k5: ["website"], k7: ["loyalty"], "k7-rating": ["purchase:2"], "k8-rating": ["speed:4"] });
    });

    it("keeps a platform's rating only while it is ticked, and nothing outside 1 to 5", () => {
        const rated = competitorRate({ k6: ["google"] }, "k6", "google", 4);
        expect(competitorRatings(rated, "k6")).toEqual({ google: 4 });
        expect(competitorSettle({ ...rated, k6: [] }, "direct")).toEqual({});
        expect(competitorSettle({ k6: ["google"], "k6-rating": ["google:7"] }, "direct")).toEqual({ k6: ["google"] });
        expect(competitorRate(rated, "k6", "google", undefined)["k6-rating"]).toBeUndefined();
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

describe("K10: the openings, from the card's own answers", () => {

    const profiles = [{ b1: ["speed", "lower-price"], "b1-rating": ["speed:5"] }];

    it("scores the values (5 − rating) × weight and words each by its rating", () => {
        const answers = { "k8-rating": ["speed:3", "lower-price:2", "good-support:4", "expert-knowledge:4", "quality-and-results:5"] };
        const openings = competitorOpenings(answers, "direct", { profiles, others: [] });
        // Speed: (5-3) x 5 = 10; Lower price: (5-2) x 2 = 6; Good support 4, not a B1 value: no option; Quality 5: no option.
        expect(openings.map(opening => opening.label)).toEqual(["Be known for speed", "Offer lower prices"]);
        expect(hardToBeat("Etsy weavers", answers)).toEqual(["Etsy weavers is hard to beat on quality and results, so compete elsewhere."]);
        // A B1 value rated 4 is matched.
        expect(competitorOpenings({ "k8-rating": ["speed:4"] }, "direct", { profiles, others: [] }).map(opening => opening.label)).toEqual(["Match them on speed"]);
    });

    it("breaks a tie by how many of the Segment's competitors rate the value low", () => {
        const others = [{ "k8-rating": ["good-support:1"] }];
        const openings = competitorOpenings({ "k8-rating": ["expert-knowledge:2", "good-support:2"] }, "direct", { profiles: [], others });
        expect(openings.map(opening => opening.id)).toEqual(["better:good-support", "better:expert-knowledge"]);
    });

    it("reads the stages, the reviews, the loyalty, the growth and the changes", () => {
        const answers = { "k7-rating": ["purchase:2", "delivery:4"], k6: ["google"], "k6-rating": ["google:3"], k4: ["2"], "k9-rating": ["technology:5", "economy:1", "society:3"] };
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.label)).toEqual([
            "Make buying easier",
            "Win over their unhappy customers",
            "Give customers a reason to come back",
            "Win the customers they are losing",
            "Make the most of changes in technology",
            "Prepare for changes in the economy"
        ]);
        // A loyalty tick: no "reason to come back"; a substitute's unhappy customers are this alternative's.
        expect(competitorOpenings({ ...answers, k7: ["loyalty"] }, "direct", none).some(opening => opening.id === "loyalty")).toBe(false);
        expect(competitorOpenings(answers, "substitutes", none).find(opening => opening.id === "unhappy")?.label).toBe("Win over this alternative's unhappy customers");
        // Nothing answered: no openings.
        expect(competitorOpenings({}, "direct", none)).toEqual([]);
    });

    it("words the status quo's and the internal solution's openings for what they are", () => {
        const answers = { "k8-rating": ["lower-price:5", "speed:1"], "k9-rating": ["regulation:2"] };
        expect(competitorOpenings(answers, "status-quo", none).map(opening => opening.label)).toEqual(["Show what doing nothing costs them in speed", "Use changes in rules and law as a reason to act now"]);
        expect(competitorOpenings({ "k8-rating": ["speed:2"] }, "internal", none).map(opening => opening.label)).toEqual(["Be faster", "Make it easier than doing it themselves"]);
    });

    it("drafts the lines for the Insights text: the values customers want that competitors fall short on, then the openings ticked", () => {
        const mine = { "k8-rating": ["speed:2", "lower-price:1"], k10: ["better:speed"] };
        const other = { "k8-rating": ["speed:1"] };
        const context = { profiles: [{ b1: ["speed"] }], others: [other], names: [{ name: "Etsy weavers", answers: mine }, { name: "High street", answers: other }] };
        const openings = competitorOpenings(mine, "direct", context);
        const draft = insightsDraft("Etsy weavers", mine, context, openings);
        // "Add to text" adds only what is not in the text yet, and nothing once all of it is.
        expect(draftToAdd("", draft)).toBe(draft);
        expect(draftToAdd("Notes.\n\n  You could   be faster. ", draft)).toBe("Customers want speed, and Etsy weavers, High street fall short there.");
        expect(draftToAdd(draft + "\nMore.", draft)).toBe("");
        expect(insightsDraft("Etsy weavers", mine, context, openings)).toBe("Customers want speed, and Etsy weavers, High street fall short there.\nYou could be faster.");
    });

});

describe("Customer Acquisition, loyalty and Other (owner, 2026-11-04)", () => {

    it("rates a channel only while it is ticked, and drops Aftercare", () => {
        const answers = competitorRate({ k5: ["website", "email"] }, "k5", "email", 2);
        expect(competitorSettle({ ...answers, k5: ["website"] }, "direct")).toEqual({ k5: ["website"] });
        expect(competitorSettle(answers, "direct")["k5-rating"]).toEqual(["email:2"]);
        // A loyalty tick saved before Aftercare went is dropped.
        expect(competitorSettle({ k7: ["aftercare", "loyalty"] }, "direct")).toEqual({ k7: ["loyalty"] });
        // A channel they are little active on is an opening.
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.label)).toEqual(["Reach customers by email"]);
    });

    it("keeps an Other row while Other is ticked; a name that means a listed item becomes it, its rating kept", () => {
        let answers = competitorOtherTick({}, "k6", true);
        expect(competitorOthers(answers, "k6")).toEqual([""]);
        answers = competitorRate(competitorOtherName(answers, "k6", 0, "  Etsy "), "k6", "other-0", 3);
        answers = competitorOtherSettle(answers, "k6", 0);
        expect(answers.k6).toEqual(["marketplace"]);
        expect(competitorRatings(answers, "k6")).toEqual({ marketplace: 3 });
        expect(competitorOthers(answers, "k6")).toEqual([]);
        // A name that is no listed item stays an Other row, rated, and is a platform as the others are.
        answers = competitorRate(competitorOtherName(competitorOtherTick({}, "k6", true), "k6", 0, "Houzz UK forum"), "k6", "other-0", 2);
        expect(competitorOtherSettle(answers, "k6", 0)).toBe(answers);
        expect(competitorSettle(answers, "direct")).toEqual({ "k6-other": ["Houzz UK forum"], "k6-rating": ["other-0:2"] });
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.id)).toEqual(["unhappy"]);
        // Unticked: the rows and their ratings go.
        expect(competitorSettle(competitorOtherTick(answers, "k6", false), "direct")).toEqual({});
    });

    it("keeps K8 to the listed values: a value once written under Other is dropped", () => {
        const answers = { "k8-other": ["Local sourcing"], "k8-rating": ["other-0:2", "speed:2"] };
        expect(competitorSettle(answers, "direct")).toEqual({ "k8-rating": ["speed:2"] });
        expect(competitorOpenings(answers, "direct", none).map(opening => opening.value)).toEqual(["speed"]);
        expect(hardToBeat("Them", { "k8-rating": ["other-0:5"] })).toEqual([]);
        expect(otherMatch("k6", "Google Maps")).toBe("google");
        // Removing a platform row moves the later rows' ratings up.
        const one = competitorRate(competitorOtherName(competitorOtherTick({}, "k6", true), "k6", 0, "Forum"), "k6", "other-0", 2);
        const two = competitorRate(competitorOtherAdd(one, "k6"), "k6", "other-1", 4);
        expect(competitorRatings(competitorOtherRemove(two, "k6", 0), "k6")).toEqual({ "other-0": 4 });
    });

    it("reads answers saved before K6 (attract) went under the new numbers", () => {
        const older = asBusinessCompetitor({ questions: { k5: ["website"], k6: ["trial"], k7: ["google"], "k7-rating": ["google:4"], "k8-rating": ["purchase:2"], "k9-rating": ["speed:2", "other-0:5"], "k9-other": ["Story"], "k10-rating": ["economy:1"], k11: ["better:speed"] } });
        expect(older.questions).toEqual({ k5: ["website"], k6: ["google"], "k6-rating": ["google:4"], "k7-rating": ["purchase:2"], "k8-rating": ["speed:2"], "k9-rating": ["economy:1"], k10: ["better:speed"] });
        // Answers already on the new numbers are read as they are.
        const current = { k6: ["google"], "k8-rating": ["speed:2"], "k9-rating": ["economy:1"], k10: ["better:speed"] };
        expect(asBusinessCompetitor({ questions: current }).questions).toEqual(current);
    });

    it("rates only the values the Segment's Profiles tick in B1, the highest rated first", () => {
        const profiles = [
            { b1: ["speed", "lower-price"], "b1-rating": ["speed:3", "lower-price:5"] },
            { b1: ["speed", "good-support"], "b1-rating": ["speed:3", "good-support:3"] }
        ];
        // Lower price 5; Speed 3 twice before Good support 3 once.
        expect(competitorValueRows({ profiles }).map(value => value.id)).toEqual(["lower-price", "speed", "good-support"]);
        // No Profile has ticked one yet: every value of L1.
        expect(competitorValueRows({ profiles: [{}] }).length).toBe(10);
        // A value no Profile ticks any more is not shown and not read, but its rating stays saved.
        const answers = { "k8-rating": ["expert-knowledge:1", "speed:5"] };
        expect(competitorSettle(answers, "direct")["k8-rating"]).toEqual(["expert-knowledge:1", "speed:5"]);
        expect(competitorOpenings(answers, "direct", { profiles, others: [] })).toEqual([]);
        expect(hardToBeat("Them", answers, { profiles })).toEqual(["Them is hard to beat on speed, so compete elsewhere."]);
        // Ticked again, it is read again.
        const again = [...profiles, { b1: ["expert-knowledge"] }];
        expect(competitorOpenings(answers, "direct", { profiles: again, others: [] }).map(opening => opening.id)).toEqual(["better:expert-knowledge"]);
    });

});
