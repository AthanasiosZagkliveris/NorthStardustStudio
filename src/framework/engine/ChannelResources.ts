import { parseAmount, parseDecimal } from "./Amounts.ts";
import {
    type BusinessCapabilityValue,
    type BusinessChannelResourceValue,
    type BusinessCostValue,
    type BusinessEngagementValue,
    createBusinessResourceSlot
} from "./AnswerUtils.ts";
import { moneyFormatter } from "./FinancialModel.ts";
import { randomId } from "./Readers.ts";

/*
    A CUSTOMER CHANNEL'S RESOURCES.

    What a channel needs -- a paid plan, a card reader, a stall -- is a
    Resource card on 3. Infrastructure & Capability, where its Quantity,
    Price, Frequency and Description are entered like any resource's.
    The channel holds a link to it by id (BusinessChannelResourceValue),
    and the actions of the channel it serves. One name: the card's.

    "+ Add resource" on a channel makes the card -- a Resource at Costs
    under Digital Infrastructure › Online Presence & Communication, the
    group for the services a channel runs on -- and links it. Taking
    the resource off the channel deletes the card too; deleting the card
    takes it off the channel (its link then leads nowhere and is not
    shown), and undo brings it back.

    A resource is made on ONE channel. It serves other channels through
    the actions it is linked to: an action shared with another channel's
    rows brings the resource into that channel's cell too, marked "via
    shared action", and into its summary, marked "(shared)".

    Nothing is counted twice: the Financial Foundation and the Forecast
    count each resource once, from Infrastructure & Capability, and
    never read these links. A channel's summary line counts what its
    resources cost, the shared ones included.
*/

/** Where a channel's new resource is made: Digital Infrastructure › Online Presence & Communication. */
export const CHANNEL_RESOURCE_GROUP = "digital";
export const CHANNEL_RESOURCE_SUBSECTION = "presence";

/** One card on 3. Infrastructure & Capability, as a channel reads it. */
export interface CostCard {
    id: string;
    name: string;
    kind: "resource" | "workspace" | "professional" | "provider";
    /** Its section: Infrastructure, or Offering's Capability. */
    scope: "infrastructure" | "offering";
    cost: BusinessCostValue;
    /** A resource's Quantity ("" is one). */
    quantity: string;
    /** A resource's Status (the Workspace's; "" for a partner). */
    status: string;
    /** Where it is, in words: "Infrastructure → Digital Infrastructure". */
    place: string;
    /** The anchors that open it (jumpTo), the card first. */
    anchors: string[];
}

const PARTNER_KINDS = [
    ["professionals", "professional", "External Professionals & Partners"],
    ["providers", "provider", "Providers"]
] as const;

/** Every card that can hold a cost (whether it has one yet or not), in page order. */
export function capabilityCards(capability: BusinessCapabilityValue, groupLabels: Record<string, string> = {}): CostCard[] {

    const cards: CostCard[] = [{
        id: "workspace", name: "Workspace", kind: "workspace", scope: "infrastructure",
        cost: capability.workspace.cost, quantity: "", status: capability.workspace.status,
        place: "Infrastructure → Workspace",
        anchors: ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
    }];

    for (const [groupId, subsections] of Object.entries(capability.resources)) {
        for (const subsection of subsections) {
            for (const slot of subsection.slots) {
                cards.push({
                    id: slot.id, name: slot.name, kind: "resource", scope: "infrastructure",
                    cost: slot.cost, quantity: slot.quantity, status: slot.status,
                    place: "Infrastructure → " + (groupLabels[groupId] ?? groupId),
                    anchors: [slot.id, "subsection-" + groupId + "-" + subsection.id, "resource-group-" + groupId,
                        "contains-" + groupId, "section-infrastructure-resources", "capability-infrastructure"]
                });
            }
        }
    }

    for (const [list, kind, label] of PARTNER_KINDS) {
        for (const partner of capability[list]) {
            cards.push({
                id: partner.id, name: partner.name, kind, scope: "infrastructure",
                cost: partner.cost, quantity: "", status: "", place: "Infrastructure → " + label,
                anchors: [partner.id, "partners-infrastructure-" + list, "section-infrastructure-partners", "capability-infrastructure"]
            });
        }
    }

    for (const slot of capability.offering.resources) {
        cards.push({
            id: slot.id, name: slot.name, kind: "resource", scope: "offering",
            cost: slot.cost, quantity: slot.quantity, status: slot.status, place: "Offering's Capability → Resources",
            anchors: [slot.id, "section-offering-resources", "capability-offering-capability"]
        });
    }

    for (const [list, kind, label] of PARTNER_KINDS) {
        for (const partner of capability.offering[list]) {
            cards.push({
                id: partner.id, name: partner.name, kind, scope: "offering",
                cost: partner.cost, quantity: "", status: "", place: "Offering's Capability → " + label,
                anchors: [partner.id, "partners-offering-" + list, "section-offering-partners", "capability-offering-capability"]
            });
        }
    }

    return cards;

}

/** A card's name, or what it is while it has none. */
export function costCardName(card: CostCard): string {
    return card.name.trim() || (card.kind === "resource" ? "Unnamed resource" : "Unnamed cost");
}

/**
 * What a card costs each time: a resource's price times its Quantity;
 * null where it has no price, or is a resource or Workspace whose
 * Status is not Costs (it costs nothing here then).
 */
export function costCardAmount(card: CostCard): number | null {
    if ((card.kind === "resource" || card.kind === "workspace") && card.status !== "costs") {
        return null;
    }
    const price = parseAmount(card.cost.price);
    if (price === null) {
        return null;
    }
    const count = parseDecimal(card.quantity);
    return count !== null && count > 0 ? Math.round(price * count * 100) / 100 : price;
}

/** How often, as a line says it: "a month", "a year", "one-time". */
export function costPeriodWords(cost: BusinessCostValue): string {
    switch (cost.frequency) {
        case "monthly": return "a month";
        case "annually": return "a year";
        case "one-time": return "one-time";
        case "per-unit": return "per unit";
        case "per-order": return "per order";
        case "per-project": return "per project";
        case "other": return cost.frequencyOther.trim();
        default: return "";
    }
}

/** "£150 a month": what the card costs and how often, in its currency; "" with no price. */
export function costCardAmountText(card: CostCard, currency: string): string {
    const amount = costCardAmount(card);
    if (amount === null) {
        return "";
    }
    return [moneyFormatter(card.cost.currency || currency)(amount), costPeriodWords(card.cost)].filter(Boolean).join(" ");
}

/**
 * "Costs: £180 a month · £400 one-time": what a channel's resources
 * cost, by how often -- a yearly one as a twelfth a month. Null with
 * none priced.
 */
export function channelCostSummary(cards: readonly CostCard[], currency: string, shared = false): string | null {

    const format = moneyFormatter(currency);
    const totals = new Map<string, number>();
    const add = (words: string, amount: number) => totals.set(words, (totals.get(words) ?? 0) + amount);

    for (const card of cards) {
        const amount = costCardAmount(card);
        if (amount === null || (card.cost.currency && card.cost.currency !== currency)) {
            continue;
        }
        if (card.cost.frequency === "annually") {
            add("a month", amount / 12);
        } else {
            add(costPeriodWords(card.cost) || "each time", amount);
        }
    }

    const order = ["a month", "one-time"];
    const parts = [...totals.entries()]
        .sort(([one], [other]) => (order.indexOf(one) + 99) % 99 - (order.indexOf(other) + 99) % 99)
        .map(([words, amount]) => format(Math.round(amount * 100) / 100) + " " + words);

    return parts.length > 0 ? "Costs: " + parts.join(" · ") + (shared ? " (shared)" : "") : null;

}

/** A channel's resources whose card is there (a deleted card's are not shown). */
export function channelResourceLinks(
    engagement: BusinessEngagementValue,
    segmentId: string,
    channelId: string,
    cards: readonly CostCard[]
): { link: BusinessChannelResourceValue; card: CostCard }[] {
    return engagement.channelResources
        .filter(link => link.segmentId === segmentId && link.channelId === channelId)
        .flatMap(link => {
            const card = cards.find(candidate => candidate.id === link.resourceId);
            return card ? [{ link, card }] : [];
        });
}

/** The ids of the actions in a channel's rows (every stage). */
export function channelActionIds(engagement: BusinessEngagementValue, segmentId: string, channelId: string): string[] {
    const channel = engagement.segments.find(entry => entry.segmentId === segmentId)?.channels.find(entry => entry.id === channelId);
    return [...new Set(Object.values(channel?.actionIds ?? {}).flat())];
}

/**
 * The resources made on OTHER channels of the Segment that serve this
 * one: an action they are linked to stands in this channel's rows too.
 */
export function sharedResourceLinks(
    engagement: BusinessEngagementValue,
    segmentId: string,
    channelId: string,
    cards: readonly CostCard[]
): { link: BusinessChannelResourceValue; card: CostCard }[] {
    const here = new Set(channelActionIds(engagement, segmentId, channelId));
    return engagement.channelResources
        .filter(link => link.segmentId === segmentId && link.channelId !== channelId && link.actionIds.some(id => here.has(id)))
        .flatMap(link => {
            const card = cards.find(candidate => candidate.id === link.resourceId);
            return card ? [{ link, card }] : [];
        });
}

/** The other channels a resource serves through its actions (their ids, in table order). */
export function resourceReach(engagement: BusinessEngagementValue, link: BusinessChannelResourceValue): string[] {
    const segment = engagement.segments.find(entry => entry.segmentId === link.segmentId);
    return (segment?.channels ?? [])
        .filter(channel => channel.id !== link.channelId)
        .filter(channel => Object.values(channel.actionIds).flat().some(id => link.actionIds.includes(id)))
        .map(channel => channel.id);
}

/** The channels a card is a resource of. */
export function resourceChannels(engagement: BusinessEngagementValue, resourceId: string): BusinessChannelResourceValue[] {
    return engagement.channelResources.filter(link => link.resourceId === resourceId);
}

/**
 * "+ Add resource": a Resource at Costs made on 3. Infrastructure &
 * Capability (Digital Infrastructure › Online Presence &
 * Communication), and linked to the channel.
 */
export function withNewChannelResource(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    name = ""
): { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue; link: BusinessChannelResourceValue } {
    const slot = { ...createBusinessResourceSlot(), name, status: "costs" };
    const group = capability.resources[CHANNEL_RESOURCE_GROUP] ?? [];
    const subsection = group.find(entry => entry.id === CHANNEL_RESOURCE_SUBSECTION);
    const nextGroup = subsection
        ? group.map(entry => entry.id === CHANNEL_RESOURCE_SUBSECTION ? { ...entry, slots: [...entry.slots, slot] } : entry)
        : [...group, { id: CHANNEL_RESOURCE_SUBSECTION, name: "", slots: [slot] }];
    const link = { id: randomId("channel-resource"), segmentId, channelId, resourceId: slot.id, actionIds: [] };
    return {
        engagement: { ...engagement, channelResources: [...engagement.channelResources, link] },
        capability: { ...capability, resources: { ...capability.resources, [CHANNEL_RESOURCE_GROUP]: nextGroup } },
        link
    };
}

/** The card renamed, wherever it is (one name, read on both pages). */
export function withRenamedCard(capability: BusinessCapabilityValue, cardId: string, name: string): BusinessCapabilityValue {
    const slots = <T extends { id: string; name: string }>(list: T[]) =>
        list.map(entry => entry.id === cardId ? { ...entry, name } : entry);
    return {
        ...capability,
        resources: Object.fromEntries(Object.entries(capability.resources)
            .map(([group, subsections]) => [group, subsections.map(subsection => ({ ...subsection, slots: slots(subsection.slots) }))])),
        professionals: slots(capability.professionals),
        providers: slots(capability.providers),
        offering: {
            ...capability.offering,
            resources: slots(capability.offering.resources),
            professionals: slots(capability.offering.professionals),
            providers: slots(capability.offering.providers)
        }
    };
}

/**
 * A resource taken off its channel: the link goes, and the Resource
 * card with it -- unless another channel holds it too, or it is not a
 * resource made for channels (a partner, the Workspace, linked before),
 * which stays where it is.
 */
export function withoutChannelResource(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    linkId: string
): { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue } {
    const link = engagement.channelResources.find(entry => entry.id === linkId);
    const rest = engagement.channelResources.filter(entry => entry.id !== linkId);
    const next = { ...engagement, channelResources: rest };
    if (!link || rest.some(entry => entry.resourceId === link.resourceId)) {
        return { engagement: next, capability };
    }
    const without = <T extends { id: string }>(list: T[]) => list.filter(entry => entry.id !== link.resourceId);
    return {
        engagement: next,
        capability: {
            ...capability,
            resources: Object.fromEntries(Object.entries(capability.resources)
                .map(([group, subsections]) => [group, subsections.map(subsection => ({ ...subsection, slots: without(subsection.slots) }))])),
            offering: { ...capability.offering, resources: without(capability.offering.resources) }
        }
    };
}

/** A resource linked to one more of its channel's actions (once), or unlinked from one. */
export function withResourceAction(engagement: BusinessEngagementValue, linkId: string, actionId: string, linked: boolean): BusinessEngagementValue {
    return {
        ...engagement,
        channelResources: engagement.channelResources.map(link => link.id !== linkId
            ? link
            : {
                ...link,
                actionIds: linked
                    ? (link.actionIds.includes(actionId) ? link.actionIds : [...link.actionIds, actionId])
                    : link.actionIds.filter(id => id !== actionId)
            })
    };
}
