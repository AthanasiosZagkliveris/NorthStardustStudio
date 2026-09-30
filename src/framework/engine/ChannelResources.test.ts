import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import {
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    type BusinessCapabilityValue,
    type BusinessEngagementValue
} from "./AnswerUtils.ts";
import { businessForecast } from "./BusinessDocuments.ts";
import {
    capabilityCards,
    channelCostSummary,
    channelResourceLinks,
    resourceReach,
    sharedResourceLinks,
    withNewChannelResource,
    withRenamedCard,
    withResourceAction,
    withoutChannelResource
} from "./ChannelResources.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import lumenText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

/** A Segment with Instagram and Pinterest sharing one action. */
function engagementWithSharedAction(): BusinessEngagementValue {
    return asBusinessEngagementValue({
        segments: [{
            segmentId: "seg-1",
            actions: [{ id: "action-reels", text: "Post reels" }, { id: "action-pins", text: "Pin room sets" }],
            channels: [
                { id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actionIds: { discovery: ["action-reels"] } },
                { id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actionIds: { discovery: ["action-reels", "action-pins"] } }
            ]
        }]
    });
}

function priced(capability: BusinessCapabilityValue, id: string, price: string, frequency: string): BusinessCapabilityValue {
    return {
        ...capability,
        resources: Object.fromEntries(Object.entries(capability.resources).map(([group, subsections]) => [group, subsections.map(subsection => ({
            ...subsection,
            slots: subsection.slots.map(slot => slot.id === id ? { ...slot, cost: { ...slot.cost, price, frequency } } : slot)
        }))]))
    };
}

describe("a channel's resources", () => {

    test("\"+ Add resource\" makes a Resource at Costs on Infrastructure & Capability and links it", () => {
        const made = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Meta ads");
        const slot = made.capability.resources.digital.find(subsection => subsection.id === "presence")!.slots[0];
        expect(slot).toMatchObject({ id: made.link.resourceId, name: "Meta ads", status: "costs" });
        const linked = channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(made.capability));
        expect(linked.map(entry => entry.card.name)).toEqual(["Meta ads"]);
        // Stored and read back as it was.
        expect(asBusinessEngagementValue(JSON.parse(JSON.stringify(made.engagement))).channelResources).toEqual(made.engagement.channelResources);
    });

    test("one name: renamed on the card, it reads so on the channel", () => {
        const made = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Ads");
        const renamed = withRenamedCard(made.capability, made.link.resourceId, "Meta ads");
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(renamed))[0].card.name).toBe("Meta ads");
    });

    test("taking it off the channel deletes its card; deleting the card takes it off the channel; undo restores both", () => {
        const made = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Meta ads");
        const off = withoutChannelResource(made.engagement, made.capability, made.link.id);
        expect(off.engagement.channelResources).toHaveLength(0);
        expect(capabilityCards(off.capability).some(card => card.id === made.link.resourceId)).toBe(false);
        // Undo: both as they were.
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(made.capability))).toHaveLength(1);

        // The card deleted on Infrastructure & Capability: the channel shows it no more, until undone.
        const cardGone = { ...made.capability, resources: { ...made.capability.resources, digital: [] } };
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(cardGone))).toHaveLength(0);
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(made.capability))).toHaveLength(1);
    });

    test("serves another channel through a shared action: listed there, and in its summary marked shared", () => {
        let { engagement, capability, link } = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Meta ads");
        capability = priced(capability, link.resourceId, "150", "monthly");
        engagement = withResourceAction(engagement, link.id, "action-reels", true);
        const cards = capabilityCards(capability);

        expect(channelResourceLinks(engagement, "seg-1", "pin", cards)).toHaveLength(0);
        const shared = sharedResourceLinks(engagement, "seg-1", "pin", cards);
        expect(shared.map(entry => entry.card.name)).toEqual(["Meta ads"]);
        expect(resourceReach(engagement, engagement.channelResources[0])).toEqual(["pin"]);
        expect(channelCostSummary(shared.map(entry => entry.card), "GBP", true)).toBe("Costs: £150 a month (shared)");
        expect(channelCostSummary(channelResourceLinks(engagement, "seg-1", "insta", cards).map(entry => entry.card), "GBP")).toBe("Costs: £150 a month");

        // Unlinked from the action: Pinterest no longer lists it.
        engagement = withResourceAction(engagement, link.id, "action-reels", false);
        expect(sharedResourceLinks(engagement, "seg-1", "pin", cards)).toHaveLength(0);
    });

    test("cost links saved before become resources on their channel, on the same card; a category's on its first channel", () => {
        const engagement = asBusinessEngagementValue({
            segments: engagementWithSharedAction().segments,
            channelCosts: [
                { id: "c1", segmentId: "seg-1", channelKey: "pin", costId: "resource-ads" },
                { id: "c2", segmentId: "seg-1", channelKey: "category:Social Media", costId: "partner-photo" },
                // The same card on a second channel: it stays the first's.
                { id: "c3", segmentId: "seg-1", channelKey: "insta", costId: "resource-ads" }
            ]
        });
        expect(engagement.channelResources.map(link => [link.channelId, link.resourceId])).toEqual([
            ["pin", "resource-ads"],
            ["insta", "partner-photo"]
        ]);
    });

    test("the forecast counts each resource once, whatever channels it serves", () => {
        const example = JSON.parse(lumenText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const sessionsOf = (value: typeof example) => ({
            identity: InterviewSession.fromJSON(value.systems["1"], frameworkRegistry.getFramework("identity")),
            brand: InterviewSession.fromJSON(value.systems["2"], frameworkRegistry.getFramework("brand")),
            business: InterviewSession.fromJSON(value.systems["3"], frameworkRegistry.getFramework("business")),
            strategy: InterviewSession.fromJSON(value.systems["4"], frameworkRegistry.getFramework("strategy")),
            organisationName: "Lumen"
        });
        const linked = JSON.parse(lumenText) as typeof example;
        const responses = (linked.systems["3"] as unknown as { responses: { sectionNumber: number; value: unknown }[] }).responses;
        const capability = asBusinessCapabilityValue(responses.find(response => response.sectionNumber === 3)?.value);
        const engagementResponse = responses.find(response => response.sectionNumber === 2)!;
        let engagement = asBusinessEngagementValue(engagementResponse.value);
        const segment = engagement.segments[0];
        const allActions = segment.actions.map(action => action.id);
        // Every priced card made a resource of the first channel, serving every action.
        for (const card of capabilityCards(capability).filter(candidate => candidate.cost.price)) {
            if (engagement.channelResources.some(link => link.resourceId === card.id)) {
                continue;
            }
            const link = { id: "r-" + card.id, segmentId: segment.segmentId, channelId: segment.channels[0].id, resourceId: card.id, actionIds: allActions };
            engagement = { ...engagement, channelResources: [...engagement.channelResources, link] };
        }
        expect(engagement.channelResources.length).toBeGreaterThan(2);
        engagementResponse.value = engagement;
        const rows = (value: typeof example) => JSON.stringify(businessForecast(sessionsOf(value)).forecast);
        expect(rows(linked)).toBe(rows(example));
    });

});
