import type { CalculatedResult } from "./CalculatedLines.ts";
import {
    type LaunchNeed,
    MODEL_MONTHS,
    monthlyEquivalent,
    natureSplitOf,
    preOperationalSchedule,
    type CostLine,
    type CostNature,
    type NatureContext,
    type PreOperationalSchedule
} from "./FinancialModel.ts";
import { settingNumber, targetReserveMonthsOf, type GlobalSettingsValue } from "./GlobalSettings.ts";

/*
    THE FUNDS (cost model, section 14; automatic rules F1 to F6): what has to be raised before the opening, and what is set aside to run on.

    - F1 The Total Pre-operational Budget: CapEx + Startup Expenses + Pre-Operating Expenses, everything dated before the Opening Date except opening stock.
      It is the base of the contingency.
    - F2 The Startup Contingency Fund: 10 to 15% of that budget, already held when operations start.
    - F6 Cash to raise before the opening: the budget + the Startup Contingency + the cash for opening inventory, which is added after the contingency
      calculation as a flat line outside its base.
    - F3 The Operational Contingency Fund: after the launch, each month 3 to 5% of OpEx is added on top of the startup fund until the total equals the target
      reserve months of OpEx (3 by default, a setting). The contribution is a cash set-aside, not an expense.
    - F4 Months to reach the target = (target months x monthly OpEx - startup fund) / (rate x monthly OpEx); zero if the startup fund already equals it.
    - F5 Using the fund (a repair or a stock loss) comes with actual data, a later batch.
*/

export interface ContingencyFunds {
    /** F1: CapEx, Startup Expenses and Pre-Operating Expenses, with the opening stock kept apart. */
    schedule: PreOperationalSchedule;
    /** F2: the rate (a percent) and the fund. */
    startupRate: number;
    startupFund: number;
    /** F6: the budget + the Startup Contingency + opening inventory. */
    cashToRaise: number;
    /** What a month of operation costs in OpEx, and the reserve the Global Settings aim for (months x that). */
    monthlyOpEx: number;
    targetMonths: number;
    target: number;
    /** F3: the monthly rate (a percent) set aside. */
    operationalRate: number;
    /** F4: the months from the opening to reach the target; 0 when the startup fund already equals it, null when it cannot be reached (no OpEx or no rate). */
    monthsToTarget: number | null;
    /** The fund held at the end of each plan month (the startup fund from the opening, plus what was set aside), and what was set aside that month. */
    balance: number[];
    contributions: number[];
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The OpEx of a month of operation: every recurring cost whose nature from the opening is OpEx, as a monthly equivalent, and the calculated OpEx lines
 * (employer on-costs, insurance per employee) of the first operating month. One-time OpEx is not a monthly cost.
 */
export function monthlyOpExOf(lines: readonly CostLine[], context: NatureContext, chosen: Readonly<Record<string, CostNature | undefined>> = {}, calculated?: CalculatedResult): number {
    const recurring = lines.reduce((sum, line) => {
        if (line.amount === null || !line.counted) {
            return sum;
        }
        return natureSplitOf(line, context, chosen[line.id] ?? "").after === "opex" ? sum + monthlyEquivalent(line.amount, line.frequency) : sum;
    }, 0);
    const first = Math.max(0, calculated?.openingIndex ?? 0);
    const calc = calculated ? (calculated.onCosts.values[first] ?? 0) + (calculated.employeeInsurance.values[first] ?? 0) : 0;
    return round(recurring + calc);
}

export function contingencyFunds(
    lines: readonly CostLine[],
    context: NatureContext,
    settings: GlobalSettingsValue,
    chosen: Readonly<Record<string, CostNature | undefined>> = {},
    calculated?: CalculatedResult
): ContingencyFunds {

    const schedule = preOperationalSchedule(lines, context, chosen);
    const startupRate = settingNumber(settings.startupContingencyRate) ?? 0;
    const startupFund = round(schedule.total * startupRate / 100);
    const cashToRaise = round(schedule.total + startupFund + schedule.openingInventory);

    const monthlyOpEx = monthlyOpExOf(lines, context, chosen, calculated);
    const targetMonths = targetReserveMonthsOf(settings);
    const target = round(targetMonths * monthlyOpEx);
    const operationalRate = settingNumber(settings.operationalContingencyRate) ?? 0;
    const perMonth = monthlyOpEx * operationalRate / 100;

    const monthsToTarget = startupFund >= target
        ? 0
        : perMonth > 0 ? Math.ceil((target - startupFund) / perMonth - 1e-9) : null;

    const balance = new Array<number>(MODEL_MONTHS).fill(0);
    const contributions = new Array<number>(MODEL_MONTHS).fill(0);
    const opening = calculated?.openingIndex ?? (context.openingDate === "" ? null : 0);
    let held = 0;
    for (let index = 0; index < MODEL_MONTHS; index++) {
        if (opening !== null && index === Math.max(0, opening)) {
            held = startupFund;
        }
        if (opening !== null && index >= Math.max(0, opening)) {
            const add = Math.min(perMonth, Math.max(0, target - held));
            contributions[index] = round(add);
            held += add;
        }
        balance[index] = round(held);
    }

    return { schedule, startupRate, startupFund, cashToRaise, monthlyOpEx, targetMonths, target, operationalRate, monthsToTarget, balance, contributions };

}

/**
 * THE LAUNCH FOR THE FUNDING NEED: the cash to raise before the opening and the lines it counts, for fundingNeeds and financialPosition. Undefined while
 * there is no Opening Date after the plan's first month, or nothing before it.
 */
export function launchNeedOf(
    lines: readonly CostLine[],
    context: NatureContext,
    settings: GlobalSettingsValue,
    chosen: Readonly<Record<string, CostNature | undefined>> = {},
    calculated?: CalculatedResult
): { launch: LaunchNeed; funds: ContingencyFunds } | undefined {
    const openingIndex = calculated?.openingIndex ?? null;
    if (openingIndex === null || openingIndex <= 0) {
        return undefined;
    }
    const funds = contingencyFunds(lines, context, settings, chosen, calculated);
    const budgetLineIds = new Set(lines
        .filter(line => {
            const before = natureSplitOf(line, context, chosen[line.id] ?? "").before;
            return before !== null && before.amount > 0 && (before.nature === "capex" || before.nature === "startup" || before.nature === "pre-operating" || before.nature === "inventory");
        })
        .map(line => line.id));
    if (funds.cashToRaise <= 0 && budgetLineIds.size === 0) {
        return undefined;
    }
    return {
        funds,
        launch: {
            openingIndex,
            budgetLineIds,
            cashToRaise: funds.cashToRaise,
            parts: [
                { name: "Capital Expenditure", amount: funds.schedule.capex },
                { name: "Startup Expenses", amount: funds.schedule.startup },
                { name: "Pre-Operating Expenses", amount: funds.schedule.preOperating },
                { name: "Startup Contingency Fund (" + funds.startupRate + "%)", amount: funds.startupFund },
                { name: "Opening inventory", amount: funds.schedule.openingInventory }
            ]
        }
    };
}
