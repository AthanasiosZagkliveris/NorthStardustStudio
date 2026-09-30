import { parseAmount, parseDecimal } from "./Amounts.ts";
import {
    type BusinessCapabilityValue,
    type BusinessChannelCostLinkValue,
    type BusinessCostValue,
    type BusinessEngagementValue,
    createBusinessResourceSlot
} from "./AnswerUtils.ts";
import { moneyFormatter } from "./FinancialModel.ts";
import { randomId } from "./Readers.ts";

/*
    A CUSTOMER CHANNEL'S COSTS, LINKED -- as a note links a place.

    A channel (or its category's row) on 2. Customer Engagement is
    linked to the cost cards that pay for it on 3. Infrastructure &
    Capability: a Resource at Costs, the Workspace when it costs, an
    External Professional, Partner or Provider. The link holds only
    ids (BusinessChannelCostLinkValue); the name, the amount and where
    the card is are read from the card every time, so a renamed or
    repriced cost is shown as it is now.

    Nothing is counted twice: the Financial Foundation and the
    Forecast count each cost once, from Infrastructure & Capability,
    and never read these links. A channel's own summary counts every
    cost linked to it in full -- a cost shared by several channels is
    marked so.
*/

/** A channel's key for its category's row: "category:" and the label. */
export function categoryChannelKey(label: string): string {
    return "category:" + label;
}

/** One card on 3. Infrastructure & Capability that has a cost. */
export interface CostCard {
    id: string;
    name: string;
    kind: "resource" | "workspace" | "professional" | "provider";
    /** Its section: Infrastructure, or Offering's Capability. */
    scope: "infrastructure" | "offering";
    cost: BusinessCostValue;
    /** A resource's Quantity ("" is one). */
    quantity: string;
    /** Where it is, in words: "Infrastructure → Utilities". */
    place: string;
    /** The anchors that open it (jumpTo), the card first. */
    anchors: string[];
}

const PARTNER_KINDS = [
    ["professionals", "professional", "External Professionals & Partners"],
    ["providers", "provider", "Providers"]
] as const;

/** Every card with a cost, in page order. */
export function costCards(capability: BusinessCapabilityValue, groupLabels: Record<string, string> = {}): CostCard[] {

    const cards: CostCard[] = [];

    if (capability.workspace.status === "costs") {
        cards.push({
            id: "workspace", name: "Workspace", kind: "workspace", scope: "infrastructure",
            cost: capability.workspace.cost, quantity: "", place: "Infrastructure → Workspace",
            anchors: ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
        });
    }

    for (const [groupId, subsections] of Object.entries(capability.resources)) {
        for (const subsection of subsections) {
            for (const slot of subsection.slots) {
                if (slot.status !== "costs") {
                    continue;
                }
                cards.push({
                    id: slot.id, name: slot.name, kind: "resource", scope: "infrastructure",
                    cost: slot.cost, quantity: slot.quantity,
                    place: "Infrastructure → " + (groupLabels[groupId] ?? groupId),
                    anchors: [slot.id, "subsection-" + groupId + "-" + subsection.id, "resource-group-" + groupId,
                        "contains-" + groupId, "section-infrastructure-resources", "capability-infrastructure"]
                });
            }
        }
    }

    for (const [list, kind, label] of PARTNER_KINDS) {
        for (const partner of capability[list]) {
            if (parseAmount(partner.cost.price) === null) {
                continue;
            }
            cards.push({
                id: partner.id, name: partner.name, kind, scope: "infrastructure",
                cost: partner.cost, quantity: "", place: "Infrastructure → " + label,
                anchors: [partner.id, "partners-infrastructure-" + list, "section-infrastructure-partners", "capability-infrastructure"]
            });
        }
    }

    for (const slot of capability.offering.resources) {
        if (slot.status !== "costs") {
            continue;
        }
        cards.push({
            id: slot.id, name: slot.name, kind: "resource", scope: "offering",
            cost: slot.cost, quantity: slot.quantity, place: "Offering's Capability → Resources",
            anchors: [slot.id, "section-offering-resources", "capability-offering-capability"]
        });
    }

    for (const [list, kind, label] of PARTNER_KINDS) {
        for (const partner of capability.offering[list]) {
            if (parseAmount(partner.cost.price) === null) {
                continue;
            }
            cards.push({
                id: partner.id, name: partner.name, kind, scope: "offering",
                cost: partner.cost, quantity: "", place: "Offering's Capability → " + label,
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

/** The whole amount a card costs each time: a resource's price times its Quantity. */
export function costCardAmount(card: CostCard): number | null {
    const price = parseAmount(card.cost.price);
    if (price === null) {
        return null;
    }
    const count = parseDecimal(card.quantity);
    return count !== null && count > 0 ? Math.round(price * count * 100) / 100 : price;
}

/** How often, as the chip says it: "a month", "a year", "one-time". */
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

/** "£150 a month": the card's amount and how often, in its currency. */
export function costCardAmountText(card: CostCard, currency: string): string {
    const amount = costCardAmount(card);
    if (amount === null) {
        return "";
    }
    return [moneyFormatter(card.cost.currency || currency)(amount), costPeriodWords(card.cost)].filter(Boolean).join(" ");
}

/** A channel's links whose cost card is there (a deleted card's links are not shown). */
export function channelCostLinks(
    engagement: BusinessEngagementValue,
    segmentId: string,
    channelKey: string,
    cards: readonly CostCard[]
): { link: BusinessChannelCostLinkValue; card: CostCard; shared: boolean }[] {
    const here = engagement.channelCosts.filter(link => link.segmentId === segmentId && link.channelKey === channelKey);
    return here.flatMap(link => {
        const card = cards.find(candidate => candidate.id === link.costId);
        if (!card) {
            return [];
        }
        const channels = new Set(engagement.channelCosts
            .filter(other => other.costId === link.costId && cards.some(candidate => candidate.id === other.costId))
            .map(other => other.segmentId + "|" + other.channelKey));
        return [{ link, card, shared: channels.size > 1 }];
    });
}

/**
 * "Costs: £180 a month · £400 one-time": every cost linked to a
 * channel, in full -- a yearly one as a twelfth a month -- by how
 * often it falls due, " (shared)" where one of them is linked to
 * another channel too. Null with none.
 */
export function channelCostSummary(
    linked: readonly { card: CostCard; shared: boolean }[],
    currency: string
): string | null {

    if (linked.length === 0) {
        return null;
    }

    const format = moneyFormatter(currency);
    const totals = new Map<string, number>();
    const add = (words: string, amount: number) => totals.set(words, (totals.get(words) ?? 0) + amount);

    for (const { card } of linked) {
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

    if (parts.length === 0) {
        return null;
    }

    return "Costs: " + parts.join(" · ") + (linked.some(entry => entry.shared) ? " (shared)" : "");

}

/** The engagement with a channel linked to a cost card (once). */
export function withChannelCost(
    engagement: BusinessEngagementValue,
    segmentId: string,
    channelKey: string,
    costId: string
): BusinessEngagementValue {
    if (engagement.channelCosts.some(link => link.segmentId === segmentId && link.channelKey === channelKey && link.costId === costId)) {
        return engagement;
    }
    return {
        ...engagement,
        channelCosts: [...engagement.channelCosts, { id: randomId("channel-cost"), segmentId, channelKey, costId }]
    };
}

/** The engagement without one link. */
export function withoutChannelCost(engagement: BusinessEngagementValue, linkId: string): BusinessEngagementValue {
    return { ...engagement, channelCosts: engagement.channelCosts.filter(link => link.id !== linkId) };
}

/**
 * "Create a cost": a new Resource at Costs under Offering's
 * Capability, named as typed, to be priced there. Returns the
 * capability with it, and its id.
 */
export function withNewCostCard(capability: BusinessCapabilityValue, name: string): { capability: BusinessCapabilityValue; id: string } {
    const slot = { ...createBusinessResourceSlot(), name: name.trim(), status: "costs" };
    return {
        capability: {
            ...capability,
            offering: { ...capability.offering, resources: [...capability.offering.resources, slot] }
        },
        id: slot.id
    };
}

/** The cost cards whose name holds `query`, those it starts first. */
export function findCostCards(cards: readonly CostCard[], query: string, limit = 8): CostCard[] {
    const wanted = query.trim().toLowerCase();
    return cards
        .map(card => ({ card, at: costCardName(card).toLowerCase().indexOf(wanted) }))
        .filter(entry => entry.at >= 0)
        .sort((one, other) => Number(one.at !== 0) - Number(other.at !== 0))
        .slice(0, limit)
        .map(entry => entry.card);
}
