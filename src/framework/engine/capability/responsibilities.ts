/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { type FounderResponsibility, type BusinessCapabilityValue, type BusinessActivityValue, type BusinessPartnerValue } from "./types.ts";

/** Every activity on the page, whichever section or category it is
 *  filed under -- for the lookups that do not care. */
export function businessAllActivities(
    capability: BusinessCapabilityValue
): BusinessActivityValue[] {
    return [
        ...capability.activities.flatMap(category => category.activities),
        ...capability.offering.activities
    ];
}

export function businessFounderResponsibilities(
    capability: BusinessCapabilityValue,
    founderId: string,
    /** The Legal Entity's expenses: an expense names the founder responsible for it. */
    legalExpenses: readonly { id: string; name: string; responsibility: string; responsibleOff?: boolean }[] = []
): FounderResponsibility[] {

    if (founderId.length === 0) {
        return [];
    }

    const founderIds = capability.founders.map(founder => founder.id);
    const offeringIds = new Set(capability.offering.activities.map(activity => activity.id));

    const activities = businessAllActivities(capability)
        .filter(activity =>
            businessResponsibleId(activity, founderIds) === founderId &&
            activity.name.trim().length > 0
        )
        .map(activity => ({
            id: activity.id,
            name: activity.name.trim(),
            completed: activity.completed,
            scope: offeringIds.has(activity.id) ? "offering" as const : "infrastructure" as const,
            kind: "activity" as const
        }));

    const partners = (list: readonly BusinessPartnerValue[], scope: "infrastructure" | "offering", kind: "partner" | "supplier") => list
        .filter(partner => businessPartnerResponsibleId(partner, founderIds) === founderId && partner.name.trim().length > 0)
        .map(partner => ({ id: partner.id, name: partner.name.trim(), completed: false, scope, kind }));

    const legal = legalExpenses
        .filter(expense => expense.responsibleOff !== true && expense.responsibility === founderId && expense.name.trim().length > 0)
        .map(expense => ({ id: expense.id, name: expense.name.trim(), completed: false, scope: "legal" as const, kind: "legal" as const }));

    return [
        ...activities,
        ...partners(capability.professionals, "infrastructure", "partner"),
        ...partners(capability.providers, "infrastructure", "supplier"),
        ...partners(capability.offering.professionals, "offering", "partner"),
        ...partners(capability.offering.providers, "offering", "supplier"),
        ...legal
    ];

}

/**
 * How long a founder's Responsibilities list can be and still start
 * open. A longer one starts folded, behind its "Completed n/m"
 * count, so the founder card stays a card rather than a list.
 */
export const RESPONSIBILITIES_OPEN_UP_TO = 5;

/** A founder's Responsibilities, counted: how many are done of how many, and whether the list starts open. */
export function businessResponsibilitiesTally(
    responsibilities: readonly { completed: boolean }[]
): { completed: number; total: number; startsOpen: boolean } {
    return {
        completed: responsibilities.filter(entry => entry.completed).length,
        total: responsibilities.length,
        startsOpen: responsibilities.length <= RESPONSIBILITIES_OPEN_UP_TO
    };
}

/**
 * The Responsible tick was turned off on this card (activity, partner /
 * provider or strategy objective): it has no responsible by choice. The
 * default -- the key absent -- is ticked, so everything stored before the
 * tick existed is unchanged. An unticked card is neither flagged as
 * missing a responsible nor given the sole founder by the rule: the rules
 * of businessAutoResponsibleId apply only while the tick is on.
 */
export function responsibleIsOff(card: { responsibleOff?: boolean }): boolean {
    return card.responsibleOff === true;
}

/**
 * The founder responsible BY RULE, or "" where it is a choice.
 *
 * 1. A one-person organisation: its only founder is responsible for
 *    everything, since there is nobody else it could be.
 * 2. An activity whose Performers include exactly one founder (with
 *    or without partners and providers beside them): that founder is
 *    responsible for it too, and it follows the Performers -- change
 *    them so a different single founder remains, and so does this.
 *    With two or more founders among them somebody has to be chosen
 *    (the choice, kept in responsibleId, is never overridden); with
 *    none it is left empty for Review to list.
 *
 * `performerIds` is omitted for what has no performer -- a partner,
 * where only the first rule applies.
 */
export function businessAutoResponsibleId(
    founderIds: readonly string[],
    performerIds?: readonly string[]
): string {

    if (founderIds.length === 1) {
        return founderIds[0];
    }

    const founders = [...new Set(
        (performerIds ?? []).filter(id => id.length > 0 && founderIds.includes(id))
    )];

    if (founders.length === 1) {
        return founders[0];
    }

    return "";

}

/**
 * Who is responsible for a Partnership / Provider: the founder chosen on its
 * card; and, where the organisation has exactly ONE founder, that founder
 * while nothing (or nobody who is still a founder) is chosen -- he is
 * responsible automatically (businessAutoResponsibleId's first rule). Derived
 * from what is stored, never written back: a choice is never overridden, and
 * with several founders, or none, it is what was chosen ("" until then).
 */
export function businessPartnerResponsibleId(
    partner: { responsibleId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(partner)) {
        return "";
    }
    if (partner.responsibleId.length > 0 && founderIds.includes(partner.responsibleId)) {
        return partner.responsibleId;
    }
    return businessAutoResponsibleId(founderIds) || partner.responsibleId;
}

/**
 * Who is responsible for a Strategy Objective: the founder chosen on its card;
 * and, where the organisation has exactly ONE founder (who has no Responsible
 * field to choose in), that founder while nothing (or nobody who is still a
 * founder) is chosen. Derived from what is stored, never written back.
 */
export function strategyObjectiveOwnerId(
    objective: { ownerId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    return businessPartnerResponsibleId(
        { responsibleId: objective.ownerId, responsibleOff: objective.responsibleOff },
        founderIds
    );
}

/** Who is responsible for an activity: by rule, or as chosen. */
export function businessResponsibleId(
    activity: BusinessActivityValue,
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(activity)) {
        return "";
    }
    return businessAutoResponsibleId(founderIds, activity.performerIds) ||
        activity.responsibleId;
}
