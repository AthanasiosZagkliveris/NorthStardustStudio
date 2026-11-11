/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount } from "../Amounts.ts";
import { type LegalEntityValue, type StrategyMonthValue } from "../AnswerUtils.ts";
import { COST_FREQUENCIES, FUNDING_NEED_CATEGORIES, FUNDING_STATUSES, PERIOD_FREQUENCIES, fundingType, statusStanding, type CostGroup, type FundingNature, type FundingNeedCategory, type PeriodFrequency } from "./lists.ts";
import { asFinancialFoundationValue, incomeTaxMissing, type FinancialFoundationValue, type FundingSourceValue, type VatBasis } from "./stored.ts";
import { founderCapitalSources, fundingStanding, loanSchedule, type LoanSchedule } from "./funding.ts";
import { costSchedule, isScheduled, spentBeforePlan, type CostLine } from "./costs.ts";
import { MODEL_MONTHS, monthOrdinal, planLength, planMonthLabel } from "./period.ts";
import { type FinancialSustainabilityValue } from "./revenueStored.ts";
import { moneyFormatter } from "./presenting.ts";
import { breakEvenInputs } from "./breakEven.ts";
import { streamRevenue, streamVariableCost, streamVolumes } from "./revenue.ts";

/* ==========================================================
   Page 4 -- the financial position
========================================================== */

export interface CashMonth {
    /** 1-based. */
    month: number;
    label: string;
    inflow: number;
    outflow: number;
    /** Of the outflow, what repays loans (principal and interest). */
    loanRepayment: number;
    /** Balance at the end of the month. */
    balance: number;
}

interface Obligation {
    month: number;
    label: string;
    what: string;
    amount: number;
    direction: "in" | "out";
}

export interface Signal {
    tone: "risk" | "caution" | "good" | "info";
    title: string;
    text: string;
}

interface FinancialPosition {
    currency: string;
    need: number;
    availableNow: number;
    confirmedFuture: number;
    pending: number;
    /** The need less money in hand and confirmed money arriving within the plan. */
    gap: number;
    /**
     * With the funding being sought (pending sources) counted as if it
     * arrived as planned, repayments included: what is still short, and
     * when. Null when nothing is pending.
     */
    sought: { amount: number; shortfall: number; lowestLabel: string } | null;
    /** Months the balance stays at or above zero; null if it never falls within the plan. */
    runwayMonths: number | null;
    /** Whether anything is scheduled to leave at all -- without it, runway means nothing. */
    hasOutflows: boolean;
    timeline: CashMonth[];
    /** By funding nature, confirmed and pending. */
    mix: { nature: FundingNature; label: string; confirmed: number; pending: number }[];
    /** The Funding Need, calculated, by category. */
    needs: CalculatedNeed[];
    /** Per Funding Need, how much linked funding covers it. */
    coverage: { id: string; name: string; need: number; linked: number }[];
    obligations: Obligation[];
    signals: Signal[];
    loans: { source: FundingSourceValue; schedule: LoanSchedule }[];
    /** Costs in the list but left out of the timeline, and why. */
    uncounted: { currency: CostLine[]; unscheduled: CostLine[]; unreadable: CostLine[] };
    /** In-kind contributions: worth this, and not cash. */
    nonCash: number;
    /** Costs that look like the same thing recorded in two places. */
    duplicates: [CostLine, CostLine][];
}

/** Words too common to say two costs are the same thing. */
const COMMON_WORDS = new Set([
    "salary", "cost", "costs", "fees", "service", "services", "annual", "monthly",
    "studio", "office", "other", "general", "the", "and", "for", "with"
]);

/** A cost's name as words: lower case, without a bracketed note, letters and digits only. */
function nameWords(name: string): string[] {
    return name.toLowerCase()
        .replace(/\([^)]*\)/g, " ")
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
}

/** The words of a name that say what it is (not "annual", "services"…, nor a short word). */
function significantWords(name: string): Set<string> {
    return new Set(nameWords(name).filter(word => word.length >= 3 && !COMMON_WORDS.has(word)));
}

/**
 * Whether two cost names are similar enough to be one cost. Conservative:
 * NOT merely a shared leading word. True when, ignoring case, bracketed
 * notes and punctuation, (1) the names are equal, or (2) one is the other
 * with words added whole ("Workspace" in "Workspace deposit"), or (3) the
 * words that say what they are overlap by at least 60% (Jaccard).
 * "Trade mark registration" and "Trade fair stand" share only "trade": 20%.
 */
export function similarCostNames(one: string, other: string): boolean {
    const a = nameWords(one).join(" ");
    const b = nameWords(other).join(" ");
    if (!a || !b) {
        return false;
    }
    if (a === b || (" " + a + " ").includes(" " + b + " ") || (" " + b + " ").includes(" " + a + " ")) {
        return true;
    }
    const x = significantWords(one);
    const y = significantWords(other);
    if (x.size === 0 || y.size === 0) {
        return false;
    }
    const shared = [...x].filter(word => y.has(word)).length;
    return shared / (x.size + y.size - shared) >= 0.6;
}

/** The page and section a cost was recorded under: "Infrastructure → Digital" of a longer label. */
function costSection(line: CostLine): string {
    return line.sourceLabel.split(" → ").slice(0, 2).join(" → ");
}

/**
 * Whether two cost lines originate from the same source: the same card
 * or record (one id), or the same page and section ("Infrastructure →
 * Digital" and "Infrastructure → Digital → Domains"; "Legal Entity →
 * Expenses"). Across different pages the only connection the data holds
 * is the founder having NAMED the two the same, so then the names must be
 * equal (ignoring case, brackets and punctuation), not merely similar:
 * a Legal Entity expense "Accountant" and a Capability card "Accountant".
 */
export function sameCostSource(one: CostLine, other: CostLine): boolean {
    if (one.id === other.id || (one.sourcePath[0] && one.sourcePath[0] === other.sourcePath[0])) {
        return true;
    }
    if (costSection(one) === costSection(other)) {
        return true;
    }
    return nameWords(one.name).join(" ") === nameWords(other.name).join(" ");
}

/**
 * Pairs of costs that are probably ONE cost recorded twice. ALL of:
 *
 * (a) SIMILAR NAMES (similarCostNames): equal, one the other plus whole
 *     words, or at least 60% of their significant words shared;
 * (b) THE SAME PRICE AND FREQUENCY: the same counted amount (after
 *     quantity, to the cent), in the same currency, paid at the same
 *     frequency (an "Other" frequency, the same words);
 * (c) THE SAME SOURCE (sameCostSource): the same record, the same page
 *     and section, or -- across pages -- equal names.
 *
 * Said, not decided: only the founder knows if it is really twice.
 */
export function possibleDuplicates(lines: CostLine[]): [CostLine, CostLine][] {
    const priced = lines.filter(line => line.counted && line.amount !== null && line.amount > 0);
    const pairs: [CostLine, CostLine][] = [];
    priced.forEach((line, index) => {
        priced.slice(index + 1).forEach(other => {
            if (
                similarCostNames(line.name, other.name) &&
                Math.round(line.amount! * 100) === Math.round(other.amount! * 100) &&
                line.currency === other.currency &&
                line.frequency === other.frequency &&
                (line.frequency !== "other" ||
                    line.frequencyOther.trim().toLowerCase() === other.frequencyOther.trim().toLowerCase()) &&
                sameCostSource(line, other)
            ) {
                pairs.push([line, other]);
            }
        });
    });
    return pairs;
}

const NATURE_LABELS: Record<FundingNature, string> = {
    "capital": "Founder's & Own Capital",
    "non-repayable": "Grants & Non-repayable",
    "equity": "Investment (Equity)",
    "debt": "Loans (Debt)",
    "other": "Other"
};

/**
 * The cash the plan starts with and every month after it: what has
 * arrived (less what was spent before the plan), plus confirmed money
 * as it is scheduled to arrive, less every scheduled cost and loan
 * repayment. Pending funding is NOT counted: planned money is not
 * money.
 *
 * `extra` lets Page 5 lay revenue (in) and variable costs (out) over
 * the same months.
 */
export function cashTimeline(
    value: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[],
    extra?: { inflow: number[]; outflow: number[] }
): { timeline: CashMonth[]; opening: number } {

    const start = value.planStart;

    const inflow = new Array<number>(MODEL_MONTHS).fill(0);
    const outflow = new Array<number>(MODEL_MONTHS).fill(0);
    const loanOut = new Array<number>(MODEL_MONTHS).fill(0);

    let opening = 0;

    funding.forEach(source => {

        if (isNonCash(source)) {
            return;
        }

        const standing = fundingStanding(source, start);

        opening += standing.received;

        if (standing.confirmedFuture > 0) {
            standing.future.forEach(arrival => {
                if (arrival.month <= MODEL_MONTHS) {
                    inflow[arrival.month - 1] += arrival.amount;
                }
            });
        }

        // A loan's repayments are owed once it is confirmed.
        if (fundingType(source.type)?.nature === "debt" &&
            statusStanding(source.status || "planned") === "confirmed") {
            loanSchedule(source, start)?.payments.forEach(payment => {
                if (payment.month <= MODEL_MONTHS) {
                    outflow[payment.month - 1] += payment.payment;
                    loanOut[payment.month - 1] += payment.payment;
                }
            });
        }

    });

    lines.forEach(line => {
        costSchedule(line, start).forEach((amount, index) => {
            outflow[index] += amount;
        });
    });

    if (extra) {
        extra.inflow.forEach((amount, index) => { inflow[index] += amount; });
        extra.outflow.forEach((amount, index) => { outflow[index] += amount; });
    }

    // What was paid before the plan came out of that money.
    opening -= spentBeforePlan(lines, start);

    let balance = opening;

    // Calculated over the whole model, shown over the plan.
    const timeline = inflow.slice(0, planLength(value)).map((incoming, index) => {
        balance += incoming - outflow[index];
        return {
            month: index + 1,
            label: planMonthLabel(start, index + 1),
            inflow: incoming,
            outflow: outflow[index],
            loanRepayment: loanOut[index],
            balance
        };
    });

    return { timeline, opening };

}

/**
 * An in-kind contribution -- a donated loom, free use of a space -- is
 * worth something but is not money: it never pays a bill, so it is
 * recorded and shown, and left out of every cash figure.
 */
export function isNonCash(source: FundingSourceValue): boolean {
    return source.type === "in-kind";
}

/** Months until the balance first falls below zero; null if it never does. */
export function runwayOf(timeline: CashMonth[]): number | null {
    const index = timeline.findIndex(month => month.balance < -0.005);
    return index < 0 ? null : index;
}

/** The VAT basis in force: as chosen, or as the Legal Entity implies. */
export function effectiveVatBasis(value: FinancialFoundationValue, legalEntity: LegalEntityValue): VatBasis {
    // (Registered, or not, is answered once, on the Legal Entity: not registered there is no tax to include or leave out. Registered, the choice is including or excluding.)
    if (legalEntity.tax.consumptionTaxStatus !== "yes") {
        return "not-registered";
    }
    return value.vatBasis === "including" ? "including" : "excluding";
}

/**
 * One Funding Need, calculated: never typed. Its id is its category's,
 * so a funding source can say which need it is for.
 */
export interface CalculatedNeed {
    id: FundingNeedCategory;
    label: string;
    amount: number;
    /** What makes up the amount, for the founder to check it by. */
    parts: { name: string; amount: number; when: string }[];
    /** When the money is needed: a month, or a span of months. */
    when: string;
    note: string;
    /** The Operating need's first year, month by month. */
    months?: OperatingMonth[];
}

/**
 * WHAT HAS TO BE RAISED BEFORE THE OPENING, for the Funding Need (ContingencyFunds.ts, launchNeedOf): the Total Pre-operational Budget, the Startup
 * Contingency Fund and the cash for opening inventory replace the one-time costs of the Establishment need, and what they count is not counted again.
 */
export interface LaunchNeed {
    /** The plan month the business opens in (0-based; later than the first). */
    openingIndex: number;
    /** The lines whose cost before the opening is in the budget: their one-time cost, and their months before the opening, are not in the other needs. */
    budgetLineIds: ReadonlySet<string>;
    /** What the cash to raise is made of. */
    parts: { name: string; amount: number }[];
    cashToRaise: number;
}

interface OperatingMonth {
    label: string;
    /** Running costs: every recurring cost paid this month. */
    costs: number;
    /** The costs of what is sold this month. */
    variable: number;
    loans: number;
    /** Revenue received this month. */
    revenue: number;
    net: number;
    /** The running total from the plan's start. */
    cumulative: number;
    /** New money needed this month: how much deeper the total falls. */
    needed: number;
}

const NEED_BY_GROUP: Record<CostGroup, FundingNeedCategory> = {
    establishment: "establishment",
    operating: "establishment",
    offering: "offering-launch"
};

/** A loan: a funding source of the debt kind, whatever its status. */
export function isLoan(source: FundingSourceValue): boolean {
    return fundingType(source.type)?.nature === "debt";
}

/** Whether any loan is recorded: without one, no Loan Repayments column or line is shown. */
export function hasLoans(funding: FundingSourceValue[]): boolean {
    return funding.some(isLoan);
}

const REPAYMENT_EVERY: Record<PeriodFrequency, { adjective: string; unit: string }> = {
    monthly: { adjective: "monthly", unit: "a month" },
    quarterly: { adjective: "quarterly", unit: "a quarter" },
    annually: { adjective: "annual", unit: "a year" }
};

/** The line under every loan's own, in the Loan Repayments note. */
export const LOAN_REPAYMENTS_RULE =
    "Only loans that are Approved / Agreed, Received / Available or Completed / Closed are repaid in this table. " +
    "A pending loan's repayments are counted only with the funding being sought: in Financial Position below, " +
    "and in the Stress Test on Sustainability.";

/**
 * THE LOAN REPAYMENTS COLUMN, EXPLAINED FROM THE DATA: each loan, its
 * status as the Status picker names it, and whether its repayments
 * are counted -- then the rule that decides it. Empty when no loan is
 * recorded, and then there is no column to explain.
 *
 *   "SBA Microloan (Requested / Applied): its $470 monthly repayments
 *    are not counted until it is approved."
 *   "Start Up Loan (Approved / Agreed): $305 a month from Mar 2027,
 *    counted here."
 */
export function loanRepaymentNotes(
    funding: FundingSourceValue[],
    start: StrategyMonthValue,
    format: (amount: number) => string
): string[] {

    const loans = funding.filter(isLoan);
    if (loans.length === 0) {
        return [];
    }

    return [
        ...loans.map(source => {
            const status = source.status || "planned";
            const head = (source.name.trim() || fundingType(source.type)?.label || "Loan") + " (" +
                (FUNDING_STATUSES.find(entry => entry.id === status)?.label ?? "Planned") + "): ";
            const schedule = loanSchedule(source, start);
            const every = REPAYMENT_EVERY[source.loan.frequency] ?? REPAYMENT_EVERY.monthly;
            if (statusStanding(status) === "confirmed") {
                return schedule?.firstRepayment
                    ? head + format(schedule.firstPayment) + " " + every.unit + " from " +
                        planMonthLabel(start, schedule.firstRepayment.month) + ", counted here."
                    : head + "its repayment terms are not complete, so no repayments are counted.";
            }
            return head + (schedule
                ? "its " + format(schedule.firstPayment) + " " + every.adjective + " repayments are"
                : "its repayments are") + " not counted until it is approved.";
        }),
        LOAN_REPAYMENTS_RULE
    ];

}

/**
 * THE FUNDING NEED, FROM WHAT IS ALREADY RECORDED.
 *
 * - Establishment, Offering and Other: every one-time cost in the
 *   matching cost group, when it is paid.
 * - Operating: the money needed to keep going
 *   until revenue covers the running costs. Month by month, every
 *   recurring cost, the variable costs of what is sold, and the
 *   repayments of confirmed loans, less the revenue received (from
 *   Sustainability); the need is the deepest the running
 *   total falls over the whole plan (its first year shown month by
 *   month). With no revenue recorded, it is every running cost over
 *   the plan, and says so.
 */
export function fundingNeeds(
    value: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    revenuePage?: FinancialSustainabilityValue,
    format: (amount: number) => string = moneyFormatter("")
    ,
    /** With an Opening Date: the cash to raise before it, which the Establishment need is. */
    launch?: LaunchNeed
): CalculatedNeed[] {

    const start = value.planStart;
    const length = planLength(value);
    const funding = allFunding(value, legalEntity);

    const oneTime: Record<FundingNeedCategory, CalculatedNeed["parts"]> = {
        "establishment": [], "initial-operating": [], "offering-launch": []
    };
    const firstMonth: Record<string, number> = {};
    const lastMonth: Record<string, number> = {};

    const outflow = new Array<number>(MODEL_MONTHS).fill(0);

    lines.forEach(line => {
        if (!line.counted || line.amount === null || !isScheduled(line)) {
            return;
        }
        const schedule = costSchedule(line, start);
        const inBudget = launch !== undefined && launch.budgetLineIds.has(line.id);
        if (inBudget && line.frequency === "one-time") {
            return;
        }
        if (line.frequency === "one-time") {
            const category = NEED_BY_GROUP[line.group];
            const index = schedule.findIndex(amount => amount > 0);
            if (index < 0 || index >= length) {
                return;
            }
            oneTime[category].push({ name: line.name, amount: schedule[index], when: planMonthLabel(start, index + 1) });
            firstMonth[category] = Math.min(firstMonth[category] ?? index, index);
            lastMonth[category] = Math.max(lastMonth[category] ?? index, index);
            return;
        }
        // (A cost in the budget counts its months before the opening there, not in the running costs.)
        schedule.forEach((amount, index) => { outflow[index] += inBudget && index < launch.openingIndex ? 0 : amount; });
    });

    /* Running costs: loans, and what selling costs and brings in. */
    const loanOut = new Array<number>(MODEL_MONTHS).fill(0);
    funding.forEach(source => {
        if (fundingType(source.type)?.nature === "debt" &&
            statusStanding(source.status || "planned") === "confirmed") {
            loanSchedule(source, start)?.payments.forEach(payment => {
                if (payment.month <= MODEL_MONTHS) {
                    loanOut[payment.month - 1] += payment.payment;
                }
            });
        }
    });

    const streams = revenuePage?.streams ?? [];
    const { inflow: received, outflow: variableOut } = revenueFlows(value, lines, funding, revenuePage);

    /*
        THE FIRST YEAR, MONTH BY MONTH: what goes out to keep running,
        what comes in from sales, and the running total. The money
        needed in a month is how much deeper that total falls than it
        has been before; the requirement is their sum, the deepest the
        total falls in the year.
    */
    const yearLength = Math.min(12, length);
    const operatingMonths: OperatingMonth[] = [];
    let running = 0;
    let lowest = 0;
    let lastNeeded = -1;
    for (let index = 0; index < yearLength; index++) {
        const costs = outflow[index];
        const variable = variableOut[index];
        const loans = loanOut[index];
        const revenue = received[index];
        const net = revenue - costs - variable - loans;
        running += net;
        const needed = Math.max(0, lowest - running);
        if (needed > 0.005) {
            lastNeeded = index;
        }
        lowest = Math.min(lowest, running);
        operatingMonths.push({
            label: planMonthLabel(start, index + 1),
            costs, variable, loans, revenue, net,
            cumulative: running,
            needed
        });
    }

    /* After the first year: does the total keep falling? The need
       covers the whole plan, so a deeper point later is counted. */
    let later = running;
    let laterLowest = lowest;
    let laterIndex = -1;
    for (let index = yearLength; index < length; index++) {
        later += received[index] - outflow[index] - variableOut[index] - loanOut[index];
        if (later < laterLowest - 0.005) {
            laterLowest = later;
            laterIndex = index;
        }
    }
    const firstYearLowest = lowest;
    lowest = laterLowest;

    const span = (from: number, to: number) => from === to
        ? planMonthLabel(start, from + 1)
        : planMonthLabel(start, from + 1) + " – " + planMonthLabel(start, to + 1);

    const operatingNote = lastNeeded < 0
        ? "Revenue covers the running costs from the start."
        : (streams.length === 0
            ? "No expected revenue is recorded on Sustainability yet, so every running cost is counted. "
            : "") +
            (laterIndex >= 0
                ? "After the first year the running total falls a further " + format(firstYearLowest - laterLowest) +
                    ", to its lowest in " + planMonthLabel(start, laterIndex + 1) + ": that is counted in this need."
                : "");

    return FUNDING_NEED_CATEGORIES.map(category => {

        if (category.id === "initial-operating") {
            return {
                id: category.id,
                label: category.label,
                amount: -lowest,
                parts: [],
                months: operatingMonths,
                when: lastNeeded < 0 && laterIndex < 0 ? "" : span(0, Math.max(lastNeeded, laterIndex)),
                note: operatingNote.trim()
            };
        }

        const parts = oneTime[category.id];
        if (launch && category.id === "establishment") {
            const kept = parts.reduce((sum, part) => sum + part.amount, 0);
            return {
                id: category.id,
                label: category.label,
                amount: launch.cashToRaise + kept,
                parts: [...launch.parts.filter(part => part.amount > 0.005).map(part => ({ ...part, when: "Before " + planMonthLabel(start, launch.openingIndex + 1) })), ...parts],
                when: "Before " + planMonthLabel(start, launch.openingIndex + 1),
                note: "The cash to raise before the opening: the Total Pre-operational Budget, the Startup Contingency Fund and the cash for opening inventory."
            };
        }
        return {
            id: category.id,
            label: category.label,
            amount: parts.reduce((sum, part) => sum + part.amount, 0),
            parts,
            when: parts.length === 0 ? "" : span(firstMonth[category.id], lastMonth[category.id]),
            note: ""
        };

    });

}

/**
 * What selling brings in, month by month, as it is received, and what
 * the units sold cost: Sustainability's streams, in the
 * shape cashTimeline adds to its own months. Zero without a page.
 */
function revenueFlows(
    value: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[],
    revenuePage?: FinancialSustainabilityValue
): { inflow: number[]; outflow: number[] } {
    const inflow = new Array<number>(MODEL_MONTHS).fill(0);
    const outflow = new Array<number>(MODEL_MONTHS).fill(0);
    const streams = revenuePage?.streams ?? [];
    if (streams.length > 0) {
        const inputs = breakEvenInputs(value, lines, funding);
        streams.forEach(stream => {
            const variable = streamVariableCost(stream, inputs);
            streamRevenue(stream, value.planStart).received.forEach((amount, index) => { inflow[index] += amount; });
            streamVolumes(stream, value.planStart).forEach((units, index) => { outflow[index] += units * variable; });
        });
    }
    return { inflow, outflow };
}

/** Every funding source the page counts: founders' capital, then the rest. */
export function allFunding(
    value: FinancialFoundationValue,
    legalEntity: LegalEntityValue
): FundingSourceValue[] {
    return [...founderCapitalSources(value, legalEntity), ...value.funding];
}

export function financialPosition(
    value: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    currency: string,
    format: (amount: number) => string,
    /** Sustainability's page: the revenue the operating need is net of. */
    revenuePage?: FinancialSustainabilityValue,
    /** With an Opening Date: the cash to raise before it. */
    launch?: LaunchNeed
): FinancialPosition {

    const start = value.planStart;
    const funding = allFunding(value, legalEntity);

    const allStandings = funding.map(source => ({ source, standing: fundingStanding(source, start) }));

    // Cash only, from here on; in-kind is reported apart.
    const standings = allStandings.filter(entry => !isNonCash(entry.source));
    const nonCash = allStandings
        .filter(entry => isNonCash(entry.source))
        .reduce((sum, entry) => sum + entry.standing.total, 0);

    const needs = fundingNeeds(value, lines, legalEntity, revenuePage, format, launch);
    const need = needs.reduce((sum, entry) => sum + entry.amount, 0);
    // In hand: what has arrived, less what was already spent before the plan.
    const availableNow = standings.reduce((sum, entry) => sum + entry.standing.received, 0) -
        spentBeforePlan(lines, start);
    const confirmedFuture = standings.reduce((sum, entry) => sum + entry.standing.confirmedFuture, 0);
    // Confirmed money that arrives within the plan: only it can meet the need.
    const length = planLength(value);
    const confirmedInPlan = standings.reduce((sum, entry) => sum + (entry.standing.confirmedFuture > 0
        ? entry.standing.future.filter(arrival => arrival.month <= length).reduce((total, arrival) => total + arrival.amount, 0)
        : 0), 0);
    const pending = standings.reduce((sum, entry) => sum + entry.standing.pending, 0);

    const withRevenue = (revenuePage?.streams.length ?? 0) > 0;
    const { timeline } = cashTimeline(value, lines, funding,
        withRevenue ? revenueFlows(value, lines, funding, revenuePage) : undefined);
    const runwayMonths = runwayOf(timeline);

    /*
        THE GAP: the need less the money in hand and the confirmed money
        that arrives within the plan. When in the plan the cash runs
        short is the runway's to say.
    */
    const gap = Math.max(0, need - availableNow - confirmedInPlan);

    const lowestOf = (months: CashMonth[]) => months.reduce(
        (low, month) => month.balance < low.balance ? month : low,
        { balance: 0, label: "", month: 0 } as Pick<CashMonth, "balance" | "label" | "month">);

    /*
        WITH THE FUNDING BEING SOUGHT: the same months, as if every
        pending source arrived as planned, its repayments included. A
        loan sized to the gap can still leave the cash short once it
        has to be repaid.
    */
    const sought = pending > 0.005
        ? (() => {
            const asConfirmed = funding.map(source =>
                statusStanding(source.status || "planned") === "confirmed" ? source : { ...source, status: "approved" as const });
            const withSought = cashTimeline(value, lines, asConfirmed,
                withRevenue ? revenueFlows(value, lines, asConfirmed, revenuePage) : undefined).timeline;
            const low = lowestOf(withSought);
            return { amount: pending, shortfall: Math.max(0, -low.balance), lowestLabel: low.label };
        })()
        : null;

    /* The mix. */
    const mix = (Object.keys(NATURE_LABELS) as FundingNature[]).map(nature => {
        const of = standings.filter(entry =>
            (fundingType(entry.source.type)?.nature ?? "other") === nature);
        return {
            nature,
            label: NATURE_LABELS[nature],
            confirmed: of.reduce((sum, entry) =>
                sum + entry.standing.received + entry.standing.confirmedFuture, 0),
            pending: of.reduce((sum, entry) => sum + entry.standing.pending, 0)
        };
    }).filter(entry => entry.confirmed + entry.pending > 0);

    /* Each need, and the funding linked to it. */
    const coverage = needs.filter(entry => entry.amount > 0.005).map(entry => ({
        id: entry.id,
        name: entry.label,
        need: entry.amount,
        linked: standings
            .filter(item => item.source.needIds.includes(entry.id))
            .reduce((sum, item) => sum + item.standing.received + item.standing.confirmedFuture, 0)
    }));

    /* The loans, and what they will cost. */
    const loans = funding
        .filter(source => fundingType(source.type)?.nature === "debt")
        .map(source => ({ source, schedule: loanSchedule(source, start) }))
        .filter((entry): entry is { source: FundingSourceValue; schedule: LoanSchedule } =>
            entry.schedule !== null);

    /* What is coming in the next six months. */
    const obligations: Obligation[] = [];

    lines.forEach(line => {
        if (!line.counted || line.amount === null) {
            return;
        }
        if (line.frequency === "monthly" || !isScheduled(line)) {
            return;
        }
        costSchedule(line, start).forEach((amount, index) => {
            if (amount > 0 && index < 6) {
                obligations.push({
                    month: index + 1,
                    label: planMonthLabel(start, index + 1),
                    what: line.name + (line.frequency === "one-time"
                        ? ""
                        : " (" + (COST_FREQUENCIES.find(f => f.id === line.frequency)?.label ?? "") + ")"),
                    amount,
                    direction: "out"
                });
            }
        });
    });

    loans.forEach(({ source, schedule }) => {
        const first = schedule.payments[0];
        if (first && first.month <= 6) {
            obligations.push({
                month: first.month,
                label: planMonthLabel(start, first.month),
                what: "Repayments begin: " + (source.name.trim() || "loan"),
                amount: first.payment,
                direction: "out"
            });
        }
    });

    standings.forEach(({ source, standing }) => {
        standing.future.forEach(arrival => {
            if (arrival.month <= 6) {
                obligations.push({
                    month: arrival.month,
                    label: planMonthLabel(start, arrival.month),
                    what: (source.name.trim() || fundingType(source.type)?.label || "Funding") +
                        (standing.pending > 0 ? " (not yet confirmed)" : ""),
                    amount: arrival.amount,
                    direction: "in"
                });
            }
        });
    });

    /*
        SIGNIFICANT events only, as the specification asks: at least a
        tenth of an average month's outgoings (and never under 100),
        and no more than ten -- a £14 domain renewal beside a £7,200
        loom purchase is noise, not an obligation to plan for.
    */
    const averageOut = timeline.reduce((sum, entry) => sum + entry.outflow, 0) / Math.max(1, timeline.length);
    const threshold = Math.max(100, averageOut * 0.1);

    const significant = obligations
        .filter(entry => entry.amount >= threshold)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    obligations.length = 0;
    obligations.push(...significant);

    obligations.sort((a, b) => a.month - b.month || b.amount - a.amount);

    /* What the founder should notice. */
    const signals: Signal[] = [];

    if (need > 0 && gap > 0.005) {
        signals.push({
            tone: "risk",
            title: "Funding Gap",
            text: "Additional financing of " + format(gap) + " is required."
        });
    }

    const lowest = timeline.reduce(
        (worst, month) => month.balance < worst.balance ? month : worst,
        timeline[0]
    );

    if (runwayMonths !== null && need > 0 && gap <= 0.005) {
        const nextIn = timeline.slice(runwayMonths).find(month => month.inflow > 0);
        signals.push({
            tone: "caution",
            title: "Funding Timing",
            text: "Available funds fall below zero in " + timeline[runwayMonths].label +
                (nextIn ? ", before the next scheduled funding in " + nextIn.label : "") +
                ", even though the total identified funding covers the requirement."
        });
    }

    loans.forEach(({ source, schedule }) => {
        const first = schedule.payments[0];
        signals.push({
            tone: "info",
            title: "Loan",
            text: (source.name.trim() || fundingType(source.type)?.label || "Loan") + " repayments begin in " +
                planMonthLabel(start, first.month) + " and create an estimated " +
                (PERIOD_FREQUENCIES.find(f => f.id === source.loan.frequency)?.label ?? "").toLowerCase() +
                " obligation of " + format(schedule.firstPayment) +
                ", with " + format(schedule.totalInterest) + " of interest in total."
        });
    });

    const hasOutflows = timeline.some(month => month.outflow > 0);

    if (!hasOutflows) {
        signals.push({
            tone: "info",
            title: "Runway",
            text: "No scheduled costs are recorded yet, so no runway can be estimated."
        });
    } else if (runwayMonths === null) {
        signals.push({
            tone: "good",
            title: "Runway",
            text: "Based on current available funds, identified costs" + (withRevenue ? " and expected revenue" : "") + ", available funds last beyond the " +
                planLength(value) + "-month plan."
        });
    } else {
        signals.push({
            tone: runwayMonths < 6 ? "risk" : "caution",
            title: "Runway",
            text: "Based on current available funds, identified costs" + (withRevenue ? " and expected revenue" : "") + ", the organisation can operate for approximately " +
                runwayMonths + " month" + (runwayMonths === 1 ? "" : "s") +
                " before available funds are exhausted" +
                (lowest ? " (lowest point " + format(lowest.balance) + " in " + lowest.label + ")" : "") + "."
        });
    }

    // The share of the financing itself, as Sustainability
    // measures it: money received, not what is left of it.
    const planned = standings.reduce((sum, entry) => sum + entry.standing.total, 0);
    if (planned > 0 && pending / planned >= 0.5) {
        signals.push({
            tone: "caution",
            title: "Funding Dependency",
            text: "A significant proportion of planned financing (" +
                Math.round(pending / planned * 100) + "%) depends on funding that has not yet been confirmed."
        });
    }

    const uncounted = {
        currency: lines.filter(line => !line.counted),
        unscheduled: lines.filter(line => line.counted && line.amount !== null && !isScheduled(line)),
        unreadable: lines.filter(line => line.amount === null)
    };

    const duplicates = possibleDuplicates(lines);

    duplicates.forEach(([one, other]) => {
        signals.push({
            tone: "caution",
            title: "Possible Duplicate",
            text: "“" + one.name + "” (" + one.sourceLabel + ") and “" + other.name + "” (" + other.sourceLabel +
                ") may be the same cost counted twice. Remove the price from one of them if so."
        });
    });

    if (nonCash > 0) {
        signals.push({
            tone: "info",
            title: "In-kind Contributions",
            text: "In-kind contributions worth " + format(nonCash) +
                " are recorded but not counted as cash: they cannot pay a bill."
        });
    }

    if (uncounted.currency.length > 0) {
        signals.push({
            tone: "caution",
            title: "Other Currencies",
            text: uncounted.currency.length + " cost" + (uncounted.currency.length === 1 ? " is" : "s are") +
                " priced in a currency other than " + (currency || "the organisation's") +
                " and left out of every total."
        });
    }

    if (sought && gap > 0.005) {
        signals.push(sought.shortfall > 0.005
            ? {
                tone: "risk",
                title: "Funding Being Sought Falls Short",
                text: "With the " + format(sought.amount) + " being sought, cash still falls " + format(sought.shortfall) +
                    " short in " + sought.lowestLabel + ", once its repayments are counted. Seek more, on longer terms, or reduce costs."
            }
            : {
                tone: "good",
                title: "Funding Being Sought Covers the Gap",
                text: "If the " + format(sought.amount) + " being sought arrives as planned, cash stays above zero, its repayments included."
            });
    }

    /* A loan with no repayment schedule is never repaid in the plan. */
    const unscheduledLoans = funding.filter(source =>
        fundingType(source.type)?.nature === "debt" &&
        (source.status === "approved" || source.status === "received" || source.status === "closed") &&
        loanSchedule(source, start) === null);
    if (unscheduledLoans.length > 0) {
        signals.push({
            tone: "caution",
            title: "Loan Repayments Missing",
            text: unscheduledLoans.map(source => source.name.trim() || "A loan").join(", ") +
                ": give the Repayment Start and Number of Payments, or no repayment or interest is counted."
        });
    }

    return {
        currency, need, availableNow, confirmedFuture, pending, gap, sought,
        runwayMonths, hasOutflows, timeline, mix, needs, coverage, obligations, signals, loans, uncounted,
        nonCash, duplicates
    };

}

/**
 * Which of Page 4's four sections are still empty. The fourth is
 * calculated, so it is never "unanswered".
 */
export function financialFoundationSectionsEmpty(value: unknown): boolean[] {
    const foundation = asFinancialFoundationValue(value);
    return [
        // Costs are mostly read from elsewhere; what this page asks
        // is when the plan starts, and how income tax is estimated.
        monthOrdinal(foundation.planStart) === null || incomeTaxMissing(foundation),
        // Calculated from the costs: nothing to answer.
        false,
        // A founder's capital is answered on the Legal Entity; its
        // standing is kept here once the founder has set it.
        foundation.funding.every(source => (parseAmount(source.amount) ?? 0) === 0) &&
            Object.keys(foundation.founderCapital).length === 0,
        false
    ];
}

export const FINANCIAL_FOUNDATION_SECTIONS = [
    "Costs",
    "Funding Need",
    "Capital & Funding",
    "Financial Position"
] as const;
