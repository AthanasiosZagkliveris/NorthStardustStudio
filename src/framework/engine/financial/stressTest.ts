/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount } from "../Amounts.ts";
import { type LegalEntityValue } from "../AnswerUtils.ts";
import { type WhatIf, withWhatIf } from "./revenue.ts";
import { type CostLine } from "./costs.ts";
import { type FinancialFoundationValue } from "./stored.ts";
import { isNonCash, type CashMonth } from "./position.ts";
import { statusStanding } from "./lists.ts";
import { type FinancialSustainabilityValue } from "./revenueStored.ts";
import { sustainability } from "./breakEven.ts";

/* ==========================================================
   Page 5 -- the stress test
========================================================== */

/*
    THE STRESS TEST A LENDER RUNS: the plan as it stands, and the same
    plan when things go worse than hoped, one at a time and then
    together. Nothing is chosen or saved: the scenarios are fixed, so
    the answer is the same for everyone who reads it.

    The funding being sought (pending sources) is counted as if it
    arrives as planned, repayments included: the question a lender
    asks is whether the plan holds WITH the money requested.
*/

interface StressScenario {
    id: string;
    label: string;
    breakEvenMonth: number | null;
    /** First month the cash falls below zero; null if it never does. */
    exhaustionMonth: number | null;
    /** The lowest cash balance in the plan, and when. */
    lowest: number;
    lowestLabel: string;
    /** How much more money would keep the cash at zero or above. */
    shortfall: number;
}

interface StressTest {
    /** The funding being sought, counted in every scenario. */
    sought: number;
    scenarios: StressScenario[];
}

const STRESS_CASES: { id: string; label: string; change: WhatIf; costs: number; lag: number }[] = [
    { id: "planned", label: "As planned", change: { price: 0, volume: 0, delay: 0 }, costs: 0, lag: 0 },
    { id: "sales", label: "Sales 20% lower", change: { price: 0, volume: -20, delay: 0 }, costs: 0, lag: 0 },
    { id: "delay", label: "Revenue 3 months later", change: { price: 0, volume: 0, delay: 3 }, costs: 0, lag: 0 },
    { id: "costs", label: "Costs 10% higher", change: { price: 0, volume: 0, delay: 0 }, costs: 10, lag: 0 },
    { id: "late", label: "Customers pay 1 month later", change: { price: 0, volume: 0, delay: 0 }, costs: 0, lag: 1 },
    { id: "downside", label: "All four together", change: { price: 0, volume: -20, delay: 3 }, costs: 10, lag: 1 }
];

/** A cost made dearer by a factor. Founders' pay is theirs to set, so it stays. */
function dearer(line: CostLine, factor: number): CostLine {
    if (factor === 1 || line.sourcePath.includes("resource-group-founders")) {
        return line;
    }
    const times = (value: number | null) => value === null ? null : value * factor;
    return {
        ...line,
        amount: times(line.amount),
        unitAmount: times(line.unitAmount),
        fixedPart: times(line.fixedPart),
        variablePerUnit: times(line.variablePerUnit)
    };
}

/** The funding being sought (pending sources), and the plan with it counted as arriving. */
export function withFundingSought(foundation: FinancialFoundationValue): { sought: number; foundation: FinancialFoundationValue } {
    const sought = foundation.funding
        .filter(source => !isNonCash(source) && statusStanding(source.status || "planned") !== "confirmed")
        .reduce((sum, source) => sum + (parseAmount(source.amount) ?? 0), 0);
    return {
        sought,
        foundation: {
            ...foundation,
            funding: foundation.funding.map(source =>
                statusStanding(source.status || "planned") === "confirmed" ? source : { ...source, status: "approved" as const })
        }
    };
}

/** One case of the plan: its break even, and its cash at the lowest. */
export function planCase(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string,
    change: WhatIf,
    /** Percent change in every cost, founders' pay aside. */
    costs: number,
    /** Months later that customers pay. */
    lag = 0
): Omit<StressScenario, "id" | "label"> {
    const changed = withWhatIf(page, change, foundation.planStart);
    const result = sustainability(
        lag > 0 ? { ...changed, streams: changed.streams.map(stream => ({ ...stream, receiptLag: lag })) } : changed,
        foundation,
        lines.map(line => dearer(line, 1 + costs / 100)),
        legalEntity,
        format
    );
    const low = result.revenueTimeline.reduce(
        (lowest, month) => month.balance < lowest.balance ? month : lowest,
        { balance: Infinity, label: "" } as Pick<CashMonth, "balance" | "label">);
    const lowest = Number.isFinite(low.balance) ? low.balance : 0;
    return {
        breakEvenMonth: result.breakEvenMonth,
        exhaustionMonth: result.exhaustionMonth,
        lowest,
        lowestLabel: low.label,
        shortfall: Math.max(0, -lowest)
    };
}

export function stressTest(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): StressTest {

    // The funding being sought, as if it arrived as planned.
    const { sought, foundation: withSought } = withFundingSought(foundation);

    const scenarios = STRESS_CASES.map(test => ({
        id: test.id,
        label: test.label,
        ...planCase(page, withSought, lines, legalEntity, format, test.change, test.costs, test.lag)
    }));

    return { sought, scenarios };

}
