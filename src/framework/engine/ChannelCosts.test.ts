import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { asBusinessCapabilityValue, asBusinessEngagementValue, createBusinessResourceSlot, type BusinessCapabilityValue } from "./AnswerUtils.ts";
import { businessForecast } from "./BusinessDocuments.ts";
import {
    categoryChannelKey,
    channelCostLinks,
    channelCostSummary,
    costCardAmountText,
    costCards,
    findCostCards,
    withChannelCost,
    withNewCostCard,
    withoutChannelCost
} from "./ChannelCosts.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import lumenText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", currency: "" });

function capability(): BusinessCapabilityValue {
    const base = asBusinessCapabilityValue(undefined);
    return {
        ...base,
        workspace: { ...base.workspace, status: "costs", cost: cost("400", "monthly") },
        offering: {
            ...base.offering,
            resources: [
                { ...createBusinessResourceSlot(), id: "resource-ads1", name: "Instagram ads", status: "costs", cost: cost("150", "monthly") },
                { ...createBusinessResourceSlot(), id: "resource-cam1", name: "Camera", status: "costs", cost: cost("600", "one-time"), quantity: "2" },
                { ...createBusinessResourceSlot(), id: "resource-idle", name: "Borrowed table", status: "provided", cost: cost("", "") }
            ],
            professionals: [
                { id: "partner-ph1", name: "Photographer", description: "", responsibleId: "", cost: cost("1200", "annually"), offeringIds: [] },
                { id: "partner-none", name: "Mentor", description: "", responsibleId: "", cost: cost("", ""), offeringIds: [] }
            ]
        }
    };
}

describe("a channel's costs", () => {

    test("every card with a cost is offered, and only those", () => {
        const cards = costCards(capability());
        expect(cards.map(card => card.id)).toEqual(["workspace", "resource-ads1", "resource-cam1", "partner-ph1"]);
        expect(costCardAmountText(cards[2], "GBP")).toBe("£1,200 one-time");
        expect(costCardAmountText(cards[1], "GBP")).toBe("£150 a month");
        expect(findCostCards(cards, "cam").map(card => card.id)).toEqual(["resource-cam1"]);
        // A card opens by its own anchor first, then what holds it.
        expect(cards[1].anchors[0]).toBe("resource-ads1");
    });

    test("links and unlinks, once per card and channel, kept by ids with the answer", () => {
        let engagement = asBusinessEngagementValue(undefined);
        engagement = withChannelCost(engagement, "seg-1", "channel-a", "resource-ads1");
        engagement = withChannelCost(engagement, "seg-1", "channel-a", "resource-ads1");
        expect(engagement.channelCosts).toHaveLength(1);
        // Stored and read back as it was.
        const saved = asBusinessEngagementValue(JSON.parse(JSON.stringify(engagement)));
        expect(saved.channelCosts).toEqual(engagement.channelCosts);
        const removed = withoutChannelCost(saved, saved.channelCosts[0].id);
        expect(removed.channelCosts).toHaveLength(0);
    });

    test("sums a channel's costs by how often they fall due, marking one shared", () => {
        const cards = costCards(capability());
        let engagement = asBusinessEngagementValue(undefined);
        for (const id of ["resource-ads1", "resource-cam1", "partner-ph1"]) {
            engagement = withChannelCost(engagement, "seg-1", "channel-a", id);
        }
        engagement = withChannelCost(engagement, "seg-1", categoryChannelKey("Social Media"), "resource-ads1");
        const linked = channelCostLinks(engagement, "seg-1", "channel-a", cards);
        expect(linked.map(entry => entry.shared)).toEqual([true, false, false]);
        // £150 a month, plus £1,200 a year as £100 a month; two cameras once.
        expect(channelCostSummary(linked, "GBP")).toBe("Costs: £250 a month · £1,200 one-time (shared)");
        expect(channelCostSummary([], "GBP")).toBeNull();
    });

    test("a deleted cost card's links go with it, and come back with it", () => {
        const full = capability();
        let engagement = withChannelCost(asBusinessEngagementValue(undefined), "seg-1", "channel-a", "partner-ph1");
        const without = { ...full, offering: { ...full.offering, professionals: [] } };
        expect(channelCostLinks(engagement, "seg-1", "channel-a", costCards(without))).toHaveLength(0);
        // Undoing the card's removal: the link is there again.
        expect(channelCostLinks(engagement, "seg-1", "channel-a", costCards(full))).toHaveLength(1);
        engagement = withChannelCost(engagement, "seg-1", "channel-b", "partner-ph1");
        // With the card gone it is shared by nobody.
        expect(channelCostLinks(engagement, "seg-1", "channel-b", costCards(without))).toHaveLength(0);
    });

    test("\"Create a cost\" makes a Resource at Costs of that name, to be linked", () => {
        const { capability: next, id } = withNewCostCard(asBusinessCapabilityValue(undefined), " Flyers ");
        const card = costCards(next).find(candidate => candidate.id === id);
        expect(card?.name).toBe("Flyers");
        expect(next.offering.resources[next.offering.resources.length - 1]).toMatchObject({ id, status: "costs", name: "Flyers" });
    });

    test("the forecast counts each cost once, however many channels link it", () => {
        const example = JSON.parse(lumenText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const load = (value: typeof example, number: number, id: string) =>
            InterviewSession.fromJSON(value.systems[String(number)], frameworkRegistry.getFramework(id));
        const sessionsOf = (value: typeof example) => ({
            identity: load(value, 1, "identity"), brand: load(value, 2, "brand"), business: load(value, 3, "business"),
            strategy: load(value, 4, "strategy"), organisationName: "Lumen"
        });
        const linked = JSON.parse(lumenText) as typeof example;
        const business = linked.systems["3"] as unknown as { responses: { sectionNumber: number; value: Record<string, unknown> }[] };
        const capabilityValue = asBusinessCapabilityValue(business.responses.find(response => response.sectionNumber === 3)?.value);
        const engagementResponse = business.responses.find(response => response.sectionNumber === 2)!;
        let engagement = asBusinessEngagementValue(engagementResponse.value);
        const segmentId = engagement.segments[0].segmentId;
        for (const card of costCards(capabilityValue)) {
            engagement = withChannelCost(engagement, segmentId, "channel-a", card.id);
            engagement = withChannelCost(engagement, segmentId, "channel-b", card.id);
        }
        expect(engagement.channelCosts.length).toBeGreaterThan(2);
        engagementResponse.value = engagement as unknown as Record<string, unknown>;
        const rows = (value: typeof example) => JSON.stringify(businessForecast(sessionsOf(value)).forecast);
        expect(rows(linked)).toBe(rows(example));
    });

});

describe("a channel's costs in the export", () => {

    test("are listed under the Customer Channel, each with what it costs and the channel's total", async () => {
        const { buildExportContent } = await import("./ExportContentBuilder.ts");
        const { MarkdownExporter } = await import("./MarkdownExporter.ts");
        const example = JSON.parse(lumenText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const business = example.systems["3"] as unknown as { responses: { sectionNumber: number; value: Record<string, unknown> }[] };
        const capabilityValue = asBusinessCapabilityValue(business.responses.find(response => response.sectionNumber === 3)?.value);
        const engagementResponse = business.responses.find(response => response.sectionNumber === 2)!;
        let engagement = asBusinessEngagementValue(engagementResponse.value);
        const segment = engagement.segments[0];
        const channel = segment.channels.find(candidate => candidate.name.trim())!;
        const card = costCards(capabilityValue).find(candidate => candidate.cost.frequency === "monthly")!;
        engagement = withChannelCost(engagement, segment.segmentId, channel.id, card.id);
        engagementResponse.value = engagement as unknown as Record<string, unknown>;
        const session = InterviewSession.fromJSON(example.systems["3"], frameworkRegistry.getFramework("business"));
        const markdown = new MarkdownExporter().toMarkdown(session, "Foundation", buildExportContent(session, "Foundation", undefined, undefined, { currency: "GBP" }));
        expect(markdown).toContain("## Channel Costs");
        expect(markdown).toContain("| " + channel.name.trim() + " | " + card.name.trim() + " | " + costCardAmountText(card, "GBP") + " | " + costCardAmountText(card, "GBP") + " |");
    });

});
