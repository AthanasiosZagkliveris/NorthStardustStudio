import { UNASSIGNED_CATEGORY, WORKSPACE_GROUP_ID } from "./AnswerUtils.ts";
import { parseAmount } from "./Amounts.ts";
import {
    BusinessActivityValue,
    BusinessCapabilityValue,
    BusinessCostValue,
    BusinessFounderValue,
    BusinessPartnerValue,
    BusinessResourceSlotValue,
    businessAutoResponsibleId,
    businessPartnerResponsibleId,
    usesSupplier,
    offeringSharesIncomplete,
    paymentPlanIncomplete,
    isCostingStatus,
    responsibleIsOff
} from "./AnswerUtils.ts";

/*
    INCOMPLETE CARDS (Page 3). A card needs an answer in every field that is not behind an optional tick box; a card that lacks one is STORED AS IT IS but is
    flagged incomplete, shown with the red flashing glow, and COUNTED NOWHERE until it is fixed: the Financial Foundation's Costs, the forecast, the capacity,
    the exports and the documents read the capability through countedCapability(), which leaves such cards out. (A card that is completely blank is not an
    incomplete card: it is removed again, as before.)

    WHAT IS REQUIRED (the optional ones are the Description, the Responsible tick and the Qty, left empty):

    - Resource: Name; Status; at "Partners & Suppliers" the partner or supplier, at a space's or vehicle's "Rent" the supplier; at "Costs" or "Buy" the Price and the
      Payment Frequency.
    - Activity: Name; at least one Performer; the Responsible, unless the tick is off or the rule names him (a one-founder organization; one founder among
      the Performers) or there is no founder to name.
    - Partner / Provider: Name; Price and Payment Frequency; the Responsible, as for an Activity.
    - Workspace: a Resource like the others (the Workspace form is the common card).
    - Founder: Salary, Working Hours, and Delivery Hours (or the percent of working hours).
*/

const filled = (text: string) => text.trim().length > 0;

const priceMissing = (cost: BusinessCostValue): string[] => [
    ...(parseAmount(cost.price) === null ? ["Price"] : []),
    ...(!filled(cost.frequency) ? ["Payment Frequency"] : [])
];

/** The ids of everyone a Responsible could name. */
const founderIdsOf = (capability: BusinessCapabilityValue) => capability.founders.filter(founder => filled(founder.name)).map(founder => founder.id);

/** A card of the Offering is linked to at least one Offering, and when to several their shares total 100%. */
export function offeringLinksMissing(card: { offeringIds: string[]; offeringShares: Record<string, string> }): string[] {
    return card.offeringIds.length === 0
        ? ["Linked Offerings"]
        : offeringSharesIncomplete(card.offeringIds, card.offeringShares) ? ["Offering shares"] : [];
}

export function resourceMissing(slot: BusinessResourceSlotValue, capability: BusinessCapabilityValue): string[] {
    const partnerIds = new Set([...capability.professionals, ...capability.providers, ...capability.offering.professionals, ...capability.offering.providers].map(entry => entry.id));
    const activityIds = new Set([...capability.activities.flatMap(category => category.activities), ...capability.offering.activities].map(entry => entry.id));
    return [
        ...(filled(slot.name) ? [] : ["Name"]),
        ...(filled(slot.status) ? [] : ["Status"]),
        ...(slot.status === "activity" && !activityIds.has(slot.activityId) ? ["Activity"] : []),
        ...(usesSupplier(slot.status) && !(partnerIds.has(slot.providerId) || slot.providerId.startsWith("workspace:")) ? [slot.status === "rent" ? "Rent" : "Partner or Supplier"] : []),
        ...(isCostingStatus(slot.status) ? priceMissing(slot.cost) : []),
        ...(isCostingStatus(slot.status) && paymentPlanIncomplete(slot.cost, slot.paymentPlan, slot.startDate, slot.endDate) ? ["Payment Plan"] : [])
    ];
}

export function activityMissing(activity: BusinessActivityValue, capability: BusinessCapabilityValue): string[] {
    const founderIds = founderIdsOf(capability);
    const responsible = responsibleIsOff(activity) ? "x" : businessAutoResponsibleId(founderIds, activity.performerIds) || activity.responsibleId;
    return [
        ...(activity.category === UNASSIGNED_CATEGORY ? ["Category"] : []),
        ...(filled(activity.name) ? [] : ["Name"]),
        ...(filled(activity.startDate) ? [] : ["Start date"]),
        // (A Pre-Operational activity is Capital Expenditure or Start-up Expenses.)
        ...(activity.category === "pre-operational" && activity.type === "" ? ["Type"] : []),
        ...(activity.performerIds.some(filled) ? [] : ["Performer"]),
        ...(founderIds.length > 0 && !filled(responsible) ? ["Responsible"] : [])
    ];
}

export function partnerMissing(partner: BusinessPartnerValue, capability: BusinessCapabilityValue): string[] {
    const founderIds = founderIdsOf(capability);
    const responsible = responsibleIsOff(partner) ? "x" : businessPartnerResponsibleId(partner, founderIds);
    return [
        ...(partner.category === UNASSIGNED_CATEGORY ? ["Category"] : []),
        ...(filled(partner.name) ? [] : ["Name"]),
        ...priceMissing(partner.cost),
        ...(paymentPlanIncomplete(partner.cost, partner.paymentPlan, partner.startDate, partner.endDate) ? ["Payment Plan"] : []),
        ...(founderIds.length > 0 && !filled(responsible) ? ["Responsible"] : [])
    ];
}

export function founderMissing(founder: BusinessFounderValue): string[] {
    return [
        ...(parseAmount(founder.salary) === null ? ["Salary"] : []),
        ...(parseAmount(founder.hours) === null ? ["Working Hours"] : []),
        ...(parseAmount(founder.deliveryHours) === null && parseAmount(founder.deliveryShare) === null ? ["Delivery Hours"] : [])
    ];
}

/**
 * What every incomplete card of the page lacks, by the card's id ("workspace" for the Workspace). A card that is completely blank is not listed: it is
 * taken away again, not flagged.
 */
export function incompleteCards(capability: BusinessCapabilityValue): Map<string, string[]> {
    const missing = new Map<string, string[]>();
    const add = (id: string, fields: string[]) => {
        if (fields.length > 0) {
            missing.set(id, fields);
        }
    };
    // (A new Resource card has no Category yet, and then no Group: it is incomplete till both are chosen.)
    Object.entries(capability.resources).forEach(([group, subsections]) => subsections.forEach(subsection => subsection.slots.forEach(slot => add(slot.id, [
        ...(group === "unassigned" ? ["Category"] : subsection.id === "unassigned" ? ["Group"] : []),
        ...resourceMissing(slot, capability)
    ]))));
    capability.offering.resources.forEach(slot => add(slot.id, [...resourceMissing(slot, capability), ...offeringLinksMissing(slot)]));
    capability.activities.flatMap(category => category.activities).forEach(activity => add(activity.id, activityMissing(activity, capability)));
    capability.offering.activities.forEach(activity => add(activity.id, [...activityMissing(activity, capability), ...offeringLinksMissing(activity)]));
    [...capability.professionals, ...capability.providers]
        .forEach(partner => add(partner.id, partnerMissing(partner, capability)));
    [...capability.offering.professionals, ...capability.offering.providers]
        .forEach(partner => add(partner.id, [...partnerMissing(partner, capability), ...offeringLinksMissing(partner)]));
    capability.founders
        .filter(founder => filled(founder.name) && [founder.salary, founder.hours, founder.deliveryHours, founder.deliveryShare].some(filled))
        .forEach(founder => add(founder.id, founderMissing(founder)));
    return missing;
}

/**
 * The capability as every calculation, count, export and document reads it: the incomplete cards LEFT OUT (a Resource, Activity, Partner or Provider), the
 * Workspace stripped of its status and cost, a Founder of his pay and hours. The stored answer is untouched.
 */
export function countedCapability(capability: BusinessCapabilityValue): BusinessCapabilityValue {
    const missing = incompleteCards(capability);
    if (missing.size === 0) {
        return capability;
    }
    const keep = <T extends { id: string }>(list: T[]) => list.filter(entry => !missing.has(entry.id));
    return {
        ...capability,
        founders: capability.founders.map(founder => missing.has(founder.id) ? { ...founder, salary: "", hours: "", deliveryHours: "", deliveryShare: "" } : founder),
        resources: Object.fromEntries(Object.entries(capability.resources).map(([group, subsections]) => [
            group, subsections.map(subsection => ({
                ...subsection,
                // (A Workspace card that lacks an answer stays, stripped of its status, price, provider and deposit; any other card is left out.)
                slots: group === WORKSPACE_GROUP_ID
                    ? subsection.slots.map(slot => missing.has(slot.id) ? { ...slot, status: "", cost: { ...slot.cost, price: "" }, providerId: "", deposit: "" } : slot)
                    : keep(subsection.slots)
            }))
        ])),
        activities: capability.activities.map(category => ({ ...category, activities: keep(category.activities) })),
        professionals: keep(capability.professionals),
        providers: keep(capability.providers),
        offering: {
            ...capability.offering,
            resources: keep(capability.offering.resources),
            activities: keep(capability.offering.activities),
            professionals: keep(capability.offering.professionals),
            providers: keep(capability.offering.providers)
        }
    };
}
