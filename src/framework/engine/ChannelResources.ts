import { workspacesOf, WORKSPACE_GROUP_ID, BUSINESS_CHANNEL_CATEGORIES } from "./AnswerUtils.ts";
import { parseAmount, parseDecimal } from "./Amounts.ts";
import {
    type BusinessCapabilityValue,
    type BusinessChannelResourceValue,
    type BusinessCostValue,
    type BusinessEngagementValue,
    createBusinessResourceSlot,
    isCostingStatus,
    workspaceCardName
} from "./AnswerUtils.ts";
import { createBusinessPartner } from "./AnswerUtils.ts";
import { moneyFormatter } from "./FinancialModel.ts";
import { randomId } from "./Readers.ts";

/*
    A CUSTOMER CHANNEL'S RESOURCES.

    What a channel needs -- a paid plan, a card reader, a stall -- is a
    Resource card on 3. Infrastructure & Capability, where its Quantity,
    Price, Frequency and Description are entered like any resource's.
    The channel holds a link to it by id (BusinessChannelResourceValue),
    and the actions of the channel it serves. One name: the card's.

    "+ Add expenses" on a channel makes a BLANK Resource card under
    Offering's Capability › Resources, linked to the channel and its
    actions. Nothing is pre-filled from the channel: the user then
    chooses the card's Offerings, Status, Frequency and partner on
    3. Infrastructure & Capability. "+ Add expenses" makes resources
    only, never partners.

    Taking the resource off the channel deletes the card too; deleting
    the card takes it off the channel (its link then leads nowhere and
    is not shown), and undo brings it back. A resource made before in
    Infrastructure stays there, and is read and removed the same way: the
    link holds the card's id, wherever it is.

    A resource is made on ONE channel. It is linked to actions of the
    WHOLE table of its Segment (any channel's, found by total order number
    or by words), not only its own channel's. It serves the other channels
    through those actions: an action that stands in another channel's rows
    brings the resource into that channel's cell too, marked "via shared
    action" (a link to the action), and into its summary, marked
    "(shared)". The channel resources table lists those channels under the
    resource's home channel.

    Nothing is counted twice: the Financial Foundation and the Forecast
    count each resource once, from 3. Infrastructure & Capability, and
    never read these links. A channel's summary line counts what its
    resources cost, the shared ones included.
*/

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
    /** The Offerings it serves (Offering's Capability only; [] elsewhere). */
    offeringIds: string[];
}

const PARTNER_KINDS = [
    ["professionals", "professional", "Partners"],
    ["providers", "provider", "Providers"]
] as const;

/** Every card that can hold a cost (whether it has one yet or not), in page order. */
export function capabilityCards(capability: BusinessCapabilityValue, groupLabels: Record<string, string> = {}): CostCard[] {

    const cards: CostCard[] = workspacesOf(capability).map((workspace, index): CostCard => ({
        id: workspace.id, name: workspaceCardName(index), kind: "workspace", scope: "infrastructure",
        cost: workspace.cost, quantity: "", status: workspace.status, offeringIds: [],
        place: "Infrastructure → Workspace",
        anchors: ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
    }));

    for (const [groupId, subsections] of Object.entries(capability.resources)) {
        // (The Workspace cards are the cards above.)
        if (groupId === WORKSPACE_GROUP_ID) {
            continue;
        }
        for (const subsection of subsections) {
            for (const slot of subsection.slots) {
                cards.push({
                    id: slot.id, name: slot.name, kind: "resource", scope: "infrastructure",
                    cost: slot.cost, quantity: slot.quantity, status: slot.status, offeringIds: slot.offeringIds ?? [],
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
                cost: partner.cost, quantity: "", status: "", offeringIds: [], place: "Infrastructure → " + label,
                anchors: [partner.id, "partners-infrastructure-" + list, "section-infrastructure-partners", "capability-infrastructure"]
            });
        }
    }

    for (const slot of capability.offering.resources) {
        cards.push({
            id: slot.id, name: slot.name, kind: "resource", scope: "offering",
            cost: slot.cost, quantity: slot.quantity, status: slot.status, offeringIds: slot.offeringIds ?? [], place: "Offering's Capability → Resources",
            anchors: [slot.id, "section-offering-resources", "capability-offering-capability"]
        });
    }

    for (const [list, kind, label] of PARTNER_KINDS) {
        for (const partner of capability.offering[list]) {
            cards.push({
                id: partner.id, name: partner.name, kind, scope: "offering",
                cost: partner.cost, quantity: "", status: "", offeringIds: partner.offeringIds ?? [], place: "Offering's Capability → " + label,
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
    if ((card.kind === "resource" || card.kind === "workspace") && !isCostingStatus(card.status)) {
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
        case "quarterly": return "a quarter";
        case "per-unit": return cost.unit.trim() && cost.unit.trim() !== "unit" ? "per " + cost.unit.trim() : "per unit";
        case "per-order": return "per order";
        case "percent-revenue": return "of revenue";
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
 * one: an action they are linked to stands in this channel's rows too
 * (whichever channel the action was first written in).
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

/** The actions of a resource's link that stand in this channel's rows: the ones it serves the channel through ("via shared action"). */
export function actionsServing(
    engagement: BusinessEngagementValue,
    segmentId: string,
    channelId: string,
    link: BusinessChannelResourceValue
): string[] {
    const here = new Set(channelActionIds(engagement, segmentId, channelId));
    return link.actionIds.filter(id => here.has(id));
}

/**
 * The other channels a resource serves through its actions (their ids, in
 * table order): every channel whose rows hold one of its actions, whether
 * the action stands in the resource's own channel or only in another.
 */
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
 * "+ Add expenses": a BLANK Resource card (as 3. Infrastructure &
 * Capability's own "+ Add expenses" makes one: no Status, no Offerings)
 * in Offering's Capability › Resources, linked to the channel. The user
 * chooses its Offerings, Status, Frequency and partner on that page.
 */
export function withNewChannelResource(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    name = ""
): { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue; link: BusinessChannelResourceValue } {
    const slot = { ...createBusinessResourceSlot(), name };
    const link = { id: randomId("channel-resource"), segmentId, channelId, resourceId: slot.id, actionIds: [] };
    return {
        engagement: { ...engagement, channelResources: [...engagement.channelResources, link] },
        capability: { ...capability, offering: { ...capability.offering, resources: [...capability.offering.resources, slot] } },
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
    // (A card the company already had, linked, stays where it is.)
    if (!link || link.existing || rest.some(entry => entry.resourceId === link.resourceId)) {
        return { engagement: next, capability };
    }
    const without = <T extends { id: string }>(list: T[]) => list.filter(entry => entry.id !== link.resourceId);
    return {
        engagement: next,
        capability: {
            ...capability,
            resources: Object.fromEntries(Object.entries(capability.resources)
                .map(([group, subsections]) => [group, subsections.map(subsection => ({ ...subsection, slots: without(subsection.slots) }))])),
            offering: {
                ...capability.offering,
                resources: without(capability.offering.resources),
                professionals: without(capability.offering.professionals),
                providers: without(capability.offering.providers)
            }
        }
    };
}

/**
 * TYPICAL COSTS FOR THIS CHANNEL (the card structure's templates T1 to T10 and T12; T11 is removed). Each is created in its own group in the Offering
 * place, its price blank so that it is incomplete until priced, and linked to the channel. An item the company already has is offered as Link existing.
 */
export interface ChannelCostTemplate {
    id: string;
    label: string;
    /** A Resource card, a Supplier or a Partner. */
    kind: "resource" | "supplier" | "partner";
    category: string;
    group: string;
    frequency: string;
    unit?: string;
    /** The channel categories (BUSINESS_CHANNEL_CATEGORIES ids) the template makes sense on: a courier is not a cost of an Instagram channel. */
    categories: readonly string[];
}

export const CHANNEL_COST_TEMPLATES: readonly ChannelCostTemplate[] = [
    { id: "T1", categories: ["website","email","online-live","community","marketplace","file-delivery","social-media"], label: "Platform or tool subscription", kind: "resource", category: "digital", group: "sales-delivery-tools", frequency: "monthly" },
    { id: "T2", categories: ["website","direct-payment","in-person","online-live"], label: "Payment processing fees", kind: "supplier", category: "suppliers", group: "platforms-payments", frequency: "percent-revenue" },
    { id: "T3", categories: ["marketplace","retail-wholesale"], label: "Marketplace fees and commission", kind: "supplier", category: "suppliers", group: "platforms-payments", frequency: "percent-revenue" },
    { id: "T4", categories: ["social-media","website","community","marketplace","referral-affiliates"], label: "Ads and influencers", kind: "supplier", category: "suppliers", group: "agencies-influencers", frequency: "per-project" },
    { id: "T5", categories: ["in-person","retail-wholesale"], label: "Stall, pitch, stand or event fee", kind: "resource", category: "workspace", group: "site-hire", frequency: "per-project" },
    { id: "T6", categories: ["in-person","direct-payment","online-live"], label: "Display kit or hardware", kind: "resource", category: "equipment", group: "devices-tools", frequency: "per-unit", unit: "item" },
    { id: "T7", categories: ["in-person","physical-delivery"], label: "Travel and van hire", kind: "resource", category: "documents", group: "tickets-trips", frequency: "per-project" },
    { id: "T8", categories: ["physical-delivery","retail-wholesale","marketplace","website","in-person"], label: "Packaging and samples", kind: "resource", category: "materials", group: "materials-stock", frequency: "per-unit" },
    { id: "T9", categories: ["physical-delivery","marketplace","website","retail-wholesale"], label: "Courier, postal, fulfilment", kind: "supplier", category: "suppliers", group: "logistics-fulfilment", frequency: "per-unit", unit: "parcel" },
    { id: "T10", categories: ["referral-affiliates","retail-wholesale"], label: "Referral or reseller commission", kind: "partner", category: "partners", group: "revenue-partners", frequency: "percent-revenue" },
    { id: "T12", categories: ["in-person","physical-delivery","retail-wholesale"], label: "Event or transit insurance", kind: "resource", category: "documents", group: "insurances", frequency: "per-project" }
];

/** The templates that fit a channel of this category (by its label); a category of the founder's own, or none, fits them all. */
export function templatesForCategory(categoryLabel: string): readonly ChannelCostTemplate[] {
    const known = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === categoryLabel);
    return known && known.id !== "other" ? CHANNEL_COST_TEMPLATES.filter(template => template.categories.includes(known.id)) : CHANNEL_COST_TEMPLATES;
}

/** The company's cards of a template's kind and group that this channel does not hold yet: what it may Link existing. */
export function existingForTemplate(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    template: ChannelCostTemplate
): { id: string; name: string }[] {
    const held = new Set(engagement.channelResources.filter(link => link.segmentId === segmentId && link.channelId === channelId).map(link => link.resourceId));
    // (A card named as another template of the same group is that template's item, not this one's.)
    const otherTemplates = new Set(CHANNEL_COST_TEMPLATES.filter(other => other.id !== template.id && other.group === template.group).map(other => other.label));
    const named = <T extends { id: string; name: string }>(list: readonly T[]) => list.filter(entry => !held.has(entry.id) && !otherTemplates.has(entry.name)).map(entry => ({ id: entry.id, name: entry.name.trim() || "Unnamed" }));
    if (template.kind === "resource") {
        return named([
            ...capability.offering.resources.filter(slot => slot.category === template.category && slot.group === template.group),
            ...Object.values(capability.resources).flat().filter(subsection => subsection.id === template.group).flatMap(subsection => subsection.slots)
        ]);
    }
    const list = template.kind === "supplier" ? [capability.offering.providers, capability.providers] : [capability.offering.professionals, capability.professionals];
    return named(list.flat().filter(partner => partner.group === template.group));
}

/** A template pressed: its card made in its group, the price blank, linked to the channel. */
export function withNewTemplateCost(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    template: ChannelCostTemplate
): { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue; link: BusinessChannelResourceValue } {
    const cost = { ...createBusinessResourceSlot().cost, frequency: template.frequency, unit: template.unit ?? "" };
    const slot = { ...createBusinessResourceSlot(), name: template.label, status: "costs", category: template.category, group: template.group, cost };
    const partner = { ...createBusinessPartner(template.label, template.category), group: template.group, cost };
    const id = template.kind === "resource" ? slot.id : partner.id;
    const link = { id: randomId("channel-resource"), segmentId, channelId, resourceId: id, actionIds: [] };
    const offering = template.kind === "resource"
        ? { ...capability.offering, resources: [...capability.offering.resources, slot] }
        : template.kind === "supplier"
            ? { ...capability.offering, providers: [...capability.offering.providers, partner] }
            : { ...capability.offering, professionals: [...capability.offering.professionals, partner] };
    return {
        engagement: { ...engagement, channelResources: [...engagement.channelResources, link] },
        capability: { ...capability, offering },
        link
    };
}

/** Whether the channel already holds the card a template makes (a card of its group, named as the template). */
export function holdsTemplate(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    template: ChannelCostTemplate
): boolean {
    const held = new Set(engagement.channelResources.filter(link => link.segmentId === segmentId && link.channelId === channelId).map(link => link.resourceId));
    return [...capability.offering.resources, ...capability.offering.providers, ...capability.offering.professionals]
        .some(card => held.has(card.id) && card.group === template.group && card.name === template.label);
}

/**
 * THE BUTTON "Typical costs for this channel": every template whose item the company does not already have is created at once, in its group, the
 * price blank. A template the company already has an item for is not created: it is returned as an offer, to Link existing (or to add a new one).
 * A template the channel already holds is left alone, so pressing twice makes nothing twice.
 */
export function withTypicalCosts(
    engagement: BusinessEngagementValue,
    capability: BusinessCapabilityValue,
    segmentId: string,
    channelId: string,
    /** The templates that fit the channel's category (templatesForCategory); all of them where it is not given. */
    fitting: readonly ChannelCostTemplate[] = CHANNEL_COST_TEMPLATES
): { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue; offers: ChannelCostTemplate[] } {
    let next = { engagement, capability };
    const offers: ChannelCostTemplate[] = [];
    for (const template of fitting) {
        if (holdsTemplate(engagement, capability, segmentId, channelId, template)) {
            continue;
        }
        if (existingForTemplate(engagement, capability, segmentId, channelId, template).length > 0) {
            offers.push(template);
            continue;
        }
        const made = withNewTemplateCost(next.engagement, next.capability, segmentId, channelId, template);
        next = { engagement: made.engagement, capability: made.capability };
    }
    return { ...next, offers };
}

/** A card the company already has, linked to the channel (Link existing): nothing is made, and it stays when taken off. */
export function withLinkedExistingCard(engagement: BusinessEngagementValue, segmentId: string, channelId: string, cardId: string): BusinessEngagementValue {
    return {
        ...engagement,
        channelResources: [...engagement.channelResources, { id: randomId("channel-resource"), segmentId, channelId, resourceId: cardId, actionIds: [], existing: true }]
    };
}

/** A resource linked to one more action of its Segment's table (once), or unlinked from one. */
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

/** The resources (links whose card is there) an action is linked to, from whichever channel they were made, in the order they were made. */
export function actionResourceLinks(
    engagement: BusinessEngagementValue,
    segmentId: string,
    actionId: string,
    cards: readonly CostCard[]
): { link: BusinessChannelResourceValue; card: CostCard }[] {
    return engagement.channelResources
        .filter(link => link.segmentId === segmentId && link.actionIds.includes(actionId))
        .flatMap(link => {
            const card = cards.find(candidate => candidate.id === link.resourceId);
            return card ? [{ link, card }] : [];
        });
}
