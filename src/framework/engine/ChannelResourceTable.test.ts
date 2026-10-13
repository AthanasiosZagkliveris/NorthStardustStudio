import { describe, expect, test } from "vitest";

import {
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    createBusinessResourceSlot,
    type BusinessResourceSlotValue
} from "./AnswerUtils.ts";
import { buildChannelResourceTable } from "./ChannelResourceTable.ts";
import { capabilityCards } from "./ChannelResources.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";

const slot = (id: string, name: string, extra: Partial<BusinessResourceSlotValue> & { price?: string; frequency?: string } = {}): BusinessResourceSlotValue => {
    const { price = "", frequency = "", ...rest } = extra;
    return { ...createBusinessResourceSlot(), id, name, status: "costs", ...rest, cost: { price, frequency, frequencyOther: "", unit: "", currency: "" } };
};

function seeded() {
    const capability = asBusinessCapabilityValue(undefined);
    const withResources = {
        ...capability,
        offering: {
            ...capability.offering,
            resources: [
                slot("card-shop", "Shopify Basic", { price: "25", frequency: "monthly", offeringIds: ["off-a", "off-b"] }),
                slot("card-ship", "Courier label", { price: "1.40", frequency: "per-order", offeringIds: ["off-a"] }),
                slot("card-year", "Domain", { price: "120", frequency: "annually", offeringIds: [] }),
                slot("card-ads", "Mail seats", { price: "50", frequency: "monthly", quantity: "2", offeringIds: ["off-b"] }),
                slot("card-kit", "Pop-up stall", { price: "400", frequency: "one-time" }),
                slot("card-free", "Camera", { status: "exists" }),
                slot("card-new", "New card", { status: "" })
            ]
        }
    };
    const link = (id: string, channelId: string, resourceId: string, actionIds: string[], segmentId = "seg-1") =>
        ({ id, segmentId, channelId, resourceId, actionIds });
    const engagement = asBusinessEngagementValue({
        channelResources: [
            link("l-ship", "mail", "card-ship", ["a-news"]),
            link("l-shop", "insta", "card-shop", ["a-reels", "a-plain"]),
            link("l-year", "insta", "card-year", []),
            link("l-ads", "mail", "card-ads", ["a-news"]),
            link("l-kit", "pin", "card-kit", ["a-pins"]),
            link("l-free", "pin", "card-free", []),
            link("l-new", "pin", "card-new", []),
            link("l-gone", "pin", "card-deleted", []),
            link("l-other", "elsewhere", "card-shop", [], "seg-2")
        ],
        segments: [{
            segmentId: "seg-1",
            actions: [{ id: "a-reels", text: "Post reels" }, { id: "a-pins", text: "Pin room sets" }, { id: "a-plain", text: "Answer DMs" }, { id: "a-news", text: "Send the monthly note" }],
            channels: [
                { id: "mail", category: "Email", name: "Newsletter", stages: ["evaluation"], actionIds: { evaluation: ["a-news"] } },
                { id: "insta", category: "Social Media", name: "Instagram", stages: ["support", "discovery"], actionIds: { discovery: ["a-reels", "a-plain"], support: ["a-plain"] } },
                { id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actionIds: { discovery: ["a-reels", "a-pins"] } }
            ]
        }]
    });
    return { engagement, cards: capabilityCards(withResources), segment: engagement.segments[0] };
}

const offerings = [{ id: "off-a", name: "Prints" }, { id: "off-b", name: "Frames" }];

describe("the channel resources table, derived", () => {

    const { engagement, cards, segment } = seeded();
    const table = buildChannelResourceTable(engagement, segment, cards, "GBP", offerings);
    const row = (id: string) => table.rows.find(entry => entry.resourceId === id)!;

    test("one row per distinct card of the Segment, in the channel table's order; none for a missing card or another Segment's link", () => {
        // Email first (the first channel's category), then Social Media: Instagram, Pinterest.
        expect(table.rows.map(entry => entry.name)).toEqual([
            "Courier label", "Mail seats", "Shopify Basic", "Domain", "Pop-up stall", "Camera", "New card"
        ]);
    });

    test("the cost reads price x quantity and how often, or says why it has none", () => {
        expect(row("card-shop").costText).toBe("£25 a month");
        expect(row("card-ship").costText).toBe("£1.40 per order");
        expect(row("card-year").costText).toBe("£120 a year");
        expect(row("card-ads").costText).toBe("£100 a month");
        expect(row("card-ads").costDetail).toBe("2 × £50");
        expect(row("card-kit").costText).toBe("£400 one-time");
        expect(row("card-free").costText).toBe("Free");
        expect(row("card-new").costText).toBe("No cost yet");
    });

    test("Fixed or Variable by frequency, as the Financial Foundation reads it; none without a counted cost", () => {
        expect(["card-shop", "card-year", "card-kit", "card-ads"].map(id => row(id).behaviour)).toEqual(["Fixed", "Fixed", "Fixed", "Fixed"]);
        expect(row("card-ship").behaviour).toBe("Variable");
        expect(row("card-free").behaviour).toBe("");
        expect(row("card-new").behaviour).toBe("");
    });

    test("home channel, the others its actions reach, its stages in journey order, its actions by total number", () => {
        const shop = row("card-shop");
        expect(shop.home).toBe("Social Media · Instagram");
        expect(shop.reaches).toEqual(["Social Media · Pinterest"]);
        expect(shop.stages).toEqual(["Discover", "Support & Follow Up"]);
        // Numbered over distinct actions in the table's walk: the newsletter's #1, Instagram's Support row (Answer DMs) #2, its Discover row's Post reels #3; Answer DMs and Pinterest's Post reels repeat their numbers.
        expect(shop.actions.map(action => "#" + action.order + " " + action.text)).toEqual(["#2 Answer DMs", "#3 Post reels"]);
        expect(row("card-year").reaches).toEqual([]);
        expect(row("card-year").stages).toEqual([]);
        expect(row("card-ship").home).toBe("Email · Newsletter");
    });

    test("a resource linked to an action of another channel keeps its home, lists that channel under it, and numbers the action by the whole table", () => {
        const base = seeded();
        const foreign = {
            ...base.engagement,
            channelResources: base.engagement.channelResources.map(entry => entry.id === "l-ship" ? { ...entry, actionIds: ["a-news", "a-pins"] } : entry)
        };
        const built = buildChannelResourceTable(foreign, base.segment, base.cards, "GBP", offerings);
        const ship = built.rows.find(entry => entry.resourceId === "card-ship")!;
        expect(ship.home).toBe("Email · Newsletter");
        expect(ship.reaches).toEqual(["Social Media · Pinterest"]);
        expect(ship.stages).toEqual(["Discover", "Evaluation"]);
        expect(ship.actions.map(action => "#" + action.order + " " + action.text)).toEqual(["#1 Send the monthly note", "#4 Pin room sets"]);
    });

    test("Offerings: only the names the card holds -- never All Offerings; none for a card with none linked or without the field", () => {
        expect(row("card-shop").offerings).toEqual(["Prints", "Frames"]);
        expect(row("card-ship").offerings).toEqual(["Prints"]);
        expect(row("card-year").offerings).toEqual([]);
        expect(row("card-ads").offerings).toEqual(["Frames"]);
        expect(table.rows.flatMap(entry => entry.offerings)).not.toContain("All Offerings");
    });

    test("an Infrastructure card (no Offerings field) has no Offerings, whatever Offerings the Segment has", () => {
        const base = seeded();
        const cap = asBusinessCapabilityValue(undefined);
        const infra = capabilityCards({
            ...cap,
            resources: { ...cap.resources, utilities: [{ id: "u", name: "Utilities", slots: [slot("card-power", "Power", { price: "30", frequency: "monthly" })] }] }
        } as typeof cap);
        const engaged = { ...base.engagement, channelResources: [{ id: "l-power", segmentId: "seg-1", channelId: "mail", resourceId: "card-power", actionIds: [] }] };
        const power = buildChannelResourceTable(engaged, base.segment, infra, "GBP", offerings).rows.find(entry => entry.resourceId === "card-power");
        expect(power).toBeDefined();
        expect(power!.offerings).toEqual([]);
    });

    test("the summary adds up the rows: annual / 12 into the month, per-order apart, one-time apart", () => {
        // 25 + 120 / 12 + 100 = 135 a month.
        expect(table.summary).toEqual({ fixedPerMonth: 135, oneTime: 400, variable: [{ words: "per order", amount: 1.4 }], notSummed: 0 });
        expect(table.summaryText).toBe("Fixed per month: £135 · Variable: £1.40 per order · One-time: £400");
    });

    test("with no channels there are no rows and no summary", () => {
        const empty = buildChannelResourceTable(engagement, { ...segment, channels: [] }, cards, "GBP");
        expect(empty.rows).toEqual([]);
        expect(empty.summaryText).toBe("");
    });

    test("Lumen & Loom's first Segment: every linked card once", () => {
        const example = JSON.parse(lumenText) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
        const responses = example.systems["3"].responses;
        const lumenEngagement = asBusinessEngagementValue(responses.find(response => response.sectionNumber === 2)!.value);
        const lumenCards = capabilityCards(asBusinessCapabilityValue(responses.find(response => response.sectionNumber === 3)!.value));
        const first = lumenEngagement.segments[0];
        const lumen = buildChannelResourceTable(lumenEngagement, first, lumenCards, "GBP");
        const ids = [...new Set(lumenEngagement.channelResources
            .filter(entry => entry.segmentId === first.segmentId && lumenCards.some(card => card.id === entry.resourceId))
            .map(entry => entry.resourceId))];
        expect(lumen.rows.map(entry => entry.resourceId).sort()).toEqual(ids.sort());
        expect(lumen.rows.length).toBeGreaterThan(0);
    });

});
