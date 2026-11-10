/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseDecimal } from "../Amounts.ts";
import { type CostFrequency } from "./lists.ts";
import { dayNumber, isProjectPayment, monthsBetween, projectTotal, type CostLine } from "./costs.ts";

/* ==========================================================
   The cost nature (cost model, section 4; automatic rules C1 to C16)
========================================================== */

/**
 * WHAT A COST IS, set by the rules (the user may change it, from the Opening Date on):
 * - "startup": a Startup Expense, a one-time cost before the opening (legal and incorporation fees, a licence, a domain). Written off, never capitalised.
 * - "pre-operating": a Pre-Operating Expense, a time-dependent cost before the opening (rent during works, early salaries). Written off, never capitalised.
 * - "capex": Capital Expenditure: a physical asset at or above the capitalisation limit, a service bundled into it, or an intangible right (a franchise fee).
 * - "opex": an operating expense.
 * - "cogs": a cost of goods sold, or of delivering the offering.
 * - "inventory": opening stock, a separate cash line outside the contingency base; it reaches COGS as it is sold.
 */
export const COST_NATURES = ["startup", "pre-operating", "capex", "opex", "cogs", "inventory"] as const;

export type CostNature = typeof COST_NATURES[number];

export const COST_NATURE_LABELS: Record<CostNature, string> = {
    startup: "Startup Expense",
    "pre-operating": "Pre-Operating Expense",
    capex: "CapEx",
    opex: "OpEx",
    cogs: "COGS",
    inventory: "Opening inventory"
};

/** What the cost nature rules need that is not on a line. */
export interface NatureContext {
    /** The Opening Date (an ISO date); "" while none is given. */
    openingDate: string;
    /** The capitalisation limit; null while none is set (every purchase of a physical asset is then an asset). */
    capitalisationLimit: number | null;
    /** The cost of one unit with its linked services, by the id of the card (assetUnitCost); a line without one uses its own price. */
    assetUnitCosts?: Readonly<Record<string, number>>;
}

/** The groups whose cards the Offering's rule C7 makes COGS whatever their driver. */
const COGS_GROUPS: readonly string[] = ["materials-stock", "delivery-team", "delivery-running-costs", "site-hire"];

const isRecurring = (frequency: CostFrequency) => frequency === "monthly" || frequency === "quarterly" || frequency === "annually";

/**
 * THE NATURE OF A COST FROM THE OPENING DATE, or with no date (steps 2 and 5 of the rules): the first rule that fits.
 *
 * - C2: a service linked to an asset is part of it: CapEx, before or after the opening.
 * - C5: a Percentage billing type, or a % of Rev driver: a calculated COGS line.
 * - C3: a lump sum by its cost option: an upfront franchise fee is an intangible asset (CapEx, amortised); a set-up fee, legal drafting or an initial licence
 *   is a one-time OpEx. The capitalisation limit never applies to an intangible right.
 * - C4: a purchase of a physical asset: CapEx when the cost of one unit, with its linked services, is at or above the limit; else OpEx.
 * - C7: an Offering card with a Per unit or Per project driver, or in Materials, Delivery Team, Delivery Running Costs or Site Hire: COGS.
 * - C6, C8, C15: a recurring fixed cost, and any other company cost: OpEx.
 */
export function natureFromOpening(line: CostLine, context: NatureContext): CostNature {
    if (line.capitalisedInto) {
        return "capex";
    }
    if (line.billing === "percentage" || line.frequency === "usage-based") {
        return "cogs";
    }
    if (line.billing === "lump-sum") {
        return line.costOption === "franchise-fee" ? "capex" : "opex";
    }
    if (line.physicalAsset) {
        const unit = context.assetUnitCosts?.[line.id] ?? line.unitAmount ?? line.amount;
        return context.capitalisationLimit === null || unit === null || unit >= context.capitalisationLimit ? "capex" : "opex";
    }
    if (line.place === "offering" && (line.frequency === "per-unit" || line.frequency === "per-project" || line.frequency === "per-order" || COGS_GROUPS.includes(line.groupId ?? ""))) {
        return "cogs";
    }
    return "opex";
}

/**
 * THE NATURE OF A COST DATED BEFORE THE OPENING DATE (rule C1: it counts in the Total Pre-operational Budget):
 * - C5: a Percentage cost is COGS, never charged to the startup fund.
 * - C14: opening stock (a Materials & Stock card) is a separate cash line: opening inventory.
 * - C2: a service linked to an asset is added to it: CapEx.
 * - C3: a lump sum is an intangible asset (a franchise fee: CapEx) or a Startup Expense.
 * - C4: a physical asset at or above the limit is CapEx; below it, a Startup Expense.
 * - C16: any other pre-launch cost is written off: a one-time cost is a Startup Expense, a time-dependent one a Pre-Operating Expense.
 */
export function natureBeforeOpening(line: CostLine, context: NatureContext): CostNature {
    if (line.billing === "percentage" || line.frequency === "usage-based") {
        return "cogs";
    }
    if (line.groupId === "materials-stock" && line.place === "offering") {
        return "inventory";
    }
    if (line.capitalisedInto) {
        return "capex";
    }
    if (line.billing === "lump-sum") {
        return line.costOption === "franchise-fee" ? "capex" : "startup";
    }
    if (line.physicalAsset) {
        return natureFromOpening(line, context) === "capex" ? "capex" : "startup";
    }
    return isRecurring(line.frequency) ? "pre-operating" : "startup";
}

/** A cost line split by the Opening Date, each part with its nature. */
export interface NatureSplit {
    /** The part dated before the opening: its nature and its amount (null when none is). */
    before: { nature: CostNature; amount: number } | null;
    /** The nature from the opening on (null for a one-time cost wholly before it). */
    after: CostNature | null;
}

/**
 * THE COST NATURE OF A LINE, with its split around the Opening Date (rules C1 to C16, C13). A card that starts before the opening and runs past it has
 * both parts; a one-time cost dated before it has only the first; with no Opening Date or no Start date it has only the second. The user's own choice
 * (C13) replaces the nature from the opening on, and never moves a month out of the Pre-operational Budget.
 * A line that is not counted (a different currency, an incomplete card) has no nature.
 */
export function natureSplitOf(line: CostLine, context: NatureContext, chosen: CostNature | "" = ""): NatureSplit {
    if (!line.counted) {
        return { before: null, after: null };
    }
    const split = splitAtOpening(line, context.openingDate);
    // A Percentage cost is COGS whatever its date: wholly the rule's, there is no split.
    if (line.billing === "percentage" || line.frequency === "usage-based") {
        return { before: null, after: chosen || "cogs" };
    }
    const before = split.startsBefore && split.before > 0 ? { nature: natureBeforeOpening(line, context), amount: split.before } : null;
    // Paid in full on the Start date, or ended before the opening: wholly before it.
    if (before !== null && (line.frequency === "one-time" || line.frequency === "per-project" || !split.runsPast)) {
        return { before, after: null };
    }
    return { before, after: chosen || natureFromOpening(line, context) };
}

/** What the Total Pre-operational Budget holds (rule F1), by nature; opening inventory is outside the contingency base. */
export interface PreOperationalSchedule {
    capex: number;
    startup: number;
    preOperating: number;
    /** CapEx + Startup Expenses + Pre-Operating Expenses: the base of the Startup Contingency. */
    total: number;
    /** The cash for opening stock, added after the contingency calculation. */
    openingInventory: number;
    /** Percentage costs are COGS and never charged to the fund: left out. */
}

export function preOperationalSchedule(lines: readonly CostLine[], context: NatureContext, chosen: Readonly<Record<string, CostNature | undefined>> = {}): PreOperationalSchedule {
    const totals = { capex: 0, startup: 0, preOperating: 0, openingInventory: 0 };
    lines.forEach(line => {
        const part = natureSplitOf(line, context, chosen[line.id] ?? "").before;
        if (!part) {
            return;
        }
        switch (part.nature) {
            case "capex": totals.capex += part.amount; break;
            case "startup": totals.startup += part.amount; break;
            case "pre-operating": totals.preOperating += part.amount; break;
            case "inventory": totals.openingInventory += part.amount; break;
            default: break;
        }
    });
    const round = (value: number) => Math.round(value * 100) / 100;
    return {
        capex: round(totals.capex),
        startup: round(totals.startup),
        preOperating: round(totals.preOperating),
        total: round(totals.capex + totals.startup + totals.preOperating),
        openingInventory: round(totals.openingInventory)
    };
}

/**
 * A CARD SPLIT AT THE OPENING DATE (rule C1): the part of its cost dated before the Opening Date, which counts in the Total Pre-operational Budget,
 * and the part from the Opening Date, which follows the other rules. A card that runs past the opening splits by date: rent of 1,500 a month from
 * 3 months before the opening is 4,500 before and 1,500 a month after.
 *
 * - A one-time cost (and a Per project one, paid in full on its Start date) is wholly before the opening when its Start date is before it.
 * - A monthly, quarterly or annual cost counts the months from its Start date to the opening, or to its End date if that comes first.
 * - With no Opening Date, or no Start date, nothing is before the opening.
 * The cost is the line's amount for the period it is counted (a monthly equivalent for a quarterly or annual one).
 */
export function splitAtOpening(line: CostLine, openingDate: string): { before: number; startsBefore: boolean; runsPast: boolean } {
    const none = { before: 0, startsBefore: false, runsPast: false };
    const start = line.startDate ?? "";
    const startDay = dayNumber(start);
    const openingDay = dayNumber(openingDate);
    if (!line.counted || line.amount === null || startDay === null || openingDay === null || startDay >= openingDay) {
        return none;
    }
    const end = line.endDate ?? "";
    const endDay = dayNumber(end);
    const endsBefore = endDay !== null && endDay < openingDay;
    const runsPast = line.frequency !== "one-time" && line.frequency !== "per-project" && !endsBefore;
    // (Opening stock, a Materials & Stock card dated before the opening, is bought whole on its Start date, whatever its driver.)
    const stock = line.place === "offering" && line.groupId === "materials-stock" && line.frequency === "per-unit";
    if (line.frequency === "one-time" || line.frequency === "per-project" || stock) {
        if (isProjectPayment(line)) {
            return { before: projectTotal(line), startsBefore: true, runsPast: false };
        }
        return { before: stock ? Math.round(line.amount * Math.max(1, parseDecimal(line.cardQuantity ?? "") ?? 1) * 100) / 100 : line.amount, startsBefore: true, runsPast: false };
    }
    if (line.frequency === "monthly" || line.frequency === "quarterly" || line.frequency === "annually") {
        const lastMonthEnd = endsBefore ? end : openingDate;
        // (A month counts when any of it falls before the opening: from the Start date's month up to the month the opening or the End date falls in.)
        const months = Math.max(1, monthsBetween(start, lastMonthEnd) + (endsBefore ? 1 : 0));
        const perMonth = monthlyEquivalent(line.amount, line.frequency);
        return { before: Math.round(perMonth * months * 100) / 100, startsBefore: true, runsPast };
    }
    // (Per unit, per order and % of Rev follow the sales, not the calendar: the forecast places them.)
    return { before: 0, startsBefore: true, runsPast };
}

export function monthlyEquivalent(amount: number, frequency: CostFrequency): number {
    switch (frequency) {
        case "monthly": return amount;
        case "quarterly": return amount / 3;
        case "annually": return amount / 12;
        default: return 0;
    }
}
