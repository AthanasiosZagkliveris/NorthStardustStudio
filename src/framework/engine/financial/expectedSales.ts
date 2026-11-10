/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { type BusinessCapabilityValue } from "../AnswerUtils.ts";
import { type CapacityCheck, type DemandValue, capacityCheck, demandResult } from "../DemandCapacity.ts";
import { isRecurringRevenue, type FinancialSustainabilityValue } from "./revenueStored.ts";
import { numberAsText } from "./breakEven.ts";
import { type FinancialFoundationValue } from "./stored.ts";
import { streamVolumes } from "./revenue.ts";
import { planLength } from "./period.ts";

/* ==========================================================
   Expected sales from Demand & Conversion
========================================================== */

/**
 * The revenue page with each stream's expected sales taken from
 * Customer Engagement's Demand & Conversion, where that Offering has
 * one that gives a figure. A stream without one keeps the volume
 * entered on Sustainability: an organization that estimates
 * directly is never made to fill in demand.
 *
 * Every calculation that reads the revenue page reads it through this,
 * so the pages, the documents and the forecast agree.
 */
export function withDemand(
    page: FinancialSustainabilityValue,
    demand: Record<string, DemandValue> | undefined
): FinancialSustainabilityValue {
    if (!demand) {
        return page;
    }
    return {
        ...page,
        streams: page.streams.map(stream => {
            const expected = demandResult(demand[stream.offeringId]).expected;
            return expected === null ? stream : { ...stream, volume: numberAsText(expected) };
        })
    };
}

/**
 * Expected sales against deliverable capacity, for the plan: each
 * Offering's volumes month by month (as withDemand gives them) and the
 * founders' delivery hours, compared by capacityCheck. The pages and
 * the documents all read it from here.
 */
export function salesCapacity(
    revenuePage: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    capability: BusinessCapabilityValue
): CapacityCheck | null {
    const volumesByOffering: Record<string, number[]> = {};
    revenuePage.streams.forEach(stream => {
        const volumes = streamVolumes(stream, foundation.planStart);
        const into = volumesByOffering[stream.offeringId] ?? new Array<number>(volumes.length).fill(0);
        volumes.forEach((volume, index) => { into[index] += volume; });
        volumesByOffering[stream.offeringId] = into;
    });
    // Subscriptions and retainers are served every month: they use founders' hours first.
    const recurring = new Set([
        ...revenuePage.streams.filter(stream => isRecurringRevenue(stream.frequency)).map(stream => stream.offeringId),
        ...Object.entries(capability.delivery).filter(([, entry]) => entry.mode === "monthly").map(([offeringId]) => offeringId)
    ]);
    const names: Record<string, string> = Object.fromEntries([
        ...capability.professionals, ...capability.providers,
        ...capability.offering.professionals, ...capability.offering.providers
    ].map(person => [person.id, person.name.trim() || "Unnamed professional"]));
    return capacityCheck(capability.founders, volumesByOffering, capability.delivery, planLength(foundation), recurring, names);
}
