import type { BusinessActivityValue, BusinessCapabilityValue, BusinessPartnerValue, BusinessResourceSlotValue } from "./AnswerUtils.ts";

/**
 * GENERATED CARDS: a Partner, Supplier or Activity that a card's Status made with "Other…" (its `madeBy` is that card's id) was made for that card. When the card
 * stops naming it (its Status, Activity, Partner or Supplier changes) and no other card names it either, it has no use: the user is asked, and on
 * "Continue" it is removed.
 */
export interface GeneratedCard {
    id: string;
    kind: "activity" | "partner";
    /** The name to show in the question ("Unnamed" where it has none). */
    name: string;
}

const slotsOf = (value: BusinessCapabilityValue): BusinessResourceSlotValue[] =>
    [...Object.values(value.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)), ...value.offering.resources];

const activitiesOf = (value: BusinessCapabilityValue): BusinessActivityValue[] =>
    [...value.activities.flatMap(category => category.activities), ...value.offering.activities];

const partnersOf = (value: BusinessCapabilityValue): BusinessPartnerValue[] =>
    [...value.professionals, ...value.providers, ...value.offering.professionals, ...value.offering.providers];

/** Every card id a Status names: the supplier or partner where its status says so, and the activity where it says so (a card that has changed its status keeps the old id in its fields, but no longer names it). */
function namedBy(slot: BusinessResourceSlotValue): string[] {
    const pick = (status: string, providerId: string, activityId: string) =>
        [["partners-suppliers", "rent"].includes(status) ? providerId : "", status === "activity" ? activityId : ""];
    return [...pick(slot.status, slot.providerId, slot.activityId), ...(slot.extraStatuses ?? []).flatMap(row => pick(row.status, row.providerId, row.activityId))].filter(id => id !== "");
}

/** Every card id any card names (a Status, or an activity's performers). */
function named(value: BusinessCapabilityValue): Set<string> {
    return new Set([...slotsOf(value).flatMap(namedBy), ...activitiesOf(value).flatMap(activity => activity.performerIds)]);
}

/** The generated cards that `after` leaves with no card naming them, which `before` had named by the card that made them. */
export function orphanedCards(before: BusinessCapabilityValue, after: BusinessCapabilityValue): GeneratedCard[] {
    const namedBefore = new Map<string, Set<string>>(slotsOf(before).map(slot => [slot.id, new Set(namedBy(slot))]));
    const namedAfter = named(after);
    const parents = new Set(slotsOf(after).map(slot => slot.id));
    // A parent that is gone altogether leaves its generated cards with no use too.
    const gone = (parentId: string) => namedBefore.has(parentId) && !parents.has(parentId);
    const stillNamedByParent = (parentId: string, id: string) => slotsOf(after).some(slot => slot.id === parentId && namedBy(slot).includes(id));
    const orphans: GeneratedCard[] = [];
    for (const activity of activitiesOf(after)) {
        if (activity.madeBy !== "" && namedBefore.get(activity.madeBy)?.has(activity.id) && (gone(activity.madeBy) || !stillNamedByParent(activity.madeBy, activity.id)) && !namedAfter.has(activity.id)) {
            orphans.push({ id: activity.id, kind: "activity", name: activity.name.trim() || "Unnamed activity" });
        }
    }
    for (const partner of partnersOf(after)) {
        if (partner.madeBy !== "" && namedBefore.get(partner.madeBy)?.has(partner.id) && (gone(partner.madeBy) || !stillNamedByParent(partner.madeBy, partner.id)) && !namedAfter.has(partner.id)) {
            orphans.push({ id: partner.id, kind: "partner", name: partner.name.trim() || "Unnamed " + (partner.category === "suppliers" ? "supplier" : "partner") });
        }
    }
    return orphans;
}

/** The value without the cards of these ids. */
export function withoutCards(value: BusinessCapabilityValue, ids: readonly string[]): BusinessCapabilityValue {
    const gone = new Set(ids);
    const keepActivities = (list: BusinessActivityValue[]) => list.filter(activity => !gone.has(activity.id));
    const keepPartners = (list: BusinessPartnerValue[]) => list.filter(partner => !gone.has(partner.id));
    return {
        ...value,
        activities: value.activities.map(category => ({ ...category, activities: keepActivities(category.activities) })),
        professionals: keepPartners(value.professionals),
        providers: keepPartners(value.providers),
        offering: {
            ...value.offering,
            activities: keepActivities(value.offering.activities),
            professionals: keepPartners(value.offering.professionals),
            providers: keepPartners(value.offering.providers)
        }
    };
}

/**
 * The Offerings every card connected to a generated card serves, by Offering id, with the share each carries: the card that made it and every other card of Offering's
 * Capability that names it (a Status, an activity's performers). These cannot be taken off the generated card while the connection stands.
 */
export function connectedOfferings(value: BusinessCapabilityValue, card: { id: string; madeBy: string }): { ids: string[]; shares: Record<string, string> } {
    const ids: string[] = [];
    const shares: Record<string, string> = {};
    for (const slot of value.offering.resources) {
        if (slot.id === card.madeBy || namedBy(slot).includes(card.id)) {
            for (const id of slot.offeringIds) {
                if (!ids.includes(id)) {
                    ids.push(id);
                    if (slot.offeringShares[id] !== undefined) {
                        shares[id] = slot.offeringShares[id];
                    }
                }
            }
        }
    }
    return { ids, shares };
}

/**
 * A generated card (made by a card's Status) SERVES THE OFFERINGS OF THE CARDS CONNECTED TO IT, and more: whatever a connected card serves is added to it (with the
 * share it carries there), and the user may add others; ADDING, NEVER REMOVING -- nothing a connected card serves is taken off it, and what it gains from one card never
 * changes that card. (Only in Offering's Capability: Infrastructure's cards serve no Offering.)
 */
export function withInheritedOfferings(value: BusinessCapabilityValue): BusinessCapabilityValue {
    let changed = false;
    const follow = <T extends { id: string; madeBy: string; offeringIds: string[]; offeringShares: Record<string, string> }>(card: T): T => {
        if (card.madeBy === "") {
            return card;
        }
        const connected = connectedOfferings(value, card);
        const missing = connected.ids.filter(id => !card.offeringIds.includes(id));
        if (missing.length === 0) {
            return card;
        }
        changed = true;
        const shares = { ...card.offeringShares };
        missing.forEach(id => { if (connected.shares[id] !== undefined) { shares[id] = connected.shares[id]; } });
        return { ...card, offeringIds: [...card.offeringIds, ...missing], offeringShares: shares };
    };
    const next: BusinessCapabilityValue = {
        ...value,
        offering: {
            ...value.offering,
            activities: value.offering.activities.map(follow),
            professionals: value.offering.professionals.map(follow),
            providers: value.offering.providers.map(follow)
        }
    };
    return changed ? next : value;
}
