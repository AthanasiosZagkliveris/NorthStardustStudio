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
        [["partners-suppliers", "rent"].includes(status) ? providerId : "", ["activity", "investigation"].includes(status) ? activityId : ""];
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
 * A generated card (made by a card's Status) SERVES THE OFFERINGS ITS PARENT SERVES: whenever the parent's Offerings change, the generated card's follow, with the
 * share each carries. (Only in Offering's Capability: Infrastructure's cards serve no Offering.)
 */
export function withInheritedOfferings(value: BusinessCapabilityValue): BusinessCapabilityValue {
    const parents = new Map(value.offering.resources.map(slot => [slot.id, slot] as const));
    const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id, at) => id === b[at]);
    let changed = false;
    const follow = <T extends { madeBy: string; offeringIds: string[]; offeringShares: Record<string, string> }>(card: T): T => {
        const parent = card.madeBy !== "" ? parents.get(card.madeBy) : undefined;
        if (!parent || (same(card.offeringIds, parent.offeringIds) && JSON.stringify(card.offeringShares) === JSON.stringify(parent.offeringShares))) {
            return card;
        }
        changed = true;
        return { ...card, offeringIds: [...parent.offeringIds], offeringShares: { ...parent.offeringShares } };
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
