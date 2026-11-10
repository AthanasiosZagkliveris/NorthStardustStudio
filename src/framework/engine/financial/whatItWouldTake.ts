/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { type BusinessCapabilityValue, type BusinessResourceSlotValue, type LegalEntityValue } from "../AnswerUtils.ts";
import { assetUnitCost, isSpaceOnlyGroup, isCostingStatus, isPurchaseGroup } from "../AnswerUtils.ts";
import { type FinancialSustainabilityValue } from "./revenueStored.ts";
import { type FinancialFoundationValue } from "./stored.ts";
import { type CostLine } from "./costs.ts";
import { planCase, withFundingSought } from "./stressTest.ts";
import { type WhatIf } from "./revenue.ts";
import { planMonthLabel } from "./period.ts";

/* ==========================================================
   Page 5 -- what it would take
========================================================== */

/*
    WHAT IT WOULD TAKE: the smallest single change that keeps the cash
    at zero or above through the plan, each on its own with everything
    else as planned, on the stress test's footing (the funding being
    sought counted). Where the plan already holds, the same search
    says how much room it has.

    Each answer is found by halving the range until it is known to a
    whole percent or month: more of a lever never makes the cash worse,
    so the smallest change that works is where it starts to.
*/

interface WhatItWouldTake {
    sought: number;
    /** The plan as it stands holds: no change is needed. */
    holds: boolean;
    /** Money still needed, and the month the cash first falls short. */
    shortfall: number;
    shortBy: string;
    /** Each lever on its own, in percent or months; null when no change within reach would do. */
    prices: number | null;
    sales: number | null;
    costs: number | null;
    earlier: number | null;
    /** Where the plan holds: how far each could go against it. */
    room: { sales: number; later: number; costs: number } | null;
}

/** The smallest whole step in [low, high] for which works() is true; null if none. */
function smallest(low: number, high: number, works: (value: number) => boolean): number | null {
    if (!works(high)) {
        return null;
    }
    let bad = low;
    let good = high;
    while (good - bad > 1) {
        const middle = Math.floor((bad + good) / 2);
        if (works(middle)) {
            good = middle;
        } else {
            bad = middle;
        }
    }
    return good;
}

export function whatItWouldTake(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): WhatItWouldTake {

    const { sought, foundation: withSought } = withFundingSought(foundation);
    const run = (change: Partial<WhatIf>, costs = 0) =>
        planCase(page, withSought, lines, legalEntity, format, { price: 0, volume: 0, delay: 0, ...change }, costs);
    const holdsWith = (change: Partial<WhatIf>, costs = 0) => run(change, costs).shortfall <= 0.5;

    const planned = run({});
    const holds = planned.shortfall <= 0.5;
    const hasRevenue = page.streams.length > 0;

    if (holds) {
        // How far each could go against the plan before the cash falls short.
        const give = (high: number, fails: (value: number) => boolean) => {
            const first = smallest(0, high, fails);
            return first === null ? high : Math.max(0, first - 1);
        };
        return {
            sought, holds, shortfall: 0, shortBy: "",
            prices: null, sales: null, costs: null, earlier: null,
            room: {
                sales: hasRevenue ? give(100, value => !holdsWith({ volume: -value })) : 0,
                later: hasRevenue ? give(24, value => !holdsWith({ delay: value })) : 0,
                costs: give(200, value => !holdsWith({}, value))
            }
        };
    }

    const firstShort = planned.exhaustionMonth;
    return {
        sought,
        holds,
        shortfall: planned.shortfall,
        shortBy: firstShort === null ? planned.lowestLabel : planMonthLabel(foundation.planStart, firstShort),
        prices: hasRevenue ? smallest(0, 300, value => holdsWith({ price: value })) : null,
        sales: hasRevenue ? smallest(0, 300, value => holdsWith({ volume: value })) : null,
        costs: smallest(0, 100, value => holdsWith({}, -value)),
        earlier: hasRevenue ? smallest(0, 12, value => holdsWith({ delay: -value })) : null,
        room: null
    };

}

/** The cost of one unit with its linked services, for each asset card (what the capitalisation limit is tested on). */
export function assetUnitCostsOf(capability: BusinessCapabilityValue): Record<string, number> {
    const costs: Record<string, number> = {};
    const add = (slot: BusinessResourceSlotValue, groupId: string) => {
        if (isCostingStatus(slot.status) && (isPurchaseGroup(groupId) || (isSpaceOnlyGroup(groupId) && slot.status === "buy"))) {
            const cost = assetUnitCost(capability, slot);
            if (cost !== null) {
                costs[slot.id] = cost;
            }
        }
    };
    Object.values(capability.resources).forEach(subsections => subsections.forEach(subsection => subsection.slots.forEach(slot => add(slot, subsection.id))));
    capability.offering.resources.forEach(slot => add(slot, slot.group));
    return costs;
}
