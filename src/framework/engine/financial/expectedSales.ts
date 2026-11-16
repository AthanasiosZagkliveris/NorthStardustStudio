/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { type BusinessCapabilityValue } from "../AnswerUtils.ts";
import { type CapacityCheck, type DemandValue, capacityCheck, demandResult } from "../DemandCapacity.ts";
import { isRecurringRevenue, type FinancialSustainabilityValue } from "./revenueStored.ts";
import { numberAsText } from "./breakEven.ts";
import { type FinancialFoundationValue } from "./stored.ts";
import { streamVolumes } from "./revenue.ts";
import { planLength } from "./period.ts";
import { businessFoundationSegments } from "../AnswerBusinessFoundation.ts";
import { offeringStartsById } from "../EffectiveAnswers.ts";

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
    demand: Record<string, DemandValue> | undefined,
    foundation?: unknown
): FinancialSustainabilityValue {
    // WHEN THEY PAY HAS ONE OWNER, the Offering's O3t (owner, 2026-11-16): where it is answered, each stream's Payment Timing is its record.
    const segments = foundation === undefined ? [] : businessFoundationSegments(foundation);
    const timed = (stream: FinancialSustainabilityValue["streams"][number]) => {
        const starts = segments.length > 0 ? offeringStartsById(segments, stream.offeringId) : {};
        return starts.paymentTimingAnswered ? { ...stream, paymentTiming: starts.paymentTiming ?? ("" as const) } : stream;
    };
    if (!demand && segments.length === 0) {
        return page;
    }
    return {
        ...page,
        streams: page.streams.map(entry => {
            const stream = timed(entry);
            const expected = demand ? demandResult(demand[stream.offeringId]).expected : null;
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
    // (The people beside the founders: Partners, Suppliers and Staff cards, with the hours a month each can give where said.)
    const people = [
        ...capability.professionals, ...capability.providers,
        ...capability.offering.professionals, ...capability.offering.providers,
        ...capability.offering.resources.filter(slot => slot.category === "hr"),
        ...(capability.resources["hr"] ?? []).flatMap(subsection => subsection.slots)
    ];
    const names: Record<string, string> = Object.fromEntries(people.map(person => [person.id, person.name.trim() || "Unnamed professional"]));
    const available: Record<string, number> = Object.fromEntries(people.flatMap(person => {
        const hours = Number.parseFloat(person.hoursAvailable);
        return Number.isFinite(hours) && hours > 0 ? [[person.id, hours]] : [];
    }));
    return capacityCheck(capability.founders, volumesByOffering, capability.delivery, planLength(foundation), recurring, names, available);
}
