import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import {
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    createBusinessChannel,
    createBusinessSegmentEngagement,
    type BusinessCapabilityValue,
    type BusinessEngagementValue
} from "./AnswerUtils.ts";
import { businessForecast, readFoundation } from "./BusinessDocuments.ts";
import {
    actionResourceLinks,
    actionsServing,
    capabilityCards,
    channelActionIds,
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
import quillText from "../../../docs/examples/quillfield-automation-llc.json?raw";

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

/** The same Segment, its channels carrying Offerings: one named, one "all". */
function engagementWithOfferings(): BusinessEngagementValue {
    return asBusinessEngagementValue({
        segments: [{
            segmentId: "seg-1",
            actions: [],
            channels: [
                { id: "named", category: "Social Media", name: "Instagram", stages: ["discovery"], offerings: ["off-a"] },
                { id: "all", category: "Social Media", name: "Pinterest", stages: ["discovery"], offerings: ["*"] },
                { id: "none", category: "Social Media", name: "TikTok", stages: ["discovery"], offerings: [] }
            ]
        }]
    });
}

function priced(capability: BusinessCapabilityValue, id: string, price: string, frequency: string, status = "costs"): BusinessCapabilityValue {
    return {
        ...capability,
        offering: {
            ...capability.offering,
            resources: capability.offering.resources.map(slot => slot.id === id ? { ...slot, status, cost: { ...slot.cost, price, frequency } } : slot)
        },
        resources: Object.fromEntries(Object.entries(capability.resources).map(([group, subsections]) => [group, subsections.map(subsection => ({
            ...subsection,
            slots: subsection.slots.map(slot => slot.id === id ? { ...slot, status, cost: { ...slot.cost, price, frequency } } : slot)
        }))]))
    };
}

describe("a channel's resources", () => {

    test("\"+ Add resource\" makes a blank Resource in Offering's Capability and links it, not in Infrastructure", () => {
        const made = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Meta ads");
        const slot = made.capability.offering.resources[0];
        expect(slot).toMatchObject({ id: made.link.resourceId, name: "Meta ads", status: "", offeringIds: [] });
        expect(Object.values(made.capability.resources).flat().flatMap(subsection => subsection.slots)).toHaveLength(0);
        expect(capabilityCards(made.capability).find(card => card.id === slot.id)).toMatchObject({ scope: "offering", place: "Offering's Capability → Resources" });
        const linked = channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(made.capability));
        expect(linked.map(entry => entry.card.name)).toEqual(["Meta ads"]);
        // Stored and read back as it was.
        expect(asBusinessEngagementValue(JSON.parse(JSON.stringify(made.engagement))).channelResources).toEqual(made.engagement.channelResources);
    });

    test("the new resource is blank: no Status, no Offerings, whatever the channel carries", () => {
        for (const channelId of ["named", "all", "none"]) {
            const made = withNewChannelResource(engagementWithOfferings(), asBusinessCapabilityValue(undefined), "seg-1", channelId, "Plan");
            expect(made.capability.offering.resources[0]).toMatchObject({ name: "Plan", status: "", offeringIds: [] });
            expect(made.engagement.channelResources).toHaveLength(1);
        }
    });

    test("a blank resource is not counted by Financial until the user gives it a Status and Offerings", () => {
        const example = JSON.parse(lumenText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const responses = (example.systems["3"] as unknown as { responses: { sectionNumber: number; value: unknown }[] }).responses;
        const engagementResponse = responses.find(response => response.sectionNumber === 2)!;
        const capabilityResponse = responses.find(response => response.sectionNumber === 3)!;
        const engagement = asBusinessEngagementValue(engagementResponse.value);
        const segment = engagement.segments[0];
        const made = withNewChannelResource(engagement, asBusinessCapabilityValue(capabilityResponse.value), segment.segmentId, segment.channels[0].id, "Card reader subscription");
        engagementResponse.value = made.engagement;
        capabilityResponse.value = priced(made.capability, made.link.resourceId, "20", "monthly", "");
        const sessions = () => ({
            identity: InterviewSession.fromJSON(example.systems["1"], frameworkRegistry.getFramework("identity")),
            brand: InterviewSession.fromJSON(example.systems["2"], frameworkRegistry.getFramework("brand")),
            business: InterviewSession.fromJSON(example.systems["3"], frameworkRegistry.getFramework("business")),
            strategy: InterviewSession.fromJSON(example.systems["4"], frameworkRegistry.getFramework("strategy")),
            organisationName: "Lumen"
        });
        expect(readFoundation(sessions(), { wholeOnly: true }).lines.filter(line => line.name === "Card reader subscription")).toHaveLength(0);
        // Chosen on page 3: Costs, linked to an Offering.
        const foundation = responses.find(response => response.sectionNumber === 1)!.value as { segments: { id: string; offerings: { id: string }[] }[] };
        const offeringId = foundation.segments.find(entry => entry.id === segment.segmentId)!.offerings[0].id;
        const chosen = asBusinessCapabilityValue(capabilityResponse.value);
        capabilityResponse.value = { ...chosen, offering: { ...chosen.offering, resources: chosen.offering.resources.map(slot => slot.id === made.link.resourceId ? { ...slot, status: "costs", startDate: "2026-10-01", offeringIds: [offeringId] } : slot) } };
        const lines = readFoundation(sessions(), { wholeOnly: true }).lines.filter(line => line.name === "Card reader subscription");
        expect(lines).toHaveLength(1);
        expect(lines[0].amount).toBe(20);
    });

    test("linking or unlinking actions leaves the card as it was", () => {
        const made = withNewChannelResource(engagementWithOfferings(), asBusinessCapabilityValue(undefined), "seg-1", "named", "Plan");
        const linkedEngagement = withResourceAction(made.engagement, made.link.id, "any-action", true);
        expect(linkedEngagement.channelResources[0].actionIds).toEqual(["any-action"]);
        expect(withResourceAction(linkedEngagement, made.link.id, "any-action", false).channelResources[0].actionIds).toEqual([]);
        expect(made.capability.offering.resources[0]).toMatchObject({ status: "", offeringIds: [] });
    });

    test("a channel is never without Offerings: new ones carry all, saved ones with none read as all", () => {
        expect(createBusinessChannel().offerings).toEqual(["*"]);
        expect(createBusinessSegmentEngagement("seg-1").channels[0].offerings).toEqual(["*"]);
        const read = engagementWithOfferings().segments[0].channels;
        expect(read.find(channel => channel.id === "none")!.offerings).toEqual(["*"]);
        expect(read.find(channel => channel.id === "named")!.offerings).toEqual(["off-a"]);
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

        // The card deleted in Offering's Capability: the channel shows it no more, until undone.
        const cardGone = { ...made.capability, offering: { ...made.capability.offering, resources: [] } };
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(cardGone))).toHaveLength(0);
        expect(channelResourceLinks(made.engagement, "seg-1", "insta", capabilityCards(made.capability))).toHaveLength(1);
    });

    test("a resource made earlier in Infrastructure still shows on its channel, renames, and goes with it", () => {
        const base = asBusinessCapabilityValue({ resources: { digital: [{ id: "presence", name: "", slots: [{ id: "resource-old", name: "Squarespace", status: "costs" }] }] } });
        const link = { id: "link-old", segmentId: "seg-1", channelId: "insta", resourceId: "resource-old", actionIds: [] };
        const engagement = { ...engagementWithSharedAction(), channelResources: [link] };
        const cards = capabilityCards(base);
        expect(channelResourceLinks(engagement, "seg-1", "insta", cards)[0].card).toMatchObject({ name: "Squarespace", scope: "infrastructure" });
        const renamed = withRenamedCard(base, "resource-old", "Squarespace Business");
        expect(capabilityCards(renamed).find(card => card.id === "resource-old")?.name).toBe("Squarespace Business");
        const off = withoutChannelResource(engagement, base, "link-old");
        expect(off.engagement.channelResources).toHaveLength(0);
        expect(capabilityCards(off.capability).some(card => card.id === "resource-old")).toBe(false);
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

    test("is linked to an action of ANOTHER channel of the Segment's table: it shows in that channel, reaches it, and the action lists it", () => {
        let { engagement, capability, link } = withNewChannelResource(engagementWithSharedAction(), asBusinessCapabilityValue(undefined), "seg-1", "insta", "Meta ads");
        capability = priced(capability, link.resourceId, "150", "monthly");
        // "Pin room sets" stands in Pinterest's rows only; the card was made on Instagram.
        expect(channelActionIds(engagement, "seg-1", "insta")).not.toContain("action-pins");
        engagement = withResourceAction(engagement, link.id, "action-pins", true);
        const cards = capabilityCards(capability);
        const made = engagement.channelResources[0];
        expect(made.actionIds).toEqual(["action-pins"]);
        // Home: still listed on Instagram, and not on Pinterest as its own.
        expect(channelResourceLinks(engagement, "seg-1", "insta", cards)).toHaveLength(1);
        expect(channelResourceLinks(engagement, "seg-1", "pin", cards)).toHaveLength(0);
        // Pinterest holds the action: the card shows there, "via" it, and reaches it.
        expect(sharedResourceLinks(engagement, "seg-1", "pin", cards).map(entry => entry.card.name)).toEqual(["Meta ads"]);
        expect(actionsServing(engagement, "seg-1", "pin", made)).toEqual(["action-pins"]);
        expect(actionsServing(engagement, "seg-1", "insta", made)).toEqual([]);
        expect(resourceReach(engagement, made)).toEqual(["pin"]);
        // The action knows its resource, from whichever channel it was made.
        expect(actionResourceLinks(engagement, "seg-1", "action-pins", cards).map(entry => entry.card.name)).toEqual(["Meta ads"]);
        // Instagram's cell is not served by it (nothing of its own rows is linked).
        expect(sharedResourceLinks(engagement, "seg-1", "insta", cards)).toHaveLength(0);
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

describe("the examples' channel resources", () => {

    test.each([["lumen", lumenText], ["quillfield", quillText]])("%s: 6 to 14 resources on its own cards, one serving a second channel, none a work tool, listed in the export", async (_name, text) => {
        const { buildExportContent } = await import("./ExportContentBuilder.ts");
        const { MarkdownExporter } = await import("./MarkdownExporter.ts");
        const example = JSON.parse(text) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
        const responses = (example.systems["3"] as unknown as { responses: { sectionNumber: number; value: unknown }[] }).responses;
        const engagement = asBusinessEngagementValue(responses.find(response => response.sectionNumber === 2)?.value);
        const cards = capabilityCards(asBusinessCapabilityValue(responses.find(response => response.sectionNumber === 3)?.value));
        // About one to three costs for each channel that really pays for something (a stall, a card
        // reader and its fees, a courier, a plan, a booking tool): twelve in Lumen & Loom and eight in
        // Quillfield, never a card for every row. (Widened from 3-12 when the work tools -- Adobe,
        // Xero, QuickBooks, Google Workspace, Miro and Loom -- left the channels, and the real
        // per-channel costs, fees and fairs were added.)
        expect(engagement.channelResources.length).toBeGreaterThanOrEqual(6);
        expect(engagement.channelResources.length).toBeLessThanOrEqual(14);
        // Every one on a card the example has, with the actions it pays for, all in the Segment's table
        // (a resource may be linked to any channel's action, not only its own channel's rows).
        engagement.channelResources.forEach(link => {
            expect(cards.some(card => card.id === link.resourceId)).toBe(true);
            expect(link.actionIds.length).toBeGreaterThan(0);
            const segment = engagement.segments.find(entry => entry.segmentId === link.segmentId)!;
            const inTheTable = segment.channels.flatMap(channel => Object.values(channel.actionIds).flat());
            expect(inTheTable).toEqual(expect.arrayContaining(link.actionIds));
        });
        // A channel is never without an Offering.
        engagement.segments.forEach(segment => segment.channels.forEach(channel => expect(channel.offerings.length).toBeGreaterThan(0)));
        // A channel resource is a cost that exists because of the channel: it would go if the channel did.
        // The tools the work needs anyway are Infrastructure software, with no channel link at all.
        const WORK_TOOLS = /adobe|xero|quickbooks online|google workspace|miro|phone, tripod/i;
        engagement.channelResources.forEach(link => {
            const card = cards.find(candidate => candidate.id === link.resourceId)!;
            expect(card.name, "a work tool is not a channel resource").not.toMatch(WORK_TOOLS);
        });
        cards.filter(card => WORK_TOOLS.test(card.name)).forEach(card => {
            expect(card.scope, card.name).toBe("infrastructure");
            expect(engagement.channelResources.some(link => link.resourceId === card.id), card.name).toBe(false);
        });
        // A resource is an Offering's Capability card (a partner stays where it is), linked to some of the Segment's Offerings.
        // None is on Infrastructure now: what is there is a tool the whole organisation uses whichever channels it has.
        const foundation = responses.find(response => response.sectionNumber === 1)!.value as { segments: { id: string; offerings: { id: string }[] }[] };
        const capability = asBusinessCapabilityValue(responses.find(response => response.sectionNumber === 3)?.value);
        engagement.channelResources.forEach(link => {
            const card = cards.find(candidate => candidate.id === link.resourceId)!;
            if (card.kind !== "resource") {
                return;
            }
            expect(card.scope).toBe("offering");
            const segmentOfferings = foundation.segments.find(entry => entry.id === link.segmentId)!.offerings.map(offering => offering.id);
            const slot = capability.offering.resources.find(entry => entry.id === card.id)!;
            expect(slot.offeringIds.length).toBeGreaterThan(0);
            slot.offeringIds.forEach(id => expect(segmentOfferings).toContain(id));
        });
        expect(engagement.channelResources.some(link => resourceReach(engagement, link).length > 0)).toBe(true);
        // Each action shared between rows at least twice over.
        const sharedActions = engagement.segments.flatMap(segment => segment.actions.filter(action =>
            segment.channels.flatMap(channel => Object.values(channel.actionIds).flat()).filter(id => id === action.id).length > 1));
        expect(sharedActions.length).toBeGreaterThanOrEqual(2);

        const session = InterviewSession.fromJSON(example.systems["3"], frameworkRegistry.getFramework("business"));
        const markdown = new MarkdownExporter().toMarkdown(session, "Foundation", buildExportContent(session, "Foundation", undefined, undefined, { currency: "GBP" }));
        expect(markdown).toContain("## Channel Resources");
        expect(markdown).toContain("| Channel | Resource | Cost | Linked actions |");
    });

});
