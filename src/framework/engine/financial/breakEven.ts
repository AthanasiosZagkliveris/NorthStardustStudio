/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { type LegalEntityValue } from "../AnswerUtils.ts";
import { type FinancialFoundationValue, type FundingSourceValue } from "./stored.ts";
import { isPerUnit, isScheduled, type CostLine } from "./costs.ts";
import { MODEL_MONTHS, monthOrdinal, planLength, planMonthLabel } from "./period.ts";
import { monthlyEquivalent } from "./natures.ts";
import { fundingType, periodMonths, statusStanding } from "./lists.ts";
import { fundingStanding, loanSchedule } from "./funding.ts";
import { type FinancialSustainabilityValue, type RevenueStreamValue } from "./revenueStored.ts";
import { allFunding, cashTimeline, isNonCash, runwayOf, type CashMonth, type Signal } from "./position.ts";
import { monthlyPrice, normalVolume, streamRevenue, streamVariableCost, streamVolumes } from "./revenue.ts";

/* ==========================================================
   Page 5 -- break even
========================================================== */

export interface BreakEvenInputs {
    /** Monthly fixed costs, the sum of the parts below. */
    fixed: number;
    /** When each recurring fixed cost runs, by plan month (1 is the first; `to` null: to the plan's end): a cost counts only from its own Start date, as the cash flow counts it. */
    timeline: { from: number; to: number | null; amount: number }[];
    parts: { label: string; amount: number }[];
    /** Variable cost per unit read from Page 4, by Offering id. */
    variableByOffering: Record<string, number>;
    /** Cost per ORDER, by Offering id: shared by the items in an order. */
    perOrderByOffering: Record<string, number>;
    /** Why the result is an estimate. */
    caveats: string[];
}

/**
 * A number written back as text, to be read by parseAmount again: at
 * most six decimals, and never exactly three (so "1.545" cannot be
 * read as a thousand five hundred and forty-five).
 */
export function numberAsText(value: number): string {
    const text = String(Math.round(value * 1e6) / 1e6);
    return /[.]\d{3}$/.test(text) ? text + "0" : text;
}

/**
 * The costs break even is measured against, from Page 4.
 *
 * FIXED is the monthly equivalent of every recurring cost, plus
 * loan interest -- a financial cost. Loan PRINCIPAL is not a cost
 * at all but repayment of borrowed money, and one-time costs are
 * what the funding on Page 4 is for, so neither is here.
 *
 * VARIABLE, per unit, is every cost paid per project or per unit and
 * linked to an Offering, plus the variable part of a semi-variable
 * cost that has been separated.
 */
export function breakEvenInputs(
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[]
): BreakEvenInputs {

    let fixedCosts = 0;
    let semiFixed = 0;
    let variableAsFixed = 0;
    let interest = 0;
    const variableByOffering: Record<string, number> = {};
    const perOrderByOffering: Record<string, number> = {};
    /* A per-order cost is counted per order; a stream shares it out. */
    const addPerUnit = (line: CostLine, amount: number) => {
        const into = line.frequency === "per-order" ? perOrderByOffering : variableByOffering;
        line.offeringIds.forEach(id => { into[id] = (into[id] ?? 0) + amount; });
    };
    const caveats: string[] = [];

    let unseparated = 0;
    let unassigned = 0;
    let unmodelled = 0;

    const timeline: { from: number; to: number | null; amount: number }[] = [];
    const first = monthOrdinal(foundation.planStart);
    const planMonthOf = (iso: string): number | null => {
        const match = /^(\d{4})-(\d{2})/.exec(iso);
        const ordinal = match ? monthOrdinal({ year: match[1], month: match[2] }) : null;
        return ordinal === null || first === null ? null : ordinal - first + 1;
    };
    /** A recurring monthly amount, from the plan month its cost starts in to the one it ends in. */
    const running = (line: CostLine, amount: number) => {
        const from = line.startDate ? planMonthOf(line.startDate) : null;
        const to = line.endDate ? planMonthOf(line.endDate) : null;
        timeline.push({ from: Math.max(1, from ?? 1), to, amount });
    };

    lines.forEach(line => {

        if (!line.counted || line.amount === null) {
            return;
        }

        if (line.behaviour === "semi-variable") {
            const separated = line.fixedPart !== null || line.variablePerUnit !== null;
            if (!separated) {
                unseparated++;
            }
            if (isPerUnit(line)) {
                if (line.offeringIds.length > 0) {
                    addPerUnit(line, line.amount);
                } else {
                    unassigned++;
                }
            } else {
                const monthlySemi = monthlyEquivalent(separated ? line.fixedPart ?? 0 : line.amount, line.frequency);
                semiFixed += monthlySemi;
                running(line, monthlySemi);
            }
            if (line.variablePerUnit !== null && !isPerUnit(line)) {
                const perUnit = line.variablePerUnit;
                line.offeringIds.forEach(id => { variableByOffering[id] = (variableByOffering[id] ?? 0) + perUnit; });
            }
            return;
        }

        if (isPerUnit(line)) {
            if (line.offeringIds.length > 0) {
                addPerUnit(line, line.amount);
            } else {
                unassigned++;
            }
            return;
        }

        // Usage-based or "Other": neither a month nor a unit to count it against.
        if (!isScheduled(line)) {
            unmodelled++;
            return;
        }

        const monthly = monthlyEquivalent(line.amount, line.frequency);

        running(line, monthly);
        if (line.behaviour === "variable") {
            variableAsFixed += monthly;
        } else {
            fixedCosts += monthly;
        }

    });

    const start = foundation.planStart;

    funding.forEach(source => {
        if (fundingType(source.type)?.nature !== "debt" ||
            statusStanding(source.status || "planned") !== "confirmed") {
            return;
        }
        const schedule = loanSchedule(source, start);
        if (schedule && schedule.payments.length > 0) {
            const first = schedule.payments[0].month;
            const last = schedule.payments[schedule.payments.length - 1].month;
            const span = Math.max(1, last - first + periodMonths(source.loan.frequency));
            interest += schedule.totalInterest / span;
            timeline.push({ from: 1, to: null, amount: schedule.totalInterest / span });
        }
    });

    if (unseparated > 0) {
        caveats.push(unseparated + " semi-variable cost" + (unseparated === 1 ? " is" : "s are") +
            " not separated into fixed and variable parts, and counted in full as fixed.");
    }
    if (variableAsFixed > 0) {
        caveats.push("Variable costs recorded as a periodic amount are counted with the fixed costs.");
    }
    if (unmodelled > 0) {
        caveats.push(unmodelled + " cost" + (unmodelled === 1 ? " is" : "s are") +
            " paid by usage or on an “Other” basis and not counted. On Financial Foundation, say whether each is per unit, per project or periodic.");
    }
    if (unassigned > 0) {
        caveats.push(unassigned + " per-unit cost" + (unassigned === 1 ? " is" : "s are") +
            " not linked to an Offering, so no revenue stream carries " + (unassigned === 1 ? "it" : "them") + ".");
    }

    const parts = [
        { label: "Recurring fixed costs", amount: fixedCosts },
        { label: "Fixed part of semi-variable costs", amount: semiFixed },
        { label: "Variable costs entered as periodic amounts", amount: variableAsFixed },
        { label: "Loan interest", amount: interest }
    ].filter(part => part.amount > 0.005);

    return {
        fixed: fixedCosts + semiFixed + variableAsFixed + interest,
        timeline,
        parts,
        variableByOffering,
        perOrderByOffering,
        caveats
    };

}

export interface StreamAnalysis {
    stream: RevenueStreamValue;
    price: number | null;
    variable: number;
    /** Whether the variable cost is the founder's own figure. */
    variableOverridden: boolean;
    contribution: number | null;
    /** Units a month at the normal level. */
    volume: number;
    /** Revenue a month at the normal level. */
    revenue: number;
    /** Units this Offering alone would need to cover the fixed costs. */
    breakEvenAlone: number | null;
}

export interface SustainabilityResult {
    inputs: BreakEvenInputs;
    streams: StreamAnalysis[];
    /** At the normal level. */
    expectedRevenue: number;
    expectedContribution: number;
    breakEvenRevenue: number | null;
    /** Multiplier of the expected mix that just covers fixed costs. */
    breakEvenScale: number | null;
    months: {
        month: number;
        label: string;
        revenue: number;
        costs: number;
        position: "below" | "at" | "above";
    }[];
    /** First plan month at or above break even; null if not within the plan. */
    breakEvenMonth: number | null;
    /** Funding-only runway, from Page 4. */
    fundingRunway: number | null;
    /** Revenue-adjusted: first month the balance falls below zero. */
    exhaustionMonth: number | null;
    revenueTimeline: CashMonth[];
    buffer: number | null;
    status: "above" | "sustainable" | "risk" | "not-reached" | "no-revenue";
    signals: Signal[];
}

export function sustainability(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): SustainabilityResult {

    const start = foundation.planStart;
    const funding = allFunding(foundation, legalEntity);
    const inputs = breakEvenInputs(foundation, lines, funding);

    const streams: StreamAnalysis[] = page.streams.map(stream => {

        const price = monthlyPrice(stream);
        const variable = streamVariableCost(stream, inputs);
        const contribution = price === null ? null : price - variable;
        const volume = normalVolume(stream);

        return {
            stream,
            price,
            variable,
            variableOverridden: false,
            contribution,
            volume,
            revenue: (price ?? 0) * volume,
            breakEvenAlone: contribution !== null && contribution > 0
                ? inputs.fixed / contribution
                : null
        };

    });

    const expectedRevenue = streams.reduce((sum, entry) => sum + entry.revenue, 0);
    const expectedContribution = streams.reduce(
        (sum, entry) => sum + (entry.contribution ?? 0) * entry.volume, 0);

    // The mix as expected, scaled until its contribution covers the
    // fixed costs: an organisation that sells two things does not
    // break even on either one alone.
    const breakEvenScale = expectedContribution > 0 ? inputs.fixed / expectedContribution : null;
    const breakEvenRevenue = breakEvenScale !== null ? expectedRevenue * breakEvenScale : null;

    /* Month by month. */
    const earned = new Array<number>(MODEL_MONTHS).fill(0);
    const received = new Array<number>(MODEL_MONTHS).fill(0);
    const variableOut = new Array<number>(MODEL_MONTHS).fill(0);

    streams.forEach(entry => {
        const revenue = streamRevenue(entry.stream, start);
        const volumes = streamVolumes(entry.stream, start);
        revenue.earned.forEach((amount, index) => { earned[index] += amount; });
        revenue.received.forEach((amount, index) => { received[index] += amount; });
        volumes.forEach((units, index) => { variableOut[index] += units * entry.variable; });
    });

    // (A fixed cost counts from the month its own Start date falls in, not from the plan's first month: the plan may start earlier, with a registration.)
    const fixedIn = (month: number) => inputs.timeline.reduce((sum, entry) => sum + (month >= entry.from && (entry.to === null || month <= entry.to) ? entry.amount : 0), 0);
    const months = earned.slice(0, planLength(foundation)).map((revenue, index) => {
        const costs = fixedIn(index + 1) + variableOut[index];
        const difference = revenue - costs;
        return {
            month: index + 1,
            label: planMonthLabel(start, index + 1),
            revenue,
            costs,
            position: (revenue <= 0
                ? "below"
                : Math.abs(difference) < 0.5
                    ? "at"
                    : difference > 0 ? "above" : "below") as "below" | "at" | "above"
        };
    });

    const reached = months.findIndex(month => month.position !== "below");
    const breakEvenMonth = reached >= 0 ? reached + 1 : null;

    const fundingOnly = cashTimeline(foundation, lines, funding);
    const fundingRunway = runwayOf(fundingOnly.timeline);

    const adjusted = cashTimeline(foundation, lines, funding, {
        inflow: received,
        outflow: variableOut
    });
    const exhaustionIndex = runwayOf(adjusted.timeline);
    const exhaustionMonth = exhaustionIndex === null ? null : exhaustionIndex + 1;

    let status: SustainabilityResult["status"];
    if (expectedRevenue <= 0 && !earned.some(amount => amount > 0)) {
        status = "no-revenue";
    } else if (breakEvenMonth === 1 && exhaustionMonth === null) {
        status = "above";
    } else if (breakEvenMonth === null) {
        status = "not-reached";
    } else if (exhaustionMonth !== null && exhaustionMonth <= breakEvenMonth) {
        status = "risk";
    } else {
        status = "sustainable";
    }

    const buffer = breakEvenMonth !== null && exhaustionMonth !== null && exhaustionMonth > breakEvenMonth
        ? exhaustionMonth - breakEvenMonth
        : null;

    /* Signals. */
    const signals: Signal[] = [];

    if (status === "no-revenue") {
        signals.push({
            tone: "info",
            title: "Revenue Not Yet Established",
            text: "No revenue is expected under the current assumptions. Break even cannot be reached from revenue" +
                (exhaustionMonth !== null
                    ? ", and available resources are expected to be exhausted in " + planMonthLabel(start, exhaustionMonth) + "."
                    : ", but available resources last beyond the " + planLength(foundation) + "-month plan.")
        });
    } else if (status === "above") {
        signals.push({
            tone: "good",
            title: "Above Break Even",
            text: "Expected revenue already covers the relevant costs from the first month of the plan."
        });
    } else if (status === "not-reached") {
        signals.push({
            tone: "risk",
            title: "Break Even Not Reached",
            text: "The current revenue assumptions do not show a path to break even within the " +
                planLength(foundation) + "-month plan."
        });
    } else if (status === "risk") {
        signals.push({
            tone: "risk",
            title: "Financial Risk",
            text: "Available resources are expected to be exhausted in " +
                planMonthLabel(start, exhaustionMonth ?? 1) + ", before break even in " +
                planMonthLabel(start, breakEvenMonth ?? 1) +
                ". Additional funding, lower costs, earlier revenue, higher prices or greater volume may be needed."
        });
    } else {
        signals.push({
            tone: "good",
            title: "Sustainable Before Financial Exhaustion",
            text: "Break even is expected in " + planMonthLabel(start, breakEvenMonth ?? 1) +
                (exhaustionMonth === null
                    ? ", and available resources last beyond the " + planLength(foundation) + "-month plan."
                    : ", " + (buffer ?? 0) + " month" + (buffer === 1 ? "" : "s") +
                        " before available resources are expected to be exhausted.")
        });
    }

    if (buffer !== null && buffer <= 2) {
        signals.push({
            tone: "caution",
            title: "Limited Sustainability Buffer",
            text: "Only " + buffer + " month" + (buffer === 1 ? "" : "s") +
                " separate expected break even from financial exhaustion."
        });
    }

    streams.forEach(entry => {
        if (entry.contribution !== null && entry.contribution <= 0) {
            signals.push({
                tone: "risk",
                title: "No Contribution",
                text: "A revenue stream's price does not cover its own variable cost per unit (" +
                    format(entry.contribution) + " per unit), so more volume cannot bring it to break even."
            });
        }
    });

    const fundingPlanned = funding.filter(source => !isNonCash(source)).map(source => fundingStanding(source, start));
    const pending = fundingPlanned.reduce((sum, entry) => sum + entry.pending, 0);
    const all = fundingPlanned.reduce((sum, entry) => sum + entry.total, 0);
    if (all > 0 && pending / all >= 0.5) {
        signals.push({
            tone: "caution",
            title: "Funding Dependency",
            text: "Much of the financing this assessment relies on (" + Math.round(pending / all * 100) +
                "%) is not yet confirmed, and is not counted until it is."
        });
    }

    return {
        inputs, streams, expectedRevenue, expectedContribution,
        breakEvenRevenue, breakEvenScale, months, breakEvenMonth,
        fundingRunway, exhaustionMonth, revenueTimeline: adjusted.timeline,
        buffer, status, signals
    };

}
