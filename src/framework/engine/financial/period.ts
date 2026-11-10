/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount, parseDecimal } from "../Amounts.ts";
import { asObject, asText } from "../Readers.ts";
import { type BusinessCapabilityValue, type LegalEntityValue, type StrategyMonthValue, type StrategyRangeValue } from "../AnswerUtils.ts";
import { isCostingStatus } from "../AnswerUtils.ts";
import { asFinancialFoundationValue } from "./stored.ts";

/**
 * How many months the model calculates from the plan's first month:
 * the longest plan there is. Every monthly series is this long; what
 * a page shows and judges is cut to the plan's own length (planLength).
 */
export const MODEL_MONTHS = 60;

/** The plan lengths a founder can choose, in years. */
export const PLAN_YEAR_CHOICES = [1, 2, 3, 4, 5] as const;

/**
 * Three years unless chosen: a lender asks for a first year month by
 * month and a profit and loss forecast for three.
 */
const DEFAULT_PLAN_YEARS = 3;

/** The plan's length in years, as chosen or by default. */
export function planYears(value: { planYears?: string }): number {
    const years = Number(value.planYears);
    return PLAN_YEAR_CHOICES.includes(years as typeof PLAN_YEAR_CHOICES[number]) ? years : DEFAULT_PLAN_YEARS;
}

/** The plan's length in months. */
export function planLength(value: { planYears?: string }): number {
    return planYears(value) * 12;
}

/* ==========================================================
   Small readers
========================================================== */

export function asList(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

export function asTextList(value: unknown): string[] {
    return asList(value).map(asText).filter(entry => entry.length > 0);
}

export function asMonth(value: unknown): StrategyMonthValue {
    const source = asObject(value);
    return { month: asText(source.month), year: asText(source.year) };
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? value as T : fallback;
}

/* How a typed amount is read lives in Amounts.ts, so the Identity
   pages can use it too (this engine imports theirs). */
export { parseAmount, parseDecimal };

/*
    GUARDS for answers saved before the pages limited what could be
    typed: the most payments, periods, items in an order and months
    a figure can be, as the pages limit them.
*/
export const MAX_PERIODS = 600;

export const MAX_ITEMS = 10_000;

export const MAX_MONTHS = 60;

/** An amount below 0 counts as 0; nothing stays nothing. */
export function notNegative(amount: number | null): number | null {
    return amount === null ? null : Math.max(0, amount);
}

/** A percentage as typed ("5", "5%", "4,5") as a number, or null. */
export function parsePercent(text: string): number | null {
    return parseDecimal(text.replace("%", ""));
}

/* ==========================================================
   Months
========================================================== */

/** The plan's first month, as the month picker stores it. */
function currentMonth(today: Date = new Date()): StrategyMonthValue {
    return {
        month: String(today.getMonth() + 1).padStart(2, "0"),
        year: String(today.getFullYear())
    };
}

export function monthOrdinal(month: StrategyMonthValue): number | null {
    const m = Number(month.month);
    const y = Number(month.year);
    return m >= 1 && m <= 12 && y > 0 ? y * 12 + (m - 1) : null;
}

/**
 * The financial plan's first and last month, from its Plan Start and
 * Plan Length -- what the Financial pages' titles show after their
 * name (see titleWithPeriod). Only a Plan Start actually chosen
 * counts: until then both months are empty and the title shows none.
 */
export function financialPlanPeriod(value: unknown): StrategyRangeValue {
    const page = asFinancialFoundationValue(value);
    const first = monthOrdinal(page.planStart);
    if (first === null) {
        return { start: { month: "", year: "" }, end: { month: "", year: "" } };
    }
    const last = first + planLength(page) - 1;
    const month = (ordinal: number): StrategyMonthValue => ({
        month: String(ordinal % 12 + 1).padStart(2, "0"),
        year: String(Math.floor(ordinal / 12))
    });
    return { start: month(first), end: month(last) };
}

/**
 * Which month of the plan a picked month is: 1 for the plan's first
 * month. A month before the plan starts counts as Month 1 -- money
 * that arrived or left before the plan is already in the position
 * it starts from. Null when no month has been picked.
 */
export function planMonth(
    start: StrategyMonthValue,
    month: StrategyMonthValue
): number | null {

    const first = monthOrdinal(start);
    const chosen = monthOrdinal(month);

    if (first === null || chosen === null) {
        return null;
    }

    return Math.max(1, chosen - first + 1);

}

/**
 * The page with a plan start to calculate from: the one chosen, or
 * this month until one is. Stored only when the founder chooses it,
 * so an untouched page is not recorded as answered.
 */
export function withPlanStart<T extends { planStart: StrategyMonthValue }>(
    value: T,
    today: Date = new Date(),
    /** The first month worked out from the Opening Date and the costs (derivedPlanStart): it replaces any chosen before. */
    derived?: StrategyMonthValue
): T {
    if (derived) {
        return monthOrdinal(value.planStart) !== null && value.planStart.year === derived.year && value.planStart.month === derived.month ? value : { ...value, planStart: derived };
    }
    return monthOrdinal(value.planStart) === null
        ? { ...value, planStart: currentMonth(today) }
        : value;
}

/**
 * THE PLAN'S FIRST MONTH, worked out and never typed: the earlier of the month the business opens in and the month of the earliest cost, whichever was recorded first (the owner's rule, 2026-10-24):
 * a Business card's cost or a Legal Entity expense (`legalExpenseDates`). With no date and no cost, the month the plan already has.
 */
export function derivedPlanStart(openingDate: string, costStarts: readonly string[], without: StrategyMonthValue): StrategyMonthValue {
    const days = [openingDate, ...costStarts].filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)).sort();
    return days.length === 0 ? without : { year: days[0].slice(0, 4), month: days[0].slice(5, 7) };
}

/** The dates of the Legal Entity's expenses that cost something: its own date; a one-time expense with none falls on the formation's date. */
export function legalExpenseDates(legalEntity: LegalEntityValue): string[] {
    return legalEntity.expenses
        .filter(expense => parseAmount(expense.cost) !== null)
        .map(expense => expense.date || (expense.frequency === "One time" ? legalEntity.formation.date : ""))
        .filter(day => day !== "");
}

/** The Start dates of the Business cards that cost something: the costed resources and the priced partners and suppliers. */
export function costStartDates(capability: BusinessCapabilityValue): string[] {
    const slots = [...Object.values(capability.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)), ...capability.offering.resources];
    const partners = [...capability.professionals, ...capability.providers, ...capability.offering.professionals, ...capability.offering.providers];
    return [
        ...slots.filter(slot => isCostingStatus(slot.status) && slot.cost.price.trim() !== "").map(slot => slot.startDate),
        ...partners.filter(partner => partner.cost.price.trim() !== "").map(partner => partner.startDate)
    ].filter(day => day !== "");
}

/** The calendar month a plan month falls in, as "Mar 2027". */
export function planMonthLabel(start: StrategyMonthValue, index: number): string {

    const first = monthOrdinal(start);

    if (first === null) {
        return "Month " + index;
    }

    const ordinal = first + index - 1;

    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return names[ordinal % 12] + " " + Math.floor(ordinal / 12);

}

/** Whether a month falls inside the plan (for the month pickers). */
export function withinPlan(
    start: StrategyMonthValue,
    month: number,
    year: number,
    months: number = MODEL_MONTHS
): boolean {
    const first = monthOrdinal(start);
    if (first === null) {
        return true;
    }
    const chosen = year * 12 + (month - 1);
    return chosen >= first && chosen < first + months;
}
