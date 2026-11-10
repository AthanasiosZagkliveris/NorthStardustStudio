/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { type CostFrequency } from "./lists.ts";
import { isPerUnit, isScheduled, type CostLine } from "./costs.ts";
import { monthlyEquivalent } from "./natures.ts";

/* ==========================================================
   One Offering's costs
========================================================== */

interface OfferingCosts {
    /** Paid for each unit or project sold. */
    perUnit: { name: string; amount: number; basis: "unit" | "order" | "project" | "variable part" }[];
    /** Paid every period, whatever is sold. */
    recurring: { name: string; monthly: number; frequency: CostFrequency; amount: number }[];
    oneTime: { name: string; amount: number }[];
    variablePerUnit: number;
    fixedMonthly: number;
    oneTimeTotal: number;
}

/**
 * What one Offering costs, from its own lines on Financial Foundation
 * (those recorded on Page 3's Offering's Capability): what each sale
 * costs, what it costs every month regardless, and what it cost to
 * set up. The same figures break even is measured with, per Offering.
 */
export function offeringCosts(lines: CostLine[], offeringId: string): OfferingCosts {

    const result: OfferingCosts = {
        perUnit: [], recurring: [], oneTime: [],
        variablePerUnit: 0, fixedMonthly: 0, oneTimeTotal: 0
    };

    lines.forEach(line => {

        if (!line.offeringIds.includes(offeringId) || !line.counted || line.amount === null) {
            return;
        }

        // A cost several Offerings share is shared out by the shares of the card (equally where it gives none).
        const share = line.offeringShares?.[offeringId] ?? 1 / line.offeringIds.length;
        const shared = line.offeringIds.length > 1 ? " (shared)" : "";

        if (isPerUnit(line)) {
            result.perUnit.push({
                name: line.name,
                amount: line.amount,
                basis: line.frequency === "per-project" ? "project" : line.frequency === "per-order" ? "order" : "unit"
            });
            if (line.frequency !== "per-order") {
                result.variablePerUnit += line.amount;
            }
            return;
        }

        if (line.frequency === "one-time") {
            result.oneTime.push({ name: line.name + shared, amount: line.amount * share });
            result.oneTimeTotal += line.amount * share;
            return;
        }

        if (!isScheduled(line)) {
            return;
        }

        // A semi-variable cost, once separated: its fixed part a
        // month, its variable part with each unit.
        const separated = line.behaviour === "semi-variable" &&
            (line.fixedPart !== null || line.variablePerUnit !== null);
        const fixedAmount = separated ? line.fixedPart ?? 0 : line.amount;

        if (fixedAmount > 0) {
            const monthly = monthlyEquivalent(fixedAmount, line.frequency) * share;
            result.recurring.push({ name: line.name + shared, monthly, frequency: line.frequency, amount: fixedAmount * share });
            result.fixedMonthly += monthly;
        }

        if (separated && line.variablePerUnit !== null && line.variablePerUnit > 0) {
            result.perUnit.push({ name: line.name, amount: line.variablePerUnit, basis: "variable part" });
            result.variablePerUnit += line.variablePerUnit;
        }

    });

    return result;

}
